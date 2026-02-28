import React from 'react'

const Content = ({ texts, number, rtl }) => {
  return (
    <div className="content pb-0">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-4 order-2 order-lg-0">
            <div className="section-head mb-30 style-5">
              <h2>{ rtl ? 'سهل' : 'Desarrollo y ' } <span>{ rtl ? 'التخصيص' : 'Diseño Web' }</span> </h2>
            </div>
            <p>
              { texts.text1 }
            </p>
            <p className="mt-20">
              { texts.text2 }
            </p>
            <a class="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-50" href="/"><span>Saber Más</span></a>

          </div>
          
          <div className="col-lg-8 order-0 order-lg-2">
            <div className="img main-img3">
              <img src="/assets/img/about/about_s5_3_1.png" alt="" className="img-body" />
              
              <img src="/assets/img/about/abaout_baner3.webp" alt="" />
             
              
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Content
