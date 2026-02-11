import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private moveLeftActive: boolean = false;
  private moveRightActive: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;
  private glow: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    const startY = GameConfig.PADDLE_Y;

    // Use the character sprite
    super(scene, startX, startY, 'paddle-character');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);
    
    // Adjust physics body to the head area (the "paddle" part)
    // The sprite seems to be a character carrying something or just the character itself.
    // Usually, we want the collision to happen at the top of the sprite.
    // Assuming the sprite is ~64x64 or similar.
    // We'll set the body to be GameConfig.PADDLE_WIDTH wide and a small height at the top.
    this.updatePhysicsBody();

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

  private updatePhysicsBody(): void {
    // We want the hit zone to be at the top of the character.
    // Assuming the sprite's height is around this.height.
    // We set the body height to PADDLE_HEIGHT and offset it to be at the top.
    const bodyHeight = GameConfig.PADDLE_HEIGHT;
    this.body!.setSize(this.baseWidth, bodyHeight);
    
    // Offset the body to the top of the sprite. 
    // Sprite origin is usually 0.5, 0.5.
    // If the sprite is 64px high, and we want the body (12px high) at the top:
    // Offset Y would be 0.
    this.body!.setOffset((this.width - this.baseWidth) / 2, 0);
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
    // Glow around the head area
    this.glow.fillRoundedRect(
      this.x - this.baseWidth / 2 - 8,
      this.y - this.displayHeight / 2 - 8,
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
    this.updatePhysicsBody();
  }

  public cleanUp(): void {
    this.glow.destroy();
  }
}
