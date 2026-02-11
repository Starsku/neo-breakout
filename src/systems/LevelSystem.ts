import { GameConfig } from '../config/GameConfig';

export interface BrickConfig {
  x: number;
  y: number;
  type: 'normal' | 'armored' | 'indestructible' | 'mobile';
  health?: number;
  colorIndex?: number;
}

export class LevelSystem {
  private currentLevel: number = 1;

  getCurrentLevel(): number {
    return this.currentLevel;
  }

  getBrickLayout(): BrickConfig[] {
    switch (this.currentLevel) {
      case 1:
        return this.level1();
      case 2:
        return this.level2();
      case 3:
        return this.level3();
      case 4:
        return this.level4();
      case 5:
        return this.level5();
      default:
        return this.level1();
    }
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

  // Helper: create a brick at grid position
  private b(
    col: number,
    row: number,
    type: BrickConfig['type'] = 'normal',
    health?: number,
    colorIndex: number = 0
  ): BrickConfig {
    return {
      x:
        GameConfig.BRICK_OFFSET_LEFT +
        col * (GameConfig.BRICK_WIDTH + GameConfig.BRICK_PADDING_X) +
        GameConfig.BRICK_WIDTH / 2,
      y:
        GameConfig.BRICK_OFFSET_TOP +
        row * (GameConfig.BRICK_HEIGHT + GameConfig.BRICK_PADDING_Y) +
        GameConfig.BRICK_HEIGHT / 2,
      type,
      health: health ?? (type === 'armored' ? 2 : 1),
      colorIndex,
    };
  }

  // ───────────────── Level 1: Rainbow Intro ─────────────────
  private level1(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        bricks.push(this.b(col, row, 'normal', 1, row));
      }
    }
    return bricks;
  }

  // ───────────────── Level 2: Armored Shield ─────────────────
  private level2(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    // Top 2 rows: armored
    for (let col = 0; col < 8; col++) {
      bricks.push(this.b(col, 0, 'armored', 2, 0));
      bricks.push(this.b(col, 1, 'armored', 2, 1));
    }
    // Bottom 4 rows: normal rainbow
    for (let row = 2; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        bricks.push(this.b(col, row, 'normal', 1, row - 2));
      }
    }
    return bricks;
  }

  // ───────────────── Level 3: Moving Targets ─────────────────
  private level3(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    // Row 0: indestructible walls on sides
    bricks.push(this.b(0, 0, 'indestructible'));
    bricks.push(this.b(7, 0, 'indestructible'));
    // Row 0 center: armored
    for (let col = 1; col < 7; col++) {
      bricks.push(this.b(col, 0, 'armored', 2, col % 3));
    }
    // Row 1-3: mobile bricks
    for (let row = 1; row <= 3; row++) {
      for (let col = 1; col < 7; col++) {
        bricks.push(this.b(col, row, 'mobile', 1, col % 4));
      }
    }
    // Row 4-5: normal
    for (let row = 4; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        bricks.push(this.b(col, row, 'normal', 1, row));
      }
    }
    return bricks;
  }

  // ───────────────── Level 4: Fortress ─────────────────
  private level4(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    // Indestructible frame
    for (let col = 0; col < 8; col++) {
      bricks.push(this.b(col, 0, 'indestructible'));
    }
    for (let row = 1; row < 7; row++) {
      bricks.push(this.b(0, row, 'indestructible'));
      bricks.push(this.b(7, row, 'indestructible'));
    }
    // Inner: armored core
    for (let row = 1; row < 5; row++) {
      for (let col = 1; col < 7; col++) {
        if (row === 2 && col >= 2 && col <= 5) {
          bricks.push(this.b(col, row, 'armored', 3, col));
        } else {
          bricks.push(this.b(col, row, 'normal', 1, (row + col) % 5));
        }
      }
    }
    // Mobile row
    for (let col = 2; col < 6; col++) {
      bricks.push(this.b(col, 5, 'mobile', 1, col % 4));
    }
    // Bottom normal
    for (let col = 1; col < 7; col++) {
      bricks.push(this.b(col, 6, 'normal', 1, col % 5));
    }
    return bricks;
  }

  // ───────────────── Level 5: Chaos ─────────────────
  private level5(): BrickConfig[] {
    const bricks: BrickConfig[] = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 8; col++) {
        // Diamond pattern of indestructible
        const cx = 3.5,
          cy = 4;
        const dist = Math.abs(col - cx) + Math.abs(row - cy);

        if (dist <= 1.5) {
          bricks.push(this.b(col, row, 'armored', 3, col));
        } else if (row === 0 || row === 8 || col === 0 || col === 7) {
          bricks.push(this.b(col, row, 'indestructible'));
        } else if ((row + col) % 3 === 0) {
          bricks.push(this.b(col, row, 'mobile', 1, (row * col) % 4));
        } else {
          bricks.push(this.b(col, row, 'normal', 1, (row + col) % 5));
        }
      }
    }
    return bricks;
  }
}
