import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Planes de Hosting con Dominio .com Incluido | Undercodeec",
  description:
    "Contrata tu hosting profesional con dominio .com incluido desde $40/año. Planes Basic, Modern y Enterprise con correos corporativos, cPanel y soporte técnico en Ecuador.",
  keywords: [
    "hosting con dominio incluido",
    "hosting ecuador",
    "planes de hosting",
    "hosting con dominio .com",
    "hosting barato ecuador",
    "hosting profesional",
    "plan de hosting basic",
    "plan de hosting modern",
    "plan de hosting enterprise",
    "hosting cPanel ecuador",
    "correos corporativos hosting",
    "hosting wordpress ecuador",
  ],
  alternates: {
    canonical: "https://undercodeec.com/hosting/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Planes de Hosting con Dominio .com Incluido | Undercodeec",
    description:
      "Hosting profesional con dominio .com incluido desde $40/año. Basic, Modern y Enterprise para tu negocio en Ecuador.",
    url: "https://undercodeec.com/hosting/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
  },
};

export default function HostingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
