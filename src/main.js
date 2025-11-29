import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import MenuScene from './scenes/MenuScene';
import GameOverScene from './scenes/GameOverScene';
import RoomScene from './scenes/RoomScene';

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#87CEEB',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [MenuScene, RoomScene, GameScene, GameOverScene],
    // Don't pause game when browser tab loses focus
    // This prevents players from cheating by switching tabs
    pauseOnBlur: false
};

const game = new Phaser.Game(config);

export default game;
