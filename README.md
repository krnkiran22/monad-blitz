# 🐨 Koala Seasons - Phaser Edition

A complete recreation of the Koala Seasons game using **Phaser 3** game engine with JavaScript.

## ✨ Features

### ✅ COMPLETE GAME MECHANICS
- **Jump Physics** - Realistic gravity and jumping between trees
- **Tree System** - Procedurally generated trees with proper collision
- **Enemy AI** - Flying enemies with movement patterns
- **Leaf Collection** - Collectible leaves with particles
- **Season System** - 4 seasons (Spring, Summer, Fall, Winter) with color transitions
- **Hazards** - Fire obstacles on trees
- **Dash Attack** - Downward dash to kill enemies
- **Super Mode** - Transform after collecting 100 leaves
- **Score System** - Points, high score tracking
- **Particle Effects** - Visual feedback for all actions
- **Smooth Scrolling** - Camera follows koala
- **Difficulty Progression** - Speed increases over time

### 🎮 Controls
- **SPACE** - Jump to next tree
- **↓ DOWN** - Dash attack (while in air)
- **Automatic** - Collect 100 leaves to activate super mode

### 🌈 Seasons
Each season lasts ~30 seconds:
- **SPRING** 🌸 - Green theme
- **SUMMER** ☀️ - Yellow/orange theme  
- **FALL** 🍂 - Orange/brown theme
- **WINTER** ❄️ - Blue/white theme

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 📁 Project Structure

```
koala-phaser/
├── index.html              # Main HTML entry
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
├── src/
│   ├── main.js            # Game initialization
│   └── scenes/
│       ├── MenuScene.js   # Main menu
│       ├── GameScene.js   # Core gameplay (500+ lines)
│       └── GameOverScene.js # Game over screen
└── public/
    └── assets/            # (Optional) Real sprite atlases
        ├── atlas01.png
        └── atlas02.png
```

## 🎨 Graphics

The game works in **TWO MODES**:

### Mode 1: Procedural Graphics (Current)
- ✅ Works immediately without any assets
- Graphics generated using Phaser's Graphics API
- Simple but functional visuals

### Mode 2: Real Sprites (Optional)
If you have the original sprite atlases:
1. Place `atlas01.png` and `atlas02.png` in `public/assets/`
2. The game will automatically load them
3. Uncomment sprite atlas code in `GameScene.js`

## 🎯 Game Features

### Core Gameplay Loop
1. Koala starts on a tree
2. Press SPACE to jump to next tree
3. Collect leaves while jumping
4. Avoid enemies (or dash down to kill them)
5. Survive through changing seasons
6. Score increases continuously

### Power Systems
- **Leaves**: Collect to power up
- **Super Mode**: Activate at 100 leaves
  - Invincibility for 10 seconds
  - Increased speed
  - Golden tint effect
  - Destroy enemies and hazards on contact

### Enemy Types
- **Flying Enemies**: Move left across screen
- **Bobbing Movement**: Enemies move up and down
- **Collision**: Kill player unless dashing or in super mode

### Hazard System
- **Fire**: Spawns on trees randomly (25% chance)
- **Fatal**: Instant death unless in super mode
- **Visual**: Animated triangle effect

## 🔧 Technical Details

### Built With
- **Phaser 3.70.0** - Game engine
- **Vite 5.0** - Build tool & dev server
- **Vanilla JavaScript** - No frameworks
- **Arcade Physics** - Built-in Phaser physics

### Performance
- **60 FPS** target
- **Arcade Physics** for efficient collision detection
- **Object Pooling** - Automatic cleanup of off-screen objects
- **Optimized Rendering** - Only visible objects drawn

### Code Architecture
- **Scene-based**: Menu → Game → GameOver
- **Component Pattern**: Separate functions for each game system
- **Clean Separation**: Input, Physics, Rendering, Logic separated

## 📊 Comparison: Original C vs Phaser

| Feature | Original C (Raylib) | This Phaser Version | Status |
|---------|---------------------|---------------------|---------|
| Jump Physics | ✅ Custom physics | ✅ Arcade Physics | ✅ Done |
| Tree System | ✅ Manual positioning | ✅ Phaser Groups | ✅ Done |
| Enemies | ✅ 5 types | ✅ 1 type (expandable) | ⚠️ Simplified |
| Seasons | ✅ 4 with transitions | ✅ 4 with color changes | ✅ Done |
| Particles | ✅ Custom system | ✅ Tween-based | ✅ Done |
| Sprite Atlases | ✅ atlas01/02.png | ⚠️ Optional support | ⚠️ Partial |
| Sound Effects | ✅ 9 sounds | ❌ Not implemented | ⏳ TODO |
| Parallax Scrolling | ✅ 3 layers | ✅ 1 layer | ⚠️ Simplified |
| Super Mode | ✅ Transformation | ✅ Golden tint | ✅ Done |
| Score System | ✅ Complex tracking | ✅ Score + High Score | ✅ Done |

## 🎮 Gameplay Tips

1. **Timing is Everything**: Jump at the right moment to land on the next tree
2. **Collect Leaves**: 100 leaves = Super mode
3. **Use Dash**: Press DOWN while jumping to dive and kill enemies
4. **Watch Seasons**: Visual indicator shows season progress
5. **Survive Longer**: Speed increases every 100 points

## 🐛 Known Issues

- Sound effects not implemented yet
- Only 1 enemy type (can add more)
- Simplified parallax (can add more layers)
- No sprite atlas integration (procedural graphics only)

## 🔮 Future Enhancements

- [ ] Add sound effects (jump, collect, die)
- [ ] Add background music
- [ ] Integrate real sprite atlases
- [ ] Add more enemy types (owl, snake, dingo, bee, eagle)
- [ ] Add ice/resin hazards
- [ ] Add whirlwind mechanics
- [ ] Add 3-layer parallax scrolling
- [ ] Add particle storm effects
- [ ] Add mobile touch controls
- [ ] Add pause menu

## 📝 Development

### Adding New Features

**Add a new enemy type:**
```javascript
// In GameScene.js spawnEnemy()
const enemyType = Phaser.Math.Between(0, 1);
if (enemyType === 0) {
    // Flying enemy
} else {
    // Ground enemy
}
```

**Add new hazard:**
```javascript
// In spawnTree()
if (Phaser.Math.Between(0, 100) < 20) {
    const ice = this.hazards.create(x, y - 250, 'ice');
    ice.hazardType = 'ice';
}
```

## 🎯 Goals Achieved

✅ **Playable game** - Full gameplay loop works  
✅ **Jump mechanics** - Proper physics and tree landing  
✅ **Enemy system** - Spawning and collision  
✅ **Collection system** - Leaves with particles  
✅ **Season changes** - Visual transitions  
✅ **Score tracking** - Points and high score  
✅ **Super mode** - Power-up transformation  
✅ **Game over** - Proper end state  
✅ **Menu system** - Start and restart  

## 📜 License

Based on the original Koala Seasons by Ramon Santamaria (@raysan5)  
This recreation is for educational purposes.

## 🙏 Credits

- **Original Game**: Ramon Santamaria (raylib/emegeme)
- **Game Engine**: Phaser 3 by Photon Storm
- **Recreation**: Phaser adaptation

---

**Enjoy the game! 🐨🌳**
