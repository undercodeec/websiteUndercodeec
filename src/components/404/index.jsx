import React from 'react'

const NotFound = () => {
  return (
    <section className="erorr-page style-5">
      <div className="container">
        <div className="content">
          <div className="row align-items-center">
            <div className="col-lg-4">
              <div className="info">
                <div className="icon">
                  <img src="/assets/img/icons/rocket.png" alt="" />
                </div>
                <h2 className="mb-30"> ¡Ups! Parece que aquí no hay nada. </h2>
                <p className="color-777"> No se encuentra la página que buscas. Te sugerimos volver a la página principal. Es fácil... </p>
                <a href="/" className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold mt-40">
                  <span> <i className="fas fa-long-arrow-left me-2"></i> Regresar al Inicio </span>
                </a>
              </div>
            </div>
            <div className="col-lg-8 text-lg-end">
              <div className="img">
                <img src="/assets/img/404_1.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default NotFound
