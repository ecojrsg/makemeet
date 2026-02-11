// Tipos para la gestión de API Keys de IA

export type ProveedorIA = 'openai' | 'gemini';

export interface ModeloIA {
  value: string;
  label: string;
}

export const MODELOS_DISPONIBLES: Record<ProveedorIA, ModeloIA[]> = {
  openai: [
    { value: 'gpt-5.2', label: 'GPT-5.2 (Recomendado)' },
    { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { value: 'gpt-5-nano', label: 'GPT-5 Nano' },
    { value: 'gpt-4.1', label: 'GPT-4.1' },
    { value: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
    { value: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Económico)' },
  ],
  gemini: [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  ],
};

// API Key guardada en Supabase (persistente)
export interface APIKeySaved {
  id: string; // UUID de Supabase
  user_id: string;
  nombre: string;
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
  activa: boolean;
  created_at: string;
  updated_at: string;
}

// API Key temporal (sessionStorage, se borra al cerrar el navegador)
export interface APIKeyTemporal {
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
}

// Datos del formulario para crear/editar API Key
export interface APIKeyFormData {
  nombre: string;
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
  guardar: boolean; // true = guardar en Supabase, false = solo temporal
}

// Configuración de IA actual (para usar en aiService)
export interface ConfigIA {
  provider: ProveedorIA;
  apiKey: string;
  modelo: string;
  source: 'temporal' | 'saved'; // de dónde viene la configuración
  
  // Información adicional para logging
  keyId: string | null; // ID de la key guardada (NULL si es temporal)
  keyNombre: string; // "Temporal" o nombre de la key guardada
}
