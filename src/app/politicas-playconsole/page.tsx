"use client";

import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import PoliticaContenido from "@/components/Navbars/PlayConsole";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./PoliciesPage.module.css";

export default function PoliticasPlayConsolePage() {
  return (
    <MainLayout>
      <div className={styles.page} data-policies-page data-primary-page>
        <PrimaryHeader />
        <main className="politica-playconsole">
          <PrimaryPageHero
            label="Políticas de privacidad y contenido de Undercodeec"
            lines={["Privacidad", "clara para", "cada producto"]}
            topMeta="Legal / Datos / Transparencia"
            summary="Conoce cómo protegemos la información, administramos nuestros servicios digitales y establecemos condiciones claras para cada experiencia."
            bottomMeta="Tecnología construida sobre confianza"
            titleId="policies-hero-title"
          />
          <PoliticaContenido />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
