import React, { useState } from 'react';
import axios from 'axios';

const Contact = ({}) => {
  const [formData, setFormdata] = useState({
    name: "",
    email: "",
    phone: "",
    website: "",
    option: "",
    message: ""
  });

  const handleFormChange = (e) => {
    setFormdata(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formValues = new FormData();

    formValues.append('name', formData.name);
    formValues.append('email', formData.email);
    formValues.append('phone', formData.phone);
    formValues.append('website', formData.website);
    formValues.append('option', formData.option);
    formValues.append('message', formData.message);
    
    const res = await axios.post('/contact.php', formValues)
      .catch(err => alert(err.message));

    if (!res) return;

    alert('Form submitted successfully.')
  }

  return (
    <section className="contact section-padding border-bottom border-1 brd-gray style-6">

      {/*
      <div className="container">
        <div className="section-head text-center mb-70 style-5">
          <h2 className="mb-20">{ 'Listo para iniciar ' } <span>{ 'proyectos' }</span> </h2>
          <p>{ 'Nos pondremos en contacto con usted en 24 horas tras recibir su solicitud.' }</p>
        </div>
        <div className="content">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <form action="contact.php" className="form" method="post" onSubmit={handleFormSubmit}>
                <p className="text-center text-danger fs-12px mb-30">{ 'El campo es obligatorio marcar como *' }</p>
                <div className="row">
                  <div className="col-lg-6">
                    <div className="form-group mb-20">
                      <input type="text" name="name" className="form-control" placeholder={ rtl ? 'الاسم' : "Nombre" } onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-20">
                      <input type="text" name="email" className="form-control" placeholder={ rtl ? 'البريد الالكترونى *' : "Email *" } onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-20">
                      <input type="text" name="phone" className="form-control" placeholder={ rtl ? 'رقم الهاتف (اختيارى)' : "Numero Telefonico (Opcional)" } onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group mb-20">
                      <input type="text" name="website" className="form-control" placeholder={ rtl ? 'موقعك الالكترونى (اختيارى)' : "Tu sitio Web (Opcional)" } onChange={handleFormChange} />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group mb-20">
                      <select className="form-select" name="option" defaultValue={ 'How can we help you?' } onChange={handleFormChange}>
                        <option value="How can we help you?">{ '¿Cómo podemos ayudarle?' }</option>
                        <option value="option 1">{ 'Cotizacion para mi proyecto' }</option>
                        <option value="option 2">{ 'Contactarme tengo mas preguntas' }</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <textarea rows="10" className="form-control" name="message" placeholder={ 'Mensaje' } onChange={handleFormChange}></textarea>
                    </div>
                  </div>
                  <div className="col-lg-12 text-center">
                    <div className="form-check d-inline-flex mt-30 mb-30">
                      <input className="form-check-input me-2 mt-0" type="checkbox" value="" id="flexCheckDefault" />
                      <label className="form-check-label small" htmlFor="flexCheckDefault">
                        { 'Al enviar, acepto los' } <a href="#" className="text-decoration-underline">{ 'Términos y condiciones.' }</a>
                      </label>
                    </div>
                  </div>
                  <div className="col-lg-12 text-center">
                    <input type="submit" value={ rtl ? 'ارسل طلبك' : "Enviar Mensaje" } className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold text-light" />
                  </div>
                </div>
              </form>
            </div>
          </div>
          <img src="/assets/img/icons/contact_a.png" alt="" className="contact_a" />
          <img src="/assets/img/icons/contact_message.png" alt="" className="contact_message" />
        </div>
      </div>
      */}

    </section>
  )
}

export default Contact
