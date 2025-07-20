import React, { useEffect, useRef } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

interface AchievementGardenProps {
  achievements: Achievement[];
  onClose: () => void;
}

const AchievementGarden: React.FC<AchievementGardenProps> = ({
  achievements,
  onClose
}) => {
  const gardenRef = useRef<HTMLDivElement>(null);
  const firstAchievementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus management
    if (firstAchievementRef.current) {
      firstAchievementRef.current.focus();
    }

    // Announce to screen reader
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = 'Achievement garden opened';
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    return () => {
      // Clean up announcement if component unmounts quickly
      try {
        document.body.removeChild(announcement);
      } catch (e) {
        // Already removed
      }
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === gardenRef.current) {
      onClose();
    }
  };

  return (
    <aside 
      ref={gardenRef}
      className="achievement-garden" 
      role="complementary" 
      aria-label="Achievement garden"
      onClick={handleBackdropClick}
    >
      <div className="garden-content">
        <h2>🌻 My Achievement Garden</h2>
        <div className="garden-grid">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              ref={index === 0 ? firstAchievementRef : undefined}
              className={`achievement ${achievement.unlocked ? 'unlocked' : ''}`}
              data-achievement={achievement.id}
              tabIndex={0}
              aria-label={`${achievement.name} - ${achievement.unlocked ? 'Unlocked!' : 'Locked.'} ${achievement.description}`}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-info">
                <h3>{achievement.name}</h3>
                <p>{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button 
          className="btn btn-secondary"
          onClick={onClose}
          style={{ marginTop: '1rem' }}
        >
          Close Garden
        </button>
      </div>
    </aside>
  );
};

export default AchievementGarden;