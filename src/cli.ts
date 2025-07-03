#!/usr/bin/env node

import { Command } from "commander";
import * as fs from "fs-extra";
import * as path from "path";

interface InitOptions {
  user: string;
  dir: string;
}

interface GenerateSvgOptions {
  user: string;
  output: string;
  theme: string;
  width: string;
  height: string;
}

const program = new Command();

program
  .name("tron-github")
  .description(
    "Create an auto-playing Tron Light Cycles game on your GitHub contribution grid"
  )
  .version("1.0.0");

program
  .command("init")
  .description("Initialize a new Tron GitHub project")
  .requiredOption("--user <username>", "GitHub username")
  .option("--dir <directory>", "Project directory name", "tron-github")
  .action(async (options: InitOptions) => {
    const { user, dir } = options;
    const projectPath = path.resolve(process.cwd(), dir);

    try {
      // Create project directory
      await fs.ensureDir(projectPath);

      // Copy template files
      const templatePath = path.join(__dirname, "..", "templates");
      await fs.copy(templatePath, projectPath);

      // Update main.ts with the username
      const mainTsPath = path.join(projectPath, "src", "main.ts");
      let mainTsContent = await fs.readFile(mainTsPath, "utf-8");
      mainTsContent = mainTsContent.replace("__GITHUB_USERNAME__", user);
      await fs.writeFile(mainTsPath, mainTsContent);

      // Update package.json name
      const packageJsonPath = path.join(projectPath, "package.json");
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.name = `${user}-tron-github`;
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

      console.log(`🏍️ Tron GitHub project created successfully!`);
      console.log(`📁 Project location: ${projectPath}`);
      console.log(`\n🚀 Next steps:`);
      console.log(`   cd ${dir}`);
      console.log(`   npm install`);
      console.log(`   npm run dev`);
      console.log(`\n🌐 To deploy to GitHub Pages:`);
      console.log(`   1. Create a GitHub repository named "${dir}"`);
      console.log(`   2. Push your code to the repository`);
      console.log(
        `   3. Enable GitHub Pages in repository settings (source: GitHub Actions)`
      );
      console.log(
        `   4. Your game will be available at: https://${user}.github.io/${dir}/`
      );
      console.log(`\n📋 Add to your GitHub profile README:`);
      console.log(
        `\n[![Tron GitHub](https://${user}.github.io/${dir}/preview.png)](https://${user}.github.io/${dir}/)`
      );
      console.log(
        `\n🎮 Watch AI light cycles race through your contribution data!`
      );
    } catch (error) {
      console.error("❌ Error creating project:", error);
      process.exit(1);
    }
  });

program
  .command("generate-svg")
  .description("Generate SVG animation from GitHub contribution data")
  .requiredOption("--user <username>", "GitHub username")
  .requiredOption("--output <filename>", "Output SVG filename")
  .option("--theme <theme>", "Theme (light or dark)", "light")
  .option("--width <width>", "SVG width", "800")
  .option("--height <height>", "SVG height", "400")
  .action(async (options: GenerateSvgOptions) => {
    const { user, output, theme, width, height } = options;

    try {
      console.log(`🎮 Generating Tron Light Cycles SVG for ${user}...`);

      // Generate the SVG content
      const svgContent = await generateTronSVG(
        user,
        theme,
        parseInt(width),
        parseInt(height)
      );

      // Write to file
      await fs.writeFile(output, svgContent);

      console.log(`✅ Successfully generated ${output}`);
      console.log(`📊 Theme: ${theme}`);
      console.log(`📐 Dimensions: ${width}x${height}`);
    } catch (error) {
      console.error("❌ Error generating SVG:", error);
      process.exit(1);
    }
  });

/**
 * Generate SVG content with Tron Light Cycles animation
 */
