export const GameConfig = {
  // Canvas
  WIDTH: 800,
  HEIGHT: 600,
  
  // Game
  BALL_SPEED_BASE: 400,
  BALL_RADIUS: 5,
  PADDLE_WIDTH: 80,
  PADDLE_HEIGHT: 12,
  PADDLE_SPEED: 500,
  
  // Bricks
  BRICK_WIDTH: 70,
  BRICK_HEIGHT: 12,
  BRICK_PADDING_X: 5,
  BRICK_PADDING_Y: 5,
  
  // Levels
  LEVEL_COUNT: 5,
  LEVEL_SPEED_MULTIPLIER: 1.1,
  INTRA_LEVEL_ACCELERATION: 1.02,
  ACCELERATION_THRESHOLD: 5,
  
  // Power-ups
  POWERUP_SIZE: 16,
  POWERUP_SPEED: 150,
  POWERUP_SPAWN_CHANCE: 0.15,
  
  // Scoring
  SCORES: {
    NORMAL: 10,
    ARMORED: 25,
    INDESTRUCTIBLE: 0,
    MOBILE: 15,
  },
  
  // Colors
  COLORS: {
    NORMAL: 0x00ff00,
    ARMORED: 0xff6600,
    INDESTRUCTIBLE: 0x555555,
    MOBILE: 0x00ffff,
    PADDLE: 0xffffff,
    BALL: 0xffff00,
    BG: 0x1a1a2e,
  },
} as const;
