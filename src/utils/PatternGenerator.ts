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
    spiral: this.generateSpiralPattern.bind(this)
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
      const y = 100 + (x - 50) * 0.3;
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
}