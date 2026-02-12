import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private moveLeftActive: boolean = false;
  private moveRightActive: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;
  private shirtFix: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    // Move up by 30px to show feet and have a margin
    const startY = GameConfig.PADDLE_Y - 30;

    // Use the character sprite
    super(scene, startX, startY, 'paddle-character');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(10); // Paddle on top
    
    // Scale calculation:
    // Original width after clean: ~317px
    // Target width: ~110px
    // Scale: 110 / 317 = ~0.35
    // REDUCED by 15% as per client request (0.35 * 0.85 = ~0.2975)
    this.setScale(0.2975);

    this.clearTint();
    this.setInteractive(); // For input handling if needed
    
    // Use LINEAR filter for better quality
    this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    
    this.updatePhysicsBody();

    // VISUAL FIX: White background behind the shirt
    // The shirt was transparent/noisy. We draw a solid white shape behind the sprite.
    this.shirtFix = scene.add.graphics();
    this.shirtFix.setDepth(9); // Behind the paddle
    this.drawShirtFix();

    // Keyboard setup
    if (scene.input.keyboard) {
      this.setupKeyboardInput(scene);
    }

    // Mouse/Touch
    this.setupPointerInput(scene);
  }

  private drawShirtFix(): void {
    this.shirtFix.clear();
    this.shirtFix.fillStyle(0xFFFFFF, 1);
    
    // Cover the entire upper body (torso + arms/sleeves)
    // Main torso ellipse (centered)
    const torsoW = 60;
    const torsoH = 90;
    this.shirtFix.fillEllipse(0, 20, torsoW, torsoH);
    
    // Left arm/sleeve (extend from torso)
    this.shirtFix.fillEllipse(-35, 25, 40, 70);
    
    // Right arm/sleeve (extend from torso)
    this.shirtFix.fillEllipse(35, 25, 40, 70);
  }

  private setupKeyboardInput(scene: Phaser.Scene): void {
      scene.input.keyboard!.on('keydown-LEFT', () => (this.moveLeftActive = true));
      scene.input.keyboard!.on('keyup-LEFT', () => (this.moveLeftActive = false));
      scene.input.keyboard!.on('keydown-RIGHT', () => (this.moveRightActive = true));
      scene.input.keyboard!.on('keyup-RIGHT', () => (this.moveRightActive = false));

      scene.input.keyboard!.on('keydown-Q', () => (this.moveLeftActive = true));
      scene.input.keyboard!.on('keyup-Q', () => (this.moveLeftActive = false));
      scene.input.keyboard!.on('keydown-A', () => (this.moveLeftActive = true));
      scene.input.keyboard!.on('keyup-A', () => (this.moveLeftActive = false));
      scene.input.keyboard!.on('keydown-D', () => (this.moveRightActive = true));
      scene.input.keyboard!.on('keyup-D', () => (this.moveRightActive = false));
  }

  private setupPointerInput(scene: Phaser.Scene): void {
    const onPointerMove = (pointer: Phaser.Input.Pointer) => {
      // Allow moving all the way to the edge (remove the +10 buffer)
      this.x = Phaser.Math.Clamp(
        pointer.x,
        this.baseWidth / 2, 
        GameConfig.WIDTH - this.baseWidth / 2
      );
    };

    scene.input.on('pointermove', onPointerMove);
    scene.input.on('pointerdown', onPointerMove);
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

    // Remove the +10 buffer to allow touching the walls
    if (this.moveLeftActive) {
      this.x = Math.max(this.baseWidth / 2, this.x - speed);
    }
    if (this.moveRightActive) {
      this.x = Math.min(GameConfig.WIDTH - this.baseWidth / 2, this.x + speed);
    }

    // Sync the shirt fix position and visibility
    this.shirtFix.setPosition(this.x, this.y);
    this.shirtFix.setVisible(this.visible);
  }

  public getWidth(): number {
    return this.baseWidth;
  }

  public reset(): void {
    this.x = GameConfig.WIDTH / 2;
    this.updatePhysicsBody();
    this.shirtFix.setPosition(this.x, this.y);
  }

  public cleanUp(): void {
    if (this.shirtFix) {
      this.shirtFix.destroy();
    }
  }
}
