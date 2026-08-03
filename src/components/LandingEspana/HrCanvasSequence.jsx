"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./HrCanvasSequence.module.css";

/**
 * Canvas de secuencia (scroll takeover) portado tal cual del stack-demo
 * (ImageSequencePlayer + el bloque de `useSuiRuntime`).
 *
 * `.canvas-wrapper` es fixed y arranca oculto abajo (translateY 99.26svh).
 * Al recorrer la seccion ancla: sube a pantalla completa (reveal), barre los
 * frames .webp de Cloudinary (scrub) y luego sale hacia arriba, revelando el
 * resto de la pagina (el formulario). El fondo usa los colores del hero y el
 * canvas se recolorea (azul -> morado del hero) con un filtro hue-rotate.
 */

const FOLDER =
  "https://res.cloudinary.com/dp6m7thfm/image/upload/sequences/homepage-scroll";
const FRAME_START = 10; // primer frame del loop (loopStart original)
const FRAME_END = 75; // totalFrames
const TOTAL = 75;

// Umbrales (0..1) sobre el progreso de la seccion ancla.
const REVEAL_IN = 0.3; // 0->aqui: el canvas sube a pantalla completa
const SCRUB_END = 0.58; // fin del barrido de frames (luego el panel sube encima)
const DOCK_SPAN = 0.18; // tramo tras el scrub en el que el panel se acopla
const DOCK_OFFSET = 0.62; // cuanto (fraccion de viewport) parte el panel oculto abajo

export default function HrCanvasSequence() {
  const anchorRef = useRef(null);
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!anchor || !wrapper || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    gsap.registerPlugin(ScrollTrigger);

    const images = [];
    let loaded = false;
    let sized = false;
    let current = -1;
    let pending = TOTAL + 1;

    const size = (img) => {
      if (sized) return;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      sized = true;
    };
    const draw = (f) => {
      const img = images[f];
      if (!img || !img.complete || !img.naturalWidth) return;
      size(img);
      if (f === current) return;
      current = f;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    for (let i = 0; i <= TOTAL; i++) {
      const img = new Image();
      const done = () => {
        if (--pending <= 0) {
          loaded = true;
          draw(FRAME_START);
        }
      };
      img.onload = () => {
        if (i === FRAME_START) size(img);
        done();
      };
      img.onerror = done;
      img.src = `${FOLDER}/frame_${String(i).padStart(4, "0")}.webp`;
      images[i] = img;
    }

    const clamp01 = (v) => Math.min(1, Math.max(0, v));
    // Estado inicial: oculto abajo (fuera de vista), a pantalla completa.
    gsap.set(wrapper, { y: "99.26svh", width: "100%" });

    // Panel #plan/#postulacion: se mantiene oculto abajo durante la animacion y,
    // al terminar el scrub, se desliza hacia arriba mas rapido que el scroll
    // para "acoplarse" justo debajo cuando el canvas finaliza.
    const panel = document.getElementById("rhRevealPanel");
    if (panel) gsap.set(panel, { y: window.innerHeight * DOCK_OFFSET });

    const st = ScrollTrigger.create({
      trigger: anchor,
      // Empieza a revelar mientras aun se baja por el hero (anchor entrando por
      // abajo) para que el canvas ya cubra la pantalla cuando el hero termina de
      // salir -> sin fondo vacio intermedio. Termina cuando el anchor sale por
      // arriba, revelando el formulario.
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Revelar (sube desde abajo) -> mantener a pantalla completa.
        // Ya no sale por arriba: el panel #plan/#postulacion sube ENCIMA del
        // canvas (cortina opaca) para el handoff hacia el resto de la pagina.
        if (p < REVEAL_IN) {
          gsap.set(wrapper, { y: `${99.26 * (1 - p / REVEAL_IN)}svh` });
        } else {
          gsap.set(wrapper, { y: "0svh" });
        }

        // Barrido de frames entre el fin del reveal y SCRUB_END.
        const sp = clamp01((p - REVEAL_IN) / (SCRUB_END - REVEAL_IN));
        if (loaded) draw(Math.round(FRAME_START + (FRAME_END - FRAME_START) * sp));

        // Acople del panel: oculto abajo hasta SCRUB_END, luego sube a su sitio.
        if (panel) {
          const dp = clamp01((p - SCRUB_END) / DOCK_SPAN);
          gsap.set(panel, { y: (1 - dp) * window.innerHeight * DOCK_OFFSET });
        }
      },
    });

    return () => {
      st.kill();
      if (panel) gsap.set(panel, { clearProps: "transform" });
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, []);

  return (
    <>
      <div
        id="canvasPin"
        ref={wrapperRef}
        className={styles.canvasWrapper}
        aria-hidden="true"
      >
        <canvas
          ref={canvasRef}
          className={styles.canvasSequence}
          width={1440}
          height={900}
        />
      </div>
      <section ref={anchorRef} className={styles.anchor} aria-hidden="true" />
    </>
  );
}
