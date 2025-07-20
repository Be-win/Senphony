// Main application controller for Sensory Sketchpad

class SensorySketchpad {
    constructor() {
        this.canvas = null;
        this.audioManager = null;
        this.achievementManager = null;
        this.isPlaying = false;
        this.currentPlaybackAnimation = null;
        
        // Default music lines
        this.defaultPatterns = {
            'ascending': {
                name: 'Ascending Melody',
                description: 'A gentle rising melody',
                icon: '↗️',
                data: this.generateAscendingPattern()
            },
            'descending': {
                name: 'Descending Melody', 
                description: 'A peaceful falling melody',
                icon: '↘️',
                data: this.generateDescendingPattern()
            },
            'wave': {
                name: 'Ocean Wave',
                description: 'A flowing wave pattern',
                icon: '🌊',
                data: this.generateWavePattern()
            },
            'mountain': {
                name: 'Mountain Peak',
                description: 'A dramatic mountain shape',
                icon: '⛰️',
                data: this.generateMountainPattern()
            },
            'spiral': {
                name: 'Spiral Dance',
                description: 'A swirling spiral pattern',
                icon: '🌀',
                data: this.generateSpiralPattern()
            }
        };
        
        this.init();
    }

    // Generate predefined patterns
    generateAscendingPattern() {
        const data = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        
        for (let x = 50; x < canvasWidth - 50; x += 20) {
            const y = canvasHeight - 100 - (x - 50) * 0.3;
            data.push({ x, y, color: '#ff0080', note: 'C' });
            data.push({ x: x + 5, y: y - 10, color: '#00ff80', note: 'D' });
            data.push({ x: x + 10, y: y - 20, color: '#8000ff', note: 'E' });
        }
        return data;
    }

    generateDescendingPattern() {
        const data = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        
        for (let x = 50; x < canvasWidth - 50; x += 20) {
            const y = 100 + (x - 50) * 0.3;
            data.push({ x, y, color: '#ffff00', note: 'C2' });
            data.push({ x: x + 5, y: y + 10, color: '#00ffff', note: 'A' });
            data.push({ x: x + 10, y: y + 20, color: '#ff8000', note: 'G' });
        }
        return data;
    }

    generateWavePattern() {
        const data = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        const centerY = canvasHeight / 2;
        
        for (let x = 50; x < canvasWidth - 50; x += 15) {
            const waveY = centerY + Math.sin((x - 50) * 0.02) * 80;
            const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff', '#ffff00'];
            const notes = ['C', 'D', 'E', 'G', 'A', 'C2'];
            const colorIndex = Math.floor((x - 50) / 50) % colors.length;
            
            data.push({ 
                x, 
                y: waveY, 
                color: colors[colorIndex], 
                note: notes[colorIndex] 
            });
        }
        return data;
    }

    generateMountainPattern() {
        const data = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        
        // Left slope
        for (let x = 50; x < canvasWidth / 2; x += 15) {
            const y = canvasHeight - 100 - (x - 50) * 0.8;
            data.push({ x, y, color: '#00ff80', note: 'D' });
        }
        
        // Right slope
        for (let x = canvasWidth / 2; x < canvasWidth - 50; x += 15) {
            const y = canvasHeight - 100 - (canvasWidth - 50 - x) * 0.8;
            data.push({ x, y, color: '#8000ff', note: 'E' });
        }
        
        // Peak
        for (let x = canvasWidth / 2 - 20; x < canvasWidth / 2 + 20; x += 10) {
            const y = canvasHeight - 100;
            data.push({ x, y, color: '#ffff00', note: 'C2' });
        }
        
        return data;
    }

    generateSpiralPattern() {
        const data = [];
        const canvasWidth = 800;
        const canvasHeight = 600;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        for (let angle = 0; angle < Math.PI * 6; angle += 0.2) {
            const radius = 20 + angle * 15;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            if (x > 50 && x < canvasWidth - 50 && y > 50 && y < canvasHeight - 50) {
                const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff', '#ffff00'];
                const notes = ['C', 'D', 'E', 'G', 'A', 'C2'];
                const colorIndex = Math.floor(angle / (Math.PI / 3)) % colors.length;
                
                data.push({ 
                    x, 
                    y, 
                    color: colors[colorIndex], 
                    note: notes[colorIndex] 
                });
            }
        }
        return data;
    }

