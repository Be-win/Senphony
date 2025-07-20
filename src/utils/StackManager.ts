// Stack management for canvas stacking feature

import { CanvasData, StackedCanvas, Point } from '../types';

export class StackManager {
  private stack: StackedCanvas[] = [];
  private nextId = 1;
  
  private callbacks = {
    onStackUpdate: null as ((stack: StackedCanvas[]) => void) | null,
    onCanvasAdded: null as ((canvas: StackedCanvas) => void) | null,
    onCanvasRemoved: null as ((canvasId: string) => void) | null
  };

  constructor() {
    this.loadStack();
  }

  // Add a canvas to the stack
  addToStack(drawingData: Point[], canvasElement: HTMLCanvasElement, name?: string): StackedCanvas {
    const id = `canvas_${this.nextId++}_${Date.now()}`;
    const thumbnail = this.generateThumbnail(canvasElement);
    
    const newCanvas: StackedCanvas = {
      id,
      name: name || `Canvas ${this.stack.length + 1}`,
      data: [...drawingData],
      thumbnail,
      createdAt: Date.now(),
      duration: 3, // Default 3 seconds per canvas
      stackOrder: this.stack.length,
      isActive: false
    };

    // Mark previous canvases as inactive
    this.stack.forEach(canvas => {
      canvas.isActive = false;
    });

    // Add new canvas as active
    newCanvas.isActive = true;
    this.stack = [...this.stack, newCanvas]; // Use new array

    this.saveStack();
    
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([...this.stack]);
    }
    
    if (this.callbacks.onCanvasAdded) {
      this.callbacks.onCanvasAdded(newCanvas);
    }

    return newCanvas;
  }

  // Remove a canvas from the stack
  removeFromStack(canvasId: string): boolean {
    const index = this.stack.findIndex(canvas => canvas.id === canvasId);
    if (index === -1) return false;

    const removedCanvas = this.stack[index];
    const newStack = [...this.stack];
    newStack.splice(index, 1);

    // Update stack order for remaining canvases
    newStack.forEach((canvas, idx) => {
      canvas.stackOrder = idx;
    });

    // If we removed the active canvas, make the last one active
    if (removedCanvas.isActive && newStack.length > 0) {
      newStack[newStack.length - 1].isActive = true;
    }

    this.stack = newStack;
    this.saveStack();
    
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([...this.stack]);
    }
    
    if (this.callbacks.onCanvasRemoved) {
      this.callbacks.onCanvasRemoved(canvasId);
    }

    return true;
  }

  // Get the current stack
  getStack(): StackedCanvas[] {
    return [...this.stack];
  }

  // Get stack for playback (ordered sequence)
  getPlaybackSequence(): StackedCanvas[] {
    return this.stack.sort((a, b) => a.stackOrder - b.stackOrder);
  }

  // Get the active canvas
  getActiveCanvas(): StackedCanvas | null {
    return this.stack.find(canvas => canvas.isActive) || null;
  }

  // Set active canvas
  setActiveCanvas(canvasId: string): boolean {
    console.log('DEBUG: setActiveCanvas called for', canvasId, 'Current stack:', this.stack, 'Callback:', !!this.callbacks.onStackUpdate);
    this.stack = this.stack.map(c => ({ ...c, isActive: c.id === canvasId }));
    this.saveStack();
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([...this.stack]);
    }
    return true;
  }

  // Clear the entire stack
  clearStack(): void {
    this.stack = [];
    this.saveStack();
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([]);
    }
  }

  // Check if stack is empty
  isEmpty(): boolean {
    return this.stack.length === 0;
  }

  // Get stack size
  getSize(): number {
    return this.stack.length;
  }

  // Move canvas in stack order
  moveCanvas(canvasId: string, newPosition: number): boolean {
    const currentIndex = this.stack.findIndex(c => c.id === canvasId);
    if (currentIndex === -1 || newPosition < 0 || newPosition >= this.stack.length) {
      return false;
    }
    const newStack = [...this.stack];
    const [canvas] = newStack.splice(currentIndex, 1);
    newStack.splice(newPosition, 0, canvas);
    newStack.forEach((c, index) => {
      c.stackOrder = index;
    });
    this.stack = newStack;
    this.saveStack();
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([...this.stack]);
    }
    return true;
  }

  // Generate thumbnail from canvas
  private generateThumbnail(canvas: HTMLCanvasElement): string {
    try {
      // Create a smaller canvas for thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      const thumbnailCtx = thumbnailCanvas.getContext('2d');
      
      if (!thumbnailCtx) return '';

      thumbnailCanvas.width = 120;
      thumbnailCanvas.height = 90;

      // Fill with dark background
      thumbnailCtx.fillStyle = '#000000';
      thumbnailCtx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);

      // Draw scaled down version of the main canvas
      thumbnailCtx.drawImage(
        canvas,
        0, 0, canvas.width, canvas.height,
        0, 0, thumbnailCanvas.width, thumbnailCanvas.height
      );

      return thumbnailCanvas.toDataURL('image/png');
    } catch (error) {
      console.warn('Failed to generate thumbnail:', error);
      return '';
    }
  }

  // Save stack to localStorage
  private saveStack(): void {
    try {
      const stackData = {
        stack: this.stack,
        nextId: this.nextId
      };
      localStorage.setItem('sensorySketchpadStack', JSON.stringify(stackData));
    } catch (error) {
      console.warn('Failed to save stack:', error);
    }
  }

  // Load stack from localStorage
  private loadStack(): void {
    try {
      const saved = localStorage.getItem('sensorySketchpadStack');
      if (saved) {
        const stackData = JSON.parse(saved);
        this.stack = stackData.stack || [];
        this.nextId = stackData.nextId || 1;
      }
    } catch (error) {
      console.warn('Failed to load stack:', error);
      this.stack = [];
      this.nextId = 1;
    }
  }

  // Set callbacks
  setCallbacks(callbacks: Partial<typeof this.callbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get total playback duration
  getTotalDuration(): number {
    return this.stack.reduce((total, canvas) => total + canvas.duration, 0);
  }

  // Update canvas name
  updateCanvasName(canvasId: string, newName: string): boolean {
    const canvas = this.stack.find(c => c.id === canvasId);
    if (!canvas) return false;

    canvas.name = newName;
    this.saveStack();
    
    if (this.callbacks.onStackUpdate) {
      this.callbacks.onStackUpdate([...this.stack]);
    }

    return true;
  }
}