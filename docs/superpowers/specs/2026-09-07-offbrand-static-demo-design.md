# Diseño: demo estático e independiente de Off+Brand

Fecha: 2026-09-07

## Objetivo

Reconstruir `/demos/` como un micrositio estático aislado que reproduzca con alta fidelidad la página suministrada en:

`D:\Documentos\undercodeec_nextjs\desing\saveweb2zip-com-www-itsoffbrand-com`

La exportación entregada será la única fuente visual y multimedia. La demo no reutilizará componentes, datos, imágenes, tipografías, estilos ni comportamientos del sitio principal de Undercodeec.

## Alcance

La entrega comprende la página principal incluida en la exportación, disponible en `/demos/`, con:

- estructura, textos, composición, tipografía, colores, espaciado y animaciones basados en el HTML y CSS originales;
- imágenes, SVG, fuente WOFF2 y video local provenientes exclusivamente de la carpeta entregada;
- comportamiento responsive para escritorio y móvil según los breakpoints originales;
- aislamiento total del encabezado, banner promocional, asistente, cursor, transición y pie globales de la aplicación;
- eliminación de analítica, rastreo y dependencias de red que no sean necesarias para representar la demo.

Quedan fuera de alcance las páginas internas enlazadas, el procesamiento real de formularios y cualquier integración externa del sitio original.

## Arquitectura elegida

La demo se servirá como documento HTML estático, no como una recreación React del diseño.

1. Se copiará una versión saneada de la exportación a `public/demos-offbrand/`.
2. El documento principal será `public/demos-offbrand/index.html`.
3. El HTML incluirá `<base href="/demos-offbrand/">` para que todas las rutas relativas resuelvan dentro del espacio de recursos aislado.
4. `next.config.ts` incorporará una reescritura interna desde `/demos` y `/demos/` hacia `/demos-offbrand/index.html`.
5. La URL visible para el usuario seguirá siendo `/demos/`; `demos-offbrand` será únicamente el espacio interno de archivos públicos.

Esta arquitectura conserva la composición original y evita que el documento atraviese `src/app/layout.tsx`. Por ello, ninguna interfaz global de Undercodeec podrá aparecer dentro de la demo.

## Contenido y fidelidad visual

Se conservarán del material fuente:

- la navegación y el encabezado propios de Off+Brand;
- las secciones “A Different Creative Approach”, “With Emotion + Innovation”, “Trusted by Leaders”, “Featured Work”, reconocimientos, llamada final y pie de página;
- las composiciones de proyectos como Microsoft Windows, Trevor Noah, Lando Norris, Vizcom y las demás incluidas en la exportación;
- la fuente local `AtAero-Retina-dot-edit.woff2`;
- todos los recursos gráficos locales y el MP4 disponible;
- el CSS original como base de verdad para tamaños, posiciones, grillas y puntos de quiebre.

Las modificaciones al marcado y a los estilos se limitarán a corregir rutas, retirar dependencias externas, neutralizar funciones ajenas al demo y mantener la representación local. No se introducirán imágenes de `src/data/Preview`, recursos existentes de `public/` ni componentes visuales del proyecto principal.

## Saneamiento y comportamiento

Antes de publicar la copia se retirarán:

- Google Analytics y cualquier etiqueta de medición;
- Intellimize y scripts de experimentación o personalización;
- precargas, conexiones y llamadas a dominios de rastreo;
- el script remoto del orb y otras dependencias JavaScript externas;
- referencias HLS remotas de Cloudflare u otros proveedores;
- insignias, formularios o scripts de Webflow que transmitan datos o dependan de servicios externos.

Se mantendrá solamente JavaScript local que sea indispensable para interacciones visibles y que funcione sin solicitudes externas. Si una animación depende exclusivamente de un servicio remoto, se sustituirá por una presentación estática equivalente usando el recurso local más cercano. El video local podrá reproducirse con controles y atributos seguros, sin telemetría.

Los enlaces internos del sitio original que no existan dentro de esta demo se neutralizarán para evitar navegación a páginas incompletas. Los controles decorativos conservarán su apariencia sin ejecutar acciones externas.

## Cambios sobre la implementación actual

La página React actual de `/demos` y su módulo CSS son una implementación descartada y se retirarán durante la ejecución del plan. También se reemplazarán sus expectativas de prueba.

Las exclusiones añadidas previamente a componentes globales se revertirán cuando ya no sean necesarias, porque la reescritura estática evita por arquitectura que el documento use el layout de Next.js. La reversión se limitará a los cambios de esta rama y no tocará modificaciones ajenas del usuario.

## Pruebas y criterios de aceptación

La implementación se hará guiada por una prueba de integración que inicialmente falle y después verifique:

- `/demos/` responde correctamente y conserva la URL pública esperada;
- el HTML contiene el título y encabezados representativos de la exportación original;
- las rutas de fuente, imágenes, SVG y video apuntan únicamente a `/demos-offbrand/`;
- una muestra representativa de cada tipo de recurso devuelve `200` y el tipo MIME correcto;
- no aparecen textos, selectores ni scripts del banner, asistente, cursor o transiciones globales;
- no quedan referencias a Google Analytics, Intellimize, Cloudflare HLS, el orb remoto u otros rastreadores;
- el documento no solicita recursos visuales del resto del proyecto.

Además se ejecutarán:

- prueba específica de la ruta estática;
- comprobación de tipos con `pnpm exec tsc --noEmit`;
- lint del proyecto;
- compilación de producción;
- inspección visual de escritorio y móvil contra la exportación suministrada.

## Manejo de errores y límites operativos

- Toda referencia local incluida en el HTML deberá existir; una referencia rota hará fallar la prueba de integración.
- Las rutas desconocidas dentro de la demo no simularán páginas que no fueron entregadas.
- El micrositio funcionará sin conexión a terceros después de cargarlo desde el servidor local.
- Los recursos permanecerán bajo un prefijo propio para impedir colisiones con archivos del sitio principal.

## Resultado esperado

Al abrir `http://localhost:<puerto>/demos/`, el usuario verá la página Off+Brand suministrada, con sus propios recursos y composición, sin elementos visuales de Undercodeec y sin dependencias externas de rastreo. La demo seguirá formando parte del mismo despliegue Next.js, pero será independiente en presentación, recursos y ejecución.
