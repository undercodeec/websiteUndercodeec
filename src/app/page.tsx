"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import PreviewLayout from "@/layouts/Preview";
import HeroSlider from "@/components/Slider/HeroSlider";
import Features from "@/components/Preview/Features";
import InnerPages from "@/components/Preview/InnerPages";
import { fixPreviewStylesheetOrder } from "@/common/fixStylesheetsOrder";
import { usePageReady } from "@/common/usePageReady";

const Demos = dynamic(() => import("@/components/Preview/Demos"));
const BuyNow = dynamic(() => import("@/components/Preview/BuyNow"));
const Portfolio = dynamic(() => import("@/components/Preview/Portfolio"));
const Codei = dynamic(() => import("@/components/Preview/Codei"), { ssr: false });
const BestFeatures = dynamic(() => import("@/components/Preview/BestFeatures"));
const Responsive = dynamic(() => import("@/components/Preview/Responsive"));
const AllFeatures = dynamic(() => import("@/components/Preview/AllFeatures"));
const Testimonials = dynamic(() => import("@/components/Preview/Testimonials"));
const CallToAction = dynamic(() => import("@/components/Preview/CallToAction"));

export default function HomePage() {
  const isReady = usePageReady();

  useEffect(() => {
    document.body.classList.add("index-main");
    return () => document.body.classList.remove("index-main");
  }, []);

  useEffect(() => {
    fixPreviewStylesheetOrder();
  }, []);

  useEffect(() => {
    if (!isReady || !sessionStorage.getItem("scrollToDemos")) return;

    sessionStorage.removeItem("scrollToDemos");
    let attempts = 0;
    const checkAndScroll = window.setInterval(() => {
      attempts += 1;
      const section = document.getElementById("demos");
      if (section || attempts >= 40) {
        window.clearInterval(checkAndScroll);
        section?.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);

    return () => window.clearInterval(checkAndScroll);
  }, [isReady]);

  return (
    <PreviewLayout>
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
