---
id: intro
title: Introducción
---

Esta sección documenta la implementación técnica de MakeMeEt.

## Qué cubre

- Instalación detallada para Supabase SaaS.
- Instalación detallada para Supabase self-hosted.
- Flujo de desarrollo local con Supabase CLI.
- Estructura del proyecto y responsabilidades por capa.
- Snippets de código clave para setup, IA, persistencia y exportación.
- Configuración y prioridad de API keys de IA.

## Flujo recomendado del equipo

1. Configurar entorno (`.env`) y dependencias.
2. Inicializar base de datos con migraciones versionadas.
3. Generar tipos de Supabase.
4. Levantar frontend y validar `/setup`.

> La fuente de verdad de base de datos es `supabase/migrations/20260307190000_init.sql`.
