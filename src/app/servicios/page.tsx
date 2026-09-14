"use client";

import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import ServicesHero from "@/components/Servicios/ServicesHero";
import ServicesOrbBackground from "@/components/Servicios/ServicesOrbBackground";
import ServicesShowcase, { ServicesCards } from "@/components/Servicios/ServicesShowcase";
import About from "@/components/Saas/About";
import Testimonials from "@/components/Saas/Testimonials";
import Pricing from "@/components/Saas/Pricing";
import Footer from "@/components/Saas/Footer";
import styles from "./ServiciosPage.module.css";

export default function ServiciosPage() {
  return (
    <MainLayout>
      <PrimaryHeader />
      <div className={styles.page}>
        <ServicesOrbBackground />
        <main className="services-page style-5" data-services-page>
          <ServicesHero>
            <ServicesCards />
          </ServicesHero>
          <ServicesShowcase />
          <About noPaddingTop={true} variant="primary" />
          <Testimonials />
          <Pricing />
        </main>
        <Footer noWave={true} />
      </div>
    </MainLayout>
  );
}
