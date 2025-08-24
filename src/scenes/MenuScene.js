// src/scenes/MenuScene.js
export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    create() {
        const { width, height } = this.cameras.main;
        
        this.add.image(width / 2, height / 2, 'background-layer3');
        this.add.image(width / 2, height / 2, 'background-layer2').setAlpha(0.7);
        this.add.image(width / 2, height / 2, 'background-layer1').setAlpha(0.5);
        
        const title = this.add.text(width / 2, height / 3, 'SILHOUETTE RUNNER', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        });
        title.setOrigin(0.5);
        title.setShadow(2, 2, '#000000', 5);
        
        const startButton = this.add.text(width / 2, height / 2, 'START', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        startButton.setOrigin(0.5);
        startButton.setInteractive({ useHandCursor: true });
        
        const instructionsButton = this.add.text(width / 2, height / 2 + 60, 'INSTRUCTIONS', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        });
        instructionsButton.setOrigin(0.5);
        instructionsButton.setInteractive({ useHandCursor: true });
        
        const instructionsText = this.add.text(width / 2, height * 0.75, 
            'WASD/Arrows: Move\nSpace: Jump & Dash\nCollect power-ups\nAvoid enemies', {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            align: 'center'
        });
        instructionsText.setOrigin(0.5);
        instructionsText.setVisible(false);
        
        startButton.on('pointerover', () => {
            startButton.setScale(1.1);
            startButton.setColor('#ffff00');
        });
        
        startButton.on('pointerout', () => {
            startButton.setScale(1);
            startButton.setColor('#ffffff');
        });
        
        startButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        });
        
        instructionsButton.on('pointerdown', () => {
            instructionsText.setVisible(!instructionsText.visible);
        });
    }
}