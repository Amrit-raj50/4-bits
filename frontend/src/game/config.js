import Phaser from 'phaser';
import LobbyScene from './scenes/LobbyScene';
import InvestigationScene from './scenes/InvestigationScene';
import MeetingScene from './scenes/MeetingScene';
import VirtualJoystickScene from './plugins/VirtualJoystick';
import FinalRevealScene from './scenes/FinalRevealScene';
import LandingScene from './scenes/LandingScene';

export const createGameConfig = (parentContainerId, onGameReady) => {
  return {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: parentContainerId,
    audio: {
      noAudio: true
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      parent: parentContainerId,
      width: '100%',
      height: '100%',
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [LandingScene, LobbyScene, InvestigationScene, MeetingScene, VirtualJoystickScene, FinalRevealScene],
    callbacks: {
      postBoot: (game) => {
        if (onGameReady) {
          onGameReady(game);
        }
      }
    }
  };
};
