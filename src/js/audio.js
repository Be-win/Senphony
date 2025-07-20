// Audio system for Sensory Sketchpad using Web Audio API

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.isInitialized = false;
        this.volume = 0.7;
        
        // Musical note frequencies (pentatonic scale)
        this.noteFrequencies = {
            'C': 261.63,
            'D': 293.66,
            'E': 329.63,
            'G': 392.00,
            'A': 440.00,
            'C2': 523.25  // Higher octave C
        };
        
        this.activeOscillators = new Map();
        this.scheduledNotes = [];
    }

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create main gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
            
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

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
        }
    }

    playNote(note, duration = 0.3, delay = 0) {
        if (!this.isInitialized || !this.noteFrequencies[note]) {
            return;
        }

        this.resumeContext();

        const startTime = this.audioContext.currentTime + delay;
        const endTime = startTime + duration;

        // Create oscillator for the note
        const oscillator = this.audioContext.createOscillator();
        const noteGain = this.audioContext.createGain();
        
        // Set up the audio graph
        oscillator.connect(noteGain);
        noteGain.connect(this.gainNode);
        
        // Configure oscillator
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(this.noteFrequencies[note], startTime);
        
        // Add some harmonics for richer sound
        const harmonic = this.audioContext.createOscillator();
        const harmonicGain = this.audioContext.createGain();
        harmonic.connect(harmonicGain);
        harmonicGain.connect(this.gainNode);
        
        harmonic.type = 'triangle';
        harmonic.frequency.setValueAtTime(this.noteFrequencies[note] * 2, startTime);
        harmonicGain.gain.setValueAtTime(0.1, startTime);
        
        // Envelope (ADSR)
        noteGain.gain.setValueAtTime(0, startTime);
        noteGain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
        noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);  // Decay
        noteGain.gain.setValueAtTime(0.2, endTime - 0.1);             // Sustain
        noteGain.gain.linearRampToValueAtTime(0, endTime);            // Release
        
        // Start and stop
        oscillator.start(startTime);
        harmonic.start(startTime);
        oscillator.stop(endTime);
        harmonic.stop(endTime);
        
        // Clean up
        oscillator.onended = () => {
            try {
                oscillator.disconnect();
                noteGain.disconnect();
                harmonic.disconnect();
                harmonicGain.disconnect();
            } catch (e) {
                // Nodes already disconnected
            }
        };
        
        return {
            oscillator,
            harmonic,
            startTime,
            endTime
        };
    }

    playChord(notes, duration = 0.5, delay = 0) {
        const notePromises = notes.map(note => this.playNote(note, duration, delay));
        return Promise.all(notePromises);
    }

    playMelody(notes, noteDuration = 0.3, gap = 0.1) {
        notes.forEach((note, index) => {
            const delay = index * (noteDuration + gap);
            this.playNote(note, noteDuration, delay);
        });
    }

    // Play notes based on canvas drawing data
    playCanvasMusic(drawingData, canvasWidth, canvasHeight, playbackDuration = 3) {
        if (!this.isInitialized || !drawingData.length) {
            return;
        }

        this.stopAllNotes();
        this.scheduledNotes = [];

        const notes = Object.keys(this.noteFrequencies);
        const timeStep = playbackDuration / canvasWidth;
        
        // Group drawing data by x position
        const drawingMap = new Map();
        
        drawingData.forEach(point => {
            const x = Math.floor(point.x);
            if (!drawingMap.has(x)) {
                drawingMap.set(x, []);
            }
            drawingMap.get(x).push(point);
        });

        // Schedule notes based on drawing
        for (let x = 0; x < canvasWidth; x += 10) { // Sample every 10 pixels
            const points = drawingMap.get(x);
            if (points) {
                // Find the average Y position for this X
                const avgY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
                
                // Convert Y position to note (top = higher pitch)
                const noteIndex = Math.floor((1 - avgY / canvasHeight) * notes.length);
                const note = notes[Math.max(0, Math.min(notes.length - 1, noteIndex))];
                
                const delay = (x / canvasWidth) * playbackDuration;
                const duration = Math.min(0.2, timeStep * 15);
                
                this.scheduledNotes.push({
                    note,
                    delay,
                    duration,
                    x,
                    y: avgY
                });
                
                this.playNote(note, duration, delay);
            }
        }

        return playbackDuration;
    }

    stopAllNotes() {
        this.activeOscillators.forEach(oscillator => {
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
    playDrawingFeedback(note, intensity = 1) {
        if (!this.isInitialized) return;
        
        const duration = 0.1;
        const volume = Math.min(intensity * 0.3, 0.3);
        
        this.resumeContext();
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(this.noteFrequencies[note], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
        
        oscillator.onended = () => {
            try {
                oscillator.disconnect();
                gainNode.disconnect();
            } catch (e) {
                // Already disconnected
            }
        };
    }

    // Play success sound for achievements
    playAchievementSound() {
        if (!this.isInitialized) return;
        
        const melody = ['C', 'E', 'G', 'C2'];
        this.playMelody(melody, 0.2, 0.05);
    }

    // Play button click feedback
    playButtonSound() {
        if (!this.isInitialized) return;
        
        this.playNote('A', 0.1);
    }

    // Play color selection feedback
    playColorSelectionSound(note) {
        if (!this.isInitialized) return;
        
        this.playNote(note, 0.15);
    }

    destroy() {
        this.stopAllNotes();
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.isInitialized = false;
    }
}

// Export for use in other modules
window.AudioManager = AudioManager;