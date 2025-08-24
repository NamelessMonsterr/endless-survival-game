// src/scenes/GameOverScene.js
export default class GameOverScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameOverScene' });
    }
    
    init(data) {
        this.finalScore = data.score || 0;
    }
    
    create() {
        const { width, height } = this.cameras.main;
        
        // Dark background
        this.add.rectangle(0, 0, width, height, 0x000000, 0.8).setOrigin(0);
        
        // Game Over text
        const gameOverText = this.add.text(width / 2, height / 3, 'GAME OVER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Flashing effect
        this.tweens.add({
            targets: gameOverText,
            alpha: 0.5,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // Final score
        this.add.text(width / 2, height / 2, 'Final Score: ' + this.finalScore, {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // High score check
        const highScore = localStorage.getItem('silhouetteRunnerHighScore') || 0;
        if (this.finalScore > highScore) {
            localStorage.setItem('silhouetteRunnerHighScore', this.finalScore);
            this.add.text(width / 2, height / 2 + 40, 'NEW HIGH SCORE!', {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
        } else {
            this.add.text(width / 2, height / 2 + 40, 'High Score: ' + highScore, {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5);
        }
        
        // Restart button
        const restartButton = this.add.text(width / 2, height * 0.7, 'RESTART', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Menu button
        const menuButton = this.add.text(width / 2, height * 0.8, 'MAIN MENU', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        // Button interactions
        restartButton.on('pointerover', () => {
            restartButton.setScale(1.1);
            restartButton.setColor('#00ff00');
        });
        
        restartButton.on('pointerout', () => {
            restartButton.setScale(1);
            restartButton.setColor('#ffffff');
        });
        
        restartButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
        
        menuButton.on('pointerover', () => {
            menuButton.setScale(1.05);
            menuButton.setColor('#ffffff');
        });
        
        menuButton.on('pointerout', () => {
            menuButton.setScale(1);
            menuButton.setColor('#cccccc');
        });
        
        menuButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('MenuScene');
            });
        });
        
        // Fade in
        this.cameras.main.fadeIn(500);
    }
}