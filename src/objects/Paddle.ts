import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private moveLeftActive: boolean = false;
  private moveRightActive: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    // Position du personnage un peu plus bas pour qu'il soit bien visible
    const startY = GameConfig.PADDLE_Y - 20;

    // Use the character sprite
    super(scene, startX, startY, 'paddle-character');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setDepth(5);
    // Augmenter la taille pour bien voir le personnage (environ 100px de haut)
    this.setScale(0.4); 
    this.clearTint();
    this.setInteractive();
    
    // Ensure pixel art stays sharp if low-res, or smooth if hi-res
    // Given the 300kb file size, it might be high-res, so LINEAR might be better or keep NEAREST
    // Let's assume it's a generated image that looks like pixel art.
    this.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    
    // Adjust physics body to the head/shoulder area (the "paddle" part)
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
    // La hitbox doit correspondre à la largeur visuelle du personnage
    // et être située vers le haut pour le rebond de la balle
    
    const visualWidth = this.width * this.scaleX;
    
    // On garde une hitbox assez large pour le gameplay
    // On utilise 80% de la largeur visuelle pour éviter les bords vides
    const hitWidth = visualWidth * 0.8; 
    const hitHeight = 20; // Épaisseur de la zone de rebond

    this.body!.setSize(hitWidth / this.scaleX, hitHeight / this.scaleY);
    
    // Centrer la hitbox en haut du sprite (offset relatif à la texture non scalée)
    // this.width est la largeur texture, this.body.width est la largeur physique scalée
    // Offset X : (Largeur texture - Largeur physique non scalée) / 2
    const offsetX = (this.width - (hitWidth / this.scaleX)) / 2;
    const offsetY = 10; // Un peu en dessous du haut pour l'effet visuel

    this.body!.setOffset(offsetX, offsetY);

    // Update baseWidth for movement clamping based on current scale
    this.baseWidth = hitWidth;
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
    // No glow to destroy
  }
}
