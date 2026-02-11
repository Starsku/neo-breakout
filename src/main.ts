import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { MenuScene } from './scenes/MenuScene';
import { MainScene } from './scenes/MainScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { VictoryScene } from './scenes/VictoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0, x: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, MainScene, PauseScene, GameOverScene, VictoryScene],
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
};

const game = new Phaser.Game(config);

export default game;
