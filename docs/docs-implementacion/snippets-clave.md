---
id: snippets-clave
title: Snippets de Código Clave
---

## 1) Gating inicial por setup

```tsx
if (!listo || verificando) {
  return <SetupWizard />;
}
```

`src/App.tsx` bloquea la app principal hasta validar conexión y tablas core.

## 2) Verificación de tablas en setup

```ts
const { error } = await supabase.from('profiles').select('id').limit(1);
resultado.profiles = !error;
```

Patrón usado en `src/services/setupService.ts` para `profiles`, `cvs`, `api_keys`, `ai_request_logs`.

## 3) Prioridad de API keys de IA

```ts
const keyTemporal = obtenerKeyTemporal();
if (keyTemporal) return { source: 'temporal', ... };

const keyGuardada = await obtenerKeyGuardadaActiva();
if (keyGuardada) return { source: 'saved', ... };
```

Implementado en `src/services/aiService.ts`.

## 4) Persistencia de CVs por usuario

`useCVs` aplica operaciones CRUD sobre tabla `cvs` asociadas al usuario autenticado.

## 5) Exportación de CV

`src/pages/Index.tsx` implementa:

- PDF carta (paginado A4)
- PDF continuo (una sola página)
- PNG (imagen completa)

Todos los flujos reutilizan la captura del CV renderizado antes de generar archivo.
