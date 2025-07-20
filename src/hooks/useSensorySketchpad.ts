import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioManager } from '../utils/AudioManager';
import { CanvasManager } from '../utils/CanvasManager';
import { AchievementManager } from '../utils/AchievementManager';
import { PatternGenerator } from '../utils/PatternGenerator';
import { useStackManager } from './useStackManager';
import { Achievement, Notification } from '../types';

export const useSensorySketchpad = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#ff0080');
  const [currentNote, setCurrentNote] = useState('C');
  const [brushType, setBrushType] = useState('smooth');
  const [brushSize, setBrushSize] = useState(10);
  const [volume, setVolume] = useState(70);
  const [showGarden, setShowGarden] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [currentInstrument, setCurrentInstrument] = useState('piano');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Stack management
  const {
    stack,
    playbackState,
    addToStack,
    removeFromStack,
    setActiveCanvas,
    clearStack,
    updateCanvasName,
    startStackPlayback,
    stopPlayback: stopStackPlayback,
    getStackInfo
  } = useStackManager();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const achievementManagerRef = useRef<AchievementManager | null>(null);
  const patternGeneratorRef = useRef<PatternGenerator | null>(null);
  const playbackTimeoutRef = useRef<number | null>(null);
  const stackManagerRef = useRef<import('../utils/StackManager').StackManager | null>(null);

  // Update achievements
  const updateAchievements = useCallback(() => {
    if (achievementManagerRef.current) {
      const progress = achievementManagerRef.current.getProgress();
      setAchievements(Object.values(progress.achievements));
    }
  }, []);

  // Initialize managers
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize audio manager
        audioManagerRef.current = new AudioManager();
        await audioManagerRef.current.initialize();
        audioManagerRef.current.setVolume(volume / 100);

        // Initialize achievement manager
        achievementManagerRef.current = new AchievementManager();
        achievementManagerRef.current.setCallbacks({
          onAchievementUnlocked: (achievement) => {
            audioManagerRef.current?.playAchievementSound();
            setNotification({
              message: `Achievement Unlocked! ${achievement.name}: ${achievement.description}`,
              type: 'success'
            });
          }
        });

        // Initialize pattern generator
        patternGeneratorRef.current = new PatternGenerator();

        // Initialize canvas manager
        if (canvasRef.current) {
          canvasManagerRef.current = new CanvasManager(canvasRef.current);
          canvasManagerRef.current.setColor(currentColor, currentNote);
          canvasManagerRef.current.setBrushType(brushType);
          canvasManagerRef.current.setBrushSize(brushSize);

          canvasManagerRef.current.setCallbacks({
            onStrokeStart: (data) => {
              achievementManagerRef.current?.recordProgress('stroke', {
                color: data.color,
                note: data.note
              });
              audioManagerRef.current?.playDrawingFeedback(data.note, 0.5);
              setHasDrawing(true);
            },
            onStrokeEnd: () => {
              setHasDrawing(canvasManagerRef.current?.hasDrawing() || false);
            },
            onColorChange: () => {
              // Handle color change if needed
            }
          });
        }

        // Load initial achievements
        updateAchievements();
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setNotification({
          message: 'Failed to initialize audio. Some features may not work.',
          type: 'warning'
        });
      }
    };

    initializeApp();

    return () => {
      // Cleanup
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
      }
      audioManagerRef.current?.destroy();
      canvasManagerRef.current?.destroy();
    };
  }, [brushSize, brushType, updateAchievements, volume]); // Remove currentColor and currentNote from dependencies

  // Handle color selection
  const handleColorSelect = useCallback(async (color: string, note: string) => {
    setCurrentColor(color);
    setCurrentNote(note);
    canvasManagerRef.current?.setColor(color, note);
    await audioManagerRef.current?.playColorSelectionSound(note);
  }, []);

  // Handle brush selection
  const handleBrushSelect = useCallback(async (newBrushType: string) => {
    setBrushType(newBrushType);
    canvasManagerRef.current?.setBrushType(newBrushType);
    await audioManagerRef.current?.playButtonSound();
  }, []);

  // Handle brush size change
  const handleBrushSizeChange = useCallback((size: number) => {
    setBrushSize(size);
    canvasManagerRef.current?.setBrushSize(size);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    audioManagerRef.current?.setVolume(newVolume / 100);
  }, []);

  // Handle play toggle
  const handlePlayToggle = useCallback(async () => {
    if (isPlaying) {
      // Stop playback
      setIsPlaying(false);
      audioManagerRef.current?.stopAllNotes();
      stopStackPlayback();
      if (playbackTimeoutRef.current) {
        clearTimeout(playbackTimeoutRef.current);
        playbackTimeoutRef.current = null;
      }
    } else {
      // Start playback
      if (!canvasManagerRef.current?.hasDrawing()) {
        setNotification({
          message: 'Draw something first to play music!',
          type: 'info'
        });
        return;
      }

      setIsPlaying(true);
      achievementManagerRef.current?.recordProgress('playback');
      updateAchievements();

      const drawingData = canvasManagerRef.current.getDrawingData();
      const canvasWidth = canvasRef.current?.width || 800;
      const canvasHeight = canvasRef.current?.height || 600;

      const duration = await audioManagerRef.current?.playCanvasMusic(
        drawingData,
        canvasWidth,
        canvasHeight,
        3
      ) || 3;

      playbackTimeoutRef.current = setTimeout(() => {
        setIsPlaying(false);
        playbackTimeoutRef.current = null;
      }, duration * 1000);
    }
  }, [isPlaying, updateAchievements, stopStackPlayback]);

  // Handle add to stack
  const handleAddToStack = useCallback(() => {
    if (!canvasManagerRef.current?.hasDrawing() || !canvasRef.current) {
      setNotification({
        message: 'Draw something first to add to stack!',
        type: 'warning'
      });
      return;
    }

    const drawingData = canvasManagerRef.current.getDrawingData();
    const stackInfo = getStackInfo();
    const canvasName = `Canvas ${stackInfo.size + 1}`;
    
    const addedCanvas = addToStack(drawingData, canvasRef.current, canvasName);
    
    if (addedCanvas) {
      setNotification({
        message: `Added "${addedCanvas.name}" to stack!`,
        type: 'success'
      });
    }
  }, [addToStack, getStackInfo]);

  // Handle play stack
  const handlePlayStack = useCallback(() => {
    if (!audioManagerRef.current || !canvasManagerRef.current || !canvasRef.current) return;
    
    const stackInfo = getStackInfo();
    if (stackInfo.isEmpty) {
      setNotification({
        message: 'No canvases in stack to play!',
        type: 'info'
      });
      return;
    }

    startStackPlayback(audioManagerRef.current, canvasManagerRef.current, canvasRef.current, playbackSpeed);
  }, [startStackPlayback, getStackInfo, playbackSpeed]);

  // Handle stop stack playback
  const handleStopStack = useCallback(() => {
    stopStackPlayback();
    setNotification({
      message: 'Stack playback stopped',
      type: 'info'
    });
  }, [stopStackPlayback]);

  // Handle clear canvas
  const handleClearCanvas = useCallback(() => {
    if (canvasManagerRef.current?.hasDrawing()) {
      setShowConfirmModal(true);
    } else {
      setNotification({
        message: 'Canvas is already empty!',
        type: 'info'
      });
    }
  }, []);

  // Handle confirmation modal actions
  const handleConfirmClear = useCallback(() => {
    if (canvasManagerRef.current) {
      canvasManagerRef.current.clearCanvas();
      setHasDrawing(false);
      achievementManagerRef.current?.recordProgress('clear');
      updateAchievements();
      setNotification({
        message: 'Canvas cleared! Start a new musical journey!',
        type: 'info'
      });
    }
    setShowConfirmModal(false);
  }, [updateAchievements]);

  const handleCancelClear = useCallback(() => {
    setShowConfirmModal(false);
  }, []);

  // Handle pattern loading
  const handlePatternLoad = useCallback(async (patternId: string) => {
    if (!patternGeneratorRef.current) return;

    const pattern = patternGeneratorRef.current.generatePattern(patternId);
    if (pattern) {
      // Convert PatternData to Point format
      const convertedData = pattern.data.map(patternPoint => ({
        ...patternPoint,
        brushSize: 10,
        brushType: 'smooth',
        timestamp: Date.now()
      }));

      canvasManagerRef.current?.clearCanvas();
      canvasManagerRef.current?.loadDrawingData(convertedData);
      setHasDrawing(true);
      await audioManagerRef.current?.playButtonSound();
      setNotification({
        message: `Loaded ${pattern.name}: ${pattern.description}`,
        type: 'info'
      });
    }
  }, []);

  // Handle garden toggle
  const handleGardenToggle = useCallback(() => {
    setShowGarden(!showGarden);
  }, [showGarden]);

  // Hide notification
  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Handle stack operations
  const handleRemoveFromStack = useCallback((canvasId: string) => {
    const removed = removeFromStack(canvasId);
    if (removed) {
      setNotification({
        message: 'Canvas removed from stack',
        type: 'info'
      });
    }
  }, [removeFromStack]);

  // Instrument selection handler
  const handleInstrumentSelect = useCallback((instrumentId: string) => {
    setCurrentInstrument(instrumentId);
    audioManagerRef.current?.setInstrument(instrumentId);
  }, []);

  // Drag-and-drop rearrange handler
  const moveCanvasInStack = useCallback((canvasId: string, newPosition: number) => {
    if (!stackManagerRef.current) return false;
    return stackManagerRef.current.moveCanvas(canvasId, newPosition);
  }, []);

  // When the active canvas in the stack changes, load its data into the main canvas
  useEffect(() => {
    if (!canvasManagerRef.current) return;
    const activeCanvas = stack.find(c => c.isActive);
    console.log('DEBUG: useEffect stack changed. Active canvas:', activeCanvas ? activeCanvas.id : null, stack);
    if (activeCanvas) {
      console.log('DEBUG: Loading active canvas into main canvas:', activeCanvas.id);
      canvasManagerRef.current.clearCanvas();
      canvasManagerRef.current.loadDrawingData(activeCanvas.data);
    }
  }, [stack.find(c => c.isActive)?.id]); // Only depend on the active canvas ID, not the entire stack

  return {
    stack,
    playbackState,
    addToStack,
    removeFromStack,
    setActiveCanvas,
    clearStack,
    updateCanvasName,
    startStackPlayback,
    stopPlayback: stopStackPlayback,
    getStackInfo,
    stackInfo: getStackInfo(),
    moveCanvasInStack,
    isPlaying,
    hasDrawing,
    currentColor,
    currentNote,
    brushType,
    brushSize,
    volume,
    showGarden,
    achievements,
    notification,
    setNotification,
    currentInstrument,
    playbackSpeed,
    setPlaybackSpeed,
    // Stack-related handlers
    handleAddToStack,
    handlePlayStack,
    handleStopStack,
    handleRemoveFromStack,
    canvasRef,
    handleColorSelect,
    handleBrushSelect,
    handleBrushSizeChange,
    handleVolumeChange,
    handlePlayToggle,
    handleClearCanvas,
    handlePatternLoad,
    handleGardenToggle,
    hideNotification,
    handleInstrumentSelect,
    // Confirmation modal handlers
    showConfirmModal,
    handleConfirmClear,
    handleCancelClear
  };
};