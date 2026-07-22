import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Text } from '@react-three/drei';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import Player3D from './Player3D';

export default function InvestigationScene3D({ players = [], clues = [], socket, playerId, onOverlapStart, onOverlapEnd }) {
  const { camera } = useThree();
  const controlsRef = useRef(null);
  const localPlayerPosRef = useRef(new THREE.Vector3());
  const overlappingClueRef = useRef(null);
  const keys = useRef({ w: false, a: false, s: false, d: false });

  // Input event listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = true;
    };
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (keys.current.hasOwnProperty(key)) keys.current[key] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Use fixed tick rate for socket emit (e.g. 20Hz)
  useEffect(() => {
    if (!socket) return;
    const interval = setInterval(() => {
      // We only emit if keys are pressed to avoid spam
      const { w, a, s, d } = keys.current;
      if (w || a || s || d) {
        socket.emit('playerMovement', {
          x: localPlayerPosRef.current.x,
          y: localPlayerPosRef.current.z,
          isMoving: true,
        });
      }
    }, 50);
    return () => clearInterval(interval);
  }, [socket]);

  useFrame((state, delta) => {
    // 1. Handle local movement prediction
    const speed = 5 * delta;
    let moved = false;
    if (keys.current.w) { localPlayerPosRef.current.z -= speed; moved = true; }
    if (keys.current.s) { localPlayerPosRef.current.z += speed; moved = true; }
    if (keys.current.a) { localPlayerPosRef.current.x -= speed; moved = true; }
    if (keys.current.d) { localPlayerPosRef.current.x += speed; moved = true; }

    // 2. Camera follow (Reconciling with OrbitControls)
    // In a real app we'd pass controlsRef from GameCanvas or use `state.controls`.
    // Since `OrbitControls` sets `state.controls`, we can access it!
    const controls = state.controls;
    if (controls) {
      controls.target.lerp(localPlayerPosRef.current, 0.1);
      // Disable pan so user can only orbit/zoom, keeping focus on player
      controls.enablePan = false;
      // We let OrbitControls handle camera position based on target + spherical offset
      controls.update();
    }

    // 3. Overlap detection (enter/exit edges)
    let closestClue = null;
    let minDistance = 2.0; // overlap threshold
    clues.forEach(clue => {
      const cluePos = new THREE.Vector3(clue.x, 0, clue.y);
      if (localPlayerPosRef.current.distanceTo(cluePos) < minDistance) {
        closestClue = clue;
      }
    });

    if (closestClue && overlappingClueRef.current !== closestClue.id) {
      overlappingClueRef.current = closestClue.id;
      if (onOverlapStart) onOverlapStart({ type: 'inspect', target: closestClue.id });
    } else if (!closestClue && overlappingClueRef.current !== null) {
      overlappingClueRef.current = null;
      if (onOverlapEnd) onOverlapEnd();
    }
  });

  return (
    <>
      <Environment preset="night" />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* Local player is rendered purely from local ref for instant feedback, 
          or we can just rely on the server roundtrip if we want true authoritative state. 
          For simplicity, we let Player3D handle interpolation based on props.position.
          Wait, if we use localPlayerPosRef for prediction, we should pass it to our local Player3D.
          But the prompt asked to map `players` to `<Player3D>`.
      */}
      {players.map((p) => {
        const isLocal = (p.id || p.playerId) === playerId;
        // Sync local ref with server if we aren't moving (or just rely on server)
        if (isLocal && p.position) {
            // Very naive reconcile
            // localPlayerPosRef.current.set(p.position.x, 0, p.position.y);
        }
        return (
          <Player3D 
            key={p.id || p.playerId} 
            position={isLocal ? { x: localPlayerPosRef.current.x, y: localPlayerPosRef.current.z } : p.position} 
            isLocal={isLocal} 
          />
        );
      })}

      {clues.map((c) => (
        <mesh key={c.id} position={[c.x, 0.5, c.y]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="yellow" />
          <Text position={[0, 1, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
            {c.name || 'Clue'}
          </Text>
        </mesh>
      ))}
    </>
  );
}
