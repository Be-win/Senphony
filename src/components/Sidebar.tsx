import React from 'react';
import ColorPalette from './ColorPalette';
import PatternPalette from './PatternPalette';

interface SidebarProps {
  currentColor: string;
  currentNote: string;
  onColorSelect: (color: string, note: string) => void;
  onPatternLoad: (patternId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentColor,
  currentNote,
  onColorSelect,
  onPatternLoad
}) => {
  return (
    <aside className="sidebar" role="complementary">
      <ColorPalette
        currentColor={currentColor}
        currentNote={currentNote}
        onColorSelect={onColorSelect}
      />
      <PatternPalette onPatternLoad={onPatternLoad} />
    </aside>
  );
};

export default Sidebar;