import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    // Semi-transparent overlay
    const overlay = this.add.rectangle(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      GameConfig.WIDTH,
      GameConfig.HEIGHT,
      0x000000,
      0.5
    );

    // Pause text
    this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2 - 60, 'PAUSED', {
      font: 'bold 60px Arial',
      color: '#ffff00',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Resume button
    const resumeButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2 + 40, 'RESUME', {
      font: 'bold 30px Arial',
      color: '#00ff00',
      align: 'center',
      backgroundColor: '#003300',
      padding: { x: 30, y: 15 },
    })
      .setOrigin(0.5, 0.5)
      .setInteractive()
      .on('pointerover', () => {
        resumeButton.setScale(1.1);
      })
      .on('pointerout', () => {
        resumeButton.setScale(1);
      })
      .on('pointerdown', () => {
        this.scene.stop('PauseScene');
        this.scene.resume('MainScene');
      });

    // Menu button
    const menuButton = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2 + 120, 'MENU', {
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
        this.scene.stop('PauseScene');
        this.scene.stop('MainScene');
        this.scene.start('MenuScene');
      });

    // ESC to resume
    this.input.keyboard?.on('keydown-ESC', () => {
      this.scene.stop('PauseScene');
      this.scene.resume('MainScene');
    });
  }
}
