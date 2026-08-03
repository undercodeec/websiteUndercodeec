import React from 'react';
import Link from 'next/link';

const ComingSoon = () => {
  return (
    <section className="coming-soon-page style-5 section-padding">
      <div className="container">
        <div className="content">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 text-center">
              <div className="info">
                <div className="icon mb-30">
                  <img src="/assets/img/icons/rocket.png" alt="Coming Soon" style={{ width: '80px' }} />
                </div>
                <h2 className="mb-20"> Próximamente </h2>
                <p className="color-777 mb-40"> 
                  Esta sección se encuentra en etapa de desarrollo. 
                  Estamos trabajando para brindarte la mejor experiencia.
                </p>
                <Link href="/" className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold">
                  <span> <i className="fas fa-long-arrow-left me-2"></i> Regresar al Inicio </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .coming-soon-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          background: #fff;
        }
        .coming-soon-page h2 {
          font-size: 45px;
          font-weight: bold;
          background: linear-gradient(to right, #007bff, #6610f2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        @media (max-width: 991px) {
          .coming-soon-page h2 {
            font-size: 35px;
          }
        }
      `}</style>
    </section>
  );
};

export default ComingSoon;
