const core = require('@actions/core');
const github = require('@actions/github');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

class TronLightCycleGenerator {
  constructor(username, theme = 'light') {
    this.username = username;
    this.theme = theme;
    this.width = 800;
    this.height = 400;
    this.gridSize = 8;
  }

  async generateAnimation() {
    try {
      // Fetch GitHub contribution data
      const contributionData = await this.fetchContributionData();
      
      // Generate the SVG animation
      const svg = this.createTronAnimation(contributionData);
      
      return svg;
    } catch (error) {
      core.setFailed(`Error generating animation: ${error.message}`);
      throw error;
    }
  }

  async fetchContributionData() {
    // Simplified: In a real implementation, you'd fetch actual GitHub contribution data
    // For now, we'll generate some sample data
    const weeks = 52;
    const daysPerWeek = 7;
    const data = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < daysPerWeek; day++) {
        weekData.push({
          date: new Date(2024, 0, week * 7 + day),
          count: Math.floor(Math.random() * 10),
          level: Math.floor(Math.random() * 5)
        });
      }
      data.push(weekData);
    }
    
    return data;
  }

  createTronAnimation(contributionData) {
    const colors = this.theme === 'dark' ? {
      background: '#0a0a0a',
      grid: '#00ffff',
      cycle: '#ff6600',
      trail: '#00ff00',
      accent: '#ffffff'
    } : {
      background: '#1a1a1a',
      grid: '#00cccc',
      cycle: '#ff8800',
      trail: '#00cc00',
      accent: '#cccccc'
    };

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
  <defs>
    <linearGradient id="cycleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.cycle};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.5" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <rect width="100%" height="100%" fill="${colors.background}"/>
  
  <!-- Grid lines -->
  ${this.generateGrid(colors.grid)}
  
  <!-- Light cycle path -->
  ${this.generateLightCyclePath(contributionData, colors)}
  
  <!-- Animated light cycle -->
  ${this.generateAnimatedCycle(colors)}
  
  <!-- Title -->
  <text x="20" y="30" fill="${colors.accent}" font-family="Orbitron, monospace" font-size="20" font-weight="bold">
    ${this.username.toUpperCase()} - TRON LIGHT CYCLES
    <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
  </text>
</svg>`;

    return svg;
  }

  generateGrid(gridColor) {
    let gridSvg = '';
    const spacing = 20;
    
    // Vertical lines
    for (let x = 0; x <= this.width; x += spacing) {
      gridSvg += `<line x1="${x}" y1="0" x2="${x}" y2="${this.height}" stroke="${gridColor}" stroke-width="0.5" opacity="0.3"/>`;
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.height; y += spacing) {
      gridSvg += `<line x1="0" y1="${y}" x2="${this.width}" y2="${y}" stroke="${gridColor}" stroke-width="0.5" opacity="0.3"/>`;
    }
    
    return gridSvg;
  }

  generateLightCyclePath(contributionData, colors) {
    let pathSvg = '';
    const startX = 50;
    const startY = 200;
    
    // Create a path based on contribution data
    let currentX = startX;
    let currentY = startY;
    let path = `M ${currentX} ${currentY}`;
    
    // Generate path segments based on contribution levels
    for (let i = 0; i < Math.min(contributionData.length, 30); i++) {
      const week = contributionData[i];
      const avgLevel = week.reduce((sum, day) => sum + day.level, 0) / week.length;
      
      // Determine direction and length based on contribution level
      const direction = (i % 4) * 90; // 0, 90, 180, 270 degrees
      const length = 20 + avgLevel * 10;
      
      switch (direction) {
        case 0: // Right
          currentX += length;
          break;
        case 90: // Down
          currentY += length;
          break;
        case 180: // Left
          currentX -= length;
          break;
        case 270: // Up
          currentY -= length;
          break;
      }
      
      // Keep within bounds
      currentX = Math.max(50, Math.min(this.width - 50, currentX));
      currentY = Math.max(50, Math.min(this.height - 50, currentY));
      
      path += ` L ${currentX} ${currentY}`;
    }
    
    pathSvg += `<path d="${path}" stroke="${colors.trail}" stroke-width="2" fill="none" filter="url(#glow)">
      <animate attributeName="stroke-dasharray" values="0,1000;10,990;0,1000" dur="3s" repeatCount="indefinite"/>
    </path>`;
    
    return pathSvg;
  }

  generateAnimatedCycle(colors) {
    return `
    <g filter="url(#glow)">
      <circle r="8" fill="url(#cycleGradient)" stroke="${colors.cycle}" stroke-width="2">
        <animateMotion dur="10s" repeatCount="indefinite" rotate="auto">
          <mpath href="#cyclePath"/>
        </animateMotion>
      </circle>
      
      <!-- Cycle trail -->
      <circle r="4" fill="${colors.trail}" opacity="0.6">
        <animateMotion dur="10s" repeatCount="indefinite" rotate="auto" begin="0.5s">
          <mpath href="#cyclePath"/>
        </animateMotion>
      </circle>
    </g>
    
    <path id="cyclePath" d="M 50 200 L 200 200 L 200 100 L 400 100 L 400 300 L 600 300 L 600 150 L 750 150" 
          stroke="none" fill="none"/>
    `;
  }
}

async function run() {
  try {
    const githubUserName = core.getInput('github_user_name');
    const outputs = core.getInput('outputs');
    
    if (!githubUserName) {
      core.setFailed('github_user_name is required');
      return;
    }

    const outputLines = outputs.split('\n').filter(line => line.trim());
    
    for (const output of outputLines) {
      const [filename, queryString] = output.split('?');
      const params = new URLSearchParams(queryString || '');
      const theme = params.get('theme') || 'light';
      
      core.info(`Generating ${filename} with theme: ${theme}`);
      
      const generator = new TronLightCycleGenerator(githubUserName, theme);
      const svg = await generator.generateAnimation();
      
      // Ensure output directory exists
      const outputDir = path.dirname(filename);
      if (outputDir && outputDir !== '.') {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(filename, svg);
      core.info(`Generated ${filename}`);
    }
    
    core.setOutput('generated_files', outputLines.join(','));
  } catch (error) {
    core.setFailed(error.message);
  }
}

run(); 