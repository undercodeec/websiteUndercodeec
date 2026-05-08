import React from 'react';

const Clients = ({}) => {
  return (
    <section className="choose-us section-padding style-6" data-scroll-index="9">
      <div className="container">
        <div className=" section-head mb-70 style-6 text-center">
          <h2 className="text-3xl">¿Cuál es el
            <span> <small> camino ?</small> </span>
          </h2>
        </div>

        <div className="inbound-steps">
          <div className="inbound-step">
            <div className="inbound-circle step-1">
              <div className="circle-title">Conecta</div>
              <div className="circle-subtext">A tus clientes potenciales</div>
            </div>


            <p>
              Atrae visitas con contenido que genere interés y destaque tu propuesta de valor en redes, blogs o buscadores.
            </p>
          </div>

          <div className="inbound-step">
            <div className="inbound-circle step-2">
              <div className="circle-title">Enamora</div>
              <div className="circle-subtext">Haz que hagan leads</div>
            </div>

            <p>
              Genera una conexión auténtica respondiendo a sus dudas y ofreciendo soluciones personalizadas que los acerquen a ti.
            </p>
          </div>

          <div className="inbound-step">
            <div className="inbound-circle step-3">
              <div className="circle-title">Convence</div>
              <div className="circle-subtext">Logra la decisión de compra</div>
            </div>

            <p>
              Guía su decisión con contenido educativo, seguimiento inteligente y herramientas que refuercen su confianza, utiliza un software de automatización de marketing como un CRM.
            </p>
          </div>

          <div className="inbound-step">
            <div className="inbound-circle step-4">
              <div className="circle-title">Sorprende</div>
              <div className="circle-subtext">Haz que te recomienden</div>
            
          </div>
          <p>
            Ofrece un servicio excepcional que supere expectativas, fomente la lealtad y convierta clientes en embajadores de tu marca.
          </p>
        </div>
      </div>

      <img src="/assets/img/about/about_s6_bubbles.png" alt="" className="bubbles rotate-center" />
    </div>
    </section >
  );
};

export default Clients;
