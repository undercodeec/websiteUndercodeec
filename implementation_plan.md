Sí: el mejor enfoque es construir el nuevo sitio en una carpeta independiente dentro del repositorio, pero no dentro de
  public/landing-primary.

  Mi recomendación concreta es crear:

  undercodeec_nextjs/
  ├── apps/
  │   └── web-v2/              # Nuevo sitio público
  ├── src/                     # Next.js actual, se mantiene intacto
  ├── backend/                 # Backend actual
  ├── public/
  │   └── landing-primary/     # Referencia visual temporal
  └── desing/                  # Exportación original de referencia

  Para apps/web-v2 usaría Astro, no React puro. Astro permite conservar casi exactamente la estructura HTML, clases CSS y
  JavaScript nativo de landing-primary, pero agregando componentes, rutas, SEO y contenido estructurado sin introducir
  hidratación React innecesaria.

  ## Por qué no conviene continuar replicándolo en React

  landing-primary depende de mucho más que sus colores y CSS:

  - Estructura HTML y clases específicas de Webflow.
  - Selectores y atributos personalizados.
  - GSAP y ScrollTrigger.
  - Navegación tipo Taxi.
  - WebGL/Three.
  - Código Webflow y jQuery.
  - Orden específico de carga e inicialización.

  Al transformar esa estructura en JSX, aunque visualmente parezca equivalente, cambian el DOM, los tiempos de montaje y el
  ciclo de inicialización. Por eso las animaciones y proporciones no llegan a coincidir con precisión.

  Además, el layout principal de Next carga Bootstrap y los estilos históricos globalmente. Mantener el nuevo sitio como
  aplicación separada evitará contaminación entre ambos sistemas visuales.

  ## landing-primary debe ser referencia, no código fuente

  Actualmente /D:/Documentos/undercodeec_nextjs/scripts/offbrand-demo/prepare.mjs elimina public/landing-primary y vuelve a
  generarlo desde desing/saveweb2zip-....

  Por tanto:

  - No desarrollar nuevas páginas directamente allí.
  - No guardar cambios manuales importantes en esa carpeta.
  - No reutilizarla como dependencia en producción.
  - Conservarla como referencia visual para comparaciones.

  El rewrite actual de /D:/Documentos/undercodeec_nextjs/next.config.ts ya envía / y /demos a ese HTML estático. Puede
  permanecer así mientras se construye la nueva versión.

  ## Arquitectura recomendada para web-v2

  apps/web-v2/
  ├── package.json
  ├── astro.config.mjs
  ├── public/
  │   ├── fonts/
  │   ├── images/
  │   ├── videos/
  │   └── icons/
  └── src/
      ├── layouts/
      │   └── SiteLayout.astro
      ├── components/
      │   ├── global/
      │   │   ├── Header.astro
      │   │   ├── Footer.astro
      │   │   ├── Cursor.astro
      │   │   └── Preloader.astro
      │   └── sections/
      ├── content/
      │   ├── pages/
      │   ├── services/
      │   ├── projects/
      │   └── blog/
      ├── scripts/
      │   ├── animations/
      │   ├── navigation/
      │   └── forms/
      ├── styles/
      │   ├── tokens.css
      │   ├── global.css
      │   ├── components.css
      │   └── vendor/
      └── pages/
          ├── index.astro
          ├── servicios.astro
          ├── contacto.astro
          └── blog/

  Las clases y la estructura visual de landing-primary se pueden portar prácticamente sin cambios a archivos .astro. La
  interactividad se implementa como módulos JavaScript separados.

  ## Separar contenido y presentación

  No conviene importar directamente componentes del React anterior. El proceso correcto sería:

  1. Extraer textos, títulos, metadata, enlaces y listas.
  2. Identificar solamente los recursos multimedia utilizados.
  3. Convertir el contenido a JSON, Markdown o colecciones de Astro.
  4. Copiar únicamente los recursos seleccionados a web-v2/public.
  5. reconstruir cada página usando componentes y estilos del nuevo sistema.

  Ejemplo:

  {
    "slug": "aplicaciones-moviles",
    "seo": {
      "title": "Desarrollo de aplicaciones móviles",
      "description": "..."
    },
    "hero": {
      "eyebrow": "Aplicaciones móviles",
      "title": "Creamos productos móviles...",
      "image": "/images/services/apps.webp"
    },
    "sections": []
  }

  Así React deja de ser una dependencia. Solo funciona como fuente temporal de contenido.

  Esto también es importante porque el public actual contiene aproximadamente:

  - assets: 198 MB.
  - modelo-3D: 133 MB.
  - landing-preview: 35 MB.

  No se debería copiar todo. Hay que crear un inventario y llevar al nuevo sitio exclusivamente los archivos realmente
  usados, optimizados a WebP/AVIF y con diferentes tamaños cuando corresponda.

  ## Orden de migración

  Sugiero esta secuencia:

   Etapa    Trabajo
  ━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1        Congelar landing-primary como referencia y capturar desktop, tablet y móvil
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   2        Crear apps/web-v2 y el sistema global: fuentes, variables, grid, header, footer, tema, cursor y preloader
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   3        Reconstruir la portada con el mismo HTML visual, eliminando los parches que modifican el DOM después de cargar
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   4        Migrar /servicios como primera página interior y validar el sistema reutilizable
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   5        Migrar /contacto y conectar el formulario al backend existente
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   6        Migrar trayectoria, aplicaciones móviles, software, marketing, hosting y recursos humanos
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   7        Migrar blog/noticias usando Markdown o colecciones de contenido
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   8        Añadir SEO, sitemap, redirects, analítica y pruebas
  ───────  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────
   9        Publicar en un subdominio de prueba y cambiar el dominio cuando esté validado

  La portada y /servicios son las dos páginas piloto correctas: una valida las animaciones complejas y la otra valida si el
  lenguaje visual puede reutilizarse en páginas nuevas.

  ## Qué permanecería fuera del rediseño inicialmente

  Estas rutas no son simples páginas de contenido y deberían mantenerse en Next hasta una fase posterior:

  - /admin/**
  - /portal
  - /contratos
  - /pago/resultado
  - /api/**

  Pueden continuar en el proyecto existente o publicarse posteriormente en un subdominio como admin.undercodeec.com. No
  conviene mezclar su migración con el rediseño comercial.

  ## Estrategia de publicación progresiva

  Durante el desarrollo:

  www.undercodeec.com       → sitio actual
  v2.undercodeec.com        → nuevo Astro
  admin.undercodeec.com     → Next/CRM, si se decide separarlo
  api.undercodeec.com       → backend

  También se pueden habilitar rutas nuevas de una en una mediante proxy, pero para evitar inconsistencias de navegación y
  estilos es más seguro publicar primero todo web-v2 en un dominio de preview y hacer el cambio completo al final.

  ## Control de precisión visual

  Para cada página se debería exigir:

  - Comparación de capturas a 1440, 768 y 390 px.
  - Misma tipografía, tamaños, espaciados y cuadrícula.
  - Validación de animaciones y scroll.
  - Navegación mediante teclado y prefers-reduced-motion.
  - Formularios y enlaces reales funcionando.
  - Metadata, canonical y datos estructurados.
  - Lighthouse y control del peso multimedia.
  - Ninguna dependencia accidental del CSS histórico de React.

  La idea central es: conservar temporalmente el HTML/CSS original para obtener fidelidad, pero convertir progresivamente
  sus piezas en componentes propios y mantenibles. El /D:/Documentos/undercodeec_nextjs/public/landing-primary/js/demo-
  local.js actual modifica textos, imágenes, enlaces y secciones después de cargar; en web-v2 esos datos deberían
  renderizarse directamente desde Astro.

  Antes de publicar también conviene confirmar que se poseen los derechos para reutilizar el diseño, tipografía, CSS,
  scripts y animaciones provenientes de la exportación de OFF+BRAND.

  No realicé modificaciones en el repositorio durante este diagnóstico.