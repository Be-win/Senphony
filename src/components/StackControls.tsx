import React from 'react';
import { PlaybackState } from '../types';

interface StackControlsProps {
  hasDrawing: boolean;
  stackSize: number;
  playbackState: PlaybackState;
  onAddToStack: () => void;
  onPlayStack: () => void;
  onStopPlayback: () => void;
}

const StackControls: React.FC<StackControlsProps> = ({
  hasDrawing,
  stackSize,
  playbackState,
  onAddToStack,
  onPlayStack,
  onStopPlayback
}) => {
  const canAddToStack = hasDrawing;
  const canPlayStack = stackSize > 0;
  const isPlaying = playbackState.isPlaying;

  return (
    <div className="stack-controls">
      <button
        className="btn btn-secondary"
        onClick={onAddToStack}
        disabled={!canAddToStack}
        aria-label={canAddToStack ? 'Add current drawing to stack' : 'Draw something first to add to stack'}
        title={canAddToStack ? 'Add to Stack' : 'Draw something first'}
      >
        📚 Add to Stack
      </button>

      {isPlaying ? (
        <button
          className="btn btn-danger"
          onClick={onStopPlayback}
          aria-label="Stop stack playback"
          title="Stop Playback"
        >
          ⏹️ Stop Stack
        </button>
      ) : (
        <button
          className="btn btn-primary"
          onClick={onPlayStack}
          disabled={!canPlayStack}
          aria-label={canPlayStack ? `Play stack of ${stackSize} canvases` : 'No canvases in stack to play'}
          title={canPlayStack ? `Play Stack (${stackSize} canvases)` : 'No canvases to play'}
        >
          ▶️ Play Stack {stackSize > 0 && `(${stackSize})`}
        </button>
      )}
    </div>
  );
};

export default StackControls;