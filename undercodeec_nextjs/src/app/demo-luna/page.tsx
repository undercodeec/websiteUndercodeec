import type { Metadata } from "next";
import LunaExperience from "@/components/DemoLuna/LunaExperience";

export const metadata: Metadata = {
  title: "21 Horas en la Luna — Demo interactiva | Undercodeec",
  description:
    "Experiencia 3D interactiva sobre las 21 horas del Apolo 11 en la superficie lunar. Demo desarrollada por Undercodeec.",
  robots: { index: false, follow: false },
};

export default function DemoLunaPage() {
  return <LunaExperience />;
}
