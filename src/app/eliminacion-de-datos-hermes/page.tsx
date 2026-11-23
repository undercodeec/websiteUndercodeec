import type { Metadata } from "next";
import HermesPolicies from "@/components/HermesPolicies/HermesPolicies";

export const metadata: Metadata = {
  title: "Eliminación de datos de Hermes | Undercodeec",
  description: "Instrucciones para solicitar la eliminación de datos personales relacionados con Hermes.",
  alternates: { canonical: "https://undercodeec.com/eliminacion-de-datos-hermes/" },
  openGraph: { title: "Eliminación de datos de Hermes | Undercodeec", description: "Cómo solicitar la eliminación de datos personales relacionados con Hermes.", url: "https://undercodeec.com/eliminacion-de-datos-hermes/", type: "website" },
};

export default function Page() { return <HermesPolicies type="deletion" />; }
