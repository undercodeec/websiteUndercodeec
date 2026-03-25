import React from 'react';
import community from '@/data/Saas/community.json';
import communityRTL from '@/data/Saas/community-rtl.json';

const Community = ({ rtl }) => {
  const communityData = rtl ? communityRTL : community;

  return (
    <section className="community pt-40 style-5">
      <div className="container">
        <div className="sec-head text-center mb-40">
          <h2 className="num">
            <span className="color-grd">
              { rtl ? 'لماذا' : 'COMUNIDAD' }<span className="thin"></span>
            </span>
          </h2>
          <h3 className="text-capitalize tw-text-gray-900">{ rtl ? 'نحن' : '¿Por qué elegirnos?' }</h3>
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
