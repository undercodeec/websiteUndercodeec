
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = React.useRef();

  // Bring back gentle rotation from side to side
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return <primitive object={scene} scale={2.5} ref={meshRef} />;
};

const HeroModel = ({ isActive = true }) => {
  // Determine if component is intersecting the viewport to stop WebGL rendering
  const [inView, setInView] = useState(true);
  const containerRef = useRef(null);

  // Detect mobile device to force "demand" frameloop (no heavy continuous animation on phones)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Preload the 25MB GLB on mount instead of at module parse time.
    // This frees the critical-path window for first paint; the model still
    // shows up promptly because Suspense fallback covers the load.
    useGLTF.preload("/modelo-3D/Model3D-1.glb");

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.1 });

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
      {/* 
        On Desktop: "always" run loop if on screen, "demand" if scrolled out.
        On Mobile: "demand" ALWAYS to save 100% CPU/GPU and battery.
      */}
      <Canvas 
        frameloop={(inView && !isMobile && isActive) ? "always" : "demand"}
        dpr={[1, 1.2]}
        camera={{ position: [0, 0, 8], fov: 45 }} 
        style={{ width: '100%', height: '100%', touchAction: 'none' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
            <Model url="/modelo-3D/Model3D-1.glb" />
            <Environment preset="city" resolution={64} />
        </Suspense>
        {/* Disable pan to avoid interfering with page interactions */}
        <OrbitControls enableZoom={false} enablePan={false} makeDefault />
      </Canvas>
    </div>
  );
};

export default HeroModel;
