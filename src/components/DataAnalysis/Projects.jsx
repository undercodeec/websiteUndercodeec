"use client";
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Autoplay, Keyboard, Navigation } from 'swiper';
import projects from '@/data/DataAnalysis/projects.json';

import "swiper/css";
import 'swiper/css/autoplay';
import 'swiper/css/keyboard';
import 'swiper/css/navigation';

const Projects = () => {
  const [load, setLoad] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    });
  }, []);

  return (
    <section className="projects style-8 section-padding bg-gray2">
      <div className="container">
        <div className="section-head style-8 mb-80">
          <h3>Proyectos Completados</h3>
          <div className="arrows">
            <div className="swiper-button-next">
              <i className="fal fa-long-arrow-right"></i>
            </div>
            <div className="swiper-button-prev">
              <i className="fal fa-long-arrow-left"></i>
            </div>
          </div>
        </div>
        <div className="content" style={{ transitionDelay: '200ms' }}>
          <div className="projects-slider8">
            {load && (
              <Swiper
                className="swiper-container"
                style={{ minHeight: '500px', display: 'block', width: '100%' }}
                modules={[Autoplay, Keyboard, Navigation]}
                slidesPerView={1}
                spaceBetween={0}
                speed={1200}
                pagination={false}
                observer={true}
                observeParents={true}
                navigation={{
                  nextEl: '.projects.style-8 .swiper-button-next',
                  prevEl: '.projects.style-8 .swiper-button-prev',
                }}
                mousewheel={false}
                keyboard={true}
                autoplay={{
                  delay: 10000,
                  disableOnInteraction: true
                }}
                loop={false}
              >
                {projects.map((project, index) => (
                  <SwiperSlide key={index}>
                    <div className="project-card">
                      <div className="row align-items-center">
                        <div className="col-lg-6">
                          <div className="img">
                            {project.iframeUrl ? (
                              <iframe
                                style={{ border: "1px solid rgba(0, 0, 0, 0.1)", width: "100%", height: "450px" }}
                                src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(project.iframeUrl)}`}
                                allowFullScreen
                              />
                            ) : (
                              <img src={project.image} alt="" className="main-img" />
                            )}
                            <div className="tags">
                              <a href="#">{project.tag}</a>
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="info">
                            <p>{project.text}</p>
                            <div className="proj-det">
                              <a
                                href={project.iframeUrl || project.button.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn blue5-3Dbutn"
                              >
                                Ver demo
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
