"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import ComingSoon from "@/components/ComingSoon";
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
      <TopNav style="5" rtl={false} />
      <Navbar navbarRef={navbarRef} bgTransparent={false} />
      <main className="blog-page style-5 color-5">
        <ComingSoon />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
