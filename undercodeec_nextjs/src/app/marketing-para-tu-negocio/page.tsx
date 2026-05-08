"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import MarketingHero from "@/components/Marketing/MarketingHero";
import Blog from "@/components/Startup/Blog";

import Clients from "@/components/Startup/Clients";
import Numbers from "@/components/Startup/Numbers";
import Contact from "@/components/Startup/Contact";
import Footer from "@/components/Startup/Footer";

export default function MarketingParaTuNegocioPage() {
  useEffect(() => {
    document.body.classList.add("home-style-6");
    return () => document.body.classList.remove("home-style-6");
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Marketing Digital y SEO en Ecuador",
    "description": "Servicios de marketing digital, posicionamiento SEO, manejo de redes sociales, Google Ads y Facebook Ads para empresas y PYMES en Quito y Ecuador.",
    "provider": {
      "@type": "Organization",
      "name": "Undercodeec",
      "url": "https://undercodeec.com",
      "logo": "https://undercodeec.com/assets/img/undercode-logo.png",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Quito",
        "addressCountry": "EC"
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Ecuador"
    },
    "serviceType": [
      "Marketing Digital",
      "Posicionamiento SEO",
      "Manejo de Redes Sociales",
      "Google Ads",
      "Facebook Ads",
      "Inbound Marketing",
      "Branding Digital",
      "Consultoría de Marketing"
    ]
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <MarketingHero />
        <Blog />

        <Clients />
        <Numbers />
        <Contact />
      </main>
      <Footer />
    </MainLayout>
  );
}
