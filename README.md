# MakeMeEt 📄

> Generador de currículums profesionales de alto impacto.

Aplicación web moderna para crear, personalizar y exportar currículums
profesionales con múltiples plantillas, gestión de usuarios y
persistencia en la nube. Diseñada para ser fácil de usar, segura y
**auto-hospedable con Docker**.

------------------------------------------------------------------------

## ✨ Características principales

-   🎨 **4 plantillas profesionales**
    -   Clásica\
    -   Moderna\
    -   Minimalista\
    -   Creativa
-   🔐 **Autenticación robusta**
    -   Email y contraseña\
    -   OAuth (Google)
-   ☁️ **Persistencia en la nube con Supabase**
    -   Almacenamiento multi-CV por usuario\
    -   Seguridad con Row Level Security (RLS)\
    -   Gestión automática de perfiles
-   🐙 **Integración con GitHub**
    -   Importación automática de biografía\
    -   Listado de repositorios destacados
-   📄 **Exportación a PDF**
    -   Listo para procesos de reclutamiento\
    -   Formato profesional y limpio
-   🐳 **Auto-hospedable**
    -   Arquitectura lista para Docker y Docker Compose

------------------------------------------------------------------------

## 🛠️ Stack tecnológico

  Capa          Tecnología
  ------------- --------------------------------------
  Frontend      React 18 + TypeScript + Vite
  Estilos       Tailwind CSS + shadcn/ui
  Backend       Supabase (Auth, PostgreSQL, Storage)
  Estado        TanStack Query (React Query)
  Formularios   React Hook Form + Zod
  Despliegue    Docker + Docker Compose

------------------------------------------------------------------------

## 🚀 Instalación y setup

### 📋 Requisitos previos

-   Node.js **18+** o Bun\
-   Docker y Docker Compose\
-   Una instancia de Supabase (Cloud o Self-hosted)

------------------------------------------------------------------------

### 🔧 Configuración del entorno

Clona el repositorio y prepara las variables de entorno:

``` bash
git clone <URL_DEL_REPO>
cd cv-generator
cp .env.example .env
```

Edita tu archivo `.env` con tus credenciales:

``` env
APP_PORT=8080
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"
VITE_SUPABASE_PROJECT_ID="tu-project-id"
VITE_AUTH_PROVIDERS=email,google,github
```

------------------------------------------------------------------------

### 🧪 Desarrollo local

``` bash
npm install
npm run dev
```

La aplicación estará disponible en:

    http://localhost:8080

------------------------------------------------------------------------

### 🐳 Despliegue con Docker (recomendado)

``` bash
docker-compose up -d
```

O manualmente:

``` bash
docker build -t cv-generator .
docker run -p 8080:80 cv-generator
```

------------------------------------------------------------------------

## 🗄️ Esquema de base de datos (PostgreSQL)

Ejecuta el siguiente script en el **SQL Editor de Supabase**:

``` sql
-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
```

------------------------------------------------------------------------

## 🔧 Mantenimiento y logs

Si usas Docker:

``` bash
docker-compose logs -f
docker-compose restart
docker-compose build --no-cache && docker-compose up -d
```

------------------------------------------------------------------------

## 🔐 Seguridad en producción

-   Usa **HTTPS con Nginx o Traefik**\
-   Mantén **RLS habilitado en Supabase**\
-   Nunca expongas keys privadas en el frontend\
-   Solo usa variables con prefijo `VITE_` para claves públicas

------------------------------------------------------------------------

## 📜 Licencia

Este proyecto está bajo la **Licencia MIT**.

------------------------------------------------------------------------

## 👨‍💻 Autor

Desarrollado por **Eco -- Katze**
