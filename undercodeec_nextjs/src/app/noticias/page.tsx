"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import Footer from "@/components/Saas/Footer";

export default function NoticiasPage() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current, true);
    }
  }, []);

  return (
    <MainLayout>
      <TopNav style="5" />
      <Navbar navbarRef={navbarRef} bgTransparent={false} />
      <main className="blog-page style-5 color-5">
        <section className="section-padding text-center" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="container">
            <h1 className="mb-30">Noticias</h1>
            <p className="text-muted">Próximamente publicaremos novedades y noticias relevantes.</p>
          </div>
        </section>
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
