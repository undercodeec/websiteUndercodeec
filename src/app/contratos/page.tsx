import type { Metadata } from "next";
import ContratosContent from "@/components/Contratos/ContratosContent";

export const metadata: Metadata = {
  title: "Marco Legal y Jurídico — Contratos de Desarrollo de Software | Undercodeec",
  description:
    "Paquete de contratos y plantillas legales para la contratación de servicios de desarrollo de software. Términos, condiciones, NDA, SLA y directrices técnicas.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  openGraph: {
    title: "Marco Legal — Contratos de Software | Undercodeec",
    description:
      "Plantillas legales y directrices técnicas optimizadas para la contratación de servicios de desarrollo de software en entornos digitales.",
    url: "https://undercodeec.com/contratos/",
    siteName: "Undercodeec",
    type: "website",
  },
};

export default function ContratosPage() {
  return <ContratosContent />;
}
