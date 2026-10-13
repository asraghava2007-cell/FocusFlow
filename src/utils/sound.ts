/**
 * Web Audio API synthesizer for clean, pleasant audio cues.
 * No external media dependencies, works offline and immediately in all modern browsers.
 */

class SoundManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play completion sound based on preset type
   */
  public play(type: 'zen' | 'bell' | 'marimba' | 'digital' = 'zen', volume: number = 0.5): void {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), now);
      masterGain.connect(ctx.destination);

      if (type === 'zen') {
        // Singing bowl harmonic blend (soft, meditative, peaceful)
        const freqs = [528, 792, 1056]; // 528Hz solfeggio focus frequency
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          const decay = 2.4 - idx * 0.4;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.25 / (idx + 1), now + 0.06);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + decay);
        });
      } else if (type === 'bell') {
        // Soft chime bell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 1.2);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 1.5);
      } else if (type === 'marimba') {
        // Wooden warm mallet tone
        [660, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0, now + i * 0.08);
          gain.gain.linearRampToValueAtTime(0.3, now + i * 0.08 + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.6);
        });
      } else {
        // Clean modern pip
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6
        osc.frequency.setValueAtTime(1318.5, now + 0.1); // E6

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.4);
      }
    } catch {
      // Audio might be blocked if user hasn't interacted yet
    }
  }

  /**
   * Subtle tick or click sound for button feedback
   */
  public playClick(): void {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new SoundManager();
