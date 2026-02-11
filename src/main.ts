import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { MenuScene } from './scenes/MenuScene';
import { MainScene } from './scenes/MainScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: document.body,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  backgroundColor: '#0a0a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, MainScene, PauseScene, GameOverScene, VictoryScene],
  render: {
    pixelArt: false,
    antialias: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    mouse: {
      preventDefaultWheel: true,
    },
    touch: {
      capture: true,
    },
  },
};

window.addEventListener('contextmenu', e => e.preventDefault());

new Phaser.Game(config);
