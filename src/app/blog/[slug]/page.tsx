import type { Metadata } from "next";
import blogData from "@/data/Blog/blog-grid.json";
import BlogDetailClient from "./BlogDetailClient";

const SITE_URL = "https://undercodeec.com";
type BlogPostData = (typeof blogData)[number];
type BlogContentBlock = BlogPostData["content"][number];

export function generateStaticParams() {
  return blogData.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Artículo No Encontrado - Undercodeec",
      description: "El artículo solicitado no se encuentra disponible.",
      robots: { index: false, follow: false },
    };
  }

  const keywords =
    post.keywords && post.keywords.length > 0
      ? post.keywords
      : ["blog undercodeec", "desarrollo web", "marketing digital", "tecnología"];

  const canonical = `${SITE_URL}/blog/${post.slug}/`;
  const imageUrl = post.heroImage || post.image || "/assets/img/undercode-logo.png";
  const absoluteImage = imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`;
  const authorName = post.author?.name || "Equipo Undercodeec";

  return {
    title: `${post.title} | Blog Undercodeec`,
    description: post.excerpt || "Lee el artículo completo en el blog oficial de Undercodeec.",
    keywords,
    authors: [{ name: authorName, url: SITE_URL }],
    category: post.category || "Tecnología",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `${post.title} | Blog Undercodeec`,
      description: post.excerpt || "Lee el artículo completo en el blog oficial de Undercodeec.",
      url: canonical,
      siteName: "Undercodeec",
      type: "article",
      locale: "es_ES",
      publishedTime: post.datePublished,
      modifiedTime: post.dateModified || post.datePublished,
      authors: [authorName],
      section: post.category,
      tags: keywords,
      images: [
        {
          url: absoluteImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    alternates: {
      canonical,
    },
  };
}

function buildBreadcrumbJsonLd(post: BlogPostData) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `${SITE_URL}/blog/${post.slug}/`,
      },
    ],
  };
}

function buildBlogPostingJsonLd(post: BlogPostData) {
  const canonical = `${SITE_URL}/blog/${post.slug}/`;
  const imageUrl = post.heroImage || post.image || "/assets/img/undercode-logo.png";
  const absoluteImage = imageUrl.startsWith("http") ? imageUrl : `${SITE_URL}${imageUrl}`;
  const authorName = post.author?.name || "Equipo Undercodeec";

  const bodyText = Array.isArray(post.content)
    ? post.content
        .filter((block: BlogContentBlock) => block.type === "paragraph" || block.type === "heading")
        .map((block: BlogContentBlock) => block.text)
        .join(" ")
    : "";
  const wordCount = bodyText ? bodyText.trim().split(/\s+/).length : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    headline: post.title,
    description: post.excerpt,
    image: [absoluteImage],
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Undercodeec",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/img/undercode-logo.png`,
      },
    },
    keywords: Array.isArray(post.keywords) ? post.keywords.join(", ") : undefined,
    articleSection: post.category,
    inLanguage: "es",
    url: canonical,
    ...(wordCount ? { wordCount } : {}),
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogData.find((p) => p.slug === slug);

  return (
    <>
      {post && (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogPostingJsonLd(post)) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(post)) }}
          />
        </>
      )}
      <BlogDetailClient post={post} />
    </>
  );
}
