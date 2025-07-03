/**
 * Renderer module for drawing the contribution grid and game elements
 */

import { getContributionColor } from "./api.js";

export interface Point {
  x: number;
  y: number;
}

export interface RenderConfig {
  cellSize: number;
  cellGap: number;
  padding: number;
}

/**
 * Draws the GitHub contribution calendar grid
 */
export function drawCalendar(
  ctx: CanvasRenderingContext2D,
  grid: number[][],
  config: RenderConfig
): void {
  const { cellSize, cellGap, padding } = config;

  // Clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw background
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw each cell in the grid
  for (let day = 0; day < 7; day++) {
    for (let week = 0; week < 52; week++) {
      const level = grid[day][week];
      const x = padding + week * (cellSize + cellGap);
      const y = padding + day * (cellSize + cellGap);

      // Draw the contribution cell
      ctx.fillStyle = getContributionColor(level);
      ctx.fillRect(x, y, cellSize, cellSize);

      // Add a subtle border for better visibility
      ctx.strokeStyle = "#21262d";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }
}

/**
 * Draws the player's light cycle (head)
 */
export function drawCycle(
  ctx: CanvasRenderingContext2D,
  head: Point,
  config: RenderConfig,
  color: string = "#00d4ff",
  glowColor: string = "#00d4ff"
): void {
  const { cellSize, cellGap, padding } = config;

  const x = padding + head.x * (cellSize + cellGap);
  const y = padding + head.y * (cellSize + cellGap);

  // Draw the cycle with a glowing effect
  ctx.save();

  // Outer glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = 15;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, cellSize, cellSize);

  // Inner bright core
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4);

  ctx.restore();
}

/**
 * Draws the trail left by the light cycle
 */
export function drawTrail(
  ctx: CanvasRenderingContext2D,
  trail: Point[],
  config: RenderConfig
): void {
  const { cellSize, cellGap, padding } = config;

  ctx.save();

  trail.forEach((point, index) => {
    const x = padding + point.x * (cellSize + cellGap);
    const y = padding + point.y * (cellSize + cellGap);

    // Create a fading effect for the trail
    const alpha = Math.max(0.3, 1 - (trail.length - index) / trail.length);

    // Draw trail segment with glow
    ctx.shadowColor = "#00ff88";
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(0, 255, 136, ${alpha})`;
    ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
  });

  ctx.restore();
}

/**
 * Draws a particle effect for explosions or special events
 */
export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  config: RenderConfig
): void {
  const { cellSize, cellGap, padding } = config;

  ctx.save();

  particles.forEach((particle) => {
    const x = padding + particle.x * (cellSize + cellGap) + cellSize / 2;
    const y = padding + particle.y * (cellSize + cellGap) + cellSize / 2;

    ctx.globalAlpha = particle.life;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(
      x + particle.offsetX,
      y + particle.offsetY,
      particle.size,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Particle interface for explosion effects
 */
export interface Particle {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  size: number;
  life: number;
  color: string;
}

/**
 * Creates explosion particles at a given position
 */
export function createExplosion(
  x: number,
  y: number,
  count: number = 12
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const speed = 2 + Math.random() * 3;

    particles.push({
      x,
      y,
      offsetX: 0,
      offsetY: 0,
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      size: 2 + Math.random() * 3,
      life: 1,
      color: Math.random() > 0.5 ? "#ff4757" : "#ffa502",
    });
  }

  return particles;
}

/**
 * Updates particle positions and life
 */
export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map((particle) => ({
      ...particle,
      offsetX: particle.offsetX + particle.velocityX,
      offsetY: particle.offsetY + particle.velocityY,
      life: particle.life - 0.02,
      velocityY: particle.velocityY + 0.1, // gravity
    }))
    .filter((particle) => particle.life > 0);
}

/**
 * Calculates the canvas dimensions needed for the grid
 */
export function calculateCanvasDimensions(config: RenderConfig): {
  width: number;
  height: number;
} {
  const { cellSize, cellGap, padding } = config;

  const width = padding * 2 + 52 * cellSize + 51 * cellGap;
  const height = padding * 2 + 7 * cellSize + 6 * cellGap;

  return { width, height };
}
