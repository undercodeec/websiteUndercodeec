import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Diseño de Páginas Web en Ecuador | Quito y Guayaquil | Undercodeec",
  description:
    "Diseñamos páginas web profesionales en Ecuador para empresas de Quito, Guayaquil y todo el país. Desarrollo web, ecommerce, apps, software y SEO.",
  keywords: [
    "páginas web en Ecuador",
    "diseño de páginas web en Ecuador",
    "diseño web Ecuador",
    "desarrollo web Ecuador",
    "páginas web Quito",
    "diseño web Quito",
    "desarrollo web Quito",
    "páginas web Guayaquil",
    "diseño web Guayaquil",
    "desarrollo web Guayaquil",
    "agencia de diseño web Ecuador",
    "agencia desarrollo web Ecuador",
    "página web profesional Ecuador",
    "presupuesto página web Ecuador",
    "precio página web Ecuador",
    "tiendas online Ecuador",
    "ecommerce Ecuador",
  ],
  alternates: {
    canonical: "https://undercodeec.com/ec/",
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
    title:
      "Diseño de Páginas Web en Ecuador | Quito y Guayaquil | Undercodeec",
    description:
      "Páginas web profesionales para empresas de Quito, Guayaquil y Ecuador. Desarrollo web, ecommerce, apps, software y SEO.",
    url: "https://undercodeec.com/ec/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
    images: [
      {
        url: "https://undercodeec.com/assets/img/undercode-logo.png",
        width: 512,
        height: 512,
        alt: "Undercodeec, diseño y desarrollo web en Ecuador",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Diseño de Páginas Web en Ecuador | Quito y Guayaquil | Undercodeec",
    description:
      "Páginas web profesionales para empresas de Quito, Guayaquil y Ecuador.",
    images: ["https://undercodeec.com/assets/img/undercode-logo.png"],
  },
};

export default function EcuadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
