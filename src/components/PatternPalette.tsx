import React from 'react';

interface PatternPaletteProps {
  onPatternLoad: (patternId: string) => void;
}

const patterns = [
  { id: 'ascending', icon: '↗️', name: 'Ascending', description: 'A gentle rising melody' },
  { id: 'descending', icon: '↘️', name: 'Descending', description: 'A peaceful falling melody' },
  { id: 'wave', icon: '🌊', name: 'Wave', description: 'A flowing wave pattern' },
  { id: 'mountain', icon: '⛰️', name: 'Mountain', description: 'A dramatic mountain shape' },
  { id: 'spiral', icon: '🌀', name: 'Spiral', description: 'A swirling spiral pattern' }
];

const PatternPalette: React.FC<PatternPaletteProps> = ({ onPatternLoad }) => {
  return (
    <section className="pattern-palette" role="toolbar" aria-label="Default music patterns">
      <h2 className="sr-only">Try default music patterns</h2>
      <div className="pattern-grid">
        {patterns.map((pattern) => (
          <button
            key={pattern.id}
            className="pattern-btn"
            data-pattern={pattern.id}
            onClick={() => onPatternLoad(pattern.id)}
            aria-label={`${pattern.name} - ${pattern.description}`}
          >
            <span className="pattern-icon">{pattern.icon}</span>
            <span className="pattern-name">{pattern.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default PatternPalette;