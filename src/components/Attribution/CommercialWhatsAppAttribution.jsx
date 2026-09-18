"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useConsent } from "@/components/Consent/ConsentManager";
import { useAttribution } from "./AttributionProvider";
import {
  isCommercialWhatsAppUrl,
  resolveAttributedWhatsAppUrl,
} from "@/lib/attribution/whatsapp-client.mjs";

export default function CommercialWhatsAppAttribution() {
  const pathname = usePathname();
  const { buildIntent } = useAttribution();
  const { preferences } = useConsent();

  useEffect(() => {
    const onClick = async (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a[href]");
      if (!anchor || anchor.dataset.attributionManaged === "true") return;
      if (!isCommercialWhatsAppUrl(anchor.href)) return;

      event.preventDefault();
      if (anchor.dataset.attributionPending === "true") return;
      anchor.dataset.attributionPending = "true";
      anchor.setAttribute("aria-busy", "true");

      if ((preferences?.analytics || preferences?.advertising) && Array.isArray(window.dataLayer)) {
        window.dataLayer.push({
          event: "whatsapp_click",
          contact_method: "whatsapp",
          source: "commercial_whatsapp_link",
          page_path: pathname || "/",
        });
      }

      const popup = window.open("about:blank", "_blank");
      if (popup) popup.opener = null;
      const destination = await resolveAttributedWhatsAppUrl(anchor.href, buildIntent());

      delete anchor.dataset.attributionPending;
      anchor.removeAttribute("aria-busy");
      if (popup && !popup.closed) popup.location.replace(destination);
      else window.location.assign(destination);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [buildIntent, pathname, preferences?.advertising, preferences?.analytics]);

  return null;
}
