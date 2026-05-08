import React from 'react';
import faq from '@/data/App/faq-home.json';


const FAQ = ({}) => {
  const data = faq;

  return (
    <section className="faq section-padding style-4 pt-50" data-scroll-index="7">
      <div className="container">
        <div className="section-head text-center style-4 animate-fadeUp">
          <h2 className="mb-30">{ 'Preguntas Frecuentes sobre' } <span>{ 'Sitios Web' }</span> </h2>
        </div>
        <div className="content">
          <div className="faq style-3 style-4">
            <div className="accordion" id="accordionSt4">
              <div className="row gx-5">
                {/* Columna izquierda con 6 preguntas */}
                <div className="col-lg-6">
                  {
                    data.map((item, index) => (
                      index <= 5 && (
                        <div className={`accordion-item ${index === 5 ? '' : 'border-bottom'} rounded-0`} key={index}>
                          <h2 className="accordion-header" id={`heading${item.id + 10}`}>
                            <button className="accordion-button collapsed rounded-0 py-4" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${item.id + 10}`} aria-expanded="true" aria-controls={`collapse${item.id + 10}`}>
                              { item.question }
                            </button>
                          </h2>
                          <div id={`collapse${item.id + 10}`} className="accordion-collapse collapse rounded-0" aria-labelledby={`heading${item.id + 10}`} data-bs-parent="#accordionSt4">
                            <div className="accordion-body">
                              {
                                <div dangerouslySetInnerHTML={{ __html: item.answer.part1 }} />
                              }
                            </div>
                          </div>
                        </div>
                      )
                    ))
                  }
                </div>

                {/* Columna derecha con las siguientes 6 preguntas */}
                <div className="col-lg-6">
                  {
                    data.map((item, index) => (
                      index > 5 && (
                        <div className={`accordion-item ${index === data.length - 1 ? '' : 'border-bottom'} rounded-0`} key={index}>
                          <h2 className="accordion-header" id={`heading${item.id + 10}`}>
                            <button className="accordion-button collapsed rounded-0 py-4" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${item.id + 10}`} aria-expanded="true" aria-controls={`collapse${item.id + 10}`}>
                              { item.question }
                            </button>
                          </h2>
                          <div id={`collapse${item.id + 10}`} className="accordion-collapse collapse rounded-0" aria-labelledby={`heading${item.id + 10}`} data-bs-parent="#accordionSt4">
                            <div className="accordion-body">
                              {
                                <div dangerouslySetInnerHTML={{ __html: item.answer.part1 }} />
                              }
                            </div>
                          </div>
                        </div>
                      )
                    ))
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ;
