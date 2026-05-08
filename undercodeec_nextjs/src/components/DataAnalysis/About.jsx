import React, { useState } from 'react';
import { ShieldCheck, Lock, Fingerprint, ClipboardCheck, RefreshCw } from 'lucide-react';

const securityFeatures = [
  {
    title: "Cifrado de Datos",
    icon: Lock,
    desc: "Protegemos la información sensible de tu empresa con algoritmos de cifrado avanzados (AES-256, TLS) para asegurar que solo personal autorizado tenga acceso a los datos de tu negocio en Ecuador."
  },
  {
    title: "Autenticación Multifactor (MFA)",
    icon: Fingerprint,
    desc: "Añadimos capas extra de seguridad requiriendo múltiples formas de verificación para acceder a tus sistemas críticos, protegiendo tu software empresarial contra accesos no autorizados."
  },
  {
    title: "Cumplimiento de Normativas",
    icon: ClipboardCheck,
    desc: "Aseguramos que tu software empresarial cumpla con los estándares legales, regulaciones de protección de datos y normativas vigentes en Ecuador, incluyendo certificaciones del SRI para facturación electrónica."
  },
  {
    title: "Actualizaciones de Seguridad",
    icon: RefreshCw,
    desc: "Mantenemos tu sistema siempre al día con los últimos parches de seguridad para mitigar cualquier vulnerabilidad emergente."
  }
];

const About = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="about style-8 style-5 section-padding bg-gray2">
      <div className="container">
        <div className="content">
          <div className="row align-items-center justify-content-between">
            <div className="col-lg-6">
              <div className="img mb-4 mb-lg-0 wow fadeIn">
                <img src="/assets/img/about/3d_vector2.svg" alt="Seguridad en software empresarial para PYMES en Ecuador - protección de datos" />
              </div>
            </div>
            <div className="col-lg-5">
              <div className="info">
                <div className="section-head style-8 mb-40">
                  <h3 className="wow fadeInUp"> Seguridad de Software Empresarial en Ecuador</h3>
                </div>
                <p className="color-666 wow fadeInUp"> En Undercodeec, la seguridad de tus datos y la privacidad de tu negocio son nuestra prioridad. Nuestras soluciones de software empresarial para PYMES en Ecuador están diseñadas con estrictas medidas de seguridad — cifrado de datos, autenticación multifactor y cumplimiento de normativas — para garantizar que toda la información que maneja tu empresa esté protegida frente a amenazas externas y vulnerabilidades. </p>
                <div className="line-links d-flex flex-column align-items-start mt-30">
                  {
                    securityFeatures.map((feature, index) => {
                      const isActive = activeIndex === index;
                      const Icon = feature.icon;
                      return (
                        <div key={index} className="w-100 mb-1">
                          <a 
                            href="#!" 
                            className="animated-link wow fadeInUp w-100"
                            onClick={(e) => { e.preventDefault(); setActiveIndex(isActive ? -1 : index); }}
                            style={{
                              borderColor: isActive ? '#600b56' : '#ddd',
                              color: isActive ? '#600b56' : '#666',
                              backgroundColor: isActive ? '#f8f9fa' : 'transparent',
                              textDecoration: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '13px 15px',
                              borderRadius: '8px',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Icon size={20} className="me-3" strokeWidth={isActive ? 2.5 : 1.5} />
                            <span className="fw-bold">{ feature.title }</span>
                          </a>
                          
                          {isActive && (
                            <div className="mt-1 mb-3 p-3 rounded-3 bg-white text-muted border-start border-4 wow fadeIn" style={{ fontSize: '14px', lineHeight: '1.6', borderColor: '#600b56', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                              { feature.desc }
                            </div>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
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
      </div>
    </section>
  )
}

export default About
