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
      filterFrequency: 4,
      attack: 0.01,
      decay: 0.2,
      sustain: 0.1,
      release: 0.3,
      harmonics: [
        { frequency: 2, gain: 0.3, type: 'sine' as OscillatorType },
        { frequency: 3, gain: 0.1, type: 'triangle' as OscillatorType }
      ],
      effects: { reverb: true }
    },
    violin: {
      oscillatorType: 'sawtooth' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterFrequency: 2,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.5,
      release: 0.3,
      harmonics: [
        { frequency: 2, gain: 0.2, type: 'sine' as OscillatorType }
      ],
      effects: { vibrato: false, reverb: true } // vibrato temporarily disabled
    },
    flute: {
      oscillatorType: 'sine' as OscillatorType,
      filterType: 'lowpass' as BiquadFilterType,
      filterFrequency: 3,
      attack: 0.01,
      decay: 0.05,
      sustain: 0.5,
      release: 0.3,
      harmonics: [
        { frequency: 2, gain: 0.1, type: 'sine' as OscillatorType }
      ],
      effects: { reverb: true }
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

  async playNote(note: string, duration = 0.3, delay = 0): Promise<InstrumentSound | null> {
    if (!this.audioContext || !this.masterGain) return null;
    
    // Resume context if suspended
    await this.resumeContext();
    
    const config = this.instrumentConfigs[this.currentInstrument as keyof typeof this.instrumentConfigs];
    if (!config) return null;
    const frequency = this.noteFrequencies[note as keyof typeof this.noteFrequencies];
    if (!frequency) return null;
    // Add a small buffer to startTime to ensure it's in the future
    const minStartTime = this.audioContext.currentTime + 0.01;
    const startTime = Math.max(minStartTime, this.audioContext.currentTime + delay);
    const endTime = startTime + duration;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filterNode = this.audioContext.createBiquadFilter();
    oscillator.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.masterGain);
    oscillator.type = config.oscillatorType;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    filterNode.type = config.filterType;
    filterNode.frequency.setValueAtTime(frequency * config.filterFrequency, startTime);
    const harmonics: OscillatorNode[] = [];
    config.harmonics.forEach((harmonic) => {
      const harmonicOsc = this.audioContext!.createOscillator();
      const harmonicGain = this.audioContext!.createGain();
      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(gainNode);
      harmonicOsc.type = harmonic.type;
      harmonicOsc.frequency.setValueAtTime(frequency * harmonic.frequency, startTime);
      harmonicGain.gain.setValueAtTime(harmonic.gain, startTime);
      harmonicOsc.start(startTime);
      harmonicOsc.stop(endTime);
      harmonics.push(harmonicOsc);
    });
    if (config.effects && 'vibrato' in config.effects && config.effects.vibrato) {
      console.log('Violin vibrato triggered', {note, startTime, endTime});
      const vibratoOsc = this.audioContext.createOscillator();
      const vibratoGain = this.audioContext.createGain();
      vibratoOsc.connect(vibratoGain);
      vibratoGain.connect(oscillator.frequency);
      vibratoOsc.type = 'sine';
      vibratoOsc.frequency.setValueAtTime(6, startTime);
      vibratoGain.gain.setValueAtTime(1, startTime); // Lowered from 2 to 1
      vibratoOsc.start(startTime);
      vibratoOsc.stop(endTime);
    }
    gainNode.gain.setValueAtTime(0, startTime);
    console.log('gainNode.gain at startTime', gainNode.gain.value, 'instrument', this.currentInstrument);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + config.attack);
    console.log('gainNode.gain after attack', gainNode.gain.value, 'instrument', this.currentInstrument);
    gainNode.gain.linearRampToValueAtTime(config.sustain, startTime + config.attack + config.decay);
    console.log('gainNode.gain after decay', gainNode.gain.value, 'instrument', this.currentInstrument);
    gainNode.gain.setValueAtTime(config.sustain, endTime - config.release);
    console.log('gainNode.gain at sustain', gainNode.gain.value, 'instrument', this.currentInstrument);
    gainNode.gain.linearRampToValueAtTime(0, endTime);
    console.log('gainNode.gain at end', gainNode.gain.value, 'instrument', this.currentInstrument);
    oscillator.start(startTime);
    oscillator.stop(endTime);
    const sound: InstrumentSound = {
      oscillator,
      gainNode,
      filterNode
    };
    oscillator.onended = () => {
      this.cleanupSound(sound, harmonics);
    };
    return sound;
  }

  private cleanupSound(sound: InstrumentSound, harmonics: OscillatorNode[]) {
    try {
      sound.oscillator.disconnect();
      sound.gainNode.disconnect();
      if (sound.filterNode) sound.filterNode.disconnect();
      if (sound.delayNode) sound.delayNode.disconnect();
      if (sound.reverbNode) sound.reverbNode.disconnect();
      harmonics.forEach(harmonic => {
        try { harmonic.disconnect(); } catch (e) {}
      });
    } catch (e) {}
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