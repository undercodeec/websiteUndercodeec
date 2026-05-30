"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import initScrollAnimations from "@/common/initScrollAnimations";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import BlogGrid from "@/components/Blog/BlogGrid";
import Footer from "@/components/Saas/Footer";

export default function BlogPage() {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current, true);
    }
    initScrollAnimations();
  }, []);

  return (
    <MainLayout>
      <TopNav style="5" />
      <Navbar navbarRef={navbarRef} bgTransparent={false} />
      <main className="blog-page style-5">
        <BlogGrid />
      </main>
      <Footer noWave={true} />
    </MainLayout>
  );
}
