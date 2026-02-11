import { supabase } from '@/integrations/supabase/client';
import type {
  ConfigIA,
  APIKeyPersonal,
  APIKeyGlobal,
  LocalStoragePersonalKeys,
  LocalStorageActiveKey,
} from '@/types/apiKeys';

const STORAGE_KEYS = {
  personalKeys: 'ai_personal_keys',
  activeKey: 'ai_active_key',
};

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
 */
async function retryConBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let intento = 0; intento < maxRetries; intento++) {
    try {
      return await fn();
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
 * Obtiene las API keys personales desde localStorage
 */
function obtenerKeysPersonales(): APIKeyPersonal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.personalKeys);
    if (!stored) return [];
    
    const data: LocalStoragePersonalKeys = JSON.parse(stored);
    return data.keys || [];
  } catch (error) {
    console.warn('[aiService] Error al leer keys personales de localStorage:', error);
    return [];
  }
}

/**
 * Obtiene las API keys globales desde Supabase
 */
async function obtenerKeysGlobales(): Promise<APIKeyGlobal[]> {
  try {
    // @ts-ignore - tabla api_keys no está en tipos generados aún
    const { data, error } = await supabase.from('api_keys').select('*').order('created_at', { ascending: false });

    if (error) {
      console.warn('[aiService] Error al leer keys globales de Supabase:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      proveedor: row.proveedor as 'openai' | 'gemini',
      clave: row.clave,
      modelo: row.modelo,
      tipo: 'global',
      created_by: row.created_by,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.warn('[aiService] Error inesperado al leer keys globales:', error);
    return [];
  }
}

/**
 * Obtiene la key activa seleccionada por el usuario
 */
function obtenerKeyActiva(): LocalStorageActiveKey | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.activeKey);
    if (!stored) return null;
    
    return JSON.parse(stored);
  } catch (error) {
    console.warn('[aiService] Error al leer key activa de localStorage:', error);
    return null;
  }
}

/**
 * Obtiene la configuración de IA actual (key activa con sus datos)
 * Prioridad: key activa seleccionada > primera key disponible
 */
export async function obtenerConfigIA(): Promise<ConfigIA | null> {
  const keyActiva = obtenerKeyActiva();
  const keysPersonales = obtenerKeysPersonales();
  const keysGlobales = await obtenerKeysGlobales();

  // Si hay una key activa seleccionada, buscarla
  if (keyActiva) {
    if (keyActiva.tipo === 'personal') {
      const key = keysPersonales.find((k) => k.id === keyActiva.keyId);
      if (key) {
        return {
          provider: key.proveedor,
          apiKey: key.clave,
          modelo: key.modelo,
        };
      }
    } else if (keyActiva.tipo === 'global') {
      const key = keysGlobales.find((k) => k.id === keyActiva.keyId);
      if (key) {
        return {
          provider: key.proveedor,
          apiKey: key.clave,
          modelo: key.modelo,
        };
      }
    }
  }

  // Si no hay key activa o no se encontró, usar la primera disponible
  // Prioridad: personal > global
  if (keysPersonales.length > 0) {
    const key = keysPersonales[0];
    return {
      provider: key.proveedor,
      apiKey: key.clave,
      modelo: key.modelo,
    };
  }

  if (keysGlobales.length > 0) {
    const key = keysGlobales[0];
    return {
      provider: key.proveedor,
      apiKey: key.clave,
      modelo: key.modelo,
    };
  }

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
 * Mejora un texto usando IA con retry automático
 */
export async function mejorarTextoConIA(
  texto: string,
  contexto: 'resumen' | 'experiencia' | 'educacion',
  infoAdicional?: string
): Promise<string> {
  const config = await obtenerConfigIA();

  if (!config) {
    throw new Error(
      'No hay configuración de IA. Configura una API key en la página de setup.'
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
  });

  return retryConBackoff(async () => {
    if (config.provider === 'openai') {
      return llamarOpenAI(config.apiKey, config.modelo, userPrompt);
    } else {
      return llamarGemini(config.apiKey, config.modelo, userPrompt);
    }
  });
}

async function llamarOpenAI(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
  const maskedKey = apiKey.slice(-4).padStart(apiKey.length, '•');
  console.log('[aiService] 🚀 Llamando a OpenAI:', {
    modelo,
    promptLength: userPrompt.length,
    apiKey: maskedKey,
  });

  const requestBody = {
    model: modelo,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userPrompt },
    ],
    max_tokens: 500,
    temperature: 0.7,
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorDetails = null;
      try {
        errorDetails = await response.json();
        console.error('[aiService] ❌ Error de OpenAI:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
        });
      } catch (e) {
        console.error('[aiService] ❌ Error de OpenAI (sin detalles):', {
          status: response.status,
          statusText: response.statusText,
        });
      }
      handleApiError('openai', response.status, errorDetails);
    }

    const data = await response.json();
    const resultado = data.choices?.[0]?.message?.content?.trim();

    if (!resultado) {
      console.error('[aiService] ❌ OpenAI no generó respuesta:', data);
      throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
    }

    console.log('[aiService] ✅ Respuesta de OpenAI recibida:', {
      length: resultado.length,
      usage: data.usage,
    });

    return resultado;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      console.error('[aiService] ❌ Error de red al llamar a OpenAI:', error);
      throw new Error('Error de conexión con OpenAI. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

async function llamarGemini(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
  const maskedKey = apiKey.slice(-4).padStart(apiKey.length, '•');
  console.log('[aiService] 🚀 Llamando a Gemini:', {
    modelo,
    promptLength: userPrompt.length,
    apiKey: maskedKey,
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: userPrompt }] }],
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    generationConfig: {
      maxOutputTokens: 500,
      temperature: 0.7,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorDetails = null;
      try {
        errorDetails = await response.json();
        console.error('[aiService] ❌ Error de Gemini:', {
          status: response.status,
          statusText: response.statusText,
          error: errorDetails,
        });
      } catch (e) {
        console.error('[aiService] ❌ Error de Gemini (sin detalles):', {
          status: response.status,
          statusText: response.statusText,
        });
      }
      handleApiError('gemini', response.status, errorDetails);
    }

    const data = await response.json();
    const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resultado) {
      console.error('[aiService] ❌ Gemini no generó respuesta:', data);
      throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
    }

    console.log('[aiService] ✅ Respuesta de Gemini recibida:', {
      length: resultado.length,
      candidates: data.candidates?.length,
    });

    return resultado;
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch')) {
      console.error('[aiService] ❌ Error de red al llamar a Gemini:', error);
      throw new Error('Error de conexión con Gemini. Verifica tu conexión a internet.');
    }
    throw error;
  }
}

