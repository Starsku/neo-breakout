import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private moveLeftActive: boolean = false;
  private moveRightActive: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;
  private glow: Phaser.GameObjects.Graphics;
  private static textureCreated = false;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    const startY = GameConfig.PADDLE_Y;

    // Create texture once
    if (!Paddle.textureCreated) {
      const g = scene.make.graphics({ add: false } as any);
      const w = GameConfig.PADDLE_WIDTH;
      const h = GameConfig.PADDLE_HEIGHT;
      // Glow
      g.fillStyle(GameConfig.COLORS.NEON_BLUE, 0.15);
      g.fillRoundedRect(-4, -4, w + 8, h + 8, 6);
      g.fillStyle(GameConfig.COLORS.NEON_BLUE, 0.3);
      g.fillRoundedRect(-2, -2, w + 4, h + 4, 5);
      // Main body
      g.fillStyle(0x1a2a4a, 1);
      g.fillRoundedRect(0, 0, w, h, 4);
      // Top highlight
      g.fillStyle(GameConfig.COLORS.NEON_BLUE, 0.8);
      g.fillRoundedRect(2, 1, w - 4, 3, 2);
      // Edge accents
      g.fillStyle(GameConfig.COLORS.NEON_PINK, 0.6);
      g.fillRoundedRect(0, 0, 6, h, 3);
      g.fillRoundedRect(w - 6, 0, 6, h, 3);
      g.generateTexture('paddle-tex', w + 8, h + 8);
      g.destroy();
      Paddle.textureCreated = true;
    }

    super(scene, startX, startY, 'paddle-tex');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);
    this.body!.setSize(this.baseWidth, GameConfig.PADDLE_HEIGHT);

    // Glow effect
    this.glow = scene.add.graphics();
    this.glow.setDepth(4);

    // Keyboard setup
    if (scene.input.keyboard) {
      scene.input.keyboard.on('keydown-LEFT', () => (this.moveLeftActive = true));
      scene.input.keyboard.on('keyup-LEFT', () => (this.moveLeftActive = false));
      scene.input.keyboard.on('keydown-RIGHT', () => (this.moveRightActive = true));
      scene.input.keyboard.on('keyup-RIGHT', () => (this.moveRightActive = false));

      scene.input.keyboard.on('keydown-Q', () => (this.moveLeftActive = true));
      scene.input.keyboard.on('keyup-Q', () => (this.moveLeftActive = false));
      scene.input.keyboard.on('keydown-A', () => (this.moveLeftActive = true));
      scene.input.keyboard.on('keyup-A', () => (this.moveLeftActive = false));
      scene.input.keyboard.on('keydown-D', () => (this.moveRightActive = true));
      scene.input.keyboard.on('keyup-D', () => (this.moveRightActive = false));
    }

    // Mouse/Touch
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.x = Phaser.Math.Clamp(
        pointer.x,
        this.baseWidth / 2 + 10,
        GameConfig.WIDTH - this.baseWidth / 2 - 10
      );
    });

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.x = Phaser.Math.Clamp(
        pointer.x,
        this.baseWidth / 2 + 10,
        GameConfig.WIDTH - this.baseWidth / 2 - 10
      );
    });
  }

  public updatePaddle(delta: number): void {
    const speed = GameConfig.PADDLE_SPEED * (delta / 1000);

    if (this.moveLeftActive) {
      this.x = Math.max(this.baseWidth / 2 + 10, this.x - speed);
    }
    if (this.moveRightActive) {
      this.x = Math.min(GameConfig.WIDTH - this.baseWidth / 2 - 10, this.x + speed);
    }

    // Update glow
    this.glow.clear();
    this.glow.fillStyle(GameConfig.COLORS.NEON_BLUE, 0.08);
    this.glow.fillRoundedRect(
      this.x - this.baseWidth / 2 - 8,
      this.y - GameConfig.PADDLE_HEIGHT / 2 - 8,
      this.baseWidth + 16,
      GameConfig.PADDLE_HEIGHT + 16,
      8
    );
  }

  public getWidth(): number {
    return this.baseWidth;
  }

  public reset(): void {
    this.x = GameConfig.WIDTH / 2;
    this.baseWidth = GameConfig.PADDLE_WIDTH;
    this.displayWidth = this.baseWidth + 8;
  }

  public cleanUp(): void {
    this.glow.destroy();
  }

  public static resetTexture(): void {
    Paddle.textureCreated = false;
  }
}
