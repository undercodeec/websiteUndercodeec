import type { Metadata } from "next";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Trabaja con Undercodeec | Recursos Humanos",
  description:
    "Postula para trabajar con Undercodeec. Buscamos perfiles de desarrollo, diseno, marketing, ventas y soporte para proyectos digitales.",
  alternates: {
    canonical: `${SITE_URL}/recursos-humanos/`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Trabaja con Undercodeec",
    description:
      "Formulario de postulacion para unirte al equipo de Undercodeec.",
    url: `${SITE_URL}/recursos-humanos/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Undercodeec",
      },
    ],
  },
};

const jobPostingJsonLd = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Talento digital para Undercodeec",
  description:
    "Convocatoria abierta para perfiles de desarrollo web, software, diseno UX/UI, marketing digital, ventas consultivas y soporte tecnico.",
  hiringOrganization: {
    "@type": "Organization",
    name: "Undercodeec",
    sameAs: SITE_URL,
    logo: `${SITE_URL}/assets/img/undercode-logo.png`,
  },
  employmentType: ["FULL_TIME", "PART_TIME", "CONTRACTOR"],
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: {
    "@type": "Country",
    name: "Ecuador",
  },
  directApply: true,
};

export default function RecursosHumanosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      {children}
    </>
  );
}
