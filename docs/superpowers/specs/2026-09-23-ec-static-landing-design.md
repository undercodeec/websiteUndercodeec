# Landing estática para Ecuador (`/ec/`)

## Objetivo

Convertir la landing de Ecuador en una página HTML semántica y estática. La
ruta debe poder visualizarse en producción, sin estilos específicos de la
landing, animaciones, video ni elementos decorativos interactivos. El alcance
SEO se limita a Ecuador, Quito y Guayaquil en el trabajo posterior solicitado
por el propietario.

## Estado actual

`src/app/ec/layout.tsx` ejecuta `notFound()` en producción. La página monta
`PreviewLayout`, `LandingEcuador` y el `Footer` visual. `LandingEcuador` reúne
animaciones de Anime.js, canvas, efectos de scroll, un video, estilos inline y
componentes con estilos propios.

Las secciones que se retirarán por completo incluyen:

- El video (`VideoShowcase`).
- La sección `.pin-section` (`ScrollPinShowcase`).
- La sección `.thanos-pin-section` (`ThanosTextSection`).
- La línea de tiempo apilada (`StackTimeline`).

## Diseño

### Ruta y composición

`src/app/ec/page.tsx` renderizará directamente la landing estática. No usará
`PreviewLayout`, `Footer`, efectos del `body` ni el ajuste de hojas de estilo.
La página dejará de ser un componente cliente salvo que una acción imprescindible
requiera JavaScript; ninguna acción de esta landing lo necesita.

`src/app/ec/layout.tsx` dejará de bloquear la ruta en producción. Mantendrá la
metadata y los datos de ubicación actuales hasta que se inicie el trabajo SEO.
También se mantendrá temporalmente la directiva `noindex`, la exclusión del
sitemap y el canonical existentes: habilitar la visualización no implica
publicar la página para indexación.

### Contenido

`LandingEcuador` se reemplazará por una implementación breve y sin estilos,
clases de presentación ni animaciones. Conservará la información útil de la
landing mediante elementos HTML nativos:

1. Encabezado con propuesta de valor para Ecuador, Quito y Guayaquil, junto a
   enlaces de presupuesto y portafolio.
2. Indicadores de experiencia como lista con valores finales, sin contadores.
3. Servicios como lista, con sus características visibles sin paneles hover ni
   partículas.
4. Planes y precios como artículos con sus enlaces de WhatsApp.
5. Preguntas frecuentes con `details` y `summary`, abiertas y cerradas por el
   navegador sin estado React ni estilos.
6. Comparativa mediante una tabla HTML accesible, sin iconos SVG ni efectos de
   entrada.
7. Contacto final mediante enlaces de WhatsApp y teléfono.

Se conservarán los cuatro JSON-LD existentes (Organization, ProfessionalService,
Service y FAQPage), los textos, precios, datos de contacto y destinos de los
enlaces. Las acciones de analítica de los clics se retirarán, ya que requieren
JavaScript específico de la landing y no cambian la capacidad del visitante de
contactar o navegar.

### Eliminaciones técnicas

La implementación eliminará el uso de `animejs`, `useRouter`, estados y efectos
React, canvas, observadores de intersección, video, estilos globales y en línea,
clases de Bootstrap/Tailwind de la landing y los imports de los cuatro
componentes visuales. `CompetenceTable` se sustituirá por una tabla nativa o se
integrará como marcado estático para que no quede ningún estilo o animación de
esa sección.

Los componentes de demostración retirados no se borrarán del repositorio porque
podrían usarse como referencia en otras rutas. Solo se eliminarán sus referencias
desde `/ec/`.

### Errores y accesibilidad

Los destinos externos abrirán en otra pestaña con `rel="noopener noreferrer"`.
Las imágenes decorativas y el video desaparecerán. Todos los enlaces tendrán
texto visible; la tabla incluirá encabezados de columna y las preguntas podrán
operarse con los controles nativos del navegador.

## Verificación

Se añadirá una prueba de integración de la ruta que se ejecute en entorno de
producción y compruebe que `/ec/` responde correctamente, que muestra el H1 y
que no incluye el video ni las secciones retiradas. Antes del cambio la prueba
fallará porque la ruta responde como no encontrada; luego deberá pasar. Se
ejecutarán la suite de pruebas, el linter y el build de producción.

## Fuera de alcance

- Modificar las keywords, metadata, canonical, robots o sitemap para indexación.
- Rediseñar la landing o añadir CSS nuevo.
- Cambiar componentes de otras rutas.
- Eliminar archivos visuales no referenciados fuera de `/ec/`.
