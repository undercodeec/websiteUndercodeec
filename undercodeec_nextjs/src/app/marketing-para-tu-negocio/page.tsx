"use client";

import MainLayout from "@/layouts/Main";
import Header from "@/components/Startup/Header";
import About from "@/components/Startup/About";
import Services from "@/components/Startup/Services";
import Project from "@/components/Startup/Project";
import ChooseUs from "@/components/Startup/ChooseUs";
import Testimonials from "@/components/Startup/Testimonials";
import Clients from "@/components/Startup/Clients";
import Numbers from "@/components/Startup/Numbers";
import Team from "@/components/Startup/Team";
import Blog from "@/components/Startup/Blog";
import Contact from "@/components/Startup/Contact";
import Footer from "@/components/Startup/Footer";

export default function MarketingParaTuNegocioPage() {
  return (
    <MainLayout>
      <Header rtl={false} isOnePage={false} />
      <main>
        <About rtl={false} />
        <Services rtl={false} />
        <Project rtl={false} />
        <ChooseUs rtl={false} />
        <Testimonials rtl={false} />
        <Clients rtl={false} />
        <Numbers />
        <Team rtl={false} />
        <Blog rtl={false} />
        <Contact rtl={false} />
      </main>
      <Footer />
    </MainLayout>
  );
}
