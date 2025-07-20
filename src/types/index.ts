// Type definitions for Sensory Sketchpad

export interface Point {
  x: number;
  y: number;
  color: string;
  note: string;
  brushSize: number;
  brushType: string;
  timestamp: number;
}

export interface CanvasData {
  id: string;
  name: string;
  data: Point[];
  thumbnail: string;
  createdAt: number;
  duration: number;
}

export interface StackedCanvas extends CanvasData {
  stackOrder: number;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Notification {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface PlaybackState {
  isPlaying: boolean;
  currentCanvasIndex: number;
  totalCanvases: number;
  progress: number;
  currentCanvasId: string | null;
}

// --- Instrument Types for Classical Instruments System ---
export interface Instrument {
  id: string;
  name: string;
  category: 'classical' | 'world' | 'electronic' | 'nature' | 'accessible';
  description: string;
  icon: string;
  color: string;
  timbre: 'bright' | 'warm' | 'mellow' | 'sharp' | 'soft';
  complexity: 'simple' | 'medium' | 'complex';
  culturalOrigin?: string;
  accessibilityFeatures: string[];
}

export interface InstrumentSound {
  oscillator: OscillatorNode;
  gainNode: GainNode;
  filterNode?: BiquadFilterNode;
  delayNode?: DelayNode;
  reverbNode?: ConvolverNode;
}

export interface InstrumentConfig {
  oscillatorType: OscillatorType;
  filterType: BiquadFilterType;
  filterFrequency: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  harmonics: Array<{
    frequency: number;
    gain: number;
    type: OscillatorType;
  }>;
  effects: {
    vibrato?: boolean;
    reverb?: boolean;
    delay?: boolean;
  };
}