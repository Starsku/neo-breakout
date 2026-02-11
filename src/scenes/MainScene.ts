import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { Paddle } from '../objects/Paddle';
import { Ball } from '../objects/Ball';
import { Brick, BrickType } from '../objects/Brick';
import { PowerUp, PowerUpType } from '../objects/PowerUp';
import { ScoreSystem } from '../systems/ScoreSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { LevelSystem } from '../systems/LevelSystem';

export class MainScene extends Phaser.Scene {
  private paddle!: Paddle;
  private balls: Ball[] = [];
  private bricks!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private scoreSystem!: ScoreSystem;
  private audioSystem!: AudioSystem;
  private levelSystem!: LevelSystem;

  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private launchHint!: Phaser.GameObjects.Text;
  private powerUpIndicator!: Phaser.GameObjects.Text;
  private pauseButton!: Phaser.GameObjects.Container;

  // State
  private lives: number = GameConfig.LIVES;
  private waitingToLaunch: boolean = true;
  private activePowerUps: Map<PowerUpType, number> = new Map();
  private backgroundGraphics!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any): void {
    this.scoreSystem = new ScoreSystem();
    this.lives = GameConfig.LIVES;
    this.waitingToLaunch = true;
    this.activePowerUps.clear();
    this.balls = [];
  }

  create(): void {
    this.audioSystem = new AudioSystem();
    this.levelSystem = new LevelSystem();

    // Background
    this.drawBackground();

    // Physics groups
    this.bricks = this.physics.add.group();
    this.powerUps = this.physics.add.group();

    // Disable bottom world bounds
    this.physics.world.setBoundsCollision(true, true, true, false);

    // Create game objects
    this.paddle = new Paddle(this);
    this.spawnBall();
    this.createBricks();

    // UI
    this.createUI();

    // Pause Button
    this.createPauseButton();

    // Input
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-SPACE', () => this.handleLaunchOrFire());
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Don't launch if clicking UI
      if (pointer.y < 80 && pointer.x > GameConfig.WIDTH - 80) return;
      this.handleLaunchOrFire();
    });

    // Collisions
    this.setupCollisions();
  }

  // ─────────── Background ───────────
  private drawBackground(): void {
    this.backgroundGraphics = this.add.graphics();
    this.backgroundGraphics.setDepth(-1);
    // Dark gradient
    for (let y = 0; y < GameConfig.HEIGHT; y += 2) {
      const t = y / GameConfig.HEIGHT;
      const r = Math.floor(10 + t * 8);
      const g = Math.floor(10 + t * 6);
      const b = Math.floor(26 + t * 20);
      this.backgroundGraphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b), 1);
      this.backgroundGraphics.fillRect(0, y, GameConfig.WIDTH, 2);
    }
    // Grid lines (subtle)
    this.backgroundGraphics.lineStyle(1, 0x1a1a3e, 0.2);
    for (let x = 0; x < GameConfig.WIDTH; x += 40) {
      this.backgroundGraphics.lineBetween(x, 0, x, GameConfig.HEIGHT);
    }
    for (let y = 0; y < GameConfig.HEIGHT; y += 40) {
      this.backgroundGraphics.lineBetween(0, y, GameConfig.WIDTH, y);
    }
    // Border glow
    this.backgroundGraphics.lineStyle(2, GameConfig.COLORS.NEON_BLUE, 0.3);
    this.backgroundGraphics.strokeRect(1, 1, GameConfig.WIDTH - 2, GameConfig.HEIGHT - 2);
  }

  // ─────────── Ball Management ───────────
  private spawnBall(): void {
    const ball = new Ball(this, this.paddle.x, GameConfig.PADDLE_Y - 20);
    ball.stick(this.paddle.x);
    this.balls.push(ball);
    this.setupBallCollisions(ball);
    this.waitingToLaunch = true;
    this.updateLaunchHint(true);
  }

  private setupBallCollisions(ball: Ball): void {
    this.physics.add.collider(ball, this.paddle, (obj1: any, obj2: any) => {
      this.onBallHitPaddle(obj1 as Ball, obj2 as Paddle);
    });

    // Use overlap + manual bounce to avoid Phaser freeze on brick destruction
    this.physics.add.overlap(ball, this.bricks, (obj1: any, obj2: any) => {
      this.onBallHitBrick(obj1 as Ball, obj2 as Brick);
    });

    // Ball also collects power-ups on contact
    this.physics.add.overlap(ball, this.powerUps, (_: any, obj2: any) => {
      this.onPowerUpCaught(obj2 as PowerUp);
    });
  }

  private handleLaunchOrFire(): void {
    // Launch ball if waiting
    if (this.waitingToLaunch && this.balls.length > 0) {
      const ball = this.balls.find((b) => b.isStuckToPaddle());
      if (ball) {
        ball.unstick(this.paddle.x, this.paddle.getWidth());
        this.waitingToLaunch = false;
        this.updateLaunchHint(false);
        this.audioSystem.playSoundEffect('launch');
        this.scoreSystem.resetCombo();

        // Consume one stick use or decrease timer if we wanted to limit it, 
        // but typically sticky lasts for a duration. 
        // Here we just let it be handled by the update loop timer.
        return;
      }
    }
  }

  // ─────────── Bricks ───────────
  private createBricks(): void {
    this.bricks.clear(true, true);
    const layout = this.levelSystem.getBrickLayout();
    layout.forEach((config) => {
      const brick = new Brick(
        this,
        config.x,
        config.y,
        config.type,
        config.health,
        config.colorIndex
      );
      this.bricks.add(brick);
    });
  }

  private countDestructibleBricks(): number {
    let count = 0;
    this.bricks.children.entries.forEach((child) => {
      const brick = child as Brick;
      if (brick.active && brick.getType() !== 'indestructible') {
        count++;
      }
    });
    return count;
  }

  // ─────────── UI ───────────
  private createUI(): void {
    const uiStyle = {
      font: 'bold 16px "Segoe UI", Arial',
      color: '#ffffff',
    };

    this.scoreText = this.add
      .text(15, 12, 'SCORE 0', { ...uiStyle, color: '#ffffff' })
      .setDepth(10);

    this.comboText = this.add
      .text(GameConfig.WIDTH - 15, 12, 'COMBO ×0', {
        ...uiStyle,
        color: '#ffee44',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.levelText = this.add
      .text(GameConfig.WIDTH / 2, 12, `LEVEL ${this.levelSystem.getCurrentLevel()}`, {
        ...uiStyle,
        color: '#44ff88',
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.livesText = this.add
      .text(15, GameConfig.HEIGHT - 22, this.getLivesDisplay(), {
        font: '16px Arial',
        color: '#ff4466',
      })
      .setDepth(10);

    this.powerUpIndicator = this.add
      .text(GameConfig.WIDTH - 15, GameConfig.HEIGHT - 22, '', {
        font: 'bold 14px Arial',
        color: '#ffaa22',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.launchHint = this.add
      .text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 50, '[ SPACE / CLICK to launch ]', {
        font: '14px Arial',
        color: '#888888',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(10);

    // Blink effect on hint
    this.tweens.add({
      targets: this.launchHint,
      alpha: { from: 1, to: 0.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });
  }

  private getLivesDisplay(): string {
    return '♥'.repeat(this.lives) + '♡'.repeat(Math.max(0, GameConfig.LIVES - this.lives));
  }

  private updateLaunchHint(show: boolean): void {
    if (this.launchHint) {
      this.launchHint.setVisible(show);
    }
  }

  private createPauseButton(): void {
    const x = GameConfig.WIDTH - 40;
    const y = 40;
    const size = 32;

    this.pauseButton = this.add.container(x, y);
    this.pauseButton.setDepth(100);

    const bg = this.add.graphics();
    const drawBg = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(0x000000, hover ? 0.6 : 0.3);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 6);
      bg.lineStyle(1.5, GameConfig.COLORS.UI_PRIMARY, hover ? 1 : 0.5);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 6);
    };
    drawBg(false);

    const icon = this.add.graphics();
    icon.fillStyle(0xffffff, 0.9);
    // Pause icon (two bars)
    icon.fillRect(-6, -8, 4, 16);
    icon.fillRect(2, -8, 4, 16);

    this.pauseButton.add([bg, icon]);

    const hitArea = new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size);
    this.pauseButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    this.pauseButton.on('pointerover', () => {
      drawBg(true);
      this.game.canvas.style.cursor = 'pointer';
    });
    this.pauseButton.on('pointerout', () => {
      drawBg(false);
      this.game.canvas.style.cursor = 'default';
    });
    this.pauseButton.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event.stopPropagation();
      this.togglePause();
    });
  }

  // ─────────── Collisions ───────────
  private setupCollisions(): void {
    // Paddle catches power-ups
    this.physics.add.overlap(this.paddle, this.powerUps, (_, obj2: any) => {
      this.onPowerUpCaught(obj2 as PowerUp);
    });
  }

  private onBallHitPaddle(ball: Ball, paddle: Paddle): void {
    if (ball.isStuckToPaddle()) return;

    // Sticky powerup check
    if (this.activePowerUps.has('sticky')) {
      ball.stick(paddle.x);
      this.waitingToLaunch = true;
      this.updateLaunchHint(true);
      this.audioSystem.playSoundEffect('paddle');
      return;
    }

    ball.handlePaddleCollision(paddle);
    this.scoreSystem.resetCombo();
    this.audioSystem.playSoundEffect('paddle', this.scoreSystem.getCombo());
  }

  private onBallHitBrick(ball: Ball, brick: Brick): void {
    if (!brick.active) return;

    const isMega = ball.getMega();
    const brickType = brick.getType();
    const brickX = brick.x;
    const brickY = brick.y;
    const brickColor = brick.getColor();

    // Manual bounce (since we use overlap, not collider)
    if (!isMega) {
      const ballBody = ball.body as Phaser.Physics.Arcade.Body;
      if (ballBody) {
        // Determine bounce direction based on relative position
        const dx = ball.x - brickX;
        const dy = ball.y - brickY;
        const absDx = Math.abs(dx) / (GameConfig.BRICK_WIDTH / 2);
        const absDy = Math.abs(dy) / (GameConfig.BRICK_HEIGHT / 2);

        if (absDy > absDx) {
          // Hit top or bottom - reverse Y
          ballBody.velocity.y *= -1;
        } else {
          // Hit left or right - reverse X
          ballBody.velocity.x *= -1;
        }
      }
    }

    const destroyed = brick.hit();

    if (destroyed) {
      const points = brick.getPoints();

      // Disable physics immediately
      if (brick.body) {
        (brick.body as Phaser.Physics.Arcade.Body).enable = false;
      }
      brick.setActive(false);
      brick.setVisible(false);

      // Score (addScore auto-increments combo)
      this.scoreSystem.addScore(points, this.levelSystem.getSpeedMultiplier());

      // Power-up chance
      const powerUp = PowerUp.createRandom(this, brickX, brickY);
      if (powerUp) {
        this.powerUps.add(powerUp);
      }

      // Explosion particles
      this.createParticles(brickX, brickY, brickColor);

      // Destroy and check level complete
      this.time.delayedCall(10, () => {
        if (brick && brick.scene) brick.destroy();
        this.checkLevelComplete();
      });
    }

    // Sound
    this.audioSystem.playSoundEffect(
      brickType === 'armored' ? 'armor' : 'brick',
      this.scoreSystem.getCombo()
    );

    // Acceleration
    ball.accelerate(GameConfig.INTRA_LEVEL_ACCELERATION);
  }

  private onPowerUpCaught(powerUp: PowerUp): void {
    const type = powerUp.getType();
    this.audioSystem.playSoundEffect('powerup');
    powerUp.destroy();

    switch (type) {
      case 'multiball':
        this.activateMultiball();
        break;
      case 'sticky':
        this.activateSticky();
        break;
      case 'mega':
        this.balls.forEach((b) => b.setMega(GameConfig.POWERUP_DURATION));
        break;
    }
  }

  // ─────────── Power-ups ───────────
  private activateMultiball(): void {
    const currentBalls = [...this.balls];
    currentBalls.forEach((ball) => {
      if (!ball.isStuckToPaddle()) {
        const pos = ball.getPosition();
        for (let i = 0; i < 2; i++) {
          const nb = new Ball(this, pos.x + (i === 0 ? -15 : 15), pos.y);
          nb.launch(i === 0 ? 240 * Phaser.Math.DEG_TO_RAD : 300 * Phaser.Math.DEG_TO_RAD);
          this.balls.push(nb);
          this.setupBallCollisions(nb);
        }
      }
    });
  }

  private activateSticky(): void {
    // Next paddle hit will stick
    this.activePowerUps.set('sticky', GameConfig.POWERUP_DURATION);
  }

  // ─────────── Particles (simple, compatible) ───────────
  private createParticles(x: number, y: number, color: number): void {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 80 + Math.random() * 120;
      const size = 2 + Math.random() * 3;

      const p = this.add.circle(x, y, size, color, 1).setDepth(8);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed + 30,
        alpha: 0,
        scale: 0,
        duration: 350 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => p.destroy(),
      });
    }
  }

  // ─────────── Level Logic ───────────
  private checkLevelComplete(): void {
    if (this.countDestructibleBricks() === 0) {
      this.time.delayedCall(200, () => this.nextLevel());
    }
  }

  private nextLevel(): void {
    if (this.levelSystem.isLastLevel()) {
      this.scoreSystem.saveHighScore();
      this.scene.start('VictoryScene', {
        score: this.scoreSystem.getScore(),
        highScore: this.scoreSystem.getHighScore(),
      });
      return;
    }

    this.levelSystem.nextLevel();
    this.audioSystem.playSoundEffect('levelup');

    // Clear balls and powerups
    this.balls.forEach((b) => {
      b.cleanUp();
      b.destroy();
    });
    this.balls = [];
    this.powerUps.clear(true, true);
    this.activePowerUps.clear();

    // Speed up
    const speedMul = this.levelSystem.getSpeedMultiplier();

    // New bricks
    this.createBricks();

    // New ball
    this.spawnBall();
    this.balls.forEach((b) => b.setBaseSpeed(GameConfig.BALL_SPEED_BASE * speedMul));

    // Update UI
    this.levelText.setText(`LEVEL ${this.levelSystem.getCurrentLevel()}`);

    // Flash effect
    const flash = this.add.rectangle(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      GameConfig.WIDTH,
      GameConfig.HEIGHT,
      0xffffff,
      0.3
    ).setDepth(20);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });
  }

  // ─────────── Ball Lost ───────────
  private onBallLost(): void {
    // Prevent being called multiple times
    this.waitingToLaunch = true;
    
    this.lives--;
    this.livesText.setText(this.getLivesDisplay());
    this.audioSystem.playSoundEffect('loss');

    if (this.lives <= 0) {
      this.scoreSystem.saveHighScore();
      this.time.delayedCall(500, () => {
        this.scene.start('GameOverScene', {
          score: this.scoreSystem.getScore(),
          highScore: this.scoreSystem.getHighScore(),
        });
      });
      return;
    }

    // Flash red
    const flash = this.add.rectangle(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      GameConfig.WIDTH,
      GameConfig.HEIGHT,
      0xff0000,
      0.15
    ).setDepth(20);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 400,
      onComplete: () => flash.destroy(),
    });

    // Clear active powerups
    this.activePowerUps.clear();
    this.powerUps.clear(true, true);

    // Spawn new ball after delay
    this.time.delayedCall(600, () => {
      this.spawnBall();
    });
  }

  // ─────────── Pause ───────────
  private togglePause(): void {
    this.game.canvas.style.cursor = 'default';
    this.scene.pause('MainScene');
    this.scene.launch('PauseScene');
  }

  // ─────────── Main Update Loop ───────────
  update(time: number, delta: number): void {
    // Paddle
    this.paddle.updatePaddle(delta);

    // Balls follow paddle if stuck
    this.balls.forEach((b) => {
      if (b.isStuckToPaddle()) {
        b.followPaddle(this.paddle.x);
      }
    });

    // Update balls, check for lost balls
    const lostBalls: Ball[] = [];
    this.balls = this.balls.filter((ball) => {
      ball.updateBall(delta / 1000);

      if (ball.y > GameConfig.HEIGHT + 20) {
        lostBalls.push(ball);
        ball.cleanUp();
        ball.destroy();
        return false;
      }
      return true;
    });

    // If all balls lost
    if (this.balls.length === 0 && !this.waitingToLaunch) {
      this.onBallLost();
      return;
    }

    // Update bricks (mobile)
    this.bricks.children.entries.forEach((child) => {
      const brick = child as Brick;
      if (brick.active) brick.updateBrick(delta);
    });

    // Power-up timers
    this.activePowerUps.forEach((remaining, type) => {
      const newRemaining = remaining - delta;
      if (newRemaining <= 0) {
        this.activePowerUps.delete(type);
      } else {
        this.activePowerUps.set(type, newRemaining);
      }
    });

    // Clean up off-screen power-ups
    this.powerUps.children.entries.forEach((child) => {
      if ((child as any).y > GameConfig.HEIGHT + 30) {
        child.destroy();
      }
    });

    // Update UI
    this.scoreText.setText(`SCORE ${this.scoreSystem.getScore()}`);
    const combo = this.scoreSystem.getCombo();
    this.comboText.setText(combo > 0 ? `COMBO ×${combo}` : '');

    // Power-up indicator
    const puTexts: string[] = [];
    this.activePowerUps.forEach((remaining, type) => {
      const secs = Math.ceil(remaining / 1000);
      const labels: Record<string, string> = {
        sticky: `◎${secs}s`,
        mega: `★${secs}s`,
      };
      if (labels[type]) puTexts.push(labels[type]);
    });
    this.powerUpIndicator.setText(puTexts.join('  '));
  }

  shutdown(): void {
    this.balls.forEach((b) => b.cleanUp());
    this.paddle?.cleanUp();
  }
}
