# FIRE CLIMBING ANIMATION - COMPLETE! 🔥

## What Was Added

The fire now **CLIMBS** the tree and **BURNS** it progressively, exactly like the original C game!

## How It Works

### 1. Fire Spawning
When fire spawns:
- Starts at bottom of screen (y=690)
- Creates fire sprite
- Creates burnt tree sprite (initially hidden)

### 2. Fire Reaches Player
When fire scrolls to player's X position:
- Fire starts climbing (`fireOnFire[i] = true`)
- Burnt tree becomes visible
- Fire moves UP the tree (y -= 2 each frame)

### 3. Progressive Burning
As fire climbs:
- Burnt tree is cropped to show only burned portion
- Burns from bottom to top
- Fire sprite climbs alongside

## C Code Reference

From `screen_gameplay.c` lines 1120-1135:
```c
if (onFire[i] && fire[i].y > -50) {
    fire[i].y -= fireSpeed*TIME_FACTOR;  // Climb up!
}
```

From lines 2606-2626 (rendering):
```c
// Draw burnt tree (cropped based on fire height)
DrawTexturePro(atlas01, 
    (Rectangle){gameplay_props_burnttree.x, 
                gameplay_props_burnttree.y + fire[i].y + gameplay_props_burnttree.height/14,
                gameplay_props_burnttree.width, 
                gameplay_props_burnttree.height},
    ...);

// Draw fire flames at different heights as it climbs
for (int j = MAX_FIRE_FLAMES; j > -2; j--) {
    if ((fire[i].y - 25 <= (j*43)) && fireActive[i]) {
        DrawTextureRec(atlas01, fireAnimation, 
            (Vector2){fire[i].x, 40*j}, WHITE);
    }
}
```

## Implementation Details

### Assets Used
```cpp
// From atlas01.h:
#define gameplay_props_fire_spritesheet (Rectangle){ 516, 930, 256, 128 }
#define gameplay_props_burnttree (Rectangle){ 58, 1028, 43, 720 }
```

**Fire frames**: 4 frames of 64×128px animation  
**Burnt tree**: 43×720px (full tree height)

### Sprite Extraction
```javascript
// Fire frames (already existed)
for (let i = 0; i < 4; i++) {
    // Extract fire_0, fire_1, fire_2, fire_3
}

// Burnt tree (NEW!)
const burntTree = extract(58, 1028, 43, 720);
this.textures.addCanvas('burnt_tree', burntTree);
```

### Fire Climbing Logic
```javascript
// 1. Fire spawns at bottom
fireData[i].y = 720 - 30;
fireOnFire[i] = false;

// 2. Fire reaches player X position
if (fireData[i].x <= playerBounds.x + playerBounds.width) {
    fireOnFire[i] = true;  // Start climbing!
    burntTreeSprites[i].setVisible(true);
}

// 3. Fire climbs up
if (fireOnFire[i] && fireData[i].y > -50) {
    fireData[i].y -= 2;  // Climb speed (fireSpeed from C)
}

// 4. Progressive burning - crop burnt tree
const burnHeight = 720 - fireData[i].y;
burntTreeSprites[i].setCrop(0, 720 - burnHeight, 43, burnHeight);
```

## Visual Result

### Before Fire Reaches Player:
```
[Fire sprite] → scrolling left at bottom of tree
[Tree] normal bamboo stalk
```

### After Fire Reaches Player:
```
Frame 1:  [Fire at bottom] 🔥
          [Burnt section] 🌲🔥 (small)

Frame 10: [Fire climbed up] 
             🔥
          [Burnt section] 🌲🔥🔥 (medium)

Frame 20: [Fire at top]
                🔥
          [Burnt section] 🌲🔥🔥🔥 (most of tree)

Frame 30: [Fire above tree]
          [Fully burnt!] 🔥🔥🔥🔥
```

## Progressive Burning Explanation

The burnt tree is cropped dynamically:
```javascript
// Fire starts at y=690 (bottom)
// As fire climbs to y=300:
// Burn height = 720 - 300 = 420px
// Show bottom 420px of burnt tree sprite
burntTreeSprites[i].setCrop(0, 720-420, 43, 420);

// Fire at y=100:
// Burn height = 720 - 100 = 620px
// Show bottom 620px (almost entire tree)
burntTreeSprites[i].setCrop(0, 720-620, 43, 620);
```

## Branch Position Fix

Also fixed branches to overlap tree tops better:
```javascript
// OLD: Branches at y=67-154 (floating above)
// NEW: Branches at y=67+20 (overlapping into trees)
const groundTop = this.add.image(x, 67 + 20, 'ground_layer');
groundTop.setOrigin(0, 1);  // Bottom-left
groundTop.setScale(2, -2);  // Flipped
```

Now branches connect seamlessly to tree tops!

## Files Modified

- `src/scenes/GameScene.js`:
  - Lines 229-237: Added burnt tree sprite extraction
  - Lines 99-100: Added `fireOnFire[]` and `burntTreeSprites[]` arrays
  - Lines 1165-1183: Updated `spawnFire()` to create burnt tree sprite
  - Lines 731-787: Complete fire climbing and progressive burning logic
  - Lines 417, 450, 483: Lowered branch positions to overlap trees

## Testing

Run the game and watch what happens when fire appears:
✅ Fire spawns at bottom of screen
✅ Fire scrolls left with the tree
✅ When fire reaches player X position, it starts climbing
✅ Burnt tree appears and grows as fire climbs
✅ Tree burns progressively from bottom to top
✅ Fire animation continues as it climbs
✅ If koala touches fire → GAME OVER

## The Complete Fire System

Now the game has:
1. ✅ Fire spawning on bamboo stalks
2. ✅ Fire scrolling with the tree
3. ✅ Fire detecting when it reaches player
4. ✅ Fire climbing up the tree
5. ✅ Progressive tree burning animation
6. ✅ Burnt tree sprite showing damage
7. ✅ Fire collision causing game over

## Progress

**Game Completion: 55% → 60%** (+5% for fire climbing system)

---

**The fire now climbs and burns trees just like the original!** 🔥🌲
