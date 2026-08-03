import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Haz crecer tu negocio online | Web, Apps y SEO en España | Undercodeec",
  description:
    "Convierte visitas en clientes con una web que vende. En Undercodeec creamos webs, apps y soluciones SEO a medida para empresas españolas que quieren crecer, destacar y obtener resultados reales. Pide tu presupuesto sin compromiso.",
  keywords: [
    "diseño web España",
    "desarrollo web Madrid",
    "desarrollo web Barcelona",
    "diseño web Valencia",
    "agencia digital España",
    "agencia SEO España",
    "posicionamiento web España",
    "posicionamiento en Google España",
    "desarrollo de apps móviles España",
    "desarrollo de aplicaciones móviles Madrid",
    "apps para Android e iOS España",
    "software empresarial España",
    "software a medida España",
    "facturación electrónica España",
    "Verifactu",
    "tienda online España",
    "ecommerce España",
    "Google Ads España",
    "presupuesto desarrollo web España",
    "transformación digital pymes España",
  ],
  alternates: {
    canonical: "https://undercodeec.com/es/",
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
    title: "Haz crecer tu negocio online | Web, Apps y SEO en España",
    description:
      "Diseño web que convierte, apps a medida y SEO para que tu empresa gane visibilidad y clientes. Estrategia digital clara, resultados medibles y presupuesto a la medida de tu negocio.",
    url: "https://undercodeec.com/es/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
  },
};

export default function EspanaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
