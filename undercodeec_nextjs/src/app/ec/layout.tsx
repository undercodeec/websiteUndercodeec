import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Undercodeec - Diseño de Páginas Web en Quito y Ecuador",
  description:
    "Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y SEO en Quito, Guayaquil y todo el Ecuador. Impulsamos tu negocio digital.",
  keywords: [
    "paginas web en ecuador",
    "pagina web quito",
    "diseño de paginas web en quito",
    "diseño de paginas web quito",
    "paginas web en guayaquil",
    "creacion de paginas web profesionales",
    "creación programación y diseño de páginas web",
    "diseño de pagina web profesional",
    "Desarrollo de Aplicaciones Web",
    "Desarrollo y diseño web",
    "diseño web Quito",
    "desarrollo de apps Quito",
    "seo para páginas web Quito",
    "ecommerce Quito",
    "agencia de diseño web Quito",
  ],
  alternates: {
    canonical: "https://undercodeec.com/ec/",
    languages: {
      "es-EC": "https://undercodeec.com/ec/",
      "es-ES": "https://undercodeec.com/es/",
      "x-default": "https://undercodeec.com/",
    },
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
    title: "Undercodeec - Diseño Web Profesional en Quito",
    description:
      "Ofrecemos servicios expertos en diseño web, desarrollo de aplicaciones móviles y SEO.",
    url: "https://undercodeec.com/ec/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
  },
};

export default function EcuadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
