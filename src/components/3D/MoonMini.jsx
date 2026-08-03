"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Center, Bounds } from "@react-three/drei";

const MOON_URL = "/modelo-3D/luna-3d.glb";

const MoonModel = () => {
  const { scene } = useGLTF(MOON_URL);
  const meshRef = useRef();

  // Gentle continuous spin so the moon reads as "alive" inside the tiny card.
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
    }
  });

  return <primitive object={scene} ref={meshRef} />;
};

const MoonMini = () => {
  const containerRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    useGLTF.preload(MOON_URL);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    >
      <Canvas
        frameloop={inView && !isMobile ? "always" : "demand"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3], fov: 40 }}
        style={{ width: "100%", height: "100%", touchAction: "none" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.4} />
        <Suspense fallback={null}>
          {/* Center + Bounds auto-frame the model regardless of its native scale */}
          <Bounds fit clip margin={1.1}>
            <Center>
              <MoonModel />
            </Center>
          </Bounds>
          <Environment preset="night" resolution={64} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} makeDefault />
      </Canvas>
    </div>
  );
};

export default MoonMini;
