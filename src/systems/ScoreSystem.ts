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
      const response = await fetch('/api/scores');
      if (response.ok) {
        this.leaderboard = await response.json();
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      // Fallback to local if absolutely necessary or just keep empty
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
    if (this.leaderboard.length < 3) return true;
    return score > this.leaderboard[this.leaderboard.length - 1].score;
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