    async init() {
        console.log('Initializing Sensory Sketchpad...');
        
        // Initialize audio system
        this.audioManager = new AudioManager();
        await this.audioManager.initialize();
        
        // Initialize achievement system
        this.achievementManager = new AchievementManager();
        this.achievementManager.setCallbacks({
            onAchievementUnlocked: (achievement) => {
                this.audioManager.playAchievementSound();
            }
        });
        
        // Initialize canvas
        const canvasElement = document.getElementById('drawingCanvas');
        console.log('Canvas element found:', canvasElement);
        
        if (canvasElement) {
            try {
                this.canvas = new CanvasManager(canvasElement);
                console.log('Canvas manager created:', this.canvas);
                
                this.canvas.setCallbacks({
                    onStrokeStart: (data) => {
                        this.handleStrokeStart(data);
                    },
                    onStrokeEnd: (data) => {
                        this.handleStrokeEnd(data);
                    },
                    onColorChange: (data) => {
                        this.handleColorChange(data);
                    }
                });
            } catch (error) {
                console.error('Error creating canvas manager:', error);
            }
        } else {
            console.error('Canvas element not found!');
        }
        
        // Setup UI event listeners
        this.setupEventListeners();
        
        // Initialize UI state
        this.updateUI();
        
        console.log('Sensory Sketchpad initialized successfully!');
    }

