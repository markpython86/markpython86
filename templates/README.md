# 🏍️ Contrib Tron

**AI Light Cycles Racing Through Your GitHub Contributions**

Transform your GitHub contribution grid into an epic auto-playing Tron Light Cycles arena! Watch as intelligent AI motorcycles race through your coding activity, leaving permanent light trails in a never-ending battle for digital supremacy.

![Contrib Tron Demo](https://via.placeholder.com/800x300/0d1117/00d4ff?text=🏍️+AI+Light+Cycles+Racing+Through+GitHub+Contributions)

## ✨ Features

### 🤖 **Advanced AI Motorcycles**

- **4 Intelligent Cycles**: Each with unique colors and neural network-inspired pathfinding
- **Smart Decision Making**: AI evaluates 8+ factors including safety distance, open space, and future options
- **Adaptive Behavior**: Cycles learn from their environment and avoid getting trapped
- **Continuous Racing**: Auto-playing mode perfect for GitHub profile embedding

### 🎮 **True Tron Gameplay**

- **Persistent Light Trails**: Unlike Snake, trails stay forever and become permanent obstacles
- **Multi-Cycle Competition**: 4 AI cycles compete simultaneously until only one survives
- **Real GitHub Data**: Uses your actual contribution pattern as the racing arena
- **Dynamic Difficulty**: Speed increases over time for more intense action

### 🎨 **Stunning Visuals**

- **Neon Glow Effects**: Authentic Tron-style lighting and particle systems
- **GitHub Theme**: Seamlessly integrates with GitHub's dark mode aesthetic
- **Explosion Particles**: Dramatic crash effects when cycles collide
- **Smooth Animations**: 60fps gameplay with fluid movement

### 🔄 **Continuous Loop**

- **No Game Over Screens**: Seamless restart after each round
- **Always Active**: Perfect for GitHub profile embedding
- **Real-time Scoring**: Based on survival time, active cycles, and trail complexity
- **Infinite Entertainment**: Never stops running

## 🚀 Quick Start

### For Your GitHub Profile

Add this to your GitHub profile README to embed the game:

```html
<div align="center">
  <h3>🏍️ My GitHub Contribution Tron Game</h3>
  <iframe
    src="https://yourusername.github.io/tron-github/"
    width="800"
    height="400"
    frameborder="0"
  >
  </iframe>
</div>
```

### Local Development

```bash
# Clone and setup
git clone https://github.com/yourusername/tron-github.git
cd tron-github
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎯 How It Works

### 1. **Data Fetching**

```typescript
// Fetches your real GitHub contribution data
const grid = await fetchCalendarGrid(username);
```

### 2. **AI Decision Making**

```typescript
// Neural network-inspired evaluation
const features = extractFeatures(cycle, direction);
const score = neuralEvaluateDirection(features);
```

### 3. **Continuous Gameplay**

```typescript
// Seamless restart when cycles crash
if (aliveCycles.length <= 1) {
  initiateRestart(currentTime);
}
```

## 🧠 AI Features

The motorcycles use sophisticated pathfinding algorithms:

- **Safety Distance**: Evaluates collision risk up to 10 steps ahead
- **Open Space Analysis**: Prefers areas with more maneuvering room
- **Edge Avoidance**: Stays away from boundaries when possible
- **Path Diversity**: Avoids recently visited areas to prevent loops
- **Future Options**: Considers available moves after each decision
- **Exploration Bonus**: Seeks unexplored areas of your contribution grid
- **Weighted Decision Making**: Combines multiple factors using neural network-style weights

## 🎨 Customization

### Colors & Themes

```typescript
const colors = [
  { color: "#00ffff", glow: "#00ffff" }, // Cyan (classic Tron)
  { color: "#ff4757", glow: "#ff4757" }, // Red
  { color: "#ffa502", glow: "#ffa502" }, // Orange
  { color: "#7bed9f", glow: "#7bed9f" }, // Green
];
```

### Game Speed & Difficulty

```typescript
const RENDER_CONFIG = {
  cellSize: 12, // Size of each contribution cell
  cellGap: 2, // Gap between cells
  speed: 200, // Initial game speed (ms)
  restartDelay: 1000, // Delay between rounds (ms)
};
```

## 📊 Scoring System

Your score is calculated based on:

- **Survival Time**: `10 points per second`
- **Active Cycles**: `5 points per living cycle`
- **Trail Complexity**: `1 point per trail cell`

```typescript
score = survivalTime * 10 + activeCycles * 5 + trailLength;
```

## 🚀 Deployment

### GitHub Pages (Automatic)

The included GitHub Actions workflow automatically deploys your game:

1. **Push to main branch**
2. **GitHub Actions builds the project**
3. **Deploys to GitHub Pages**
4. **Game available at**: `https://yourusername.github.io/tron-github/`

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🛠️ Technical Stack

- **Frontend**: TypeScript + Vite
- **Rendering**: HTML5 Canvas with WebGL acceleration
- **AI**: Custom pathfinding algorithms with neural network-inspired decision making
- **Data**: GitHub Contributions API
- **Deployment**: GitHub Actions + GitHub Pages
- **Styling**: Modern CSS with GitHub theme integration

## 🎮 Game Mechanics

### Light Cycle Behavior

1. **Spawn**: 4 cycles start in different corners
2. **Movement**: AI evaluates best direction every frame
3. **Trail Creation**: Each move leaves a permanent light trail
4. **Collision**: Hitting trails or walls destroys the cycle
5. **Victory**: Last cycle standing wins the round
6. **Restart**: New round begins automatically after 1 second

### AI Decision Process

```typescript
// 1. Get safe directions (no immediate collision)
const safeDirections = getSafeDirections(cycle);

// 2. Evaluate each direction using multiple factors
const evaluations = safeDirections.map((dir) => ({
  direction: dir,
  score: neuralEvaluateDirection(cycle, dir),
}));

// 3. Select using weighted probability (softmax-style)
const chosen = weightedRandomSelection(evaluations);
```

## 🤝 Contributing

We welcome contributions! Here are some ideas:

- **New AI Algorithms**: Implement different pathfinding strategies
- **Visual Effects**: Add more particle systems and animations
- **Game Modes**: Create different gameplay variations
- **Performance**: Optimize rendering for larger grids
- **Mobile Support**: Improve responsive design

## 📝 License

MIT License - feel free to use this in your own projects!

## 🌟 Showcase

Add your Contrib Tron game to the showcase by opening a PR with your GitHub username and game URL!

---

<div align="center">
  <strong>Transform your GitHub profile into an epic gaming arena! 🏍️⚡</strong>
  <br><br>
  <a href="https://github.com/yourusername/tron-github">⭐ Star this repo</a> •
  <a href="https://github.com/yourusername/tron-github/issues">🐛 Report bugs</a> •
  <a href="https://github.com/yourusername/tron-github/discussions">💬 Discussions</a>
</div>
