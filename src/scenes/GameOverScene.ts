import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ScoreSystem } from '../systems/ScoreSystem';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private highScore: number = 0;
  private scoreSystem!: ScoreSystem;
  private nameInputVisible: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
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

    // Dark background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a0008, 1);
    bg.fillRect(0, 0, W, H);
    bg.lineStyle(2, GameConfig.COLORS.UI_DANGER, 0.3);
    bg.strokeRect(1, 1, W - 2, H - 2);

    // Title
    this.add.text(W / 2, 70, 'GAME OVER', {
      font: 'bold 48px "Segoe UI", Arial',
      color: '#ff4466',
    }).setOrigin(0.5);

    // Score
    this.add.text(W / 2, 140, `SCORE`, {
      font: '14px Arial',
      color: '#888899',
    }).setOrigin(0.5);

    this.add.text(W / 2, 180, `${this.score}`, {
      font: 'bold 42px Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Leaderboard or Input
    this.checkLeaderboard(W / 2, 250);
  }

  private async checkLeaderboard(x: number, y: number): Promise<void> {
    const loadingText = this.add.text(x, y, 'CHECKING SCORE...', {
      font: 'bold 18px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    await this.scoreSystem.refreshLeaderboard();
    loadingText.destroy();
    
    if (this.scoreSystem.hasApiError()) {
      this.add.text(x, y, 'CONNECTION ERROR', {
        font: 'bold 20px Arial',
        color: '#ff4444',
      }).setOrigin(0.5);
      this.createNavigationButtons(GameConfig.WIDTH, GameConfig.HEIGHT);
    } else if (this.scoreSystem.isTop3(this.score) && this.score > 0) {
      this.showNameInput(x, 280);
    } else {
      this.showLeaderboard(x, y);
      this.createNavigationButtons(GameConfig.WIDTH, GameConfig.HEIGHT);
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
      font: 'bold 32px "Courier New"',
      color: '#44ff88',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(10);
    inputGroup.add(nameDisplay);

    // HTML Input to trigger mobile keyboard and handle input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'text';
    hiddenInput.maxLength = 10;
    
    // Style the input to match the game and overlay perfectly
    Object.assign(hiddenInput.style, {
      width: '200px',
      height: '50px',
      fontSize: '32px',
      fontFamily: '"Courier New", Courier, monospace',
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#44ff88',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      border: '1px solid #44ff88',
      borderRadius: '5px',
      outline: 'none',
      caretColor: 'transparent', // Hide cursor
      textShadow: '0 0 5px #44ff88',
      boxShadow: '0 0 10px rgba(68, 255, 136, 0.2)'
    });

    const phaserDomElement = this.add.dom(x, y + 40, hiddenInput).setDepth(11);
    
    // Hide nameDisplay since we now use the styled input
    nameDisplay.setVisible(false);
    
    // Focus the input to show the keyboard
    hiddenInput.focus();
    
    const updateName = (val: string) => {
      playerName = val.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
      hiddenInput.value = playerName;
    };

    hiddenInput.addEventListener('input', (e) => {
      updateName((e.target as HTMLInputElement).value);
    });

    const submitBtn = this.add.text(x, y + 100, 'PRESS ENTER TO SAVE', {
      font: 'bold 16px Arial',
      color: '#888888'
    }).setOrigin(0.5);
    inputGroup.add(submitBtn);

    const cleanup = () => {
      this.nameInputVisible = false;
      hiddenInput.remove();
      phaserDomElement.destroy();
    };

    const submitScore = () => {
      if (playerName.length < 3) return;
      
      console.log('Submitting score:', playerName, this.score);
      cleanup();
      this.input.keyboard?.off('keydown', onKeyDown);
      inputGroup.clear(true, true);

      const submittingText = this.add.text(x, 250, 'SUBMITTING...', {
        font: 'bold 18px Arial',
        color: '#ffee44',
      }).setOrigin(0.5);

      // Security: Sanitize name (already done by regex but extra safety)
      const sanitizedName = playerName.replace(/<[^>]*>?/gm, '').trim();

      this.scoreSystem.addToLeaderboard(sanitizedName, this.score).then(() => {
        submittingText.destroy();
        if (this.scoreSystem.hasApiError()) {
           this.add.text(x, 250, 'SUBMISSION FAILED (TIMEOUT)', {
             font: 'bold 20px Arial',
             color: '#ff4444',
           }).setOrigin(0.5);
        } else {
           this.showLeaderboard(x, 250);
        }
        this.createNavigationButtons(GameConfig.WIDTH, GameConfig.HEIGHT);
      }).catch(err => {
        console.error('Submission error:', err);
        submittingText.setText('SUBMISSION FAILED');
        this.createNavigationButtons(GameConfig.WIDTH, GameConfig.HEIGHT);
      });
    };

    // Neon Validation Button for Mobile
    this.createButton(x, y + 150, 'VALIDATE', GameConfig.COLORS.NEON_GREEN, submitScore);

    const onKeyDown = (event: KeyboardEvent) => {
      if (!this.nameInputVisible) return;
      if (event.key === 'Enter') {
        submitScore();
      }
    };

    this.input.keyboard?.on('keydown', onKeyDown);
  }

  private async showLeaderboard(x: number, y: number): Promise<void> {
    const title = this.add.text(x, y, 'TOP 3 LEADERBOARD', {
      font: 'bold 18px Arial',
      color: '#ffee44',
    }).setOrigin(0.5);

    const leaderboard = this.scoreSystem.getLeaderboard();

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
    this.createButton(W / 2, H - 140, 'RETRY', GameConfig.COLORS.NEON_GREEN, () => {
      this.scene.start('MainScene');
    });

    this.createButton(W / 2, H - 70, 'MENU', GameConfig.COLORS.NEON_BLUE, () => {
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
    const w = 180, h = 50;
    const colorStr = '#' + color.toString(16).padStart(6, '0');
    
    const drawBtn = (hover: boolean) => {
      g.clear();
      if (hover) {
        // Neon glow effect
        g.lineStyle(4, color, 0.3);
        g.strokeRoundedRect(x - w / 2 - 2, y - h / 2 - 2, w + 4, h + 4, 12);
      }
      
      g.fillStyle(hover ? 0x222244 : 0x111133, 1);
      g.fillRoundedRect(x - w / 2, y - h / 2, w, h, 10);
      g.lineStyle(2, color, hover ? 1 : 0.6);
      g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 10);
    };
    drawBtn(false);

    const txt = this.add.text(x, y, label, {
      font: 'bold 22px "Segoe UI", Arial',
      color: colorStr,
    }).setOrigin(0.5);

    const hit = this.add.rectangle(x, y, w, h).setInteractive();
    hit.on('pointerover', () => {
      drawBtn(true);
      txt.setScale(1.05);
      txt.setShadow(0, 0, colorStr, 10, true, true);
    });
    hit.on('pointerout', () => {
      drawBtn(false);
      txt.setScale(1);
      txt.setShadow(0, 0, 'none');
    });
    hit.on('pointerdown', onClick);
  }
}