    setupEventListeners() {
        // Color palette
        const colorButtons = document.querySelectorAll('.color-btn');
        colorButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.selectColor(button);
            });
            
            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectColor(button);
                }
            });
        });

        // Brush controls
        const smoothBrush = document.getElementById('smoothBrush');
        const sparkleBrush = document.getElementById('sparkleBrush');
        
        if (smoothBrush) {
            smoothBrush.addEventListener('click', () => {
                this.selectBrush('smooth');
                this.audioManager.playButtonSound();
            });
        }
        
        if (sparkleBrush) {
            sparkleBrush.addEventListener('click', () => {
                this.selectBrush('sparkle');
                this.audioManager.playButtonSound();
            });
        }

        // Brush size control
        const brushSizeSlider = document.getElementById('brushSize');
        if (brushSizeSlider) {
            brushSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.canvas.setBrushSize(size);
            });
        }

        // Volume control
        const volumeSlider = document.getElementById('volumeSlider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const volume = parseInt(e.target.value) / 100;
                this.audioManager.setVolume(volume);
            });
        }

        // Play button
        const playButton = document.getElementById('playButton');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.togglePlayback();
            });
        }

        // Clear button
        const clearButton = document.getElementById('clearButton');
        console.log('Clear button found:', clearButton);
        
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                console.log('Clear button clicked!');
                e.preventDefault();
                this.confirmClearCanvas();
            });
            
            // Also add a simple test click
            clearButton.addEventListener('click', () => {
                console.log('Clear button event fired');
            });
        } else {
            console.error('Clear button not found!');
        }

        // Default pattern buttons
        const patternButtons = document.querySelectorAll('.pattern-btn');
        patternButtons.forEach(button => {
            button.addEventListener('click', () => {
                const patternId = button.dataset.pattern;
                this.loadDefaultPattern(patternId);
            });
            
            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const patternId = button.dataset.pattern;
                    this.loadDefaultPattern(patternId);
                }
            });
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Prevent default behavior for app shortcuts
            if (this.handleGlobalKeyboard(e)) {
                e.preventDefault();
            }
        });

        // Handle audio context resume on user interaction
        document.addEventListener('click', () => {
            this.audioManager.resumeContext();
        }, { once: true });

        document.addEventListener('touchstart', () => {
            this.audioManager.resumeContext();
        }, { once: true });
    }

    loadDefaultPattern(patternId) {
        const pattern = this.defaultPatterns[patternId];
        if (!pattern) return;

        // Clear current canvas
        this.canvas.clearCanvas();
        
        // Load the pattern data
        this.canvas.loadDrawingData(pattern.data);
        
        // Play a preview sound
        this.audioManager.playButtonSound();
        
        // Show message
        this.showMessage(`Loaded ${pattern.name}: ${pattern.description}`);
        
        // Announce to screen reader
        Utils.announceToScreenReader(`Loaded ${pattern.name} pattern`);
        
        // Haptic feedback
        Utils.vibrate([50, 100, 50]);
        
        // Update UI
        this.updateUI();
    }

    selectColor(button) {
        // Remove active class from all buttons
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to selected button
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');
        
        // Get color and note data
        const color = button.dataset.color;
        const note = button.dataset.note;
        
        // Update canvas
        this.canvas.setColor(color, note);
        
        // Play audio feedback
        this.audioManager.playColorSelectionSound(note);
        
        // Haptic feedback
        Utils.vibrate([30]);
        
        // Announce to screen reader
        Utils.announceToScreenReader(`Selected ${note} note, ${this.getColorName(color)} color`);
    }

    selectBrush(brushType) {
        // Update brush buttons
        document.querySelectorAll('.btn-tool').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        const selectedButton = document.getElementById(`${brushType}Brush`);
        if (selectedButton) {
            selectedButton.classList.add('active');
            selectedButton.setAttribute('aria-pressed', 'true');
        }
        
        // Update canvas
        this.canvas.setBrushType(brushType);
        
        // Announce to screen reader
        Utils.announceToScreenReader(`Selected ${brushType} brush`);
    }

    handleStrokeStart(data) {
        // Record achievement progress
        this.achievementManager.recordProgress('stroke', {
            color: data.color,
            note: data.note
        });
        
        // Play drawing feedback sound
        this.audioManager.playDrawingFeedback(data.note, 0.5);
    }

    handleStrokeEnd(data) {
        // Additional feedback for stroke completion
        if (data.totalPoints > 10) {
            this.audioManager.playButtonSound();
        }
    }

    handleColorChange(data) {
        // Handle color change events
        console.log('Color changed:', data);
    }

    async togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            await this.startPlayback();
        }
    }

    async startPlayback() {
        if (!this.canvas.hasDrawing()) {
            this.showMessage('Draw something first to play music!');
            return;
        }

        this.isPlaying = true;
        this.updatePlayButton();

        // Get drawing data and play music
        const drawingData = this.canvas.getDrawingData();
        const canvasWidth = this.canvas.canvas.width;
        const canvasHeight = this.canvas.canvas.height;

        // Record achievement progress
        this.achievementManager.recordProgress('playback');

        // Play the music
        const duration = this.audioManager.playCanvasMusic(drawingData, canvasWidth, canvasHeight, 3);

        // Animate playhead
        this.animatePlayback(duration);

        // Announce to screen reader
        Utils.announceToScreenReader('Playing your musical creation!');
    }

    animatePlayback(duration) {
        const playhead = document.getElementById('playhead');
        if (!playhead) return;

        playhead.classList.add('active');
        playhead.style.animationDuration = `${duration}s`;

        this.currentPlaybackAnimation = setTimeout(() => {
            this.stopPlayback();
        }, duration * 1000);
    }

    stopPlayback() {
        this.isPlaying = false;
        this.updatePlayButton();

        // Stop audio
        this.audioManager.stopAllNotes();

        // Stop playhead animation
        const playhead = document.getElementById('playhead');
        if (playhead) {
            playhead.classList.remove('active');
        }

        if (this.currentPlaybackAnimation) {
            clearTimeout(this.currentPlaybackAnimation);
            this.currentPlaybackAnimation = null;
        }

        // Announce to screen reader
        Utils.announceToScreenReader('Playback stopped');
    }

    confirmClearCanvas() {
        console.log('confirmClearCanvas called');
        console.log('Canvas instance:', this.canvas);
        console.log('Has drawing:', this.canvas ? this.canvas.hasDrawing() : 'No canvas');
        
        if (this.canvas && this.canvas.hasDrawing()) {
            if (confirm('Are you sure you want to clear the canvas? This will erase your musical drawing.')) {
                this.clearCanvas();
            }
        } else {
            this.showMessage('Canvas is already empty!');
        }
    }

    clearCanvas() {
        console.log('clearCanvas called');
        
        if (!this.canvas) {
            console.error('Canvas not initialized!');
            this.showMessage('Error: Canvas not initialized');
            return;
        }
        
        try {
            this.canvas.clearCanvas();
            
            // Record achievement progress
            this.achievementManager.recordProgress('clear');
            
            // Update UI
            this.updateUI();
            
            // Show message
            this.showMessage('Canvas cleared! Start a new musical journey!');
            
            // Announce to screen reader
            Utils.announceToScreenReader('Canvas cleared');
            
            // Haptic feedback
            Utils.vibrate([100, 50, 100]);
            
            console.log('Canvas cleared successfully');
        } catch (error) {
            console.error('Error clearing canvas:', error);
            this.showMessage('Error clearing canvas');
        }
    }

    updatePlayButton() {
        const playButton = document.getElementById('playButton');
        if (playButton) {
            if (this.isPlaying) {
                playButton.innerHTML = '⏸️ Pause Song';
                playButton.setAttribute('aria-label', 'Pause your musical drawing');
            } else {
                playButton.innerHTML = '▶️ Play My Song';
                playButton.setAttribute('aria-label', 'Play your musical drawing');
            }
        }
    }

    updateUI() {
        this.updatePlayButton();
        
        // Update other UI elements as needed
        const hasDrawing = this.canvas ? this.canvas.hasDrawing() : false;
        
        // Update clear button state - don't disable, just update the label
        const clearButton = document.getElementById('clearButton');
        if (clearButton) {
            // Remove disabled state - always allow clicking
            clearButton.disabled = false;
            clearButton.setAttribute('aria-label', hasDrawing ? 'Clear the canvas' : 'Canvas is empty');
        }
    }

    showMessage(message) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.add('show');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 3000);
    }

    getColorName(hex) {
        const colorNames = {
            '#ff0080': 'pink',
            '#00ff80': 'green',
            '#8000ff': 'purple',
            '#ff8000': 'orange',
            '#00ffff': 'cyan',
            '#ffff00': 'yellow'
        };
        return colorNames[hex] || 'unknown';
    }

    handleGlobalKeyboard(event) {
        // Keyboard shortcuts
        switch (event.key) {
            case ' ': // Spacebar
                if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                    event.preventDefault();
                    this.togglePlayback();
                }
                return true;
                
            case 'c':
            case 'C':
                if (!event.ctrlKey && !event.altKey) {
                    event.preventDefault();
                    this.confirmClearCanvas();
                }
                return true;
                
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
                if (!event.ctrlKey && !event.altKey) {
                    const colorIndex = parseInt(event.key) - 1;
                    const colorButtons = document.querySelectorAll('.color-btn');
                    if (colorButtons[colorIndex]) {
                        this.selectColor(colorButtons[colorIndex]);
                    }
                }
                return true;
        }
        return false;
    }

    getAppState() {
        return {
            isPlaying: this.isPlaying,
            hasDrawing: this.canvas ? this.canvas.hasDrawing() : false,
            currentColor: this.canvas ? this.canvas.currentColor : null,
            currentNote: this.canvas ? this.canvas.currentNote : null,
            brushType: this.canvas ? this.canvas.brushType : null,
            brushSize: this.canvas ? this.canvas.brushSize : null
        };
    }

    destroy() {
        // Clean up resources
        if (this.audioManager) {
            this.audioManager.destroy();
        }
        
        if (this.canvas) {
            this.canvas.destroy();
        }
        
        if (this.currentPlaybackAnimation) {
            clearTimeout(this.currentPlaybackAnimation);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sensorySketchpad = new SensorySketchpad();
});

// Handle page visibility for audio context
document.addEventListener('visibilitychange', () => {
    if (window.sensorySketchpad && window.sensorySketchpad.audioManager) {
        if (document.visibilityState === 'visible') {
            window.sensorySketchpad.audioManager.resumeContext();
        }
    }
});

// Export for external access
window.SensorySketchpad = SensorySketchpad;