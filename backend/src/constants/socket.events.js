/**
 * @file socket.events.js
 * @description Centralized Socket.IO event names.
 */

export const SOCKET_EVENTS = {
  // Client -> Server
  CONNECTION: 'connection',
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  PLAYER_READY: 'player-ready',
  START_GAME: 'start-game',
  HEARTBEAT: 'heartbeat',
  RECONNECT_PLAYER: 'reconnect-player',
  DISCONNECT: 'disconnect',

  // Server -> Client
  JOIN_SUCCESS: 'join-success',
  ROOM_UPDATED: 'room-updated',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  PLAYER_READY_UPDATED: 'player-ready-updated',
  HOST_CHANGED: 'host-changed',
  GAME_STARTED: 'game-started',
  PLAYER_CONNECTED: 'player-connected',
  PLAYER_DISCONNECTED: 'player-disconnected',
  HEARTBEAT_ACK: 'heartbeat-ack',
  ERROR: 'error',
};

export const ERROR_CODES = {
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
  ROOM_FULL: 'ROOM_FULL',
  PLAYER_ALREADY_EXISTS: 'PLAYER_ALREADY_EXISTS',
  NOT_HOST: 'NOT_HOST',
  PLAYER_NOT_READY: 'PLAYER_NOT_READY',
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};
