/**
 * Web Audio API synthesized acoustic emergency siren
 * Safe, client-side, zero external audio file dependencies
 */

class SirenSynthesizer {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying: boolean = false;
  private isMuted: boolean = false;

  private init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public startSiren() {
    if (this.isPlaying || this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;

      // Master gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      // Primary siren carrier oscillator (sawtooth/triangle for piercing penetration)
      this.oscillator = this.audioCtx.createOscillator();
      this.oscillator.type = 'sawtooth';
      this.oscillator.frequency.setValueAtTime(650, this.audioCtx.currentTime);

      // LFO for emergency warble sweep (0.8 Hz oscillation between 550Hz and 950Hz)
      this.lfo = this.audioCtx.createOscillator();
      this.lfo.frequency.setValueAtTime(0.75, this.audioCtx.currentTime);

      this.lfoGain = this.audioCtx.createGain();
      this.lfoGain.gain.setValueAtTime(250, this.audioCtx.currentTime);

      this.lfo.connect(this.lfoGain);
      this.lfoGain.connect(this.oscillator.frequency);

      this.oscillator.connect(this.gainNode);

      this.oscillator.start();
      this.lfo.start();
      this.isPlaying = true;
    } catch (e) {
      console.warn('AudioContext failed to start (interaction required):', e);
    }
  }

  public stopSiren() {
    if (!this.isPlaying) return;
    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.lfo) {
        this.lfo.stop();
        this.lfo.disconnect();
        this.lfo = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      this.isPlaying = false;
    } catch {
      this.isPlaying = false;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.isPlaying) {
      this.stopSiren();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public playTestBeep() {
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext interaction safeguard
    }
  }
}

export const sirenSynthesizer = new SirenSynthesizer();

export function playEmergencySiren() {
  sirenSynthesizer.startSiren();
}

export function stopEmergencySiren() {
  sirenSynthesizer.stopSiren();
}

export function toggleSirenMute(): boolean {
  return sirenSynthesizer.toggleMute();
}
