import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import Header from "@/components/App/Header";
import MobileAppsPrimaryContent from "@/components/App/MobileAppsPrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./MobileAppsPage.module.css";

export default function AplicacionesMovilesPage() {
  // Nota: el Service JSON-LD vive en layout.tsx (evita duplicación).
  // Aquí solo emitimos el FAQPage que es contenido específico de la página.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué tipo de aplicaciones móviles desarrollan?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Somos una empresa de desarrollo de apps que crea aplicaciones nativas y multiplataforma para Android e iOS en diversos sectores: e-commerce, delivery y logística, educación, salud, gestión empresarial, redes sociales, productividad y más."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto tiempo toma desarrollar una aplicación móvil profesional?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "El tiempo de desarrollo de una app depende de la complejidad del proyecto. Para aplicaciones móviles sencillas puede tomar entre 1 y 3 meses, mientras que apps más complejas con integraciones avanzadas pueden requerir entre 6 y 12 meses."
        }
      },
      {
        "@type": "Question",
        "name": "¿Mi aplicación será compatible con todos los dispositivos Android e iOS?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí. Diseñamos aplicaciones móviles optimizadas para garantizar la mejor experiencia de usuario en la mayoría de smartphones y tablets, tanto en Android como en iOS. Publicamos tu app en Play Store y App Store."
        }
      }
    ]
  };

  return (
    <MainLayout>
      <div className={styles.page} data-mobile-apps-page data-primary-page>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <PrimaryHeader />
        <main>
          <Header />
          <MobileAppsPrimaryContent />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
