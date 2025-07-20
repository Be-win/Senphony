// Pattern generator for default musical patterns

interface PatternData {
  x: number;
  y: number;
  color: string;
  note: string;
}

interface Pattern {
  name: string;
  description: string;
  icon: string;
  data: PatternData[];
}

export class PatternGenerator {
  private patterns: Record<string, () => PatternData[]> = {
    ascending: this.generateAscendingPattern.bind(this),
    descending: this.generateDescendingPattern.bind(this),
    wave: this.generateWavePattern.bind(this),
    mountain: this.generateMountainPattern.bind(this),
    spiral: this.generateSpiralPattern.bind(this),
    rain: this.generateRainPattern.bind(this)
  };

  private patternInfo: Record<string, { name: string; description: string; icon: string }> = {
    ascending: {
      name: 'Ascending Melody',
      description: 'A gentle rising melody',
      icon: '↗️'
    },
    descending: {
      name: 'Descending Melody',
      description: 'A peaceful falling melody',
      icon: '↘️'
    },
    wave: {
      name: 'Ocean Wave',
      description: 'A flowing wave pattern',
      icon: '🌊'
    },
    mountain: {
      name: 'Mountain Peak',
      description: 'A dramatic mountain shape',
      icon: '⛰️'
    },
    spiral: {
      name: 'Spiral Dance',
      description: 'A swirling spiral pattern',
      icon: '🌀'
    },
    rain: {
      name: 'Gentle Rain',
      description: 'Soft raindrops creating peaceful music',
      icon: '🌧️'
    }
  };

  generatePattern(patternId: string): Pattern | null {
    const generator = this.patterns[patternId];
    const info = this.patternInfo[patternId];
    
    if (!generator || !info) {
      return null;
    }

    return {
      ...info,
      data: generator()
    };
  }

  private generateAscendingPattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    for (let x = 50; x < canvasWidth - 50; x += 20) {
      const y = canvasHeight - 100 - (x - 50) * 0.3;
      data.push({ x, y, color: '#ff0080', note: 'C' });
      data.push({ x: x + 5, y: y - 10, color: '#00ff80', note: 'D' });
      data.push({ x: x + 10, y: y - 20, color: '#8000ff', note: 'E' });
    }
    return data;
  }

  private generateDescendingPattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    for (let x = 50; x < canvasWidth - 50; x += 20) {
      const y = (canvasHeight - 100) - (x - 50) * 0.3; // Use canvasHeight for proper positioning
      data.push({ x, y, color: '#ffff00', note: 'C2' });
      data.push({ x: x + 5, y: y + 10, color: '#00ffff', note: 'A' });
      data.push({ x: x + 10, y: y + 20, color: '#ff8000', note: 'G' });
    }
    return data;
  }

  private generateWavePattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    const centerY = canvasHeight / 2;
    
    for (let x = 50; x < canvasWidth - 50; x += 15) {
      const waveY = centerY + Math.sin((x - 50) * 0.02) * 80;
      const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff', '#ffff00'];
      const notes = ['C', 'D', 'E', 'G', 'A', 'C2'];
      const colorIndex = Math.floor((x - 50) / 50) % colors.length;
      
      data.push({ 
        x, 
        y: waveY, 
        color: colors[colorIndex], 
        note: notes[colorIndex] 
      });
    }
    return data;
  }

  private generateMountainPattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Left slope
    for (let x = 50; x < canvasWidth / 2; x += 15) {
      const y = canvasHeight - 100 - (x - 50) * 0.8;
      data.push({ x, y, color: '#00ff80', note: 'D' });
    }
    
    // Right slope
    for (let x = canvasWidth / 2; x < canvasWidth - 50; x += 15) {
      const y = canvasHeight - 100 - (canvasWidth - 50 - x) * 0.8;
      data.push({ x, y, color: '#8000ff', note: 'E' });
    }
    
    // Peak
    for (let x = canvasWidth / 2 - 20; x < canvasWidth / 2 + 20; x += 10) {
      const y = canvasHeight - 100;
      data.push({ x, y, color: '#ffff00', note: 'C2' });
    }
    
    return data;
  }

  private generateSpiralPattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    for (let angle = 0; angle < Math.PI * 6; angle += 0.2) {
      const radius = 20 + angle * 15;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (x > 50 && x < canvasWidth - 50 && y > 50 && y < canvasHeight - 50) {
        const colors = ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff', '#ffff00'];
        const notes = ['C', 'D', 'E', 'G', 'A', 'C2'];
        const colorIndex = Math.floor(angle / (Math.PI / 3)) % colors.length;
        
        data.push({ 
          x, 
          y, 
          color: colors[colorIndex], 
          note: notes[colorIndex] 
        });
      }
    }
    return data;
  }

  private generateRainPattern(): PatternData[] {
    const data: PatternData[] = [];
    const canvasWidth = 800;
    const canvasHeight = 600;
    const colors = ['#4a90e2', '#5ba3f5', '#6cb4ff', '#7dc5ff', '#8ed6ff', '#9fe7ff'];
    const notes = ['C', 'D', 'E', 'G', 'A', 'C2'];

    // Generate scattered raindrops across the canvas
    for (let i = 0; i < 80; i++) {
      const x = Math.random() * (canvasWidth - 100) + 50;
      const y = Math.random() * (canvasHeight - 100) + 50;

      // Create clusters of drops for more natural rain effect
      const clusterSize = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 3) : 1;

      for (let j = 0; j < clusterSize; j++) {
        const offsetX = x + (Math.random() - 0.5) * 30;
        const offsetY = y + (Math.random() - 0.5) * 30;

        // Ensure drops stay within canvas bounds
        if (offsetX >= 50 && offsetX <= canvasWidth - 50 &&
            offsetY >= 50 && offsetY <= canvasHeight - 50) {

          // Higher notes for drops higher on canvas (like rain falling)
          const heightRatio = 1 - (offsetY - 50) / (canvasHeight - 100);
          const noteIndex = Math.floor(heightRatio * notes.length);
          const colorIndex = Math.floor(heightRatio * colors.length);

          data.push({
            x: offsetX,
            y: offsetY,
            color: colors[Math.min(colorIndex, colors.length - 1)],
            note: notes[Math.min(noteIndex, notes.length - 1)]
          });
        }
      }
    }

    // Add some gentle horizontal lines to suggest rain streaks
    for (let i = 0; i < 15; i++) {
      const startX = Math.random() * (canvasWidth - 200) + 50;
      const y = Math.random() * (canvasHeight - 100) + 50;

      for (let x = startX; x < startX + 60 && x < canvasWidth - 50; x += 8) {
        const heightRatio = 1 - (y - 50) / (canvasHeight - 100);
        const noteIndex = Math.floor(heightRatio * notes.length);
        const colorIndex = Math.floor(heightRatio * colors.length);

        data.push({
          x: x + Math.random() * 4 - 2, // Add slight randomness
          y: y + Math.random() * 4 - 2,
          color: colors[Math.min(colorIndex, colors.length - 1)],
          note: notes[Math.min(noteIndex, notes.length - 1)]
        });
      }
    }

    return data;
  }
}