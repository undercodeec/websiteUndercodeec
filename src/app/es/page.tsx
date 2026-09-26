"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import MarketingHero from "@/components/Marketing/MarketingHero";
import MarketingIntro from "@/components/Marketing/MarketingIntro";
import EspanaPrimaryContent from "@/components/Marketing/EspanaPrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "../marketing-para-tu-negocio/MarketingPage.module.css";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://undercodeec.com/es/#webpage",
  url: "https://undercodeec.com/es/",
  name: "Diseño web España | Desarrollo web Madrid, Barcelona y Valencia | Undercodeec",
  description:
    "Diseño web, desarrollo web, ecommerce, aplicaciones, software a medida y posicionamiento en Google para empresas en España.",
  inLanguage: "es-ES",
  mainEntity: {
    "@type": "Service",
    name: "Diseño web España y desarrollo web para empresas",
    serviceType: [
      "diseño web España",
      "desarrollo web Madrid",
      "desarrollo web Barcelona",
      "diseño web Valencia",
      "posicionamiento web España",
      "desarrollo de apps móviles España",
      "software a medida España",
    ],
    areaServed: [
      { "@type": "Country", name: "España" },
      { "@type": "City", name: "Madrid" },
      { "@type": "City", name: "Barcelona" },
      { "@type": "City", name: "Valencia" },
    ],
  },
};

export default function EspanaPage() {
  useEffect(() => {
    document.body.classList.add("home-style-6");
    return () => document.body.classList.remove("home-style-6");
  }, []);

  return (
    <MainLayout>
      <div className={styles.page} data-marketing-page data-primary-page lang="es-ES">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <PrimaryHeader />
        <main>
          <MarketingHero
            label="Diseño web España para empresas"
            lines={["Diseño web", "para empresas", "en España"]}
            topMeta="España / Desarrollo / Visibilidad"
            summary="Diseño web, desarrollo, ecommerce, aplicaciones y software a medida para empresas en España que buscan una presencia digital útil y medible."
            bottomMeta="Estrategia digital"
            index="01"
            titleId="espana-hero-title"
            regionMeta="ES — 2026"
          />
          <MarketingIntro
            title="Una agencia digital España para proyectos que necesitan avanzar"
            meta="02 / Servicios digitales"
            visualLabel="Estrategia de diseño web, SEO y conversión para empresas en España"
            visualCaption="Diseño web / SEO / Conversión"
            lead="Combinamos diseño web España, desarrollo, contenido y medición para convertir una necesidad comercial en una solución clara. El alcance se define según los objetivos, las herramientas que ya utiliza la empresa y el tipo de relación que busca con sus clientes."
            inboundMeta="Desarrollo web Madrid, Barcelona y Valencia"
            inboundTitle="Sitios corporativos, landing pages y portales preparados para móvil"
            inboundCopy="Trabajamos la estructura de contenidos, la navegación y la conversión para que cada proyecto explique mejor su oferta y ayude a las personas a tomar una decisión."
          />
          <EspanaPrimaryContent />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
