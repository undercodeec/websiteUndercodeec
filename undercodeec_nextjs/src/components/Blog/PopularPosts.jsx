import React from 'react';
import Link from 'next/link';
import posts from '@/data/Blog/popular-posts.json';


const PopularPosts = ({ style = "4" }) => {
  const postsData = posts;

  return (
    <section className="popular-posts pt-50 pb-100 border-bottom brd-gray">
      <div className="container">
        <h5 className="post-sc-title text-center text-uppercase mb-70">{ 'Noticias Populares' }</h5>
        <div className="row gx-5">
          {
            postsData.map((post, index) => (
              <div className={`col-lg-4 ${index !== posts.length - 1 ? 'border-end brd-gray':''}`} key={index}>
                <div className="card border-0 bg-transparent rounded-0 mb-30 mb-lg-0 d-block">
                  <div className="img radius-7 overflow-hidden img-cover">
                    <img src={post.cover} className="card-img-top" alt="..." />
                  </div>
                  <div className="card-body px-0">
                    <small className="d-block date mt-10 fs-10px fw-bold">
                      <a href="#" className={`text-uppercase border-end brd-gray pe-3 me-3 color-blue${style}`}>{ 'News' }</a>
                      <i className="bi bi-clock me-1"></i>
                      <a href="#" className="op-8">{ 'Posted on' } { post.time }</a>
                    </small>
                    <h5 className="fw-bold mt-10 title">
                      <Link href={ "/page-single-post-5" }> 
                        { post.title }
                      </Link>
                    </h5>
                    <p className="small mt-2 op-8 fs-10px">{ post.desc } [...]
                    </p>
                    <div className="d-flex small mt-20 align-items-center justify-content-between op-9">
                      <div className="l_side d-flex align-items-center">
                        <span className="icon-20 rounded-circle d-inline-flex justify-content-center align-items-center text-uppercase bg-main p-1 me-2 text-white">
                          { post.userImgLetter }
                        </span>
                        <a href="#" className="mt-1">
                          { 'By' } { post.username }
                        </a>
                      </div>
                      <div className="r-side mt-1">
                        <i className="bi bi-chat-left-text me-1"></i>
                        <a href="#">{ post.comments }</a>
                        <i className="bi bi-eye ms-4 me-1"></i>
                        <a href="#">{ post.views }</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default PopularPosts
