import React from 'react';
import Script from 'next/script';

const Philosophy = ({ rtl }) => {
  return (
    <section className="about section-padding style-5 style-6">
      <div className="content border-0 p-0">
        <div className="container">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-4 order-2 order-lg-0">
              <div className="sec-head mb-30">
                <h2 className="num">
                  <span className="color-grd">
                    { rtl ? 'كلمة' : 'NUESTRA' }<span className="thin"></span>
                  </span>
                </h2>
                <h3 style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: 'linear-gradient(to right, #600b56 0%, #270f31 30%, #270f31 30%, #efa238 73%, #efa238 100%)',
                  fontSize: '70px',
                  fontWeight: '800',
                  lineHeight: '1',
                  marginBottom: '20px',
                  paddingBottom: '15px'
                }}>
                  { rtl ? 'عنا' : 'Filosofía' }
                </h3>
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
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe 
                    src="https://player.vimeo.com/video/1176609262?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479&amp;autoplay=1&amp;muted=1&amp;loop=1&amp;controls=0&amp;title=0&amp;byline=0&amp;portrait=0" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                    title="Creación_de_Video_D_con_Imagen"
                  ></iframe>
                </div>
                <Script src="https://player.vimeo.com/api/player.js" strategy="lazyOnload" />
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
