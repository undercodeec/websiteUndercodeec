"use client";

import { useEffect } from "react";
import PreviewLayout from "@/layouts/Preview";
import LandingHosting from "@/components/LandingHosting/LandingHosting";
import Footer from "@/components/Saas/Footer";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";

export default function HostingPage() {
  useEffect(() => {
    document.body.classList.add("index-main");
    return () => document.body.classList.remove("index-main");
  }, []);

  useEffect(() => {
    fixPreviewStylesheetOrder();
  }, []);

  return (
    <PreviewLayout>
      <LandingHosting />
      <Footer noWave={true} />
    </PreviewLayout>
  );
}
