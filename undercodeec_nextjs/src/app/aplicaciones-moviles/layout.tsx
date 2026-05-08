import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Desarrollo de Aplicaciones Móviles en Ecuador | Apps Android e iOS - Undercodeec",
  description:
    "Empresa de desarrollo de aplicaciones móviles en Quito y Ecuador. Creamos apps nativas y multiplataforma para Android e iOS. Diseño UI/UX, apps de e-commerce, delivery, gestión empresarial y más. Presupuesto personalizado para tu proyecto.",
  keywords: [
    "desarrollo de aplicaciones móviles Ecuador",
    "desarrollo de apps Android iOS Quito",
    "empresa de desarrollo de apps Ecuador",
    "crear aplicación móvil para empresa",
    "programadores de aplicaciones móviles Quito",
    "desarrollo de apps nativas Ecuador",
    "desarrollo de apps multiplataforma Ecuador",
    "desarrollo de apps Flutter React Native",
    "aplicaciones móviles para PYMES Ecuador",
    "diseño de apps móviles Quito",
    "desarrollo de apps e-commerce móvil",
    "apps de delivery y logística Ecuador",
    "apps de gestión empresarial Android iOS",
    "desarrollo de software móvil Quito",
    "presupuesto desarrollo de aplicaciones móviles",
    "agencia de desarrollo de apps profesionales",
    "aplicaciones móviles seguras y de alto rendimiento",
    "publicar app en Play Store y App Store Ecuador",
    "diseño UX UI aplicaciones móviles",
    "consultoría desarrollo de apps Ecuador",
  ],
  openGraph: {
    title: "Desarrollo de Aplicaciones Móviles | Undercodeec - Quito, Ecuador",
    description:
      "Creamos aplicaciones móviles innovadoras para Android e iOS. Diseño intuitivo, alto rendimiento y experiencias móviles que impactan. Empresa de apps en Ecuador.",
    url: "https://undercodeec.com/aplicaciones-moviles",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
  },
  alternates: {
    canonical: "https://undercodeec.com/aplicaciones-moviles",
  },
};

export default function AplicacionesMovilesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
