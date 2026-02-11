export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 0;
  private combo: number = 0;
  private bricksDestroyedSinceRacket: number = 0;

  constructor() {
    this.loadHighScore();
  }

  addScore(points: number, speedMultiplier: number = 1): void {
    const bonusMultiplier = 1 + (this.combo * 0.1);
    const totalScore = Math.floor(points * speedMultiplier * bonusMultiplier);
    this.score += totalScore;
    this.combo += 1;
    this.bricksDestroyedSinceRacket += 1;
  }

  resetCombo(): void {
    this.combo = 0;
    this.bricksDestroyedSinceRacket = 0;
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
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('neo-breakout-highscore', this.highScore.toString());
    }
  }

  loadHighScore(): void {
    const saved = localStorage.getItem('neo-breakout-highscore');
    this.highScore = saved ? parseInt(saved, 10) : 0;
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.bricksDestroyedSinceRacket = 0;
  }
}
