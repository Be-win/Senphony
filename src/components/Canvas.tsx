// @ts-ignore
import React, { forwardRef, useEffect, useRef, useState } from 'react';

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
  const [drawingStatus, setDrawingStatus] = useState('');

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

  // Enhanced status announcements for screen readers
  useEffect(() => {
    if (hasDrawing) {
      setDrawingStatus('Drawing created. Ready to play or add to stack.');
    } else {
      setDrawingStatus('Canvas is empty. Start drawing to create music.');
    }
  }, [hasDrawing]);

  return (
    <section className="canvas-container">
      {/* Status announcements for screen readers */}
      <div className="sr-only" aria-live="polite">
        {drawingStatus}
      </div>
      
      <canvas 
        ref={ref}
        id="drawingCanvas" 
        width="800" 
        height="600" 
        aria-label="Drawing canvas - draw here to create music. Use mouse or touch to draw. Each color creates a different musical note."
        aria-describedby="canvas-instructions"
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
      
      {/* Detailed instructions for screen readers */}
      <div id="canvas-instructions" className="sr-only">
        Drawing canvas. Click and drag to draw. Each color creates a different musical note. 
        Pink creates note C, Green creates note D, Purple creates note E, Orange creates note G, 
        Cyan creates note A, Yellow creates note C2. Use the brush tools to change drawing style.
        Press spacebar to play or pause your creation.
      </div>
    </section>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;