import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  create(): void {
    const W = GameConfig.WIDTH;
    const H = GameConfig.HEIGHT;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.6);

    // Title
    this.add.text(W / 2, H / 2 - 70, 'PAUSED', {
      font: 'bold 48px "Segoe UI", Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    // Resume button
    this.createButton(W / 2, H / 2 + 20, 'RESUME', GameConfig.COLORS.NEON_GREEN, () => {
      this.scene.stop('PauseScene');
      this.scene.resume('MainScene');
    });

    // Menu button
    this.createButton(W / 2, H / 2 + 90, 'MENU', GameConfig.COLORS.UI_DANGER, () => {
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

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const g = this.add.graphics();
    const w = 180, h = 48;
    const drawBtn = (hover: boolean) => {
      g.clear();
      g.fillStyle(hover ? 0x222244 : 0x111133, 0.9);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      g.lineStyle(2, color, hover ? 1 : 0.6);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    };
    drawBtn(false);

    const colorStr = '#' + color.toString(16).padStart(6, '0');
    this.add.text(x, y, label, {
      font: 'bold 20px "Segoe UI", Arial',
      color: colorStr,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h).setInteractive();
    hit.on('pointerover', () => drawBtn(true));
    hit.on('pointerout', () => drawBtn(false));
    hit.on('pointerdown', onClick);
  }
}
