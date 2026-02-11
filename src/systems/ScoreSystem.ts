export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export class ScoreSystem {
  private score: number = 0;
  private highScore: number = 0;
  private combo: number = 0;
  private leaderboard: LeaderboardEntry[] = [];

  constructor() {
    this.loadHighScore();
    // Non-blocking load
    this.refreshLeaderboard();
  }

  public async refreshLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      console.log('Fetching leaderboard...');
      const response = await fetch('/api/scores');
      if (response.ok) {
        this.leaderboard = await response.json();
        console.log('Leaderboard updated:', this.leaderboard);
      } else {
        console.error('Leaderboard response not OK:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
    return this.leaderboard;
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

  // Leaderboard methods
  public getLeaderboard(): LeaderboardEntry[] {
    return this.leaderboard;
  }

  public isTop3(score: number): boolean {
    console.log('Checking isTop3 for score:', score, 'against leaderboard:', this.leaderboard);
    if (this.leaderboard.length < 3) {
      console.log('Leaderboard has less than 3 entries, true');
      return true;
    }
    const threshold = this.leaderboard[2].score;
    const result = score > threshold;
    console.log(`Threshold is ${threshold}, result is ${result}`);
    return result;
  }

  public async addToLeaderboard(name: string, score: number): Promise<void> {
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score })
      });
      if (response.ok) {
        this.leaderboard = await response.json();
      }
    } catch (error) {
      console.error('Failed to update leaderboard:', error);
    }
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
  }
}
