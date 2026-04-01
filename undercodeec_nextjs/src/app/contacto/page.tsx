"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import ContactSection from "@/components/Contact/Form";
import Map from "@/components/Contact/Map";
import Footer from "@/components/Saas/Footer";

export default function ContactoPage() {
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
      <main className="contact-page style-5">
        <ContactSection />
        <Map />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
