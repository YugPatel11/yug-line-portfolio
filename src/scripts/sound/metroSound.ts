// ========================================================
// THE YUG LINE — Web Audio Transit Sound Engine
// Strictly per Section 4:
// - Stereo panning (left -> center -> right)
// - Realistic mechanical synthesis: rumble, brake squeal,
//   pneumatic hiss, ding-dong chime, door beeps, motor whine
// - Optional file fallback to public/audio/ if present
// - Zero external network calls, zero tracking
// ========================================================

class MetroSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private enabled: boolean = false;
  private waitingHumOsc: OscillatorNode | null = null;
  private waitingHumGain: GainNode | null = null;

  constructor() {
    // Check saved preference
    try {
      const saved = localStorage.getItem('yugline_sound');
      if (saved === 'on') {
        this.enabled = true;
      }
    } catch (e) {}

    // Suspend context when document is hidden
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.ctx && this.ctx.state === 'running') {
          this.ctx.suspend();
        } else if (!document.hidden && this.ctx && this.ctx.state === 'suspended' && this.enabled) {
          this.ctx.resume();
        }
      });
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Compressor Limiter
      this.compressor = this.ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
      this.compressor.knee.setValueAtTime(12, this.ctx.currentTime);
      this.compressor.ratio.setValueAtTime(10, this.ctx.currentTime);
      this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

      // Master Gain (Peak ~0.18 per Section 4.2)
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.enabled ? 0.18 : 0, this.ctx.currentTime);

      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enable: boolean) {
    this.enabled = enable;
    try {
      localStorage.setItem('yugline_sound', enable ? 'on' : 'off');
    } catch (e) {}

    if (enable) {
      this.initContext();
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      }
    } else {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this.stopWaitingHum();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  // Helper: Create noise buffer for rumbles, hisses and clatter
  private createNoiseBuffer(durationSec: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * durationSec;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    // Brown noise integration for heavy train mass feel
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    return buffer;
  }

  // 1. Approach & Arrival Sound Sequence (panning Left -> Centre)
  public async playArrivalSequence() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Stereo Panner (Pan left -0.8 -> centre 0.0 over 2 seconds)
    let panner: any = null;
    if (this.ctx.createStereoPanner) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(-0.85, now);
      panner.pan.linearRampToValueAtTime(0.0, now + 2.0);
      panner.connect(this.masterGain);
    }
    const dest = panner || this.masterGain;

    // (A) Low Rumble (Brown noise through 180–400Hz low-pass)
    const noiseBuffer = this.createNoiseBuffer(2.4);
    if (noiseBuffer) {
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(180, now);
      lowpass.frequency.exponentialRampToValueAtTime(380, now + 1.8);

      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.01, now);
      rumbleGain.gain.linearRampToValueAtTime(0.8, now + 1.6);
      rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 2.4);

      noiseSource.connect(lowpass);
      lowpass.connect(rumbleGain);
      rumbleGain.connect(dest);

      noiseSource.start(now);
      noiseSource.stop(now + 2.4);
    }

    // (B) Rail Clatter Ticks (Repeated soft clicks)
    for (let i = 0; i < 6; i++) {
      const tickTime = now + 0.3 + i * 0.32;
      const osc = this.ctx.createOscillator();
      const tickGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, tickTime);
      tickGain.gain.setValueAtTime(0.3, tickTime);
      tickGain.gain.exponentialRampToValueAtTime(0.001, tickTime + 0.08);

      osc.connect(tickGain);
      tickGain.connect(dest);
      osc.start(tickTime);
      osc.stop(tickTime + 0.09);
    }

    // (C) Braking Squeal (Bandpass noise sliding 2.6kHz -> 900Hz, 0.5s)
    const squealBuffer = this.createNoiseBuffer(0.6);
    if (squealBuffer) {
      const squealSrc = this.ctx.createBufferSource();
      squealSrc.buffer = squealBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.Q.setValueAtTime(12, now + 1.6);
      bandpass.frequency.setValueAtTime(2600, now + 1.6);
      bandpass.frequency.exponentialRampToValueAtTime(900, now + 2.1);

      const squealGain = this.ctx.createGain();
      squealGain.gain.setValueAtTime(0.001, now + 1.6);
      squealGain.gain.linearRampToValueAtTime(0.25, now + 1.7);
      squealGain.gain.exponentialRampToValueAtTime(0.001, now + 2.15);

      squealSrc.connect(bandpass);
      bandpass.connect(squealGain);
      squealGain.connect(dest);

      squealSrc.start(now + 1.6);
      squealSrc.stop(now + 2.2);
    }

    // (D) Pneumatic Hiss (Air brake release burst)
    const hissBuffer = this.createNoiseBuffer(0.4);
    if (hissBuffer) {
      const hissSrc = this.ctx.createBufferSource();
      hissSrc.buffer = hissBuffer;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(2400, now + 2.1);

      const hissGain = this.ctx.createGain();
      hissGain.gain.setValueAtTime(0.2, now + 2.1);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 2.45);

      hissSrc.connect(highpass);
      highpass.connect(hissGain);
      hissGain.connect(dest);

      hissSrc.start(now + 2.1);
      hissSrc.stop(now + 2.45);
    }

    // Vibrate device on arrival if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
  }

  // 2. Door Open & Ding-Dong Chime
  public playDoorOpenChime() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Door slide whoosh (short noise sweep)
    const whooshBuffer = this.createNoiseBuffer(0.3);
    if (whooshBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = whooshBuffer;
      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(800, now);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      src.connect(bp);
      bp.connect(g);
      g.connect(this.masterGain);
      src.start(now);
      src.stop(now + 0.3);
    }

    // Two-tone ding-dong chime (880Hz then 660Hz sine with fast decay)
    const playTone = (freq: number, startTime: number) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(startTime);
      osc.stop(startTime + 0.46);
    };

    playTone(880, now + 0.08); // High "Ding"
    playTone(660, now + 0.38); // Low "Dong"

    // Start subtle background station hum
    this.startWaitingHum();
  }

  // 3. Station Waiting Hum
  public startWaitingHum() {
    if (!this.enabled || this.waitingHumOsc) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      this.waitingHumOsc = this.ctx.createOscillator();
      this.waitingHumGain = this.ctx.createGain();
      this.waitingHumOsc.type = 'sine';
      this.waitingHumOsc.frequency.setValueAtTime(60, this.ctx.currentTime); // Mains 60Hz hum

      this.waitingHumGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
      this.waitingHumOsc.connect(this.waitingHumGain);
      this.waitingHumGain.connect(this.masterGain);
      this.waitingHumOsc.start();
    } catch (e) {}
  }

  public stopWaitingHum() {
    if (this.waitingHumOsc && this.waitingHumGain && this.ctx) {
      try {
        this.waitingHumGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
        this.waitingHumOsc.stop(this.ctx.currentTime + 0.22);
      } catch (e) {}
      this.waitingHumOsc = null;
      this.waitingHumGain = null;
    }
  }

  // 4. Doors Closing (Three 1kHz beeps + thump)
  public playDoorClosingSequence(): Promise<void> {
    return new Promise((resolve) => {
      this.stopWaitingHum();
      if (!this.enabled) {
        setTimeout(resolve, 500);
        return;
      }
      this.initContext();
      if (!this.ctx || !this.masterGain) {
        setTimeout(resolve, 500);
        return;
      }

      const now = this.ctx.currentTime;

      // Three door-closing beeps (1kHz, 90ms each, 120ms interval)
      for (let i = 0; i < 3; i++) {
        const beepStart = now + i * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, beepStart);
        gain.gain.setValueAtTime(0.28, beepStart);
        gain.gain.setValueAtTime(0.28, beepStart + 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, beepStart + 0.09);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(beepStart);
        osc.stop(beepStart + 0.1);
      }

      // Door-close solid thump at 0.45s
      const thumpTime = now + 0.45;
      const thumpOsc = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thumpOsc.type = 'triangle';
      thumpOsc.frequency.setValueAtTime(80, thumpTime);
      thumpOsc.frequency.exponentialRampToValueAtTime(35, thumpTime + 0.12);

      thumpGain.gain.setValueAtTime(0.4, thumpTime);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, thumpTime + 0.15);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(this.masterGain);
      thumpOsc.start(thumpTime);
      thumpOsc.stop(thumpTime + 0.16);

      setTimeout(resolve, 600);
    });
  }

  // 5. Departure Acceleration (Panning Centre -> Right)
  public async playDepartureSequence() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Stereo Panner (Pan centre 0.0 -> right +0.9)
    let panner: any = null;
    if (this.ctx.createStereoPanner) {
      panner = this.ctx.createStereoPanner();
      panner.pan.setValueAtTime(0.0, now);
      panner.pan.linearRampToValueAtTime(0.9, now + 1.4);
      panner.connect(this.masterGain);
    }
    const dest = panner || this.masterGain;

    // (A) Rising Motor Inverter Whine (Sawtooth through lowpass)
    const motorOsc = this.ctx.createOscillator();
    const motorFilter = this.ctx.createBiquadFilter();
    const motorGain = this.ctx.createGain();

    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(120, now);
    motorOsc.frequency.exponentialRampToValueAtTime(540, now + 1.3);

    motorFilter.type = 'lowpass';
    motorFilter.frequency.setValueAtTime(450, now);
    motorFilter.frequency.exponentialRampToValueAtTime(1100, now + 1.3);

    motorGain.gain.setValueAtTime(0.05, now);
    motorGain.gain.linearRampToValueAtTime(0.22, now + 0.7);
    motorGain.gain.exponentialRampToValueAtTime(0.001, now + 1.45);

    motorOsc.connect(motorFilter);
    motorFilter.connect(motorGain);
    motorGain.connect(dest);

    motorOsc.start(now);
    motorOsc.stop(now + 1.45);

    // (B) Accelerating Wheel Clatter (Interval decreases as speed builds)
    const clatterTimes = [0.1, 0.35, 0.55, 0.72, 0.86, 0.98, 1.08, 1.16];
    clatterTimes.forEach((t) => {
      const clickTime = now + t;
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(110, clickTime);
      g.gain.setValueAtTime(0.2, clickTime);
      g.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.05);

      osc.connect(g);
      g.connect(dest);
      osc.start(clickTime);
      osc.stop(clickTime + 0.06);
    });

    // (C) Air rush whoosh
    const whooshBuffer = this.createNoiseBuffer(1.4);
    if (whooshBuffer) {
      const src = this.ctx.createBufferSource();
      src.buffer = whooshBuffer;
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(250, now);
      lp.frequency.exponentialRampToValueAtTime(800, now + 1.2);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(0.25, now + 0.8);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      src.connect(lp);
      lp.connect(g);
      g.connect(dest);
      src.start(now);
      src.stop(now + 1.45);
    }

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 80]);
    }
  }

  // General subtle feedback methods (printer, ticket punch, beep)
  public printer() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.05;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1800 + Math.random() * 400, t);
      g.gain.setValueAtTime(0.06, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(g);
      g.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.035);
    }
  }

  public punch() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    // Beep
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    g.gain.setValueAtTime(0.18, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.11);

    // Mechanical solenoid thump
    const thump = this.ctx.createOscillator();
    const tg = this.ctx.createGain();
    thump.type = 'triangle';
    thump.frequency.setValueAtTime(90, now + 0.02);
    tg.gain.setValueAtTime(0.25, now + 0.02);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    thump.connect(tg);
    tg.connect(this.masterGain);
    thump.start(now + 0.02);
    thump.stop(now + 0.13);
  }
}

export const metroSound = new MetroSoundEngine();
if (typeof window !== 'undefined') {
  (window as any).__yugsound = metroSound;
}

