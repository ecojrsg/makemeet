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
 * Mejora un texto usando IA
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

  if (config.provider === 'openai') {
    return llamarOpenAI(config.apiKey, config.modelo, userPrompt);
  } else {
    return llamarGemini(config.apiKey, config.modelo, userPrompt);
  }
}

async function llamarOpenAI(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
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
    handleApiError(response.status);
  }

  const data = await response.json();
  const resultado = data.choices?.[0]?.message?.content?.trim();

  if (!resultado) {
    throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
  }

  return resultado;
}

async function llamarGemini(apiKey: string, modelo: string, userPrompt: string): Promise<string> {
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
    handleApiError(response.status);
  }

  const data = await response.json();
  const resultado = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!resultado) {
    throw new Error('La IA no generó una respuesta. Intenta de nuevo.');
  }

  return resultado;
}

function handleApiError(status: number): never {
  if (status === 401 || status === 403) {
    throw new Error('API key inválida. Verifica tu configuración.');
  }
  if (status === 429) {
    throw new Error('Demasiadas solicitudes. Intenta de nuevo en un momento.');
  }
  throw new Error(`Error del servicio de IA (${status}). Intenta de nuevo.`);
}
