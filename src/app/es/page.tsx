"use client";

import { useEffect } from "react";
import PreviewLayout from "@/layouts/Preview";
import LandingEspana from "@/components/LandingEspana/LandingEspana";
import Footer from "@/components/Saas/Footer";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";

export default function EspanaPage() {
  useEffect(() => {
    document.body.classList.add("index-main");
    return () => document.body.classList.remove("index-main");
  }, []);

  useEffect(() => {
    fixPreviewStylesheetOrder();
  }, []);

  return (
    <PreviewLayout>
      <LandingEspana />
      <Footer noWave={true} />
    </PreviewLayout>
  );
}
