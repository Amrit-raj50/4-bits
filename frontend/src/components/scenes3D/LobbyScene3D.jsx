import { Environment, Text } from '@react-three/drei';
import Player3D from './Player3D';

export default function LobbyScene3D({ players = [], playerId }) {
  return (
    <>
      <Environment preset="city" />
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {players.map((p, i) => (
        <Player3D 
          key={p.id || p.playerId || i} 
          position={p.position || { x: i * 2 - players.length, y: 0 }} 
          isLocal={(p.id || p.playerId) === playerId} 
        />
      ))}
      
      <Text position={[0, 2, -5]} fontSize={1} color="white" anchorX="center" anchorY="middle">
        Lobby Waiting Area
      </Text>
    </>
  );
}
