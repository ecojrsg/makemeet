import { supabase } from '@/integrations/supabase/client';

export interface ConfigIA {
  provider: 'openai' | 'gemini';
  apiKey: string;
}

const STORAGE_KEYS = {
  provider: 'ia_provider',
  apiKey: 'ia_api_key',
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
 * Obtiene la configuración de IA.
 * Prioridad: localStorage > tabla configuracion de Supabase
 */
export async function obtenerConfigIA(): Promise<ConfigIA | null> {
  // 1. Verificar localStorage
  const localProvider = localStorage.getItem(STORAGE_KEYS.provider);
  const localApiKey = localStorage.getItem(STORAGE_KEYS.apiKey);

  if (localProvider && localApiKey) {
    return {
      provider: localProvider as 'openai' | 'gemini',
      apiKey: localApiKey,
    };
  }

  // 2. Verificar Supabase
  try {
    const { data, error } = await supabase
      .from('configuracion')
      .select('clave, valor')
      .in('clave', ['ai_provider', 'openai_api_key', 'gemini_api_key']);

    if (error) {
      console.warn('[aiService] Error al leer configuracion de Supabase:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.warn('[aiService] No se encontraron claves de IA en la tabla configuracion');
      return null;
    }

    const config: Record<string, string> = {};
    for (const row of data) {
      config[row.clave] = row.valor;
    }

    // Si hay provider explícito, usarlo
    let provider = config.ai_provider as 'openai' | 'gemini' | undefined;
    let apiKey: string | undefined;

    if (provider) {
      apiKey = provider === 'openai' ? config.openai_api_key : config.gemini_api_key;
    } else {
      // Auto-detectar provider por la key disponible
      if (config.openai_api_key) {
        provider = 'openai';
        apiKey = config.openai_api_key;
      } else if (config.gemini_api_key) {
        provider = 'gemini';
        apiKey = config.gemini_api_key;
      }
    }

    if (provider && apiKey) {
      return { provider, apiKey };
    }

    console.warn('[aiService] Configuracion incompleta en Supabase. Claves encontradas:', Object.keys(config));
  } catch (e) {
    console.warn('[aiService] Error inesperado al leer configuracion:', e);
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
 * Guarda la configuración de IA en Supabase y localStorage
 */
export async function guardarConfigIA(
  provider: 'openai' | 'gemini',
  apiKey: string
): Promise<void> {
  // Guardar en localStorage
  localStorage.setItem(STORAGE_KEYS.provider, provider);
  localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);

  // Guardar en Supabase (upsert)
  try {
    const entries = [
      { clave: 'ai_provider', valor: provider },
      {
        clave: provider === 'openai' ? 'openai_api_key' : 'gemini_api_key',
        valor: apiKey,
      },
    ];

    for (const entry of entries) {
      // Intentar actualizar primero
      const { data } = await supabase
        .from('configuracion')
        .select('id')
        .eq('clave', entry.clave)
        .limit(1);

      if (data && data.length > 0) {
        await supabase
          .from('configuracion')
          .update({ valor: entry.valor })
          .eq('clave', entry.clave);
      } else {
        await supabase.from('configuracion').insert(entry);
      }
    }
  } catch {
    // Si falla Supabase, al menos quedó en localStorage
  }
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
    return llamarOpenAI(config.apiKey, userPrompt);
  } else {
    return llamarGemini(config.apiKey, userPrompt);
  }
}

async function llamarOpenAI(apiKey: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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

async function llamarGemini(apiKey: string, userPrompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
