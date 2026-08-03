import type { Metadata } from "next";
import blogData from "@/data/Blog/blog-grid.json";

const SITE_URL = "https://undercodeec.com";

export const metadata: Metadata = {
  title: "Blog Undercodeec | Desarrollo Web, IA, Marketing Digital y Tecnología",
  description:
    "Artículos, guías y noticias sobre desarrollo de software, aplicaciones móviles, inteligencia artificial, marketing digital, WhatsApp Business API y SEO para empresas en Ecuador, España y Latinoamérica.",
  keywords: [
    "blog undercodeec",
    "blog desarrollo de software",
    "blog inteligencia artificial",
    "blog marketing digital",
    "tendencias tecnología 2026",
    "blog aplicaciones móviles",
    "blog SEO Ecuador",
    "blog WhatsApp Business",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog/`,
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
    title: "Blog Undercodeec | Desarrollo Web, IA, Marketing Digital y Tecnología",
    description:
      "Artículos, guías y noticias sobre desarrollo de software, aplicaciones móviles, inteligencia artificial, marketing digital y SEO.",
    url: `${SITE_URL}/blog/`,
    siteName: "Undercodeec",
    type: "website",
    locale: "es_ES",
    images: [
      {
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
        width: 512,
        height: 512,
        alt: "Blog Undercodeec",
      },
    ],
  },
};

const blogJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "Blog Undercodeec",
  url: `${SITE_URL}/blog/`,
  description:
    "Artículos, guías y noticias sobre desarrollo de software, aplicaciones móviles, IA, marketing digital y SEO.",
  inLanguage: "es",
  publisher: {
    "@type": "Organization",
    name: "Undercodeec",
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/assets/img/undercode-logo.png`,
    },
  },
  blogPost: blogData.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    url: `${SITE_URL}/blog/${post.slug}/`,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    image: post.heroImage || post.image,
    author: {
      "@type": "Organization",
      name: post.author?.name || "Equipo Undercodeec",
    },
  })),
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      {children}
    </>
  );
}
