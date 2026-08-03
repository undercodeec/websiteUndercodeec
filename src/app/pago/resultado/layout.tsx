import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resultado del Pago | Undercodeec",
  description: "Página interna de resultado de pago. No indexable.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function PaymentResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
