---
id: api-keys-ia
title: API Keys de IA
---

## Tipos de key soportados

- Temporal (`sessionStorage`): solo sesión actual.
- Guardada (`public.api_keys`): persistente por usuario.

## Prioridad efectiva de uso

Orden real en runtime (`src/services/aiService.ts`):

1. Key temporal en `sessionStorage` (`temp_api_key`).
2. Key guardada activa (`activa = true`) en Supabase.
3. Si no hay ninguna, IA no disponible.

## Gestión desde UI

En `/setup` (`APIKeyManager` + `AddAPIKeyDialog`):

- Crear key guardada o temporal.
- Probar key antes de guardar.
- Activar key guardada.
- Eliminar key temporal o guardada.

## Tablas involucradas

- `api_keys`: keys guardadas por usuario.
- `ai_request_logs`: auditoría de solicitudes/respuestas de IA.

## Consideraciones de seguridad

- No guardar API keys en variables `VITE_`.
- No commitear keys en repo.
- Mantener RLS activo para aislamiento por usuario.
