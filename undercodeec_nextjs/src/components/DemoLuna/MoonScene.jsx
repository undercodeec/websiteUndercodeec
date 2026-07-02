"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

const MOON_URL = "/modelo-3D/luna-3d.glb";

// Puntero normalizado (-0.5..0.5) compartido entre la escena y el parallax.
// Se guarda en un ref de módulo para no re-renderizar React en cada movimiento.
const pointer = { x: 0, y: 0 };

/**
 * El modelo lunar. Se normaliza por su bounding box a un diámetro constante,
 * así encuadra bien sea cual sea la escala con que se exportó el .glb.
 */
function Moon({ phase }) {
  const { scene } = useGLTF(MOON_URL);
  const group = useRef(null);
  const spin = useRef(0);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 2 / maxDim; // diámetro objetivo ≈ 2 unidades
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -center.y * s, -center.z * s);
  }, [scene]);

  useFrame((_, delta) => {
    if (!group.current) return;
    // Giro lento continuo: la Luna "respira" aunque nadie interactúe.
    spin.current += delta * (phase === "intro" ? 0.12 : 0.02);

    if (phase === "intro") {
      // Parallax: inclina el modelo hacia donde apunta el cursor.
      const targetY = spin.current + pointer.x * 0.6;
      const targetX = -pointer.y * 0.35;
      group.current.rotation.y += (targetY - group.current.rotation.y) * 0.06;
      group.current.rotation.x += (targetX - group.current.rotation.x) * 0.06;
    }
    // En superficie manda OrbitControls; no tocamos la rotación del grupo.
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

/**
 * Acerca la cámara al pasar a superficie y la devuelve a su sitio en la intro.
 * En superficie deja de actuar: a partir de ahí manda OrbitControls (zoom del
 * usuario), para que ambos no peleen por la posición de la cámara cada frame.
 */
function CameraRig({ phase }) {
  const settled = useRef(false);

  useFrame((state) => {
    if (phase === "surface") {
      if (settled.current) return; // ya entregado el control a OrbitControls
      const gap = 2.6 - state.camera.position.z;
      state.camera.position.z += gap * 0.06;
      if (Math.abs(gap) < 0.02) settled.current = true;
    } else {
      settled.current = false;
      state.camera.position.z += (3.5 - state.camera.position.z) * 0.06;
    }
  });
  return null;
}

export default function MoonScene({ phase }) {
  const controlsRef = useRef(null);

  // Puntero global -> parallax de la Luna en la intro.
  useEffect(() => {
    const onMove = (e) => {
      pointer.x = e.clientX / window.innerWidth - 0.5;
      pointer.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    useGLTF.preload(MOON_URL);
  }, []);

  const isSurface = phase === "surface";

  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 3.5], fov: 42 }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 3, 5]} intensity={1.5} />
      <Suspense fallback={null}>
        <Moon phase={phase} />
        <Environment preset="night" resolution={64} />
      </Suspense>
      <CameraRig phase={phase} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enabled={isSurface}
        enablePan={false}
        enableZoom={isSurface}
        minDistance={1.8}
        maxDistance={3.5}
        rotateSpeed={0.6}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
}

useGLTF.preload(MOON_URL);
