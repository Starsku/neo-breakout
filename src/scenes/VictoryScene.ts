import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ScoreSystem } from '../systems/ScoreSystem';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: any): void {
    this.registry.set('score', data.score);
    this.registry.set('highScore', data.highScore);
    this.registry.set('scoreSystem', data.scoreSystem);
  }

  create(): void {
    // Background
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(0x001100, 1);
    graphics.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.generateTexture('victory-bg', GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.destroy();
    this.add.sprite(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 'victory-bg');

    // Title
    this.add.text(GameConfig.WIDTH / 2, 60, '🎉 VICTORY! 🎉', {
      font: 'bold 60px Arial',
      color: '#00ff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Congratulations
    this.add.text(GameConfig.WIDTH / 2, 140, 'All Levels Completed!', {
      font: 'bold 32px Arial',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Score
    const score = this.registry.get('score');
    this.add.text(GameConfig.WIDTH / 2, 220, `Final Score: ${score}`, {
      font: 'bold 28px Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // High Score
    const highScore = this.registry.get('highScore');
    this.add.text(GameConfig.WIDTH / 2, 270, `High Score: ${highScore}`, {
      font: 'bold 24px Arial',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Congratulations message
    if (score === highScore && score > 0) {
      this.add.text(GameConfig.WIDTH / 2, 330, '⭐ PERSONAL BEST! ⭐', {
        font: 'bold 24px Arial',
        color: '#ffaa00',
        align: 'center',
      }).setOrigin(0.5, 0.5);
    }

    // Play again button
    const playButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 120, 'PLAY AGAIN', {
      font: 'bold 30px Arial',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#003300',
      padding: { x: 30, y: 15 },
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => {
        playButton.setScale(1.1);
      })
      .on('pointerout', () => {
        playButton.setScale(1);
      })
      .on('pointerdown', () => {
        const scoreSystem = this.registry.get('scoreSystem') as ScoreSystem;
        this.scene.start('MainScene', { scoreSystem });
      });

    // Menu button
    const menuButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 40, 'MENU', {
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
