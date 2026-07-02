"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LunaExperience.module.css";

const WORDS_PER_SEC = 2.3; // ritmo de "lectura" para simular la duración
const TYPE_MS = 22; // ms por carácter del efecto máquina de escribir

function formatTime(t) {
  const s = Math.max(0, Math.round(t));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Panel de "audio" para los nodos narrados. No reproduce sonido real: escribe
 * el texto con efecto máquina y avanza una barra de progreso simulada cuya
 * duración depende del número de palabras. Play/pausa rebobina al terminar.
 */
export default function StoryPanel({ story, onClose }) {
  const [typed, setTyped] = useState("");
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  const duration = story ? Math.max(24, Math.round(story.text.split(/\s+/).length / WORDS_PER_SEC)) : 0;
  const durationRef = useRef(duration);
  const playingRef = useRef(playing);
  // Espejo de los valores actuales para el bucle de rAF (se lee, no dispara render).
  useEffect(() => {
    durationRef.current = duration;
    playingRef.current = playing;
  });

  // Efecto máquina de escribir. El componente se remonta (vía `key`) en cada
  // apertura, así que el estado inicial ya arranca limpio y no hay que resetear.
  useEffect(() => {
    if (!story) return;
    let i = 0;
    let timer = 0;
    const step = () => {
      i += 1;
      setTyped(story.text.slice(0, i));
      if (i < story.text.length) timer = window.setTimeout(step, TYPE_MS);
    };
    timer = window.setTimeout(step, 140);
    return () => window.clearTimeout(timer);
  }, [story]);

  // Barra de progreso simulada.
  useEffect(() => {
    if (!story) return;
    let raf = 0;
    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      if (playingRef.current) {
        setElapsed((e) => {
          const next = Math.min(durationRef.current, e + dt);
          if (next >= durationRef.current) setPlaying(false);
          return next;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [story]);

  const togglePlay = () => {
    setElapsed((e) => (e >= durationRef.current ? 0 : e));
    setPlaying((p) => !p);
  };

  const open = Boolean(story);
  const frac = duration ? (elapsed / duration) * 100 : 0;

  return (
    <div className={`${styles.overlay} ${open ? "" : styles.overlayHidden}`} role="dialog" aria-modal="true">
      <div className={styles.overlayScrimTop} />
      <div className={styles.overlayScrimBottom} />

      {/* barra de reproducción */}
      <div className={styles.storyBar}>
        <div className={styles.storyControls}>
          <div className={styles.storyIcon} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff3ea" strokeWidth="1.6">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </div>
          <button className={`${styles.storyIcon} ${styles.play}`} onClick={togglePlay} aria-label={playing ? "Pausar" : "Reproducir"}>
            {playing ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff3ea"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff3ea"><path d="M7 4l13 8-13 8z" /></svg>
            )}
          </button>
        </div>

        <div className={styles.storyProgress}>
          <div className={styles.storyNum}>{story?.tag}</div>
          <div className={styles.storyBarRow}>
            <span className={styles.storyTime}>{formatTime(elapsed)}</span>
            <div className={styles.storyTrack}>
              <div className={styles.storyFill} style={{ width: `${frac}%` }} />
              <div className={styles.storyKnob} style={{ left: `${frac}%` }} />
            </div>
            <span className={styles.storyTime}>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      <button className={styles.closeBtn} onClick={onClose}>
        Cerrar
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="2" y1="2" x2="12" y2="12" stroke="#fff3ea" strokeWidth="1.6" />
          <line x1="12" y1="2" x2="2" y2="12" stroke="#fff3ea" strokeWidth="1.6" />
        </svg>
      </button>

      <div className={styles.storyBody}>
        <p className={`${styles.storyText} ${open ? styles.storyReveal : ""}`}>
          {typed}
          {typed.length < (story?.text.length ?? 0) && <span aria-hidden="true">▌</span>}
        </p>
      </div>
    </div>
  );
}
