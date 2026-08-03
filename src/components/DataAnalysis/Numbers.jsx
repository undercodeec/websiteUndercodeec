"use client";
import React from 'react';
import { motion } from 'framer-motion';

const Numbers = () => {
  return (
    <section className="numbers style-8 pt-100">
      <div className="container">
        <div className="section-head style-8 text-center mb-80 animate-fadeUp">
          <h3>Plataformas de integración</h3>
        </div>
        <div className="content">
          <div className="logo-icon tw-relative tw-flex tw-items-center tw-justify-center tw-h-[500px] lg:tw-h-[850px] animate-zoomIn" style={{ transitionDelay: '150ms' }}>

            {/* Círculo 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="tw-absolute tw-w-[500px] tw-h-[500px] lg:tw-w-[850px] lg:tw-h-[850px] tw-border tw-border-dashed tw-border-purple-400/5 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-pointer-events-none"
            >
              <div className="tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-pointer-events-auto">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}>
                  <a href="https://cloud.google.com/" className="icon icon-shadow slide_up_down tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-p-4 tw-w-20 tw-h-20 lg:tw-w-24 lg:tw-h-24">
                    <img src="/assets/img/logos/log10.webp" alt="" className="tw-w-full tw-h-full tw-object-contain" />
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Círculo 2 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="tw-absolute tw-w-[420px] tw-h-[420px] lg:tw-w-[700px] lg:tw-h-[700px] tw-border tw-border-dashed tw-border-purple-400/10 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-pointer-events-none"
            >
              <div className="tw-absolute tw-right-0 tw-top-1/2 tw-translate-x-1/2 -tw-translate-y-1/2 tw-pointer-events-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
                  <a href="https://aws.amazon.com/es/" className="icon slide_up_down tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-p-3 tw-w-16 tw-h-16 lg:tw-w-20 lg:tw-h-20">
                    <img src="/assets/img/icons/numbers/2.webp" alt="" className="tw-w-full tw-h-full tw-object-contain" />
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Círculo 3 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="tw-absolute tw-w-[340px] tw-h-[340px] lg:tw-w-[550px] lg:tw-h-[550px] tw-border-2 tw-border-dashed tw-border-purple-400/15 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-pointer-events-none"
            >
              <div className="tw-absolute tw-bottom-0 tw-left-1/2 -tw-translate-x-1/2 tw-translate-y-1/2 tw-pointer-events-auto">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}>
                  <a href="https://n8n.io/" className="icon icon-shadow slide_up_down tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-p-4 tw-w-20 tw-h-20 lg:tw-w-24 lg:tw-h-24">
                    <img src="/assets/img/logos/log1.webp" alt="" className="tw-w-full tw-h-full tw-object-contain" />
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Círculo 4 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="tw-absolute tw-w-[260px] tw-h-[260px] lg:tw-w-[400px] lg:tw-h-[400px] tw-border tw-border-dashed tw-border-purple-300/25 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-pointer-events-none"
            >
              <div className="tw-absolute tw-left-0 tw-top-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-pointer-events-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}>
                  <a href="https://azure.microsoft.com/es-es" className="icon slide_up_down tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-p-3 tw-w-16 tw-h-16 lg:tw-w-20 lg:tw-h-20">
                    <img src="/assets/img/icons/numbers/4.webp" alt="" className="tw-w-full tw-h-full tw-object-contain" />
                  </a>
                </motion.div>
              </div>
            </motion.div>

            {/* Círculo 5 central */}
            <div className="tw-absolute tw-w-[180px] tw-h-[180px] lg:tw-w-[250px] lg:tw-h-[250px] tw-flex tw-items-center tw-justify-center tw-pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="tw-absolute tw-inset-0 tw-border-2 tw-border-dashed tw-border-purple-500/30 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-pointer-events-none"
              >
                <div className="tw-absolute tw-top-0 tw-left-1/2 -tw-translate-x-1/2 -tw-translate-y-1/2 tw-pointer-events-auto">
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}>
                    <a href="https://www.docker.com/" className="icon icon-shadow slide_up_down tw-bg-white tw-rounded-full tw-shadow-lg tw-flex tw-items-center tw-justify-center tw-p-3 tw-w-16 tw-h-16 lg:tw-w-20 lg:tw-h-20">
                      <img src="/assets/img/logos/docker.svg" alt="" className="tw-w-full tw-h-full tw-object-contain" />
                    </a>
                  </motion.div>
                </div>
              </motion.div>

              <img
                src="/assets/img/undercode-logo.png"
                alt=""
                className="softunder tw-relative tw-z-50 tw-pointer-events-auto"
                style={{ width: '130px', filter: 'drop-shadow(0 0 40px rgba(124, 58, 237, 0.6))' }}
              />
            </div>

          </div>
        </div>
      </div>
      <img src="/assets/img/icons/numbers/7.webp" alt="" className="r_shape rotate-center" />
    </section>
  );
}

export default Numbers;
