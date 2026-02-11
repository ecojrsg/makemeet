# MakeMeEt 📄

> Generador de currículums profesionales de alto impacto.

Aplicación web moderna para crear, personalizar y exportar currículums
profesionales con múltiples plantillas, gestión de usuarios y
persistencia en la nube. Diseñada para ser fácil de usar, segura y
**auto-hospedable con Docker**.

------------------------------------------------------------------------

## ✨ Características principales

-   🎨 **4 plantillas profesionales**
    -   Clásica
    -   Moderna
    -   Minimalista
    -   Creativa
-   🔐 **Autenticación robusta**
    -   Email y contraseña
    -   OAuth (Google)
-   ☁️ **Persistencia en la nube con Supabase**
    -   Almacenamiento multi-CV por usuario
    -   Seguridad con Row Level Security (RLS)
    -   Gestión automática de perfiles
-   🐙 **Integración con GitHub**
    -   Importación automática de biografía
    -   Listado de repositorios destacados
-   🤖 **Mejora de textos con IA**
    -   Integración con OpenAI y Google Gemini
    -   API keys personales por usuario
    -   Sistema de logs de peticiones
-   📄 **Exportación a PDF**
    -   Listo para procesos de reclutamiento
    -   Formato profesional y limpio
-   ⚙️ **Página de configuración accesible**
    -   Botón Setup en el sidebar
    -   Verificación de conexión con Supabase
    -   Gestión de API keys personales
-   🐳 **Auto-hospedable**
    -   Arquitectura lista para Docker y Docker Compose

------------------------------------------------------------------------

## 🛠️ Stack tecnológico

| Capa         | Tecnología                           |
|--------------|--------------------------------------|
| Frontend     | React 18 + TypeScript + Vite (SWC)  |
| Estilos      | Tailwind CSS + shadcn/ui             |
| Backend      | Supabase (Auth, PostgreSQL)          |
| Estado       | TanStack Query (React Query)         |
| Formularios  | React Hook Form + Zod                |
| Despliegue   | Docker + Docker Compose              |

------------------------------------------------------------------------

## 🚀 Instalación y setup

### 📋 Requisitos previos

-   Node.js **18+** o Bun
-   Docker y Docker Compose (para despliegue en producción)
-   Una instancia de Supabase (Cloud o Self-hosted)

------------------------------------------------------------------------

### 🔧 Configuración del entorno

Clona el repositorio y prepara las variables de entorno:

``` bash
git clone <URL_DEL_REPO>
cd makemeet
cp .env.example .env
```

Edita tu archivo `.env` con tus credenciales:

``` env
APP_PORT=8080
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"
VITE_SUPABASE_PROJECT_ID="tu-project-id"
VITE_AUTH_PROVIDERS=email,google
```

> **Nota**: Todas las variables con prefijo `VITE_` se inyectan durante el build y son públicas en el navegador. Nunca expongas claves privadas aquí.

------------------------------------------------------------------------

### 🧪 Desarrollo local

``` bash
npm install
npm run dev
```

La aplicación estará disponible en:

    http://localhost:8080

------------------------------------------------------------------------

### 🐳 Despliegue con Docker

#### Despliegue rápido

``` bash
docker-compose up -d
```

#### Rebuild completo (necesario tras cambios en .env)

``` bash
docker-compose build --no-cache && docker-compose up -d
```

> **Importante**: Cada vez que modifiques el archivo `.env`, debes reconstruir la imagen de Docker para que los cambios se inyecten correctamente durante el proceso de build.

Para más detalles sobre la configuración de Docker, consulta el archivo `docker-compose.yml` y `Dockerfile` en el repositorio.

------------------------------------------------------------------------

## ⚙️ Configuración inicial de la aplicación

### Acceso a la página de Setup

Una vez que la aplicación esté en ejecución, puedes acceder a la configuración desde:

-   El botón **"Setup"** (⚙️) en el pie del sidebar (siempre visible)
-   La ruta directa: `http://localhost:8080/setup`

### ¿Qué puedes hacer en Setup?

