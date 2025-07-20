import React from 'react';
import ColorPalette from './ColorPalette';
import PatternPalette from './PatternPalette';
import InstrumentPalette from './InstrumentPalette';
import { StackedCanvas, PlaybackState } from '../types';

interface SidebarProps {
  currentColor: string;
  currentNote: string;
  onColorSelect: (color: string, note: string) => void;
  onLoadDemoSong: () => void;
  onLoadMaryDemo?: () => void;
  onLoadSoothingDemo?: () => void;
  onLoadContinuousDemo?: () => void;
  onLoadPattern?: (patternId: string) => void; // Add pattern generator support
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
  // Instrument props
  currentInstrument: string;
  onInstrumentSelect: (instrumentId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentColor,
  onColorSelect,
  onLoadDemoSong,
  onLoadMaryDemo,
  onLoadSoothingDemo,
  onLoadContinuousDemo,
  onLoadPattern, // Add pattern generator prop
  // Instrument props
  currentInstrument,
  onInstrumentSelect
}) => {
  return (
    <aside className="sidebar" role="complementary">
      <InstrumentPalette
        currentInstrument={currentInstrument}
        onInstrumentSelect={onInstrumentSelect}
      />
      <ColorPalette
        currentColor={currentColor}
        onColorSelect={onColorSelect}
      />
      <PatternPalette
        onLoadDemoSong={onLoadDemoSong}
        onLoadMaryDemo={onLoadMaryDemo}
        onLoadSoothingDemo={onLoadSoothingDemo}
        onLoadContinuousDemo={onLoadContinuousDemo}
        onLoadPattern={onLoadPattern} // Pass pattern generator prop
      />
      {/* StackViewer removed from Sidebar; now always in right sidebar */}
    </aside>
  );
};

export default Sidebar;