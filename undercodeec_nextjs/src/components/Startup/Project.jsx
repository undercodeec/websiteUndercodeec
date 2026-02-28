import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Pagination, Autoplay, Navigation } from 'swiper';
import projectData from '@/data/Startup/project.json';
import projectDataRTL from '@/data/Startup/project-rtl.json';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

SwiperCore.use([Pagination, Autoplay, Navigation]);

const Project = ({ rtl }) => {
  const [load, setLoad] = useState(false);
  const data = rtl ? projectDataRTL : projectData;

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <section className="projects style-6" data-scroll-index="3">
      
    </section>
  )
}

export default Project
