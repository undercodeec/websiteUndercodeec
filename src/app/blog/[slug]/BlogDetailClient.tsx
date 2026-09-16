import MainLayout from "@/layouts/Main";
import { PrimaryHeader } from "@/components/Primary";
import PrimaryPageHero from "@/components/Marketing/MarketingHero";
import BlogPost from "@/components/Blog/BlogPost";
import ServiciosPrimaryFooter from "@/components/Servicios/ServiciosPrimaryFooter";
import styles from "./BlogDetailPage.module.css";

type BlogPostData = (typeof import("@/data/Blog/blog-grid.json"))[number];

function splitTitle(title: string, maxLines = 4) {
  const words = title.split(/\s+/).filter(Boolean);
  const targetLength = Math.ceil(title.length / maxLines);
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word, index) => {
    const remainingWords = words.length - index;
    const remainingLines = maxLines - lines.length;
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    const shouldBreak = currentLine && candidate.length > targetLength && remainingWords >= remainingLines;

    if (shouldBreak) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = candidate;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}

export default function BlogDetailClient({ post }: { post?: BlogPostData }) {
  return (
    <MainLayout>
      <div className={styles.page} data-blog-detail-page data-primary-page>
        <PrimaryHeader />
        <main>
          {post ? (
            <>
              <PrimaryPageHero
                label={post.title}
                lines={splitTitle(post.title)}
                topMeta={`Blog / ${post.category} / ${post.date}`}
                summary={post.excerpt}
                bottomMeta={post.author?.name || "Equipo Undercodeec"}
                titleId={`blog-${post.slug}-title`}
                animateAcrossPage={false}
              />
              <BlogPost post={post} />
            </>
          ) : (
            <section className={styles.notFound}>
              <h1>Artículo no encontrado</h1>
              <p>El artículo que buscas no existe.</p>
            </section>
          )}
        </main>
        <ServiciosPrimaryFooter />
      </div>
    </MainLayout>
  );
}
