import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import ServicesHero from "@/components/Servicios/ServicesHero";
import ServicesShowcase, { ServicesCards } from "@/components/Servicios/ServicesShowcase";
import PrimaryAbout from "@/components/Saas/About/PrimaryAbout";
import aboutData from "@/data/Saas/about.json";
import Testimonials from "@/components/Saas/Testimonials";
import Pricing from "@/components/Saas/Pricing";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./ServiciosPage.module.css";

export default function ServiciosPage() {
  return (
    <MainLayout>
      <PrimaryHeader />
      <div className={styles.page} data-services-page data-primary-page>
        <main className="services-page style-5">
          <ServicesHero>
            <ServicesCards />
          </ServicesHero>
          <ServicesShowcase />
          <PrimaryAbout data={aboutData} />
          <Testimonials />
          <Pricing />
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
