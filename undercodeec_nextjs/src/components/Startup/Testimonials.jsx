import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Autoplay } from 'swiper';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/navigation';

SwiperCore.use([Navigation, Autoplay]);

const Testimonials = ({ rtl }) => {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setLoad(true);
  }, []);

  return (
    <div className="testimonials style-6" data-scroll-index="5">
      
    </div>
  )
}

export default Testimonials
