import React from 'react';
import { PlaybackState, StackedCanvas } from '../types';

interface PlaybackProgressProps {
  playbackState: PlaybackState;
  stack: StackedCanvas[];
}

const PlaybackProgress: React.FC<PlaybackProgressProps> = ({
  playbackState,
  stack
}) => {
  if (!playbackState.isPlaying || stack.length === 0) {
    return null;
  }

  const currentCanvas = stack.find(c => c.id === playbackState.currentCanvasId);
  const progressPercentage = (playbackState.progress * 100).toFixed(1);

  return (
    <div className="playback-progress" role="progressbar" aria-valuenow={playbackState.progress * 100} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-header">
        <span className="progress-title">Playing Stack</span>
        <span className="progress-info">
          Canvas {playbackState.currentCanvasIndex + 1} of {playbackState.totalCanvases}
        </span>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressPercentage}%` }}
          aria-hidden="true"
        />
      </div>
      
      <div className="progress-details">
        <span className="current-canvas">
          {currentCanvas ? currentCanvas.name : 'Unknown Canvas'}
        </span>
        <span className="progress-percentage">
          {progressPercentage}%
        </span>
      </div>
    </div>
  );
};

export default PlaybackProgress;