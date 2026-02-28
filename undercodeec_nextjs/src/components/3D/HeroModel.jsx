
import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

const Model = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = React.useRef();

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle rotation from side to side (approx -15 to +15 degrees)
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return <primitive object={scene} scale={2.5} ref={meshRef} />;
};

const HeroModel = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: '0', left: '0', zIndex: 10 }}>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <Suspense fallback={null}>
            <Model url="/modelo 3D/Model3D-1.glb" />
            <Environment preset="city" />
        </Suspense>
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default HeroModel;
