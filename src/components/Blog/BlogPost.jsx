import Image from "next/image";
import Link from "next/link";
import styles from "./BlogPost.module.css";

const SITE_URL = "https://undercodeec.com";

function headingId(text, index) {
  const slug = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
  return `${slug || "seccion"}-${index}`;
}

export default function BlogPost({ post }) {
  if (!post) return null;
  const canonical = `${SITE_URL}/blog/${post.slug}/`;
  const headings = post.content
    .map((block, index) => block.type === "heading" ? { text: block.text, id: headingId(block.text, index) } : null)
    .filter(Boolean);

  return (
    <article className={styles.article} itemScope itemType="https://schema.org/BlogPosting">
      <meta itemProp="mainEntityOfPage" content={canonical} />
      {post.datePublished && <meta itemProp="datePublished" content={post.datePublished} />}
      <meta itemProp="dateModified" content={post.dateModified || post.datePublished} />

      <figure className={styles.heroImage} itemProp="image" itemScope itemType="https://schema.org/ImageObject">
        <Image
          src={post.heroImage || post.image}
          alt={post.title}
          fill
          priority
          sizes="100vw"
          itemProp="url"
        />
        <figcaption>
          <span>{post.category}</span>
          <span>Undercodeec Journal</span>
        </figcaption>
      </figure>

      <div className={styles.articleLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.articleFacts}>
            <p>Publicado</p>
            <time dateTime={post.datePublished || undefined}>{post.date}</time>
            <p>Escrito por</p>
            <span itemProp="author" itemScope itemType="https://schema.org/Organization">
              <span itemProp="name">{post.author?.name || "Equipo Undercodeec"}</span>
            </span>
            <p>Categoría</p>
            <span itemProp="articleSection">{post.category}</span>
          </div>

          {headings.length > 0 && (
            <nav className={styles.tableOfContents} aria-label="Contenido del artículo">
              <p>En este artículo</p>
              <ol>
                {headings.map((heading, index) => (
                  <li key={heading.id}><a href={`#${heading.id}`}><span>{String(index + 1).padStart(2, "0")}</span>{heading.text}</a></li>
                ))}
              </ol>
            </nav>
          )}
        </aside>

        <section className={styles.body} itemProp="articleBody">
          <p className={styles.lead}>{post.excerpt}</p>
          {post.content.map((block, index) => {
            if (block.type === "heading") {
              return <h2 id={headingId(block.text, index)} key={index}>{block.text}</h2>;
            }
            if (block.type === "paragraph") {
              return <p key={index}>{block.text}</p>;
            }
            if (block.type === "image") {
              return (
                <figure className={styles.contentImage} key={index}>
                  <Image src={block.src} alt={block.alt || ""} width={1200} height={675} sizes="(max-width: 700px) 94vw, 67vw" />
                  {block.alt && <figcaption>{block.alt}</figcaption>}
                </figure>
              );
            }
            if (block.type === "list") {
              return (
                <ul key={index}>
                  {block.items.map((item, itemIndex) => <li key={`${itemIndex}-${item.slice(0, 24)}`}>{item}</li>)}
                </ul>
              );
            }
            return null;
          })}

          <footer className={styles.actions}>
            <Link href="/blog">← Volver al blog</Link>
            <div aria-label="Compartir artículo">
              <span>Compartir</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonical)}`} target="_blank" rel="noopener noreferrer">Facebook ↗</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">X ↗</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${canonical}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
            </div>
          </footer>
        </section>
      </div>
    </article>
  );
}
