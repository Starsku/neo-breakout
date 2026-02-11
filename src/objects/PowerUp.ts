import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export type PowerUpType = 'multiball' | 'laser' | 'sticky' | 'mega';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private colors: Record<PowerUpType, number> = {
    multiball: 0x00ff00,
    laser: 0xff0000,
    sticky: 0x0099ff,
    mega: 0xffff00,
  };

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpType = type;

    this.setCollideWorldBounds(true);
    this.setBounce(0.5, 0);
    this.setVelocityY(GameConfig.POWERUP_SPEED);

    this.drawPowerUp();
  }

  private drawPowerUp(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false } as any);
    const color = this.colors[this.powerUpType];

    // Background circle
    graphics.fillStyle(color, 1);
    graphics.fillCircle(GameConfig.POWERUP_SIZE / 2, GameConfig.POWERUP_SIZE / 2, GameConfig.POWERUP_SIZE / 2);

    // Icon or letter
    graphics.fillStyle(0x000000, 1);
    const label = this.getLabel();
    graphics.generateTexture(`powerup-${this.powerUpType}`, GameConfig.POWERUP_SIZE, GameConfig.POWERUP_SIZE);
    graphics.destroy();

    this.setTexture(`powerup-${this.powerUpType}`);
  }

  private getLabel(): string {
    switch (this.powerUpType) {
      case 'multiball':
        return 'M';
      case 'laser':
        return 'L';
      case 'sticky':
        return 'S';
      case 'mega':
        return 'E';
    }
  }

  public getType(): PowerUpType {
    return this.powerUpType;
  }

  public static createRandom(scene: Phaser.Scene, x: number, y: number): PowerUp | null {
    if (Math.random() > GameConfig.POWERUP_SPAWN_CHANCE) {
      return null;
    }

    const types: PowerUpType[] = ['multiball', 'laser', 'sticky', 'mega'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new PowerUp(scene, x, y, randomType);
  }
}
