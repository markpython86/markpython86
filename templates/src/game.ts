/**
 * Core game logic for the Tron Light Cycles game - Auto-playing version
 */

import {
  Point,
  RenderConfig,
  drawCalendar,
  drawCycle,
  drawTrail,
  drawParticles,
  createExplosion,
  updateParticles,
  Particle,
} from "./renderer.js";

export enum Direction {
  UP = "UP",
  DOWN = "DOWN",
  LEFT = "LEFT",
  RIGHT = "RIGHT",
}

export enum GameState {
  PLAYING = "PLAYING",
  RESTARTING = "RESTARTING",
}

export interface LightCycle {
  id: number;
  position: Point;
  direction: Direction;
  color: string;
  glowColor: string;
  alive: boolean;
  pathfindingMemory: Point[];
  lastDirectionChange: number;
  movesSinceDirectionChange: number;
}

export class TronGame {
  private grid: number[][];
  private cycles: LightCycle[];
  private trailGrid: number[][]; // Persistent trail grid (0 = empty, cycle_id = occupied)
  private state!: GameState;
  private score!: number;
  private speed!: number;
  private lastMoveTime!: number;
  private particles: Particle[];
  private config: RenderConfig;
  private restartDelay: number = 1000; // 1 second before restart
  private restartTime: number = 0;
  private gameStartTime: number = 0;
  private frameCount: number = 0;

  constructor(grid: number[][], config: RenderConfig) {
    this.grid = grid;
    this.config = config;
    this.particles = [];
    this.trailGrid = Array(7)
      .fill(null)
      .map(() => Array(52).fill(0));
    this.cycles = [];
    this.reset();
  }

  /**
   * Resets the game to initial state
   */
  reset(): void {
    this.state = GameState.PLAYING;
    this.score = 0;
    this.speed = 200; // Slower initial speed for better visibility
    this.lastMoveTime = 0;
    this.particles = [];
    this.gameStartTime = performance.now();
    this.frameCount = 0;

    // Clear the trail grid
    this.trailGrid = Array(7)
      .fill(null)
      .map(() => Array(52).fill(0));

    // Create multiple AI cycles
    this.cycles = this.createCycles();

    // Place initial positions on trail grid
    this.cycles.forEach((cycle) => {
      if (this.isValidPosition(cycle.position)) {
        this.trailGrid[cycle.position.y][cycle.position.x] = cycle.id;
      }
    });
  }

  /**
   * Creates multiple light cycles for the game
   */
  private createCycles(): LightCycle[] {
    const colors = [
      { color: "#00ffff", glow: "#00ffff" }, // Cyan (classic Tron)
      { color: "#ff4757", glow: "#ff4757" }, // Red
      { color: "#ffa502", glow: "#ffa502" }, // Orange
      { color: "#7bed9f", glow: "#7bed9f" }, // Green
    ];

    const cycles: LightCycle[] = [];
    const startPositions = this.getStartPositions(colors.length);

    for (let i = 0; i < colors.length; i++) {
      cycles.push({
        id: i + 1,
        position: startPositions[i],
        direction: this.getRandomDirection(),
        color: colors[i].color,
        glowColor: colors[i].glow,
        alive: true,
        pathfindingMemory: [],
        lastDirectionChange: 0,
        movesSinceDirectionChange: 0,
      });
    }

    return cycles;
  }

  /**
   * Gets starting positions for cycles, spread around the grid
   */
  private getStartPositions(count: number): Point[] {
    const positions: Point[] = [];

    // Better starting positions with more space
    const corners = [
      { x: 8, y: 1 }, // Top-left area
      { x: 43, y: 1 }, // Top-right area
      { x: 8, y: 5 }, // Bottom-left area
      { x: 43, y: 5 }, // Bottom-right area
    ];

    for (let i = 0; i < Math.min(count, corners.length); i++) {
      positions.push(corners[i]);
    }

    return positions;
  }

