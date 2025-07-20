import React from 'react';

interface PatternPaletteProps {
  onLoadDemoSong: () => void;
  onLoadMaryDemo?: () => void;
  onLoadSoothingDemo?: () => void;
  onLoadContinuousDemo?: () => void;
  onLoadPattern?: (patternId: string) => void;
}

const PatternPalette: React.FC<PatternPaletteProps> = ({
  onLoadDemoSong,
  onLoadMaryDemo,
  onLoadSoothingDemo,
  onLoadContinuousDemo,
  onLoadPattern
}) => {

  // Available pattern generators
  const patterns = [
    { id: 'ascending', name: 'Ascending Melody', icon: '↗️', description: 'A gentle rising melody' },
    { id: 'descending', name: 'Descending Melody', icon: '↘️', description: 'A peaceful falling melody' },
    { id: 'wave', name: 'Ocean Wave', icon: '🌊', description: 'A flowing wave pattern' },
    { id: 'mountain', name: 'Mountain Peak', icon: '⛰️', description: 'A dramatic mountain shape' },
    { id: 'spiral', name: 'Spiral Dance', icon: '🌀', description: 'A swirling spiral pattern' },
    { id: 'rain', name: 'Gentle Rain', icon: '🌧️', description: 'Soft raindrops creating peaceful music' }
  ];

  return (
    <section className="pattern-palette" role="toolbar" aria-label="Demo songs and patterns loader">
      <h2 className="sr-only">Load demo songs and patterns</h2>

      {/* Demo Songs Section */}
      <div className="pattern-section">
        <h3 className="pattern-section-title">Demo Songs</h3>
        <div className="pattern-grid">
          <button
            className="pattern-btn"
            onClick={onLoadDemoSong}
            aria-label="Load Twinkle Twinkle Little Star - a gentle multi-canvas musical stack"
          >
            <span className="pattern-icon">⭐</span>
            <span className="pattern-name">Twinkle Star</span>
          </button>

          {onLoadMaryDemo && (
            <button
              className="pattern-btn"
              onClick={onLoadMaryDemo}
              aria-label="Load Mary Had a Little Lamb - a playful multi-canvas musical stack"
            >
              <span className="pattern-icon">🐑</span>
              <span className="pattern-name">Mary's Lamb</span>
            </button>
          )}

          {onLoadSoothingDemo && (
            <button
              className="pattern-btn"
              onClick={onLoadSoothingDemo}
              aria-label="Load Soothing Ambient - a peaceful, meditative multi-canvas musical journey"
            >
              <span className="pattern-icon">🌊</span>
              <span className="pattern-name">Soothing Waves</span>
            </button>
          )}

          {onLoadContinuousDemo && (
            <button
              className="pattern-btn"
              onClick={onLoadContinuousDemo}
              aria-label="Load Continuous Flow - seamless music with no gaps between notes"
            >
              <span className="pattern-icon">🌀</span>
              <span className="pattern-name">Flowing River</span>
            </button>
          )}
        </div>
      </div>

      {/* Pattern Generators Section */}
      {onLoadPattern && (
        <div className="pattern-section">
          <h3 className="pattern-section-title">Pattern Generators</h3>
          <div className="pattern-grid">
            {patterns.map((pattern) => (
              <button
                key={pattern.id}
                className="pattern-btn pattern-generator"
                onClick={() => onLoadPattern(pattern.id)}
                aria-label={`Generate ${pattern.name} - ${pattern.description}`}
              >
                <span className="pattern-icon">{pattern.icon}</span>
                <span className="pattern-name">{pattern.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default PatternPalette;