import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class VictoryScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: any): void {
    this.score = data.score ?? 0;
    this.highScore = data.highScore ?? 0;
  }

  create(): void {
    const W = GameConfig.WIDTH;
    const H = GameConfig.HEIGHT;

    // Dark green background
    const bg = this.add.graphics();
    for (let y = 0; y < H; y += 2) {
      const t = y / H;
      const r = Math.floor(5 + t * 5);
      const g = Math.floor(15 + t * 10);
      const b = Math.floor(10 + t * 8);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, W, 2);
    }
    bg.lineStyle(2, GameConfig.COLORS.NEON_GREEN, 0.5);
    bg.strokeRect(1, 1, W - 2, H - 2);

    // Confetti particles
    for (let i = 0; i < 30; i++) {
      const px = Phaser.Math.Between(20, W - 20);
      const py = Phaser.Math.Between(-100, -10);
      const colors = [0xff44aa, 0x44ff88, 0x44aaff, 0xffee44, 0xaa44ff];
      const c = colors[i % colors.length];
      const dot = this.add.circle(px, py, Phaser.Math.Between(2, 5), c, 0.8);
      this.tweens.add({
        targets: dot,
        y: H + 20,
        x: px + Phaser.Math.Between(-60, 60),
        alpha: 0,
        duration: 2000 + Math.random() * 2000,
        delay: Math.random() * 1500,
        repeat: -1,
        onRepeat: () => {
          dot.y = Phaser.Math.Between(-100, -10);
          dot.x = Phaser.Math.Between(20, W - 20);
          dot.alpha = 0.8;
        },
      });
    }

    // Title
    const title = this.add.text(W / 2, 80, '★ VICTORY ★', {
      font: 'bold 54px "Segoe UI", Arial',
      color: '#44ff88',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scale: { from: 0.8, to: 1 },
      duration: 500,
      ease: 'Back.easeOut',
    });

    this.add.text(W / 2, 145, 'ALL LEVELS COMPLETED!', {
      font: 'bold 24px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, 210, 'FINAL SCORE', {
      font: '14px Arial',
      color: '#888899',
    }).setOrigin(0.5);

    const scoreText = this.add.text(W / 2, 250, '0', {
      font: 'bold 52px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    const counter = { val: 0 };
    this.tweens.add({
      targets: counter,
      val: this.score,
      duration: 1500,
      ease: 'Power2',
      onUpdate: () => scoreText.setText(`${Math.floor(counter.val)}`),
    });

    this.add.text(W / 2, 310, `HIGH SCORE: ${this.highScore}`, {
      font: 'bold 18px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    if (this.score >= this.highScore && this.score > 0) {
      const best = this.add.text(W / 2, 350, '⭐ PERSONAL BEST ⭐', {
        font: 'bold 20px Arial',
        color: '#ff44aa',
      }).setOrigin(0.5);
      this.tweens.add({
        targets: best,
        scale: { from: 1, to: 1.1 },
        duration: 600,
        yoyo: true,
        repeat: -1,
      });
    }

    // Play again
    this.createButton(W / 2, H - 130, 'PLAY AGAIN', GameConfig.COLORS.NEON_GREEN, () => {
      this.scene.start('MainScene');
    });

    // Menu
    this.createButton(W / 2, H - 60, 'MENU', GameConfig.COLORS.NEON_BLUE, () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });
  }

  private createButton(x: number, y: number, label: string, color: number, onClick: () => void): void {
    const g = this.add.graphics();
    const w = 200, h = 50;
    const drawBtn = (hover: boolean) => {
      g.clear();
      g.fillStyle(hover ? 0x223322 : 0x112211, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 8);
      g.lineStyle(2, color, hover ? 1 : 0.6);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 8);
    };
    drawBtn(false);

    const colorStr = '#' + color.toString(16).padStart(6, '0');
    this.add.text(x, y, label, {
      font: 'bold 22px "Segoe UI", Arial',
      color: colorStr,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h).setInteractive();
    hit.on('pointerover', () => drawBtn(true));
    hit.on('pointerout', () => drawBtn(false));
    hit.on('pointerdown', onClick);
  }
}
