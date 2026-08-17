// Web Audio API sound effects synthesizer

class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy initialized on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Clattering dice roll sound
  public playDiceRoll() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Generate multiple short wooden clicks/impacts
      const clicks = 7;
      for (let i = 0; i < clicks; i++) {
        const timeOffset = now + i * 0.05 + (Math.random() * 0.02);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Random pitch around wood-knock frequency
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180 + Math.random() * 320, timeOffset);
        osc.frequency.exponentialRampToValueAtTime(80, timeOffset + 0.04);

        gain.gain.setValueAtTime(0.2, timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, timeOffset + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(timeOffset);
        osc.stop(timeOffset + 0.05);
      }
    } catch {
      // Ignore audio failure
    }
  }

  // Hold / Unhold toggle sound
  public playHoldToggle(held: boolean) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      if (held) {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      } else {
        osc.frequency.setValueAtTime(550, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.08);
      }

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Ignore
    }
  }

  // Score recorded chime
  public playScoreRecorded() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.12, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.25);
      });
    } catch {
      // Ignore
    }
  }

  // Yatzy celebratory fanfare
  public playYatzyFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chordNotes = [
        { f: 523.25, t: 0.00 }, // C5
        { f: 659.25, t: 0.10 }, // E5
        { f: 783.99, t: 0.20 }, // G5
        { f: 1046.50, t: 0.32 }, // C6
        { f: 1318.51, t: 0.44 }, // E6
      ];

      chordNotes.forEach(({ f, t }) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.2, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + t);
        osc.stop(now + t + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  // Bonus achievement sound
  public playBonus() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.15, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundFX();
