# MakeMeEt

Generador de currÃ­culums profesionales con React + Supabase + IA.

## DocumentaciÃ³n oficial

La documentaciÃ³n detallada del proyecto vive en `docs/` (Docusaurus):

- ImplementaciÃ³n tÃ©cnica: `docs/docs-implementacion/`
- Manual de usuario: `docs/docs-manual/`

Cuando se publica en GitHub Pages, se sirve en la ruta `/makemeet/`.

## Inicio rÃ¡pido

```bash
git clone <URL_DEL_REPO>
cd makemeet
cp .env.example .env
npm install
npm run dev
```

App local: `http://localhost:8080`

## Base de datos (Supabase CLI)

Fuente de verdad de esquema:

- `supabase/migrations/20260307190000_init.sql`

Flujo local recomendado:

```bash
npm run db:start
npm run db:reset
npm run db:types:local
```

En PowerShell 5.x usa `;` en lugar de `&&`:

```powershell
npm run db:start; npm run db:reset; npm run db:types:local
```

## Scripts principales

```bash
npm run dev
npm run lint
npm run test
npm run build
```

## Scripts de documentaciÃ³n

```bash
npm run docs:install
npm run docs:dev
npm run docs:build
npm run docs:serve
npm run docs:deploy
```

## Docker

```bash
docker-compose up -d
docker-compose down
```

## Licencia

MIT
