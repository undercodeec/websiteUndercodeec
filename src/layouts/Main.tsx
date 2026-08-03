"use client";

import { ReactNode } from "react";
import Script from "next/script";
import PreLoader from "@/components/PreLoader";

interface MainLayoutProps {
  children: ReactNode;
  scrollTopText?: boolean;
}

const MainLayout = ({ children, scrollTopText = false }: MainLayoutProps) => {
  return (
    <>
      <PreLoader />
      {children}
      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
};

export default MainLayout;
