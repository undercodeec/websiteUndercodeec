import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Noticias | Undercodeec",
  description: "Próximamente publicaremos novedades y noticias relevantes de Undercodeec.",
  alternates: {
    canonical: `${SITE_URL}/noticias/`,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function NoticiasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
