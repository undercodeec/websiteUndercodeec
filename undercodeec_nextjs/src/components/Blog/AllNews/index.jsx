import React from 'react';
import Blogs from './Blogs';
import Sidebar from './Sidebar';

import allNewsData from '@/data/Blog/all-news.json';
import allNewsDataRTL from '@/data/Blog/all-news-rtl.json';

const AllNews = ({ isWide, leftSidebar, style = "4", rtl }) => {
  const data = rtl ? allNewsDataRTL : allNewsData;

  return (
    <section className="all-news section-padding blog bg-transparent style-3">
      <div className="container">
        <div className={`row ${isWide ? 'justify-content-center': leftSidebar ? 'gx-5':'gx-4 gx-lg-5'}`}>
          { !isWide && leftSidebar && <Sidebar data={data.sidebar} style={style} rtl={rtl} /> }
          <Blogs blogs={data.blogs} isWide={isWide} style={style} rtl={rtl} />
          { !isWide && !leftSidebar && <Sidebar data={data.sidebar} style={style} rtl={rtl} /> }
        </div>
      </div>
    </section>
  )
}

export default AllNews
