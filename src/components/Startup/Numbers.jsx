/* global fbq */
import React, { useState } from 'react';
import ReactGA from 'react-ga4';



const Numbers = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    empresa: '',
    ruc: '',
    telefono: '',
    email: '',
    presupuesto: ''
  });
  const [mensajeEnviado, setMensajeEnviado] = useState('');

  const executeRecaptcha = async (action) => {
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.enterprise) {
      try {
        const token = await window.grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {action});
        return token;
      } catch (err) {
        console.error("Recaptcha error:", err);
      }
    }
    return null;
  };

  const handleOpenModal = () => {
    ReactGA.event({
      category: 'Interacción',
      action: 'Click en botón',
      label: 'Descubre cómo hacerlo'
    });
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setMensajeEnviado('');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = await executeRecaptcha('MARKETING');
    if (!token) {
      setMensajeEnviado('❌ Error conectando con el servicio reCAPTCHA. Intente de nuevo.');
      return;
    }

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
      const response = await fetch(`${BACKEND_URL}/api/send-marketing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          'g-recaptcha-response': token,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // éxito
        setMensajeEnviado('✅ Tu mensaje fue enviado correctamente.');
        // Limpiar formulario
        setFormData({
          nombre: '',
          empresa: '',
          ruc: '',
          telefono: '',
          email: '',
          presupuesto: '',
          terms: false,
        });

      } else {
        // error reportado por PHP
        console.error('Error backend:', data);
        setMensajeEnviado(`❌ Error del servidor: ${data.message || 'Revisa los campos.'}`);
      }

    } catch (error) {
      // error de red o frontend
      console.error('Error frontend/fetch:', error);
      setMensajeEnviado('❌ Error de red o del navegador. Intenta de nuevo.');
    }
  };



  return (
    <section className="marketing-section">
      <div className="marketing-content">
        <div className="text-content">
          <h2>
            <img
              src="/assets/img/header/header_4_bubble.png"
              alt="burbuja"
              className="bubble rotate-center"
            />
            Alguien está buscando lo que ofreces,<br />
            o necesita el empujón perfecto para elegirte.
          </h2>
          <p className="question">¿Sabes cómo aparecer justo en el momento ideal?</p>
          <p className="explanation">
            Tú necesitas combinar:
            <br />
            <strong>Inbound Marketing + Publicidad Estratégica</strong>
          </p>
          <ul className="benefits">
            <li>✔ SEO para que te encuentren</li>
            <li>✔ Facebook Ads para atraer al instante</li>
            <li>✔ Diseño gráfico que impacta</li>
          </ul>
          <img src="/assets/img/choose_us/google reviewsvg.webp" alt="" className="googlecali" />
          <p className="closing">Es así como esta página llegó hasta ti 😉</p>
          <button className="cta-button" onClick={handleOpenModal}>
            Descubre cómo hacerlo
          </button>
        </div>

        <div className="image-content">
          <div className="camera-wrapper">
            <img
              src="/assets/img/choose_us/manosinsta.webp"
              alt="Cámara Instagram"
              className="camera-image"
            />
            <img
              src="/assets/img/choose_us/iconlike.webp"
              alt="Icono Like"
              className="icon-image icon-like"
            />
            <img
              src="/assets/img/choose_us/iconlove.webp"
              alt="Icono Comentario"
              className="icon-image icon-comment"
            />
            <img
              src="/assets/img/choose_us/iconisntagram.webp"
              alt="Icono Comentario"
              className="icon-image icon-instagram"
            />
            <div className="message-sequence">
              <img src="/assets/img/choose_us/sms1.webp" alt="Mensaje 1" className="message-img sms-1" />
              <img src="/assets/img/choose_us/sms2.webp" alt="Mensaje 2" className="message-img sms-2" />
              <img src="/assets/img/choose_us/sms3.webp" alt="Mensaje 3" className="message-img sms-3" />
              <img src="/assets/img/choose_us/sms4.webp" alt="Mensaje 4" className="message-img sms-4" />
              <img src="/assets/img/choose_us/sms5.webp" alt="Mensaje 5" className="message-img sms-5" />
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-formulario">
            <button className="modal-close" onClick={handleCloseModal}>✖</button>
            <h2>¿En qué podemos ayudarte?</h2>
            <p>Llena todos los campos del formulario para activar el botón de envío</p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Escribe aquí tu nombre"
                required
              />
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Escribe aquí el nombre de tu empresa"
                required
              />
              <input
                type="text"
                name="ruc"
                value={formData.ruc}
                onChange={handleChange}
                placeholder="Escribe tu identificación fiscal"
                required
              />
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Escribe aquí tu contacto de llamada"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Escribe aquí tu Email"
                required
              />
              <textarea
                name="presupuesto"
                value={formData.presupuesto}
                onChange={handleChange}
                placeholder="¿Cuál es tu presupuesto?"
                required
              ></textarea>

              <div className="form-terms">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                  required
                />
                <label>
                  Al enviar, acepto los <a href="/politicas-playconsole">Términos y condiciones</a>.
                </label>
              </div>

              {/* reCAPTCHA migrado a Enterprise (Transparente) */}





              <button type="submit">Enviar</button>
              {mensajeEnviado && <p style={{ marginTop: '10px' }}>{mensajeEnviado}</p>}



            </form>

          </div>
        </div>
      )}
    </section>
  );
};

export default Numbers;
