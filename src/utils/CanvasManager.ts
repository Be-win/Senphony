// Canvas drawing functionality for Sensory Sketchpad

interface Point {
  x: number;
  y: number;
  color: string;
  note: string;
  brushSize: number;
  brushType: string;
  timestamp: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

export class CanvasManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing = false;
  private currentColor = '#ff0080';
  private currentNote = 'C';
  private brushSize = 10;
  private brushType = 'smooth';
  private lastPoint: { x: number; y: number } | null = null;
  
  // Drawing data for playback
  private drawingData: Point[] = [];
  private currentStroke: Point[] = [];
  
  // Sparkle brush particles
  private particles: Particle[] = [];
  private lastParticleTime = 0;
  
  // Animation
  private animationFrame: number | null = null;
  private lastFrameTime = 0;
  
  // Callbacks
  private callbacks = {
    onStrokeStart: null as ((data: { point: { x: number; y: number }; color: string; note: string; brushSize: number; brushType: string }) => void) | null,
    onStrokeEnd: null as ((data: { stroke: Point[]; totalPoints: number }) => void) | null,
    onColorChange: null as ((data: { color: string; note: string }) => void) | null
  };

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    const context = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = context;

    this.setupCanvas();
    this.bindEvents();
    this.startAnimation();
  }

  private setupCanvas() {
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

  private resizeCanvas() {
    // Save current drawing
    const imageData = this.canvas.width > 0 && this.canvas.height > 0 
      ? this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
      : null;
    
    // Resize
    const container = this.canvas.parentElement;
    if (!container) return;
    
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

  private bindEvents() {
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
    window.addEventListener('resize', this.debounce(() => {
      this.resizeCanvas();
    }, 250));
  }

  private debounce(func: (...args: unknown[]) => void, wait: number) {
    let timeout: number;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  private getPointerPosition(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX: number, clientY: number;
    
    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = (event as MouseEvent).clientX;
      clientY = (event as MouseEvent).clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  private handlePointerDown(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    
    const point = this.getPointerPosition(event);
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
    this.vibrate([20]);
  }

  private handlePointerMove(event: MouseEvent | TouchEvent) {
    if (!this.isDrawing) return;
    
    event.preventDefault();
    
    const point = this.getPointerPosition(event);
    
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

  private handlePointerUp() {
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

  private drawLine(from: { x: number; y: number }, to: { x: number; y: number }) {
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

  private addPointToStroke(point: { x: number; y: number }) {
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

  private addSparkleParticles(point: { x: number; y: number }) {
    const currentTime = Date.now();
    if (currentTime - this.lastParticleTime > 50) { // Throttle particle creation
      for (let i = 0; i < 3; i++) {
        this.particles.push(this.createSparkleParticle(
          point.x + this.randomRange(-5, 5),
          point.y + this.randomRange(-5, 5),
          this.currentColor
        ));
      }
      this.lastParticleTime = currentTime;
    }
  }

  private createSparkleParticle(x: number, y: number, color: string): Particle {
    return {
      x,
      y,
      vx: this.randomRange(-2, 2),
      vy: this.randomRange(-2, 2),
      life: 1.0,
      maxLife: this.randomRange(0.5, 1.0),
      size: this.randomRange(2, 6),
      color,
      rotation: 0,
      rotationSpeed: this.randomRange(-10, 10)
    };
  }

  private randomRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private startAnimation() {
    const animate = (currentTime: number) => {
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

  private updateParticles(deltaTime: number) {
    // Update particles
    this.particles = this.particles.filter(particle => 
      this.updateSparkleParticle(particle, deltaTime)
    );
    
    // Draw particles
    this.particles.forEach(particle => {
      this.drawSparkleParticle(particle);
    });
  }

  private updateSparkleParticle(particle: Particle, deltaTime: number): boolean {
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life -= deltaTime * 2;
    particle.rotation += particle.rotationSpeed;
    
    // Fade out
    particle.vy += 0.1; // gravity
    
    return particle.life > 0;
  }

  private drawSparkleParticle(particle: Particle) {
    this.ctx.save();
    
    const alpha = Math.max(0, particle.life / particle.maxLife);
    const size = particle.size * alpha;
    
    this.ctx.globalAlpha = alpha;
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(particle.rotation * Math.PI / 180);
    
    // Draw sparkle as a 4-pointed star
    this.ctx.fillStyle = particle.color;
    this.ctx.beginPath();
    
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x = Math.cos(angle) * size;
      const y = Math.sin(angle) * size;
      
      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
      
      // Add inner points
      const innerAngle = angle + Math.PI / 4;
      const innerX = Math.cos(innerAngle) * size * 0.4;
      const innerY = Math.sin(innerAngle) * size * 0.4;
      this.ctx.lineTo(innerX, innerY);
    }
    
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  private vibrate(pattern: number[] = [50]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  setColor(color: string, note: string) {
    this.currentColor = color;
    this.currentNote = note;
    
    if (this.callbacks.onColorChange) {
      this.callbacks.onColorChange({ color, note });
    }
  }

  setBrushSize(size: number) {
    this.brushSize = Math.max(1, Math.min(50, size));
  }

  setBrushType(type: string) {
    this.brushType = type;
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawingData = [];
    this.currentStroke = [];
    this.particles = [];
    
    // Show instructions again
    const instructions = document.getElementById('instructions');
    if (instructions) {
      instructions.classList.remove('hidden');
    }
  }

  // Get drawing data for external use (used by useSensorySketchpad hook)
  getDrawingData(): Point[] {
    return [...this.drawingData];
  }

  hasDrawing(): boolean {
    return this.drawingData.length > 0;
  }

  loadDrawingData(data: Point[]) {
    // Clear current drawing data
    this.drawingData = [];
    
    // Load the new data
    this.drawingData = [...data];
    
    // Redraw the canvas
    this.redrawCanvas();
  }

  private redrawCanvas() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw all strokes
    let currentStroke: Point[] = [];
    let currentColor: string | null = null;
    
    this.drawingData.forEach((point) => {
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

  private drawStroke(points: Point[]) {
    if (points.length < 2) return;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    this.ctx.stroke();
  }

  setCallbacks(callbacks: Partial<typeof this.callbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.resizeCanvas);
  }
}