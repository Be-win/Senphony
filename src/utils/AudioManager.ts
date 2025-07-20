// Audio system for Sensory Sketchpad using Web Audio API

import { ClassicalInstruments } from './ClassicalInstruments';

// Define types for better type safety
interface Point {
  x: number;
  y: number;
  note: string;
  color: string;
}

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private volume = 0.7;
  private classicalInstruments: ClassicalInstruments;

  private activeOscillators = new Map<string, OscillatorNode>();

  constructor() {
    this.classicalInstruments = new ClassicalInstruments();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Handle browser compatibility for AudioContext
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create main gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      
      await this.classicalInstruments.initialize(this.audioContext, this.gainNode);
      this.isInitialized = true;
      console.log('Audio system initialized successfully');
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
      this.isInitialized = false;
    }
  }

  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  setInstrument(instrumentId: string) {
    this.classicalInstruments.setInstrument(instrumentId);
  }

  // Play notes based on canvas drawing data
  async playCanvasMusic(drawingData: Point[], canvasWidth: number, _canvasHeight: number, playbackDuration = 3) {
    if (!this.isInitialized || !drawingData.length) {
      return 0;
    }

    this.stopAllNotes();

    // Sort drawingData by x
    const sorted = [...drawingData].sort((a, b) => a.x - b.x);

    // Group consecutive points with the same note and close X values
    const groups: Point[][] = [];
    let currentGroup: Point[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const point = sorted[i];
      if (
        currentGroup.length === 0 ||
        (Math.abs(point.x - currentGroup[currentGroup.length - 1].x) <= 10 &&
         point.note === currentGroup[currentGroup.length - 1].note)
      ) {
        currentGroup.push(point);
      } else {
        groups.push(currentGroup);
        currentGroup = [point];
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    // For each group, play a single note
    for (const group of groups) {
      const startX = group[0].x;
      const endX = group[group.length - 1].x;
      const note = group[0].note;
      const delay = (startX / canvasWidth) * playbackDuration;
      // Ensure minimum duration for very short lines
      const duration = Math.max(0.1, ((endX - startX) / canvasWidth) * playbackDuration);

      await this.classicalInstruments.playNote(note, duration, delay);
    }

    return playbackDuration;
  }

  stopAllNotes() {
    this.activeOscillators.forEach((oscillator: OscillatorNode) => {
      try {
        oscillator.stop();
      } catch {
        // Already stopped or never started
      }
    });
    this.activeOscillators.clear();
  }

  // Create audio feedback for drawing actions
  async playDrawingFeedback(note: string) {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) return;
    
    const duration = 0.1;
    
    this.resumeContext();
    
    // Use the classical instruments system for drawing feedback
    await this.classicalInstruments.playNote(note, duration, 0);
  }

  // Play success sound for achievements
  playAchievementSound() {
    if (!this.isInitialized) return;
    
    const melody = ['C', 'E', 'G', 'C2'];
    melody.forEach((note, index) => {
      const delay = index * 0.25; // 0.2 duration + 0.05 gap
      this.classicalInstruments.playNote(note, 0.2, delay);
    });
  }

  // Play button click feedback
  async playButtonSound() {
    if (!this.isInitialized) return;
    
    await this.classicalInstruments.playNote('A', 0.1);
  }

  // Play color selection feedback
  async playColorSelectionSound(note: string) {
    if (!this.isInitialized) return;
    
    await this.classicalInstruments.playNote(note, 0.15);
  }

  destroy() {
    this.stopAllNotes();
    if (this.audioContext) {
      this.audioContext.close();
    }
    this.isInitialized = false;
  }
}