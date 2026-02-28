import React from 'react';

const Blog = ({ rtl }) => {
  return (
    <section className="flex-section flex flex-wrap items-center justify-center gap-10 py-12 px-6">

      {/* Cuadro con burbujas estilo lámpara de lava */}
      <div className="banner-left-marketing">
        <div className="lava-bubbles">
          <span className="bubble-floating"></span>
          <span className="bubble-floating"></span>
          <span className="bubble-floating"></span>
          <span className="bubble-floating"></span>
          <span className="bubble-floating"></span>
        </div>
        <h2>¿Qué es Inbound Marketing?</h2>
        <h4>Una forma moderna de atraer clientes</h4>
        <p>
          Conecta con personas interesadas en lo que ofreces sin interrumpir su experiencia.
          Crea relaciones reales con contenido útil, y convierte visitas en ventas.
          Así, tus clientes llegan a ti de forma natural.
        </p>
      </div>

      {/* Imagen al lado con cabeza animada */}
      <div className="relative max-w-sm w-full">
        {/* Imagen base del cuerpo */}
        <img
          src="/assets/img/choose_us/imgiboock.webp"
          alt="Persona feliz usando laptop sobre monedas"
          className="w-full h-auto"
        />

        {/* Cabeza flotante con animación */}
        {/* Cabeza flotante con animación */}
        <img
          src="/assets/img/choose_us/imgcabeza.webp"
          alt="Cabeza del modelo"
          className="head-animated absolute top-0 left-1/2 transform -translate-x-1/2"
          style={{ width: '80px' }}
        />

        {/* Ojos parpadeantes */}
        <img
          src="/assets/img/choose_us/ojo2.webp"
          alt="Ojo izquierdo"
          className="eye eye-left absolute top-[12px] left-1/2 transform -translate-x-[30px]"
          
        />
        <img
          src="/assets/img/choose_us/ojo1.webp"
          alt="Ojo derecho"
          className="eye eye-right absolute top-[12px] left-1/2 transform translate-x-[10px]"
          
        />

      </div>
    </section>
  );
};

export default Blog;
