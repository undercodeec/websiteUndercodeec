import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "UNDER CODEEC | Agencia Digital - Desarrollo Web, Apps y SEO",
  description:
    "UNDER CODEEC es una agencia digital especializada en diseño y desarrollo de páginas web profesionales, aplicaciones móviles, software empresarial a medida y posicionamiento SEO.",
  keywords: [
    "under codeec",
    "undercodeec",
    "agencia digital under codeec",
    "agencia desarrollo web Ecuador",
    "agencia desarrollo web Quito",
    "agencia desarrollo de apps",
    "agencia SEO Ecuador",
  ],
  alternates: {
    canonical: `${SITE_URL}/undercodeec/`,
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
    title: "UNDER CODEEC | Agencia Digital",
    description:
      "Agencia digital especializada en desarrollo web, apps móviles, software a medida y SEO.",
    url: `${SITE_URL}/undercodeec/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "UNDER CODEEC - Agencia digital",
      },
    ],
  },
};

export default function UnderCodeecLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
