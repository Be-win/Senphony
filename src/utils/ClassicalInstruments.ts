// src/utils/ClassicalInstruments.ts
import { InstrumentSound } from '../types';

export class ClassicalInstruments {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentInstrument: string = 'piano';

  private noteFrequencies = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'G': 392.00,
    'A': 440.00,
    'C2': 523.25
  };

  private instrumentConfigs = {
    piano: {
      oscillatorType: 'triangle' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterFrequency: 2000, // Fixed frequency instead of multiplier
      attack: 0.01,
      decay: 0.2,
      sustain: 0.1,
      release: 0.3,
      harmonics: [
        { frequency: 2, gain: 0.15, type: 'sine' as OscillatorType }, // Reduced gain
        { frequency: 3, gain: 0.05, type: 'triangle' as OscillatorType } // Reduced gain
      ],
      effects: { reverb: true },
      masterGain: 0.3 // Added master gain control
    },
    violin: {
      oscillatorType: 'sawtooth' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterFrequency: 1500, // Fixed frequency for smoother sound
      attack: 0.05, // Smoother attack for flowing sounds
      decay: 0.1,
      sustain: 0.6,
      release: 0.4, // Longer release for ambient feel
      harmonics: [
        { frequency: 2, gain: 0.08, type: 'sine' as OscillatorType }, // Reduced gain significantly
        { frequency: 3, gain: 0.04, type: 'triangle' as OscillatorType } // Added third harmonic with low gain
      ],
      effects: { vibrato: false, reverb: true },
      masterGain: 0.25 // Lower master gain to prevent clipping
    },
    flute: {
      oscillatorType: 'sine' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterFrequency: 1800, // Lower cutoff for smoother, less harsh sound
      attack: 0.03, // Slightly longer attack for even gentler onset
      decay: 0.12, // Longer decay for more natural envelope
      sustain: 0.5, // Lower sustain to reduce overall volume
      release: 0.6, // Even longer release for flowing effect
      harmonics: [
        { frequency: 2, gain: 0.03, type: 'sine' as OscillatorType }, // Much lower gain for cleaner sound
        { frequency: 3, gain: 0.015, type: 'sine' as OscillatorType } // Changed to 3rd harmonic with very low gain
      ],
      effects: { reverb: true },
      masterGain: 0.2 // Reduced master gain to prevent any clipping
    }
  };

  async initialize(audioContext: AudioContext, masterGain: GainNode) {
    this.audioContext = audioContext;
    this.masterGain = masterGain;
  }

  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setInstrument(instrumentId: string) {
    if (this.instrumentConfigs[instrumentId as keyof typeof this.instrumentConfigs]) {
      this.currentInstrument = instrumentId;
    }
  }

  // Helper to clamp time for setValueAtTime
  private clampTime(t: number, now: number) {
    return isFinite(t) && t >= now ? t : now + 0.01;
  }

  async playNote(note: string, duration = 0.3, delay = 0): Promise<InstrumentSound | null> {
    if (!this.audioContext || !this.masterGain) return null;
    
    // Check if context is closed before proceeding
    if (this.audioContext.state === 'closed') {
      console.warn('Cannot play note: AudioContext is closed');
      return null;
    }

    // Resume context if suspended
    await this.resumeContext();
    
    const config = this.instrumentConfigs[this.currentInstrument as keyof typeof this.instrumentConfigs];
    if (!config) return null;
    const frequency = this.noteFrequencies[note as keyof typeof this.noteFrequencies];
    if (!frequency) return null;

    // Robustly clamp startTime
    const now = this.audioContext.currentTime;
    const minStartTime = now + 0.01;
    let startTime = now + delay;
    if (!isFinite(startTime) || startTime < minStartTime) {
      startTime = minStartTime;
    }
    const endTime = startTime + duration;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.masterGain);

      oscillator.type = config.oscillatorType;
      oscillator.frequency.setValueAtTime(frequency, this.clampTime(startTime, now));
      filterNode.type = config.filterType;
      filterNode.frequency.setValueAtTime(config.filterFrequency, this.clampTime(startTime, now));

      const harmonics: OscillatorNode[] = [];
      config.harmonics.forEach((harmonic) => {
        const harmonicOsc = this.audioContext!.createOscillator();
        const harmonicGain = this.audioContext!.createGain();
        harmonicOsc.connect(harmonicGain);
        harmonicGain.connect(gainNode);
        harmonicOsc.type = harmonic.type;
        harmonicOsc.frequency.setValueAtTime(frequency * harmonic.frequency, this.clampTime(startTime, now));
        harmonicGain.gain.setValueAtTime(harmonic.gain, this.clampTime(startTime, now));
        harmonicOsc.start(this.clampTime(startTime, now));
        harmonicOsc.stop(this.clampTime(endTime, now));
        harmonics.push(harmonicOsc);
      });

      if (config.effects && 'vibrato' in config.effects && config.effects.vibrato) {
        console.log('Violin vibrato triggered', {note, startTime, endTime});
        const vibratoOsc = this.audioContext.createOscillator();
        const vibratoGain = this.audioContext.createGain();
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(oscillator.frequency);
        vibratoOsc.type = 'sine';
        vibratoOsc.frequency.setValueAtTime(6, this.clampTime(startTime, now));
        vibratoGain.gain.setValueAtTime(1, this.clampTime(startTime, now));
        vibratoOsc.start(this.clampTime(startTime, now));
        vibratoOsc.stop(this.clampTime(endTime, now));
      }

      gainNode.gain.setValueAtTime(0, this.clampTime(startTime, now));
      const attackGain = 0.4 * config.masterGain;
      gainNode.gain.linearRampToValueAtTime(attackGain, this.clampTime(startTime + config.attack, now));
      gainNode.gain.linearRampToValueAtTime(config.sustain * config.masterGain, this.clampTime(startTime + config.attack + config.decay, now));
      gainNode.gain.setValueAtTime(config.sustain * config.masterGain, this.clampTime(endTime - config.release, now));
      gainNode.gain.linearRampToValueAtTime(0, this.clampTime(endTime, now));

      oscillator.start(this.clampTime(startTime, now));
      oscillator.stop(this.clampTime(endTime, now));

      const sound: InstrumentSound = {
        oscillator,
        gainNode,
        filterNode
      };

      return sound;
    } catch (error) {
      console.warn('Failed to create audio nodes:', error);
      return null;
    }
  }

  private cleanupSound(sound: InstrumentSound, harmonics: OscillatorNode[]) {
    try {
      sound.oscillator.disconnect();
      sound.gainNode.disconnect();
      if (sound.filterNode) sound.filterNode.disconnect();
      if (sound.delayNode) sound.delayNode.disconnect();
      if (sound.reverbNode) sound.reverbNode.disconnect();
      harmonics.forEach(harmonic => {
        try {
          harmonic.disconnect();
        } catch {
          // Ignore cleanup errors
        }
      });
    } catch {
      // Ignore cleanup errors
    }
  }

  getInstrumentInfo(instrumentId: string) {
    const instruments = {
      piano: {
        id: 'piano',
        name: 'Piano',
        category: 'classical' as const,
        description: 'Classical grand piano with rich harmonics',
        icon: '🎹',
        color: '#ff6b6b',
        timbre: 'bright' as const,
        complexity: 'medium' as const,
        accessibilityFeatures: ['clear', 'familiar', 'predictable']
      },
      violin: {
        id: 'violin',
        name: 'Violin',
        category: 'classical' as const,
        description: 'Smooth, expressive string instrument',
        icon: '🎻',
        color: '#4ecdc4',
        timbre: 'warm' as const,
        complexity: 'medium' as const,
        accessibilityFeatures: ['smooth', 'expressive', 'clear']
      },
      flute: {
        id: 'flute',
        name: 'Flute',
        category: 'classical' as const,
        description: 'Gentle, airy woodwind sound',
        icon: '🎼',
        color: '#45b7d1',
        timbre: 'mellow' as const,
        complexity: 'simple' as const,
        accessibilityFeatures: ['gentle', 'calming', 'clear']
      }
    };
    return instruments[instrumentId as keyof typeof instruments];
  }

  getAllClassicalInstruments() {
    return [
      this.getInstrumentInfo('piano'),
      this.getInstrumentInfo('violin'),
      this.getInstrumentInfo('flute')
    ].filter(Boolean);
  }
}
