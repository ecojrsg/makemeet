-- Migración para agregar tabla api_keys y campo is_admin en profiles
-- Fecha: 2026-02-11

-- ============================================
-- 1. Agregar campo is_admin a la tabla profiles
-- ============================================

-- Agregar columna is_admin si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Hacer que el primer usuario sea admin (si aún no hay ningún admin)
UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM public.profiles ORDER BY created_at ASC LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE is_admin = true
);

-- ============================================
-- 2. Crear tabla api_keys
-- ============================================

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL CHECK (proveedor IN ('openai', 'gemini')),
  clave TEXT NOT NULL,
  modelo TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- 3. Habilitar RLS en api_keys
-- ============================================

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. Crear políticas RLS para api_keys
-- ============================================

-- Política para SELECT (todos los autenticados pueden ver)
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver API keys globales" ON public.api_keys;
CREATE POLICY "Usuarios autenticados pueden ver API keys globales"
ON public.api_keys FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (solo admins)
DROP POLICY IF EXISTS "Solo admins pueden insertar API keys globales" ON public.api_keys;
CREATE POLICY "Solo admins pueden insertar API keys globales"
ON public.api_keys FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Política para UPDATE (solo admins)
DROP POLICY IF EXISTS "Solo admins pueden actualizar API keys globales" ON public.api_keys;
CREATE POLICY "Solo admins pueden actualizar API keys globales"
ON public.api_keys FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- Política para DELETE (solo admins)
DROP POLICY IF EXISTS "Solo admins pueden eliminar API keys globales" ON public.api_keys;
CREATE POLICY "Solo admins pueden eliminar API keys globales"
ON public.api_keys FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND is_admin = true
  )
);

-- ============================================
-- 5. Crear trigger para updated_at en api_keys
-- ============================================

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();

-- ============================================
-- 6. Actualizar función de crear perfil automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  es_primer_usuario BOOLEAN;
BEGIN
  -- Verificar si es el primer usuario
  SELECT COUNT(*) = 0 INTO es_primer_usuario FROM public.profiles;
  
  INSERT INTO public.profiles (user_id, nombre, is_admin)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    es_primer_usuario
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================
-- Esta migración agrega:
-- 1. Campo is_admin a la tabla profiles
-- 2. Tabla api_keys para almacenar API keys globales de IA
-- 3. Políticas RLS para proteger las API keys
-- 4. Actualiza la función de crear perfil para asignar admin al primer usuario
