import { PrimaryOrb } from "@/components/Primary";
import styles from "./ServicesHero.module.css";

export default function ServicesHero() {
  return (
    <section className={styles.hero} aria-label="Presentación de servicios">
      <div className={styles.orbField} aria-hidden="true">
        <span className={`${styles.orbOutline} ${styles.orbOutlineInner}`} />
        <span className={`${styles.orbOutline} ${styles.orbOutlineOuter}`} />
        <PrimaryOrb className={styles.orb} />
      </div>

      <div className={styles.heroFooter} aria-hidden="true">
        <span>Servicios digitales</span>
        <span className={styles.footerLine} />
        <span>01</span>
      </div>
    </section>
  );
}
