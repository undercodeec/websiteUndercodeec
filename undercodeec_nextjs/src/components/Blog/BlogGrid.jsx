import React, { useState } from 'react';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import blogData from '@/data/Blog/blog-grid.json';

const BlogGrid = () => {
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Marketing', 'Web Dev'];

  const filteredBlogs = filter === 'All' 
    ? blogData 
    : blogData.filter(blog => blog.category.includes(filter));

  return (
    <section className="blog-grid section-padding pt-50 bg-light">
      <div className="container">
        {/* Breadcrumb */}
        <div className="row mb-50">
          <div className="col-12">
            <div className="breadcrumb-nav text-muted">
              <Link href="/" className="text-dark fw-bold text-decoration-none">Inicio</Link> <span className="mx-2">/</span> <span className="text-secondary">Blog</span>
            </div>
            <hr className="mt-3" />
          </div>
        </div>

        {/* Title Area */}
        <div className="row mb-50 mt-4">
          <div className="col-lg-8">
            <h1 className="gradient-title tw-text-[32px] sm:tw-text-[40px] md:tw-text-[64px] tw-font-bold tw-leading-tight mb-3">Blog</h1>
            <p className="text-muted fs-5">
              Bienvenido al blog de Undercodeec, tu recurso de referencia para obtener información de vanguardia sobre marketing digital.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="row mb-40">
          <div className="col-12 d-flex gap-3">
            {categories.map((cat, index) => (
              <button 
                key={index} 
                onClick={() => setFilter(cat)}
                className={`btn rounded-pill px-4 py-2 fw-bold text-muted bg-white ${filter === cat ? 'border border-primary text-primary shadow-sm' : 'border border-light shadow-sm'}`}
                style={{ fontSize: '13px', transition: 'all 0.3s ease' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="row">
          {filteredBlogs.map((blog) => (
            <div className="col-lg-3 col-md-6 mb-4" key={blog.id}>
              <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden" style={{ transition: 'transform 0.3s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {blog.image && (
                  <img src={blog.image} className="card-img-top" alt={blog.title} style={{ height: '200px', objectFit: 'cover' }} />
                )}
                {blog.iframe && (
                  <div className="w-100" dangerouslySetInnerHTML={{ __html: typeof window !== 'undefined' ? DOMPurify.sanitize(blog.iframe, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src'] }) : blog.iframe }} />
                )}
                <div className="card-body p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                      {blog.category.split(', ').map((cat, i) => (
                         <span key={i} className="badge bg-light text-secondary rounded-pill px-3 py-2 fw-normal" style={{ fontSize: '11px' }}>
                           {cat}
                         </span>
                      ))}
                    </div>
                    <small className="text-muted" style={{ fontSize: '12px' }}>{blog.date}</small>
                  </div>
                  <h6 className="card-title fw-bold mb-3 line-clamp-2" style={{ lineHeight: '1.4' }}>
                    <Link href={`/blog/${blog.slug || blog.id}`} className="text-dark text-decoration-none">
                      {blog.title}
                    </Link>
                  </h6>
                  <p className="card-text text-muted fs-13px mt-auto">
                    {blog.excerpt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default BlogGrid;
