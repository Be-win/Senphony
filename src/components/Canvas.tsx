import React, { forwardRef, useEffect, useRef } from 'react';

interface CanvasProps {
  isPlaying: boolean;
  hasDrawing: boolean;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  isPlaying,
  hasDrawing
}, ref) => {
  const playheadRef = useRef<HTMLDivElement>(null);
  const instructionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasDrawing && instructionsRef.current) {
      instructionsRef.current.classList.add('hidden');
    } else if (!hasDrawing && instructionsRef.current) {
      instructionsRef.current.classList.remove('hidden');
    }
  }, [hasDrawing]);

  useEffect(() => {
    if (playheadRef.current) {
      if (isPlaying) {
        playheadRef.current.classList.add('active');
      } else {
        playheadRef.current.classList.remove('active');
      }
    }
  }, [isPlaying]);

  return (
    <section className="canvas-container">
      <canvas 
        ref={ref}
        id="drawingCanvas" 
        width="800" 
        height="600" 
        aria-label="Drawing canvas - draw here to create music" 
        tabIndex={0}
      />
      <div ref={playheadRef} className="playhead" aria-hidden="true" />
      <div className="canvas-overlay">
        <div 
          ref={instructionsRef}
          className="drawing-instructions" 
          id="instructions"
        >
          Start drawing to create your musical masterpiece! 🎵<br />
          Or try a default pattern to see how it works!
        </div>
      </div>
    </section>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;