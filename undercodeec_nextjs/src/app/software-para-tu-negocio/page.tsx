"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import Header from "@/components/DataAnalysis/Header";
import Services from "@/components/DataAnalysis/Services";
import About from "@/components/DataAnalysis/About";
import Projects from "@/components/DataAnalysis/Projects";
import Numbers from "@/components/DataAnalysis/Numbers";
import Footer from "@/components/DataAnalysis/Footer";

import FAQ from "@/components/DataAnalysis/FAQ";

export default function SoftwareParaTuNegocioPage() {
  useEffect(() => {
    document.body.classList.add("home-style-8");
    return () => document.body.classList.remove("home-style-8");
  }, []);

  return (
    <MainLayout>
      <Header />
      <main>
        <Services />
        <About />
        <Projects />
        <Numbers />
        <FAQ />
      </main>
      <Footer />
    </MainLayout>
  );
}
