"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PRIMARY_ROUTES = new Set([
  "/servicios",
  "/marketing-para-tu-negocio",
  "/software-para-tu-negocio",
  "/aplicaciones-moviles",
  "/contacto",
]);

const ICON_STYLES = [
  "/assets/css/lib/all.min.css",
  "/assets/css/lib/bootstrap-icons.css",
];

function appendStylesheet(href) {
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export default function DeferredSiteStyles() {
  const pathname = usePathname();

  useEffect(() => {
    appendStylesheet("/assets/css/animations.css");
    if (!PRIMARY_ROUTES.has(pathname?.replace(/\/$/, ""))) {
      ICON_STYLES.forEach(appendStylesheet);
    }
  }, [pathname]);

  return null;
}
