"use client";

import Script from "next/script";

export default function RecaptchaEnterpriseScript() {
  return (
    <Script
      id="recaptcha-enterprise"
      src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
      strategy="lazyOnload"
    />
  );
}
