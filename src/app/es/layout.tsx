import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diseño web España | Desarrollo web Madrid, Barcelona y Valencia | Undercodeec",
  description:
    "Diseño web España para empresas: desarrollo web, ecommerce, apps, software a medida, SEO y Google Ads en Madrid, Barcelona y Valencia.",
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
    title: "Diseño web España | Undercodeec",
    description:
      "Desarrollo web, ecommerce, apps, software a medida, SEO y Google Ads para empresas en España.",
    url: "https://undercodeec.com/es/",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary",
    title: "Diseño web España | Undercodeec",
    description:
      "Desarrollo web, ecommerce, apps, software y posicionamiento en Google para empresas en España.",
  },
};

export default function EspanaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
