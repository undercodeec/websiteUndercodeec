import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const TradingCard = ({ demo, index }) => {
  const ref = useRef(null);
  
  // Motion values for pointer position (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for physical-feeling rotation
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });

  // Transform normalized mouse positions into angles (-15deg to 15deg)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-15, 15]);

  // Transform normalized mouse positions into percentages for CSS backgrounds (0% to 100%)
  const pointerX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const pointerY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  
  // Smooth opacity for glare
  const glareOpacity = useMotionValue(0);
  const smoothOpacity = useSpring(glareOpacity, { stiffness: 300, damping: 20 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Relative coordinates
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalize to range [-0.5, 0.5]
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    // Return to default resting position
    x.set(0);
    y.set(0);
    glareOpacity.set(0);
  };

  return (
    <motion.div 
      className="trading-card-container" 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={ref}
    >
      <Link href={demo.link || '#'} target="_blank" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
        <motion.div
          className="trading-card"
          style={{
            rotateX,
            rotateY,
            transformPerspective: 1200,
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="trading-card-content">
            <div className="trading-card-image-wrapper">
              <img src={demo.img} alt={demo.alt || demo.title} />
            </div>
            
            <div className="trading-card-text">
              <h3>{demo.type}</h3>
              <p>{demo.title}</p>
              {demo.alt && <p style={{marginTop: '5px', fontSize: '9px', textTransform: 'none', fontWeight: 'normal'}}>{demo.alt}</p>}
            </div>

            <div className="trading-card-footer">
              <div className="trading-card-footer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="trading-card-footer-center">
                <span>{demo.isNew ? '• NUEVO •' : demo.isFeatured ? '• DESTACADO •' : '• PORTAFOLIO •'}</span>
              </div>
              <div className="trading-card-footer-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m12 16 4-4-4-4M8 12h8"/>
                </svg>
              </div>
            </div>

            {/* Glare and hologram mapped dynamically via Framer Motion transforms */}
            <motion.div 
              className="trading-card-glare" 
              style={{
                opacity: smoothOpacity,
                '--pointer-x': useTransform(pointerX, v => `${v}%`),
                '--pointer-y': useTransform(pointerY, v => `${v}%`),
              }}
            />
            <motion.div 
              className="trading-card-hologram" 
              style={{
                opacity: smoothOpacity,
                '--bg-x': useTransform(pointerX, v => `${100 - v}%`),
                '--bg-y': useTransform(pointerY, v => `${100 - v}%`),
              }}
            />
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default TradingCard;
