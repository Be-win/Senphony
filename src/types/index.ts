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