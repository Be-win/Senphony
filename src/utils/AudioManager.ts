// Audio system for Sensory Sketchpad using Web Audio API

import { ClassicalInstruments } from './ClassicalInstruments';

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private volume = 0.7;
  private classicalInstruments: ClassicalInstruments;
  private currentInstrument = 'piano';
  
  // Musical note frequencies (pentatonic scale)
  private noteFrequencies = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'G': 392.00,
    'A': 440.00,
    'C2': 523.25  // Higher octave C
  };
  
  private activeOscillators = new Map();
  private scheduledNotes: any[] = [];

  constructor() {
    this.classicalInstruments = new ClassicalInstruments();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
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
    this.currentInstrument = instrumentId;
    this.classicalInstruments.setInstrument(instrumentId);
  }
  getCurrentInstrument() {
    return this.classicalInstruments.getInstrumentInfo(this.currentInstrument);
  }
  getAllClassicalInstruments() {
    return this.classicalInstruments.getAllClassicalInstruments();
  }

  async playNote(note: string, duration = 0.3, delay = 0) {
    if (!this.isInitialized || !this.audioContext || !this.gainNode) return;
    return await this.classicalInstruments.playNote(note, duration, delay);
  }

  playChord(notes: string[], duration = 0.5, delay = 0) {
    const notePromises = notes.map(note => this.playNote(note, duration, delay));
    return Promise.all(notePromises);
  }

  playMelody(notes: string[], noteDuration = 0.3, gap = 0.1) {
    notes.forEach((note, index) => {
      const delay = index * (noteDuration + gap);
      this.playNote(note, noteDuration, delay);
    });
  }

  // Play notes based on canvas drawing data
  async playCanvasMusic(drawingData: any[], canvasWidth: number, canvasHeight: number, playbackDuration = 3) {
    if (!this.isInitialized || !drawingData.length) {
      return 0;
    }

    this.stopAllNotes();
    this.scheduledNotes = [];

    // Sort drawingData by x
    const sorted = [...drawingData].sort((a, b) => a.x - b.x);

    // Group consecutive points with the same note and close X values
    let groups: any[][] = [];
    let currentGroup: any[] = [];
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
    this.activeOscillators.forEach((oscillator: any) => {
      try {
        oscillator.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeOscillators.clear();
    this.scheduledNotes = [];
  }

  // Create audio feedback for drawing actions
  async playDrawingFeedback(note: string, intensity = 1) {
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