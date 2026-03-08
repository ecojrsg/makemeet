---
id: instalacion-self-hosted
title: Instalación (Self-hosted)
---

## Prerrequisitos

- Node.js 18+
- npm
- Supabase CLI
- Instancia self-hosted accesible por URL de PostgreSQL

## 1) Configurar `.env`

```env
APP_PORT=8080
VITE_SUPABASE_PROJECT_ID=self-hosted
VITE_SUPABASE_URL=http://<tu-host>:8000
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_AUTH_PROVIDERS=email
```

## 2) Instalar frontend

```bash
npm install
```

## 3) Aplicar migraciones por conexión directa

```bash
npx supabase db push --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres"
npx supabase gen types typescript --db-url "postgresql://USER:PASSWORD@HOST:PORT/postgres" --schema public > src/integrations/supabase/types.ts
```

## 4) Levantar app

```bash
npm run dev
```

## 5) Validar setup

- Abrir `/setup`.
- Confirmar conexión a Supabase.
- Confirmar tablas core (`profiles`, `cvs`).

## Nota de PowerShell

En PowerShell clásico (`5.x`), `&&` no es válido. Ejecuta comandos encadenados con `;`:

```powershell
npm run db:start; npm run db:reset; npm run db:types:local
```
