"use client";

import Image from "next/image";
import { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import services from "@/data/Saas/services.json";
import styles from "./ServicesShowcase.module.css";

import "swiper/css";
import "swiper/css/autoplay";

export default function ServicesShowcase() {
  return (
    <section id="servicios-listado" className={styles.section} aria-labelledby="services-list-title">
      <header className={styles.sectionHeader}>
        <p className={styles.kicker}>Qué hacemos</p>
        <h2 id="services-list-title">Soluciones para hacer crecer tu negocio.</h2>
        <p className={styles.count}>{String(services.length).padStart(2, "0")}</p>
      </header>

      <div className={`services-slider position-relative style-6 ${styles.slider}`}>
        <Swiper
          modules={[Autoplay]}
          className={styles.swiper}
          slidesPerView={6}
          centeredSlides
          spaceBetween={0}
          speed={1000}
          loop
          grabCursor
          autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{
            0: { slidesPerView: 1.08 },
            480: { slidesPerView: 1.35 },
            787: { slidesPerView: 2.2 },
            991: { slidesPerView: 4 },
            1200: { slidesPerView: 6 },
          }}
        >
          {services.map((service, index) => (
            <SwiperSlide key={service.info}>
              <article className={styles.card} data-cursor-hover>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>

                <div className={styles.imageWrap} aria-hidden="true">
                  <Image src={service.img} alt="" width={220} height={220} />
                </div>

                <div className={styles.cardContent}>
                  <h3>{service.info}</h3>
                  <p>{service.text}</p>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
