import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ScoreSystem } from '../systems/ScoreSystem';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const W = GameConfig.WIDTH;
    const H = GameConfig.HEIGHT;
    const scoreSystem = new ScoreSystem();

    // Background
    const bg = this.add.graphics();
    for (let y = 0; y < H; y += 2) {
      const t = y / H;
      const r = Math.floor(8 + t * 12);
      const g = Math.floor(8 + t * 8);
      const b = Math.floor(20 + t * 30);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      bg.fillRect(0, y, W, 2);
    }

    // Animated grid
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3e, 0.15);
    for (let x = 0; x < W; x += 40) grid.lineBetween(x, 0, x, H);
    for (let y = 0; y < H; y += 40) grid.lineBetween(0, y, W, y);

    // Neon border
    bg.lineStyle(2, GameConfig.COLORS.NEON_BLUE, 0.4);
    bg.strokeRect(1, 1, W - 2, H - 2);

    // Title with glow
    const titleGlow = this.add.text(W / 2, 100, 'NEO-BREAKOUT', {
      font: 'bold 56px "Segoe UI", Arial',
      color: '#00ff88',
      align: 'center',
    }).setOrigin(0.5).setAlpha(0.3).setScale(1.05);

    const title = this.add.text(W / 2, 100, 'NEO-BREAKOUT', {
      font: 'bold 56px "Segoe UI", Arial',
      color: '#00ff88',
      align: 'center',
    }).setOrigin(0.5);

    // Pulse glow
    this.tweens.add({
      targets: titleGlow,
      alpha: { from: 0.15, to: 0.4 },
      scale: { from: 1.03, to: 1.08 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Subtitle
    this.add.text(W / 2, 160, 'BRICK BREAKER', {
      font: '18px Arial',
      color: '#44aaff',
      letterSpacing: 8,
    } as any).setOrigin(0.5);

    // High score
    const hs = scoreSystem.getHighScore();
    if (hs > 0) {
      this.add.text(W / 2, 210, `HIGH SCORE: ${hs}`, {
        font: 'bold 22px Arial',
        color: '#ffee44',
      }).setOrigin(0.5);
    }

    // Play button
    const btnBg = this.add.graphics();
    btnBg.fillStyle(0x003322, 1);
    btnBg.fillRoundedRect(W / 2 - 100, 290, 200, 60, 10);
    btnBg.lineStyle(2, GameConfig.COLORS.NEON_GREEN, 0.8);
    btnBg.strokeRoundedRect(W / 2 - 100, 290, 200, 60, 10);

    const playText = this.add.text(W / 2, 320, '▶  PLAY', {
      font: 'bold 28px "Segoe UI", Arial',
      color: '#44ff88',
    }).setOrigin(0.5);

    const hitArea = this.add.rectangle(W / 2, 320, 200, 60).setInteractive();
    hitArea.on('pointerover', () => {
      playText.setColor('#88ffbb');
      btnBg.clear();
      btnBg.fillStyle(0x005533, 1);
      btnBg.fillRoundedRect(W / 2 - 100, 290, 200, 60, 10);
      btnBg.lineStyle(2, GameConfig.COLORS.NEON_GREEN, 1);
      btnBg.strokeRoundedRect(W / 2 - 100, 290, 200, 60, 10);
    });
    hitArea.on('pointerout', () => {
      playText.setColor('#44ff88');
      btnBg.clear();
      btnBg.fillStyle(0x003322, 1);
      btnBg.fillRoundedRect(W / 2 - 100, 290, 200, 60, 10);
      btnBg.lineStyle(2, GameConfig.COLORS.NEON_GREEN, 0.8);
      btnBg.strokeRoundedRect(W / 2 - 100, 290, 200, 60, 10);
    });
    hitArea.on('pointerdown', () => {
      this.scene.start('MainScene');
    });

    // SPACE to play
    this.input.keyboard?.on('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });

    // Controls info
    const controls = [
      ['← → / Q D', 'Move paddle'],
      ['MOUSE', 'Aim paddle'],
      ['SPACE / CLICK', 'Launch ball'],
      ['ESC', 'Pause'],
    ];

    let yPos = 400;
    yPos = 390; // Shift up slightly
    controls.forEach(([key, desc]) => {
      this.add.text(W / 2 - 100, yPos, key, {
        font: 'bold 13px Arial',
        color: '#44ff88',
      });
      this.add.text(W / 2 + 20, yPos, desc, {
        font: '13px Arial',
        color: '#aaaacc',
      });
      yPos += 22;
    });

    // Footer
    this.add.text(W / 2, H - 15, 'v2.1 — 5 Levels • 3 Power-ups • Leaderboard', {
      font: '11px Arial',
      color: '#555577',
    }).setOrigin(0.5);

    // Leaderboard
    this.displayLeaderboard(W / 2, 420, scoreSystem);
  }

  private async displayLeaderboard(x: number, y: number, scoreSystem: ScoreSystem): Promise<void> {
    const title = this.add.text(x, y + 85, 'LOADING LEADERBOARD...', {
      font: 'bold 16px Arial',
      color: '#ffaa22',
      letterSpacing: 2
    }).setOrigin(0.5);

    const leaderboard = await scoreSystem.refreshLeaderboard();
    
    if (leaderboard.length === 0) {
      title.setText('NO SCORES YET');
      return;
    }

    title.setText('TOP 3 RANKING');

    leaderboard.forEach((entry, i) => {
      const yPos = y + 115 + i * 25;
      const color = i === 0 ? '#ffee44' : i === 1 ? '#cccccc' : '#cd7f32';
      
      this.add.text(x - 100, yPos, `${i + 1}. ${entry.name.toUpperCase()}`, {
        font: 'bold 14px Arial',
        color: color,
      });

      this.add.text(x + 100, yPos, entry.score.toLocaleString(), {
        font: 'bold 14px Arial',
        color: '#ffffff',
      }).setOrigin(1, 0);
    });
  }
}
