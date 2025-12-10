import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { InstancedMesh, Object3D, Color, MathUtils, Vector3 } from 'three';
import { useTexture } from '@react-three/drei';
import { useStore } from '../store';
import { CONSTANTS, COLORS } from '../constants';
import { AppMode, PhotoData } from '../types';

const tempObject = new Object3D();
const tempColor = new Color();

export const TreeParticles: React.FC = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const { mode, handPosition } = useStore();
  const count = CONSTANTS.PARTICLE_COUNT;

  // Generate data once
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Tree Form: Cone distribution
      const theta = Math.random() * Math.PI * 2;
      const h = Math.random() * CONSTANTS.TREE_HEIGHT; // 0 to Height
      const y = h - CONSTANTS.TREE_HEIGHT / 2; // Center Y
      // Cone radius calculation (wider at bottom)
      const r = (1 - h / CONSTANTS.TREE_HEIGHT) * CONSTANTS.TREE_RADIUS + 0.2; 
      
      const treeX = r * Math.cos(theta);
      const treeZ = r * Math.sin(theta);
      
      // Scatter Form: Random sphere distribution
      const sr = CONSTANTS.SCATTER_RADIUS * Math.cbrt(Math.random());
      const sTheta = Math.random() * Math.PI * 2;
      const sPhi = Math.acos(2 * Math.random() - 1);
      
      const scatterX = sr * Math.sin(sPhi) * Math.cos(sTheta);
      const scatterY = sr * Math.sin(sPhi) * Math.sin(sTheta);
      const scatterZ = sr * Math.cos(sPhi);

      // Color Palette
      const palette = [COLORS.MATTE_GREEN, COLORS.GOLD, COLORS.RED, COLORS.RED_BRIGHT];
      const color = palette[Math.floor(Math.random() * palette.length)];

      temp.push({ 
        treePos: new Vector3(treeX, y, treeZ), 
        scatterPos: new Vector3(scatterX, scatterY, scatterZ),
        color,
        scale: Math.random() * 0.2 + 0.1,
        rotationSpeed: Math.random() * 0.02
      });
    }
    return temp;
  }, []);

  // Current positions state (for smooth lerping)
  const expansion = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Determine target expansion based on mode
    const targetExpansion = mode === AppMode.TREE ? 0 : 1;
    // Smooth transition
    expansion.current = MathUtils.lerp(expansion.current, targetExpansion, delta * 2);

    // Camera/Group rotation based on hand in scatter mode
    if (mode === AppMode.SCATTER) {
        meshRef.current.rotation.y += delta * 0.1 + (handPosition.x * delta);
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, handPosition.y * 0.5, delta);
    } else {
        // Auto rotate tree slowly
        meshRef.current.rotation.y += delta * 0.1;
        meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, 0, delta);
    }

    let i = 0;
    for (const p of particles) {
      // Interpolate position
      const targetPos = p.treePos.clone().lerp(p.scatterPos, expansion.current);
      
      // Add some "breathing" float effect
      const time = state.clock.getElapsedTime();
      const floatY = Math.sin(time + p.treePos.x) * 0.1 * expansion.current;
      targetPos.y += floatY;

      tempObject.position.copy(targetPos);
      tempObject.scale.setScalar(p.scale);
      tempObject.rotation.x += p.rotationSpeed;
      tempObject.rotation.z += p.rotationSpeed;
      
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      
      tempColor.set(p.color);
      // Make particles emissive in scatter mode
      if (expansion.current > 0.5 && (p.color === COLORS.GOLD || p.color === COLORS.RED_BRIGHT)) {
           tempColor.addScalar(0.2); 
      }
      meshRef.current.setColorAt(i, tempColor);
      i++;
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} castShadow receiveShadow>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial 
        roughness={0.4} 
        metalness={0.6} 
        toneMapped={false}
      />
    </instancedMesh>
  );
};


const SinglePhoto: React.FC<{ 
    data: PhotoData, 
    mode: AppMode, 
    isFocused: boolean 
}> = ({ data, mode, isFocused }) => {
    const texture = useTexture(data.url);
    const meshRef = useRef<Object3D>(null);
    const expansion = useRef(0);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        // Local expansion calculation to ensure smooth animation regardless of parent renders
        const targetExpansion = mode === AppMode.TREE ? 0 : 1;
        expansion.current = MathUtils.lerp(expansion.current, targetExpansion, delta * 2);

        let tPos = new Vector3();
        let scale = 1;

        if (mode === AppMode.FOCUS && isFocused) {
            // Focus position: in front of camera
            tPos.set(0, 0, 4); 
            scale = 2;
        } else {
             // Normal interpolation logic
             const p1 = new Vector3(...data.treePos);
             const p2 = new Vector3(...data.scatterPos);
             tPos.copy(p1).lerp(p2, expansion.current);
             
             meshRef.current.lookAt(0,0,0);
        }

        // Apply position
        meshRef.current.position.lerp(tPos, delta * 3);
        
        // Scale transition
        const targetScale = mode === AppMode.FOCUS && isFocused ? 2.5 : 1;
        meshRef.current.scale.lerp(new Vector3(targetScale, targetScale, 1), delta * 3);
        
        // Rotation alignment
        if (mode === AppMode.FOCUS && isFocused) {
             meshRef.current.rotation.x = MathUtils.lerp(meshRef.current.rotation.x, 0, delta * 5);
             meshRef.current.rotation.y = MathUtils.lerp(meshRef.current.rotation.y, 0, delta * 5);
             meshRef.current.rotation.z = MathUtils.lerp(meshRef.current.rotation.z, 0, delta * 5);
        }
    });

    return (
        <group ref={meshRef} position={data.treePos}>
            <mesh>
                <planeGeometry args={[1.5, 1.5 * data.aspectRatio]} />
                <meshStandardMaterial map={texture} roughness={0.2} metalness={0.1} side={2} />
            </mesh>
            <mesh position={[0, 0, -0.05]}>
                 <boxGeometry args={[1.6, 1.6 * data.aspectRatio, 0.05]} />
                 <meshStandardMaterial color={COLORS.GOLD} roughness={0.3} metalness={1} />
            </mesh>
        </group>
    );
};

export const PhotoCloud: React.FC = () => {
    const { photos, mode, focusedPhotoId } = useStore();

    return (
        <group>
            {photos.map((photo) => (
                <SinglePhoto 
                    key={photo.id} 
                    data={photo} 
                    mode={mode} 
                    isFocused={photo.id === focusedPhotoId}
                />
            ))}
        </group>
    );
};