"use client";

import { useEffect } from "react";
import MainLayout from "@/layouts/Main";
import Header from "@/components/DataAnalysis/Header";
import Services from "@/components/DataAnalysis/Services";
import About from "@/components/DataAnalysis/About";
import Numbers from "@/components/DataAnalysis/Numbers";
import Projects from "@/components/DataAnalysis/Projects";
import ChooseUs from "@/components/DataAnalysis/ChooseUs";
import Testimonials from "@/components/DataAnalysis/Testimonials";
import Blog from "@/components/DataAnalysis/Blog";
import Footer from "@/components/DataAnalysis/Footer";

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
        <Numbers />
        <Projects />
        <ChooseUs />
        <Testimonials />
        <Blog />
      </main>
      <Footer />
    </MainLayout>
  );
}
