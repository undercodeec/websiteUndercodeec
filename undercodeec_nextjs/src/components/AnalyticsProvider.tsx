"use client";

import { useEffect } from "react";
import ReactGA from "react-ga4";
import { usePathname } from "next/navigation";

// Initialize Google Analytics
ReactGA.initialize("G-M2XYYRBSLJ");

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: pathname });
  }, [pathname]);

  return <>{children}</>;
}
