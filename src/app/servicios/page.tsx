"use client";

import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import ServicesHero from "@/components/Servicios/ServicesHero";
import ServicesShowcase from "@/components/Servicios/ServicesShowcase";
import About from "@/components/Saas/About";
import Testimonials from "@/components/Saas/Testimonials";
import Pricing from "@/components/Saas/Pricing";
import Footer from "@/components/Saas/Footer";

export default function ServiciosPage() {
  return (
    <MainLayout>
      <PrimaryHeader />
      <main className="services-page style-5">
        <ServicesHero />
        <ServicesShowcase />
        <About noPaddingTop={true} />
        <Testimonials />
        <Pricing />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
