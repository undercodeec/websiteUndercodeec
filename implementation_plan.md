 Continúa trabajando en el proyecto:

  D:\Documentos\undercodeec_nextjs

  Lee primero:
  D:\Documentos\undercodeec_nextjs\plan_migracion_sin_react.md

  Estamos modernizando visualmente la página:
  src/app/marketing-para-tu-negocio

  Estado actual:

  - El header ya fue migrado para usar `PrimaryHeader`.
  - El antiguo `StartupNav` fue eliminado del hero.
  - El hero fue reconstruido en:
    - src/components/Marketing/MarketingHero.jsx
    - src/components/Marketing/MarketingHero.module.css
  - El hero utiliza `PrimaryOrb`, GSAP, animación por caracteres, responsive y `prefers-reduced-motion`.
  - El botón del hero fue eliminado.
  - Su H1 sigue el estilo de `src/app/aplicaciones-moviles`.
  - El texto descriptivo y el H1 usan el efecto de mezcla con la burbuja.
  - El build de producción finalizó correctamente.

  Lo siguiente es migrar todas las secciones posteriores al hero de `marketing-para-tu-negocio`.

  Actualmente la página carga componentes antiguos:

  - `Blog` de `src/components/Startup/Blog`
  - `Clients` de `src/components/Startup/Clients`
  - `Numbers` de `src/components/Startup/Numbers`
  - `Contact` de `src/components/Startup/Contact`
  - `Footer` de `src/components/Startup/Footer`

  Objetivo:

  1. Auditar el contenido y comportamiento de cada sección.
  2. Sustituir sus estilos antiguos por el sistema visual utilizado en:
     - `src/app/servicios`
     - `src/app/aplicaciones-moviles`
  3. Reutilizar componentes, tokens, retícula, tipografía, colores y animaciones existentes siempre que
  sea posible.
  4. Crear componentes específicos de Marketing solo cuando el contenido lo requiera.
  5. Mantener intactos el `PrimaryHeader` y el hero ya implementado.
  6. Eliminar gradualmente dependencias visuales antiguas como `home-style-6`, Bootstrap, Tailwind y
  estilos Startup, pero solo cuando todas las secciones dependientes hayan sido sustituidas.
  7. Conservar contenido, SEO, enlaces, accesibilidad y el formulario de marketing. Verificar
  especialmente el endpoint `/api/send-marketing`.
  8. Evitar saltos de línea entre letras: las animaciones por caracteres deben agrupar las letras por
  palabras.
  9. Implementar limpieza completa de GSAP/listeners y soporte para `prefers-reduced-motion`.
  10. Validar responsive a 1440, 768 y 390 px.
  11. Ejecutar lint focalizado, `git diff --check` y `pnpm build`.

  Trabaja de forma incremental empezando por la primera sección inmediatamente posterior al hero. Antes
  de modificarla, compara su contenido actual con las secciones equivalentes de Servicios y Aplicaciones
  móviles.

  Importante:

  - Hay cambios sin commit de trabajos anteriores, incluidos archivos de Aplicaciones móviles. Deben
  conservarse y no sobrescribirse.
  - No hagas commit hasta que se solicite explícitamente.
  - El trabajo actual sigue siendo incremental dentro de Next.js; no crees todavía la aplicación Astro
  salvo que se solicite expresamente.
