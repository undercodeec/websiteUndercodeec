import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay } from 'swiper';
import services from '@/data/DataAnalysis/services.json';

import "swiper/css";
import 'swiper/css/autoplay';

SwiperCore.use([Autoplay]);

import { Cpu, Users, Boxes, ShoppingBag, ReceiptText } from 'lucide-react';

const iconMap = {
  "Automatización de Procesos": Cpu,
  "CRM": Users,
  "Sistema de Inventarios": Boxes,
  " E-commerce": ShoppingBag,
  "Facturación Electrónica": ReceiptText
};

const Services = () => {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    });
  }, []);

  return (
    <section className="services style-8 section-padding">
      <div className="container">
        <div className="section-head style-8 text-center mb-80 wow fadeInUp">
          <h3> Nuestros Servicios de Software Empresarial </h3>
        </div>
      </div>
      <div className="content wow fadeInUp">
        <div className="services-slider8 pb-60">
          {
            load && (
              <Swiper
                spaceBetween={50}
                speed={10000}
                autoplay={{
                  delay: 1
                }}
                loop={true}
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                  },
                  480: {
                    slidesPerView: 1,
                  },
                  787: {
                    slidesPerView: 1,
                  },
                  991: {
                    slidesPerView: 3,
                  },
                  1200: {
                    slidesPerView: 4,
                  }
                }}
              >
                {
                  services.map((service, index) => {
                    const IconComponent = iconMap[service.title] || Cpu;
                    return (
                      <SwiperSlide key={index}>
                        <div className="service-card style-8 tw-group tw-transition-all tw-duration-300 hover:tw-border-purple-500/50 hover:tw-shadow-xl">
                          <div className="icon tw-mb-6 tw-flex tw-justify-center">
                            <div className="tw-p-4 tw-rounded-2xl tw-bg-purple-50 tw-text-purple-600 tw-transition-all tw-duration-300 group-hover:tw-bg-purple-600 group-hover:tw-text-white">
                              <IconComponent size={40} strokeWidth={1.5} />
                            </div>
                          </div>
                          <div className="info">
                            <h5 className="tw-text-xl tw-font-bold tw-mb-3">{service.title}</h5>
                            <p className="tw-text-gray-600 tw-leading-relaxed">{service.text}</p>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })
                }
              </Swiper>
            )
          }
        </div>
        <div className="container">

        </div>
      </div>
    </section>
  )
}

export default Services
