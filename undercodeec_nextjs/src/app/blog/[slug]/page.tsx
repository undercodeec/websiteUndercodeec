import blogData from "@/data/Blog/blog-grid.json";
import BlogDetailClient from "./BlogDetailClient";

export function generateStaticParams() {
  return blogData.map((post: any) => ({
    slug: post.slug,
  }));
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = blogData.find((p: any) => p.slug === slug);

  return <BlogDetailClient post={post} />;
}