  /**
   * Gets a random direction
   */
  private getRandomDirection(): Direction {
    const directions = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ];
    return directions[Math.floor(Math.random() * directions.length)];
  }

  /**
   * Advanced AI decision making with machine learning-inspired approach
   */
  private makeAIDecision(cycle: LightCycle): Direction {
    const possibleDirections = this.getSafeDirections(cycle);

    if (possibleDirections.length === 0) {
      return cycle.direction; // Continue current direction (will crash)
    }

    // Neural network-inspired evaluation
    const evaluations = possibleDirections.map((dir) => ({
      direction: dir,
      score: this.neuralEvaluateDirection(cycle, dir),
    }));

    // Sort by score
    evaluations.sort((a, b) => b.score - a.score);

    // Softmax-inspired selection with temperature
    const temperature = 0.5;
    const expScores = evaluations.map((e) => Math.exp(e.score / temperature));
    const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);
    const probabilities = expScores.map((exp) => exp / sumExp);

    // Weighted random selection
    const random = Math.random();
    let cumulative = 0;
    for (let i = 0; i < evaluations.length; i++) {
      cumulative += probabilities[i];
      if (random <= cumulative) {
        return evaluations[i].direction;
      }
    }

    return evaluations[0].direction;
  }

  /**
   * Neural network-inspired direction evaluation
   */
  private neuralEvaluateDirection(
    cycle: LightCycle,
    direction: Direction
  ): number {
    const features = this.extractFeatures(cycle, direction);

    // Weighted feature combination (like neural network weights)
    const weights = {
      safetyDistance: 15.0,
      openSpace: 8.0,
      edgeDistance: 5.0,
      pathDiversity: 3.0,
      continuity: 2.0,
      exploration: 4.0,
      avoidance: -20.0,
      futureOptions: 6.0,
    };

    return (
      features.safetyDistance * weights.safetyDistance +
      features.openSpace * weights.openSpace +
      features.edgeDistance * weights.edgeDistance +
      features.pathDiversity * weights.pathDiversity +
      features.continuity * weights.continuity +
      features.exploration * weights.exploration +
      features.avoidance * weights.avoidance +
      features.futureOptions * weights.futureOptions
    );
  }

  /**
   * Extract features for AI decision making
   */
  private extractFeatures(cycle: LightCycle, direction: Direction) {
    const nextPos = this.getNextPositionInDirection(cycle.position, direction);

    // Feature 1: Safety distance (how far until collision)
    let safetyDistance = 0;
    let checkPos = nextPos;
    for (let i = 0; i < 10; i++) {
      if (this.checkCollision(checkPos)) break;
      safetyDistance++;
      checkPos = this.getNextPositionInDirection(checkPos, direction);
    }

    // Feature 2: Open space around next position
    const openSpace = this.countOpenSpaceAround(nextPos, 2);

    // Feature 3: Distance from edges
    const edgeDistance = Math.min(
      nextPos.x,
      51 - nextPos.x,
      nextPos.y,
      6 - nextPos.y
    );

    // Feature 4: Path diversity (avoid recently visited areas)
    const recentlyVisited = cycle.pathfindingMemory.filter(
      (p) => Math.abs(p.x - nextPos.x) <= 2 && Math.abs(p.y - nextPos.y) <= 2
    ).length;
    const pathDiversity = Math.max(0, 10 - recentlyVisited);

    // Feature 5: Continuity bonus
    const continuity = direction === cycle.direction ? 1 : 0;

    // Feature 6: Exploration bonus (prefer unexplored areas)
    const exploration = this.grid[nextPos.y]?.[nextPos.x] <= 1 ? 1 : 0;

    // Feature 7: Avoidance penalty
    const avoidance = this.checkCollision(nextPos) ? 1 : 0;

    // Feature 8: Future options (how many directions available after this move)
    const futureOptions = this.countFutureOptions(nextPos, direction);

    return {
      safetyDistance,
      openSpace,
      edgeDistance,
      pathDiversity,
      continuity,
      exploration,
      avoidance,
      futureOptions,
    };
  }

  /**
   * Count future movement options from a position
   */
  private countFutureOptions(pos: Point, currentDir: Direction): number {
    const directions = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ];
    const opposite = this.getOppositeDirection(currentDir);

    return directions.filter((dir) => {
      if (dir === opposite) return false;
      const nextPos = this.getNextPositionInDirection(pos, dir);
      return !this.checkCollision(nextPos);
    }).length;
  }

  /**
   * Gets directions that won't immediately cause a collision
   */
  private getSafeDirections(cycle: LightCycle): Direction[] {
    const allDirections = [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT,
    ];
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
    };

    return allDirections.filter((dir) => {
      // Can't reverse direction (in Tron, you can't go backwards)
      if (opposites[cycle.direction] === dir) return false;

      // Check if this direction leads to immediate collision
      const nextPos = this.getNextPositionInDirection(cycle.position, dir);
      return !this.checkCollision(nextPos);
    });
  }

  /**
   * Counts empty cells around a position with radius
   */
  private countOpenSpaceAround(pos: Point, radius: number = 1): number {
    let count = 0;
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx === 0 && dy === 0) continue;
        const checkPos = { x: pos.x + dx, y: pos.y + dy };
        if (this.isValidPosition(checkPos) && !this.checkCollision(checkPos)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Gets the opposite direction
   */
  private getOppositeDirection(direction: Direction): Direction {
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT,
    };
    return opposites[direction];
  }

  /**
   * Gets the next position in a given direction
   */
  private getNextPositionInDirection(pos: Point, direction: Direction): Point {
    const directions = {
      [Direction.UP]: { x: 0, y: -1 },
      [Direction.DOWN]: { x: 0, y: 1 },
      [Direction.LEFT]: { x: -1, y: 0 },
      [Direction.RIGHT]: { x: 1, y: 0 },
    };

    const delta = directions[direction];
    return {
      x: pos.x + delta.x,
      y: pos.y + delta.y,
    };
  }

  /**
   * Checks if a position is valid (within bounds)
   */
  private isValidPosition(pos: Point): boolean {
    return pos.x >= 0 && pos.x < 52 && pos.y >= 0 && pos.y < 7;
  }

  /**
   * Updates the game state
   */
  update(currentTime: number): void {
    this.frameCount++;

    // Always update particles
    this.particles = updateParticles(this.particles);

    if (this.state === GameState.RESTARTING) {
      // Wait for restart delay then immediately restart
      if (currentTime - this.restartTime > this.restartDelay) {
        this.reset();
      }
      return;
    }

    if (this.state !== GameState.PLAYING) {
      return;
    }

    // Check if it's time to move
    if (currentTime - this.lastMoveTime < this.speed) {
      return;
    }

    // Update each alive cycle
    const aliveCycles = this.cycles.filter((cycle) => cycle.alive);

    if (aliveCycles.length <= 1) {
      // Immediately restart when only one or no cycles remain
      this.initiateRestart(currentTime);
      return;
    }

    // Move each cycle
    aliveCycles.forEach((cycle) => {
      // AI makes decision about direction
      const newDirection = this.makeAIDecision(cycle);

      // Track direction changes
      if (newDirection !== cycle.direction) {
        cycle.lastDirectionChange = this.frameCount;
        cycle.movesSinceDirectionChange = 0;
      } else {
        cycle.movesSinceDirectionChange++;
      }

      cycle.direction = newDirection;

      // Calculate next position
      const nextPos = this.getNextPositionInDirection(
        cycle.position,
        cycle.direction
      );

      // Check for collisions
      if (this.checkCollision(nextPos)) {
        // Cycle crashes
        cycle.alive = false;
        this.particles.push(
          ...createExplosion(cycle.position.x, cycle.position.y)
        );
        return;
      }

      // Update pathfinding memory
      cycle.pathfindingMemory.push({ ...cycle.position });
      if (cycle.pathfindingMemory.length > 20) {
        cycle.pathfindingMemory.shift();
      }

      // Mark current position in trail grid
      if (this.isValidPosition(cycle.position)) {
        this.trailGrid[cycle.position.y][cycle.position.x] = cycle.id;
      }

      // Move to next position
      cycle.position = nextPos;
    });

    // Update score based on survival time and active cycles
    const survivalTime = Math.floor((currentTime - this.gameStartTime) / 1000);
    const activeCycles = aliveCycles.length;
    const trailLength = this.trailGrid.flat().filter((cell) => cell > 0).length;
    this.score = survivalTime * 10 + activeCycles * 5 + trailLength;

    // Gradually increase speed for more dynamic gameplay
    const gameTimeSeconds = (currentTime - this.gameStartTime) / 1000;
    this.speed = Math.max(80, 200 - Math.floor(gameTimeSeconds / 10) * 20);

    this.lastMoveTime = currentTime;
  }

  /**
   * Initiates a seamless restart
   */
  private initiateRestart(currentTime: number): void {
    this.state = GameState.RESTARTING;
    this.restartTime = currentTime;

    // Create explosion effects for remaining cycles
    this.cycles
      .filter((cycle) => cycle.alive)
      .forEach((cycle) => {
        this.particles.push(
          ...createExplosion(cycle.position.x, cycle.position.y)
        );
      });
  }

  /**
   * Checks for collisions with walls or trails
   */
  private checkCollision(position: Point): boolean {
    // Check bounds
    if (!this.isValidPosition(position)) {
      return true;
    }

    // Check trail collision (any non-zero value means occupied)
    return this.trailGrid[position.y][position.x] !== 0;
  }

  /**
   * Draws the game
   */
  draw(ctx: CanvasRenderingContext2D): void {
    // Draw the contribution calendar background
    drawCalendar(ctx, this.grid, this.config);

    // Draw the persistent trails
    this.drawTrails(ctx);

    // Draw alive cycles
    this.cycles
      .filter((cycle) => cycle.alive)
      .forEach((cycle) => {
        drawCycle(
          ctx,
          cycle.position,
          this.config,
          cycle.color,
          cycle.glowColor
        );
      });

    // Draw particles (explosions, etc.)
    if (this.particles.length > 0) {
      drawParticles(ctx, this.particles, this.config);
    }

    // No game over overlay - continuous play
  }

  /**
   * Draws the persistent trail grid
   */
  private drawTrails(ctx: CanvasRenderingContext2D): void {
    const cellWidth = this.config.cellSize + this.config.cellGap;
    const cellHeight = this.config.cellSize + this.config.cellGap;

    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 52; x++) {
        const cycleId = this.trailGrid[y][x];
        if (cycleId > 0) {
          const cycle = this.cycles.find((c) => c.id === cycleId);
          if (cycle) {
            const cellX = this.config.padding + x * cellWidth;
            const cellY = this.config.padding + y * cellHeight;

            ctx.save();

            // Glow effect
            ctx.shadowColor = cycle.glowColor;
            ctx.shadowBlur = 6;
            ctx.fillStyle = cycle.color;

            ctx.fillRect(
              cellX,
              cellY,
              this.config.cellSize,
              this.config.cellSize
            );

            ctx.restore();
          }
        }
      }
    }
  }

  /**
   * Gets the current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Gets the current score
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Gets alive cycles
   */
  getAliveCycles(): LightCycle[] {
    return this.cycles.filter((cycle) => cycle.alive);
  }

  /**
   * Manual restart (for debugging)
   */
  forceRestart(): void {
    this.reset();
  }
}
