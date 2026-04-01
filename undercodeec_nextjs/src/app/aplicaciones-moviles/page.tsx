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

  const rtl = false;

  return (
    <MainLayout>
      <TopNav style="4" rtl={rtl} />
      <Navbar navbarRef={navbarRef} />
      <main>
        <Header rtl={rtl} />
        <Clients rtl={rtl} />
        <Features rtl={rtl} />
        <About rtl={rtl} noFirstContent={false} noIntegration={false} noWave={false} />
        <Screenshots rtl={rtl} />
        <Testimonials rtl={rtl} />
        <FAQ rtl={rtl} />
      </main>
      <Footer />
    </MainLayout>
  );
}
