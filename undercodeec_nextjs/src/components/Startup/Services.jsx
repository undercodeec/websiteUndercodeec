import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import services from '@/data/Startup/services.json';


import "swiper/css";

const Services = ({}) => {
  const [load, setLoad] = useState(false);
  const servicesData = services;

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <section className="services section-padding style-6" data-scroll-index="2">
      
    </section>
  )
}

export default Services
