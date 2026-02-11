import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type BrickType = 'normal' | 'armored' | 'indestructible' | 'mobile';

const BRICK_COLORS: Record<string, number[]> = {
  normal: [0x00ff88, 0x22cc66, 0x44ff99, 0x00dd77, 0x33ffaa],
  armored: [0xff6622, 0xff8844, 0xee5511, 0xffaa33, 0xff7733],
  indestructible: [0x556688, 0x445577, 0x667799],
  mobile: [0x00ccff, 0x44ddff, 0x0099dd, 0x22bbee],
};

export class Brick extends Phaser.Physics.Arcade.Sprite {
  private brickType: BrickType;
  private health: number;
  private maxHealth: number;
  private moveDirection: number = 1;
  private moveSpeed: number = 80;
  private brickColor: number;
  private static textureCache: Set<string> = new Set();

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    brickType: BrickType,
    health: number = 1,
    colorIndex: number = 0
  ) {
    const colors = BRICK_COLORS[brickType];
    const color = colors[colorIndex % colors.length];
    const texKey = `brick-${brickType}-${health}-${color.toString(16)}`;

    if (!Brick.textureCache.has(texKey)) {
      const g = scene.make.graphics({ add: false } as any);
      const w = GameConfig.BRICK_WIDTH;
      const h = GameConfig.BRICK_HEIGHT;

      // Shadow
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(2, 2, w, h, 3);

      // Main body
      g.fillStyle(color, 1);
      g.fillRoundedRect(0, 0, w, h, 3);

      // Top highlight
      g.fillStyle(0xffffff, 0.25);
      g.fillRoundedRect(2, 1, w - 4, h * 0.35, 2);

      // Armored indicators
      if (brickType === 'armored') {
        g.lineStyle(2, 0xffffff, 0.5);
        for (let i = 0; i < health; i++) {
          g.strokeCircle(10 + i * 8, h - 5, 2);
        }
      }

      // Indestructible pattern
      if (brickType === 'indestructible') {
        g.lineStyle(1, 0x888899, 0.4);
        for (let i = 0; i < w; i += 8) {
          g.lineBetween(i, 0, i + 4, h);
        }
      }

      // Mobile indicator - arrows
      if (brickType === 'mobile') {
        g.fillStyle(0xffffff, 0.4);
        // Left arrow
        g.fillTriangle(4, h / 2, 10, h / 2 - 4, 10, h / 2 + 4);
        // Right arrow
        g.fillTriangle(w - 4, h / 2, w - 10, h / 2 - 4, w - 10, h / 2 + 4);
      }

      g.generateTexture(texKey, w + 2, h + 2);
      g.destroy();
      Brick.textureCache.add(texKey);
    }

    super(scene, x, y, texKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.brickType = brickType;
    this.health = health;
    this.maxHealth = health;
    this.brickColor = color;

    this.setImmovable(true);
    this.setDepth(3);
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      (this.body as Phaser.Physics.Arcade.Body).setSize(
        GameConfig.BRICK_WIDTH,
        GameConfig.BRICK_HEIGHT
      );
    }
  }

  public getType(): BrickType {
    return this.brickType;
  }

  public hit(): boolean {
    if (this.brickType === 'indestructible') {
      // Flash effect
      this.setTint(0xffffff);
      this.scene.time.delayedCall(80, () => {
        if (this.active) this.clearTint();
      });
      return false;
    }

    this.health -= 1;

    if (this.health > 0) {
      // Damage flash
      this.setTint(0xffffff);
      this.scene.time.delayedCall(60, () => {
        if (this.active) {
          this.clearTint();
          this.setAlpha(0.6 + 0.4 * (this.health / this.maxHealth));
        }
      });
      return false;
    }

    return true;
  }

  public getHealth(): number {
    return this.health;
  }

  public getMaxHealth(): number {
    return this.maxHealth;
  }

  public updateBrick(delta: number): void {
    if (this.brickType === 'mobile' && this.active) {
      const dx = this.moveSpeed * this.moveDirection * (delta / 1000);
      this.x += dx;

      if (this.x <= GameConfig.BRICK_OFFSET_LEFT) {
        this.x = GameConfig.BRICK_OFFSET_LEFT;
        this.moveDirection = 1;
      } else if (this.x >= GameConfig.WIDTH - GameConfig.BRICK_OFFSET_LEFT) {
        this.x = GameConfig.WIDTH - GameConfig.BRICK_OFFSET_LEFT;
        this.moveDirection = -1;
      }

      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).updateFromGameObject();
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

  public getColor(): number {
    return this.brickColor;
  }

  public static resetTextureCache(): void {
    Brick.textureCache.clear();
  }
}
