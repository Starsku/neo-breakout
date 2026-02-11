import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type BrickType = 'normal' | 'armored' | 'indestructible' | 'mobile';

export class Brick extends Phaser.Physics.Arcade.Sprite {
  private brickType: BrickType;
  private health: number;
  private maxHealth: number;
  private moveDirection: number = 1;
  private moveSpeed: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, brickType: BrickType, health: number = 1) {
    super(scene, x, y, '');
    scene.add.existing(this as any);
    scene.physics.add.existing(this as any);

    this.brickType = brickType;
    this.health = health;
    this.maxHealth = health;

    this.setCollideWorldBounds(true);
    this.setBounce(1, 1);
    this.setImmovable(true);

    this.drawBrick();
  }

  private drawBrick(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false } as any);
    const color = this.getColor();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, GameConfig.BRICK_WIDTH, GameConfig.BRICK_HEIGHT);

    // Add health indicators for armored bricks
    if (this.brickType === 'armored' && this.health > 1) {
      graphics.fillStyle(0xffffff, 0.3);
      for (let i = 0; i < this.health - 1; i++) {
        graphics.fillRect(5 + i * 5, GameConfig.BRICK_HEIGHT - 3, 3, 2);
      }
    }

    graphics.generateTexture(`brick-${this.brickType}`, GameConfig.BRICK_WIDTH, GameConfig.BRICK_HEIGHT);
    graphics.destroy();

    this.setTexture(`brick-${this.brickType}`);
  }

  private getColor(): number {
    switch (this.brickType) {
      case 'normal':
        return GameConfig.COLORS.NORMAL;
      case 'armored':
        return GameConfig.COLORS.ARMORED;
      case 'indestructible':
        return GameConfig.COLORS.INDESTRUCTIBLE;
      case 'mobile':
        return GameConfig.COLORS.MOBILE;
    }
  }

  public getType(): BrickType {
    return this.brickType;
  }

  public hit(): boolean {
    if (this.brickType === 'indestructible') {
      return false;
    }

    this.health -= 1;
    if (this.health > 0 && this.brickType === 'armored') {
      this.drawBrick();
    }

    return this.health <= 0;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public update(): void {
    if (this.brickType === 'mobile') {
      this.x += this.moveSpeed * this.moveDirection / 60;

      if (this.x <= 50 || this.x >= GameConfig.WIDTH - 50) {
        this.moveDirection *= -1;
      }
    }
  }

  public getPoints(): number {
    const scores: Record<BrickType, number> = {
      normal: GameConfig.SCORES.NORMAL,
      armored: GameConfig.SCORES.ARMORED,
      indestructible: GameConfig.SCORES.INDESTRUCTIBLE,
      mobile: GameConfig.SCORES.MOBILE,
    };
    return scores[this.brickType];
  }
}
