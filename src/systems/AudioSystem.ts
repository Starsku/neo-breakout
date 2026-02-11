import { Howl } from 'howler';

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume: number = 0.5;
  private bgMusic: Howl | null = null;
  private sounds: Map<string, Howl> = new Map();

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private generateTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;

    const ctx = this.audioContext;
    const sampleRate = ctx.sampleRate;
    const samples = duration * sampleRate;
    const buffer = ctx.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-3 * t / duration);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  playSoundEffect(type: 'paddle' | 'brick' | 'armor' | 'powerup' | 'loss', combo: number = 0): void {
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.value = this.masterVolume * 0.5;

    switch (type) {
      case 'paddle': {
        const baseFreq = 400 + (combo * 20);
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'brick': {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;
      }
      case 'armor': {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'powerup': {
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      case 'loss': {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
    }
  }

  playBackgroundMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.play();
      return;
    }

    // Simple background music using Web Audio API
    if (!this.audioContext) return;

    const ctx = this.audioContext;
    const notes = [262, 294, 330, 349]; // C, D, E, F
    let noteIndex = 0;

    const playNote = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.value = this.masterVolume * 0.1;

      osc.frequency.value = notes[noteIndex % notes.length];
      osc.start(now);
      osc.stop(now + 0.3);

      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

      noteIndex++;
      setTimeout(playNote, 400);
    };

    playNote();
  }

  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  getMasterVolume(): number {
    return this.masterVolume;
  }
}
