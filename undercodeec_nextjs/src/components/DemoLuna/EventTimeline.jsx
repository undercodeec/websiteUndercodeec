"use client";

import styles from "./LunaExperience.module.css";

const TOTAL_HOURS = 21;

/**
 * Línea de tiempo de la estancia en la superficie (0–21 h). Cada nodo abre su
 * panorámica o narración asociada. El nodo activo se resalta.
 */
export default function EventTimeline({ items, activeId, onSelect }) {
  const active = items.find((it) => it.id === activeId);

  return (
    <div className={styles.timeline}>
      <div className={styles.timelineHead}>{active ? active.label : "Selecciona un momento"}</div>
      <div className={styles.timelineScale}>
        <span>0 horas</span>
        <span>21 horas</span>
      </div>
      <div className={styles.timelineTrack}>
        {items.map((it) => (
          <button
            key={it.id}
            className={`${styles.timelineNode} ${it.id === activeId ? styles.active : ""} interactive`}
            style={{ left: `${(it.hour / TOTAL_HOURS) * 100}%` }}
            onClick={() => onSelect(it)}
            aria-label={it.label}
          >
            <span className={styles.tip}>{it.label}</span>
            <i />
          </button>
        ))}
      </div>
    </div>
  );
}
