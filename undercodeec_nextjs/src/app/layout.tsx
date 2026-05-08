import type { Metadata } from "next";
import Script from "next/script";
import AIAssistant from "@/components/AIAssistant";
import CustomCursor from "@/components/CustomCursor";
import AudioMuteButton from "@/components/AudioMuteButton";
import PageTransition from "@/components/PageTransition";
import "@/styles/globals.css";
import "@/styles/preloader.css";
import "@/styles/trading-card.css";

export const metadata: Metadata = {
  title: "Undercodeec - Diseño de Páginas Web en Quito y Ecuador",
  description: "Expertos en diseño y desarrollo de páginas web profesionales, aplicaciones móviles y SEO en Quito, Guayaquil y todo el Ecuador. Impulsamos tu negocio digital.",
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
    "agencia de diseño web Quito"
  ],
  metadataBase: new URL("https://undercodeec.com"),
  openGraph: {
    title: "Undercodeec - Diseño Web Profesional en Quito",
    description: "Ofrecemos servicios expertos en diseño web, desarrollo de aplicaciones móviles y SEO.",
    url: "https://undercodeec.com",
    siteName: "Undercodeec",
    type: "website",
  },
  verification: {
    google: "TjIVgYGV2-AduD8UBXsIX_Yf0Q7TwAmOp55hVkZI9ss",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="stylesheet" href="/assets/css/lib/all.min.css" />
        <link rel="stylesheet" href="/assets/css/lib/bootstrap-icons.css" />
        <link rel="stylesheet" href="/assets/css/lib/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/landing-preview/css/preview-style.css" />
        <link rel="stylesheet" href="/assets/css/animations.css" />

      </head>
      <body suppressHydrationWarning={true}>
        <CustomCursor />
        <AIAssistant />
        <AudioMuteButton />
        <PageTransition>
          {children}
        </PageTransition>
        <Script src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} strategy="beforeInteractive" />
        <Script src="/assets/js/lib/pace.js" strategy="afterInteractive" />
        <Script src="/assets/js/lib/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script src="/landing-preview/js/parallax.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
