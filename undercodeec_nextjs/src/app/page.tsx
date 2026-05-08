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
      <HeroSlider />
      <Features />
      <Demos />
      <InnerPages />
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
