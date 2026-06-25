Quiero que construyas una réplica funcional del estilo de animaciones del home actual de https://animejs.com/, sin copiar texto, branding, logos ni contenido exacto, pero sí replicando la experiencia visual, el ritmo, la arquitectura de motion y la sensación general del sitio.

OBJETIVO
Crear una landing page original inspirada en el home actual de Anime.js, con animaciones avanzadas sincronizadas con scroll. Debe sentirse como una experiencia premium de motion design para web: secciones narrativas, entradas fluidas, falso 3D con CSS transforms, timelines orquestadas, stagger avanzado, transiciones suaves y escenas SVG animadas. El resultado debe verse moderno, técnico y altamente interactivo.

IMPORTANTE
- No copies contenido textual ni assets del sitio original.
- Sí replica el comportamiento y la lógica de motion.
- Usa Anime.js v4 como librería principal.
- Entrega código limpio, modular y listo para producción.
- Si necesitas crear placeholders visuales, hazlos originales.
- Prioriza performance, accesibilidad y responsive.

STACK
- HTML, CSS y JavaScript vanilla o Vite + JS.
- Anime.js v4.
- Sin frameworks pesados.
- Si hace falta, puedes usar SVG inline para escenas animadas.
- No uses GSAP salvo que sea estrictamente necesario; la prioridad es Anime.js.

ARQUITECTURA QUE QUIERO REPLICAR
Basándote en el home actual de Anime.js, la página debe organizarse por secciones/escenas verticales con scroll narrativo. Quiero que implementes una estructura inspirada en estas ideas observables del sitio:

1. Hero inmersivo
- Un hero de pantalla completa.
- Tipografía grande y layout editorial/técnico.
- Elementos decorativos animados desde el primer render.
- Entrada inicial con timeline.
- Fondo con profundidad visual, pero sin exagerar.
- Aparición por capas con opacity, translate y rotate sutil.

2. Secciones activadas por scroll
- Cada bloque debe activarse al entrar al viewport.
- Usa onScroll() de Anime.js.
- Usa sync: true o sync con valor decimal donde convenga.
- Configura thresholds enter/leave por sección.
- Cada sección debe tener comportamiento distinto, no repetitivo.

3. Falso 3D
- Quiero sensación 3D con CSS:
  - perspective
  - transform-style: preserve-3d
  - rotateX
  - rotateY
  - translateZ
  - scale
- Debe parecer profundo y técnico, pero elegante.
- Evita efectos toscos o caricaturescos.

4. Composición avanzada de transforms
- Anima transforms individuales y compuestos.
- Mezcla translate, rotate, scale y opacity.
- Aprovecha la idea de “enhanced transforms” que el sitio enfatiza.
- Usa easing refinado y movimiento suave.

5. Timelines complejas
- No quiero animaciones aisladas; quiero escenas coordinadas.
- Usa createTimeline() para secuencias por sección.
- Sincroniza títulos, fondos, tarjetas, líneas y elementos decorativos.
- Usa offsets bien pensados para superposición temporal.

6. Stagger avanzado
- Crea grids o grupos de elementos que entren con stagger.
- Usa stagger espacial desde centro o bordes.
- Úsalo tanto para tiempo como para valores.
- Quiero al menos una sección donde el stagger sea protagonista visual.

7. SVG animado
- Incluye una o dos escenas con SVG inline original.
- Una escena debe simular “line drawing” con createDrawable() o equivalente en Anime.js.
- Otra puede usar morphing o motion path si aporta valor.
- No copies ningún SVG del sitio original; diseña uno nuevo pero con una intención similar de demo técnica.

8. Scroll storytelling
- La página debe sentirse como un recorrido.
- Cada sección debe aportar una técnica diferente:
  - intro reveal
  - cards 3D
  - grid stagger
  - líneas SVG
  - contador o dial técnico
  - CTA final animado
- Mantén continuidad visual entre secciones.

9. Responsive y media queries
- Debe funcionar en desktop y mobile.
- Usa createScope() o mediaQueries si lo ves útil.
- En mobile, reduce complejidad visual pero conserva calidad.
- Respeta prefers-reduced-motion.

10. Performance y buenas prácticas
- Usa will-change solo donde valga la pena.
- Evita jank en scroll.
- Usa transforms y opacity antes que propiedades costosas.
- Estructura el código para mantenimiento.
- Separa claramente:
  - setup global
  - helpers
  - escenas
  - observadores scroll
  - responsive behavior

ENTREGABLES
Quiero que generes:
1. Estructura de carpetas.
2. HTML completo.
3. CSS completo.
4. JavaScript completo.
5. Explicación breve de cómo está organizada la lógica.
6. Instrucciones para correr el proyecto.
7. Comentarios mínimos pero útiles en el código.

REQUISITOS DE DISEÑO
- Estética oscura o neutra sofisticada.
- Aire técnico/editorial.
- Tipografía moderna.
- Mucho espacio negativo.
- Detalles geométricos y motion limpio.
- Nada de estilo genérico “SaaS template”.
- Nada de blobs, gradientes morados típicos ni efectos AI genéricos.
- El diseño debe sentirse premium, experimental y preciso.

REQUISITOS TÉCNICOS DE IMPLEMENTACIÓN
- Usa Anime.js v4 y sus APIs modernas.
- Implementa escenas con onScroll().
- Usa createTimeline() donde corresponda.
- Usa stagger() en al menos dos secciones.
- Usa al menos una escena SVG animada.
- Usa perspectiva y preserve-3d para tarjetas o paneles.
- Implementa una transición inicial de hero al cargar.
- Añade una sección final con CTA animado y microinteracciones.

ESTRUCTURA SUGERIDA DE SECCIONES
Puedes usar algo como esto, pero mejorarlo si tienes una propuesta superior:
- Hero
- Toolbox / capacidades
- Transform composition demo
- Scroll-driven cards 3D
- Stagger grid
- SVG drawing scene
- Technical dial / ticker scene
- Responsive behavior scene
- Final CTA

DETALLE CLAVE
No quiero una landing estática con fades repetidos. Quiero una experiencia motion-heavy, inspirada claramente en el comportamiento del home de Anime.js, donde el scroll controla escenas complejas y varias capas visuales.

ANTES DE CODIFICAR
1. Resume en 8-12 puntos la arquitectura visual y técnica que vas a implementar.
2. Explica cómo vas a mapear cada sección a una técnica de Anime.js.
3. Después genera el proyecto completo.

SI DECIDES USAR VITE
- Déjalo listo con package.json.
- Usa imports correctos de Anime.js.
- Mantén todo simple de correr.