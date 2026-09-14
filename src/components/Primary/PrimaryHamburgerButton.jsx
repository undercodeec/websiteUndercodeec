import styles from "./PrimaryHeader.module.css";

export default function PrimaryHamburgerButton({ buttonRef, isOpen, onToggle }) {
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.menuButton} hud-menu-w ${isOpen ? "is-open" : ""}`}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={isOpen}
        aria-controls="primary-navigation-menu"
        onClick={onToggle}
      >
        <span className={`${styles.menuIcon} hud-menu-c`} aria-hidden="true">
          <span className="hud-menu-line is-1" />
          <span className="hud-menu-line is-2" />
          <span className="hud-menu-line is-3" />
        </span>
      </button>
      <span className={`${styles.menuBackground} hud-menu-bg`} aria-hidden="true" />
    </>
  );
}
