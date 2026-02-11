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
Importante: Cada vez que se modifique el archivo de entorno (.env) o se requiera reiniciar el servicio con cambios, es necesario reconstruir la imagen de Docker para que los cambios se inyecten correctamente durante el proceso de build.

``` bash
docker-compose up -d
```

O manualmente:

``` bash
docker build -t cv-generator .
docker run -p 8080:80 cv-generator
```

------------------------------------------------------------------------

## 🤖 Sistema de API Keys de IA (Opcional)

MakeMeEt incluye funcionalidades de IA para mejorar textos de CV usando OpenAI o Google Gemini. El sistema soporta:

- **API Keys Personales**: Cada usuario puede configurar su propia key (almacenada en localStorage)
- **API Keys Globales**: Los administradores pueden configurar keys compartidas para todos los usuarios

### 📋 Requisitos para IA

1. **Supabase CLI** instalado (para desplegar Edge Functions)
2. Una cuenta de **OpenAI** o **Google Gemini** con API key
3. Acceso de administrador en la aplicación

### 🔧 Configuración de Edge Functions

Las Edge Functions permiten que usuarios sin API key personal usen la key global del administrador de forma segura (la key nunca llega al navegador).

#### 1. Instalar Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# O con npm
npm install -g supabase
```

#### 2. Iniciar sesión en Supabase

```bash
supabase login
```

#### 3. Vincular tu proyecto

```bash
supabase link --project-ref tu-project-id
```

#### 4. Crear la estructura de Edge Functions

```bash
# Crear directorio para las funciones
mkdir -p supabase/functions/improve-cv-text
mkdir -p supabase/functions/_shared

# Crear archivo de la función principal
cat > supabase/functions/improve-cv-text/index.ts << 'EOF'
import { corsHeaders } from '../_shared/cors.ts';
import { handleOpenAI } from './openai-handler.ts';
import { handleGemini } from './gemini-handler.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verificar autenticación
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener API key activa desde la base de datos
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.3');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Llamar a la función que obtiene la key activa
    const { data: keyData, error: keyError } = await supabase.rpc('obtener_api_key_activa');

    if (keyError || !keyData) {
      console.error('[Edge Function] Error al obtener API key:', keyError);
      return new Response(
        JSON.stringify({ error: 'No hay API key global configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { proveedor, clave, modelo } = keyData;

    // Obtener el prompt del body
    const { systemPrompt, userPrompt } = await req.json();

    // Delegar al handler correcto
    if (proveedor === 'openai') {
      return await handleOpenAI(clave, modelo, systemPrompt, userPrompt);
    } else if (proveedor === 'gemini') {
      return await handleGemini(clave, modelo, systemPrompt, userPrompt);
    } else {
      return new Response(
        JSON.stringify({ error: 'Proveedor no soportado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('[Edge Function] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
EOF

# Crear handler para OpenAI
cat > supabase/functions/improve-cv-text/openai-handler.ts << 'EOF'
import { corsHeaders } from '../_shared/cors.ts';

export async function handleOpenAI(
  apiKey: string,
  modelo: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Response> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelo,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Si es 402 o error de quota, devolver mensaje específico
      if (response.status === 401 || response.status === 403) {
        const detail = errorData?.error?.message || '';
        if (detail.includes('quota') || detail.includes('billing')) {
          return new Response(
            JSON.stringify({ error: 'API key sin créditos o cuenta suspendida' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: `Error de OpenAI: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'OpenAI no generó respuesta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
EOF

# Crear handler para Gemini
cat > supabase/functions/improve-cv-text/gemini-handler.ts << 'EOF'
import { corsHeaders } from '../_shared/cors.ts';

export async function handleGemini(
  apiKey: string,
  modelo: string,
  systemPrompt: string,
  userPrompt: string
): Promise<Response> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        const msg = errorData?.error?.message || '';
        if (msg.toLowerCase().includes('quota')) {
          return new Response(
            JSON.stringify({ error: 'API key sin créditos' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      return new Response(
        JSON.stringify({ error: `Error de Gemini: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      return new Response(
        JSON.stringify({ error: 'Gemini no generó respuesta' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
EOF

# Crear archivo CORS compartido
cat > supabase/functions/_shared/cors.ts << 'EOF'
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
EOF
```

#### 5. Desplegar la Edge Function

```bash
supabase functions deploy improve-cv-text
```

#### 6. Verificar el despliegue

```bash
supabase functions list
```

### 📝 Notas importantes

- Las Edge Functions son **gratuitas** en Supabase (hasta 500K invocaciones/mes)
- La API key global **nunca** llega al navegador del cliente
- Los usuarios con API key personal **siempre** usan su propia key (llamada directa, sin Edge Function)
- Solo puede haber **una API key global activa** a la vez
- Los administradores gestionan las API keys globales desde la página de Setup

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
  is_admin BOOLEAN NOT NULL DEFAULT false,
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

-- Tabla de API Keys para IA (opcional)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  proveedor TEXT NOT NULL CHECK (proveedor IN ('openai', 'gemini')),
  clave TEXT NOT NULL,
  modelo TEXT NOT NULL,
  activa BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================
-- SEGURIDAD (RLS)
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

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

-- Políticas para api_keys (solo admins pueden SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Solo admins pueden ver API keys globales"
ON public.api_keys FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Solo admins pueden crear API keys globales"
ON public.api_keys FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Solo admins pueden actualizar API keys globales"
ON public.api_keys FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

CREATE POLICY "Solo admins pueden eliminar API keys globales"
ON public.api_keys FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.is_admin = true
  )
);

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

DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();

-- Función para obtener API key activa (usada por Edge Functions)
-- Usa SECURITY DEFINER para que las Edge Functions puedan acceder
CREATE OR REPLACE FUNCTION public.obtener_api_key_activa()
RETURNS TABLE (
  proveedor TEXT,
  clave TEXT,
  modelo TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT api_keys.proveedor, api_keys.clave, api_keys.modelo
  FROM public.api_keys
  WHERE api_keys.activa = true
  LIMIT 1;
END;
$$;
```

### 🔑 Hacer tu primer usuario administrador

Después de registrarte en la aplicación, ejecuta este SQL en Supabase para convertirte en admin:

```sql
-- Reemplaza 'tu@email.com' con el email que usaste al registrarte
UPDATE public.profiles
SET is_admin = true
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'tu@email.com'
);
```

Una vez que seas admin, podrás:
- Configurar API Keys globales de IA
- Gestionar configuraciones avanzadas desde el Setup
- Ver todas las opciones de administración

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
