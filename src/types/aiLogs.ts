// Tipos para el sistema de logging de peticiones a IA

export type ContextoIA = 'resumen' | 'experiencia' | 'educacion';

/**
 * Estructura completa de un log de petición a IA (almacenado en Supabase)
 */
export interface AIRequestLog {
  id: string;
  user_id: string;
  
  // Información de la API key usada
  api_key_id: string | null; // NULL si es key temporal
  api_key_nombre: string; // "Temporal" o nombre de la key guardada
  proveedor: 'openai' | 'gemini';
  modelo: string;
  
  // Datos de la petición
  contexto: ContextoIA;
  info_adicional: string | null;
  prompt: string;
  
  // Datos de la respuesta
  respuesta: string;
  
  // Métricas de rendimiento
  tiempo_respuesta_ms: number | null;
  intentos: number;
  error_mensaje: string | null;
  
  // Timestamps
  created_at: string;
}

/**
 * Input para crear un nuevo log (usado en guardarLog)
 */
export interface LogInput {
  api_key_id: string | null;
  api_key_nombre: string;
  proveedor: 'openai' | 'gemini';
  modelo: string;
  contexto: ContextoIA;
  info_adicional?: string;
  prompt: string;
  respuesta: string;
  tiempo_respuesta_ms: number;
  intentos: number;
  error_mensaje?: string;
}
