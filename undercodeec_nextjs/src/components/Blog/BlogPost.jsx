"use client";
import React from 'react';
import Link from 'next/link';

const BlogPost = ({ post }) => {
  if (!post) return null;

  return (
    <article className="blog-post-detail">
      {/* Hero Image */}
      <div className="blog-hero">
        <img src={post.heroImage || post.image} alt={post.title} />
        <div className="blog-hero-overlay" />
      </div>

      <div className="container">
        <div className="blog-post-content">
          {/* Breadcrumb */}
          <div className="blog-breadcrumb">
            <Link href="/">Inicio</Link>
            <span>/</span>
            <Link href="/blog">Blog</Link>
            <span>/</span>
            <span className="current">{post.category}</span>
          </div>

          {/* Title */}
          <h1 className="blog-post-title">{post.title}</h1>

          {/* Meta */}
          <div className="blog-post-meta">
            <div className="blog-author">
              <img src={post.author?.avatar || '/assets/img/undercode-logo.png'} alt={post.author?.name} />
              <div>
                <span className="author-name">{post.author?.name || 'Equipo Undercodeec'}</span>
                <span className="post-date">{post.date}</span>
              </div>
            </div>
            <div className="blog-categories">
              {post.category.split(', ').map((cat, i) => (
                <span key={i} className="blog-category-tag">{cat}</span>
              ))}
            </div>
          </div>

          <hr className="blog-divider" />

          {/* Article Body */}
          <div className="blog-body">
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
          </div>

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
