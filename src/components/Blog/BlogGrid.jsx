"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import blogData from "@/data/Blog/blog-grid.json";
import styles from "./BlogGrid.module.css";

const ALL_POSTS = "Todos";

function ArticleCard({ post, featured = false, index }) {
  return (
    <article className={`${styles.articleCard} ${featured ? styles.featuredCard : ""}`} data-blog-reveal>
      <Link className={styles.imageLink} href={`/blog/${post.slug || post.id}`} aria-label={`Leer ${post.title}`}>
        <figure className={styles.articleImage}>
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes={featured ? "(max-width: 700px) 94vw, 58vw" : "(max-width: 700px) 94vw, 31vw"}
          />
          <span className={styles.articleNumber}>{String(index + 1).padStart(2, "0")}</span>
        </figure>
      </Link>

      <div className={styles.articleInfo}>
        <div className={styles.articleMeta}>
          <span>{post.category}</span>
          <time dateTime={post.datePublished || undefined}>{post.date}</time>
        </div>
        <h3><Link href={`/blog/${post.slug || post.id}`}>{post.title}</Link></h3>
        <p>{post.excerpt}</p>
        <div className={styles.articleFooter}>
          <span>{post.author?.name || "Equipo Undercodeec"}</span>
          <Link href={`/blog/${post.slug || post.id}`} aria-label={`Leer artículo: ${post.title}`}>Leer artículo <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </article>
  );
}

export default function BlogGrid() {
  const surfaceRef = useRef(null);
  const [filter, setFilter] = useState(ALL_POSTS);
  const categories = useMemo(() => [
    ALL_POSTS,
    ...Array.from(new Set(blogData.flatMap((post) => post.category.split(", ")))),
  ], []);
  const filteredPosts = filter === ALL_POSTS
    ? blogData
    : blogData.filter((post) => post.category.split(", ").includes(filter));

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return undefined;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();

    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.utils.toArray("[data-blog-reveal]").forEach((item) => {
          gsap.fromTo(item, { y: 34, autoAlpha: 0 }, {
            y: 0,
            autoAlpha: 1,
            duration: .85,
            ease: "power4.out",
            scrollTrigger: { trigger: item, start: "top 90%", once: true },
          });
        });
      }, surface);
      return () => context.revert();
    });

    return () => media.revert();
  }, []);

  return (
    <section ref={surfaceRef} className={styles.surface} aria-labelledby="blog-publications-title">
      <header className={styles.sectionHeader} data-blog-reveal>
        <p className={styles.sectionMeta}>02 / Publicaciones</p>
        <h2 id="blog-publications-title" className={styles.sectionTitle}>Ideas que vale la pena desarrollar.</h2>
        <p className={styles.headerCopy}>Contenido para comprender cambios tecnológicos, evaluar oportunidades y construir mejores productos digitales.</p>
      </header>

      <div className={styles.filterBar} data-blog-reveal>
        <p><span>{String(filteredPosts.length).padStart(2, "0")}</span> artículos</p>
        <div className={styles.filters} aria-label="Filtrar artículos por categoría">
          {categories.map((category) => (
            <button
              type="button"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.articleGrid} key={filter}>
        {filteredPosts.map((post, index) => (
          <ArticleCard
            post={post}
            index={blogData.findIndex((item) => item.id === post.id)}
            featured={filter === ALL_POSTS && index === 0}
            key={post.id}
          />
        ))}
      </div>

      {filteredPosts.length === 0 && <p className={styles.emptyState}>No hay publicaciones en esta categoría.</p>}
    </section>
  );
}