1. **Verificar la conexión con Supabase**
   - Comprueba que las credenciales en `.env` sean correctas
   - Verifica el estado de las tablas de la base de datos

2. **Configurar la base de datos inicial**
   - Copia el SQL de configuración con un clic
   - Accede directamente al SQL Editor de Supabase
   - Ejecuta el script para crear las tablas necesarias

3. **Gestionar tus API keys de IA**
   - Agrega API keys de OpenAI o Google Gemini
   - Elige si guardarlas de forma temporal o permanente
   - Activa/desactiva keys según necesites

------------------------------------------------------------------------

## 🗄️ Esquema de base de datos

### Configuración automática desde la aplicación (Recomendado)

1. Accede al botón **"Setup"** en el sidebar
2. Haz clic en **"Copiar SQL"**
3. Haz clic en **"Abrir SQL Editor"** (te llevará a Supabase)
4. Pega el SQL copiado en el editor
5. Ejecuta el script

### Configuración manual en Supabase

Si prefieres configurar manualmente, ejecuta el siguiente script SQL en el **SQL Editor de Supabase**:

``` sql
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

-- Tabla de API Keys personales de usuarios
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL CHECK (proveedor IN ('openai', 'gemini')),
  clave TEXT NOT NULL,
  modelo TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índice único: solo UNA key activa por usuario
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_key_per_user 
  ON public.api_keys(user_id) 
  WHERE activa = true;

-- Tabla de logs de peticiones a IA
CREATE TABLE IF NOT EXISTS public.ai_request_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Información de la API key usada
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  api_key_nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL CHECK (proveedor IN ('openai', 'gemini')),
  modelo TEXT NOT NULL,
  
  -- Datos de la petición
  contexto TEXT NOT NULL CHECK (contexto IN ('resumen', 'experiencia', 'educacion')),
  info_adicional TEXT,
  prompt TEXT NOT NULL,
  
  -- Datos de la respuesta
  respuesta TEXT NOT NULL,
  
  -- Métricas de rendimiento
  tiempo_respuesta_ms INTEGER,
  intentos INTEGER DEFAULT 1,
  error_mensaje TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON public.ai_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON public.ai_request_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_created ON public.ai_request_logs(user_id, created_at DESC);

-- ============================================
-- SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_request_logs ENABLE ROW LEVEL SECURITY;

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

-- Políticas para api_keys (cada usuario solo ve/maneja sus propias keys)
CREATE POLICY "Usuarios pueden ver sus propias API keys"
ON public.api_keys FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propias API keys"
ON public.api_keys FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propias API keys"
ON public.api_keys FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propias API keys"
ON public.api_keys FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Políticas para ai_request_logs
CREATE POLICY "Usuarios pueden ver sus propios logs"
ON public.ai_request_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden insertar sus propios logs"
ON public.ai_request_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

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
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
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

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();

-- Función para limpiar logs antiguos (mantener solo últimos N por usuario)
CREATE OR REPLACE FUNCTION public.limpiar_logs_antiguos_por_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  limite_logs INTEGER := 500; -- Mantener solo últimos 500 logs por usuario
BEGIN
  DELETE FROM public.ai_request_logs
  WHERE id IN (
    SELECT id FROM public.ai_request_logs
    WHERE user_id = NEW.user_id
    ORDER BY created_at DESC
    OFFSET limite_logs
  );
  RETURN NEW;
END;
$$;

-- Trigger para ejecutar limpieza después de cada inserción
DROP TRIGGER IF EXISTS trigger_limpiar_logs ON public.ai_request_logs;
CREATE TRIGGER trigger_limpiar_logs
  AFTER INSERT ON public.ai_request_logs
  FOR EACH ROW EXECUTE FUNCTION public.limpiar_logs_antiguos_por_usuario();
```

### 📝 Notas sobre el esquema

- **Row Level Security (RLS)**: Todas las tablas tienen RLS habilitado. Cada usuario solo puede acceder a sus propios datos.
- **API Keys personales**: Cada usuario gestiona sus propias keys. No existen keys globales ni roles de administrador.
- **Logs de IA**: El sistema mantiene automáticamente solo los últimos 500 logs por usuario para optimizar el almacenamiento.
- **Índice único**: Solo puede haber una API key activa por usuario a la vez.

