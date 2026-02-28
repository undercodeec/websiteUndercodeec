import React from 'react';
import community from '@/data/Saas/community.json';
import communityRTL from '@/data/Saas/community-rtl.json';

const Community = ({ rtl }) => {
  const communityData = rtl ? communityRTL : community;

  return (
    <section className="community pt-40 style-5">
      <div className="container">
        <div className="section-head text-center mb-40 style-5">
          <h2 className="mb-20">{ rtl ? 'لماذا' : '¿Por qué' } <span>{ rtl ? 'نحن' : 'elegirnos?' }</span> </h2>
        </div>
        <div className="content rounded-pill">
          {
            communityData.map((item, index) => (
              <div className="commun-card" key={index}>
                <div className="icon">
                  <img src={item.img} alt="" />
                </div>
                <div className="inf">
                  <h5>{ item.title }</h5>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default Community
