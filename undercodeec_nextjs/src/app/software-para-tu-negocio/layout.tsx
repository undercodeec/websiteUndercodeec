import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Software para tu Negocio en Ecuador | CRM, Inventarios, Facturación Electrónica - Undercodeec",
  description:
    "Soluciones de software empresarial a medida en Quito y Ecuador. Sistemas CRM, control de inventarios, facturación electrónica certificada SRI, e-commerce y automatización de procesos para PYMES. Desarrollo de software personalizado con soporte técnico local.",
  keywords: [
    "software empresarial Ecuador",
    "software para PYMES Ecuador",
    "sistema de gestión para PYMES Quito",
    "software CRM Ecuador",
    "CRM para gestión de ventas y clientes",
    "sistema de control de inventarios Ecuador",
    "software de inventarios en la nube",
    "facturación electrónica Ecuador",
    "software de facturación electrónica certificado SRI",
    "sistema contable y administrativo Ecuador",
    "software ERP Ecuador",
    "desarrollo de software a medida Quito",
    "automatización de procesos empresariales",
    "e-commerce para negocios Ecuador",
    "tienda online Ecuador",
    "sistema de ventas y punto de venta",
    "software de gestión empresarial Quito",
    "transformación digital para PYMES Ecuador",
    "soluciones tecnológicas para empresas Quito",
    "desarrollo de software personalizado Ecuador",
  ],
  openGraph: {
    title: "Software para tu Negocio | Undercodeec - Quito, Ecuador",
    description:
      "Soluciones de software a medida: CRM, inventarios, facturación electrónica y e-commerce. Impulsa la transformación digital de tu PYME en Ecuador.",
    url: "https://undercodeec.com/software-para-tu-negocio",
    siteName: "Undercodeec",
    type: "website",
    locale: "es_EC",
  },
  alternates: {
    canonical: "https://undercodeec.com/software-para-tu-negocio",
  },
};

export default function SoftwareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
