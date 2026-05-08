"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const mouseMoveHandler = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const mouseOverHandler = (e) => {
      const target = e.target;
      try {
        const isClickable = 
          target.tagName.toLowerCase() === "a" ||
          target.tagName.toLowerCase() === "button" ||
          target.closest("a") ||
          target.closest("button") ||
          window.getComputedStyle(target).cursor === "pointer";

        if (isClickable) {
          setIsHovered(true);
        } else {
          setIsHovered(false);
        }
      } catch (err) {
        setIsHovered(false);
      }
    };

    const mouseOutHandler = () => {
      setIsVisible(false);
    };

    const mouseEnterHandler = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", mouseMoveHandler);
    window.addEventListener("mouseover", mouseOverHandler);
    document.addEventListener("mouseleave", mouseOutHandler);
    document.addEventListener("mouseenter", mouseEnterHandler);

    return () => {
      window.removeEventListener("mousemove", mouseMoveHandler);
      window.removeEventListener("mouseover", mouseOverHandler);
      document.removeEventListener("mouseleave", mouseOutHandler);
      document.removeEventListener("mouseenter", mouseEnterHandler);
    };
  }, [isVisible]);

  if (isTouchDevice || !isVisible) return null;

  const variants = {
    default: {
      x: mousePosition.x - 10,
      y: mousePosition.y - 10,
      width: 20,
      height: 20,
      backgroundColor: "#efa238",
      border: "0px solid transparent",
    },
    hover: {
      x: mousePosition.x - 20,
      y: mousePosition.y - 20,
      width: 40,
      height: 40,
      backgroundColor: "rgba(239, 162, 56, 0.2)",
      border: "2px solid #efa238",
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        @media (pointer: fine) {
          * {
            cursor: none !important;
          }
        }
      `}} />
      <motion.div
        className="custom-cursor"
        variants={variants}
        animate={isHovered ? "hover" : "default"}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 35,
          mass: 0.5
        }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 99999999
        }}
      />
    </>
  );
}
