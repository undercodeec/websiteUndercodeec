/* global fbq */
import React, { useState, useRef } from "react";
import ReactGA from 'react-ga4';



const ContactSection = ({ style }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    option: "",
    message: "",
    terms: false
  });

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    ReactGA.event({
      category: 'Formulario de Contacto',
      action: 'Envío del formulario',
      label: 'Botón Enviar',
      value: 1,
    });

    if (typeof window.fbq === 'function') {
      fbq('track', 'Contact', {
        content_name: 'Formulario de Contacto',
        value: 1,
        currency: 'USD',
      });
    }

    if (!formData.terms) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    const token = await executeRecaptcha('CONTACT');
    if (!token) {
      alert("Error conectando con el servicio reCAPTCHA. Intente de nuevo.");
      return;
    }


    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.undercodeec.com';
      const response = await fetch(`${BACKEND_URL}/api/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          option: formData.option,
          message: formData.message,
          terms: formData.terms ? '1' : '0',
          'g-recaptcha-response': token
        }),
      });

      const text = await response.text();

      try {
        const result = JSON.parse(text);

        if (result.status === 'success') {
          alert('Mensaje enviado con éxito');

          // Limpiar formulario
          setFormData({
            name: "",
            email: "",
            phone: "",
            website: "",
            option: "",
            message: "",
            terms: false
          });

        } else {
          alert(`Error: ${result.message}`);
        }

      } catch (e) {
        console.error('Respuesta no válida:', text);
        alert('Hubo un problema al procesar tu solicitud. Intenta más tarde.');
      }

    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      alert('Error al validar el reCAPTCHA');
    }
  };




  return (
    <section className="contact-section">
      <div className="contact-wrapper">

        {/* Columna izquierda */}
        <div className="contact-info">
          <h2>Ingresa al mundo digital</h2>
          <p>Ponte en contacto, te responderemos lo más pronto posible</p>
          <div className="info-block">
            <h4>Horarios de atención:</h4>
            <p>Lunes a viernes de 08H00 AM a 06H00 PM</p>
          </div>
          <div className="info-block">
            <h4>Cobertura</h4>
            <p>Atención remota · Cobertura internacional</p>
          </div>
          <div className="info-block">
            <h4>Correo</h4>
            <p>ventas@undercodeec.com</p>
          </div>
          <img src="/assets/img/icons/iconcontactemail.webp" alt="" className="iconemail" />
        </div>

        {/* Columna derecha - formulario */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <img src="/assets/img/icons/contact_a.png" alt="" className="contact_a" />
          <img src="/assets/img/icons/contact_message.png" alt="" className="contact_message" />
          <p className="form-warning">
            El campo es obligatorio y debe marcarse con <span>*</span>
          </p>

          <div className="form-grid">
            <input
              type="text"
              name="name"
              placeholder="Nombre *"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="phone"
              placeholder="Número Telefónico"
              value={formData.phone}
              onChange={handleChange}
            />
            <input
              type="text"
              name="website"
              placeholder="Tu Sitio Web"
              value={formData.website}
              onChange={handleChange}
            />
            <select
              name="option"
              value={formData.option}
              onChange={handleChange}
              required
            >
              <option value="">¿Cómo podemos ayudarte?</option>
              <option value="web">Sitio Web</option>
              <option value="app">Aplicación Móvil</option>
              <option value="otro">Otro</option>
            </select>
            <textarea
              name="message"
              placeholder="Mensaje"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-terms">
            <input
              type="checkbox"
              name="terms"
              checked={formData.terms}
              onChange={handleChange}
            />
            <label>
              Al enviar, acepto los <a href="/politicas-playconsole">Términos y condiciones</a>.
            </label>
          </div>

          {/* reCAPTCHA migrado a Enterprise (Transparente) 👇 */}

          <button type="submit" className="form-submit">
            Enviar
          </button>

          {/* Burbujas animadas */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="bubblecontact"></div>
          ))}
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