async function generateTronSVG(
  username: string,
  theme: string,
  width: number,
  height: number
): Promise<string> {
  // Mock contribution data for now - in a real implementation this would fetch from GitHub
  const contributionData = generateMockContributionData();

  const isDark = theme === "dark";
  const backgroundColor = isDark ? "#0d1117" : "#ffffff";
  const gridColor = isDark ? "#21262d" : "#ebedf0";
  const textColor = isDark ? "#f0f6fc" : "#24292f";

  // Generate SVG with animated Tron light cycles
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background-color: ${backgroundColor};">
  <defs>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00ffff;stop-opacity:0"/>
      <stop offset="100%" style="stop-color:#00ffff;stop-opacity:1"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
  
  <!-- Title -->
  <text x="${
    width / 2
  }" y="30" text-anchor="middle" fill="${textColor}" font-family="Arial, sans-serif" font-size="20" font-weight="bold">
    🏍️ ${username}'s Tron Light Cycles
  </text>
  
  <!-- Contribution Grid -->
  ${generateContributionGrid(contributionData, width, height, gridColor)}
  
  <!-- Animated Light Cycles -->
  ${generateAnimatedCycles(width, height)}
  
  <!-- Trails -->
  ${generateTrails(width, height)}
  
  <!-- Game Info -->
  <text x="20" y="${
    height - 20
  }" fill="${textColor}" font-family="Arial, sans-serif" font-size="12">
    🎮 Auto-playing Tron Light Cycles • AI vs AI Racing
  </text>
  
</svg>`;

  return svgContent;
}

/**
 * Generate mock contribution data
 */
function generateMockContributionData(): number[][] {
  const grid: number[][] = Array(7)
    .fill(null)
    .map(() => Array(52).fill(0));

  // Generate realistic contribution patterns
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      const isWeekend = day === 0 || day === 6;
      const baseChance = isWeekend ? 0.2 : 0.6;
      const seasonalMultiplier =
        0.5 + 0.5 * Math.sin((week / 52) * Math.PI * 2);
      const chance = baseChance * seasonalMultiplier;

      if (Math.random() < chance) {
        grid[day][week] = Math.floor(Math.random() * 5);
      }
    }
  }

  return grid;
}

/**
 * Generate contribution grid SVG
 */
function generateContributionGrid(
  data: number[][],
  width: number,
  height: number,
  gridColor: string
): string {
  const gridWidth = width - 40;
  const gridHeight = height - 100;
  const cellWidth = gridWidth / 52;
  const cellHeight = gridHeight / 7;
  const startX = 20;
  const startY = 60;

  const colors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

  let svg = "";
  for (let day = 0; day < 7; day++) {
    for (let week = 0; week < 52; week++) {
      const x = startX + week * cellWidth;
      const y = startY + day * cellHeight;
      const level = data[day][week];
      const color = colors[level] || colors[0];

      svg += `<rect x="${x}" y="${y}" width="${cellWidth - 1}" height="${
        cellHeight - 1
      }" fill="${color}" rx="2"/>`;
    }
  }

  return svg;
}

/**
 * Generate animated light cycles
 */
function generateAnimatedCycles(width: number, height: number): string {
  const cycles = [
    { color: "#00ffff", path: "M100,100 L200,100 L200,200 L300,200 L300,300" },
    { color: "#ff4757", path: "M500,100 L400,100 L400,200 L300,200 L300,150" },
    { color: "#ffa502", path: "M100,250 L200,250 L200,200 L250,200 L250,150" },
    { color: "#7bed9f", path: "M500,250 L400,250 L400,200 L350,200 L350,250" },
  ];

  let svg = "";
  cycles.forEach((cycle, index) => {
    svg += `
    <g filter="url(#glow)">
      <circle r="3" fill="${cycle.color}">
        <animateMotion dur="${4 + index}s" repeatCount="indefinite">
          <mpath href="#path${index}"/>
        </animateMotion>
      </circle>
    </g>
    <path id="path${index}" d="${cycle.path}" fill="none" stroke="none"/>`;
  });

  return svg;
}

/**
 * Generate light trails
 */
function generateTrails(width: number, height: number): string {
  return `
  <path d="M100,100 L200,100 L200,200 L300,200" stroke="url(#trailGradient)" stroke-width="2" fill="none" opacity="0.6">
    <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite"/>
  </path>
  <path d="M500,100 L400,100 L400,200 L300,200" stroke="#ff4757" stroke-width="2" fill="none" opacity="0.4">
    <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite"/>
  </path>`;
}

program.parse();
