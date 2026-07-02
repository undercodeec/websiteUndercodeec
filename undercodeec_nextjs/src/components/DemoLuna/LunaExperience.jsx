"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import styles from "./LunaExperience.module.css";
import { MISSION, PANORAMAS, STORIES, TIMELINE } from "./data";
import Starfield from "./Starfield";
import Preloader from "./Preloader";
import EventTimeline from "./EventTimeline";
import PanoramaViewer from "./PanoramaViewer";
import StoryPanel from "./StoryPanel";

// El canvas 3D depende del DOM/WebGL: solo en cliente, nunca en SSR.
const MoonScene = dynamic(() => import("./MoonScene"), { ssr: false });

/**
 * "21 Horas en la Luna" — orquestador de la experiencia.
 *
 * Fases:
 *   loading  → anillo de carga inicial
 *   intro    → título + Luna con parallax; se "aterriza" con scroll o botón
 *   surface  → órbita 3D libre + línea de tiempo con panorámicas y narraciones
 */
export default function LunaExperience() {
  const [phase, setPhase] = useState("loading");
  const [activeId, setActiveId] = useState(null);
  const [pano, setPano] = useState(null);
  const [story, setStory] = useState(null);
  // Token que cambia en cada apertura para forzar el remontaje limpio del overlay.
  const [openToken, setOpenToken] = useState(0);

  const overlayOpen = Boolean(pano || story);

  const land = useCallback(() => {
    setPhase((p) => (p === "intro" ? "surface" : p));
  }, []);

  const backToOrbit = useCallback(() => {
    setPhase("intro");
    setActiveId(null);
  }, []);

  // En la intro, girar la rueda hacia abajo "aterriza".
  useEffect(() => {
    if (phase !== "intro") return;
    const onWheel = (e) => {
      if (e.deltaY > 6) land();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [phase, land]);

  // Cierra overlays con Escape.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setPano(null);
      setStory(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectEvent = useCallback((item) => {
    setActiveId(item.id);
    setOpenToken((t) => t + 1);
    if (item.kind === "pano") {
      setStory(null);
      setPano(PANORAMAS[item.ref] ?? null);
    } else {
      setPano(null);
      setStory(STORIES[item.ref] ?? null);
    }
  }, []);

  const intro = phase === "intro";
  const surface = phase === "surface";
  const introClass = intro ? styles.fadeIn : styles.fadeOut;

  return (
    <div className={styles.root}>
      {/* fondo de estrellas (se atenúa al abrir un overlay para ahorrar CPU) */}
      <div className={`${styles.layer} ${styles.canvasLayer}`}>
        <Starfield active={!overlayOpen} />
      </div>

      {/* escena 3D de la Luna */}
      <div className={`${styles.layer} ${styles.sceneLayer}`}>
        <MoonScene phase={surface ? "surface" : "intro"} />
      </div>

      {/* ---- capa de interfaz: INTRO ---- */}
      <div className={`${styles.layer} ${styles.uiLayer} ${introClass}`}>
        <div className={styles.title}>
          <div className={`${styles.titleRule} ${styles.introRise} ${styles.d2}`}>
            <span className={styles.grow} />
            <span className={styles.titleKicker}>21 HRS en la</span>
            <span className={styles.grow} />
          </div>
          <div className={`${styles.titleWord} ${styles.introRise} ${styles.d3}`}>LUNA</div>
        </div>

        <div className={`${styles.metaGrid} ${styles.introRise} ${styles.d3}`}>
          <div className={styles.metaBlock}>
            <div className={styles.metaLabel}>Misión</div>
            <div className={styles.metaValue}>{MISSION.name}</div>
          </div>
          <p className={styles.lede}>
            Navega la superficie lunar y recorre las 21 horas que definieron el
            primer alunizaje de la humanidad.
          </p>
          <div className={`${styles.metaBlock} ${styles.right}`}>
            <div className={styles.metaLabel}>Año</div>
            <div className={styles.metaValue}>{MISSION.year}</div>
          </div>
        </div>
        <div className={`${styles.metaRule} ${styles.grow}`} />

        <div className={styles.cta}>
          <button className={`${styles.ctaBtn} ${styles.introRise} ${styles.d3} interactive`} onClick={land}>
            <span className={`${styles.ctaCorner} ${styles.tl}`} />
            <span className={`${styles.ctaCorner} ${styles.tr}`} />
            <span className={`${styles.ctaCorner} ${styles.bl}`} />
            <span className={`${styles.ctaCorner} ${styles.br}`} />
            <span>Desplázate para aterrizar</span>
          </button>
        </div>
      </div>

      {/* ---- capa de interfaz: SUPERFICIE ---- */}
      <div className={`${styles.layer} ${styles.uiLayer} ${surface ? styles.fadeIn : styles.fadeOut}`}>
        <div className={styles.hudTop}>{MISSION.site} · {MISSION.coords}</div>
        <button className={`${styles.backBtn} interactive`} onClick={backToOrbit} style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)" }}>
          <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden="true">
            <path d="M1.5 7 L6.5 2 L11.5 7" stroke="#fff3ea" strokeWidth="1.3" />
          </svg>
          Volver a órbita
        </button>

        <div className={styles.dragHint}>
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
            <path d="M7 1 L1 4 L7 7 M15 1 L21 4 L15 7" stroke="#fff3ea" strokeWidth="1.2" />
          </svg>
          Arrastra para rotar · Rueda para acercar
          <svg width="22" height="8" viewBox="0 0 22 8" fill="none" aria-hidden="true">
            <path d="M7 1 L1 4 L7 7 M15 1 L21 4 L15 7" stroke="#fff3ea" strokeWidth="1.2" />
          </svg>
        </div>

        <EventTimeline items={TIMELINE} activeId={activeId} onSelect={selectEvent} />
      </div>

      {/* grano de película */}
      <div className={styles.grain} />

      {/* overlays (se remontan por key en cada apertura para arrancar limpios) */}
      <PanoramaViewer key={`pano-${openToken}`} pano={pano} onClose={() => setPano(null)} />
      <StoryPanel key={`story-${openToken}`} story={story} onClose={() => setStory(null)} />

      {/* preloader (encima de todo hasta que termina) */}
      {phase === "loading" && <Preloader onDone={() => setPhase("intro")} />}
    </div>
  );
}
