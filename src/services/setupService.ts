// Servicio para verificar y diagnosticar la conexion con Supabase
import { supabase } from '@/integrations/supabase/client';

export interface ResultadoVerificacion {
  conexionOk: boolean;
  tablas: {
    profiles: boolean;
    cvs: boolean;
    api_keys: boolean;
    ai_request_logs: boolean;
  };
  proveedoresAuth: string[];
  errorMensaje: string | null;
}

/**
 * Verifica si Supabase responde correctamente
 */
export async function verificarConexion(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}

/**
 * Verifica si las tablas necesarias existen
 */
export async function verificarTablas(): Promise<{
  profiles: boolean;
  cvs: boolean;
  api_keys: boolean;
  ai_request_logs: boolean;
}> {
  const resultado = {
    profiles: false,
    cvs: false,
    api_keys: false,
    ai_request_logs: false,
  };

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    resultado.profiles = !error;
  } catch {
    resultado.profiles = false;
  }

  try {
    const { error } = await supabase.from('cvs').select('id').limit(1);
    resultado.cvs = !error;
  } catch {
    resultado.cvs = false;
  }

  try {
    const { error } = await supabase.from('api_keys').select('id').limit(1);
    resultado.api_keys = !error;
  } catch {
    resultado.api_keys = false;
  }

  try {
    const { error } = await supabase.from('ai_request_logs').select('id').limit(1);
    resultado.ai_request_logs = !error;
  } catch {
    resultado.ai_request_logs = false;
  }

  return resultado;
}

/**
 * Obtiene los proveedores de autenticacion configurados
 * Lee desde variable de entorno ya que Supabase no expone esta info publicamente
 */
export function obtenerProveedoresConfigurados(): string[] {
  const proveedoresRuntime = (
    window as Window & {
      env?: {
        VITE_AUTH_PROVIDERS?: string;
      };
    }
  ).env?.VITE_AUTH_PROVIDERS;

  const proveedoresEnv = proveedoresRuntime || import.meta.env.VITE_AUTH_PROVIDERS || 'email';

  return proveedoresEnv
    .split(',')
    .map((p: string) => p.trim().toLowerCase())
    .filter((p: string) => p.length > 0);
}

/**
 * Realiza verificacion completa del sistema
 */
export async function verificarSistema(): Promise<ResultadoVerificacion> {
  const resultado: ResultadoVerificacion = {
    conexionOk: false,
    tablas: { profiles: false, cvs: false, api_keys: false, ai_request_logs: false },
    proveedoresAuth: [],
    errorMensaje: null,
  };

  resultado.conexionOk = await verificarConexion();

  if (!resultado.conexionOk) {
    resultado.errorMensaje =
      'No se pudo conectar a Supabase. Verifica las credenciales en .env';
    return resultado;
  }

  resultado.tablas = await verificarTablas();
  resultado.proveedoresAuth = obtenerProveedoresConfigurados();

  if (!resultado.tablas.profiles || !resultado.tablas.cvs) {
    const faltantes: string[] = [];
    if (!resultado.tablas.profiles) faltantes.push('profiles');
    if (!resultado.tablas.cvs) faltantes.push('cvs');

    resultado.errorMensaje =
      `Tablas faltantes: ${faltantes.join(', ')}. Ejecuta las migraciones con Supabase CLI.`;
  }

  return resultado;
}

