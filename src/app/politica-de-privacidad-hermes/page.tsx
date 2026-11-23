import type { Metadata } from "next";
import HermesPolicies from "@/components/HermesPolicies/HermesPolicies";

export const metadata: Metadata = {
  title: "Política de privacidad de Hermes | Undercodeec",
  description: "Conoce cómo Hermes trata y protege los datos personales y cómo ejercer tus derechos.",
  alternates: { canonical: "https://undercodeec.com/politica-de-privacidad-hermes/" },
  openGraph: { title: "Política de privacidad de Hermes | Undercodeec", description: "Tratamiento y protección de datos personales en Hermes.", url: "https://undercodeec.com/politica-de-privacidad-hermes/", type: "website" },
};

export default function Page() { return <HermesPolicies type="privacy" />; }
