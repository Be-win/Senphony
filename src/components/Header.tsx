import React from 'react';

interface HeaderProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onGardenToggle: () => void;
  achievementCount: number;
  totalAchievements: number;
}

const Header: React.FC<HeaderProps> = ({
  volume,
  onVolumeChange,
  onGardenToggle,
  achievementCount,
  totalAchievements
}) => {
  return (
    <header className="header" role="banner">
      <h1 className="app-title">🎨 Sensory Sketchpad</h1>
      <div className="header-controls">
        <button 
          className="btn btn-secondary" 
          onClick={onGardenToggle}
          aria-label={`My Achievement Garden - ${achievementCount} out of ${totalAchievements} achievements unlocked`}
        >
          🌻 My Garden ({achievementCount}/{totalAchievements})
        </button>
        <div className="volume-control">
          <label htmlFor="volumeSlider" className="sr-only">Volume Control</label>
          <input 
            type="range" 
            id="volumeSlider" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => onVolumeChange(parseInt(e.target.value))}
            aria-label="Volume"
          />
          <span className="volume-icon">🔊</span>
        </div>
      </div>
    </header>
  );
};

export default Header;