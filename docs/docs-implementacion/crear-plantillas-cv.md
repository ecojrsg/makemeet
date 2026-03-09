---
id: crear-plantillas-cv
title: Crear Plantillas de CV
---

Esta guía explica cómo están construidas las plantillas de CV en MakeMeEt y qué debe hacer una persona contribuidora para agregar una nueva sin romper el flujo de vista previa ni la exportación.

## Propósito y alcance

Una plantilla en MakeMeEt no es solo un componente visual. También forma parte de:

- la vista previa estilizada dentro de la aplicación
- la captura del CV renderizado para exportación
- el selector lateral de plantillas
- la configuración central de tipos y colores

Esta página está pensada para contribuidores técnicos. El manual de usuario solo cubre cómo cambiar entre plantillas existentes.

## Dónde vive la funcionalidad

Las piezas principales del sistema actual son:

| Pieza | Responsabilidad |
| --- | --- |
| `src/components/templates/` | Componentes React de cada plantilla |
| `src/components/templates/index.ts` | Exportaciones centralizadas de plantillas |
| `src/types/templates.ts` | Tipo `TipoPlantilla`, contrato `PlantillaProps` y metadata del selector |
| `src/config/templateColors.ts` | Paletas y gradientes reutilizados |
| `src/pages/Index.tsx` | Render de preview y exportación PDF/PNG |
| `src/components/cv/SelectorPlantilla.tsx` y `src/components/cv/SidebarPanel.tsx` | UI para elegir la plantilla activa |

## Librerías involucradas

Estas son las librerías que participan directamente en el flujo de plantillas:

- `react`: render de los componentes de plantilla
- `react-dom`: montaje temporal de una plantilla para exportación en `Index.tsx`
- `lucide-react`: iconografía dentro de algunas plantillas
- `html2canvas-pro`: captura del HTML renderizado como canvas
- `jspdf`: generación de PDF paginado o continuo a partir del canvas

Las plantillas deben ser compatibles con ese flujo de captura. Cualquier decisión visual debe considerar que el HTML terminará convertido a imagen para exportación.

## Contrato técnico obligatorio

Toda plantilla nueva debe respetar estas reglas:

### 1. Exportar un componente React basado en `PlantillaProps`

El contrato compartido vive en `src/types/templates.ts`:

```ts
export interface PlantillaProps {
  datos: CVData;
  perfilGithub: GitHubProfile | null;
  reposGithub: GitHubRepo[];
  mode?: 'preview' | 'export';
}
```

Eso obliga a que la plantilla pueda renderizar:

- información principal del CV desde `datos`
- bloque opcional de GitHub desde `perfilGithub`
- dos modos de render: `preview` y `export`

### 2. Renderizar una raíz con `id="styled-cv"`

`src/pages/Index.tsx` busca ese nodo para clonarlo y capturarlo durante la exportación. Si se omite o se cambia, el flujo de exportación deja de ser confiable.

### 3. Usar estilos inline, no Tailwind

Las plantillas bajo `src/components/templates/` deben usar `style={{ ... }}`. Esto reduce inconsistencias durante la captura de HTML para exportación y mantiene el comportamiento alineado con el resto del proyecto.

### 4. Soportar dimensiones coherentes para A4

El patrón actual usa:

```tsx
style={{
  width: esExportacion ? '210mm' : '100%',
  minHeight: esExportacion ? '297mm' : '100%',
  height: esExportacion ? 'auto' : '100%',
}}
```

`preview` puede adaptarse al contenedor visible. `export` debe conservar medidas A4 razonables para PDF y PNG.

### 5. Degradar correctamente cuando falten datos

Una plantilla no debe asumir que siempre habrá:

- foto
- resumen profesional
- idiomas
- habilidades
- perfil de GitHub

Cada sección opcional debe renderizarse solo si existen datos suficientes.

## Cómo funciona hoy el flujo de preview y exportación

`src/pages/Index.tsx` usa `plantillaActual` para decidir qué componente renderizar:

- en la vista previa dentro de la app
- en un contenedor temporal oculto cuando se exporta

Durante la exportación ocurre este flujo:

