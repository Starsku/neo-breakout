# Neo-Breakout 🎮

A modern, fully-featured brick breaker game built with **Phaser 3**, **TypeScript**, and **Vite**.

## 🎯 Features

### Core Gameplay
- ✅ **5 Progressive Levels** with unique brick layouts
- ✅ **Realistic Ball Physics** with angle-based paddle collisions
- ✅ **4 Brick Types**: Normal, Armored, Indestructible, Mobile
- ✅ **Hybrid Controls**: Keyboard (Arrow Keys / ZQSD), Mouse, Touch
- ✅ **Responsive Design**: Fully playable on mobile and desktop

### Power-ups
- 🟢 **Multi-Ball**: Ball splits into 3
- 🔴 **Laser**: Fire projectiles from paddle
- 🔵 **Sticky Paddle**: Ball sticks to paddle until launched
- 🟡 **Mega Ball**: Penetrates bricks for 5 seconds

### Progressive Difficulty
- 🚀 **Speed Scaling**: +10% ball speed per level
- 📈 **Intra-level Acceleration**: +2% speed every 5 brick hits
- 🎯 **Paddle Shrinking**: Reduces at advanced levels
- 🧱 **Gradual Brick Introduction**: New types appear at later levels

### Scoring System
- 💯 **Combo Multiplier**: Score increases with consecutive hits
- 📊 **Speed Bonus**: Higher multiplier for faster gameplay
- 💾 **High Score Persistence**: Saved in LocalStorage
- 🎉 **Real-time Display**: Score and combo feedback

### Audio & Visual Polish
- 🔊 **Web Audio API**: Dynamic pitch-based sound effects
- 🎵 **Background Music**: Looping ambient track
- ✨ **Particle Effects**: Explosion particles on brick destruction
- 📺 **Screen Shake**: Impact feedback on critical hits
- 🎨 **Modern Palette**: Dark theme with vibrant accents

### Game Screens
- 🏠 **Menu**: Title, Play button, High Score display
- ⏸️ **Pause**: ESC to pause/resume, return to menu
- 💀 **Game Over**: Final score, high score, retry options
- 🏆 **Victory**: All levels completed celebration

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:3000`

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure
```
src/
├── main.ts                 # Entry point & Phaser config
├── config/
│   └── GameConfig.ts      # Game constants
├── scenes/
│   ├── MenuScene.ts       # Main menu
│   ├── MainScene.ts       # Core gameplay
│   ├── PauseScene.ts      # Pause overlay
│   ├── GameOverScene.ts   # Game over screen
│   └── VictoryScene.ts    # Victory screen
├── objects/
│   ├── Paddle.ts          # Player paddle with physics
│   ├── Ball.ts            # Ball with collision logic
│   ├── Brick.ts           # Destructible bricks
│   └── PowerUp.ts         # Power-up items
├── systems/
│   ├── ScoreSystem.ts     # Score & combo management
│   ├── AudioSystem.ts     # Howler.js & Web Audio
│   └── LevelSystem.ts     # Level layouts & difficulty
└── utils/
    └── helpers.ts         # Utility functions
```

## 🎮 Controls

| Action | Keyboard | Mouse | Touch |
|--------|----------|-------|-------|
| Move Left | ← / A / Q | - | Drag left |
| Move Right | → / D | - | Drag right |
| Pause | ESC | - | - |
| Launch Ball (Sticky) | SPACE | Click | Tap |
| Fire Laser (when active) | SPACE | Click | Tap |

## 🌐 Deployment

### Vercel
```bash
vercel --prod
```

Set environment variables in Vercel dashboard if needed.

### GitHub Pages
```bash
npm run build
# Deploy dist/ folder
```

## 📈 Level Progression

- **Level 1**: Simple grid, basic training
- **Level 2**: Armored bricks introduced (+10% speed)
- **Level 3**: Mobile bricks appear (+20% speed)
- **Level 4**: Complex layouts with obstacles (+30% speed)
- **Level 5**: Ultimate challenge with all brick types (+40% speed)

## 🔧 Technical Stack

- **Engine**: Phaser 3.55+
- **Language**: TypeScript 5.3+
- **Bundler**: Vite 5.0+
- **Audio**: Howler.js 2.2+ & Web Audio API
- **State**: LocalStorage for persistence

## 📊 Performance

- **Target**: 60 FPS on mobile & desktop
- **Bundle Size**: ~1.5MB (Phaser included)
- **Load Time**: <1 second on modern browsers

## 🎨 Customization

Edit `src/config/GameConfig.ts` to customize:
- Game dimensions
- Ball speed & physics
- Paddle size & speed
- Scoring values
- Colors and effects

## 📝 License

MIT License - Feel free to fork and modify!

## 🤝 Contributing

Contributions welcome! Please submit issues or PRs to improve the game.

---

**Developed with ❤️ by Forge**
