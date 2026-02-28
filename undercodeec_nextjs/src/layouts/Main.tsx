"use client";

import { ReactNode } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import PreLoader from "@/components/PreLoader";
import MaintenanceOverlay from "@/components/MaintenanceOverlay";

interface MainLayoutProps {
  children: ReactNode;
  scrollTopText?: boolean;
}

const MainLayout = ({ children, scrollTopText = false }: MainLayoutProps) => {
  const pathname = usePathname();

  // Pages where maintenance mode should NOT be shown
  const allowedPaths = ["/", "/undercodeec"];
  const showMaintenance = !allowedPaths.includes(pathname);

  return (
    <>
      <PreLoader />
      {showMaintenance && <MaintenanceOverlay />}
      {children}
      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
};

export default MainLayout;
