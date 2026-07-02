"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./LunaExperience.module.css";

const PX_PER_DEG = 4; // px de cinta por grado (rumbo y elevación)
const DEG_PER_VIEW = 80; // grados barridos por cada viewport de arrastre
const ZOOM = 1.08; // zoom extra sobre "cover" para dejar recorrido en ambos ejes
const DIRS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

// Marcas estáticas de las cintas de instrumentos.
const compassMarks = [];
for (let d = -180; d <= 540; d += 5) {
  const norm = ((d % 360) + 360) % 360;
  const major = norm % 30 === 0;
  const cardinal = norm % 90 === 0;
  compassMarks.push({ d, norm, major, cardinal });
}
const pitchMarks = [];
for (let e = -90; e <= 90; e += 5) {
  pitchMarks.push({ e, major: e % 15 === 0, horizon: e === 0 });
}

function headingLabel(h) {
  const n = ((h % 360) + 360) % 360;
  return `${DIRS[Math.round(n / 45) % 8]} · ${String(Math.round(n)).padStart(3, "0")}°`;
}
function pitchLabel(p) {
  const v = Math.round(p);
  const sign = v > 0 ? "+" : v < 0 ? "−" : "±";
  return `ELEV ${sign}${String(Math.abs(v)).padStart(2, "0")}°`;
}

/**
 * Vista panorámica: la imagen se muestra en modo "cover" y se arrastra en
 * cualquier dirección. El desplazamiento real se traduce en un rumbo y una
 * elevación que animan dos cintas de instrumentos estilo cabina.
 */
