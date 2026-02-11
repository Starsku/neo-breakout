import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: any): void {
    this.score = data.score ?? 0;
    this.highScore = data.highScore ?? 0;
  }

  create(): void {
    const W = GameConfig.WIDTH;
    const H = GameConfig.HEIGHT;
    const isNewRecord = this.score === this.highScore && this.score > 0;

    // Dark background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0008, 1);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(2, GameConfig.COLORS.UI_DANGER, 0.3);
    bg.strokeRect(1, 1, W - 2, H - 2);

    // Title
    this.add.text(W / 2, 100, 'GAME OVER', {
      font: 'bold 54px "Segoe UI", Arial',
      color: '#ff4466',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, 200, `SCORE`, {
      font: '16px Arial',
      color: '#888899',
    }).setOrigin(0.5);

    const scoreText = this.add.text(W / 2, 240, `${this.score}`, {
      font: 'bold 48px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Animate score counting up
    const counter = { val: 0 };
    this.tweens.add({
      targets: counter,
      val: this.score,
      duration: 1000,
      ease: 'Power2',
      onUpdate: () => {
        scoreText.setText(`${Math.floor(counter.val)}`);
      },
    });

    // High score
    this.add.text(W / 2, 300, `HIGH SCORE: ${this.highScore}`, {
      font: 'bold 20px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    if (isNewRecord) {
      const record = this.add.text(W / 2, 340, '★ NEW RECORD ★', {
        font: 'bold 22px Arial',
        color: '#ff44aa',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: record,
        scale: { from: 1, to: 1.15 },
        alpha: { from: 1, to: 0.7 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }

    // Retry button
    this.createButton(W / 2, H - 140, 'RETRY', GameConfig.COLORS.NEON_GREEN, () => {
      this.scene.start('MainScene');
    });

    // Menu button
    this.createButton(W / 2, H - 70, 'MENU', GameConfig.COLORS.NEON_BLUE, () => {
      this.scene.start('MenuScene');
    });

    // SPACE to retry
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const g = this.add.graphics();
    const w = 180, h = 50;
    const drawBtn = (hover: boolean) => {
      g.clear();
      g.fillStyle(hover ? 0x222244 : 0x111133, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      g.lineStyle(2, color, hover ? 1 : 0.6);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    };
    drawBtn(false);

    const colorStr = '#' + color.toString(16).padStart(6, '0');
    const text = this.add.text(x, y, label, {
      font: 'bold 22px "Segoe UI", Arial',
      color: colorStr,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h).setInteractive();
    hit.on('pointerover', () => drawBtn(true));
    hit.on('pointerout', () => drawBtn(false));
    hit.on('pointerdown', onClick);
  }
}
