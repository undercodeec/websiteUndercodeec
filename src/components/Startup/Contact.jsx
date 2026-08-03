import React from 'react';
import clients from '@/data/Startup/clients.json';

const Contact = ({}) => {
  return (
    <section className="clients style-5" data-scroll-index="6">
      <div className="container">
          <div className="section-head mb-70 style-6 text-center">
            <h2 className="mb-20"> Herramientas con las que
              <span> <small> Trabajamos </small> </span>
            </h2>
          </div>
        <div className="content d-flex flex-wrap">
          {
            clients.map((client, index) => (
              <a href="" className="img img-card" key={index}>
                <img src={client} alt="" />
              </a>
            ))
          }
        </div>
      </div>
    </section>
  )
}

export default Contact