1. Se crea un contenedor temporal fuera de pantalla.
2. Se renderiza la plantilla activa con `mode="export"`.
3. Se localiza el nodo `#styled-cv`.
4. Se clona ese HTML.
5. `html2canvas-pro` convierte el resultado a canvas.
6. `jspdf` genera el PDF o se exporta imagen PNG.

Por eso una plantilla nueva debe ser visualmente estable y no depender de comportamiento CSS frágil.

## Paso a paso para agregar una plantilla nueva

### 1. Crear el componente

Crea un archivo nuevo dentro de `src/components/templates/`, por ejemplo:

```text
src/components/templates/PlantillaEjecutiva.tsx
```

Usa la misma convención que las plantillas actuales:

- nombre de archivo en PascalCase
- export nombrado
- `PlantillaProps` como contrato de entrada

Esqueleto base:

```tsx
import { PlantillaProps } from '@/types/templates';
import { templateColors } from '@/config/templateColors';

export function PlantillaEjecutiva({ datos, perfilGithub, reposGithub, mode = 'preview' }: PlantillaProps) {
  const { personalInfo, experiences, education, skills, languages } = datos;
  const { primary: color } = templateColors.ejecutivo;
  const esExportacion = mode === 'export';

  return (
    <div
      id="styled-cv"
      style={{
        width: esExportacion ? '210mm' : '100%',
        minHeight: esExportacion ? '297mm' : '100%',
        height: esExportacion ? 'auto' : '100%',
        backgroundColor: '#ffffff',
        color: '#111827',
      }}
    >
      {/* contenido */}
    </div>
  );
}
```

### 2. Exportarla desde el índice de templates

Agregar la exportación en `src/components/templates/index.ts`:

```ts
export { PlantillaEjecutiva } from './PlantillaEjecutiva';
```

### 3. Registrar el nuevo tipo y la metadata

Actualizar `src/types/templates.ts`:

- agregar el nuevo valor al union type `TipoPlantilla`
- agregar la entrada correspondiente dentro de `PLANTILLAS`

La metadata de `PLANTILLAS` controla lo que se ve en el selector lateral:

- `id`
- `nombre`
- `descripcion`
- `colorPrimario`

### 4. Registrar su paleta

Agregar una clave nueva en `src/config/templateColors.ts` para centralizar:

- `primary`
- `secondary`
- `light`
- `gradient`
- `name`

Esto mantiene consistencia con el resto de plantillas y evita hardcodear colores duplicados en varios lugares.

### 5. Integrarla en `Index.tsx`

Actualmente `src/pages/Index.tsx` decide qué plantilla renderizar mediante condiciones por `plantillaActual`.

Debes agregar la nueva plantilla en:

- los imports del archivo
- la selección del componente para exportación en `captureStyledCV()`
- la vista previa estilizada en escritorio
- la vista previa estilizada en móvil

Si solo agregas el componente pero no actualizas estas ramas, la plantilla no aparecerá o no podrá exportarse.

### 6. Verificar el selector

`SelectorPlantilla` y `SidebarPanel` ya recorren `PLANTILLAS`. Si `TipoPlantilla` y `PLANTILLAS` quedan bien actualizados, el selector suele reflejar la nueva opción sin más cambios estructurales.

## Ejemplo detallado: `PlantillaModerna`

`PlantillaModerna` es una buena referencia porque cubre la mayoría de patrones que debe repetir una plantilla nueva.

### Qué hace bien como ejemplo base

- usa `PlantillaProps` sin lógica externa innecesaria
- toma colores desde `templateColors.moderno`
- diferencia `preview` y `export` con `esExportacion`
- define una raíz estable con `id="styled-cv"`
- renderiza secciones opcionales solo cuando hay datos
- protege bloques largos con `pageBreakInside: 'avoid'`
- integra el bloque GitHub sin volverlo obligatorio

### Estructura general

Su layout se divide en:

1. encabezado con gradiente, foto y datos de contacto
2. cuerpo principal con secciones apiladas
3. bloque opcional de GitHub al final

Ese patrón funciona bien porque:

