import React from 'react';
import Blogs from './Blogs';
import Sidebar from './Sidebar';

import allNewsData from '@/data/Blog/all-news.json';


const AllNews = ({ isWide, leftSidebar, style = "4" }) => {
  const data = allNewsData;

  return (
    <section className="all-news section-padding blog bg-transparent style-3">
      <div className="container">
        <div className={`row ${isWide ? 'justify-content-center': leftSidebar ? 'gx-5':'gx-4 gx-lg-5'}`}>
          { !isWide && leftSidebar && <Sidebar data={data.sidebar} style={style} /> }
          <Blogs blogs={data.blogs} isWide={isWide} style={style} />
          { !isWide && !leftSidebar && <Sidebar data={data.sidebar} style={style} /> }
        </div>
      </div>
    </section>
  )
}

export default AllNews
