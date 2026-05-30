import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agencia de Desarrollo Web, Apps Móviles y SEO en España | Undercodeec",
  description:
    "Agencia digital para empresas en España. Diseño web a medida, aplicaciones móviles para Android e iOS, posicionamiento web (SEO), software empresarial y campañas en Google Ads. Presupuesto sin compromiso en euros.",
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
    title: "Agencia de Desarrollo Web, Apps Móviles y SEO en España | Undercodeec",
    description:
      "Diseño web, aplicaciones móviles, posicionamiento SEO y software a medida para empresas y pymes en España. Hablamos claro y trabajamos con presupuestos transparentes en euros.",
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
