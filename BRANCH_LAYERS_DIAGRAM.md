# Branch Layers - Visual Diagram

## The Three-Layer System

```
Screen Height: 720px
═══════════════════════════════════════════════════════════════

y = -33px    ▼▼▼ Layer 1 BRANCHES (Front - CLOSEST) ▼▼▼
             🌿🍃🌿🌿🍃🌿🍃🌿🍃🌿🍃🌿🍃🌿🍃🌿
             ↑ Mirrored ground_layer1 (flipped upside down)
             
y = 0px      ─────────────────────────────────────────────

y = 19px     ▼▼▼ Layer 2 BRANCHES (Middle) ▼▼▼
             🍂🌿🍂🍂🌿🍂🌿🍂🌿🍂🌿🍂🌿🍂🌿🍂
             ↑ Mirrored ground_layer2 (flipped upside down)

y = 60px     🌲 Layer 1 TREES START HERE 🌲
y = 67px     🌲 Layer 2 & 3 TREES START HERE 🌲
             ▼▼▼ Layer 3 BRANCHES (Back - FARTHEST) ▼▼▼
             🌾🍃🌾🌾🍃🌾🍃🌾🍃🌾🍃🌾🍃🌾🍃🌾
             ↑ Mirrored ground_layer3 (flipped upside down)
             
             │  TREE TRUNKS (all layers)
             │  ~670px tall
             │  (335px × 2 scale)
             │
             │
             │
             
y = 469px    ═══ Layer 3 GROUND (bottom) ═══
y = 509px    ═══ Layer 2 GROUND (bottom) ═══  
y = 559px    ═══ Layer 1 GROUND (bottom) ═══

y = 720px    ▀▀▀▀▀▀▀▀▀▀ SCREEN BOTTOM ▀▀▀▀▀▀▀▀▀▀
```

## How It Creates Depth

### View from Player's Perspective:

```
CLOSEST (Layer 1):
  - Branches HIGHEST (y=-33) 
  - Scrolls FASTEST
  - Darkest tint
  - Most prominent

MIDDLE (Layer 2):
  - Branches MIDDLE (y=19)
  - Scrolls MEDIUM (75% speed)
  - Medium tint
  - Secondary depth

FARTHEST (Layer 3):
  - Branches with trees (y=67)
  - Scrolls SLOWEST (50% speed)
  - Lightest tint
  - Background depth
```

## The Parallax Effect

As player moves right →

```
Frame 1:
y=-33:  🌿|🌿🌿|🌿🌿|     ← Layer 1 (fast)
y=19:   🍂 |🍂 🍂|🍂 🍂    ← Layer 2 (medium)
y=67:   🌾  |🌾  🌾|      ← Layer 3 (slow)

Frame 2:
y=-33:   🌿|🌿🌿|🌿🌿|    ← Moved far left
y=19:    🍂|🍂 🍂|🍂      ← Moved some
y=67:    🌾 |🌾  🌾       ← Barely moved

Frame 3:
y=-33:    🌿🌿|🌿🌿|🌿    ← Almost off screen!
y=19:     🍂 🍂|🍂 🍂     ← Moving steadily
y=67:     🌾  🌾|🌾       ← Still visible
```

This creates the ILLUSION OF DEPTH! 🎨

## Ground Texture Structure

Each ground sprite (77px tall):
```
┌─────────────────────┐
│ 🌿🌿🌿 TOP FOLIAGE  │ ← When flipped, becomes hanging branches
│═════════════════════│
│                     │
│   DIRT/GROUND       │
│   (middle section)  │
│                     │
│═════════════════════│
│ 🌿🌿🌿 BOTTOM        │ ← Connects to tree bases
└─────────────────────┘

When setScale(2, -2):  (negative Y flips it!)
┌─────────────────────┐
│ 🌿🌿🌿 was BOTTOM    │ ← Now appears at top
│═════════════════════│
│   DIRT/GROUND       │
│   (upside down)     │
│═════════════════════│
│ 🌿🌿🌿 was TOP       │ ← Now at bottom
└─────────────────────┘
```

## Depth Sorting

Phaser renders in this order (depth value):
```
-10: Sky background (static)
-6:  Layer 3 trees + grounds (both pieces)
-4:  Layer 2 trees + grounds (both pieces)
-2:  Layer 1 trees + grounds (both pieces)
0-4: Game objects (bamboo, player, enemies)
5:   Foreground main ground
99+: UI elements (score, clock)
```

## Why Three Different Y Values?

**y=-33**: Creates uppermost canopy layer (very top of screen)
**y=19**: Creates middle canopy layer (just below top)
**y=67**: Creates lower canopy layer (where trees start)

Together they create a **DENSE, MULTI-LAYERED FOREST CANOPY**!

## Code Summary

```javascript
// CRITICAL: Each layer needs its own Y position!

// Layer 3 (Back)
this.add.image(x, 67, 'ground_layer3').setScale(2, -2);

// Layer 2 (Middle)
this.add.image(x, 19, 'ground_layer2').setScale(2, -2);

// Layer 1 (Front)
this.add.image(x, -33, 'ground_layer1').setScale(2, -2);
```

## Expected Visual Result

When running the game:
1. TOP MOST: Close dark branches (Layer 1 at y=-33)
2. SLIGHTLY LOWER: Medium branches (Layer 2 at y=19)
3. AT TREE LEVEL: Far light branches (Layer 3 at y=67)
4. ALL SCROLLING: At different speeds (parallax!)

Result: **DENSE FOREST CANOPY with DEPTH** 🌲🌿✨

---

This is THE definitive fix based on exact C code coordinates!
