import React from 'react';
import Link from 'next/link';

const BlogCard = ({ blog, isCenter, rtl }) => {
  return (
    <div className={`blog-card${isCenter ? ' card-center':''} style-6`}>
      {
        rtl ?
        <Link href="rtl-page-single-post" className="img img-cover d-block">
          <img src={blog.cover} alt="" />
        </Link>
        :
        <Link href="/page-single-post-5" className="img img-cover d-block">
          <img src={blog.cover} alt="" />
        </Link>
      }
      <div className="info">
        <div className="date">
          <a href="#" className="small color-blue6 fs-12px pe-3 border-end brd-gray text-uppercase fw-bold me-3"> news </a>
          {
            rtl ?
            <small className="op-6 fs-12px"> <i className="far fa-clock"></i> تم النشر </small>
            :
            <small className="op-6 fs-12px"> <i className="far fa-clock"></i> Posted on </small>
          }
          <a href="#" className="fs-12px ms-1">{ blog.time }</a>
        </div>
        <h4 className="blog-title">
          {
            rtl ?
            <Link href="rtl-page-single-post">{ blog.title }</Link>
            :
            <Link href="/page-single-post-5">{ blog.title }</Link>
          }
        </h4>
        <div className="text">
          { blog.short_desc } [...]
        </div>
        <div className="d-flex small mt-20 align-items-center justify-content-between op-9">
          <div className="l_side d-flex align-items-center">
            <span className="icon-10 rounded-circle d-inline-flex justify-content-center align-items-center text-uppercase bg-blue2 p-2 me-2  text-white">
              { blog.placeholderImageText }
            </span>
            <a href="#">
              {
                rtl ?
                <small className="text-muted me-1">بواسطة</small> 
                :
                <small className="text-muted me-1">By</small> 
              }
               { blog.author }
            </a>
          </div>
          <div className="r-side mt-1">
            <i className="bi bi-chat-left-text me-1"></i>
            <a href="#">{ blog.comments }</a>
            <i className="bi bi-eye ms-4 me-1"></i>
            <a href="#">{ blog.views }</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BlogCard
