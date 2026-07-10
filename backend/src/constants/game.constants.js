/**
 * @file game.constants.js
 * @description Centralized constants for game status and phases.
 */

export const GAME_STATUS = {
  WAITING: 'waiting',
  STARTED: 'started',
  ENDED: 'ended',
};

export const GAME_PHASE = {
  LOBBY: 'lobby',
  INVESTIGATION: 'investigation',
  VOTING: 'voting',
  REVEAL: 'reveal',
};

export const PLAYER_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
};
