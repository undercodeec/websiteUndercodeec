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

  const rtl = false;

  return (
    <MainLayout>
      <main>
        <MarketingHero />
        <Blog rtl={rtl} />

        <Clients rtl={rtl} />
        <Numbers />
        <Contact rtl={rtl} />
      </main>
      <Footer />
    </MainLayout>
  );
}
