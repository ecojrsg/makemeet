-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  nombre TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de CVs guardados
CREATE TABLE public.cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL DEFAULT 'Mi CV',
  etiquetas TEXT[] DEFAULT '{}',
  datos_cv JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;

-- Función helper para verificar propiedad de CV
CREATE OR REPLACE FUNCTION public.es_propietario_cv(_cv_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.cvs
    WHERE id = _cv_id
      AND user_id = auth.uid()
  )
$$;

-- Función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para updated_at
CREATE TRIGGER actualizar_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

CREATE TRIGGER actualizar_cvs_updated_at
BEFORE UPDATE ON public.cvs
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_updated_at();

-- Políticas RLS para profiles
CREATE POLICY "Usuarios pueden ver su propio perfil"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden crear su propio perfil"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar su propio perfil"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar su propio perfil"
ON public.profiles FOR DELETE
USING (auth.uid() = user_id);

-- Políticas RLS para cvs
CREATE POLICY "Usuarios pueden ver sus propios CVs"
ON public.cvs FOR SELECT
USING (public.es_propietario_cv(id));

CREATE POLICY "Usuarios pueden crear sus propios CVs"
ON public.cvs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios CVs"
ON public.cvs FOR UPDATE
USING (public.es_propietario_cv(id));

CREATE POLICY "Usuarios pueden eliminar sus propios CVs"
ON public.cvs FOR DELETE
USING (public.es_propietario_cv(id));

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.crear_perfil_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nombre)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.crear_perfil_nuevo_usuario();