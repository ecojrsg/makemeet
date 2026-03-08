---
id: instalacion-saas
title: Instalación (SaaS)
---

## Prerrequisitos

- Node.js 18+
- npm
- Docker (para desarrollo local de Supabase opcional)
- Supabase CLI
- Proyecto en [Supabase Cloud](https://supabase.com)

## 1) Clonar y configurar variables

```bash
git clone <URL_DEL_REPO>
cd makemeet
cp .env.example .env
```

Configura mínimo:

```env
APP_PORT=8080
VITE_SUPABASE_PROJECT_ID=<project-ref>
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_AUTH_PROVIDERS=email,google
```

## 2) Instalar frontend

```bash
npm install
```

## 3) Aplicar migraciones al proyecto SaaS

```bash
supabase login
supabase link --project-ref <project-ref>
npm run db:push
npm run db:types:linked
```

## 4) Levantar app

```bash
npm run dev
```

Abre `http://localhost:8080`.

## 5) Validación en app

- Entrar a `/setup`.
- Confirmar estado listo (tablas base: `profiles`, `cvs`).
- Revisar diagnóstico de IA (`api_keys`, `ai_request_logs`).

## Variables privadas para automatización CLI

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`

No usar prefijo `VITE_` para estas variables.
