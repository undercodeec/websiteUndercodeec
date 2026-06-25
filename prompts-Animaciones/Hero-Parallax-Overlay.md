ANIMACIÓN: Hero Parallax Overlay — "La sección sube y tapa el hero"

──────────────────────────────────────
QUÉ HACE
──────────────────────────────────────
Al cargar: se ve la imagen del hero a pantalla completa con texto encima.
Al hacer scroll: la siguiente sección sube desde abajo y se superpone
sobre la imagen, como si la tapara deslizándose. El texto del hero sube
y desaparece antes. La imagen del hero se desvanece justo cuando la
sección de contenido la cubre completamente.

El efecto es puro CSS de apilamiento + GSAP scrub.
No hay transformaciones en la imagen. No hay parallax en el fondo.
La magia está en el z-index y en el fade sincronizado con el scroll.

──────────────────────────────────────
ESTRUCTURA HTML (obligatoria)
──────────────────────────────────────

<!-- CAPA 1: imagen de fondo — fija, z-index bajo -->
<div id="hero-img" style="
  position: fixed;
  inset: 0;
  z-index: 1;
  background: url('foto.jpg') center center / cover no-repeat;
  will-change: opacity;
"></div>

<!-- CAPA 2: overlay de color — fijo, encima de la imagen -->
<div id="hero-overlay-color" style="
  position: fixed;
  inset: 0;
  z-index: 2;
  background: linear-gradient(120deg,
    rgba(0,0,0,.65) 0%,
    rgba(0,0,0,.30) 100%);
  pointer-events: none;
  will-change: opacity;
"></div>

<!-- CAPA 3: texto del hero — fijo, encima del overlay -->
<div id="hero-text" style="
  position: fixed;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  padding: 0 clamp(24px, 6vw, 90px) 14vh;
">
  <!-- título, subtítulo, etc. -->
</div>

<!-- CONTENIDO: z-index MAYOR — se desliza ENCIMA del hero -->
<main style="position: relative; z-index: 10;">

  <!-- ESPACIADOR: altura = 100vh, SIN fondo (el hero se ve aquí) -->
  <div id="hero-spacer" style="height: 100vh;"></div>

  <!-- PRIMERA SECCIÓN REAL: tiene fondo sólido → tapa la imagen -->
  <section id="primera-seccion" style="
    background: #FAF6F1;   /* ← debe tener fondo, no transparente */
    min-height: 100vh;
  ">
    <!-- contenido normal -->
  </section>

</main>

──────────────────────────────────────
CÓMO FUNCIONA EL APILAMIENTO
──────────────────────────────────────
hero-img          z-index: 1   → fijo, siempre al fondo
hero-overlay      z-index: 2   → fijo, encima de imagen
hero-text         z-index: 3   → fijo, encima del overlay
─────────────────────────────────────
main              z-index: 10  → fluye con el scroll
  hero-spacer     sin fondo    → el hero se ve "a través"
  primera-seccion fondo sólido → tapa la imagen al llegar

Al scrollear, main sube normalmente.
El spacer (transparente) pasa por encima del hero sin cubrirlo.
Cuando primera-seccion llega al viewport → la tapa físicamente
porque tiene fondo y z-index:10 > z-index:1.

──────────────────────────────────────
JAVASCRIPT — GSAP (las ~20 líneas clave)
──────────────────────────────────────
Dependencias CDN (pegar en <head>):
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

Código:
  gsap.registerPlugin(ScrollTrigger);

  // 1. TEXTO DEL HERO:
  //    Sube 80px y se desvanece mientras el usuario scrollea
  //    el spacer (antes de que llegue la primera sección).
  gsap.to('#hero-text', {
    opacity: 0,
    y: -80,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero-spacer',
      start: 'top top',      // empieza al primer pixel de scroll
      end:   'bottom 30%',   // termina antes de que acabe el spacer
      scrub: true,           // sincronizado 1:1 con el scroll
    },
  });

  // 2. IMAGEN + OVERLAY:
  //    Se desvanecen cuando la primera sección sube desde abajo.
  //    Empieza cuando el borde inferior de esa sección toca
  //    el borde inferior del viewport, termina cuando llega al top.
  gsap.to(['#hero-img', '#hero-overlay-color'], {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: '#primera-seccion',
      start: 'top bottom',   // sección entra por abajo del viewport
      end:   'top top',      // sección llega al tope del viewport
      scrub: true,
    },
  });

──────────────────────────────────────
PARÁMETROS AJUSTABLES
──────────────────────────────────────
Velocidad del fade del texto:
  end: 'bottom 30%'   → cambia 30% para que tarde más (50%) o menos (10%)

Velocidad del fade de imagen:
  start: 'top bottom' / end: 'top top'
  → si quieres que empiece antes: start: 'top 80%'
  → si quieres que dure más:      end: 'top -20%'

Distancia del texto al subir:
  y: -80   → aumentar para más drama, bajar para más sutil

scrub: true  → sincronizado con scroll (recomendado)
scrub: 1.5   → con inercia suave (0.5–2 = valor típico)

──────────────────────────────────────
REGLAS CRÍTICAS
──────────────────────────────────────
✓ La imagen DEBE ser position:fixed  (no sticky, no absolute)
✓ El main DEBE tener position:relative y z-index:10 o mayor
✓ El spacer NO debe tener background (debe ser transparente)
✓ La primera sección SÍ debe tener background sólido
✓ will-change:opacity en hero-img y overlay (performance)
✓ pointer-events:none en el texto fijo (no bloquea clicks)
✗ NO usar position:absolute en la imagen → no funcionaría
✗ NO poner z-index en el spacer → rompería el apilamiento
✗ NO animar transform:translateY en la imagen → el efecto
   es de fade, no de parallax; la sección que "sube" lo hace
   por scroll normal, no por animación.

──────────────────────────────────────
SENSACIÓN VISUAL RESULTANTE
──────────────────────────────────────
• El hero se siente "infinito" — no tiene borde inferior visible
• La siguiente sección emerge desde abajo de forma orgánica
• El texto desaparece antes que la imagen → jerarquía clara
• Sin saltos ni cortes — todo es continuo y fluido
• Funciona sin GSAP si usas IntersectionObserver + CSS opacity,
  pero scrub:true de GSAP da la sincronización frame-perfect