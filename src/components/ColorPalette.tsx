import React from 'react';

interface ColorPaletteProps {
  currentColor: string;
  currentNote: string;
  onColorSelect: (color: string, note: string) => void;
}

const colors = [
  { color: '#ff0080', note: 'C', name: 'Pink' },
  { color: '#00ff80', note: 'D', name: 'Green' },
  { color: '#8000ff', note: 'E', name: 'Purple' },
  { color: '#ff8000', note: 'G', name: 'Orange' },
  { color: '#00ffff', note: 'A', name: 'Cyan' },
  { color: '#ffff00', note: 'C2', name: 'Yellow' }
];

const ColorPalette: React.FC<ColorPaletteProps> = ({
  currentColor,
  onColorSelect
}) => {
  return (
    <section className="color-palette" role="toolbar" aria-label="Musical color palette">
      <h2 className="sr-only">Choose a musical color</h2>
      {colors.map((colorData, index) => (
        <button
          key={colorData.color}
          className={`color-btn ${currentColor === colorData.color ? 'active' : ''}`}
          data-color={colorData.color}
          data-note={colorData.note}
          onClick={() => onColorSelect(colorData.color, colorData.note)}
          aria-label={`${colorData.name} - Musical note ${colorData.note}`}
          aria-pressed={currentColor === colorData.color}
        >
          <span 
            className="color-preview" 
            style={{ backgroundColor: colorData.color }}
          />
          <span className="note-label">{colorData.note}</span>
        </button>
      ))}
    </section>
  );
};

export default ColorPalette;