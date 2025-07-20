// Achievement system for Sensory Sketchpad

class AchievementManager {
    constructor() {
        this.achievements = {
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

        this.progress = {
            strokesMade: 0,
            songsPlayed: 0,
            colorsUsed: new Set(),
            canvasCleared: 0
        };

        this.callbacks = {
            onAchievementUnlocked: null,
            onProgressUpdate: null
        };

        this.loadProgress();
        this.initializeUI();
    }

    initializeUI() {
        // Update achievement display
        this.updateAchievementDisplay();
        
        // Set up event listeners for garden toggle
        const gardenToggle = document.getElementById('gardenToggle');
        const achievementGarden = document.getElementById('achievementGarden');
        
        if (gardenToggle && achievementGarden) {
            gardenToggle.addEventListener('click', () => {
                this.toggleGarden();
            });

            // Close garden when clicking outside
            achievementGarden.addEventListener('click', (e) => {
                if (e.target === achievementGarden) {
                    this.hideGarden();
                }
            });

            // Close garden with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !achievementGarden.classList.contains('hidden')) {
                    this.hideGarden();
                }
            });
        }
    }

    recordProgress(action, data = {}) {
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
        this.updateAchievementDisplay();

        if (this.callbacks.onProgressUpdate) {
            this.callbacks.onProgressUpdate(this.progress);
        }

        return achievementUnlocked;
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements[achievementId];
        if (!achievement || achievement.unlocked) {
            return false;
        }

        achievement.unlocked = true;
        this.saveProgress();
        this.showAchievementNotification(achievement);
        
        if (this.callbacks.onAchievementUnlocked) {
            this.callbacks.onAchievementUnlocked(achievement);
        }

        Utils.announceToScreenReader(`Achievement unlocked: ${achievement.name}! ${achievement.description}`);
        
        return true;
    }

    showAchievementNotification(achievement) {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">${achievement.icon}</span>
                <div>
                    <div style="font-weight: bold;">Achievement Unlocked!</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">${achievement.name}: ${achievement.description}</div>
                </div>
            </div>
        `;

        notification.classList.remove('hidden');
        notification.classList.add('show');

        // Auto-hide after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300);
        }, 4000);

        // Haptic feedback
        Utils.vibrate([100, 50, 100]);
    }

    updateAchievementDisplay() {
        Object.values(this.achievements).forEach(achievement => {
            const element = document.querySelector(`[data-achievement="${achievement.id}"]`);
            if (element) {
                if (achievement.unlocked) {
                    element.classList.add('unlocked');
                    element.setAttribute('aria-label', `${achievement.name} - Unlocked! ${achievement.description}`);
                } else {
                    element.classList.remove('unlocked');
                    element.setAttribute('aria-label', `${achievement.name} - Locked. ${achievement.description}`);
                }
            }
        });

        // Update garden button to show progress
        const gardenToggle = document.getElementById('gardenToggle');
        if (gardenToggle) {
            const unlockedCount = Object.values(this.achievements).filter(a => a.unlocked).length;
            const totalCount = Object.keys(this.achievements).length;
            
            const originalText = gardenToggle.textContent.split(' (')[0];
            gardenToggle.textContent = `${originalText} (${unlockedCount}/${totalCount})`;
            gardenToggle.setAttribute('aria-label', `My Achievement Garden - ${unlockedCount} out of ${totalCount} achievements unlocked`);
        }
    }

    toggleGarden() {
        const garden = document.getElementById('achievementGarden');
        if (garden) {
            if (garden.classList.contains('hidden')) {
                this.showGarden();
            } else {
                this.hideGarden();
            }
        }
    }

    showGarden() {
        const garden = document.getElementById('achievementGarden');
        if (garden) {
            garden.classList.remove('hidden');
            garden.setAttribute('aria-hidden', 'false');
            
            // Focus management
            const firstAchievement = garden.querySelector('.achievement');
            if (firstAchievement) {
                firstAchievement.focus();
            }
            
            Utils.announceToScreenReader('Achievement garden opened');
        }
    }

    hideGarden() {
        const garden = document.getElementById('achievementGarden');
        if (garden) {
            garden.classList.add('hidden');
            garden.setAttribute('aria-hidden', 'true');
            
            // Return focus to garden toggle
            const gardenToggle = document.getElementById('gardenToggle');
            if (gardenToggle) {
                gardenToggle.focus();
            }
            
            Utils.announceToScreenReader('Achievement garden closed');
        }
    }

    getProgress() {
        return {
            ...this.progress,
            colorsUsed: Array.from(this.progress.colorsUsed),
            achievements: { ...this.achievements }
        };
    }

    getUnlockedAchievements() {
        return Object.values(this.achievements).filter(a => a.unlocked);
    }

    getTotalAchievements() {
        return Object.keys(this.achievements).length;
    }

    getCompletionPercentage() {
        const unlocked = this.getUnlockedAchievements().length;
        const total = this.getTotalAchievements();
        return Math.round((unlocked / total) * 100);
    }

    saveProgress() {
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

        Utils.saveToLocalStorage('sensorySketchpadProgress', saveData);
    }

    loadProgress() {
        const saveData = Utils.loadFromLocalStorage('sensorySketchpadProgress');
        
        if (saveData) {
            // Load achievement states
            if (saveData.achievements) {
                Object.entries(saveData.achievements).forEach(([key, data]) => {
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
        this.updateAchievementDisplay();
        
        Utils.announceToScreenReader('Achievement progress has been reset');
    }

    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
}

// Export for use in other modules
window.AchievementManager = AchievementManager;