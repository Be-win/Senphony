import React from 'react';

interface ControlsProps {
  brushType: string;
  brushSize: number;
  isPlaying: boolean;
  hasDrawing: boolean;
  onBrushSelect: (brushType: string) => void;
  onBrushSizeChange: (size: number) => void;
  onPlayToggle: () => void;
  onClearCanvas: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  brushType,
  brushSize,
  isPlaying,
  hasDrawing,
  onBrushSelect,
  onBrushSizeChange,
  onPlayToggle,
  onClearCanvas
}) => {
  return (
    <section className="controls" role="toolbar" aria-label="Drawing controls">
      <div className="brush-controls">
        <h3 className="sr-only">Brush Tools</h3>
        <button 
          className={`btn btn-tool ${brushType === 'smooth' ? 'active' : ''}`}
          onClick={() => onBrushSelect('smooth')}
          aria-label="Smooth brush tool" 
          aria-pressed={brushType === 'smooth'}
        >
          ✏️ Smooth
        </button>
        <button 
          className={`btn btn-tool ${brushType === 'sparkle' ? 'active' : ''}`}
          onClick={() => onBrushSelect('sparkle')}
          aria-label="Sparkle brush tool" 
          aria-pressed={brushType === 'sparkle'}
        >
          ✨ Sparkle
        </button>
        <div className="brush-size-control">
          <label htmlFor="brushSize" className="sr-only">Brush size</label>
          <input 
            type="range" 
            id="brushSize" 
            min="5" 
            max="20" 
            value={brushSize}
            onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
            aria-label="Brush size"
          />
          <span className="size-label">Size</span>
        </div>
      </div>
      
      <div className="action-controls">
        <button 
          className="btn btn-primary"
          onClick={onPlayToggle}
          aria-label={isPlaying ? 'Pause your musical drawing' : 'Play your musical drawing'}
        >
          {isPlaying ? '⏸️ Pause Song' : '▶️ Play My Song'}
        </button>
        <button 
          className="btn btn-danger"
          onClick={onClearCanvas}
          aria-label={hasDrawing ? 'Clear the canvas' : 'Canvas is empty'}
        >
          🗑️ Clear Canvas
        </button>
      </div>
    </section>
  );
};

export default Controls;