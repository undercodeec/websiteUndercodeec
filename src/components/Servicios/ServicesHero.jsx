import styles from "./ServicesHero.module.css";
import HeroParticles from "@/components/HeroParticles/HeroParticles";

export default function ServicesHero({ children }) {
  return (
    <section className={styles.hero} aria-label="Presentación de servicios">
      <HeroParticles />
      {children && <div className={styles.cardsOverlay}>{children}</div>}

      <div className={styles.heroFooter} aria-hidden="true">
        <span>Servicios digitales</span>
        <span className={styles.footerLine} />
        <span>01</span>
      </div>
    </section>
  );
}
