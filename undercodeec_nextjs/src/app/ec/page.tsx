"use client";

import { useEffect } from "react";
import PreviewLayout from "@/layouts/Preview";
import LandingEcuador from "@/components/LandingEcuador/LandingEcuador";
import Footer from "@/components/Saas/Footer";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";

export default function EcuadorPage() {
  useEffect(() => {
    document.body.classList.add("index-main");
    return () => document.body.classList.remove("index-main");
  }, []);

  useEffect(() => {
    fixPreviewStylesheetOrder();
  }, []);

  return (
    <PreviewLayout>
      <LandingEcuador />
      <Footer noWave={true} />
    </PreviewLayout>
  );
}
