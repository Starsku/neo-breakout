import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Ball extends Phaser.Physics.Arcade.Sprite {
  private baseSpeed: number = GameConfig.BALL_SPEED_BASE;
  private isSticky: boolean = false;
  private isMega: boolean = false;
  private megaTimer: number = 0;
  private bounceCount: number = 0;

  constructor(scene: Phaser.Scene, x?: number, y?: number) {
    super(scene, x ?? GameConfig.WIDTH / 2, y ?? GameConfig.HEIGHT - 50, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.setDrag(0);
    this.setFriction(0);
    
    // Disable bottom world bounds - ball should fall off
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).onWorldBounds = true;
    }

    this.drawBall();
    this.launch();
  }

  private drawBall(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(GameConfig.COLORS.BALL, 1);
    graphics.fillCircle(GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS, GameConfig.BALL_RADIUS);
    graphics.generateTexture('ball', GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);
    graphics.destroy();
    this.setTexture('ball');
    this.setDisplaySize(GameConfig.BALL_RADIUS * 2, GameConfig.BALL_RADIUS * 2);
  }

  public launch(): void {
    if (!this.isSticky) {
      const angle = Phaser.Math.Between(30, 150) * Phaser.Math.DEG_TO_RAD;
      const speed = this.baseSpeed;
      this.setVelocity(Math.cos(angle) * speed, -Math.sin(angle) * speed);
    }
  }

  public launchFromPaddle(paddleX: number, paddleWidth: number): void {
    const relativeX = this.x - (paddleX - paddleWidth / 2);
    const hitFactor = relativeX / paddleWidth;
    const angle = Phaser.Math.Interpolation.Linear(
      [150, 90, 30],
      hitFactor
    ) * Phaser.Math.DEG_TO_RAD;

    const speed = this.baseSpeed;
    this.setVelocity(Math.cos(angle) * speed, -Math.sin(angle) * speed);
    this.bounceCount = 0;
  }

  public handlePaddleCollision(paddle: Phaser.Physics.Arcade.Sprite): void {
    const relativeX = this.x - (paddle.x - paddle.displayWidth / 2);
    const hitFactor = Phaser.Math.Clamp(relativeX / paddle.displayWidth, 0, 1);
    const angle = Phaser.Math.Interpolation.Linear(
      [150, 90, 30],
      hitFactor
    ) * Phaser.Math.DEG_TO_RAD;

    const speed = Math.hypot(this.body!.velocity.x, this.body!.velocity.y);
    this.setVelocity(Math.cos(angle) * speed, -Math.sin(angle) * speed);

    this.bounceCount = 0;
  }

  public stick(paddleX: number): void {
    this.isSticky = true;
    this.setVelocity(0, 0);
    this.x = paddleX;
  }

  public unstick(): void {
    this.isSticky = false;
    this.launch();
  }

  public setMega(duration: number = 5000): void {
    this.isMega = true;
    this.megaTimer = duration;
    this.setTint(0xff0000);
  }

  public getMega(): boolean {
    return this.isMega;
  }

  public updateMega(dt: number): void {
    if (this.isMega) {
      this.megaTimer -= dt * 1000;
      if (this.megaTimer <= 0) {
        this.isMega = false;
        this.clearTint();
      }
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
      const currentSpeed = Math.hypot(this.body!.velocity.x, this.body!.velocity.y);
      const angle = Math.atan2(this.body!.velocity.y, this.body!.velocity.x);
      const newSpeed = currentSpeed * factor;

      this.setVelocity(Math.cos(angle) * newSpeed, Math.sin(angle) * newSpeed);
      this.bounceCount = 0;
    }
  }

  public isStuckToPaddle(): boolean {
    return this.isSticky;
  }

  public getPosition(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  public resetBounce(): void {
    this.bounceCount = 0;
  }
}
