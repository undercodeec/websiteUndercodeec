import React from 'react';
import Navbar from '@/components/Navbars/DataAnalysis';

const Header = () => {
  return (
    <header className="style-8 bg-gray2">
      <Navbar />
      <div className="container">
        <div className="content section-padding">
          <div className="row align-items-center gx-0">
            <div className="col-lg-6">
              <div className="info">
                <p className="fw-bold color-main text-decoration-underline text-uppercase wow fadeInUp"> Simplicidad, Eficiencia y Crecimiento </p>
                <h1 className="wow fadeInUp"> Soluciones de Software Esenciales<br />para Pequeños Negocios </h1>
                <p className="wow fadeInUp" style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#555' }}>
                  En Undercodeec, nos especializamos en ofrecer soluciones de software integrales y personalizadas diseñadas para optimizar la eficiencia y crecimiento de tu pequeño o mediano negocio. <br />Nuestro enfoque está en proporcionar herramientas digitales esenciales que ayuden a tu empresa a mantenerse organizada, mejorar la experiencia del cliente y aumentar la productividad.
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="img mt-4 mt-lg-0 wow fadeIn">
                <img src="/assets/img/header/3d_vector_head8.svg" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