------------------------------------------------------------------------

## 🤖 Sistema de API Keys de IA (Opcional)

MakeMeEt incluye funcionalidades de IA para mejorar textos de CV usando **OpenAI** o **Google Gemini**. Cada usuario gestiona sus propias API keys de forma completamente independiente y segura.

### 🔑 Tipos de API Keys

#### 1. Temporales (sessionStorage)
-   Se guardan solo durante la sesión del navegador
-   Ideales para pruebas rápidas o uso esporádico
-   **Se pierden al cerrar el navegador**
-   No se almacenan en Supabase

#### 2. Persistentes (Supabase)
-   Se guardan en tu base de datos personal (tabla `api_keys`)
-   Protegidas por Row Level Security (solo tú puedes acceder)
-   Disponibles en todos tus dispositivos y sesiones
-   Permanecen hasta que las elimines manualmente

### 🚀 Configuración paso a paso

1. **Obtén una API key**:
   - [OpenAI API Keys](https://platform.openai.com/api-keys) (requiere créditos pagados)
   - [Google AI Studio](https://aistudio.google.com/app/apikey) (tiene plan gratuito)

2. **Accede a la configuración**:
   - Haz clic en el botón **"Setup"** (⚙️) en el sidebar
   - Ve a la sección "API Keys de IA"

3. **Agrega tu API key**:
   - Ingresa un nombre descriptivo (ej: "OpenAI Personal")
   - Selecciona el proveedor (OpenAI o Gemini)
   - Pega tu API key
   - Elige el modelo a usar
   - Decide si guardarla temporal o permanentemente

4. **Activa la key**:
   - Solo puedes tener **una key activa** a la vez
   - La key activa se usará automáticamente al mejorar textos con IA

### 📊 Sistema de logs

Todas las peticiones a la IA se registran automáticamente en la tabla `ai_request_logs` con:

-   Información de la API key usada (proveedor, modelo)
-   Contexto de la mejora (resumen, experiencia, educación)
-   Prompt enviado y respuesta recibida
-   Métricas de rendimiento (tiempo de respuesta, intentos)
-   Mensajes de error (si los hay)

**Limpieza automática**: El sistema mantiene solo los últimos **500 logs por usuario**. Los logs más antiguos se eliminan automáticamente tras cada nueva petición.

### 🔒 Seguridad

-   Las API keys **nunca** se comparten entre usuarios
-   Cada usuario solo puede ver y usar sus propias keys
-   Las políticas RLS garantizan el aislamiento total de datos
-   Las keys persistentes se almacenan encriptadas en Supabase

### 🎯 Proveedores soportados

| Proveedor | Modelos disponibles | Plan gratuito |
|-----------|---------------------|---------------|
| OpenAI    | gpt-4, gpt-3.5-turbo | ❌ No (requiere créditos) |
| Google Gemini | gemini-1.5-flash, gemini-1.5-pro | ✅ Sí (con límites) |

------------------------------------------------------------------------

## 🔧 Comandos útiles

### Desarrollo

``` bash
npm run dev          # Servidor de desarrollo (puerto 8080)
npm run build        # Build de producción (output: dist/)
npm run build:dev    # Build en modo desarrollo
npm run preview      # Preview del build de producción
npm run lint         # Ejecutar ESLint
npm run test         # Ejecutar tests (vitest run)
npm run test:watch   # Tests en modo watch (vitest)
```

### Docker

``` bash
# Iniciar aplicación en producción
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar servicios
docker-compose restart

# Rebuild completo (necesario tras cambios en .env)
docker-compose build --no-cache && docker-compose up -d

# Detener y eliminar contenedores
docker-compose down

# Build manual de imagen
docker build -t makemeet .

# Ejecutar contenedor manual
docker run -p 8080:80 makemeet
```

------------------------------------------------------------------------

## 🔐 Seguridad en producción

### Recomendaciones importantes

-   ✅ Usa **HTTPS** con Nginx, Traefik o Caddy como reverse proxy
-   ✅ Mantén **Row Level Security (RLS) habilitado** en todas las tablas de Supabase
-   ✅ Nunca expongas claves privadas en el frontend
-   ✅ Solo usa variables con prefijo `VITE_` para claves públicas (anon key)
-   ✅ Configura correctamente los **CORS** en tu proyecto de Supabase
-   ✅ Habilita **MFA/2FA** en tu cuenta de Supabase en producción
-   ✅ Revisa regularmente los logs de acceso y actividad en Supabase

### Variables de entorno públicas vs privadas

**Públicas (seguro exponer)**:
-   `VITE_SUPABASE_URL`: URL de tu proyecto Supabase
-   `VITE_SUPABASE_PUBLISHABLE_KEY`: Anon/public key (diseñada para el navegador)
-   `VITE_SUPABASE_PROJECT_ID`: ID del proyecto

**Privadas (NUNCA exponer)**:
-   Service role key de Supabase (solo para backend/Edge Functions)
-   API keys de OpenAI o Gemini (cada usuario gestiona las suyas)

------------------------------------------------------------------------

## 📁 Estructura del proyecto

```
makemeet/
├── src/
│   ├── components/          # Componentes React
│   │   ├── auth/           # Diálogos de autenticación
│   │   ├── cv/             # Gestión de CVs (lista, guardado)
│   │   ├── layout/         # Layout (AppSidebar, AppContent)
│   │   ├── setup/          # Wizard de configuración inicial
│   │   ├── templates/      # Plantillas de CV (Clásica, Moderna, etc.)
│   │   └── ui/             # Componentes primitivos de shadcn/ui
│   ├── contexts/           # Contextos React (Auth, Setup)
│   ├── hooks/              # Custom hooks (useCVs, useGitHub, useAPIKeys)
│   ├── integrations/       # Integración con Supabase (client, types)
│   ├── pages/              # Páginas de rutas (Index, Setup, NotFound)
│   ├── services/           # Servicios (aiService, setupService)
│   ├── types/              # Tipos TypeScript (CVData, APIKey, AILog)
│   └── main.tsx            # Entry point
├── public/                 # Assets estáticos
├── docker-compose.yml      # Configuración de Docker Compose
├── Dockerfile             # Imagen de Docker
├── .env.example           # Ejemplo de variables de entorno
├── CLAUDE.md              # Guía para Claude Code
└── README.md              # Este archivo
```

------------------------------------------------------------------------

## 🐛 Solución de problemas

### La aplicación no conecta con Supabase

1. Verifica que las credenciales en `.env` sean correctas
2. Accede al botón "Setup" para verificar la conexión
3. Asegúrate de que tu proyecto de Supabase esté activo
4. Comprueba que las tablas existan en tu base de datos

### Error al mejorar textos con IA

1. Verifica que tengas una API key activa configurada
2. Comprueba que tu API key tenga créditos disponibles
3. Revisa los logs de IA en Supabase para ver el error específico
4. Asegúrate de estar usando el modelo correcto para tu proveedor

### Docker no refleja cambios en .env

Debes reconstruir la imagen completamente:

``` bash
docker-compose build --no-cache && docker-compose up -d
```

### Error de tipos TypeScript en desarrollo

Si los tipos de Supabase están desactualizados, asegúrate de que las tablas coincidan con los tipos en `src/integrations/supabase/types.ts`.

------------------------------------------------------------------------

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si encuentras un bug o tienes una sugerencia:

1. Abre un **issue** describiendo el problema o mejora
2. Si quieres contribuir código, abre un **pull request** con tus cambios
3. Asegúrate de que el código pase los tests y el linter antes de enviar

------------------------------------------------------------------------

## 📜 Licencia

Este proyecto está bajo la **Licencia MIT**. Puedes usarlo, modificarlo y distribuirlo libremente.

------------------------------------------------------------------------

## 👨‍💻 Autor

Desarrollado por **Eco -- Katze**

---

**¿Necesitas ayuda?** Abre un issue en el repositorio o consulta la documentación de:
- [Supabase](https://supabase.com/docs)
- [React](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
