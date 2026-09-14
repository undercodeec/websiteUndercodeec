"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import services from "@/data/Saas/services.json";
import styles from "./ServicesShowcase.module.css";

import "swiper/css";
import "swiper/css/autoplay";

const SHOWCASE_TITLE = "Soluciones para hacer crecer tu negocio.";
const SHOWCASE_TITLE_LINES = ["Soluciones para", "hacer crecer", "tu negocio."];

export function ServicesCards() {
  return (
    <div className={`services-slider position-relative style-6 ${styles.slider}`}>
      <Swiper
        modules={[Autoplay]}
        className={styles.swiper}
        slidesPerView={6}
        centeredSlides
        spaceBetween={0}
        speed={850}
        loop
        grabCursor
        autoplay={{ delay: 2200, disableOnInteraction: false, pauseOnMouseEnter: false }}
        onClick={(swiper) => swiper.autoplay.stop()}
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
  );
}

export default function ServicesShowcase() {
  const titleRef = useRef(null);

  useEffect(() => {
    const title = titleRef.current;
    const titleCharacters = title?.querySelectorAll("[data-services-showcase-hero-char]");
    if (!title || !titleCharacters?.length) return undefined;

    let removePreloaderDoneListener = () => {};
    let revealFallback;
    let hasRevealed = false;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(titleCharacters, { yPercent: 0, autoAlpha: 1 });
        return;
      }

      // Keep the semantic heading readable if JavaScript fails or is delayed.
      // Its hidden state belongs to the animation lifecycle, not the stylesheet.
      gsap.set(titleCharacters, { yPercent: 105, autoAlpha: 0 });

      const revealTitle = () => {
        if (hasRevealed) return;
        hasRevealed = true;
        window.clearTimeout(revealFallback);
        removePreloaderDoneListener();

        const titleTimeline = gsap.timeline();

        titleTimeline.to(titleCharacters, {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power4.inOut",
          stagger: { each: .03, from: "random" },
        });
      };

      if (document.body.classList.contains("primary-preloading")) {
        window.addEventListener("preloaderDone", revealTitle, { once: true });
        removePreloaderDoneListener = () => window.removeEventListener("preloaderDone", revealTitle);
        revealFallback = window.setTimeout(revealTitle, 2500);
      } else {
        revealTitle();
      }
    }, title);

    return () => {
      removePreloaderDoneListener();
      window.clearTimeout(revealFallback);
      context.revert();
    };
  }, []);

  return (
    <section id="servicios-listado" className={styles.section} aria-labelledby="services-list-title">
      <header className={styles.sectionHeader}>
        <p className={styles.kicker}>Qué hacemos</p>
        <div className={styles.heroTitleBlend}>
          <h2
            ref={titleRef}
            id="services-list-title"
            className={`primary-heading-b ${styles.heroTitle}`}
            aria-label={SHOWCASE_TITLE}
          >
            {SHOWCASE_TITLE_LINES.map((line) => (
              <span className={styles.heroTitleLine} data-services-showcase-hero-line key={line}>
                <span className={styles.heroTitleTransform} data-services-showcase-hero-line-transform>
                  <span className={styles.heroTitleOverflow} aria-hidden="true">
                    {Array.from(line).map((character, characterIndex) => (
                      <span className={styles.heroTitleCharacterClip} key={`${character}-${characterIndex}`}>
                        <span className={styles.heroTitleCharacter} data-services-showcase-hero-char>
                          {character === " " ? "\u00a0" : character}
                        </span>
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            ))}
          </h2>
        </div>
        <p className={styles.count}>{String(services.length).padStart(2, "0")}</p>
      </header>
    </section>
  );
}
