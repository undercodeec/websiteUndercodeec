"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/AppNav";
import Header from "@/components/App/Header";
import Features from "@/components/App/Features";
import About from "@/components/App/About";
import Screenshots from "@/components/App/Screenshots";
import Testimonials from "@/components/App/Testimonials";
import FAQ from "@/components/App/FAQ";
import Clients from "@/components/App/Clients";
import Footer from "@/components/App/Footer";

export default function AplicacionesMovilesPage() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current);
    }
  }, []);

  useEffect(() => {
    document.body.classList.add("home-style-4");
    return () => document.body.classList.remove("home-style-4");
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Desarrollo de Aplicaciones Móviles en Ecuador",
    "description": "Empresa de desarrollo de aplicaciones móviles nativas y multiplataforma para Android e iOS en Quito, Ecuador. Diseño UI/UX profesional, apps de e-commerce, delivery y gestión empresarial.",
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
      "Desarrollo de Apps Android",
      "Desarrollo de Apps iOS",
      "Desarrollo Multiplataforma Flutter",
      "Diseño UI/UX Móvil",
      "Apps de E-commerce",
      "Apps de Delivery y Logística",
      "Apps de Gestión Empresarial",
      "Publicación en Play Store y App Store"
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué tipo de aplicaciones móviles desarrollan en Ecuador?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Somos una empresa de desarrollo de apps en Quito que crea aplicaciones nativas y multiplataforma para Android e iOS en diversos sectores: e-commerce, delivery y logística, educación, salud, gestión empresarial, redes sociales, productividad y más."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo toma desarrollar una aplicación móvil profesional?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tiempo de desarrollo de una app depende de la complejidad del proyecto. Para aplicaciones móviles sencillas puede tomar entre 1 a 3 meses, mientras que apps más complejas con integraciones avanzadas pueden requerir entre 6 y 12 meses."
        }
      },
      {
        "@type": "Question",
        "name": "¿Mi aplicación será compatible con todos los dispositivos Android e iOS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, diseñamos aplicaciones móviles optimizadas para garantizar la mejor experiencia de usuario en la mayoría de smartphones y tablets, tanto en Android como en iOS. Publicamos tu app en Play Store y App Store."
        }
      }
    ]
  };

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <TopNav style="4" />
      <Navbar navbarRef={navbarRef} />
      <main>
        <Header />
        <Clients />
        <Features />
        <About noFirstContent={false} noIntegration={false} noWave={false} />
        <Screenshots />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </MainLayout>
  );
}
