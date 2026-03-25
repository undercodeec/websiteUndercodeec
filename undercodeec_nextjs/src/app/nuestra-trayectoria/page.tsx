"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import AboutHeader from "@/components/Saas/AboutHeader";
import Community from "@/components/Saas/Community";
import Philosophy from "@/components/Saas/Philosophy";
import ChooseUs from "@/components/Saas/ChooseUs";
import Clients from "@/components/Saas/Clients";
import Numbers from "@/components/Saas/Numbers";
import Team from "@/components/Saas/Team";
import Contact from "@/components/Saas/Contact";
import Footer from "@/components/Saas/Footer";

export default function NuestraTrayectoriaPage() {
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
      <main className="about-page style-5">
        <AboutHeader rtl={false} />
        <Community rtl={false} />
        <Philosophy rtl={false} />
        <ChooseUs rtl={false} />
        <Clients padding={true} rtl={false} />
        <Numbers rtl={false} />
        <Team rtl={false} />
        <Contact rtl={false} />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
