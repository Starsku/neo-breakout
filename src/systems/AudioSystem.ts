export class AudioSystem {
  private ctx: AudioContext | null = null;
  private volume: number = 0.4;

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      // No audio support
    }
  }

  private tone(freq: number, duration: number, type: OscillatorType = 'sine', vol?: number): void {
    if (!this.ctx) return;
    try {
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const now = this.ctx.currentTime;
      const v = (vol ?? this.volume) * 0.3;
      gain.gain.setValueAtTime(v, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.frequency.setValueAtTime(freq, now);
      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Silently ignore audio errors
    }
  }

  playSoundEffect(
    type: 'paddle' | 'brick' | 'armor' | 'powerup' | 'loss' | 'launch' | 'levelup',
    combo: number = 0
  ): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (type) {
      case 'paddle': {
        const f = 300 + combo * 15;
        this.tone(f, 0.08, 'triangle');
        break;
      }
      case 'brick': {
        const f = 600 + combo * 20;
        this.tone(f, 0.06, 'square', this.volume * 0.5);
        break;
      }
      case 'armor': {
        this.tone(200, 0.1, 'sawtooth', this.volume * 0.4);
        setTimeout(() => this.tone(300, 0.06, 'square', this.volume * 0.3), 50);
        break;
      }
      case 'powerup': {
        this.tone(800, 0.08, 'sine');
        setTimeout(() => this.tone(1000, 0.08, 'sine'), 60);
        setTimeout(() => this.tone(1200, 0.1, 'sine'), 120);
        break;
      }
      case 'loss': {
        this.tone(300, 0.15, 'sawtooth');
        setTimeout(() => this.tone(200, 0.2, 'sawtooth'), 100);
        setTimeout(() => this.tone(100, 0.3, 'sawtooth'), 200);
        break;
      }
      case 'launch': {
        this.tone(500, 0.1, 'triangle');
        break;
      }
      case 'levelup': {
        this.tone(600, 0.1, 'sine');
        setTimeout(() => this.tone(800, 0.1, 'sine'), 100);
        setTimeout(() => this.tone(1000, 0.15, 'sine'), 200);
        setTimeout(() => this.tone(1200, 0.2, 'sine'), 300);
        break;
      }
    }
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
  }
}
