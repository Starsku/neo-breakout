export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 0;
  private combo: number = 0;

  constructor() {
    this.loadHighScore();
  }

  addScore(points: number, speedMultiplier: number = 1): void {
    const comboBonus = 1 + this.combo * 0.1;
    const total = Math.floor(points * speedMultiplier * comboBonus);
    this.score += total;
    this.combo += 1;

    // Auto-save high score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  resetCombo(): void {
    this.combo = 0;
  }

  getScore(): number {
    return this.score;
  }

  getCombo(): number {
    return this.combo;
  }

  getHighScore(): number {
    return this.highScore;
  }

  saveHighScore(): void {
    try {
      localStorage.setItem('neo-breakout-highscore', this.highScore.toString());
    } catch {
      // Silent fail on storage errors
    }
  }

  loadHighScore(): void {
    try {
      const saved = localStorage.getItem('neo-breakout-highscore');
      this.highScore = saved ? parseInt(saved, 10) : 0;
    } catch {
      this.highScore = 0;
    }
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
  }
}
