// Tipos para la gestión de API Keys de IA

export type ProveedorIA = 'openai' | 'gemini';

export type TipoAPIKey = 'personal' | 'global';

export interface ModeloIA {
  value: string;
  label: string;
}

export const MODELOS_DISPONIBLES: Record<ProveedorIA, ModeloIA[]> = {
  openai: [
    { value: 'gpt-5', label: 'GPT-5' },
    { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
    { value: 'gpt-4-nano', label: 'GPT-4 Nano' },
  ],
  gemini: [
    { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro Preview' },
    { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  ],
};

// API Key personal (localStorage)
export interface APIKeyPersonal {
  id: string; // formato: local_{proveedor}_{timestamp}
  nombre: string;
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
  tipo: 'personal';
  createdAt: string;
}

// API Key global (Supabase)
export interface APIKeyGlobal {
  id: string; // UUID de Supabase
  nombre: string;
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
  tipo: 'global';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Union type para cualquier API Key
export type APIKey = APIKeyPersonal | APIKeyGlobal;

// Estructura de localStorage para keys personales
export interface LocalStoragePersonalKeys {
  keys: APIKeyPersonal[];
}

// Estructura de localStorage para key activa
export interface LocalStorageActiveKey {
  keyId: string; // ID de la key (puede ser local o UUID global)
  tipo: TipoAPIKey;
}

// Datos del formulario para crear/editar API Key
export interface APIKeyFormData {
  nombre: string;
  proveedor: ProveedorIA;
  clave: string;
  modelo: string;
  tipo: TipoAPIKey;
}

// Configuración de IA actual (para usar en aiService)
export interface ConfigIA {
  provider: ProveedorIA;
  apiKey: string;
  modelo: string;
}
