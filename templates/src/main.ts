/**
 * Main entry point for the Contrib Tron game
 */

import { fetchCalendarGrid } from "./api.js";
import { TronGame } from "./game.js";
import { calculateCanvasDimensions, RenderConfig } from "./renderer.js";

// GitHub username - will be replaced by CLI
const GITHUB_USERNAME = "__GITHUB_USERNAME__";

// Render configuration
const RENDER_CONFIG: RenderConfig = {
  cellSize: 12,
  cellGap: 2,
  padding: 20,
};

// Game state
let game: TronGame | null = null;
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;

// UI elements
let scoreElement: HTMLElement | null = null;
let loadingElement: HTMLElement | null = null;

/**
 * Initializes the game
 */
async function init(): Promise<void> {
  try {
    // Check if GitHub username is still a placeholder - do this first!
    if (GITHUB_USERNAME === "__GITHUB_USERNAME__") {
      // Get loading element to show setup instructions
      const setupElement = document.getElementById("loading");
      if (setupElement) {
        setupElement.innerHTML = `
          <div style="text-align: center; color: #ffa502; font-family: 'Segoe UI', sans-serif;">
            <h3>🚀 Setup Required</h3>
            <p>This project was not initialized with the CLI tool.</p>
            <p><strong>To set up properly:</strong></p>
            <ol style="text-align: left; display: inline-block; margin: 20px 0;">
              <li>Install the CLI: <code style="background: #21262d; padding: 2px 6px; border-radius: 3px;">npm install -g tron-github</code></li>
              <li>Create project: <code style="background: #21262d; padding: 2px 6px; border-radius: 3px;">tron-github init --user YOUR_GITHUB_USERNAME</code></li>
            </ol>
            <p><em>Or manually replace "__GITHUB_USERNAME__" with your GitHub username in main.ts</em></p>
          </div>
        `;
        setupElement.style.color = "#ffa502";
        setupElement.style.display = "block"; // Make sure it's visible
      }
      return; // Exit early - don't proceed with game initialization
    }

    // Get UI elements (only if we have a real username)
    scoreElement = document.getElementById("score");
    loadingElement = document.getElementById("loading");
    canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

    if (!canvas) {
      throw new Error("Canvas element not found");
    }

    ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not get 2D context");
    }

    // Set up canvas dimensions
    const dimensions = calculateCanvasDimensions(RENDER_CONFIG);
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Show loading with spinner when fetching real data
    if (loadingElement) {
      loadingElement.textContent = "Loading contribution data...";
      loadingElement.className = "loading with-spinner"; // Add spinner class
      loadingElement.style.display = "block";
    }

    // Fetch contribution data
    console.log(`Fetching contribution data for ${GITHUB_USERNAME}...`);
    const grid = await fetchCalendarGrid(GITHUB_USERNAME);

    // Hide loading and show canvas
    if (loadingElement) loadingElement.style.display = "none";
    canvas.style.display = "block";

    // Initialize game
    game = new TronGame(grid, RENDER_CONFIG);

    // Set up event listeners
    setupEventListeners();

    // Start game loop
    startGameLoop();

    console.log("Game initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize game:", error);

    if (loadingElement) {
      loadingElement.textContent = `Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
      loadingElement.style.color = "#ff4757";
    }
  }
}

/**
 * Sets up event listeners for UI interactions
 */
function setupEventListeners(): void {
  // Focus canvas for better visual presentation
  if (canvas) {
    canvas.tabIndex = 0;
    canvas.focus();
  }
}

/**
 * Main game loop
 */
function gameLoop(currentTime: number): void {
  if (!game || !ctx) {
    return;
  }

  // Update game state
  game.update(currentTime);

  // Draw game
  game.draw(ctx);

  // Update UI
  updateUI();

  // Continue loop (no game over check needed - continuous play)
  animationId = requestAnimationFrame(gameLoop);
}

/**
 * Starts the game loop
 */
function startGameLoop(): void {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  animationId = requestAnimationFrame(gameLoop);
}

/**
 * Updates the UI elements
 */
function updateUI(): void {
  if (!game) return;

  // Update score
  if (scoreElement) {
    scoreElement.textContent = game.getScore().toString();
  }
}

/**
 * Handles window resize
 */
function handleResize(): void {
  // The canvas size is fixed based on the grid, so no resize handling needed
  // But we could add responsive scaling here if needed
}

/**
 * Cleanup function
 */
function cleanup(): void {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Initialize when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Handle page unload
window.addEventListener("beforeunload", cleanup);

// Handle window resize
window.addEventListener("resize", handleResize);
