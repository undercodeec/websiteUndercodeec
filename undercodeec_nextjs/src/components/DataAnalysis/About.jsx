import React from 'react';

const About = () => {
  return (
    <section className="about style-8 section-padding bg-gray2">
      <div className="container">
        <div className="row align-items-center justify-content-between">
          <div className="col-lg-6">
            <div className="img mb-4 mb-lg-0 wow fadeIn">
              <img src="/assets/img/about/3d_vector2.svg" alt="" />
            </div>
          </div>
          <div className="col-lg-5">
            <div className="info">
              <div className="section-head style-8 mb-40">
                <h3 className="wow fadeInUp"> Seguridad de Software</h3>
              </div>
              <p className="color-666 wow fadeInUp"> En Undercodeec, la seguridad de tus datos y la privacidad de tu negocio son nuestra prioridad. Nuestras soluciones de software están diseñadas con estrictas medidas de seguridad para garantizar que toda la información que maneja tu empresa esté protegida frente a amenazas externas. </p>
              <ul className="mt-30">
                <li className="wow fadeInUp">
                  <img src="/assets/img/about/icon3.svg" alt="" className="icon" />
                  <p> Cifrado de Datos </p>
                </li>
                <li className="wow fadeInUp">
                  <img src="/assets/img/about/icon3.svg" alt="" className="icon" />
                  <p> Autenticación Multifactor (MFA) </p>
                </li>
                <li className="wow fadeInUp">
                  <img src="/assets/img/about/icon3.svg" alt="" className="icon" />
                  <p> Cumplimiento de Normativas </p>
                </li>

                <li className="wow fadeInUp">
                  <img src="/assets/img/about/icon3.svg" alt="" className="icon" />
                  <p> Actualizaciones de Seguridad </p>
                </li>
              </ul>
              {/*Lines comentada importante para futuro diseño
              
              <div className="d-flex align-items-center mt-40 wow fadeInUp">
                <div className="author">
                  <div className="img icon-60 rounded-circle overflow-hidden img-cover me-3 flex-shrink-0">
                    <img src="/assets/img/testimonials/user7.png" alt="" />
                  </div>
                  <div className="inf">
                    <p> Certified By </p>
                    <h6> Alonso D.Dowson </h6>
                  </div>
                </div>
                <img src="/assets/img/about/signature.svg" alt="" className="signature ms-5" />
              </div>

              
              */}
              
            
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
