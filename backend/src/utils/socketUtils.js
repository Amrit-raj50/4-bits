import { SOCKET_EVENTS } from '../sockets/socket.constants.js';

export const emitToRoom = (io, roomCode, event, data) => {
  io.to(roomCode).emit(event, data);
};

export const emitToPlayer = (socket, event, data) => {
  socket.emit(event, data);
};

export const formatSocketResponse = (status, message, data = null) => {
  return {
    status,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
};

export const broadcastRoomUpdate = (io, game) => {
  emitToRoom(io, game.roomCode, SOCKET_EVENTS.ROOM_UPDATED, {
    roomCode: game.roomCode,
    status: game.status,
    players: game.players.map(p => ({
      playerId: p.playerId,
      name: p.name,
      isHost: p.isHost,
      isReady: p.isReady,
      isConnected: p.isConnected
    })),
    gameState: game.gameState
  });
};
