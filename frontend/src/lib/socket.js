import { io } from 'socket.io-client';

let socket = null;
let currentKey = null; // `${code}:${playerId}`

export function getSocket(code, playerId) {
  const key = `${code}:${playerId}`;
  if (socket && currentKey === key) return socket; // reuse — handles StrictMode's double effect
  if (socket && currentKey !== key) {
    socket.disconnect(); // switching rooms — tear down the stale connection first
  }
  
  const API_BASE = import.meta.env.VITE_API_URL || window.location.origin;
  socket = io(API_BASE, { auth: { roomCode: code, playerId } });
  currentKey = key;
  return socket;
}

export function disconnectSocket(code, playerId) {
  const key = `${code}:${playerId}`;
  if (socket && currentKey === key) {
    socket.disconnect();
    socket = null;
    currentKey = null;
  }
}
