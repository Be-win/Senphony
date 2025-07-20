import React from 'react';
import { Instrument } from '../types';

interface InstrumentPaletteProps {
  currentInstrument: string;
  onInstrumentSelect: (instrumentId: string) => void;
}

const classicalInstruments: Instrument[] = [
  {
    id: 'piano',
    name: 'Piano',
    category: 'classical',
    description: 'Classical grand piano with rich harmonics',
    icon: '🎹',
    color: '#ff6b6b',
    timbre: 'bright',
    complexity: 'medium',
    accessibilityFeatures: ['clear', 'familiar', 'predictable']
  },
  {
    id: 'violin',
    name: 'Violin',
    category: 'classical',
    description: 'Smooth, expressive string instrument',
    icon: '🎻',
    color: '#4ecdc4',
    timbre: 'warm',
    complexity: 'medium',
    accessibilityFeatures: ['smooth', 'expressive', 'clear']
  },
  {
    id: 'flute',
    name: 'Flute',
    category: 'classical',
    description: 'Gentle, airy woodwind sound',
    icon: '🎼',
    color: '#45b7d1',
    timbre: 'mellow',
    complexity: 'simple',
    accessibilityFeatures: ['gentle', 'calming', 'clear']
  }
];

const InstrumentPalette: React.FC<InstrumentPaletteProps> = ({
  currentInstrument,
  onInstrumentSelect
}) => {
  return (
    <section className="instrument-palette" role="toolbar" aria-label="Classical instruments">
      <h2 className="sr-only">Choose a classical instrument</h2>
      <div className="instrument-grid">
        {classicalInstruments.map((instrument) => (
          <button
            key={instrument.id}
            className={`instrument-btn ${currentInstrument === instrument.id ? 'active' : ''}`}
            onClick={() => onInstrumentSelect(instrument.id)}
            aria-label={`${instrument.name} - ${instrument.description}`}
            aria-pressed={currentInstrument === instrument.id}
            style={{ '--instrument-color': instrument.color } as React.CSSProperties}
          >
            <span className="instrument-icon">{instrument.icon}</span>
            <div className="instrument-info">
              <span className="instrument-name">{instrument.name}</span>
              <span className="instrument-description">{instrument.description}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default InstrumentPalette; 