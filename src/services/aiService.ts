import { supabase } from '@/integrations/supabase/client';
import type { ConfigIA, APIKeyTemporal, APIKeySaved, ProveedorIA } from '@/types/apiKeys';
import type { LogInput } from '@/types/aiLogs';

const SESSION_STORAGE_KEY = 'temp_api_key';

const SYSTEM_PROMPT =
  'Eres un experto en redacción de CVs profesionales. Reglas: ' +
  '1) Mantén el idioma original del texto. ' +
  '2) No inventes información que no esté en el texto original. ' +
  '3) Hazlo más profesional, conciso y orientado a resultados. ' +
  '4) Usa verbos de acción cuando sea apropiado. ' +
  '5) Responde SOLO con el texto mejorado, sin explicaciones ni comentarios adicionales.';

const CONTEXTO_PROMPTS: Record<string, string> = {
  resumen: 'Mejora este resumen profesional para un CV:',
  experiencia: 'Mejora esta descripción de experiencia laboral para un CV.',
  educacion: 'Mejora esta descripción de formación académica para un CV.',
};

/**
 * Función auxiliar para retry con exponential backoff
 * Retorna el resultado y el número de intentos realizados
 */
async function retryConBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<{ resultado: T; intentos: number }> {
  let lastError: Error | null = null;

  for (let intento = 0; intento < maxRetries; intento++) {
    try {
      const resultado = await fn();
      return { resultado, intentos: intento + 1 };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // No reintentar en estos casos:
      if (
        lastError.message.includes('inválida') ||
        lastError.message.includes('no válido') ||
        lastError.message.includes('sin créditos') ||
        lastError.message.includes('sin permisos')
      ) {
        throw lastError;
      }

      // Si es rate limit o error de servidor, reintentar
      const esRateLimitOServidor =
        lastError.message.includes('Demasiadas solicitudes') ||
        lastError.message.includes('Error del servidor');

      if (esRateLimitOServidor && intento < maxRetries - 1) {
        const delay = delayMs * Math.pow(2, intento);
        console.log(`[aiService] ⏳ Reintentando en ${delay}ms (intento ${intento + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      // Si no es rate limit/servidor o ya no quedan reintentos, lanzar error
      if (intento === maxRetries - 1) {
        throw lastError;
      }
    }
  }

  throw lastError || new Error('Error desconocido en retry');
}

/**
 * Obtiene la API key temporal de sessionStorage
 */
function obtenerKeyTemporal(): APIKeyTemporal | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;

    const data: APIKeyTemporal = JSON.parse(stored);
    return data;
  } catch (error) {
    console.warn('[aiService] Error al leer key temporal de sessionStorage:', error);
    return null;
  }
}

/**
 * Guarda una API key temporal en sessionStorage
 */
export function guardarKeyTemporal(proveedor: ProveedorIA, clave: string, modelo: string): void {
  try {
    const data: APIKeyTemporal = { proveedor, clave, modelo };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    console.log('[aiService] ✅ Key temporal guardada en sessionStorage');
  } catch (error) {
    console.error('[aiService] Error al guardar key temporal:', error);
    throw new Error('No se pudo guardar la key temporal');
  }
}

/**
 * Elimina la API key temporal de sessionStorage
 */
export function eliminarKeyTemporal(): void {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
  console.log('[aiService] 🗑️ Key temporal eliminada');
}

/**
 * Obtiene la API key activa guardada en Supabase del usuario actual
 */
async function obtenerKeyGuardadaActiva(): Promise<APIKeySaved | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[aiService] Usuario no autenticado');
      return null;
    }

    // @ts-ignore - tabla api_keys no está en tipos generados aún
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', user.id)
      .eq('activa', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No hay key activa, no es un error
        return null;
      }
      console.warn('[aiService] Error al obtener key guardada activa:', error.message);
      return null;
    }
    return data as APIKeySaved;
  } catch (error) {
    console.warn('[aiService] Error inesperado al obtener key guardada:', error);
    return null;
  }
}

/**
 * Obtiene la configuración de IA actual
 * Prioridad: 1) Temporal (sessionStorage), 2) Guardada activa (Supabase)
 */
export async function obtenerConfigIA(): Promise<ConfigIA | null> {
  // 1. Intentar obtener key temporal
  const keyTemporal = obtenerKeyTemporal();

  if (keyTemporal) {
    console.log('[aiService] 🔑 Usando key temporal:', {
      proveedor: keyTemporal.proveedor,
      modelo: keyTemporal.modelo,
    });

    return {
      provider: keyTemporal.proveedor,
      apiKey: keyTemporal.clave,
      modelo: keyTemporal.modelo,
      source: 'temporal',
      keyId: null,
      keyNombre: 'Temporal',
    };
  }

  // 2. Si no hay temporal, intentar obtener key guardada activa
  const keyGuardada = await obtenerKeyGuardadaActiva();

  if (keyGuardada) {
    console.log('[aiService] 💾 Usando key guardada:', {
      nombre: keyGuardada.nombre,
      proveedor: keyGuardada.proveedor,
      modelo: keyGuardada.modelo,
    });

    return {
      provider: keyGuardada.proveedor,
      apiKey: keyGuardada.clave,
      modelo: keyGuardada.modelo,
      source: 'saved',
      keyId: keyGuardada.id,
      keyNombre: keyGuardada.nombre,
    };
  }

  // No hay ninguna key disponible
  return null;
}

/**
 * Verifica si hay una configuración de IA disponible
 */
export async function iaDisponible(): Promise<boolean> {
  const config = await obtenerConfigIA();
  return config !== null;
}

/**
 * Guarda un log de petición a IA en Supabase
 */
async function guardarLog(input: LogInput): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('[aiService] No se puede guardar log: usuario no autenticado');
      return;
    }

    // @ts-ignore - tabla ai_request_logs no está en tipos generados aún
    const { error } = await supabase.from('ai_request_logs').insert({
      user_id: user.id,
      api_key_id: input.api_key_id,
      api_key_nombre: input.api_key_nombre,
      proveedor: input.proveedor,
      modelo: input.modelo,
      contexto: input.contexto,
      info_adicional: input.info_adicional || null,
      prompt: input.prompt,
      respuesta: input.respuesta,
      tiempo_respuesta_ms: input.tiempo_respuesta_ms,
      intentos: input.intentos,
      error_mensaje: input.error_mensaje || null,
    });

    if (error) {
      console.error('[aiService] Error al guardar log:', error);
    } else {
      console.log('[aiService] 📝 Log guardado exitosamente');
    }
  } catch (error) {
    console.error('[aiService] Error inesperado al guardar log:', error);
  }
}

/**
 * Mejora un texto usando IA con retry automático
 */
export async function mejorarTextoConIA(
  texto: string,
  contexto: 'resumen' | 'experiencia' | 'educacion',
  infoAdicional?: string
): Promise<string> {
  const startTime = Date.now();
  const config = await obtenerConfigIA();

  if (!config) {
    throw new Error(
      'No hay configuración de IA disponible. Configura una API key en la página de setup.'
    );
  }

  let userPrompt = CONTEXTO_PROMPTS[contexto] || 'Mejora este texto:';

  if (infoAdicional) {
    userPrompt += ` Contexto: ${infoAdicional}.`;
  }

  userPrompt += `\n\n${texto}`;

  console.log('[aiService] 📝 Mejorando texto:', {
    contexto,
    proveedor: config.provider,
    modelo: config.modelo,
    source: config.source,
    keyNombre: config.keyNombre,
  });

  let respuesta = '';
  let intentos = 1;
  let errorMensaje: string | undefined;

  try {
    const { resultado, intentos: numIntentos } = await retryConBackoff(async () => {
      if (config.provider === 'openai') {
        return llamarOpenAI(config.apiKey, config.modelo, userPrompt);
      } else {
        return llamarGemini(config.apiKey, config.modelo, userPrompt);
      }
    });

    respuesta = resultado;
    intentos = numIntentos;

    // Guardar log exitoso
    const tiempoRespuesta = Date.now() - startTime;
    await guardarLog({
      api_key_id: config.keyId,
      api_key_nombre: config.keyNombre,
      proveedor: config.provider,
      modelo: config.modelo,
      contexto,
      info_adicional: infoAdicional,
      prompt: texto,
      respuesta,
      tiempo_respuesta_ms: tiempoRespuesta,
      intentos,
    });

    return respuesta;
  } catch (error) {
    // Capturar error y guardar log
    errorMensaje = error instanceof Error ? error.message : 'Error desconocido';
    const tiempoRespuesta = Date.now() - startTime;

    await guardarLog({
      api_key_id: config.keyId,
      api_key_nombre: config.keyNombre,
      proveedor: config.provider,
      modelo: config.modelo,
      contexto,
      info_adicional: infoAdicional,
      prompt: texto,
      respuesta: '', // Sin respuesta porque hubo error
      tiempo_respuesta_ms: tiempoRespuesta,
      intentos,
      error_mensaje: errorMensaje,
    });

    // Re-lanzar el error al usuario
    throw error;
  }
}

async function llamarOpenAI(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
  const maskedKey = apiKey.slice(-4).padStart(apiKey.length, '•');
  console.log('[aiService] 🚀 Llamando a OpenAI:', {
    modelo,
    key: maskedKey,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[aiService] ❌ Error de OpenAI:', errorData);
    handleApiError(response.status, errorData);
  }

  const data = await response.json();
  const resultado = data.choices?.[0]?.message?.content?.trim();

  if (!resultado) {
    throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
  }

  console.log('[aiService] ✅ Respuesta de OpenAI recibida:', {
    length: resultado.length,
  });

  return resultado;
}

async function llamarGemini(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
  const maskedKey = apiKey.slice(-4).padStart(apiKey.length, '•');
  console.log('[aiService] 🚀 Llamando a Gemini:', {
    modelo,
    key: maskedKey,
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('[aiService] ❌ Error de Gemini:', errorData);
    handleApiError(response.status, errorData);
  }

  const data = await response.json();
  const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!resultado) {
    throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
  }

  console.log('[aiService] ✅ Respuesta de Gemini recibida:', {
    length: resultado.length,
  });

  return resultado;
}

function handleApiError(status: number, errorData?: any): never {
  if (status === 401 || status === 403) {
    throw new Error('API key inválida. Verifica tu configuración.');
  }
  if (status === 429) {
    throw new Error('Demasiadas solicitudes. Intenta de nuevo en un momento.');
  }

  // Manejo específico de errores de cuota/créditos
  const errorMessage = errorData?.error?.message || '';
  if (errorMessage.includes('insufficient_quota') || errorMessage.includes('quota')) {
    throw new Error('Tu API key se quedó sin créditos. Recarga tu cuenta o usa otra key.');
  }

  throw new Error(`Error del servicio de IA (${status}). Intenta de nuevo.`);
}

/**
 * Prueba una API key haciendo una llamada simple a la API
 */
export async function probarAPIKey(
  proveedor: ProveedorIA,
  apiKey: string,
  modelo: string
): Promise<{ exito: boolean; mensaje: string }> {
  const textoSimple = 'Hola';

  try {
    console.log('[aiService] 🧪 Probando API key:', { proveedor, modelo });

    let resultado: string;

    if (proveedor === 'openai') {
      resultado = await llamarOpenAI(apiKey, modelo, textoSimple);
    } else {
      resultado = await llamarGemini(apiKey, modelo, textoSimple);
    }

    if (resultado && resultado.length > 0) {
      console.log('[aiService] ✅ Prueba exitosa');
      return {
        exito: true,
        mensaje: 'La API key funciona correctamente.',
      };
    }

    return {
      exito: false,
      mensaje: 'La API respondió pero no generó contenido.',
    };
  } catch (error) {
    console.error('[aiService] ❌ Error en prueba:', error);

    return {
      exito: false,
      mensaje: error instanceof Error ? error.message : 'Error al probar la API key.',
    };
  }
}
