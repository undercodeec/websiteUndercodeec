import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import ContactPrimaryContent from "@/components/Contact/ContactPrimaryContent";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./ContactPage.module.css";

export default function ContactoPage() {
  return (
    <MainLayout>
      <div className={styles.page} data-contact-page data-primary-page>
        <PrimaryHeader />
        <main className="contact-page style-5">
          <PrimaryPageHero
            label="Hablemos de la próxima etapa de tu negocio"
            lines={["Hablemos de", "lo que quieres", "construir"]}
            topMeta="Contacto / Estrategia / Tecnología"
            summary="Cuéntanos qué necesita tu negocio. Convertimos ideas, procesos y oportunidades en soluciones digitales claras, escalables y hechas a tu medida."
            bottomMeta="Una buena solución empieza conversando"
            titleId="contacto-hero-title"
          />
          <ContactPrimaryContent />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
