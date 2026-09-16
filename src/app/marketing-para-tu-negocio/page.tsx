"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import MarketingHero from "@/components/Marketing/MarketingHero";
import MarketingIntro from "@/components/Marketing/MarketingIntro";
import MarketingPrimaryContent from "@/components/Marketing/MarketingPrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./MarketingPage.module.css";

export default function MarketingParaTuNegocioPage() {
  useEffect(() => {
    document.body.classList.add("home-style-6");
    return () => document.body.classList.remove("home-style-6");
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Marketing Digital y SEO",
    "description": "Servicios de marketing digital, posicionamiento SEO, gestión de redes sociales, Google Ads y Facebook Ads para empresas y negocios.",
    "provider": {
      "@type": "Organization",
      "name": "Undercodeec",
      "url": "https://undercodeec.com",
      "logo": "https://undercodeec.com/assets/img/undercode-logo.png"
    },
    "serviceType": [
      "Marketing Digital",
      "Posicionamiento SEO",
      "Gestión de Redes Sociales",
      "Google Ads",
      "Facebook Ads",
      "Inbound Marketing",
      "Branding Digital",
      "Consultoría de Marketing"
    ]
  };

  return (
    <MainLayout>
      <div className={styles.page} data-marketing-page data-primary-page>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <PrimaryHeader />
        <main>
          <MarketingHero />
          <MarketingIntro />
          <MarketingPrimaryContent />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
