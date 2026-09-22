import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import UnderCodeec from "@/components/Navbars/UnderCodeec";
import styles from "./UnderCodeecPage.module.css";

export default function UnderCodeecPage() {
  return (
    <MainLayout>
      <div className={styles.page} data-undercodeec-page data-primary-page>
        <PrimaryHeader />
        <main>
          <PrimaryPageHero
            label="Undercodeec: soluciones digitales que hacen avanzar negocios"
            lines={["Ideas digitales", "hechas para", "avanzar"]}
            topMeta="Estrategia / Diseño / Tecnología"
            summary="Diseñamos sitios web, aplicaciones, software y estrategias digitales que conectan objetivos de negocio con experiencias útiles."
            bottomMeta="Todo lo que hacemos, en un solo lugar"
            titleId="undercodeec-hero-title"
          />
          <UnderCodeec />
        </main>
      </div>
    </MainLayout>
  );
}
