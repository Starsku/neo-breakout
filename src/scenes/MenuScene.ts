import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ScoreSystem } from '../systems/ScoreSystem';

export class MenuScene extends Phaser.Scene {
  private scoreSystem!: ScoreSystem;

  constructor() {
    super({ key: 'MenuScene' });
  }

  preload(): void {
    // Preload any assets if needed
  }

  create(): void {
    this.scoreSystem = new ScoreSystem();

    // Background gradient
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(GameConfig.COLORS.BG, 1);
    graphics.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.generateTexture('menu-bg', GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.destroy();
    this.add.sprite(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 'menu-bg');

    // Title
    this.add.text(GameConfig.WIDTH / 2, 80, 'Neo-Breakout', {
      font: 'bold 60px Arial',
      color: '#00ff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Subtitle
    this.add.text(GameConfig.WIDTH / 2, 150, 'Brick Breaker Game', {
      font: '20px Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // High Score
    const highScore = this.scoreSystem.getHighScore();
    this.add.text(GameConfig.WIDTH / 2, 220, `High Score: ${highScore}`, {
      font: '24px Arial',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Play button
    const playButton = this.add.text(GameConfig.WIDTH / 2, 350, 'PLAY', {
      font: 'bold 40px Arial',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#003300',
      padding: { x: 40, y: 20 },
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => {
        playButton.setScale(1.1);
        playButton.setStyle({ color: '#00ff00', backgroundColor: '#005500' });
      })
      .on('pointerout', () => {
        playButton.setScale(1);
        playButton.setStyle({ color: '#00ff00', backgroundColor: '#003300' });
      })
      .on('pointerdown', () => {
        this.scene.start('MainScene', { scoreSystem: this.scoreSystem });
      });

    // Instructions
    const instructions = [
      'Arrow Keys / ZQSD - Move Paddle',
      'Mouse - Follow Paddle Position',
      'Touch - Drag Paddle',
      'ESC - Pause Game',
      'Destroy all bricks to advance!',
    ];

    let yPos = 450;
    instructions.forEach((text) => {
      this.add.text(GameConfig.WIDTH / 2, yPos, text, {
        font: '14px Arial',
        color: '#cccccc',
        align: 'center',
      }).setOrigin(0.5, 0);
      yPos += 25;
    });
  }

  update(): void {
    // Spacebar is handled via the Play button click
  }
}
