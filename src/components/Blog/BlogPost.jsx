"use client";
import React from 'react';
import Link from 'next/link';

const BlogPost = ({ post }) => {
  if (!post) return null;

  return (
    <article
      className="blog-post-detail"
      itemScope
      itemType="https://schema.org/BlogPosting"
    >
      <meta itemProp="mainEntityOfPage" content={typeof window !== 'undefined' ? window.location.href : ''} />
      {post.datePublished && (
        <meta itemProp="datePublished" content={post.datePublished} />
      )}
      {(post.dateModified || post.datePublished) && (
        <meta itemProp="dateModified" content={post.dateModified || post.datePublished} />
      )}

      {/* Hero Image */}
      <figure className="blog-hero" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
        <img src={post.heroImage || post.image} alt={post.title} itemProp="url" />
        <div className="blog-hero-overlay" />
      </figure>

      <div className="container">
        <div className="blog-post-content">
          {/* Breadcrumb */}
          <nav className="blog-breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">{post.category}</span>
          </nav>

          {/* Title */}
          <header>
            <h1 className="blog-post-title" itemProp="headline">{post.title}</h1>

            {/* Meta */}
            <div className="blog-post-meta">
              <div
                className="blog-author"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <img src={post.author?.avatar || '/assets/img/undercode-logo.png'} alt={post.author?.name} />
                <div>
                  <span className="author-name" itemProp="name">{post.author?.name || 'Equipo Undercodeec'}</span>
                  <time className="post-date" dateTime={post.datePublished || undefined}>
                    {post.date}
                  </time>
                </div>
              </div>
              <div className="blog-categories">
                {post.category.split(', ').map((cat, i) => (
                  <span key={i} className="blog-category-tag" itemProp="articleSection">{cat}</span>
                ))}
              </div>
            </div>
          </header>

          <hr className="blog-divider" />

          {/* Article Body */}
          <section className="blog-body" itemProp="articleBody">
            {post.content?.map((block, index) => {
              switch (block.type) {
                case 'heading':
                  return <h2 key={index} className="blog-section-heading">{block.text}</h2>;
                case 'paragraph':
                  return <p key={index} className="blog-paragraph">{block.text}</p>;
                case 'image':
                  return (
                    <figure key={index} className="blog-figure">
                      <img src={block.src} alt={block.alt} />
                      {block.alt && <figcaption>{block.alt}</figcaption>}
                    </figure>
                  );
                case 'list':
                  return (
                    <ul key={index} className="blog-list">
                      {block.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  );
                default:
                  return null;
              }
            })}
          </section>

          {/* Share & Back */}
          <div className="blog-footer-actions">
            <Link href="/blog" className="blog-back-btn">
              <i className="fas fa-arrow-left"></i> Volver al Blog
            </Link>
            <div className="blog-share">
              <span>Compartir:</span>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + (typeof window !== 'undefined' ? window.location.href : ''))}`} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
