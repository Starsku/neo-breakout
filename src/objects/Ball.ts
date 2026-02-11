import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number = GameConfig.BALL_SPEED_BASE;
  private isStickyMode: boolean = false;
  private isMegaMode: boolean = false;
  private megaTimer: number = 0;
  private bounceCount: number = 0;
  private trail: Phaser.GameObjects.Graphics;
  private trailPositions: { x: number; y: number }[] = [];
  private static textureCreated = false;

  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    const px = x ?? GameConfig.WIDTH / 2;
    const py = y ?? GameConfig.PADDLE_Y - 20;

    // Create texture once
    if (!Ball.textureCreated) {
      const g = scene.make.graphics({ add: false } as any);
      // Glow effect
      g.fillStyle(GameConfig.COLORS.BALL, 0.15);
      g.fillCircle(16, 16, 14);
      g.fillStyle(GameConfig.COLORS.BALL, 0.3);
      g.fillCircle(16, 16, 10);
      g.fillStyle(GameConfig.COLORS.BALL, 0.7);
      g.fillCircle(16, 16, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(16, 16, 4);
      g.generateTexture('ball-tex', 32, 32);
      g.destroy();
      Ball.textureCreated = true;
    }

    super(scene, px, py, 'ball-tex');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(GameConfig.BALL_RADIUS * 2.5, GameConfig.BALL_RADIUS * 2.5);
    this.setCircle(4, 12, 12);
    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.setDrag(0);
    this.setFriction(0, 0);
    this.setMaxVelocity(800, 800);

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    }

    // Trail graphics
    this.trail = scene.add.graphics();
    this.trail.setDepth(0);
    this.setDepth(5);
  }

  public launch(angle?: number): void {
    if (this.isStickyMode) return;
    const a = angle ?? Phaser.Math.FloatBetween(220, 320) * Phaser.Math.DEG_TO_RAD;
    this.setVelocity(Math.cos(a) * this.baseSpeed, Math.sin(a) * this.baseSpeed);
  }

  public launchFromPaddle(paddleX: number, paddleWidth: number): void {
    const relX = (this.x - (paddleX - paddleWidth / 2)) / paddleWidth;
    const hitFactor = Phaser.Math.Clamp(relX, 0, 1);
    // Angle: left side = 220°, center = 270° (straight up), right = 320°
    const angleDeg = 220 + hitFactor * 100;
    const a = angleDeg * Phaser.Math.DEG_TO_RAD;
    this.setVelocity(Math.cos(a) * this.baseSpeed, Math.sin(a) * this.baseSpeed);
    this.bounceCount = 0;
  }

  public handlePaddleCollision(paddle: Phaser.Physics.Arcade.Sprite): void {
    const relX = (this.x - (paddle.x - paddle.displayWidth / 2)) / paddle.displayWidth;
    const hitFactor = Phaser.Math.Clamp(relX, 0, 1);
    const angleDeg = 220 + hitFactor * 100;
    const a = angleDeg * Phaser.Math.DEG_TO_RAD;

    const speed = Math.max(
      this.baseSpeed,
      Math.hypot(this.body!.velocity.x, this.body!.velocity.y)
    );
    this.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
    this.bounceCount = 0;
  }

  public stick(paddleX: number): void {
    this.isStickyMode = true;
    this.setVelocity(0, 0);
    this.x = paddleX;
    this.y = GameConfig.PADDLE_Y - 20;
  }

  public unstick(paddleX: number, paddleWidth: number): void {
    this.isStickyMode = false;
    this.launchFromPaddle(paddleX, paddleWidth);
  }

  public setMega(duration: number = 5000): void {
    this.isMegaMode = true;
    this.megaTimer = duration;
    this.setTint(0xff2244);
    this.setDisplaySize(GameConfig.BALL_RADIUS * 4, GameConfig.BALL_RADIUS * 4);
  }

  public getMega(): boolean {
    return this.isMegaMode;
  }

  public updateBall(dt: number): void {
    // Mega timer
    if (this.isMegaMode) {
      this.megaTimer -= dt * 1000;
      if (this.megaTimer <= 0) {
        this.isMegaMode = false;
        this.clearTint();
        this.setDisplaySize(GameConfig.BALL_RADIUS * 2.5, GameConfig.BALL_RADIUS * 2.5);
      }
    }

    // Ensure minimum vertical speed to prevent horizontal-only movement
    if (this.body && !this.isStickyMode) {
      const vx = this.body.velocity.x;
      const vy = this.body.velocity.y;
      const speed = Math.hypot(vx, vy);
      if (speed > 0 && Math.abs(vy) < speed * 0.15) {
        const sign = vy >= 0 ? 1 : -1;
        const newVy = sign * speed * 0.3;
        const newVx = Math.sign(vx) * Math.sqrt(speed * speed - newVy * newVy);
        this.setVelocity(newVx, newVy);
      }
      // Ensure speed stays consistent
      if (speed > 0 && Math.abs(speed - this.baseSpeed) > this.baseSpeed * 0.5) {
        const factor = this.baseSpeed / speed;
        this.setVelocity(vx * factor, vy * factor);
      }
    }

    // Trail
    if (!this.isStickyMode && this.body) {
      this.trailPositions.unshift({ x: this.x, y: this.y });
      if (this.trailPositions.length > 8) this.trailPositions.pop();
    }

    this.trail.clear();
    const color = this.isMegaMode ? 0xff2244 : GameConfig.COLORS.BALL;
    for (let i = 1; i < this.trailPositions.length; i++) {
      const alpha = (1 - i / this.trailPositions.length) * 0.3;
      const r = Math.max(1, GameConfig.BALL_RADIUS * (1 - i / this.trailPositions.length));
      this.trail.fillStyle(color, alpha);
      this.trail.fillCircle(this.trailPositions[i].x, this.trailPositions[i].y, r);
    }
  }

  public followPaddle(paddleX: number): void {
    if (this.isStickyMode) {
      this.x = paddleX;
      this.y = GameConfig.PADDLE_Y - 20;
    }
  }

  public setBaseSpeed(speed: number): void {
    this.baseSpeed = speed;
  }

  public getBaseSpeed(): number {
    return this.baseSpeed;
  }

  public accelerate(factor: number): void {
    this.bounceCount += 1;
    if (this.bounceCount >= GameConfig.ACCELERATION_THRESHOLD) {
      const vx = this.body!.velocity.x;
      const vy = this.body!.velocity.y;
      const currentSpeed = Math.hypot(vx, vy);
      const angle = Math.atan2(vy, vx);
      const newSpeed = Math.min(currentSpeed * factor, this.baseSpeed * 1.6);
      this.setVelocity(Math.cos(angle) * newSpeed, Math.sin(angle) * newSpeed);
      this.bounceCount = 0;
    }
  }

  public isStuckToPaddle(): boolean {
    return this.isStickyMode;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public resetBounce(): void {
    this.bounceCount = 0;
  }

  public cleanUp(): void {
    this.trail.destroy();
  }

  public static resetTexture(): void {
    Ball.textureCreated = false;
  }
}
