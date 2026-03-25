"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/AppNav";
import Header from "@/components/App/Header";
import Clients from "@/components/App/Clients";
import Features from "@/components/App/Features";
import About from "@/components/App/About";
import Screenshots from "@/components/App/Screenshots";
import Testimonials from "@/components/App/Testimonials";

import FAQ from "@/components/App/FAQ";
import Community from "@/components/App/Community";
import Footer from "@/components/App/Footer";

export default function AplicacionesMovilesPage() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current);
    }
  }, []);

  // rtl={false} para todos los componentes que soporten modo RTL (right-to-left)
  const rtl = false;

  return (
    <MainLayout>
      {/* @ts-ignore - JSX components need proper TypeScript types */}
      <TopNav style="4" rtl={rtl} />
      {/* @ts-ignore */}
      <Navbar navbarRef={navbarRef} />
      {/* @ts-ignore */}
      <Header rtl={rtl} />
      <main>
        {/* @ts-ignore */}
        <Clients rtl={rtl} />
        {/* @ts-ignore */}
        <Features rtl={rtl} />
        {/* @ts-ignore */}
        <About rtl={rtl} />
        {/* @ts-ignore */}
        <Screenshots rtl={rtl} />
        {/* @ts-ignore */}
        <Testimonials rtl={rtl} />

        {/* @ts-ignore */}
        <FAQ rtl={rtl} />
        {/* @ts-ignore */}
        <Community rtl={rtl} />
      </main>
      {/* @ts-ignore */}
      <Footer />
    </MainLayout>
  );
}
