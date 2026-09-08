"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { playSoundWithFade } from "@/utils/audio";

const getPageTitle = (path) => {
  if (path === "/" || !path) return "INICIO";
  const segments = path.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || "";
  return lastSegment.replace(/-/g, " ").toUpperCase();
};

const isAdminRoute = (path) => {
  const normalized = (path || "").replace(/\/$/, "") || "/";
  return normalized === "/admin" || normalized.startsWith("/admin/");
};

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const preloaderRoutes = ['/', '/ec', '/es'];
  const normInit = pathname.replace(/\/$/, '') || '/';
  const [transitionState, setTransitionState] = useState(
    preloaderRoutes.includes(normInit) || isAdminRoute(normInit)
      ? "hidden"
      : "initial_reveal",
  );
  const [targetPathname, setTargetPathname] = useState(pathname);
  
  const title = getPageTitle(transitionState === "rising" ? targetPathname : pathname);

  useEffect(() => {
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (link && link.href) {
        try {
           const url = new URL(link.href);
           const normCurrent = window.location.pathname.replace(/\/$/, '') || '/';
           const normTarget = url.pathname.replace(/\/$/, '') || '/';
           
           if (url.hostname === window.location.hostname && normCurrent !== normTarget) {
             if (link.target === '_blank' || url.hash) return;

             e.preventDefault();
             e.stopPropagation();

             // El panel administrativo usa su propia experiencia de navegacion.
             // Evitar el telon global al entrar, salir o moverse dentro de /admin.
             if (isAdminRoute(normCurrent) || isAdminRoute(normTarget)) {
               router.push(url.href);
               return;
             }

             // Logo con preloader: limpiar sesión home y navegar sin cortina
             if (link.dataset.forcePreloader) {
               sessionStorage.removeItem('preloaderShown_home');
               router.push(url.href);
               return;
             }

             // Rutas con preloader de bienvenida: navegar sin cortina
             if (['/ec', '/es'].includes(normTarget)) {
               router.push(url.href);
               return;
             }

             // Raíz /: si el preloader aún no se ha visto, navegar directo sin telón
             // para que solo se muestre el preloader de bienvenida (no ambas animaciones)
             if (normTarget === '/') {
               const preloaderSeen = sessionStorage.getItem('preloaderShown_home');
               if (!preloaderSeen) {
                 router.push(url.href);
                 return;
               }
               playSoundWithFade();
             }

             setTargetPathname(url.pathname);
             // 1. Forzamos el telón a la parte inferior (hidden) de forma instantánea
             setTransitionState("hidden");

             // 2. En el siguiente ciclo de renderizado, ordenamos que suba
             setTimeout(() => {
               setTransitionState("rising");

               // 3. Esperamos a que el telón suba y cubra la pantalla para recién enrutar
               setTimeout(() => {
                 router.push(url.href);
               }, 800);
             }, 50);
           }
        } catch {}
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [router]);

  useEffect(() => {
    // 1. Escuchar el cambio de ruta
    const normPath = pathname.replace(/\/$/, '') || '/';
    const normTarget = targetPathname.replace(/\/$/, '') || '/';

    if (transitionState === "rising" && normPath === normTarget) {
       const revealTimer = setTimeout(() => setTransitionState("revealing"), 0);
       return () => clearTimeout(revealTimer);
    }
  }, [pathname, targetPathname, transitionState]);

  useEffect(() => {
    // 2. Temporizador seguro e independiente para el reset final (evita cancelación múltiple)
    let timeoutId;
    if (transitionState === "revealing" || transitionState === "initial_reveal") {
       timeoutId = setTimeout(() => {
         setTransitionState("hidden");
       }, 2500); 
    } else if (transitionState === "rising") {
       // Escape hatch de seguridad en caso de que Next.js falle en cargar
       timeoutId = setTimeout(() => {
         setTransitionState("revealing");
       }, 5000);
    }
    return () => clearTimeout(timeoutId);
  }, [transitionState]);

  const curtainVariants = {
    "initial_reveal": { 
      y: "-100%", 
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 1 } 
    },
    "hidden": { 
      y: "100%", 
      transition: { duration: 0 } 
    },
    "rising": { 
      y: "0%", 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    },
    "revealing": { 
      y: "-100%", 
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 } 
    }
  };

  const textVariants = {
    "initial_reveal": { 
      opacity: 0, scale: 1.1, filter: "blur(10px)", 
      transition: { duration: 0.8, ease: "easeOut", delay: 0.5 } 
    },
    "hidden": { 
      opacity: 0, scale: 0.9, filter: "blur(10px)",
      transition: { duration: 0 }
    },
    "rising": { 
      opacity: 1, scale: 1, filter: "blur(0px)",
      transition: { duration: 0.5, ease: "easeOut", delay: 0.2 } 
    },
    "revealing": { 
      opacity: 0, scale: 1.1, filter: "blur(10px)", 
      transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } 
    }
  };

  // En rutas con preloader de bienvenida, no renderizar el telón si está oculto
  // (evita que SSR/hidratación muestre brevemente el nombre de la página)
  const normPathname = pathname.replace(/\/$/, '') || '/';
  const hideCurtain = isAdminRoute(normPathname)
    || (preloaderRoutes.includes(normPathname) && transitionState === "hidden");

  return (
    <>
      {/* EL ÚNICO TELÓN GLOBAL ABSOLUTAMENTE INMUNE A LOS ERRORES DE NEXTJS Y TAILWIND CACHE */}
      {!hideCurtain && (
      <motion.div
         style={{
           position: "fixed",
           top: 0, left: 0, right: 0, bottom: 0,
           width: "100%", height: "100vh",
           zIndex: 999999, pointerEvents: "none"
         }}
         initial={{ y: preloaderRoutes.includes(normPathname) ? "100%" : "0%" }}
         animate={transitionState}
         variants={curtainVariants}
      >
        {/* FONDO DEL TELON */}
        <svg style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100vh", zIndex: 1, pointerEvents: "none" }}>
          <defs>
            <linearGradient id="solid-grad-telon-single" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#600b56" />
              <stop offset="100%" stopColor="#150E23" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#solid-grad-telon-single)" />
        </svg>
        
        {/* CONTENEDOR DEL TEXTO */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10, color: "white", pointerEvents: "none" }}>
          <motion.div 
            style={{ 
               fontWeight: 900, 
               textTransform: "uppercase", 
               fontSize: "clamp(3rem, 10vw, 7rem)", // <- Resuelve las inconsistencias del tamaño de la fuente de raíz
               letterSpacing: "-0.05em", 
               lineHeight: 1, 
               textAlign: "center" 
            }}
            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            animate={transitionState}
            variants={textVariants}
          >
            <span style={{ display: "inline-block", transform: "scaleY(1.1)" }}>
              {title}
            </span>
          </motion.div>
        </div>
      </motion.div>
      )}

      {/* RENDERIZADO INCONDICIONAL DE LAS PÁGINAS PROTEGIDO DE ANIMATEPRESENCE */}
      {children}
    </>
  );
}
