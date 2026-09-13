"use client";

import { useEffect, useRef, ReactNode } from "react";
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
      <Navbar navbarRef={navbarRef} />
      <main>{children}</main>
    </>
  );
};

export default PreviewLayout;
