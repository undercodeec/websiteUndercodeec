"use client";

import { useEffect, useRef, ReactNode } from "react";
import Script from "next/script";
import navbarScrollEffect from "@/common/navbarScrollEffect";
import initScrollAnimations from "@/common/initScrollAnimations";
import Navbar from "@/components/Navbars/PreviewNav";

interface PreviewLayoutProps {
  children: ReactNode;
}

const PreviewLayout = ({ children }: PreviewLayoutProps) => {
  const navbarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (navbarRef.current) {
      navbarScrollEffect(navbarRef.current);
    }
  }, []);

  useEffect(() => {
    initScrollAnimations();
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/landing-preview/css/preview-style.css" />
      <Script src="/assets/js/lib/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Navbar navbarRef={navbarRef} />
      <main>{children}</main>
    </>
  );
};

export default PreviewLayout;
