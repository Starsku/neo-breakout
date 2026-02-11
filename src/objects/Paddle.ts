import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class Paddle extends Phaser.Physics.Arcade.Sprite {
  private leftKey?: Phaser.Input.Keyboard.Key;
  private rightKey?: Phaser.Input.Keyboard.Key;
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private baseWidth: number = GameConfig.PADDLE_WIDTH;

  constructor(scene: Phaser.Scene) {
    const startX = GameConfig.WIDTH / 2;
    const startY = GameConfig.HEIGHT - 30;

    super(scene, startX, startY, '');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setImmovable(true);
    this.setData('width', this.baseWidth);
    this.setData('height', GameConfig.PADDLE_HEIGHT);

    // Keyboard setup
    if (scene.input.keyboard) {
      this.leftKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
      this.rightKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

      const keyA = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
      const keyQ = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
      const keyD = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

      scene.input.keyboard.on('keydown-LEFT', () => (this.moveLeft = true));
      scene.input.keyboard.on('keyup-LEFT', () => (this.moveLeft = false));
      scene.input.keyboard.on('keydown-RIGHT', () => (this.moveRight = true));
      scene.input.keyboard.on('keyup-RIGHT', () => (this.moveRight = false));

      scene.input.keyboard.on('keydown-A', () => (this.moveLeft = true));
      scene.input.keyboard.on('keyup-A', () => (this.moveLeft = false));
      scene.input.keyboard.on('keydown-Q', () => (this.moveLeft = true));
      scene.input.keyboard.on('keyup-Q', () => (this.moveLeft = false));
      scene.input.keyboard.on('keydown-D', () => (this.moveRight = true));
      scene.input.keyboard.on('keyup-D', () => (this.moveRight = false));
    }

    // Mouse/Touch input
    scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.x = Phaser.Math.Clamp(pointer.x, this.width / 2, GameConfig.WIDTH - this.width / 2);
    });

    this.drawPaddle();
  }

  private drawPaddle(): void {
    const graphics = this.scene.make.graphics({ x: 0, y: 0, add: false } as any);
    graphics.fillStyle(GameConfig.COLORS.PADDLE, 1);
    graphics.fillRect(0, 0, this.baseWidth, GameConfig.PADDLE_HEIGHT);
    graphics.generateTexture('paddle', this.baseWidth, GameConfig.PADDLE_HEIGHT);
    graphics.destroy();
    this.setTexture('paddle');
  }

  public update(): void {
    const speed = GameConfig.PADDLE_SPEED;

    if (this.moveLeft) {
      this.x = Math.max(this.width / 2, this.x - speed / 60);
    }
    if (this.moveRight) {
      this.x = Math.min(GameConfig.WIDTH - this.width / 2, this.x + speed / 60);
    }
  }

  public shrink(amount: number = 0.2): void {
    const newWidth = Math.max(20, this.baseWidth * (1 - amount));
    this.baseWidth = newWidth;
    this.displayWidth = newWidth;
    this.body?.setSize(newWidth, GameConfig.PADDLE_HEIGHT);
  }

  public reset(): void {
    this.x = GameConfig.WIDTH / 2;
    this.baseWidth = GameConfig.PADDLE_WIDTH;
    this.displayWidth = this.baseWidth;
  }

  public getWidth(): number {
    return this.baseWidth;
  }
}
