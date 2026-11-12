class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = false;
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      this.enabled = localStorage.getItem('yugline_sound') === 'true';
    } catch (e) {
      this.enabled = false;
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('yugline_sound', String(this.enabled));
    } catch (e) {}

    if (this.enabled) {
      this.getAudioContext();
      this.beep();
    }
    return this.enabled;
  }

  private getAudioContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 1. Printer = 6 short band-passed noise bursts (40ms, 1.2kHz) per Section 8
  public printer() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    for (let i = 0; i < 6; i++) {
      const t = ctx.currentTime + i * 0.08;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let j = 0; j < buffer.length; j++) {
        output[j] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.Q.setValueAtTime(3, t);

      whiteNoise.connect(filter);
      filter.connect(this.masterGain);
      whiteNoise.start(t);
    }
  }

  // 2. Beep = square wave 880Hz 120ms
  public beep() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // 3. Gate Green = two tones 660 -> 990Hz
  public gateGreen() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.setValueAtTime(990, t + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  // 4. Punch = 120Hz sine thump 60ms plus a noise click
  public punch() {
    const ctx = this.getAudioContext();
    if (navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch (e) {}
    }
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // 5. Train chime = triangle arpeggio 523 -> 659 -> 784Hz
  public trainChime() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const freqs = [523, 659, 784];
    freqs.forEach((freq, idx) => {
      const t = ctx.currentTime + idx * 0.12;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  // 6. Door ding = sine 1046Hz with fast decay
  public doorDing() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

export const sound = new SoundEngine();
