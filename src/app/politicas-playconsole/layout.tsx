import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Política de Contenido Play Console | Undercodeec",
  description:
    "Política de contenido y privacidad aplicable a las aplicaciones móviles publicadas por Undercodeec en Google Play Console. Términos sobre datos, anuncios y conducta del usuario.",
  keywords: [
    "política de contenido play console",
    "política de privacidad apps undercodeec",
    "play console undercodeec",
    "política de aplicaciones móviles",
  ],
  alternates: {
    canonical: `${SITE_URL}/politicas-playconsole/`,
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
    title: "Política de Contenido Play Console | Undercodeec",
    description:
      "Política de contenido y privacidad de las aplicaciones móviles publicadas por Undercodeec en Google Play Console.",
    url: `${SITE_URL}/politicas-playconsole/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
  },
};

export default function PoliticasPlayConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
