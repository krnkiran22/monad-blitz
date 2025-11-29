/**
 * ColorTinting - EXACT seasonal colors from C code
 * Handles smooth transitions between seasons
 * Matches screen_gameplay.c lines 546-674
 */
export default class ColorTinting {
    constructor() {
        // Current colors (will transition smoothly)
        this.color00 = { r: 0, g: 0, b: 0 };
        this.color01 = { r: 0, g: 0, b: 0 };
        this.color02 = { r: 0, g: 0, b: 0 };
        this.color03 = { r: 0, g: 0, b: 0 };

        // Transition colors
        this.initColor00 = { r: 0, g: 0, b: 0 };
        this.initColor01 = { r: 0, g: 0, b: 0 };
        this.initColor02 = { r: 0, g: 0, b: 0 };
        this.initColor03 = { r: 0, g: 0, b: 0 };

        this.finalColor00 = { r: 0, g: 0, b: 0 };
        this.finalColor01 = { r: 0, g: 0, b: 0 };
        this.finalColor02 = { r: 0, g: 0, b: 0 };
        this.finalColor03 = { r: 0, g: 0, b: 0 };

        this.transitionFramesCounter = 0;
        this.SEASON_TRANSITION = 200; // Duration of color transition
    }

    // Initialize colors for a specific season
    initializeForSeason(seasonName) {
        const colors = this.getSeasonColors(seasonName);
        this.color00 = { ...colors.color00 };
        this.color01 = { ...colors.color01 };
        this.color02 = { ...colors.color02 };
        this.color03 = { ...colors.color03 };
    }

    // Get exact colors for each season (from C code)
    getSeasonColors(seasonName) {
        const seasonColors = {
            'SPRING': {
                // Spring Color (C code lines 636-639)
                color00: { r: 196, g: 176, b: 49 },
                color01: { r: 178, g: 163, b: 67 },
                color02: { r: 133, g: 143, b: 90 },
                color03: { r: 133, g: 156, b: 42 }
            },
            'SUMMER': {
                // Summer Color (C code lines 546-549)
                color00: { r: 129, g: 172, b: 86 },
                color01: { r: 145, g: 165, b: 125 },
                color02: { r: 161, g: 130, b: 73 },
                color03: { r: 198, g: 103, b: 51 }
            },
            'FALL': {
                // Fall/Autumn Color (C code lines 583-586)
                color00: { r: 242, g: 113, b: 62 },
                color01: { r: 190, g: 135, b: 114 },
                color02: { r: 144, g: 130, b: 101 },
                color03: { r: 214, g: 133, b: 58 }
            },
            'WINTER': {
                // Winter Color (C code lines 614-617)
                color00: { r: 130, g: 130, b: 181 },
                color01: { r: 145, g: 145, b: 166 },
                color02: { r: 104, g: 142, b: 144 },
                color03: { r: 57, g: 140, b: 173 }
            }
        };

        return seasonColors[seasonName] || seasonColors['SPRING'];
    }

    // Start transition to new season (C code lines 546-677)
    startTransition(currentSeason, nextSeason) {
        // Store current colors as initial
        this.initColor00 = { ...this.color00 };
        this.initColor01 = { ...this.color01 };
        this.initColor02 = { ...this.color02 };
        this.initColor03 = { ...this.color03 };

        // Get target colors for next season
        const targetColors = this.getSeasonColors(nextSeason);
        this.finalColor00 = { ...targetColors.color00 };
        this.finalColor01 = { ...targetColors.color01 };
        this.finalColor02 = { ...targetColors.color02 };
        this.finalColor03 = { ...targetColors.color03 };

        // Reset transition counter
        this.transitionFramesCounter = 0;
    }

    // Update transition (called every frame)
    update() {
        if (this.transitionFramesCounter < this.SEASON_TRANSITION) {
            this.transitionFramesCounter++;

            // Linear interpolation (matches C code ColorTransition function)
            this.color00 = this.colorTransition(this.initColor00, this.finalColor00, this.transitionFramesCounter);
            this.color01 = this.colorTransition(this.initColor01, this.finalColor01, this.transitionFramesCounter);
            this.color02 = this.colorTransition(this.initColor02, this.finalColor02, this.transitionFramesCounter);
            this.color03 = this.colorTransition(this.initColor03, this.finalColor03, this.transitionFramesCounter);
        }
    }

    // Color transition helper (matches C code lines 3961-3970)
    colorTransition(initialColor, finalColor, framesCounter) {
        return {
            r: Math.floor(this.linearEaseIn(framesCounter, initialColor.r, finalColor.r - initialColor.r, this.SEASON_TRANSITION)),
            g: Math.floor(this.linearEaseIn(framesCounter, initialColor.g, finalColor.g - initialColor.g, this.SEASON_TRANSITION)),
            b: Math.floor(this.linearEaseIn(framesCounter, initialColor.b, finalColor.b - initialColor.b, this.SEASON_TRANSITION))
        };
    }

    // Linear easing (matches C code line 3957)
    linearEaseIn(t, b, c, d) {
        return c * t / d + b;
    }

    // Get Phaser-compatible tint color
    getTint(colorIndex) {
        let color;
        switch(colorIndex) {
            case 0: color = this.color00; break;
            case 1: color = this.color01; break;
            case 2: color = this.color02; break;
            case 3: color = this.color03; break;
            default: color = { r: 255, g: 255, b: 255 };
        }

        return Phaser.Display.Color.GetColor(color.r, color.g, color.b);
    }

    // Get hex color for debugging
    getHexColor(colorIndex) {
        let color;
        switch(colorIndex) {
            case 0: color = this.color00; break;
            case 1: color = this.color01; break;
            case 2: color = this.color02; break;
            case 3: color = this.color03; break;
            default: return '#ffffff';
        }

        return `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`;
    }
}