export default function PanoramaViewer({ pano, onClose }) {
  const stageRef = useRef(null);
  const imgRef = useRef(null);
  const compassRef = useRef(null);
  const compassReadRef = useRef(null);
  const pitchRef = useRef(null);
  const pitchReadRef = useRef(null);

  // Geometría y estado de arrastre (en refs para no re-renderizar en cada frame).
  const geo = useRef({ W: 0, H: 0, minX: 0, minY: 0 });
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef(null);

  const apply = useCallback(() => {
    const { x, y } = pos.current;
    const { W, H, minX, minY } = geo.current;
    if (imgRef.current) imgRef.current.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;

    const fx = minX === 0 ? 0.5 : x / minX;
    const heading = (fx - 0.5) * (DEG_PER_VIEW * (-minX)) / (W || 1);
    if (compassRef.current) compassRef.current.style.transform = `translateX(${(-heading * PX_PER_DEG).toFixed(1)}px)`;
    if (compassReadRef.current) compassReadRef.current.textContent = headingLabel(heading);

    const fy = minY === 0 ? 0.5 : y / minY;
    const pitch = (0.5 - fy) * (DEG_PER_VIEW * (-minY)) / (H || 1);
    if (pitchRef.current) pitchRef.current.style.transform = `translateY(${(pitch * PX_PER_DEG).toFixed(1)}px)`;
    if (pitchReadRef.current) pitchReadRef.current.textContent = pitchLabel(pitch);
  }, []);

  const layout = useCallback(() => {
    const stage = stageRef.current;
    if (!stage || !pano) return;
    const W = stage.clientWidth;
    const H = stage.clientHeight;
    let imgW, imgH;
    if (pano.ratio >= W / H) {
      imgH = H;
      imgW = H * pano.ratio;
    } else {
      imgW = W;
      imgH = W / pano.ratio;
    }
    imgW *= ZOOM;
    imgH *= ZOOM;
    geo.current = { W, H, minX: Math.min(0, W - imgW), minY: Math.min(0, H - imgH) };
    if (imgRef.current) {
      imgRef.current.style.width = `${imgW.toFixed(1)}px`;
      imgRef.current.style.height = `${imgH.toFixed(1)}px`;
    }
    // Arranca centrado y respeta límites.
    pos.current = {
      x: Math.max(geo.current.minX, Math.min(0, pos.current.x || geo.current.minX / 2)),
      y: Math.max(geo.current.minY, Math.min(0, pos.current.y || geo.current.minY / 2)),
    };
  }, [pano]);

  // Recalcula el encuadre al abrir una panorámica nueva o al redimensionar.
  useEffect(() => {
    if (!pano) return;
    pos.current = { x: 0, y: 0 };
    const raf = requestAnimationFrame(() => {
      layout();
      pos.current = { x: geo.current.minX / 2, y: geo.current.minY / 2 };
      apply();
    });
    const onResize = () => {
      layout();
      apply();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [pano, layout, apply]);

  const onPointerDown = (e) => {
    drag.current = { sx: e.clientX, sy: e.clientY, x0: pos.current.x, y0: pos.current.y };
    e.currentTarget.classList.add(styles.grabbing);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const { minX, minY } = geo.current;
    pos.current = {
      x: Math.max(minX, Math.min(0, drag.current.x0 + (e.clientX - drag.current.sx))),
      y: Math.max(minY, Math.min(0, drag.current.y0 + (e.clientY - drag.current.sy))),
    };
    apply();
  };
  const onPointerUp = (e) => {
    drag.current = null;
    e.currentTarget.classList.remove(styles.grabbing);
  };

  const open = Boolean(pano);

  return (
    <div className={`${styles.overlay} ${open ? "" : styles.overlayHidden}`} role="dialog" aria-modal="true">
      <div
        className={styles.panoStage}
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className={open ? styles.panoReveal : ""}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} className={styles.panoImg} src={pano?.src} alt={pano?.title ?? ""} draggable={false} />
        </div>
      </div>

      <div className={styles.overlayScrimTop} />
      <div className={styles.overlayScrimBottom} />

      <div className={styles.overlayHead}>
        <div className={styles.overlayTag}>{pano?.tag}</div>
        <div className={styles.overlayTitle}>{pano?.title}</div>
        <div className={styles.overlayMeta}>{pano?.meta}</div>
      </div>

      <button className={styles.closeBtn} onClick={onClose}>
        Cerrar
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
          <line x1="2" y1="2" x2="12" y2="12" stroke="#fff3ea" strokeWidth="1.6" />
          <line x1="12" y1="2" x2="2" y2="12" stroke="#fff3ea" strokeWidth="1.6" />
        </svg>
      </button>

      {/* cinta de rumbo (horizontal) */}
      <div className={styles.compass}>
        <div className={styles.compassReadout} ref={compassReadRef}>N · 000°</div>
        <div className={styles.compassTape}>
          <div className={styles.compassTrack} ref={compassRef}>
            {compassMarks.map(({ d, norm, major, cardinal }) => (
              <div key={d} className={`${styles.tick} ${styles.tickCol}`} style={{ left: `${d * PX_PER_DEG}px` }}>
                <span
                  className={styles.tickMark}
                  style={{
                    width: major ? "2px" : "1px",
                    height: major ? (cardinal ? "16px" : "12px") : "7px",
                    opacity: major ? 0.9 : 0.3,
                  }}
                />
                {major && (
                  <span
                    className={styles.tickLabel}
                    style={{
                      fontSize: cardinal ? "12px" : "9px",
                      color: cardinal ? "#e4b592" : "#fff3ea",
                      opacity: cardinal ? 1 : 0.7,
                    }}
                  >
                    {cardinal ? DIRS[(norm / 45) % 8] : String(norm / 10).padStart(2, "0")}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.compassPin} />
          <div className={styles.compassArrow} />
        </div>
      </div>

      {/* cinta de elevación (vertical) */}
      <div className={styles.pitch}>
        <div className={styles.pitchTape}>
          <div className={styles.pitchTrack} ref={pitchRef}>
            {pitchMarks.map(({ e, major, horizon }) => (
              <div key={e} className={`${styles.tick} ${styles.tickRow}`} style={{ top: `${-e * PX_PER_DEG}px` }}>
                <span
                  className={styles.tickMark}
                  style={{
                    height: major ? "2px" : "1px",
                    width: major ? (horizon ? "20px" : "13px") : "7px",
                    opacity: major ? 0.9 : 0.3,
                  }}
                />
                {major && (
                  <span
                    className={styles.tickLabel}
                    style={{ fontSize: horizon ? "11px" : "9px", color: horizon ? "#e4b592" : "#fff3ea", opacity: horizon ? 1 : 0.7 }}
                  >
                    {horizon ? "0" : Math.abs(e)}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className={styles.pitchPin} />
          <div className={styles.pitchArrow} />
        </div>
        <div className={styles.pitchReadout} ref={pitchReadRef}>ELEV ±00°</div>
      </div>
    </div>
  );
}
