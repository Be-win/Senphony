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
        setStack(updatedStack);
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

  // Start stack playback
  const startStackPlayback = useCallback((
    audioManager: any,
    canvasManager: any,
    canvasElement: HTMLCanvasElement
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
    const totalDuration = stackManagerRef.current.getTotalDuration();

    const playNextCanvas = () => {
      if (currentIndex >= playbackSequence.length) {
        // Playback complete
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: false,
          progress: 1,
          currentCanvasIndex: playbackSequence.length - 1
        }));
        return;
      }

      const currentCanvas = playbackSequence[currentIndex];
      
      // Update playback state
      setPlaybackState(prev => ({
        ...prev,
        currentCanvasIndex: currentIndex,
        currentCanvasId: currentCanvas.id,
        progress: currentIndex / playbackSequence.length
      }));

      // Load canvas data and play
      canvasManager.clearCanvas();
      canvasManager.loadDrawingData(currentCanvas.data);

      // Play the music for this canvas
      const canvasWidth = canvasElement.width;
      const canvasHeight = canvasElement.height;
      
      audioManager.playCanvasMusic(
        currentCanvas.data,
        canvasWidth,
        canvasHeight,
        currentCanvas.duration
      );

      // Progress tracking within current canvas
      const startTime = Date.now();
      const progressInterval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const canvasProgress = Math.min(elapsed / currentCanvas.duration, 1);
        const overallProgress = (currentIndex + canvasProgress) / playbackSequence.length;
        
        setPlaybackState(prev => ({
          ...prev,
          progress: overallProgress
        }));

        if (canvasProgress >= 1) {
          clearInterval(progressInterval);
        }
      }, 50);

      // Schedule next canvas
      playbackTimeoutRef.current = setTimeout(() => {
        clearInterval(progressInterval);
        currentIndex++;
        playNextCanvas();
      }, currentCanvas.duration * 1000);
    };

    // Start playback
    playNextCanvas();
  }, [playbackState]);

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