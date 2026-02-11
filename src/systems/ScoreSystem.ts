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
  private apiError: boolean = false;

  constructor() {
    this.loadHighScore();
    // Non-blocking load
    this.refreshLeaderboard();
  }

  public async refreshLeaderboard(): Promise<LeaderboardEntry[]> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      console.log('Fetching leaderboard...');
      const response = await fetch('/api/scores', { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        this.leaderboard = await response.json();
        this.apiError = false;
        console.log('Leaderboard updated:', this.leaderboard);
      } else {
        console.error('Leaderboard response not OK:', response.status);
        this.apiError = true;
      }
    } catch (error: any) {
      this.apiError = true;
      if (error.name === 'AbortError') {
        console.error('Leaderboard fetch timed out');
      } else {
        console.error('Failed to fetch leaderboard:', error);
      }
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

  public hasApiError(): boolean {
    return this.apiError;
  }

  public isTop3(score: number): boolean {
    if (this.apiError) return false;
    
    console.log('Checking isTop3 for score:', score, 'against leaderboard:', this.leaderboard);
    if (this.leaderboard.length < 3) {
      return true;
    }
    const threshold = this.leaderboard[2].score;
    return score > threshold;
  }

  public async addToLeaderboard(name: string, score: number): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      console.log('Sending score to API...', { name, score });
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        this.leaderboard = await response.json();
        this.apiError = false;
        console.log('Leaderboard updated after POST:', this.leaderboard);
      } else {
        console.error('API POST failed with status:', response.status);
        this.apiError = true;
      }
    } catch (error: any) {
      this.apiError = true;
      if (error.name === 'AbortError') {
        console.error('Leaderboard POST timed out');
      } else {
        console.error('Failed to update leaderboard:', error);
      }
    }
  }

  reset(): void {
    this.score = 0;
    this.combo = 0;
    this.apiError = false;
  }
}
