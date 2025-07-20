import { forwardRef } from 'react';
import Canvas from './Canvas';
import Controls from './Controls';
import StackControls from './StackControls';
import { PlaybackState } from '../types';

interface CanvasSectionProps {
  isPlaying: boolean;
  hasDrawing: boolean;
  brushType: string;
  brushSize: number;
  onBrushSelect: (brushType: string) => void;
  onBrushSizeChange: (size: number) => void;
  onPlayToggle: () => void;
  onClearCanvas: () => void;
  // Stack props
  stackInfo: { size: number; isEmpty: boolean; totalDuration: number };
  playbackState: PlaybackState;
  onAddToStack: () => void;
  onPlayStack: () => void;
  onStopStack: () => void;
}

const CanvasSection = forwardRef<HTMLCanvasElement, CanvasSectionProps>(({
  isPlaying,
  hasDrawing,
  brushType,
  brushSize,
  onBrushSelect,
  onBrushSizeChange,
  onPlayToggle,
  onClearCanvas,
  // Stack props
  stackInfo,
  playbackState,
  onAddToStack,
  onPlayStack,
  onStopStack
}, ref) => {
  return (
    <div className="canvas-section">
      <Canvas ref={ref} isPlaying={isPlaying} hasDrawing={hasDrawing} />
      <Controls
        brushType={brushType}
        brushSize={brushSize}
        isPlaying={isPlaying}
        hasDrawing={hasDrawing}
        onBrushSelect={onBrushSelect}
        onBrushSizeChange={onBrushSizeChange}
        onPlayToggle={onPlayToggle}
        onClearCanvas={onClearCanvas}
      />
      <StackControls
        hasDrawing={hasDrawing}
        stackSize={stackInfo.size}
        playbackState={playbackState}
        onAddToStack={onAddToStack}
        onPlayStack={onPlayStack}
        onStopPlayback={onStopStack}
      />
    </div>
  );
});

CanvasSection.displayName = 'CanvasSection';

export default CanvasSection;