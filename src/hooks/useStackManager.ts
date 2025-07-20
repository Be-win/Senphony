import { useState, useRef, useCallback, useEffect } from 'react';
import { StackManager } from '../utils/StackManager';
import { StackedCanvas, PlaybackState, Point } from '../types';

export const useStackManager = () => {
  const [stack, setStack] = useState<StackedCanvas[]>([]);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentCanvasIndex: 0,
    totalCanvases: 0,
    progress: 0,
    currentCanvasId: null
  });

  const stackManagerRef = useRef<StackManager | null>(null);
  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize stack manager
  useEffect(() => {
    stackManagerRef.current = new StackManager();
    
    stackManagerRef.current.setCallbacks({
      onStackUpdate: (updatedStack) => {
        console.log('DEBUG: onStackUpdate called in useStackManager. Updated stack:', updatedStack);
        setStack([...updatedStack]); // Always use a new array reference
      },
      onCanvasAdded: (canvas) => {
        console.log('Canvas added to stack:', canvas.name);
      },
      onCanvasRemoved: (canvasId) => {
        console.log('Canvas removed from stack:', canvasId);
      }
    });

    // Load initial stack
    setStack(stackManagerRef.current.getStack());

    return () => {
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  // Add canvas to stack
  const addToStack = useCallback((drawingData: Point[], canvasElement: HTMLCanvasElement, name?: string) => {
    if (!stackManagerRef.current) return null;
    
    return stackManagerRef.current.addToStack(drawingData, canvasElement, name);
  }, []);

  // Remove canvas from stack
  const removeFromStack = useCallback((canvasId: string) => {
    if (!stackManagerRef.current) return false;
    
    // If we're currently playing this canvas, stop playback
    if (playbackState.isPlaying && playbackState.currentCanvasId === canvasId) {
      stopPlayback();
    }
    
    return stackManagerRef.current.removeFromStack(canvasId);
  }, [playbackState]);

  // Set active canvas
  const setActiveCanvas = useCallback((canvasId: string) => {
    if (!stackManagerRef.current) return false;
    
    return stackManagerRef.current.setActiveCanvas(canvasId);
  }, []);

  // Clear entire stack
  const clearStack = useCallback(() => {
    if (!stackManagerRef.current) return;
    
    // Stop playback if running
    if (playbackState.isPlaying) {
      stopPlayback();
    }
    
    stackManagerRef.current.clearStack();
  }, [playbackState]);

  // Update canvas name
  const updateCanvasName = useCallback((canvasId: string, newName: string) => {
    if (!stackManagerRef.current) return false;
    
    return stackManagerRef.current.updateCanvasName(canvasId, newName);
  }, []);

  // Start stack playback with smooth transitions
  const startStackPlayback = useCallback((
    audioManager: any,
    canvasManager: any,
    canvasElement: HTMLCanvasElement,
    playbackSpeed: number = 1.0
  ) => {
    if (!stackManagerRef.current || playbackState.isPlaying) return;

    const playbackSequence = stackManagerRef.current.getPlaybackSequence();
    if (playbackSequence.length === 0) return;

    setPlaybackState({
      isPlaying: true,
      currentCanvasIndex: 0,
      totalCanvases: playbackSequence.length,
      progress: 0,
      currentCanvasId: playbackSequence[0].id
    });

    let currentIndex = 0;

    const playNextCanvas = async () => {
      if (currentIndex >= playbackSequence.length) {
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
          progress: 1,
          currentCanvasIndex: playbackSequence.length - 1,
          currentCanvasId: null
        }));
        return;
      }

      const currentCanvas = playbackSequence[currentIndex];
      const isFirstCanvas = currentIndex === 0;
      const isLastCanvas = currentIndex === playbackSequence.length - 1;

      setPlaybackState(prev => ({
        ...prev,
        currentCanvasIndex: currentIndex,
        currentCanvasId: currentCanvas.id,
        progress: currentIndex / playbackSequence.length
      }));

      const canvasWidth = canvasElement.width;
      const canvasHeight = canvasElement.height;
      const duration = currentCanvas.duration / (playbackSpeed || 1.0);

      // For the first canvas, load immediately without transition
      if (isFirstCanvas) {
        canvasManager.clearCanvas();
        canvasManager.loadDrawingData(currentCanvas.data);
        canvasElement.style.opacity = '1';
      } else {
        // For subsequent canvases, do a quick crossfade (150ms)
        const fadeOutPromise = fadeCanvas(canvasElement, 'out', 150);

        // Start loading new canvas data immediately
        setTimeout(() => {
          canvasManager.clearCanvas();
          canvasManager.loadDrawingData(currentCanvas.data);
          fadeCanvas(canvasElement, 'in', 150);
        }, 75); // Start loading halfway through fade out

        // Don't wait for visual transition to complete
      }

      // Start audio immediately - no waiting for visual transitions
      audioManager.playCanvasMusic(
        currentCanvas.data,
        canvasWidth,
        canvasHeight,
        duration
      );

      // Progress tracking with smooth updates
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const canvasProgress = Math.min(elapsed / duration, 1);
        const overallProgress = (currentIndex + canvasProgress) / playbackSequence.length;

        setPlaybackState(prev => ({
          ...prev,
          progress: overallProgress
        }));

        if (canvasProgress >= 1) {
          clearInterval(progressInterval);
        }
      }, 16); // ~60fps for smooth progress

      // Schedule next canvas to start exactly when current audio ends
      playbackTimeoutRef.current = setTimeout(() => {
        clearInterval(progressInterval);
        currentIndex++;
        playNextCanvas();
      }, duration * 1000);
    };

    playNextCanvas();
  }, [playbackState]);

  // Canvas fade transition helper
  const fadeCanvas = (canvasElement: HTMLCanvasElement, direction: 'in' | 'out', duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startOpacity = direction === 'out' ? 1 : 0;
      const endOpacity = direction === 'out' ? 0 : 1;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Smooth easing function
        const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        const easedProgress = easeInOut(progress);

        const currentOpacity = startOpacity + (endOpacity - startOpacity) * easedProgress;
        canvasElement.style.opacity = currentOpacity.toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          canvasElement.style.opacity = endOpacity.toString();
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  };

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }
    
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }

    setPlaybackState(prev => ({
      ...prev,
      isPlaying: false,
      progress: 0,
      currentCanvasIndex: 0,
      currentCanvasId: null
    }));
  }, []);

  // Get stack info
  const getStackInfo = useCallback(() => {
    if (!stackManagerRef.current) {
      return { size: 0, isEmpty: true, totalDuration: 0 };
    }

    return {
      size: stackManagerRef.current.getSize(),
      isEmpty: stackManagerRef.current.isEmpty(),
      totalDuration: stackManagerRef.current.getTotalDuration()
    };
  }, []);

  return {
    stack,
    playbackState,
    addToStack,
    removeFromStack,
    setActiveCanvas,
    clearStack,
    updateCanvasName,
    startStackPlayback,
    stopPlayback,
    getStackInfo
  };
};