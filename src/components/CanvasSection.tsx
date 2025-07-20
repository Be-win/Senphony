import React, { forwardRef } from 'react';
import Canvas from './Canvas';
import Controls from './Controls';

interface CanvasSectionProps {
  isPlaying: boolean;
  hasDrawing: boolean;
  brushType: string;
  brushSize: number;
  onBrushSelect: (brushType: string) => void;
  onBrushSizeChange: (size: number) => void;
  onPlayToggle: () => void;
  onClearCanvas: () => void;
}

const CanvasSection = forwardRef<HTMLCanvasElement, CanvasSectionProps>(({
  isPlaying,
  hasDrawing,
  brushType,
  brushSize,
  onBrushSelect,
  onBrushSizeChange,
  onPlayToggle,
  onClearCanvas
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
    </div>
  );
});

CanvasSection.displayName = 'CanvasSection';

export default CanvasSection;