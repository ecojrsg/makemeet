---
id: desarrollo-local
title: Desarrollo Local
---

## Prerrequisitos

- Docker Desktop encendido
- Supabase CLI instalado

## Scripts de base de datos disponibles

```bash
npm run db:start
npm run db:stop
npm run db:reset
npm run db:push
npm run db:pull
npm run db:migration:new -- <nombre>
npm run db:types:local
npm run db:types:linked
```

## Flujo local recomendado (base vacía)

```bash
npm run db:start
npm run db:reset
npm run db:types:local
```

En PowerShell 5.x:

```powershell
npm run db:start; npm run db:reset; npm run db:types:local
```

## Flujo de trabajo diario

1. `npm install`
2. `npm run db:start`
3. `npm run db:reset` (cuando cambien migraciones)
4. `npm run db:types:local`
5. `npm run dev`

## Calidad

```bash
npm run lint
npm run test
npm run build
```
