import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type PowerUpType = 'multiball' | 'mega';

const POWERUP_INFO: Record<PowerUpType, { color: number; label: string }> = {
  multiball: { color: 0x44ff88, label: '×3' },
  mega: { color: 0xffaa22, label: '★' },
};

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private static textureCache: Set<string> = new Set();

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    const info = POWERUP_INFO[type];
    const texKey = `pu-${type}`;

    if (!PowerUp.textureCache.has(texKey)) {
      const s = GameConfig.POWERUP_SIZE;
      const g = scene.make.graphics({ add: false } as any);
      // Glow
      g.fillStyle(info.color, 0.2);
      g.fillCircle(s / 2 + 2, s / 2 + 2, s / 2 + 4);
      // Background
      g.fillStyle(info.color, 0.9);
      g.fillCircle(s / 2 + 2, s / 2 + 2, s / 2);
      // Inner highlight
      g.fillStyle(0xffffff, 0.4);
      g.fillCircle(s / 2, s / 2 - 1, s / 2 - 4);
      g.generateTexture(texKey, s + 8, s + 8);
      g.destroy();
      PowerUp.textureCache.add(texKey);
    }

    super(scene, x, y, texKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpType = type;
    this.setDepth(4);
    this.setVelocityY(GameConfig.POWERUP_SPEED);

    // Add floating label
    const label = scene.add.text(x, y, info.label, {
      font: 'bold 11px Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5).setDepth(5);

    // Make label follow the powerup
    const updateEvent = scene.events.on('update', () => {
      if (this.active) {
        label.setPosition(this.x, this.y);
      } else {
        label.destroy();
        scene.events.off('update', updateEvent as any);
      }
    });

    this.on('destroy', () => {
      label.destroy();
    });
  }

  public getType(): PowerUpType {
    return this.powerUpType;
  }

  public static createRandom(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PowerUp | null {
    if (Math.random() > GameConfig.POWERUP_SPAWN_CHANCE) {
      return null;
    }

    const types: PowerUpType[] = ['multiball', 'mega'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new PowerUp(scene, x, y, randomType);
  }

  public static resetTextureCache(): void {
    PowerUp.textureCache.clear();
  }
}
