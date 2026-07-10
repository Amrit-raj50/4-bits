import Game from '../models/game.model.js';

/**
 * @file game.repository.js
 * @description Encapsulates database access for Game and Player entities.
 */

class GameRepository {
  async findByCode(roomCode) {
    return Game.findOne({ roomCode: roomCode.toUpperCase() });
  }

  async findBySocketId(socketId) {
    return Game.findOne({ 'players.socketId': socketId });
  }

  async findByPlayerId(roomCode, playerId) {
    const game = await this.findByCode(roomCode);
    if (!game) return null;
    const player = game.players.find((p) => p.playerId === playerId);
    return { game, player };
  }

  async updatePlayer(roomCode, playerId, updateData) {
    const updateQuery = {};
    for (const [key, value] of Object.entries(updateData)) {
      updateQuery[`players.$.${key}`] = value;
    }

    return Game.findOneAndUpdate(
      { roomCode: roomCode.toUpperCase(), 'players.playerId': playerId },
      { $set: updateQuery },
      { new: true }
    );
  }

  async removePlayer(roomCode, playerId) {
    return Game.findOneAndUpdate(
      { roomCode: roomCode.toUpperCase() },
      { $pull: { players: { playerId } } },
      { new: true }
    );
  }

  async deleteGame(roomCode) {
    return Game.deleteOne({ roomCode: roomCode.toUpperCase() });
  }

  async save(game) {
    return game.save();
  }
}

export default new GameRepository();
