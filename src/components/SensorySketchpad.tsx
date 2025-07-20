import React, { useEffect, useRef } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import CanvasSection from './CanvasSection';
import StackViewer from './StackViewer';
import PlaybackProgress from './PlaybackProgress';
import AchievementGarden from './AchievementGarden';
import Notification from './Notification';
import { useSensorySketchpad } from '../hooks/useSensorySketchpad';
import { Point } from '../types';

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
    setNotification,
    // Stack-related state
    stack,
    playbackState,
    stackInfo,
    // Stack operations
    handleAddToStack,
    handlePlayStack,
    handleStopStack,
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
    // handlePatternLoad,
    handleGardenToggle,
    hideNotification,
    // Instrument
    currentInstrument,
    handleInstrumentSelect,
    moveCanvasInStack,
    addToStack,
    playbackSpeed,
    setPlaybackSpeed,
  } = useSensorySketchpad();

  // Handler to load a demo song (multi-canvas stack)
  const handleLoadDemoSong = async () => {
    // Clear the stack
    clearStack();
    // Wait a tick to ensure stack is cleared
    await new Promise(r => setTimeout(r, 50));

    // Twinkle Twinkle Little Star melody with proper timing
    // We'll create 4 canvases, each with a musical phrase of ~3 seconds
    const noteMap: Record<string, { color: string; y: number }> = {
      C: { color: '#ff0080', y: 500 },
      G: { color: '#ff8000', y: 300 },
      A: { color: '#00ffff', y: 250 },
      E: { color: '#8000ff', y: 400 },
      D: { color: '#00ff80', y: 450 },
    };

    // Define the musical phrases (each canvas will be ~3 seconds)
    const phrases = [
      {
        name: "Twinkle Twinkle",
        notes: ['C', 'C', 'G', 'G'], // "Twinkle twinkle little star"
        timings: [0, 0.5, 1.0, 1.5] // Timing within the 3-second canvas
      },
      {
        name: "How I Wonder",
        notes: ['A', 'A', 'G', 'G'], // "How I wonder what you are"
        timings: [0, 0.5, 1.0, 1.5]
      },
      {
        name: "Up Above World",
        notes: ['E', 'E', 'D', 'D'], // "Up above the world so high"
        timings: [0, 0.5, 1.0, 1.5]
      },
      {
        name: "Like Diamond",
        notes: ['C', 'C', 'C', 'C'], // "Like a diamond in the sky" (ending on tonic)
        timings: [0, 0.75, 1.5, 2.25]
      }
    ];

    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const phrase = phrases[phraseIndex];
      const data: Point[] = [];

      // Create drawing data for this phrase
      for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
        const note = phrase.notes[noteIndex];
        const timing = phrase.timings[noteIndex];
        const { color, y } = noteMap[note];

        // Calculate x position based on timing (spread across canvas width)
        const startX = 100 + (timing / 3.0) * 500; // Map 0-3 seconds to 100-600px
        const endX = startX + 80; // Short stroke for each note

        // Add multiple points for each note to create a visible stroke
        const pointsPerNote = 5;
        for (let p = 0; p < pointsPerNote; p++) {
          const progress = p / (pointsPerNote - 1);
          data.push({
            x: startX + (endX - startX) * progress,
            y: y + Math.sin(progress * Math.PI) * 10, // Slight curve
            color,
            note,
            brushSize: 10,
            brushType: 'smooth',
            timestamp: timing + (progress * 0.2) // Spread note over 0.2 seconds
          });
        }
      }

      if (canvasRef.current && data.length > 0) {
        // Draw the phrase to the canvas for thumbnail
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw each note in the phrase
          for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
            const note = phrase.notes[noteIndex];
            const timing = phrase.timings[noteIndex];
            const { color, y } = noteMap[note];
            const startX = 100 + (timing / 3.0) * 500;
            const endX = startX + 80;

            ctx.strokeStyle = color;
            ctx.lineWidth = 10;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(startX, y - 10);
            ctx.quadraticCurveTo(startX + 40, y + 10, endX, y - 10);
            ctx.stroke();

            // Add note label for clarity
            ctx.fillStyle = color;
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(note, startX + 40, y - 20);
          }
        }

        addToStack(data, canvasRef.current, phrase.name);

        // Small delay between adding canvases for better UX
        await new Promise(r => setTimeout(r, 100));
      }
    }

    // Show success notification
    setNotification({
      message: `Loaded "Twinkle Twinkle Little Star" with ${phrases.length} musical phrases!`,
      type: 'success'
    });
  };

  // Handler to load Mary Had a Little Lamb demo song
  const handleLoadMaryDemo = async () => {
    // Clear the stack
    clearStack();
    // Wait a tick to ensure stack is cleared
    await new Promise(r => setTimeout(r, 50));

    // Mary Had a Little Lamb melody (E D C D E E E | D D D | E G G)
    // Using our pentatonic scale: E D C D E E E | D D D | E G G
    const noteMap: Record<string, { color: string; y: number }> = {
      C: { color: '#ff0080', y: 500 },
      D: { color: '#00ff80', y: 450 },
      E: { color: '#8000ff', y: 400 },
      G: { color: '#ff8000', y: 300 },
      A: { color: '#00ffff', y: 250 },
    };

    // Define the musical phrases for Mary Had a Little Lamb
    const phrases = [
      {
        name: "Mary Had Little",
        notes: ['E', 'D', 'C', 'D'], // "Mary had a little"
        timings: [0, 0.6, 1.2, 1.8] // Slightly different rhythm
      },
      {
        name: "Lamb Lamb Lamb",
        notes: ['E', 'E', 'E', 'E'], // "lamb, little lamb, little lamb"
        timings: [0, 0.8, 1.6, 2.4]
      },
      {
        name: "Mary Had Little",
        notes: ['D', 'D', 'D', 'D'], // "Mary had a little"
        timings: [0, 0.8, 1.6, 2.4]
      },
      {
        name: "Lamb White Snow",
        notes: ['E', 'G', 'G', 'E'], // "lamb, its fleece was white as snow"
        timings: [0, 0.8, 1.6, 2.4]
      }
    ];

    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const phrase = phrases[phraseIndex];
      const data: Point[] = [];

      // Create drawing data for this phrase
      for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
        const note = phrase.notes[noteIndex];
        const timing = phrase.timings[noteIndex];
        const { color, y } = noteMap[note];

        // Calculate x position based on timing (spread across canvas width)
        const startX = 100 + (timing / 3.0) * 500; // Map 0-3 seconds to 100-600px
        const endX = startX + 70; // Slightly smaller strokes for Mary

        // Add multiple points for each note to create a visible stroke
        const pointsPerNote = 6;
        for (let p = 0; p < pointsPerNote; p++) {
          const progress = p / (pointsPerNote - 1);
          // Create different visual patterns for each phrase
          const yOffset = phraseIndex === 0 ? Math.cos(progress * Math.PI * 2) * 8 : // Wavy for first
            phraseIndex === 1 ? Math.sin(progress * Math.PI) * 12 : // Arch for second
              phraseIndex === 2 ? (progress - 0.5) * 16 : // Diagonal for third
                Math.sin(progress * Math.PI * 3) * 6; // Zigzag for fourth

          data.push({
            x: startX + (endX - startX) * progress,
            y: y + yOffset,
            color,
            note,
            brushSize: 8 + phraseIndex, // Varying brush sizes
            brushType: phraseIndex % 2 === 0 ? 'smooth' : 'sparkle', // Alternate brush types
            timestamp: timing + (progress * 0.25) // Spread note over 0.25 seconds
          });
        }
      }

      if (canvasRef.current && data.length > 0) {
        // Draw the phrase to the canvas for thumbnail
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw each note in the phrase with unique styling
          for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
            const note = phrase.notes[noteIndex];
            const timing = phrase.timings[noteIndex];
            const { color, y } = noteMap[note];
            const startX = 100 + (timing / 3.0) * 500;
            const endX = startX + 70;

            ctx.strokeStyle = color;
            ctx.lineWidth = 8 + phraseIndex;
            ctx.lineCap = 'round';

            // Different drawing styles for each phrase
            ctx.beginPath();
            if (phraseIndex === 0) {
              // Wavy line
              ctx.moveTo(startX, y);
              ctx.quadraticCurveTo(startX + 35, y - 15, endX, y);
            } else if (phraseIndex === 1) {
              // Arch
              ctx.moveTo(startX, y + 10);
              ctx.quadraticCurveTo(startX + 35, y - 20, endX, y + 10);
            } else if (phraseIndex === 2) {
              // Diagonal
              ctx.moveTo(startX, y + 10);
              ctx.lineTo(endX, y - 10);
            } else {
              // Zigzag
              ctx.moveTo(startX, y);
              ctx.lineTo(startX + 25, y - 15);
              ctx.lineTo(startX + 50, y + 15);
              ctx.lineTo(endX, y);
            }
            ctx.stroke();

            // Add note label with background for better readability
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(startX + 30, y - 35, 20, 16);
            ctx.fillStyle = color;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(note, startX + 40, y - 22);
          }
        }

        addToStack(data, canvasRef.current, phrase.name);

        // Small delay between adding canvases for better UX
        await new Promise(r => setTimeout(r, 120));
      }
    }

    // Show success notification
    setNotification({
      message: `Loaded "Mary Had a Little Lamb" with ${phrases.length} musical phrases!`,
      type: 'success'
    });
  };

  // Handler to load a soothing ambient demo song
  const handleLoadSoothingDemo = async () => {
    // Clear the stack
    clearStack();
    // Wait a tick to ensure stack is cleared
    await new Promise(r => setTimeout(r, 50));

    // Soothing ambient melody using our pentatonic scale
    // Creates a meditative, flowing musical experience
    const noteMap: Record<string, { color: string; y: number }> = {
      C: { color: '#ff0080', y: 500 },
      D: { color: '#00ff80', y: 450 },
      E: { color: '#8000ff', y: 400 },
      G: { color: '#ff8000', y: 300 },
      A: { color: '#00ffff', y: 250 },
    };

    // Define soothing musical phrases with longer, flowing notes
    const phrases = [
      {
        name: "Gentle Awakening",
        notes: ['C', 'E', 'G', 'A'], // Rising gently
        timings: [0, 0.8, 1.6, 2.4], // Slower, more relaxed timing
        pattern: 'flowing'
      },
      {
        name: "Peaceful Drift",
        notes: ['A', 'G', 'E', 'D'], // Descending peacefully
        timings: [0, 0.9, 1.8, 2.7],
        pattern: 'wave'
      },
      {
        name: "Calm Waters",
        notes: ['D', 'E', 'C', 'G'], // Gentle undulation
        timings: [0, 1.0, 2.0, 2.8],
        pattern: 'ripple'
      },
      {
        name: "Serene Rest",
        notes: ['G', 'E', 'D', 'C'], // Settling down to rest
        timings: [0, 0.7, 1.5, 2.5],
        pattern: 'settle'
      }
    ];

    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const phrase = phrases[phraseIndex];
      const data: Point[] = [];

      // Create drawing data for this soothing phrase
      for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
        const note = phrase.notes[noteIndex];
        const timing = phrase.timings[noteIndex];
        const { color, y } = noteMap[note];

        // Calculate x position based on timing (spread across canvas width)
        const startX = 80 + (timing / 3.0) * 540; // Slightly wider spread
        const endX = startX + 90; // Longer strokes for soothing effect

        // Add more points for each note to create smoother, flowing strokes
        const pointsPerNote = 8; // More points for smoother curves
        for (let p = 0; p < pointsPerNote; p++) {
          const progress = p / (pointsPerNote - 1);

          // Create different soothing visual patterns for each phrase
          let yOffset = 0;
          switch (phrase.pattern) {
            case 'flowing':
              // Gentle sine wave
              yOffset = Math.sin(progress * Math.PI * 1.5) * 15;
              break;
            case 'wave':
              // Oceanic wave pattern
              yOffset = Math.sin(progress * Math.PI * 2) * 20 * Math.cos(progress * Math.PI);
              break;
            case 'ripple':
              // Expanding ripple effect
              yOffset = Math.sin(progress * Math.PI * 4) * 12 * (1 - progress);
              break;
            case 'settle':
              // Gentle settling motion
              yOffset = Math.cos(progress * Math.PI * 1.2) * 18 * (1 - progress * 0.5);
              break;
          }

          data.push({
            x: startX + (endX - startX) * progress,
            y: y + yOffset,
            color,
            note,
            brushSize: 12 + Math.sin(progress * Math.PI) * 3, // Variable brush size for organic feel
            brushType: 'smooth', // Always smooth for soothing effect
            timestamp: timing + (progress * 0.4) // Longer note duration for ambient feel
          });
        }
      }

      if (canvasRef.current && data.length > 0) {
        // Draw the phrase to the canvas for thumbnail with ambient styling
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Create ambient background gradient
          const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, canvasRef.current.height);
          gradient.addColorStop(0, 'rgba(200, 220, 255, 0.1)');
          gradient.addColorStop(1, 'rgba(255, 200, 220, 0.1)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw each note with soft, glowing effect
          for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
            const note = phrase.notes[noteIndex];
            const timing = phrase.timings[noteIndex];
            const { color, y } = noteMap[note];
            const startX = 80 + (timing / 3.0) * 540;
            const endX = startX + 90;

            // Create glowing effect
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.strokeStyle = color;
            ctx.lineWidth = 8;
            ctx.lineCap = 'round';
            ctx.globalAlpha = 0.8;

            // Draw flowing curves based on pattern
            ctx.beginPath();
            switch (phrase.pattern) {
              case 'flowing':
                ctx.moveTo(startX, y);
                ctx.bezierCurveTo(startX + 30, y - 15, startX + 60, y + 15, endX, y);
                break;
              case 'wave':
                ctx.moveTo(startX, y + 10);
                ctx.bezierCurveTo(startX + 22, y - 20, startX + 68, y + 20, endX, y - 10);
                break;
              case 'ripple':
                ctx.moveTo(startX, y);
                ctx.quadraticCurveTo(startX + 45, y - 25, endX, y);
                break;
              case 'settle':
                ctx.moveTo(startX, y - 10);
                ctx.bezierCurveTo(startX + 20, y - 25, startX + 70, y + 5, endX, y + 10);
                break;
            }
            ctx.stroke();

            // Reset shadow and alpha
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Add soft note label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(startX + 35, y - 35, 20, 16);
            ctx.fillStyle = color;
            ctx.font = 'italic 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(note, startX + 45, y - 22);
          }
        }

        addToStack(data, canvasRef.current, phrase.name);

        // Longer delay between adding canvases for peaceful loading
        await new Promise(r => setTimeout(r, 150));
      }
    }

    // Show success notification
    setNotification({
      message: `Loaded "Soothing Ambient" - a peaceful musical journey with ${phrases.length} flowing phrases!`,
      type: 'success'
    });
  };

  // Handler to load a continuous flowing demo song
  const handleLoadContinuousDemo = async () => {
    // Clear the stack
    clearStack();
    // Wait a tick to ensure stack is cleared
    await new Promise(r => setTimeout(r, 50));

    // Continuous Flow - A seamless musical journey with no gaps
    // Each canvas flows directly into the next with overlapping notes
    const noteMap: Record<string, { color: string; y: number }> = {
      C: { color: '#ff0080', y: 500 },
      D: { color: '#00ff80', y: 450 },
      E: { color: '#8000ff', y: 400 },
      G: { color: '#ff8000', y: 300 },
      A: { color: '#00ffff', y: 250 },
    };

    // Define continuous musical phrases with overlapping timing
    const phrases = [
      {
        name: "River Start",
        notes: ['C', 'D', 'E', 'G', 'A', 'G'], // Ascending flow
        timings: [0, 0.4, 0.8, 1.2, 1.6, 2.0], // Dense timing, no gaps
        pattern: 'stream'
      },
      {
        name: "Flowing Current",
        notes: ['A', 'G', 'E', 'D', 'C', 'E'], // Connecting phrase
        timings: [0, 0.3, 0.6, 0.9, 1.2, 1.5], // Overlapping with previous
        pattern: 'current'
      },
      {
        name: "Cascading Water",
        notes: ['E', 'G', 'A', 'E', 'D', 'G'], // Cascading pattern
        timings: [0, 0.2, 0.4, 0.8, 1.2, 1.6], // Very tight timing
        pattern: 'cascade'
      },
      {
        name: "Ocean Merge",
        notes: ['G', 'E', 'D', 'C', 'D', 'C'], // Settling into ocean
        timings: [0, 0.5, 1.0, 1.5, 2.0, 2.5], // Gradual ending
        pattern: 'merge'
      }
    ];

    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const phrase = phrases[phraseIndex];
      const data: Point[] = [];

      // Create drawing data for this continuous phrase
      for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
        const note = phrase.notes[noteIndex];
        const timing = phrase.timings[noteIndex];
        const { color, y } = noteMap[note];

        // Calculate x position based on timing (spread across canvas width)
        const startX = 60 + (timing / 3.0) * 560; // Use more canvas width
        const endX = startX + 120; // Longer strokes for continuous effect

        // Add many points for each note to create ultra-smooth, continuous strokes
        const pointsPerNote = 12; // Maximum smoothness
        for (let p = 0; p < pointsPerNote; p++) {
          const progress = p / (pointsPerNote - 1);

          // Create flowing continuous visual patterns
          let yOffset = 0;
          switch (phrase.pattern) {
            case 'stream':
              // Gentle flowing stream
              yOffset = Math.sin(progress * Math.PI * 2 + timing) * 8 + Math.cos(timing * 2) * 4;
              break;
            case 'current':
              // Stronger current with momentum
              yOffset = Math.sin(progress * Math.PI * 3 + timing * 1.5) * 12 + Math.sin(timing * 3) * 6;
              break;
            case 'cascade':
              // Cascading waterfall effect
              yOffset = Math.sin(progress * Math.PI * 4 + timing * 2) * 15 * (1 + timing * 0.3);
              break;
            case 'merge':
              // Merging into calm ocean
              yOffset = Math.cos(progress * Math.PI + timing) * 10 * (1 - timing * 0.2);
              break;
          }

          data.push({
            x: startX + (endX - startX) * progress,
            y: y + yOffset,
            color,
            note,
            brushSize: 10 + Math.sin(progress * Math.PI + timing) * 4, // Dynamic brush size
            brushType: 'smooth', // Always smooth for continuous flow
            timestamp: timing + (progress * 0.15) // Very short note spread for continuity
          });
        }

        // Add connecting points between notes for seamless flow
        if (noteIndex < phrase.notes.length - 1) {
          const nextNote = phrase.notes[noteIndex + 1];
          const nextTiming = phrase.timings[noteIndex + 1];
          const nextColor = noteMap[nextNote].color;
          const nextY = noteMap[nextNote].y;

          // Create bridge points between notes
          const bridgePoints = 6;
          for (let b = 1; b < bridgePoints; b++) {
            const bridgeProgress = b / bridgePoints;
            const bridgeTime = timing + 0.15 + (bridgeProgress * (nextTiming - timing - 0.15));

            data.push({
              x: 60 + (bridgeTime / 3.0) * 560,
              y: y + (nextY - y) * bridgeProgress + Math.sin(bridgeProgress * Math.PI) * 5,
              color: blendColors(color, nextColor, bridgeProgress),
              note: bridgeProgress < 0.5 ? note : nextNote,
              brushSize: 8,
              brushType: 'smooth',
              timestamp: bridgeTime
            });
          }
        }
      }

      if (canvasRef.current && data.length > 0) {
        // Draw the phrase to the canvas for thumbnail with flowing styling
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Create flowing background
          const gradient = ctx.createLinearGradient(0, 0, canvasRef.current.width, 0);
          gradient.addColorStop(0, 'rgba(100, 200, 255, 0.05)');
          gradient.addColorStop(0.5, 'rgba(150, 255, 200, 0.05)');
          gradient.addColorStop(1, 'rgba(200, 150, 255, 0.05)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);

          // Draw continuous flowing lines connecting all notes
          ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          let firstPoint = true;

          for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
            const note = phrase.notes[noteIndex];
            const timing = phrase.timings[noteIndex];
            const { color, y } = noteMap[note];
            const x = 60 + (timing / 3.0) * 560;

            if (firstPoint) {
              ctx.moveTo(x, y);
              firstPoint = false;
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          // Draw each note with flowing effect
          for (let noteIndex = 0; noteIndex < phrase.notes.length; noteIndex++) {
            const note = phrase.notes[noteIndex];
            const timing = phrase.timings[noteIndex];
            const { color, y } = noteMap[note];
            const startX = 60 + (timing / 3.0) * 560;
            const endX = startX + 120;

            // Create flowing effect with multiple layers
            for (let layer = 0; layer < 3; layer++) {
              ctx.strokeStyle = color;
              ctx.lineWidth = 12 - layer * 3;
              ctx.globalAlpha = 0.4 - layer * 0.1;
              ctx.lineCap = 'round';

              ctx.beginPath();
              ctx.moveTo(startX, y + layer * 2);

              // Create flowing curve based on pattern
              switch (phrase.pattern) {
                case 'stream':
                  ctx.quadraticCurveTo(startX + 60, y - 10 - layer * 2, endX, y + layer * 2);
                  break;
                case 'current':
                  ctx.bezierCurveTo(startX + 30, y - 15, startX + 90, y + 15, endX, y - 5);
                  break;
                case 'cascade':
                  ctx.bezierCurveTo(startX + 20, y - 20, startX + 100, y + 10, endX, y - 10);
                  break;
                case 'merge':
                  ctx.quadraticCurveTo(startX + 60, y + 8, endX, y - 3);
                  break;
              }
              ctx.stroke();
            }

            // Reset alpha
            ctx.globalAlpha = 1;

            // Add flowing note label
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(startX + 50, y - 30, 20, 14);
            ctx.fillStyle = color;
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(note, startX + 60, y - 20);
          }
        }

        addToStack(data, canvasRef.current, phrase.name);

        // Minimal delay to maintain flow feeling
        await new Promise(r => setTimeout(r, 80));
      }
    }

    // Show success notification
    setNotification({
      message: `Loaded "Continuous Flow" - seamless music with ${phrases.length} connected phrases!`,
      type: 'success'
    });
  };

  // Helper function to blend colors for smooth transitions
  const blendColors = (color1: string, color2: string, ratio: number): string => {
    // Simple color blending for continuous effect
    const hex1 = color1.substring(1);
    const hex2 = color2.substring(1);

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

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
              onLoadDemoSong={handleLoadDemoSong}
              onLoadMaryDemo={handleLoadMaryDemo}
              onLoadSoothingDemo={handleLoadSoothingDemo}
              onLoadContinuousDemo={handleLoadContinuousDemo}
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
              onStopStack={handleStopStack}
            />

            {/* Right sidebar for stack and playback progress, always visible */}
            <aside className="right-sidebar" role="complementary">
              <StackViewer
                stack={stack}
                currentPlayingId={playbackState.currentCanvasId}
                onRemoveFromStack={handleRemoveFromStack}
                onSetActiveCanvas={setActiveCanvas}
                onUpdateCanvasName={updateCanvasName}
                onClearStack={clearStack}
                moveCanvasInStack={moveCanvasInStack}
                playbackSpeed={playbackSpeed}
                setPlaybackSpeed={setPlaybackSpeed}
              />
              <PlaybackProgress
                playbackState={playbackState}
                stack={stack}
              />
            </aside>
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
