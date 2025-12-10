import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { TreeParticles, PhotoCloud } from './SceneContent';
import { useStore } from '../store';
import { Vector3 } from 'three';
import { AppMode } from '../types';

const CameraRig = () => {
  const { mode } = useStore();
  
  useFrame((state, delta) => {
    const targetPos = mode === AppMode.FOCUS ? new Vector3(0, 0, 8) : new Vector3(0, 0, 20);
    state.camera.position.lerp(targetPos, delta * 1.5);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

const Experience: React.FC = () => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 20], fov: 45 }}
      gl={{ antialias: false, alpha: false }}
      dpr={[1, 1.5]}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFD700" />
      <spotLight position={[0, 20, 0]} intensity={1.5} angle={0.5} penumbra={1} castShadow />
      
      <Environment preset="night" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={200} scale={12} size={2} speed={0.4} opacity={0.5} color="#F7E7CE" />

      <Suspense fallback={null}>
        <TreeParticles />
        <PhotoCloud />
      </Suspense>

      <CameraRig />
      
      <EffectComposer disableNormalPass>
        <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} radius={0.6} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </Canvas>
  );
};

export default Experience;