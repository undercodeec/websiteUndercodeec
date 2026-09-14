"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function RecaptchaEnterpriseScript() {
  const pathname = usePathname();

  if (pathname === "/servicios" || pathname.startsWith("/servicios/")) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      strategy="lazyOnload"
    />
  );
}
