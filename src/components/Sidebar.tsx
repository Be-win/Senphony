import React from 'react';
import ColorPalette from './ColorPalette';
import PatternPalette from './PatternPalette';
import StackViewer from './StackViewer';
import { StackedCanvas, PlaybackState } from '../types';

interface SidebarProps {
  currentColor: string;
  currentNote: string;
  onColorSelect: (color: string, note: string) => void;
  onPatternLoad: (patternId: string) => void;
  // Stack props
  stack: StackedCanvas[];
  playbackState: PlaybackState;
  stackInfo: { size: number; isEmpty: boolean; totalDuration: number };
  onAddToStack: () => void;
  onPlayStack: () => void;
  onRemoveFromStack: (canvasId: string) => void;
  onSetActiveCanvas: (canvasId: string) => void;
  onUpdateCanvasName: (canvasId: string, newName: string) => void;
  onClearStack: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentColor,
  currentNote,
  onColorSelect,
  onPatternLoad,
  // Stack props
  stack,
  playbackState,
  onRemoveFromStack,
  onSetActiveCanvas,
  onUpdateCanvasName,
  onClearStack
}) => {
  return (
    <aside className="sidebar" role="complementary">
      <ColorPalette
        currentColor={currentColor}
        currentNote={currentNote}
        onColorSelect={onColorSelect}
      />
      <PatternPalette onPatternLoad={onPatternLoad} />
      {/* Only show StackViewer if not playing */}
      {!playbackState.isPlaying && (
        <StackViewer
          stack={stack}
          currentPlayingId={playbackState.currentCanvasId}
          onRemoveFromStack={onRemoveFromStack}
          onSetActiveCanvas={onSetActiveCanvas}
          onUpdateCanvasName={onUpdateCanvasName}
          onClearStack={onClearStack}
        />
      )}
    </aside>
  );
};

export default Sidebar;