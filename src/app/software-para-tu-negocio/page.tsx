"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryServiceHero from "@/components/Marketing/MarketingHero";
import SoftwarePrimaryContent from "@/components/Software/SoftwarePrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./SoftwarePage.module.css";

export default function SoftwareParaTuNegocioPage() {
  useEffect(() => {
    document.body.classList.add("home-style-8");
    return () => document.body.classList.remove("home-style-8");
  }, []);

  // Nota: el Service JSON-LD vive en layout.tsx (evita duplicación).
  // Aquí solo emitimos el FAQPage que es contenido específico de la página.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo toma desarrollar un sistema de software a medida para mi negocio?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tiempo de desarrollo de software empresarial varía según la complejidad, pero un MVP funcional suele estar listo en 4 a 8 semanas. Trabajamos con metodologías ágiles para entregarte avances quincenales."
        }
      },
      {
        "@type": "Question",
        "name": "¿Puedo empezar con un módulo básico e ir ampliando mi software empresarial?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí. Diseñamos arquitecturas de software escalables para pequeñas y medianas empresas. Puedes comenzar con funciones críticas como CRM o facturación electrónica y añadir nuevos módulos a medida que tu negocio crezca."
        }
      },
      {
        "@type": "Question",
        "name": "¿Mis datos empresariales están seguros en el software que desarrollan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "La seguridad es el núcleo de nuestro desarrollo de software. Implementamos cifrado de datos AES-256, autenticación multifactor, cumplimiento normativo y estándares internacionales de protección de datos."
        }
      }
    ]
  };

  return (
    <MainLayout>
      <div className={styles.page} data-software-page data-primary-page>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <PrimaryHeader />
        <main>
          <PrimaryServiceHero
            label="Software empresarial a medida para tu negocio"
            lines={["Software empresarial", "a medida para", "tu negocio"]}
            topMeta="Software / Automatización / Escalabilidad"
            summary="CRM, ERP, control de inventarios, facturación electrónica, punto de venta y automatización de procesos empresariales."
            bottomMeta="Tecnología diseñada para avanzar"
            titleId="software-hero-title"
          />
          <SoftwarePrimaryContent />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
