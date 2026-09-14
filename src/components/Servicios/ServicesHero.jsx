import styles from "./ServicesHero.module.css";

export default function ServicesHero({ children }) {
  return (
    <section className={styles.hero} aria-label="Presentación de servicios">
      {children && <div className={styles.cardsOverlay}>{children}</div>}

      <div className={styles.heroFooter} aria-hidden="true">
        <span>Servicios digitales</span>
        <span className={styles.footerLine} />
        <span>01</span>
      </div>
    </section>
  );
}
