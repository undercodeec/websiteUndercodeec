import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Pagination, Autoplay, Navigation } from 'swiper';
import projectData from '@/data/Startup/project.json';


import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

SwiperCore.use([Pagination, Autoplay, Navigation]);

const Project = ({}) => {
  const [load, setLoad] = useState(false);
  const data = projectData;

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <section className="projects style-6" data-scroll-index="3">
      
    </section>
  )
}

export default Project
