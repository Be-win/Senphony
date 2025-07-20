// Achievement system for Sensory Sketchpad

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: string;
}

interface Progress {
  strokesMade: number;
  songsPlayed: number;
  colorsUsed: Set<string>;
  canvasCleared: number;
}

export class AchievementManager {
  private achievements: Record<string, Achievement> = {
    explorer: {
      id: 'explorer',
      name: 'Explorer',
      description: 'Draw your first stroke',
      icon: '🎨',
      unlocked: false,
      condition: 'firstStroke'
    },
    composer: {
      id: 'composer',
      name: 'Composer',
      description: 'Play your first song',
      icon: '🎵',
      unlocked: false,
      condition: 'firstPlayback'
    },
    stargazer: {
      id: 'stargazer',
      name: 'Stargazer',
      description: 'Use all colors',
      icon: '⭐',
      unlocked: false,
      condition: 'allColors'
    },
    newbeginning: {
      id: 'newbeginning',
      name: 'New Beginning',
      description: 'Clear and start fresh',
      icon: '🌱',
      unlocked: false,
      condition: 'clearCanvas'
    }
  };

  private progress: Progress = {
    strokesMade: 0,
    songsPlayed: 0,
    colorsUsed: new Set(),
    canvasCleared: 0
  };

  private callbacks = {
    onAchievementUnlocked: null as ((achievement: Achievement) => void) | null,
    onProgressUpdate: null as ((progress: any) => void) | null
  };

  constructor() {
    this.loadProgress();
  }

  recordProgress(action: string, data: any = {}): boolean {
    let achievementUnlocked = false;

    switch (action) {
      case 'stroke':
        this.progress.strokesMade++;
        if (data.color) {
          this.progress.colorsUsed.add(data.color);
        }
        
        // Check for first stroke achievement
        if (this.progress.strokesMade === 1) {
          achievementUnlocked = this.unlockAchievement('explorer');
        }
        
        // Check for all colors achievement
        if (this.progress.colorsUsed.size >= 6) {
          achievementUnlocked = this.unlockAchievement('stargazer') || achievementUnlocked;
        }
        break;

      case 'playback':
        this.progress.songsPlayed++;
        if (this.progress.songsPlayed === 1) {
          achievementUnlocked = this.unlockAchievement('composer');
        }
        break;

      case 'clear':
        this.progress.canvasCleared++;
        if (this.progress.canvasCleared >= 1) {
          achievementUnlocked = this.unlockAchievement('newbeginning');
        }
        break;
    }

    this.saveProgress();

    if (this.callbacks.onProgressUpdate) {
      this.callbacks.onProgressUpdate(this.progress);
    }

    return achievementUnlocked;
  }

  private unlockAchievement(achievementId: string): boolean {
    const achievement = this.achievements[achievementId];
    if (!achievement || achievement.unlocked) {
      return false;
    }

    achievement.unlocked = true;
    this.saveProgress();
    
    if (this.callbacks.onAchievementUnlocked) {
      this.callbacks.onAchievementUnlocked(achievement);
    }

    this.announceToScreenReader(`Achievement unlocked: ${achievement.name}! ${achievement.description}`);
    
    return true;
  }

  private announceToScreenReader(message: string) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  getProgress() {
    return {
      ...this.progress,
      colorsUsed: Array.from(this.progress.colorsUsed),
      achievements: { ...this.achievements }
    };
  }

  getUnlockedAchievements(): Achievement[] {
    return Object.values(this.achievements).filter(a => a.unlocked);
  }

  getTotalAchievements(): number {
    return Object.keys(this.achievements).length;
  }

  getCompletionPercentage(): number {
    const unlocked = this.getUnlockedAchievements().length;
    const total = this.getTotalAchievements();
    return Math.round((unlocked / total) * 100);
  }

  private saveProgress() {
    const saveData = {
      achievements: Object.fromEntries(
        Object.entries(this.achievements).map(([key, achievement]) => [
          key, 
          { unlocked: achievement.unlocked }
        ])
      ),
      progress: {
        ...this.progress,
        colorsUsed: Array.from(this.progress.colorsUsed)
      }
    };

    this.saveToLocalStorage('sensorySketchpadProgress', saveData);
  }

  private loadProgress() {
    const saveData = this.loadFromLocalStorage('sensorySketchpadProgress');
    
    if (saveData) {
      // Load achievement states
      if (saveData.achievements) {
        Object.entries(saveData.achievements).forEach(([key, data]: [string, any]) => {
          if (this.achievements[key]) {
            this.achievements[key].unlocked = data.unlocked || false;
          }
        });
      }

      // Load progress data
      if (saveData.progress) {
        this.progress = {
          ...this.progress,
          ...saveData.progress,
          colorsUsed: new Set(saveData.progress.colorsUsed || [])
        };
      }
    }
  }

  private saveToLocalStorage(key: string, data: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
      return false;
    }
  }

  private loadFromLocalStorage(key: string, defaultValue: any = null): any {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return defaultValue;
    }
  }

  setCallbacks(callbacks: Partial<typeof this.callbacks>) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  resetProgress() {
    // Reset all achievements
    Object.values(this.achievements).forEach(achievement => {
      achievement.unlocked = false;
    });

    // Reset progress
    this.progress = {
      strokesMade: 0,
      songsPlayed: 0,
      colorsUsed: new Set(),
      canvasCleared: 0
    };

    this.saveProgress();
    
    this.announceToScreenReader('Achievement progress has been reset');
  }
}