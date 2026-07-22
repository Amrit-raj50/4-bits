import { useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';

export default function Player3D({ position = { x: 0, y: 0 }, isLocal, color = 'blue' }) {
  const meshRef = useRef(null);
  const targetRef = useRef(new THREE.Vector3(position.x || 0, 0.5, position.y || 0));

  // Update the interpolation target when a fresh server position arrives,
  // without recreating the Vector3 or reacting to every render.
  useEffect(() => {
    if (position.x !== undefined && position.y !== undefined) {
      targetRef.current.set(position.x, 0.5, position.y);
    }
  }, [position.x, position.y]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Frame-rate-independent smoothing instead of a fixed 0.1 factor.
    const alpha = 1 - Math.pow(0.001, delta);
    meshRef.current.position.lerp(targetRef.current, alpha);
  });

  return (
    <mesh ref={meshRef} castShadow>
      <capsuleGeometry args={[0.5, 1, 4, 8]} />
      <meshStandardMaterial color={isLocal ? 'red' : color} />
    </mesh>
  );
}
