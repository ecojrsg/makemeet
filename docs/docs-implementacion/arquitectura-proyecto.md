---
id: arquitectura-proyecto
title: Estructura del Proyecto
---

## Capas principales

- `src/pages`: rutas (`Index`, `Setup`, `ResetPassword`, `NotFound`).
- `src/components`: UI y componentes de dominio (`cv`, `setup`, `auth`, `templates`).
- `src/contexts`: estado global (`AuthContext`, `SetupContext`).
- `src/hooks`: acceso a datos y lógica reusable (`useCVs`, `useAPIKeys`, `useGitHub`).
- `src/services`: lógica de integración (`setupService`, `aiService`).
- `src/integrations/supabase`: cliente y tipos generados.
- `supabase/migrations`: migraciones SQL versionadas.

## Flujo de arranque

1. `SetupProvider` valida conexión + tablas.
2. Si no está listo, se muestra `SetupWizard`.
3. Si está listo, se monta app principal con auth + rutas.

## Ruta de setup

La ruta `/setup` se usa como panel de diagnóstico y operación:

- Estado de conexión.
- Estado de tablas base.
- Guía de comandos CLI.
- Gestión de API keys de IA.