- tiene una jerarquía visual clara
- soporta CVs cortos y medianos sin deformarse
- mantiene una captura predecible al exportar

### Decisiones técnicas que conviene reutilizar

#### Uso de colores centralizados

```tsx
const { primary: color, light: colorClaro, gradient } = templateColors.moderno;
```

Esto evita inconsistencias y hace más fácil revisar o cambiar la identidad visual de una plantilla.

#### Medidas condicionadas por modo

```tsx
const esExportacion = mode === 'export';
```

Después se usa para alternar entre ancho completo en preview y dimensiones A4 en exportación.

#### Secciones condicionales

```tsx
{personalInfo.summary && (
  <section>
    ...
  </section>
)}
```

Ese patrón debe repetirse en todas las secciones opcionales para que una plantilla no muestre contenedores vacíos.

#### Bloques protegidos contra cortes incómodos

```tsx
<div key={exp.id} style={{ pageBreakInside: 'avoid' }}>
```

Esto es especialmente importante para:

- experiencias
- educación
- tarjetas o bloques compactos
- paneles de GitHub

## Comparativa rápida de las plantillas actuales

| Plantilla | Estilo | Patrón de layout | Rasgo útil para reutilizar |
| --- | --- | --- | --- |
| Moderna | Profesional con acentos de color | Encabezado + cuerpo lineal | Buen equilibrio entre legibilidad y presencia visual |
| Clásica | Formal y editorial | Secciones tradicionales centradas | Referencia para diseños sobrios |
| Minimalista | Limpia y contenida | Flujo lineal con mucho espacio en blanco | Referencia para layouts discretos |
| Creativa | Más visual y asimétrica | Sidebar + contenido principal | Referencia para composiciones de dos columnas |

No hace falta que una plantilla nueva copie uno de estos estilos, pero sí debe conservar legibilidad, estabilidad al exportar y coherencia con el producto.

## Buenas prácticas visuales y de compatibilidad

Antes de abrir un PR, valida estas pautas:

- mantener lectura cómoda en A4 con tamaños de fuente y espaciados realistas
- evitar composiciones que dependan de Tailwind, pseudo-elementos o efectos CSS difíciles de capturar
- no asumir que siempre habrá contenido suficiente para llenar toda la página
- usar `pageBreakInside: 'avoid'` en elementos que no deban romperse entre páginas
- evitar bloques con alturas fijas innecesarias que recorten contenido en exportación
- mantener contraste suficiente entre texto y fondo
- si la plantilla usa foto, asegurar que funcione igual cuando no existe
- si muestra GitHub, no debe romper el layout cuando `perfilGithub` sea `null`

## Checklist para pull requests con nuevas plantillas

Una contribución de nueva plantilla debe incluir, como mínimo:

- componente nuevo dentro de `src/components/templates/`
- exportación en `src/components/templates/index.ts`
- actualización de `TipoPlantilla` y `PLANTILLAS` en `src/types/templates.ts`
- nueva paleta en `src/config/templateColors.ts`
- integración en preview y exportación dentro de `src/pages/Index.tsx`
- documentación actualizada si cambia el catálogo o el flujo

Además, antes de abrir el PR, se debe comprobar:

- la plantilla aparece en el selector y puede activarse
- la vista previa en escritorio se renderiza correctamente
- la vista previa en móvil se renderiza correctamente
- la exportación PDF funciona sin cortes inesperados
- la exportación PNG funciona correctamente
- un CV sin foto sigue viéndose bien
- un CV sin GitHub sigue viéndose bien
- un CV corto no deja el layout roto
- un CV largo no superpone bloques críticos
- las plantillas existentes no regresionan por cambios compartidos

## Qué suele romper una plantilla nueva

Los errores más comunes al integrar plantillas son:

- olvidar agregar el nuevo tipo al union `TipoPlantilla`
- registrar el tipo pero no añadir la rama correspondiente en `Index.tsx`
- usar clases Tailwind dentro de la plantilla
- omitir `id="styled-cv"`
- diseñar solo para preview y no para exportación A4
- asumir datos opcionales siempre presentes

Si revisas esos puntos primero, la mayoría de problemas aparecen antes del PR y no durante revisión.