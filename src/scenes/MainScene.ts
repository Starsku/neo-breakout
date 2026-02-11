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
  private bricks: Phaser.Physics.Arcade.Group | null = null;
  private powerUps: Phaser.Physics.Arcade.Group | null = null;
  private scoreSystem!: ScoreSystem;
  private audioSystem!: AudioSystem;
  private levelSystem!: LevelSystem;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private isPaused: boolean = false;
  private activePowerUps: Map<PowerUpType, number> = new Map();
  private laserProjectiles: Phaser.Physics.Arcade.Group | null = null;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any): void {
    this.scoreSystem = data.scoreSystem || new ScoreSystem();
    this.scoreSystem.reset();
  }

  create(): void {
    this.audioSystem = new AudioSystem();
    this.levelSystem = new LevelSystem();

    // Background
    const graphics = this.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(GameConfig.COLORS.BG, 1);
    graphics.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.generateTexture('game-bg', GameConfig.WIDTH, GameConfig.HEIGHT);
    graphics.destroy();
    this.add.sprite(GameConfig.WIDTH / 2, GameConfig.HEIGHT / 2, 'game-bg');

    // Physics groups
    this.bricks = this.physics.add.group();
    this.powerUps = this.physics.add.group();
    this.laserProjectiles = this.physics.add.group();

    // Create game objects
    this.paddle = new Paddle(this);
    this.createInitialBall();
    this.createBricks();

    // UI
    this.createUI();

    // Input
    (this.input.keyboard as any)?.on('keydown-ESC', () => this.togglePause());

    // Collisions
    this.setupCollisions();
  }

  private createInitialBall(): void {
    const ball = new Ball(this);
    ball.stick(this.paddle.x);
    this.balls.push(ball);
  }

  private createBricks(): void {
    if (!this.bricks) return;

    this.bricks.clear(true, true);
    const layout = this.levelSystem.getBrickLayout();

    layout.forEach((config) => {
      const brick = new Brick(this, config.x, config.y, config.type, config.health);
      this.bricks?.add(brick);
    });
  }

  private createUI(): void {
    this.scoreText = this.add.text(10, 10, `Score: ${this.scoreSystem.getScore()}`, {
      font: '16px Arial',
      color: '#ffffff',
    });

    this.comboText = this.add.text(GameConfig.WIDTH - 10, 10, `Combo: ${this.scoreSystem.getCombo()}`, {
      font: '16px Arial',
      color: '#ffff00',
    }).setOrigin(1, 0);

    this.levelText = this.add.text(GameConfig.WIDTH / 2, 10, `Level: ${this.levelSystem.getCurrentLevel()}`, {
      font: '16px Arial',
      color: '#00ff00',
    }).setOrigin(0.5, 0);

    const pauseText = this.add.text(GameConfig.WIDTH / 2, GameConfig.HEIGHT - 20, 'Press ESC to Pause', {
      font: '12px Arial',
      color: '#888888',
    }).setOrigin(0.5, 1);
  }

  private setupCollisions(): void {
    if (!this.bricks || !this.powerUps) return;

    // Ball to paddle
    this.balls.forEach((ball) => {
      this.physics.add.collider(
        ball,
        this.paddle,
        (obj1: any, obj2: any) => this.handleBallPaddleCollision(obj1, obj2)
      );

      // Ball to bricks - USE COLLIDER for physics bounce
      this.physics.add.collider(
        ball,
        this.bricks!,
        (obj1: any, obj2: any) => this.handleBrickCollision(obj1, obj2)
      );

      // Ball to powerups
      this.physics.add.overlap(
        ball,
        this.powerUps!,
        () => {} // Paddle catches powerups
      );
    });

    // Paddle to powerups
    this.physics.add.overlap(
      this.paddle,
      this.powerUps,
      (obj1: any, obj2: any) => this.handlePowerUpCollision(obj1, obj2)
    );

    // Laser to bricks
    if (this.laserProjectiles) {
      this.physics.add.overlap(
        this.laserProjectiles,
        this.bricks,
        (obj1: any, obj2: any) => this.handleLaserBrickCollision(obj1, obj2)
      );
    }
    
    // Disable bottom world bounds for balls
    this.physics.world.setBoundsCollision(true, true, true, false);
  }

  private handleBallPaddleCollision(ball: any, paddle: any): void {
    if (ball instanceof Ball && paddle instanceof Paddle) {
      if (ball.isStuckToPaddle()) {
        ball.launchFromPaddle(paddle.x, paddle.getWidth());
      } else {
        ball.handlePaddleCollision(paddle);
      }
      this.audioSystem.playSoundEffect('paddle', this.scoreSystem.getCombo());
    }
  }

  private handleBrickCollision(ball: any, brick: any): void {
    if (!(ball instanceof Ball) || !(brick instanceof Brick)) return;

    const isMega = ball.getMega();
    
    // Get brick data BEFORE potentially destroying it
    const brickType = brick.getType();
    const brickX = brick.x;
    const brickY = brick.y;
    
    // Hit the brick and check if it's destroyed
    const isDestroyed = !brick.hit();
    
    if (isDestroyed) {
      const points = brick.getPoints();
      
      // Destroy brick
      brick.destroy();
      
      // Add score
      this.scoreSystem.addScore(
        points,
        this.levelSystem.getSpeedMultiplier()
      );
      
      // Spawn power-up if not indestructible
      if (brickType !== 'indestructible') {
        const powerUp = PowerUp.createRandom(this, brickX, brickY);
        if (powerUp) {
          this.powerUps?.add(powerUp);
        }
        
        // Particle effect
        this.createExplosionParticles(brickX, brickY, brickType);
      }
      
      // Check if all bricks are destroyed
      if (this.bricks && (this.bricks.children.entries.length === 0)) {
        this.nextLevel();
      }
    }
    
    // Play sound
    this.audioSystem.playSoundEffect(
      brickType === 'armored' ? 'armor' : 'brick',
      this.scoreSystem.getCombo()
    );
    
    // Accelerate ball
    ball.accelerate(GameConfig.INTRA_LEVEL_ACCELERATION);
  }

  private handlePowerUpCollision(paddle: any, powerUp: any): void {
    if (!(powerUp instanceof PowerUp)) return;

    const type = powerUp.getType();
    this.audioSystem.playSoundEffect('powerup');

    switch (type) {
      case 'multiball':
        this.activateBallMultiplier();
        break;
      case 'laser':
        this.activateLaser();
        break;
      case 'sticky':
        this.activateSticky();
        break;
      case 'mega':
        this.activateMega();
        break;
    }

    powerUp.destroy();
  }

  private activateBallMultiplier(): void {
    const newBalls = this.balls.flatMap((ball) => {
      const pos = ball.getPosition();
      const b1 = new Ball(this, pos.x - 20, pos.y);
      const b2 = new Ball(this, pos.x + 20, pos.y);
      b1.launch();
      b2.launch();
      return [b1, b2];
    });

    this.balls.push(...newBalls);
    this.setupCollisions();
  }

  private activateLaser(): void {
    this.activePowerUps.set('laser', 10000); // 10 seconds
  }

  private activateSticky(): void {
    if (this.balls.length > 0) {
      const ball = this.balls[0];
      ball.stick(this.paddle.x);
      (this.input.keyboard as any)?.once('keydown-SPACE', () => {
        ball.unstick();
      });
    }
  }

  private activateMega(): void {
    this.balls.forEach((ball) => {
      ball.setMega();
    });
  }

  private handleLaserBrickCollision(laser: any, brick: any): void {
    if (!(brick instanceof Brick)) return;

    if (!brick.hit()) {
      brick.destroy();
    }

    this.audioSystem.playSoundEffect('brick');
    this.scoreSystem.addScore(brick.getPoints(), this.levelSystem.getSpeedMultiplier());
    this.createExplosionParticles(brick.x, brick.y, brick.getType());

    laser.destroy();

    if (this.bricks && this.bricks.children.entries.length === 0) {
      this.nextLevel();
    }
  }

  private createExplosionParticles(x: number, y: number, brickType: BrickType): void {
    const color = this.getColorForBrickType(brickType);
    const particle = this.add.particles(color);
    (particle as any).createEmitter({
      x,
      y,
      speed: { min: -200, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      gravityY: 300,
    } as any);

    (this.time as any).delayedCall(600, () => particle.destroy());
  }

  private getColorForBrickType(type: BrickType): number {
    switch (type) {
      case 'normal':
        return GameConfig.COLORS.NORMAL;
      case 'armored':
        return GameConfig.COLORS.ARMORED;
      case 'mobile':
        return GameConfig.COLORS.MOBILE;
      default:
        return GameConfig.COLORS.NORMAL;
    }
  }

  private fireLaser(): void {
    if (!this.laserProjectiles) return;

    const laser = this.add.rectangle(
      this.paddle.x,
      this.paddle.y - 20,
      4,
      20,
      0xff0000
    );
    this.physics.add.existing(laser);
    const laserPhysics = laser.body as Phaser.Physics.Arcade.Body;
    laserPhysics.setVelocityY(-400);
    this.laserProjectiles.add(laser);

    this.time.delayedCall(2000, () => laser.destroy());
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.scene.pause('MainScene');
      this.scene.launch('PauseScene');
    } else {
      this.scene.resume('MainScene');
      this.scene.stop('PauseScene');
    }
  }

  private nextLevel(): void {
    if (this.levelSystem.isLastLevel()) {
      this.scene.start('VictoryScene', {
        score: this.scoreSystem.getScore(),
        highScore: this.scoreSystem.getHighScore(),
        scoreSystem: this.scoreSystem,
      });
    } else {
      this.levelSystem.nextLevel();
      const speedMultiplier = this.levelSystem.getSpeedMultiplier();

      this.balls.forEach((ball) => {
        ball.setBaseSpeed(GameConfig.BALL_SPEED_BASE * speedMultiplier);
      });

      this.createBricks();
      this.levelText.setText(`Level: ${this.levelSystem.getCurrentLevel()}`);
    }
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    this.paddle.update();

    // Update balls
    this.balls = this.balls.filter((ball) => {
      ball.updateMega(delta);

      // Check if ball fell off screen
      if (ball.y > GameConfig.HEIGHT) {
        ball.destroy();
        return false;
      }

      return true;
    });

    // Check game over
    if (this.balls.length === 0) {
      this.scoreSystem.saveHighScore();
      this.scene.start('GameOverScene', {
        score: this.scoreSystem.getScore(),
        highScore: this.scoreSystem.getHighScore(),
      });
      return;
    }

    // Update bricks
    this.bricks?.children.entries.forEach((child) => {
      const brick = child as Brick;
      brick.update();
    });

    // Update laser power-up
    const laserDuration = this.activePowerUps.get('laser');
    if (laserDuration && laserDuration > 0) {
      // Laser fires automatically every 500ms
      if (!this.data.get('lastLaserTime') || time - this.data.get('lastLaserTime') > 500) {
        this.fireLaser();
        this.data.set('lastLaserTime', time);
      }
      this.activePowerUps.set('laser', laserDuration - delta);
    } else if (laserDuration && laserDuration <= 0) {
      this.activePowerUps.delete('laser');
    }

    // Update UI
    this.scoreText.setText(`Score: ${this.scoreSystem.getScore()}`);
    this.comboText.setText(`Combo: ${this.scoreSystem.getCombo()}`);
  }
}
