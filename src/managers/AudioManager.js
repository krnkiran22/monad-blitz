/**
 * AudioManager - Handles ALL game audio (music + sound effects)
 * Matches C code audio system exactly
 */
export default class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.music = null;
        this.musicVolume = 0.5;
        this.sfxVolume = 0.7;
    }

    preload() {
        // Background music (continuous loop)
        // NOTE: jngl.xm is not available, using a silent placeholder
        // In production, replace with actual background music
        
        // Load all sound effects (matching C code exactly)
        this.scene.load.audio('jump', 'assets/jump.ogg');
        this.scene.load.audio('dash', 'assets/dash.ogg');
        this.scene.load.audio('eat_leaves', 'assets/eat_leaves.ogg');
        this.scene.load.audio('resin_hit', 'assets/resin_hit.ogg');
        this.scene.load.audio('wind_sound', 'assets/wind_sound.ogg');
        this.scene.load.audio('snake_die', 'assets/snake_die.ogg');
        this.scene.load.audio('dingo_die', 'assets/dingo_die.ogg');
        this.scene.load.audio('owl_die', 'assets/owl_die.ogg');
    }

    create() {
        // Create all sound instances
        this.sounds = {
            jump: this.scene.sound.add('jump', { volume: this.sfxVolume * 0.5 }),
            dash: this.scene.sound.add('dash', { volume: this.sfxVolume * 0.4 }),
            eat: this.scene.sound.add('eat_leaves', { volume: this.sfxVolume * 0.5 }),
            resinHit: this.scene.sound.add('resin_hit', { volume: this.sfxVolume * 0.6 }),
            wind: this.scene.sound.add('wind_sound', { volume: this.sfxVolume * 0.3, loop: true }),
            snakeDie: this.scene.sound.add('snake_die', { volume: this.sfxVolume * 0.6 }),
            dingoDie: this.scene.sound.add('dingo_die', { volume: this.sfxVolume * 0.6 }),
            owlDie: this.scene.sound.add('owl_die', { volume: this.sfxVolume * 0.6 })
        };

        // TODO: Add background music when available
        // For now, create a simple tone or use placeholder
        // this.music = this.scene.sound.add('background_music', { volume: this.musicVolume, loop: true });
        // this.music.play();
    }

    // Play sound effect (matches C code: PlaySound(fxJump))
    playJump() {
        if (this.sounds.jump && !this.sounds.jump.isPlaying) {
            this.sounds.jump.play();
        }
    }

    playDash() {
        if (this.sounds.dash && !this.sounds.dash.isPlaying) {
            this.sounds.dash.play();
        }
    }

    playEatLeaves() {
        if (this.sounds.eat && !this.sounds.eat.isPlaying) {
            this.sounds.eat.play();
        }
    }

    playResinHit() {
        if (this.sounds.resinHit && !this.sounds.resinHit.isPlaying) {
            this.sounds.resinHit.play();
        }
    }

    playWind() {
        if (this.sounds.wind && !this.sounds.wind.isPlaying) {
            this.sounds.wind.play();
        }
    }

    stopWind() {
        if (this.sounds.wind && this.sounds.wind.isPlaying) {
            this.sounds.wind.stop();
        }
    }

    playSnakeDie() {
        if (this.sounds.snakeDie && !this.sounds.snakeDie.isPlaying) {
            this.sounds.snakeDie.play();
        }
    }

    playDingoDie() {
        if (this.sounds.dingoDie && !this.sounds.dingoDie.isPlaying) {
            this.sounds.dingoDie.play();
        }
    }

    playOwlDie() {
        if (this.sounds.owlDie && !this.sounds.owlDie.isPlaying) {
            this.sounds.owlDie.play();
        }
    }

    // Stop all sounds (called on game over)
    stopAll() {
        this.scene.sound.stopAll();
    }

    // Update music (called every frame - matches C code UpdateMusicStream)
    update() {
        // If using streamed music, update here
        // if (this.music) {
        //     // Update music stream
        // }
    }

    setMusicVolume(volume) {
        this.musicVolume = volume;
        if (this.music) {
            this.music.setVolume(volume);
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = volume;
        Object.values(this.sounds).forEach(sound => {
            if (sound) sound.setVolume(volume);
        });
    }
}
