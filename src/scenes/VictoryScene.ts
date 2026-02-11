import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ScoreSystem } from '../systems/ScoreSystem';

export class VictoryScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;
  private scoreSystem!: ScoreSystem;
  private nameInputVisible: boolean = false;

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: any): void {
    this.score = data.score ?? 0;
    this.highScore = data.highScore ?? 0;
    this.scoreSystem = new ScoreSystem();
    this.nameInputVisible = false;
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
    const title = this.add.text(W / 2, 60, '★ VICTORY ★', {
      font: 'bold 48px "Segoe UI", Arial',
      color: '#44ff88',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, 130, 'FINAL SCORE', {
      font: '14px Arial',
      color: '#888899',
    }).setOrigin(0.5);

    this.add.text(W / 2, 170, `${this.score}`, {
      font: 'bold 42px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Leaderboard or Input
    if (this.scoreSystem.isTop3(this.score) && this.score > 0) {
      this.showNameInput(W / 2, 280);
    } else {
      this.showLeaderboard(W / 2, 250);
      this.createNavigationButtons(W, H);
    }
  }

  private showNameInput(x: number, y: number): void {
    this.nameInputVisible = true;
    const inputGroup = this.add.group();

    const title = this.add.text(x, y - 40, 'NEW TOP 3 SCORE!', {
      font: 'bold 20px Arial',
      color: '#ffaa22',
    }).setOrigin(0.5);
    inputGroup.add(title);

    const prompt = this.add.text(x, y, 'ENTER YOUR NAME (3-10 CHARS):', {
      font: '14px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);
    inputGroup.add(prompt);

    let playerName = '';
    const nameDisplay = this.add.text(x, y + 40, '_', {
      font: 'bold 32px Courier New',
      color: '#44ff88',
      backgroundColor: '#112211',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    inputGroup.add(nameDisplay);

    const submitBtn = this.add.text(x, y + 100, 'PRESS ENTER TO SAVE', {
      font: 'bold 16px Arial',
      color: '#888888'
    }).setOrigin(0.5);
    inputGroup.add(submitBtn);
    
    this.tweens.add({
      targets: submitBtn,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Simple keyboard handler
    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.nameInputVisible) return;

      if (event.key === 'Backspace' && playerName.length > 0) {
        playerName = playerName.slice(0, -1);
      } else if (event.key === 'Enter' && playerName.length >= 3) {
        this.nameInputVisible = false;
        this.input.keyboard?.off('keydown', onKeyDown);
        
        // 1. Masquer l'input
        inputGroup.clear(true, true);

        // 2. Afficher message de confirmation avec animation
        const confirmText = this.add.text(x, y, 'Score enregistré !', {
          font: 'bold 24px Arial',
          color: '#44ff88'
        }).setOrigin(0.5).setAlpha(0).setScale(0.5);

        this.tweens.add({
          targets: confirmText,
          alpha: 1,
          scale: 1,
          y: y - 20,
          duration: 500,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.time.delayedCall(1000, () => {
              this.tweens.add({
                targets: confirmText,
                alpha: 0,
                duration: 500,
                onComplete: () => {
                  confirmText.destroy();
                  // 3. Afficher leaderboard mis à jour
                  this.showLeaderboard(x, 250);
                  // 4. Réafficher boutons navigation
                  this.createNavigationButtons(GameConfig.WIDTH, GameConfig.HEIGHT);
                }
              });
            });
          }
        });

        this.scoreSystem.addToLeaderboard(playerName, this.score);
      } else if (event.key.length === 1 && playerName.length < 10 && /[a-zA-Z0-9 ]/.test(event.key)) {
        playerName += event.key;
      }
      nameDisplay.setText(playerName + (playerName.length < 10 ? '_' : ''));
    };

    this.input.keyboard?.on('keydown', onKeyDown);
  }

  private showLeaderboard(x: number, y: number): void {
    const leaderboard = this.scoreSystem.getLeaderboard();
    
    this.add.text(x, y, 'TOP 3 LEADERBOARD', {
      font: 'bold 18px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    if (leaderboard.length === 0) {
      this.add.text(x, y + 50, 'NO SCORES YET', {
        font: '14px Arial',
        color: '#666666'
      }).setOrigin(0.5);
      return;
    }

    leaderboard.forEach((entry, i) => {
      const yPos = y + 40 + i * 30;
      const color = i === 0 ? '#ffee44' : i === 1 ? '#cccccc' : '#cd7f32';
      
      this.add.text(x - 120, yPos, `${i + 1}. ${entry.name.toUpperCase()}`, {
        font: 'bold 16px Arial',
        color: color,
      });

      this.add.text(x + 120, yPos, entry.score.toLocaleString(), {
        font: 'bold 16px Arial',
        color: '#ffffff',
      }).setOrigin(1, 0);
    });
  }

  private createNavigationButtons(W: number, H: number): void {
    // Play again
    this.createButton(W / 2, H - 130, 'PLAY AGAIN', GameConfig.COLORS.NEON_GREEN, () => {
      this.scene.start('MainScene');
    });

    // Menu
    this.createButton(W / 2, H - 60, 'MENU', GameConfig.COLORS.NEON_BLUE, () => {
      this.scene.start('MenuScene');
    });

    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.nameInputVisible) {
        this.scene.start('MainScene');
      }
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
