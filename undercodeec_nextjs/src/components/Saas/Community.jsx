"use client";
import React from 'react';
import { motion } from 'framer-motion';
import community from '@/data/Saas/community.json';

const Community = ({}) => {
  const communityData = community;

  return (
    <section className="community pt-40 style-5">
      <div className="container">
        {/* Header con wipe reveal estilo Wix */}
        <div className="sec-head text-center mb-40" style={{ overflow: 'hidden' }}>
          <motion.h2
            className="num"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.span
              className="color-grd"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: 'inline-block' }}
            >
              {'COMUNIDAD'}<span className="thin"></span>
            </motion.span>
          </motion.h2>
          <motion.h3
            className="text-capitalize tw-text-gray-900"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 1.0, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {'¿Por qué elegirnos?'}
          </motion.h3>
        </div>

        {/* Pill container: scale horizontal reveal */}
        <motion.div
          className="content rounded-pill"
          initial={{ opacity: 0, scaleX: 0.7 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          style={{ transformOrigin: 'center' }}
        >
          {communityData.map((item, index) => (
            <motion.div
              className="commun-card"
              key={index}
              initial={{ opacity: 0, scale: 0.75, y: 25 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{
                duration: 0.85,
                delay: index * 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.1, y: -6, transition: { duration: 0.25 } }}
            >
              <motion.div
                className="icon"
                whileHover={{ rotate: [0, -12, 12, 0], transition: { duration: 0.4 } }}
              >
                <img src={item.img} alt="" />
              </motion.div>
              <div className="inf">
                <h5>{item.title}</h5>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Community;
