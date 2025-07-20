// Canvas drawing functionality for Sensory Sketchpad

class CanvasManager {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        // Add willReadFrequently attribute to optimize for frequent getImageData calls
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.isDrawing = false;
        this.currentColor = '#ff0080';
        this.currentNote = 'C';
        this.brushSize = 10;
        this.brushType = 'smooth';
        this.lastPoint = null;
        
        // Drawing data for playback
        this.drawingData = [];
        this.currentStroke = [];
        
        // Sparkle brush particles
        this.particles = [];
        this.lastParticleTime = 0;
        
        // Animation
        this.animationFrame = null;
        this.lastFrameTime = 0;
        
        // Callbacks
        this.callbacks = {
            onStrokeStart: null,
            onStrokeEnd: null,
            onColorChange: null
        };

        this.setupCanvas();
        this.bindEvents();
        this.startAnimation();
    }

    setupCanvas() {
        // Set canvas size based on container
        this.resizeCanvas();
        
        // Set up drawing context
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Handle device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
    }

    resizeCanvas() {
        // Save current drawing
        const imageData = this.canvas.width > 0 && this.canvas.height > 0 
            ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
            : null;
        
        // Resize
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const maxWidth = Math.max(1, Math.min(800, rect.width - 32));
        const maxHeight = Math.max(1, Math.min(600, window.innerHeight * 0.6));
        
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;
        this.canvas.style.width = maxWidth + 'px';
        this.canvas.style.height = maxHeight + 'px';
        
        // Restore drawing
        if (imageData) {
            this.ctx.putImageData(imageData, 0, 0);
        }
        
        // Reapply context settings
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.handlePointerDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handlePointerMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handlePointerUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handlePointerUp.bind(this));

        // Touch events
        this.canvas.addEventListener('touchstart', this.handlePointerDown.bind(this));
        this.canvas.addEventListener('touchmove', this.handlePointerMove.bind(this));
        this.canvas.addEventListener('touchend', this.handlePointerUp.bind(this));
        this.canvas.addEventListener('touchcancel', this.handlePointerUp.bind(this));

        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', e => e.preventDefault());
        this.canvas.addEventListener('touchmove', e => e.preventDefault());
        
        // Window resize
        window.addEventListener('resize', Utils.debounce(() => {
            this.resizeCanvas();
        }, 250));

        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    handlePointerDown(event) {
        event.preventDefault();
        
        const point = Utils.getPointerPosition(event, this.canvas);
        this.isDrawing = true;
        this.lastPoint = point;
        this.currentStroke = [];
        
        // Add point to current stroke
        this.addPointToStroke(point);
        
        // Start drawing
        this.ctx.beginPath();
        this.ctx.moveTo(point.x, point.y);
        
        // Callback for stroke start
        if (this.callbacks.onStrokeStart) {
            this.callbacks.onStrokeStart({
                point,
                color: this.currentColor,
                note: this.currentNote,
                brushSize: this.brushSize,
                brushType: this.brushType
            });
        }

        // Hide instructions if visible
        const instructions = document.getElementById('instructions');
        if (instructions && !instructions.classList.contains('hidden')) {
            instructions.classList.add('hidden');
        }

        // Haptic feedback
        Utils.vibrate([20]);
    }

    handlePointerMove(event) {
        if (!this.isDrawing) return;
        
        event.preventDefault();
        
        const point = Utils.getPointerPosition(event, this.canvas);
        
        if (this.lastPoint) {
            this.drawLine(this.lastPoint, point);
            this.addPointToStroke(point);
            
            // Add sparkle particles for sparkle brush
            if (this.brushType === 'sparkle') {
                this.addSparkleParticles(point);
            }
        }
        
        this.lastPoint = point;
    }

    handlePointerUp(event) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.lastPoint = null;
        
        // Finalize current stroke
        if (this.currentStroke.length > 0) {
            this.drawingData.push(...this.currentStroke);
            
            // Callback for stroke end
            if (this.callbacks.onStrokeEnd) {
                this.callbacks.onStrokeEnd({
                    stroke: this.currentStroke,
                    totalPoints: this.drawingData.length
                });
            }
        }
        
        this.currentStroke = [];
    }

    handleKeyDown(event) {
        // Keyboard shortcuts for accessibility
        switch (event.key) {
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
                        colorButtons[colorIndex].click();
                    }
                }
                break;
            case 'c':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.clearCanvas();
                }
                break;
            case ' ':
                if (event.target === document.body) {
                    event.preventDefault();
                    const playButton = document.getElementById('playButton');
                    if (playButton) {
                        playButton.click();
                    }
                }
                break;
        }
    }

    drawLine(from, to) {
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
        
        if (this.brushType === 'smooth') {
            // Smooth brush with quadratic curves
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            
            const midPoint = {
                x: (from.x + to.x) / 2,
                y: (from.y + to.y) / 2
            };
            
            this.ctx.quadraticCurveTo(from.x, from.y, midPoint.x, midPoint.y);
            this.ctx.stroke();
        } else if (this.brushType === 'sparkle') {
            // Lighter stroke for sparkle brush
            this.ctx.globalAlpha = 0.6;
            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
            this.ctx.globalAlpha = 1.0;
        }
    }

    addPointToStroke(point) {
        this.currentStroke.push({
            x: point.x,
            y: point.y,
            color: this.currentColor,
            note: this.currentNote,
            brushSize: this.brushSize,
            brushType: this.brushType,
            timestamp: Date.now()
        });
    }

    addSparkleParticles(point) {
        const currentTime = Date.now();
        if (currentTime - this.lastParticleTime > 50) { // Throttle particle creation
            for (let i = 0; i < 3; i++) {
                this.particles.push(Utils.createSparkleParticle(
                    point.x + Utils.randomRange(-5, 5),
                    point.y + Utils.randomRange(-5, 5),
                    this.currentColor
                ));
            }
            this.lastParticleTime = currentTime;
        }
    }

    startAnimation() {
        const animate = (currentTime) => {
            const deltaTime = (currentTime - this.lastFrameTime) / 1000;
            this.lastFrameTime = currentTime;
            
            // Update and draw particles
            if (this.particles.length > 0) {
                this.updateParticles(deltaTime);
            }
            
            this.animationFrame = requestAnimationFrame(animate);
        };
        
        this.animationFrame = requestAnimationFrame(animate);
    }

    updateParticles(deltaTime) {
        // Update particles
        this.particles = this.particles.filter(particle => 
            Utils.updateSparkleParticle(particle, deltaTime)
        );
        
        // Draw particles
        this.particles.forEach(particle => {
            Utils.drawSparkleParticle(this.ctx, particle);
        });
    }

    setColor(color, note) {
        this.currentColor = color;
        this.currentNote = note;
        
        if (this.callbacks.onColorChange) {
            this.callbacks.onColorChange({ color, note });
        }
    }

    setBrushSize(size) {
        this.brushSize = Math.max(1, Math.min(50, size));
    }

    setBrushType(type) {
        this.brushType = type;
    }

    clearCanvas() {
        console.log('CanvasManager.clearCanvas() called');
        console.log('Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
        
        try {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawingData = [];
            this.currentStroke = [];
            this.particles = [];
            
            // Show instructions again
            const instructions = document.getElementById('instructions');
            if (instructions) {
                instructions.classList.remove('hidden');
            }
            
            console.log('Canvas cleared successfully');
        } catch (error) {
            console.error('Error in clearCanvas:', error);
        }
    }

    getDrawingData() {
        return [...this.drawingData];
    }

    hasDrawing() {
        return this.drawingData.length > 0;
    }

    // Playback visualization
    highlightDrawingAtPosition(x, tolerance = 10) {
        // Find all points near the playhead position
        const nearbyPoints = this.drawingData.filter(point => 
            Math.abs(point.x - x) <= tolerance
        );
        
        if (nearbyPoints.length > 0) {
            // Draw highlight effects
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.globalAlpha = 0.8;
            
            nearbyPoints.forEach(point => {
                this.ctx.fillStyle = point.color;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, point.brushSize + 5, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add glow effect
                this.ctx.shadowColor = point.color;
                this.ctx.shadowBlur = 15;
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, point.brushSize, 0, Math.PI * 2);
                this.ctx.fill();
            });
            
            this.ctx.restore();
        }
        
        return nearbyPoints;
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Remove event listeners
        window.removeEventListener('resize', this.resizeCanvas);
        document.removeEventListener('keydown', this.handleKeyDown);
    }

    loadDrawingData(data) {
        // Clear current drawing data
        this.drawingData = [];
        
        // Load the new data
        this.drawingData = [...data];
        
        // Redraw the canvas
        this.redrawCanvas();
    }

    redrawCanvas() {
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all strokes
        let currentStroke = [];
        let currentColor = null;
        
        this.drawingData.forEach((point, index) => {
            if (currentColor !== point.color) {
                // Draw previous stroke if exists
                if (currentStroke.length > 1) {
                    this.drawStroke(currentStroke);
                }
                
                // Start new stroke
                currentStroke = [point];
                currentColor = point.color;
                this.ctx.strokeStyle = point.color;
            } else {
                currentStroke.push(point);
            }
        });
        
        // Draw final stroke
        if (currentStroke.length > 1) {
            this.drawStroke(currentStroke);
        }
    }

    drawStroke(points) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.stroke();
    }
}

// Export for use in other modules
window.CanvasManager = CanvasManager;