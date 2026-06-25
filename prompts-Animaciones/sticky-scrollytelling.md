SECCIÓN: Sticky Scrollytelling — Pasos secuenciales con scroll
Inspiración: dark, editorial, atmosférico, lujo médico/wellness

──────────────────────────────────────
ESTRUCTURA GENERAL
──────────────────────────────────────
La sección ocupa N × 125vh de alto (ej. 4 pasos = 500vh).
El hijo interno es "sticky": se queda fijo en pantalla mientras
el padre se scrollea. Los pasos se apilan en position:absolute
y aparecen/desaparecen uno a uno con fade sincronizado al scroll.

<section style="position:relative; height:500vh; background:#2A1408">
  <div style="position:sticky; top:0; height:100vh; overflow:hidden;
    display:flex; align-items:center; justify-content:center">
    <!-- capas de fondo -->
    <!-- indicadores de progreso -->
    <!-- pasos apilados -->
  </div>
</section>

──────────────────────────────────────
CAPAS DE FONDO (de atrás hacia adelante)
──────────────────────────────────────
1. Imagen full-bleed:
   position:absolute; inset:0;
   background: url('imagen.jpg') center center / cover no-repeat

2. Glow dorado sutil (decorativo, esquina):
   position:absolute; inset:0;
   background: radial-gradient(circle at 70% 30%,
     rgba(201,168,124,.15), transparent 55%)

3. Overlay oscuro para legibilidad:
   position:absolute; inset:0;
   background: linear-gradient(160deg,
     rgba(26,10,4,.78) 0%,
     rgba(42,20,8,.72) 50%,
     rgba(26,10,4,.86) 100%)

──────────────────────────────────────
INDICADORES DE PROGRESO (lado izquierdo)
──────────────────────────────────────
Posición:
  position:absolute; left: clamp(12px, 2.4vw, 38px);
  top:50%; transform:translateY(-50%);
  display:flex; flex-direction:column; gap:14px; z-index:5

Cada tick:
  width:2px; height:46px; border-radius:1px;
  background: rgba(255,255,255,.18)   ← inactivo
  background: #C9A87C                 ← activo (JS lo cambia)
  transition: background .5s

──────────────────────────────────────
LAYOUT DE CADA PASO
──────────────────────────────────────
Todos los pasos en la misma posición, apilados:
  position:absolute; inset:0;
  display:grid; grid-template-columns: 1fr 1fr;
  align-items:center; gap: clamp(40px, 6vw, 90px);
  padding: 0 clamp(24px, 8vw, 120px);
  opacity: 0;                ← el JS lo anima
  will-change: opacity;

Columna izquierda (texto):
  display:flex; flex-direction:column;
  align-items:flex-start; max-width:560px

Columna derecha:
  vacía, imagen, video, o ilustración

──────────────────────────────────────
TIPOGRAFÍA DE CADA PASO
──────────────────────────────────────
Kicker (número + categoría):
  font-family: 'Montserrat'; font-weight:600; font-size:12.5px;
  letter-spacing:.3em; text-transform:uppercase; color:#E8C99A

  Con línea decorativa antes del texto:
    <span style="width:46px;height:1px;background:#C9A87C"></span>
    <span>01 — Diagnóstico</span>

Título del paso:
  font-family: 'Cormorant Garamond', serif;
  font-weight: 400;
  font-size: clamp(2.6rem, 7vw, 6.4rem);
  line-height: 1.02;
  color: #fff;
  letter-spacing: -.01em;
  max-width: 14ch

Cuerpo:
  margin-top: 28px;
  font-size: clamp(15px, 1.5vw, 18px);
  font-weight: 300;
  line-height: 1.8;
  color: #D4C4B0;
  max-width: 520px

──────────────────────────────────────
JAVASCRIPT — Lógica del fade (vanilla, ~20 líneas)
──────────────────────────────────────
(function() {
  const section = document.getElementById('mi-seccion');
  const steps   = [...section.querySelectorAll('.paso')];
  const ticks   = [...section.querySelectorAll('.tick')];
  const n = steps.length;

  function render() {
    const rect  = section.getBoundingClientRect();
    const total = rect.height - innerHeight;
    let prog = total > 0 ? (-rect.top) / total : 0;
    prog = Math.min(1, Math.max(0, prog));

    const seg = 1 / n;
    steps.forEach((el, i) => {
      const local = (prog - i * seg) / seg;   // 0 → 1 dentro del tramo
      let op = 0;
      if (local >= 0 && local <= 1) {
        op = Math.sin(Math.min(1, Math.max(0, local)) * Math.PI);
        op = Math.min(1, op * 1.25);           // evitar gris en el pico
      }
      el.style.opacity = op.toFixed(3);
      if (ticks[i]) ticks[i].style.background =
        op > 0.5 ? '#C9A87C' : 'rgba(255,255,255,.18)';
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { render(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', render);
  render();
})();

──────────────────────────────────────
PALETA USADA EN ESTA SECCIÓN
──────────────────────────────────────
Fondo base:       #2A1408   (marrón oscuro)
Overlay oscuro:   rgba(26,10,4, .78–.86)
Glow dorado:      rgba(201,168,124, .15)
Tick inactivo:    rgba(255,255,255, .18)
Tick activo:      #C9A87C   (gold)
Kicker:           #E8C99A   (gold claro)
Línea decorativa: #C9A87C
Título:           #FFFFFF
Cuerpo:           #D4C4B0   (beige cálido)

──────────────────────────────────────
SENSACIÓN / TONO
──────────────────────────────────────
• Cinematográfico y atmosférico — como una revista de lujo
• El scroll se convierte en narrativa: cada paso es un capítulo
• Oscuro, cálido, nunca frío ni tecnológico
• Tipografía editorial serif (Cormorant) + sans funcional (Montserrat)
• Minimalismo de contenido: un título, un párrafo, nada más
• El movimiento es sutil — no hay transiciones abruptas, todo es fade