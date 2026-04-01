import React from 'react';

const faqData = [
  {
    id: 1,
    question: "¿Cuánto tiempo toma desarrollar un sistema a medida para mi negocio?",
    answer: "El tiempo varía según la complejidad, pero un MVP funcional suele estar listo en 4 a 8 semanas. Trabajamos con metodologías ágiles para entregarte avances quincenales y que puedas ver resultados desde el primer mes."
  },
  {
    id: 2,
    question: "¿Puedo empezar con algo pequeño e ir ampliando después?",
    answer: "¡Totalmente! Diseñamos arquitecturas escalables. Puedes comenzar con las funciones críticas y añadir nuevos módulos a medida que tu negocio crezca, sin perder lo ya invertido y asegurando una evolución fluida."
  },
  {
    id: 3,
    question: "¿Qué pasa si ya tengo un sistema y quiero integrarlo?",
    answer: "Contamos con expertos en integración de APIs y bases de datos. Podemos conectar tu nuevo software con herramientas existentes (contabilidad, CRMs, ERPs) para crear un flujo de datos unificado y eficiente."
  },
  {
    id: 4,
    question: "¿Cómo se maneja el soporte y las actualizaciones?",
    answer: "Ofrecemos planes de mantenimiento preventivo y correctivo. Tu software nunca se quedará atrás; nos encargamos de las actualizaciones técnicas y de seguridad mientras tú te enfocas en lo más importante: vender."
  },
  {
    id: 5,
    question: "¿Mis datos están seguros?",
    answer: "La seguridad es el núcleo de nuestro desarrollo. Implementamos el cifrado y las protecciones detalladas en nuestra sección de seguridad anterior, cumpliendo con estándares internacionales para garantizar la integridad de tu información."
  }
];

const FAQ = () => {
  return (
    <section className="faq section-padding style-4 pt-50 mb-100" data-scroll-index="7">
      <div className="container">
        <div className="section-head text-center style-4 mb-60">
          <h2 className="mb-30"> Preguntas <span> Frecuentes </span> </h2>
          <p className="text-muted"> Resolvemos tus dudas para que des el paso hacia la transformación digital con confianza. </p>
        </div>
        <div className="content">
          <div className="faq style-3 style-4">
            <div className="accordion" id="accordionSoftware">
              <div className="row gx-5">
                <div className="col-lg-6">
                  {
                    faqData.slice(0, 3).map((item, index) => (
                      <div className={`accordion-item ${index === 2 ? '':'border-bottom'} rounded-0`} key={item.id}>
                        <h2 className="accordion-header" id={`heading${item.id}`}>
                          <button 
                            className={`accordion-button ${index === 0 ? '' : 'collapsed'} rounded-0 py-4`} 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target={`#collapse${item.id}`} 
                            aria-expanded={index === 0 ? "true" : "false"} 
                            aria-controls={`collapse${item.id}`}
                            style={{ fontWeight: 'bold' }}
                          >
                            { item.question }
                          </button>
                        </h2>
                        <div id={`collapse${item.id}`} className={`accordion-collapse collapse ${index === 0 ? 'show' : ''} rounded-0`} aria-labelledby={`heading${item.id}`} data-bs-parent="#accordionSoftware">
                          <div className="accordion-body color-666">
                            { item.answer }
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
                <div className="col-lg-6">
                  {
                    faqData.slice(3).map((item, index) => (
                      <div className={`accordion-item ${index === 1 ? '':'border-bottom'} rounded-0`} key={item.id}>
                        <h2 className="accordion-header" id={`heading${item.id}`}>
                          <button 
                            className="accordion-button collapsed rounded-0 py-4" 
                            type="button" 
                            data-bs-toggle="collapse" 
                            data-bs-target={`#collapse${item.id}`} 
                            aria-expanded="false" 
                            aria-controls={`collapse${item.id}`}
                            style={{ fontWeight: 'bold' }}
                          >
                            { item.question }
                          </button>
                        </h2>
                        <div id={`collapse${item.id}`} className="accordion-collapse collapse rounded-0" aria-labelledby={`heading${item.id}`} data-bs-parent="#accordionSoftware">
                          <div className="accordion-body color-666">
                            { item.answer }
                          </div>
                        </div>
                      </div>
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
