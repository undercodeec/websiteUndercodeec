import React from 'react';

const Philosophy = ({ rtl }) => {
  return (
    <section className="about section-padding style-5 style-6">
      <div className="content border-0 p-0">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-4 order-2 order-lg-0">
              <div className="section-head mb-30 style-5">
                <h2>{ rtl ? 'كلمة' : 'Nuestra' } <span>{ rtl ? 'عنا' : 'Filosofía' }</span> </h2>
              </div>
              <p>
                { rtl ? 'مثل أي وكالة عظيمة ، نحن الأفضل بنتاجئنا التي قدمناها لعملنا الأخير. يلتزم مطورونا بالحفاظ على أعلى معايير الويب حتى يتحمل موقعك اختبار الزمن.' : 'En nuestra agencia, creemos que la calidad de nuestro trabajo es lo que realmente nos define. Cada proyecto es una oportunidad para ofrecer soluciones innovadoras y eficientes, siempre con un enfoque en la satisfacción total de nuestros clientes. Nos comprometemos a mantener los más altos estándares de diseño web y desarrollo de aplicaciones móviles, asegurándonos de que cada detalle de tu proyecto esté alineado con tus objetivos.' }
              </p>
              <div className="line-links">
                <a href="#">{ rtl ? 'كن الأول في صناعة تكنولوجيا المعلومات' : 'Innovación constante' }</a>
                <a href="#">{ rtl ? 'سعر تنافسى' : 'Precios Competitivos' }</a>
                <a href="#">{ rtl ? 'تحسين مستوى حياتك' : 'Enfoque en el usuario' }</a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="img">
                <img src="/assets/img/about/filosofia.webp" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="bubbles rotate-center" />
    </section>
  )
}

export default Philosophy
