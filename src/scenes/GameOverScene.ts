import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any): void {
    this.registry.set('score', data.score);
    this.registry.set('highScore', data.highScore);
  }

  create(): void {
    // Background
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(GameConfig.COLORS.BG, 1);
    graphics.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.generateTexture('gameover-bg', GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.destroy();
    this.add.sprite(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 'gameover-bg');

    // Title
    this.add.text(GameConfig.WIDTH / 2, 80, 'GAME OVER', {
      font: 'bold 60px Arial',
      color: '#ff0000',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Score
    const score = this.registry.get('score');
    this.add.text(GameConfig.WIDTH / 2, 200, `Score: ${score}`, {
      font: 'bold 32px Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // High Score
    const highScore = this.registry.get('highScore');
    this.add.text(GameConfig.WIDTH / 2, 260, `High Score: ${highScore}`, {
      font: 'bold 28px Arial',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // New record notification
    if (score === highScore && score > 0) {
      this.add.text(GameConfig.WIDTH / 2, 320, '🎉 NEW RECORD! 🎉', {
        font: 'bold 24px Arial',
        color: '#00ff00',
        align: 'center',
      }).setOrigin(0.5, 0.5);
    }

    // Retry button
    const retryButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 140, 'RETRY', {
      font: 'bold 30px Arial',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#003300',
      padding: { x: 30, y: 15 },
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => {
        retryButton.setScale(1.1);
      })
      .on('pointerout', () => {
        retryButton.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.start('MainScene');
      });

    // Menu button
    const menuButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 60, 'MENU', {
      font: 'bold 30px Arial',
      color: '#ff0000',
      align: 'center',
      backgroundColor: '#330000',
      padding: { x: 30, y: 15 },
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => {
        menuButton.setScale(1.1);
      })
      .on('pointerout', () => {
        menuButton.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
  }
}
