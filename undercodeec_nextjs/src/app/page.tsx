"use client";

import { useEffect } from "react";
import PreviewLayout from "@/layouts/Preview";
import HeroSlider from "@/components/Slider/HeroSlider";
import Features from "@/components/Preview/Features";
import Demos from "@/components/Preview/Demos";
import InnerPages from "@/components/Preview/InnerPages";
import BuyNow from "@/components/Preview/BuyNow";
import Portfolio from "@/components/Preview/Portfolio";
import Codei from "@/components/Preview/Codei";
import BestFeatures from "@/components/Preview/BestFeatures";
import Responsive from "@/components/Preview/Responsive";
import AllFeatures from "@/components/Preview/AllFeatures";
import Testimonials from "@/components/Preview/Testimonials";
import CallToAction from "@/components/Preview/CallToAction";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";

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
