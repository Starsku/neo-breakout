import { GameConfig } from '../config/GameConfig';

export interface BrickConfig {
  x: number;
  y: number;
  type: 'normal' | 'armored' | 'indestructible' | 'mobile';
  health?: number;
}

export class LevelSystem {
  private currentLevel: number = 1;
  private levels: BrickConfig[][] = [];

  constructor() {
    this.generateLevels();
  }

  private generateLevels(): void {
    // Level 1: Simple grid of normal bricks
    this.levels[0] = this.generateSimpleGrid(3, 10, 'normal');

    // Level 2: Mix of normal and armored bricks
    this.levels[1] = [
      ...this.generateSimpleGrid(3, 8, 'normal'),
      ...this.generateArmoredLine(2, 'armored'),
    ];

    // Level 3: Add mobile bricks
    this.levels[2] = [
      ...this.generateSimpleGrid(2, 10, 'normal'),
      ...this.generateArmoredLine(2, 'armored'),
      ...this.generateMobileRow(2, 'mobile'),
    ];

    // Level 4: Complex layout with obstacles
    this.levels[3] = this.generateComplexLayout();

    // Level 5: Ultimate challenge
    this.levels[4] = this.generateHardLayout();
  }

  private generateSimpleGrid(rows: number, cols: number, type: 'normal' | 'armored' | 'mobile'): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    const startX = 50;
    const startY = 50;
    const width = GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X;
    const height = GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        bricks.push({
          x: startX + c * width,
          y: startY + r * height,
          type,
          health: type === 'armored' ? 2 : 1,
        });
      }
    }

    return bricks;
  }

  private generateArmoredLine(row: number, type: 'armored'): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    const startX = 50;
    const startY = 50 + row * (GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y);
    const width = GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X;

    for (let c = 0; c < 10; c++) {
      bricks.push({
        x: startX + c * width,
        y: startY,
        type,
        health: 2,
      });
    }

    return bricks;
  }

  private generateMobileRow(row: number, type: 'mobile'): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    const startX = 50;
    const startY = 50 + row * (GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y);
    const width = GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X;

    for (let c = 0; c < 10; c++) {
      bricks.push({
        x: startX + c * width,
        y: startY,
        type,
      });
    }

    return bricks;
  }

  private generateComplexLayout(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    const startX = 50;
    const startY = 50;
    const width = GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X;
    const height = GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y;

    // Outer walls
    for (let c = 0; c < 10; c++) {
      bricks.push({
        x: startX + c * width,
        y: startY,
        type: 'indestructible',
      });
    }

    // Inner pattern
    for (let r = 1; r < 4; r++) {
      for (let c = 0; c < 10; c++) {
        if (c % 2 === 0 || r === 2) {
          const typeArray: ('normal' | 'armored' | 'mobile')[] = ['normal', 'armored', 'mobile'];
          bricks.push({
            x: startX + c * width,
            y: startY + r * height,
            type: typeArray[r - 1] || 'normal',
            health: typeArray[r - 1] === 'armored' ? 2 : 1,
          });
        }
      }
    }

    return bricks;
  }

  private generateHardLayout(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    const startX = 50;
    const startY = 50;
    const width = GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X;
    const height = GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y;

    // Dense pattern
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 10; c++) {
        let type: 'normal' | 'armored' | 'indestructible' | 'mobile';

        if (r === 0 || r === 4) {
          type = 'indestructible';
        } else if (c === 0 || c === 9) {
          type = 'indestructible';
        } else if (r % 2 === 0) {
          type = 'armored';
        } else if (c % 3 === 0) {
          type = 'mobile';
        } else {
          type = 'normal';
        }

        bricks.push({
          x: startX + c * width,
          y: startY + r * height,
          type,
          health: type === 'armored' ? 3 : 1,
        });
      }
    }

    return bricks;
  }

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getBrickLayout(): BrickConfig[] {
    return this.levels[Math.min(this.currentLevel - 1, this.levels.length - 1)] || [];
  }

  nextLevel(): void {
    if (this.currentLevel < GameConfig.LEVEL_COUNT) {
      this.currentLevel++;
    }
  }

  isLastLevel(): boolean {
    return this.currentLevel >= GameConfig.LEVEL_COUNT;
  }

  reset(): void {
    this.currentLevel = 1;
  }

  getSpeedMultiplier(): number {
    return Math.pow(GameConfig.LEVEL_SPEED_MULTIPLIER, this.currentLevel - 1);
  }
}
