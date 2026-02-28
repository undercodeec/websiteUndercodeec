import React from 'react';

const FirstContent = ({ features, rtl }) => {
  return (
    <div className="content frs-content"  id="about" data-scroll-index="2">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-6">
            <div className="img mb-30 mb-lg-0">
              <img src="/assets/img/about/ipad.png" alt="" />
            </div>
          </div>
          <div className="col-lg-5">
            <div className="info">
              <div className="section-head style-4">
                <h2 className="mb-30">{ rtl ? 'تطبيق لاصحاب' : 'Diseño' } <span> { rtl ? 'الابداع' : 'Creativo' } </span> </h2>
              </div>
              <p className="text mb-40">
                {
                  rtl && 'حافظ على تركيزك وإنتاجيتك مع مساحة  خالية من الفوضى. الطرق المرنة لتنظيم ملاحظاتك: علامات التجزئة ، دفاتر الملاحظات المتداخلة ، تثبيت الملاحظات في أعلى قائمة الملاحظات ، إلخ.'
                }
                { 
                  !rtl && 
                    <>
                      El diseño en aplicaciones móviles es más que solo una apariencia visual, es la clave para una experiencia de usuario fluida y atractiva. <br />  Un diseño bien pensado no solo mejora la interacción, sino que también hace que la navegación sea intuitiva, eficiente y placentera.
                    </> 
                }
              </p>
              <ul>
                {
                  features.map((item, index) => (
                    <li className="d-flex align-items-center mb-3" key={index}>
                      <small className="icon-30 bg-gray rounded-circle color-blue4 d-inline-flex align-items-center justify-content-center me-3">
                        <i className={item.icon}></i>
                      </small>
                      <h6 className="fw-bold">{item.title}</h6>
                    </li>
                  ))
                }
              </ul>
             
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/img/about/about_s4_lines.png" alt="" className="lines" />
      <img src="/assets/img/about/about_s4_bubble.png" alt="" className="bubble" />
    </div>
  )
}

export default FirstContent;