function handleApiError(provider: 'openai' | 'gemini', status: number, errorDetails?: any): never {
  // Errores de autenticación
  if (status === 401 || status === 403) {
    const detail = errorDetails?.error?.message || '';
    if (detail.includes('quota') || detail.includes('billing')) {
      throw new Error(`API key sin créditos o cuenta suspendida (${provider}). Verifica tu cuenta.`);
    }
    throw new Error(`API key inválida para ${provider}. Verifica tu configuración.`);
  }

  // Rate limiting
  if (status === 429) {
    throw new Error(`Demasiadas solicitudes a ${provider}. Espera un momento e intenta de nuevo.`);
  }

  // Bad request - usualmente modelo inválido
  if (status === 400) {
    const detail = errorDetails?.error?.message || '';
    if (detail.toLowerCase().includes('model')) {
      throw new Error(`El modelo especificado no es válido o no está disponible en ${provider}. Actualiza tu configuración.`);
    }
    throw new Error(`Petición inválida a ${provider}. Error: ${detail || 'Desconocido'}`);
  }

  // Not found - endpoint o recurso no existe
  if (status === 404) {
    throw new Error(`Endpoint o modelo no encontrado en ${provider}. Verifica el nombre del modelo.`);
  }

  // Errores del servidor
  if (status >= 500) {
    throw new Error(`Error del servidor de ${provider} (${status}). Intenta de nuevo más tarde.`);
  }

  // Error genérico
  throw new Error(`Error del servicio de ${provider} (${status}). Intenta de nuevo.`);
}

/**
 * Valida una API key realizando una petición de prueba ligera
 */
export async function validarAPIKey(
  proveedor: 'openai' | 'gemini',
  apiKey: string,
  modelo: string
): Promise<{ valida: boolean; error?: string }> {
  console.log('[aiService] 🔍 Validando API key:', { proveedor, modelo });

  try {
    if (proveedor === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelo,
          messages: [{ role: 'user', content: 'Test' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        console.log('[aiService] ✅ API key de OpenAI válida');
        return { valida: true };
      }

      const errorData = await response.json().catch(() => null);
      console.error('[aiService] ❌ API key de OpenAI inválida:', errorData);

      if (response.status === 401 || response.status === 403) {
        return { valida: false, error: 'API key inválida o sin permisos' };
      }
      if (response.status === 400) {
        const msg = errorData?.error?.message || '';
        if (msg.toLowerCase().includes('model')) {
          return { valida: false, error: `Modelo "${modelo}" no válido o no disponible` };
        }
        return { valida: false, error: 'Configuración inválida' };
      }
      if (response.status === 429) {
        return { valida: false, error: 'Límite de peticiones alcanzado' };
      }

      return { valida: false, error: `Error ${response.status}` };
    } else {
      // Gemini
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });

      if (response.ok) {
        console.log('[aiService] ✅ API key de Gemini válida');
        return { valida: true };
      }

      const errorData = await response.json().catch(() => null);
      console.error('[aiService] ❌ API key de Gemini inválida:', errorData);

      if (response.status === 400) {
        const msg = errorData?.error?.message || '';
        if (msg.toLowerCase().includes('api key')) {
          return { valida: false, error: 'API key inválida' };
        }
        if (msg.toLowerCase().includes('model')) {
          return { valida: false, error: `Modelo "${modelo}" no válido` };
        }
        return { valida: false, error: 'Configuración inválida' };
      }
      if (response.status === 403) {
        return { valida: false, error: 'API key sin permisos' };
      }
      if (response.status === 404) {
        return { valida: false, error: `Modelo "${modelo}" no encontrado` };
      }
      if (response.status === 429) {
        return { valida: false, error: 'Límite de peticiones alcanzado' };
      }

      return { valida: false, error: `Error ${response.status}` };
    }
  } catch (error) {
    console.error('[aiService] ❌ Error al validar API key:', error);
    if (error instanceof Error && error.message.includes('fetch')) {
      return { valida: false, error: 'Error de conexión. Verifica tu internet.' };
    }
    return { valida: false, error: 'Error desconocido al validar' };
  }
}

