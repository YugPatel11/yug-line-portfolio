class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private masterGain: GainNode | null = null;

  constructor() {
    this.syncEnabled();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', () => this.syncEnabled());
    }
  }

  private syncEnabled() {
    try {
      const saved = localStorage.getItem('yugline_sound');
      // Default to true/on unless user explicitly toggled off
      this.enabled = saved !== 'off' && saved !== 'false';
    } catch (e) {
      this.enabled = true;
    }
  }

  public isEnabled(): boolean {
    this.syncEnabled();
    return this.enabled;
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    try {
      localStorage.setItem('yugline_sound', enable ? 'on' : 'off');
    } catch (e) {}
    if (enable) {
      this.getAudioContext();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.isEnabled());
    if (this.enabled) {
      this.beep();
    }
    return this.enabled;
  }

  private getAudioContext(): AudioContext | null {
    this.syncEnabled();
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.20, this.ctx.currentTime);
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

  // 7. Counter Desk Bell = crisp brass ping at 2093Hz + 3136Hz overtone
  public counterBell() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    [2093, 3136].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const gain = ctx.createGain();
      const initialGain = idx === 0 ? 0.12 : 0.05;
      gain.gain.setValueAtTime(initialGain, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  }

  // 8. Keyboard Typing Clatter = rapid soft click bursts
  public keyboardClick() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    for (let i = 0; i < 4; i++) {
      const t = ctx.currentTime + i * 0.055;
      const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.015), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = Math.random() * 2 - 1;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800 + i * 200, t);
      filter.Q.setValueAtTime(4, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, t);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      source.start(t);
    }
  }

  // 8b. Mechanical Solari Split-Flap flutter click
  public splitFlap() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    for (let i = 0; i < 3; i++) {
      const t = ctx.currentTime + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200 + i * 180, t);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.035);
    }
  }

  // 9. Stamp Thunk = heavy 80Hz resonant impact + crisp surface snap
  public stampThunk() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);

    // High snap transient
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.01), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    const snap = ctx.createBufferSource();
    snap.buffer = buffer;
    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.08, t);
    snap.connect(snapGain);
    snapGain.connect(this.masterGain);
    snap.start(t);
  }

  // 10. Paper Slide = soft friction whoosh across counter
  public paperSlide() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const dur = 0.22;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let j = 0; j < data.length; j++) {
      data[j] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(1400, t + dur);
    filter.Q.setValueAtTime(1.5, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.05, t + dur * 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 11. Split-Flap Click = snappy mechanical solenoid tick
  public flapClick() {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.025);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.03);
  }
}

export const sound = new SoundEngine();
