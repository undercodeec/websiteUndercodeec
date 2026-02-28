import React, { useEffect } from 'react';
import ReactGA from 'react-ga4';


import scenes from '@/data/Preview/header.json';
import HeroModel from '@/components/3D/HeroModel';

const Header = () => {
  useEffect(() => {
    setTimeout(() => {
      loadParallax();
      window.addEventListener('load', () => loadParallax())
    }, 0);
  }, []);

  const loadParallax = () => {
    setTimeout(() => {
      let Parallax = window.Parallax;

      if (typeof Parallax !== 'undefined') {
        var scene = document.getElementById('js-scene');
        new Parallax(scene);

        var scene2 = document.getElementById('js-scene2');
        new Parallax(scene2);
      }
    }, 100);
  }

  return (
    <header className="valign" style={{ overflow: 'visible' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-7">
            <div className="cont text-center animate-fadeUp animate-visible">
              {/* 
                <div className="coming">
                  <h6 className="sub-title text-uppercase color-darkBlue mb-20 fs-14px ltspc-2 fw-bold">Next demos will arrive in:</h6>
                  <div className="clockdiv" data-date="aug 10, 2022">
                    <div>
                      <div className="days fs-1 color-darkBlue fw-600"></div>
                      <span>Days</span>
                    </div>
                    <div>
                      <div className="hours fs-1 color-darkBlue fw-600"></div>
                      <span>Hours</span>
                    </div>
                    <div>
                      <div className="minutes fs-1 color-darkBlue fw-600"></div>
                      <span>Minutes</span>
                    </div>
                    <div>
                      <div className="seconds fs-1 color-darkBlue fw-600"></div>
                      <span>Seconds</span>
                    </div>
                  </div>
                </div> 
              */}
              <h1> Diseño de Páginas Web en Quito y Ecuador <br /> Creación, Programación y Desarrollo de Aplicaciones Web </h1>

              <a
                href="#planes"
                className="btn rounded-pill bg-blue4 fw-bold text-white mt-50"
                onClick={() => {
                  // Evento para Google Analytics
                  ReactGA.event({
                    category: 'Interacción',
                    action: 'click_ver_planes',
                    label: 'Header - Botón VER PLANES'
                  });

                  // Evento para Meta Pixel
                  if (typeof window !== 'undefined' && window.fbq) {
                    window.fbq('trackCustom', 'ClickVerPlanes', {
                      location: 'Header'
                    });
                  }
                }}
              >
                <small className="text-uppercase"> VER PLANES </small>
              </a>


            </div>
          </div>
        </div>
      </div>
      <div className="circle-img">
        <img src="/landing-preview/img/circle.png" alt="" />
      </div>

      <div className="mag-img">
            <div id="js-scene" data-invert-y="true" data-invert-x="true">
          <div className="imgs one">
            {
              scenes.scene1.one.map((scene, i) => (
                <div className={`top ${scene.class} layer`} data-depth={scene.depth} key={i}>
                  <img src={scene.img} alt={scene.alt} />
                </div>
              ))
            }
          </div>

          <div className="imgs three">
            {
              scenes.scene1.three.map((scene, i) => (
                <div className={`top ${scene.class} layer`} data-depth={scene.depth} key={i}>
                  <img src={scene.img} alt={scene.alt} />
                </div>
              ))
            }
          </div>

          <div className="imgs four">
            {
              scenes.scene1.four.map((scene, i) => (
                <div className={`top ${scene.class} layer`} data-depth={scene.depth} key={i}>
                  <img src={scene.img} alt={scene.alt} />
                </div>
              ))
            }
          </div>

          <div id="js-scene2" data-invert-y="false" data-invert-x="false">
            <div className="imgs two">
              {
                scenes.scene2.two.map((scene, i) => (
                  <div className={`top ${scene.class} layer`} data-depth={scene.depth} key={i}>
                    <img src={scene.img} alt={scene.alt} />
                  </div>
                ))
              }
            </div>

            <div className="imgs five" style={{ width: '500px', height: '500px', right: '-50px', bottom: '0', zIndex: 9999, position: 'absolute' }}>
              <HeroModel />
            </div>

            <div className="mob">
              <div className="layer" data-depth="0.10">
                <img src="/landing-preview/img/header/mob_1.webp" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
