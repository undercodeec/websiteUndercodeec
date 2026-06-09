"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import PreviewLayout from "@/layouts/Preview";
import HeroSlider from "@/components/Slider/HeroSlider";
import Features from "@/components/Preview/Features";
import InnerPages from "@/components/Preview/InnerPages";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";

// Code-split de secciones below-the-fold. ssr:true (default) mantiene el HTML
// pre-renderizado intacto — SEO se preserva — pero cada sección queda en su
// propio chunk JS, sacando peso del bundle inicial del home.
const Demos = dynamic(() => import("@/components/Preview/Demos"));
const BuyNow = dynamic(() => import("@/components/Preview/BuyNow"));
const Portfolio = dynamic(() => import("@/components/Preview/Portfolio"));
const Codei = dynamic(() => import("@/components/Preview/Codei"));
const BestFeatures = dynamic(() => import("@/components/Preview/BestFeatures"));
const Responsive = dynamic(() => import("@/components/Preview/Responsive"));
const AllFeatures = dynamic(() => import("@/components/Preview/AllFeatures"));
const Testimonials = dynamic(() => import("@/components/Preview/Testimonials"));
const CallToAction = dynamic(() => import("@/components/Preview/CallToAction"));

export default function HomePage() {
  useEffect(() => {
    document.body.classList.add("index-main");
    return () => document.body.classList.remove("index-main");
  }, []);

  useEffect(() => {
    fixPreviewStylesheetOrder();
  }, []);

  return (
    <PreviewLayout>
      {/* GEO answer: párrafo extraíble por IA con respuesta directa "¿qué es Undercodeec?" */}
      <div
        className="visually-hidden geo-answer"
        data-speakable="true"
        aria-hidden="false"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        <h2>¿Qué es Undercodeec?</h2>
        <p>
          Undercodeec es una agencia digital fundada en 2018 con sede en Quito,
          Ecuador, especializada en cuatro servicios: (1) diseño y desarrollo de
          páginas web profesionales, (2) desarrollo de aplicaciones móviles
          Android e iOS, (3) software empresarial a medida — CRM, ERP,
          facturación electrónica, control de inventarios y e-commerce —, y (4)
          marketing digital y posicionamiento SEO con campañas de Google Ads y
          Meta Ads. Atendemos clientes en Ecuador, España y Latinoamérica con
          presupuestos desde 300 USD para SEO y desde 500 USD para páginas web.
          Contacto: gerencia@undercodeec.com · +593-979-046-329.
        </p>
      </div>
      <HeroSlider />
      <Features />
      <InnerPages />
      <Demos />
      <BuyNow />
      <Portfolio />
      <Codei />
      <BestFeatures />
      <Responsive />
      <AllFeatures />
      <Testimonials />
      <CallToAction />
    </PreviewLayout>
  );
}
