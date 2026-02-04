// Servicio para verificar y configurar la conexión con Supabase
import { supabase } from '@/integrations/supabase/client';

// SQL completo para crear las tablas necesarias
export const SQL_SETUP = `
-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nombre TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de CVs
CREATE TABLE IF NOT EXISTS public.cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nombre TEXT NOT NULL DEFAULT 'Mi CV',
  datos_cv JSONB NOT NULL,
  etiquetas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio perfil" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar su propio perfil" 
ON public.profiles FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para cvs
CREATE POLICY "Usuarios pueden ver sus propios CVs" 
ON public.cvs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear sus propios CVs" 
ON public.cvs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios CVs" 
ON public.cvs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios CVs" 
ON public.cvs FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil en registro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para actualizar timestamps
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();

DROP TRIGGER IF EXISTS update_cvs_updated_at ON public.cvs;
CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON public.cvs
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();
`;

export interface ResultadoVerificacion {
  conexionOk: boolean;
  tablas: {
    profiles: boolean;
    cvs: boolean;
  };
  proveedoresAuth: string[];
  errorMensaje: string | null;
}

/**
 * Verifica si Supabase responde correctamente
 */
export async function verificarConexion(): Promise<boolean> {
  try {
    // Intentar una consulta simple para verificar conexión
    const { error } = await supabase.auth.getSession();
    return !error;
  } catch {
    return false;
  }
}

/**
 * Verifica si las tablas necesarias existen
 */
export async function verificarTablas(): Promise<{ profiles: boolean; cvs: boolean }> {
  const resultado = { profiles: false, cvs: false };

  try {
    // Verificar tabla profiles
    const { error: errorProfiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    // Solo existe si NO hay error
    if (!errorProfiles) {
      resultado.profiles = true;
    } else {
      // Si el error indica que no existe, la tabla no existe
      const noExiste = errorProfiles.message?.toLowerCase().includes('does not exist') ||
        errorProfiles.code === '42P01'; // código PostgreSQL para tabla inexistente
      resultado.profiles = !noExiste ? false : false;
    }
  } catch {
    resultado.profiles = false;
  }

  try {
    // Verificar tabla cvs
    const { error: errorCvs } = await supabase
      .from('cvs')
      .select('id')
      .limit(1);

    // Solo existe si NO hay error
    if (!errorCvs) {
      resultado.cvs = true;
    } else {
      const noExiste = errorCvs.message?.toLowerCase().includes('does not exist') ||
        errorCvs.code === '42P01';
      resultado.cvs = !noExiste ? false : false;
    }
  } catch {
    resultado.cvs = false;
  }

  return resultado;
}

/**
 * Obtiene los proveedores de autenticación configurados
 * Lee desde variable de entorno ya que Supabase no expone esta info públicamente
 */
export function obtenerProveedoresConfigurados(): string[] {
  // @ts-ignore
  const proveedoresEnv = window.env?.VITE_AUTH_PROVIDERS || import.meta.env.VITE_AUTH_PROVIDERS || 'email';
  return proveedoresEnv
    .split(',')
    .map((p: string) => p.trim().toLowerCase())
    .filter((p: string) => p.length > 0);
}

/**
 * Realiza verificación completa del sistema
 */
export async function verificarSistema(): Promise<ResultadoVerificacion> {
  const resultado: ResultadoVerificacion = {
    conexionOk: false,
    tablas: { profiles: false, cvs: false },
    proveedoresAuth: [],
    errorMensaje: null,
  };

  // Paso 1: Verificar conexión
  resultado.conexionOk = await verificarConexion();

  if (!resultado.conexionOk) {
    resultado.errorMensaje = 'No se pudo conectar a Supabase. Verifica las credenciales en .env';
    return resultado;
  }

  // Paso 2: Verificar tablas
  resultado.tablas = await verificarTablas();

  // Paso 3: Obtener proveedores de auth
  resultado.proveedoresAuth = obtenerProveedoresConfigurados();

  // Determinar si hay tablas faltantes
  if (!resultado.tablas.profiles || !resultado.tablas.cvs) {
    const faltantes = [];
    if (!resultado.tablas.profiles) faltantes.push('profiles');
    if (!resultado.tablas.cvs) faltantes.push('cvs');
    resultado.errorMensaje = `Tablas faltantes: ${faltantes.join(', ')}. Ejecuta el SQL de configuración.`;
  }

  return resultado;
}

/**
 * Copia el SQL al portapapeles
 */
export async function copiarSQLAlPortapapeles(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(SQL_SETUP);
    return true;
  } catch {
    return false;
  }
}
