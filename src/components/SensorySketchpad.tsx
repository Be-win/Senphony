import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CanvasSection from './CanvasSection';
import StackViewer from './StackViewer';
import PlaybackProgress from './PlaybackProgress';
import AchievementGarden from './AchievementGarden';
import Notification from './Notification';
import { useSensorySketchpad } from '../hooks/useSensorySketchpad';

const SensorySketchpad: React.FC = () => {
  const skipLinkRef = useRef<HTMLAnchorElement>(null);
  const {
    isPlaying,
    hasDrawing,
    currentColor,
    currentNote,
    brushType,
    brushSize,
    volume,
    showGarden,
    achievements,
    notification,
    // Stack-related state
    stack,
    playbackState,
    stackInfo,
    // Stack operations
    handleAddToStack,
    handlePlayStack,
    handleRemoveFromStack,
    setActiveCanvas,
    clearStack,
    updateCanvasName,
    canvasRef,
    handleColorSelect,
    handleBrushSelect,
    handleBrushSizeChange,
    handleVolumeChange,
    handlePlayToggle,
    handleClearCanvas,
    handlePatternLoad,
    handleGardenToggle,
    hideNotification,
    // Instrument
    currentInstrument,
    handleInstrumentSelect
  } = useSensorySketchpad();

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case ' ': // Spacebar
          event.preventDefault();
          handlePlayToggle();
          break;
        case 'c':
        case 'C':
          if (!event.ctrlKey && !event.altKey) {
            event.preventDefault();
            handleClearCanvas();
          }
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          if (!event.ctrlKey && !event.altKey) {
            event.preventDefault();
            const colorIndex = parseInt(event.key) - 1;
            const colors = [
              { color: '#ff0080', note: 'C' },
              { color: '#00ff80', note: 'D' },
              { color: '#8000ff', note: 'E' },
              { color: '#ff8000', note: 'G' },
              { color: '#00ffff', note: 'A' },
              { color: '#ffff00', note: 'C2' }
            ];
            if (colors[colorIndex]) {
              handleColorSelect(colors[colorIndex].color, colors[colorIndex].note);
            }
          }
          break;
        case 'Escape':
          if (showGarden) {
            handleGardenToggle();
          }
          break;
        // Enhanced keyboard shortcuts for stack operations
        case 'a':
        case 'A':
          if (event.ctrlKey && !event.altKey) {
            event.preventDefault();
            if (hasDrawing) {
              handleAddToStack();
            }
          }
          break;
        case 'p':
        case 'P':
          if (event.ctrlKey && !event.altKey) {
            event.preventDefault();
            if (stack.length > 0) {
              handlePlayStack();
            }
          }
          break;
        case 's':
        case 'S':
          if (event.ctrlKey && !event.altKey) {
            event.preventDefault();
            if (playbackState.isPlaying) {
              // Stop playback - this would need to be implemented in the hook
              // For now, we'll just prevent the default
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayToggle, handleClearCanvas, handleColorSelect, showGarden, handleGardenToggle, hasDrawing, stack.length, playbackState.isPlaying, handleAddToStack, handlePlayStack]);

  return (
    <>
      {/* Skip to main content link for accessibility */}
      <a 
        ref={skipLinkRef}
        href="#main-content" 
        className="skip-link"
        onFocus={() => skipLinkRef.current?.scrollIntoView()}
      >
        Skip to main content
      </a>
      
      <div className="app-container">
        <Header
          volume={volume}
          onVolumeChange={handleVolumeChange}
          onGardenToggle={handleGardenToggle}
          achievementCount={achievements.filter(a => a.unlocked).length}
          totalAchievements={achievements.length}
        />

        <main id="main-content" className="main-content" role="main">
          <div className="workspace">
            <Sidebar
              currentColor={currentColor}
              currentNote={currentNote}
              onColorSelect={handleColorSelect}
              onPatternLoad={handlePatternLoad}
              // Stack props
              stack={stack}
              playbackState={playbackState}
              stackInfo={stackInfo}
              onAddToStack={handleAddToStack}
              onPlayStack={handlePlayStack}
              onRemoveFromStack={handleRemoveFromStack}
              onSetActiveCanvas={setActiveCanvas}
              onUpdateCanvasName={updateCanvasName}
              onClearStack={clearStack}
              // Instrument props
              currentInstrument={currentInstrument}
              onInstrumentSelect={handleInstrumentSelect}
            />

            <CanvasSection
              ref={canvasRef}
              isPlaying={isPlaying}
              hasDrawing={hasDrawing}
              brushType={brushType}
              brushSize={brushSize}
              onBrushSelect={handleBrushSelect}
              onBrushSizeChange={handleBrushSizeChange}
              onPlayToggle={handlePlayToggle}
              onClearCanvas={handleClearCanvas}
              // Stack props
              stackInfo={stackInfo}
              playbackState={playbackState}
              onAddToStack={handleAddToStack}
              onPlayStack={handlePlayStack}
            />

            {/* Right sidebar for stack during playback */}
            {playbackState.isPlaying && (
              <aside className="right-sidebar" role="complementary">
                <StackViewer
                  stack={stack}
                  currentPlayingId={playbackState.currentCanvasId}
                  onRemoveFromStack={handleRemoveFromStack}
                  onSetActiveCanvas={setActiveCanvas}
                  onUpdateCanvasName={updateCanvasName}
                  onClearStack={clearStack}
                />
                <PlaybackProgress
                  playbackState={playbackState}
                  stack={stack}
                />
              </aside>
            )}
          </div>
        </main>

        {showGarden && (
          <AchievementGarden
            achievements={achievements}
            onClose={handleGardenToggle}
          />
        )}

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
          />
        )}
      </div>
    </>
  );
};

export default SensorySketchpad;