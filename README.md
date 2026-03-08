# MakeMeEt

> Generador de curriculums profesionales.

Aplicacion web para crear, personalizar y exportar CVs con multiples plantillas,
autenticacion con Supabase y mejora de textos con IA.

---

## Caracteristicas principales

- 4 plantillas de CV (clasica, moderna, minimalista y creativa)
- Autenticacion por email/password y Google
- Persistencia por usuario en Supabase con RLS
- Gestion de API keys personales (OpenAI y Gemini)
- Logs de peticiones de IA por usuario
- Exportacion a PDF
- Despliegue con Docker

## Stack

| Capa | Tecnologia |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth + PostgreSQL) |
| Estado | TanStack Query |
| Forms | React Hook Form + Zod |
| Tests | Vitest + Testing Library |

---

## Instalacion

### Requisitos previos

- Node.js 18+
- Docker
- Supabase CLI
- Una instancia de Supabase (SaaS o self-hosted)

### Configurar entorno

```bash
git clone <URL_DEL_REPO>
cd makemeet
cp .env.example .env
```

Variables minimas:

```env
APP_PORT=8080
VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-anon-key"
VITE_SUPABASE_PROJECT_ID="tu-project-id"
VITE_AUTH_PROVIDERS=email,google
```

### Desarrollo local

```bash
npm install
npm run dev
```

App en `http://localhost:8080`.

---

## Base de datos (Supabase CLI)

La fuente de verdad del esquema es:

- `supabase/migrations/20260307190000_init.sql`

### Flujo recomendado (local, base vacia)

```bash
npm run db:start
npm run db:reset
npm run db:types:local
```

### Flujo remoto (Supabase SaaS)

```bash
supabase login
supabase link --project-ref <project-ref>
npm run db:push
npm run db:types:linked
```

### Flujo remoto (self-hosted)

```bash
npx supabase db push --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres"
npx supabase gen types typescript --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres" --schema public > src/integrations/supabase/types.ts
```

### Variables privadas para CLI

Para automatizar comandos CLI (scripts/CI), usa variables privadas fuera del frontend:

- `SUPABASE_ACCESS_TOKEN` (para `supabase login` no interactivo)
- `SUPABASE_DB_PASSWORD` (si usas `--linked`/`db push` cuando se solicite password)
- URL de conexion de Postgres completa para flujos `--db-url`

No agregues estas variables con prefijo `VITE_`.

### Crear una nueva migracion

```bash
npm run db:migration:new -- <nombre_cambio>
```

---

## Setup en la aplicacion

Ruta: `/setup`

Ahora el setup sirve para:

- Diagnosticar conexion a Supabase
- Verificar tablas base requeridas (`profiles`, `cvs`)
- Mostrar diagnostico de tablas IA (`api_keys`, `ai_request_logs`)
- Guiar el proceso con comandos Supabase CLI

Ya no se usa SQL embebido en la UI.

---

## Sistema de IA

- Soporta OpenAI y Gemini
- API keys temporales (sessionStorage) o persistentes (tabla `api_keys`)
- Solo una key activa por usuario
- Logs en `ai_request_logs` con limpieza automatica (ultimos 500 por usuario)

---

## Comandos utiles

### Desarrollo

```bash
npm run dev
npm run build
npm run build:dev
npm run preview
npm run lint
npm run test
npm run test:watch
```

### Base de datos

```bash
npm run db:start
npm run db:stop
npm run db:reset
npm run db:push
npm run db:pull
npm run db:migration:new -- nombre_cambio
npm run db:types:local
npm run db:types:linked
```

### Docker

```bash
docker-compose up -d
docker-compose build --no-cache && docker-compose up -d
docker-compose down
```

---

## Troubleshooting

### No conecta a Supabase

1. Verifica `.env`
2. Revisa URL y publishable key
3. Ejecuta `/setup` para diagnostico

### Faltan tablas

```bash
npm run db:start && npm run db:reset
```

### Tipos de Supabase desactualizados

```bash
npm run db:types:local
# o
npm run db:types:linked
```

---

## Licencia

MIT
