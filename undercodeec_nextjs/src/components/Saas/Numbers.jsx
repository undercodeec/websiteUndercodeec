"use client";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import CountTo from '../CountTo';
import numbers from '@/data/Saas/numbers.json';

const Numbers = ({}) => {
  const numbersSectionRef = useRef(null);
  const [position, setPosition] = useState({ from: 3000, to: 3340 });
  const data = numbers;

  useEffect(() => {
    const numbersSection = numbersSectionRef.current;
    const numbersSectionHeight = numbersSection.offsetHeight;
    const numbersSectionTop = numbersSection.offsetTop;

    const Position = {
      from: numbersSectionTop - numbersSectionHeight - 850,
      to: numbersSectionTop + numbersSectionHeight,
    };
    setPosition(Position);
  }, []);

  return (
    <section className="numbers style-6" ref={numbersSectionRef}>
      <div className="container">
        <div className="content pb-100">
          <div className="row">
            {data.map((number, index) => (
              <motion.div
                className="col-lg-4"
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.88 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 1.05,
                  delay: index * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  className="number-card style-6"
                  whileHover={{
                    y: -8,
                    boxShadow: '0 24px 50px rgba(96, 11, 86, 0.18)',
                    transition: { duration: 0.3 },
                  }}
                >
                  {/* Número contador con glow en hover */}
                  <motion.h2
                    className="me-4 color-grd"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{
                      duration: 0.9,
                      delay: 0.2 + index * 0.15,
                      type: 'spring',
                      bounce: 0.35,
                    }}
                  >
                    <CountTo
                      className="counter"
                      from={0}
                      to={number.value}
                      speed={1500}
                      position={position}
                    />
                    {number.operator && <span> +</span>}
                  </motion.h2>

                  <motion.div
                    className="text"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{
                      duration: 0.55,
                      delay: 0.35 + index * 0.15,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {number.title.part1} <br /> {number.title.part2}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Numbers;
