"use client";

import { useEffect, useRef } from "react";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import MainLayout from "@/layouts/Main";
import TopNav from "@/components/Navbars/TopNav";
import Navbar from "@/components/Navbars/SaasNav";
import NotFound from "@/components/404";

export default function NotFoundPage() {
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
      <main className="erorr-404-page style-5">
        <NotFound />
      </main>
    </MainLayout>
  );
}
