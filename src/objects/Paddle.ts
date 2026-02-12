import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private moveLeftActive: boolean = false;
  private moveRightActive: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    const startY = GameConfig.PADDLE_Y;

    // Use the character sprite
    // Image is 1080x1220 (but we resized it to ~500px high and cleaned noise).
    // We want a visible character ~100px wide.
    super(scene, startX, startY, 'paddle-character');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);
    
    // Scale calculation:
    // Original width after clean: ~317px
    // Target width: ~110px
    // Scale: 110 / 317 = ~0.35
    this.setScale(0.35);

    this.clearTint();
    this.setInteractive();
    
    // Use LINEAR filter for better quality
    this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    
    this.updatePhysicsBody();

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
    // We want the hit zone to match the character's visual width
    // Visual width = ~92px (1080 * 0.085)
    
    // Use 85% of visual width for the hitbox to be forgiving
    const hitWidth = (this.width * this.scaleX) * 0.85; 
    
    // Height of the rebound zone (top of the head)
    // We want a flat surface for the ball to bounce off
    const hitHeight = 25; // pixels (scaled)
    
    // setSize takes UN-SCALED dimensions
    this.body!.setSize(hitWidth / this.scaleX, hitHeight / this.scaleY);
    
    // Center the hitbox horizontally and place it at the top
    const offsetX = (this.width - (hitWidth / this.scaleX)) / 2;
    // We want the ball to bounce off the head/shoulders area
    // The top of the sprite is at local Y=0
    // Let's set the body offset to be near the top
    const offsetY = 15; 

    this.body!.setOffset(offsetX, offsetY);

    // Update baseWidth for movement clamping based on current scale
    this.baseWidth = this.width * this.scaleX;
  }

  public updatePaddle(delta: number): void {
    const speed = GameConfig.PADDLE_SPEED * (delta / 1000);

    if (this.moveLeftActive) {
      this.x = Math.max(this.baseWidth / 2 + 10, this.x - speed);
    }
    if (this.moveRightActive) {
      this.x = Math.min(GameConfig.WIDTH - this.baseWidth / 2 - 10, this.x + speed);
    }
  }

  public getWidth(): number {
    return this.baseWidth;
  }

  public reset(): void {
    this.x = GameConfig.WIDTH / 2;
    this.updatePhysicsBody();
  }

  public cleanUp(): void {
    // No glow to destroy anymore
  }
}
