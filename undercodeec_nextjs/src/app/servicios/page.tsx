"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import Features from "@/components/Saas/Features";
import Services from "@/components/Saas/Services";
import About from "@/components/Saas/About";
import Testimonials from "@/components/Saas/Testimonials";
import Pricing from "@/components/Saas/Pricing";
import Footer from "@/components/Saas/Footer";

export default function ServiciosPage() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current);
    }
  }, []);

  return (
    <MainLayout>
      <TopNav style="5" rtl={false} />
      <Navbar navbarRef={navbarRef} bgTransparent={false} />
      <main className="services-page style-5">
        <Features isServices={true} rtl={false} />
        <Services rtl={false} />
        <About noPaddingTop={true} rtl={false} />
        <Testimonials rtl={false} />
        <Pricing rtl={false} />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
