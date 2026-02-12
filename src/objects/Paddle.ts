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
    this.setScale(1.8);
    this.clearTint();
    this.setInteractive();
    // Ensure pixel art stays sharp
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    
    // Adjust physics body to the head area (the "paddle" part)
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
    // The visual width is this.width * this.scaleX.
    // The requested contact width should match the visual size of the paddle being carried.
    // If the sprite width is 64 and scale is 1.8, visual width is 115.2.
    // Let's use the full sprite width as the hitzone since it's a character.
    
    const visualWidth = this.width * this.scaleX;
    const visualHeight = this.height * this.scaleY;
    
    // We want the body to match the scaled visual size
    // setSize takes values in the original sprite's coordinate system (before scale)
    // so we set it to this.width and a portion of this.height for the top hitzone.
    const bodyHeightInPixels = 8; // Zone de contact sur la barre
    this.body!.setSize(this.width, bodyHeightInPixels);
    
    // Offset pour que la zone de contact soit sur la barre (en haut du sprite)
    this.body!.setOffset(0, 4);

    // Update baseWidth for movement clamping based on current scale
    this.baseWidth = visualWidth;
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
