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
    this.loadLeaderboard();
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

  private loadLeaderboard(): void {
    try {
      const saved = localStorage.getItem('neo-breakout-leaderboard');
      this.leaderboard = saved ? JSON.parse(saved) : [];
    } catch {
      this.leaderboard = [];
    }
  }

  public isTop3(score: number): boolean {
    if (this.leaderboard.length < 3) return true;
    return score > this.leaderboard[this.leaderboard.length - 1].score;
  }

  public addToLeaderboard(name: string, score: number): void {
    const entry: LeaderboardEntry = {
      name,
      score,
      date: new Date().toLocaleDateString(),
    };
    this.leaderboard.push(entry);
    this.leaderboard.sort((a, b) => b.score - a.score);
    this.leaderboard = this.leaderboard.slice(0, 3);
    
    try {
      localStorage.setItem('neo-breakout-leaderboard', JSON.stringify(this.leaderboard));
    } catch {
      // Silent fail
    }
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
  }
}
