import React from 'react';

const faqData = [
  {
    id: 1,
    question: "¿Cuánto tiempo toma desarrollar un sistema de software a medida para mi negocio?",
    answer: "El tiempo de desarrollo de software empresarial varía según la complejidad, pero un MVP funcional suele estar listo en 4 a 8 semanas. Trabajamos con metodologías ágiles para entregarte avances quincenales y que puedas ver resultados desde el primer mes. Nuestro equipo ofrece comunicación directa durante todo el proceso."
  },
  {
    id: 2,
    question: "¿Puedo empezar con un módulo básico e ir ampliando mi software empresarial?",
    answer: "Sí. Diseñamos arquitecturas de software escalables para pequeñas y medianas empresas. Puedes comenzar con funciones críticas como CRM o facturación electrónica y añadir nuevos módulos (inventarios, e-commerce, automatización) a medida que tu negocio crezca, sin perder lo ya invertido."
  },
  {
    id: 3,
    question: "¿Pueden integrar el nuevo software con mis sistemas existentes?",
    answer: "Contamos con expertos en integración de APIs y bases de datos. Podemos conectar tu nuevo software empresarial con herramientas existentes como sistemas contables, CRMs, ERPs, pasarelas de pago y plataformas de facturación electrónica para crear un flujo de datos unificado y eficiente."
  },
  {
    id: 4,
    question: "¿Cómo manejan el soporte técnico y las actualizaciones del software?",
    answer: "Ofrecemos planes de mantenimiento preventivo y correctivo con soporte técnico especializado. Tu software empresarial nunca se quedará atrás; nos encargamos de las actualizaciones técnicas, parches de seguridad y mejoras funcionales mientras tú te enfocas en lo más importante: hacer crecer tu negocio."
  },
  {
    id: 5,
    question: "¿Mis datos empresariales están seguros en el software que desarrollan?",
    answer: "La seguridad es el núcleo de nuestro desarrollo de software. Implementamos cifrado de datos AES-256, autenticación multifactor, cumplimiento normativo y estándares internacionales de protección de datos para garantizar la integridad y privacidad de toda la información de tu empresa."
  }
];

const FAQ = () => {
  return (
    <section className="faq section-padding style-4 pt-50 mb-100" data-scroll-index="7">
      <div className="container">

        <div className="section-head text-center style-4 mb-60 animate-fadeUp">
          <h2 className="mb-30">
            Preguntas Frecuentes sobre <span>Software Empresarial</span>
          </h2>
          <p className="text-muted animate-fadeUp" style={{ transitionDelay: '150ms' }}>
            Resolvemos tus dudas sobre desarrollo de software a medida, CRM, facturación electrónica y transformación digital para empresas.
          </p>
        </div>

        <div className="content">
          <div className="faq style-3 style-4">
            <div className="accordion" id="accordionSoftware">
              <div className="row gx-5">

                <div className="col-lg-6 animate-fadeRight" style={{ transitionDelay: '150ms' }}>
                  {faqData.slice(0, 3).map((item, index) => (
                    <div className={`accordion-item ${index === 2 ? '' : 'border-bottom'} rounded-0`} key={item.id}>
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
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id={`collapse${item.id}`}
                        className={`accordion-collapse collapse ${index === 0 ? 'show' : ''} rounded-0`}
                        aria-labelledby={`heading${item.id}`}
                        data-bs-parent="#accordionSoftware"
                      >
                        <div className="accordion-body color-666">{item.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="col-lg-6 animate-fadeLeft" style={{ transitionDelay: '250ms' }}>
                  {faqData.slice(3).map((item, index) => (
                    <div className={`accordion-item ${index === 1 ? '' : 'border-bottom'} rounded-0`} key={item.id}>
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
                          {item.question}
                        </button>
                      </h2>
                      <div
                        id={`collapse${item.id}`}
                        className="accordion-collapse collapse rounded-0"
                        aria-labelledby={`heading${item.id}`}
                        data-bs-parent="#accordionSoftware"
                      >
                        <div className="accordion-body color-666">{item.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FAQ;
