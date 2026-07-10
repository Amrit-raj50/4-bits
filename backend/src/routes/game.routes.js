import express from 'express';
import * as gameController from '../controllers/game.controller.js';
import * as gameValidator from '../validators/game.validator.js';
import * as investigationController from '../controllers/investigation.controller.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/', 
  gameValidator.createGameValidator, 
  validate, 
  gameController.createGame
);

router.get('/:code', 
  gameValidator.roomIdValidator, 
  validate, 
  gameController.getGame
);

router.post('/:code/join', 
  gameValidator.joinGameValidator, 
  validate, 
  gameController.joinGame
);

router.post('/:code/leave', 
  gameValidator.actionValidator, 
  validate, 
  gameController.leaveGame
);

router.get('/:code/players', 
  gameValidator.roomIdValidator, 
  validate, 
  gameController.getPlayers
);

router.patch('/:code/player/:playerId/ready', 
  gameValidator.playerIdValidator, 
  validate, 
  gameController.toggleReady
);

router.post('/:code/start', 
  gameValidator.hostActionValidator, 
  validate, 
  gameController.startGame
);

router.get('/:code/character/:playerId', 
  gameValidator.playerIdValidator, 
  validate, 
  gameController.getCharacter
);

router.get('/:code/session', 
  gameValidator.roomIdValidator, 
  validate, 
  gameController.getGameSession
);

router.get('/:code/session/character/:playerId', 
  gameValidator.playerIdValidator, 
  validate, 
  gameController.getGameSessionCharacter
);

router.post('/:code/action', 
  investigationController.submitAction
);

router.get('/:code/logs', 
  investigationController.getLogs
);

router.post('/:code/start-vote', 
  investigationController.startVoting
);

router.post('/:code/vote', 
  investigationController.castVote
);

router.delete('/:code', 
  gameValidator.hostActionValidator, 
  validate, 
  gameController.deleteGame
);

export default router;
