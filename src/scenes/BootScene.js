// src/scenes/BootScene.js
export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        
        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            font: '20px monospace',
            fill: '#ffffff'
        });
        loadingText.setOrigin(0.5, 0.5);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        
        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
        });
    }

    create() {
        // Create all game assets programmatically
        const graphics = this.add.graphics();
        
        // Player
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 0, 32, 48);
        graphics.generateTexture('player', 32, 48);
        graphics.clear();
        
        // Enemy walker
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(20, 30, 15);
        graphics.fillRect(15, 30, 10, 20);
        graphics.generateTexture('enemy', 40, 50);
        graphics.clear();
        
        // Bat
        graphics.fillStyle(0x000000, 1);
        graphics.beginPath();
        graphics.moveTo(20, 10);
        graphics.lineTo(5, 5);
        graphics.lineTo(0, 10);
        graphics.lineTo(5, 12);
        graphics.lineTo(10, 10);
        graphics.lineTo(15, 12);
        graphics.lineTo(20, 10);
        graphics.lineTo(25, 12);
        graphics.lineTo(30, 10);
        graphics.lineTo(35, 12);
        graphics.lineTo(40, 10);
        graphics.lineTo(35, 5);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('bat', 40, 20);
        graphics.clear();
        
        // Spike
        graphics.fillStyle(0x000000, 1);
        graphics.fillTriangle(16, 0, 0, 32, 32, 32);
        graphics.generateTexture('spike', 32, 32);
        graphics.clear();
        
        // Turret
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(0, 15, 35, 25);
        graphics.fillRect(25, 10, 25, 10);
        graphics.generateTexture('turret', 50, 40);
        graphics.clear();
        
        // Projectile
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(4, 4, 4);
        graphics.generateTexture('projectile', 8, 8);
        graphics.clear();
        
        // Background Layer 1 (furthest)
        const gradient1 = this.add.graphics();
        const color1 = new Phaser.Display.Color(68, 68, 68);
        const color2 = new Phaser.Display.Color(34, 34, 34);
        for (let i = 0; i < 256; i++) {
            const c = Phaser.Display.Color.Interpolate.ColorWithColor(color1, color2, 256, i);
            gradient1.fillStyle(Phaser.Display.Color.GetColor(c.r, c.g, c.b), 0.3);
            gradient1.fillRect(0, i * 2.5, 800, 2.5);
        }
        gradient1.generateTexture('background-layer1', 800, 600);
        gradient1.destroy();
        
        // Background Layer 2 (middle)
        graphics.fillStyle(0x555555, 0.4);
        graphics.fillEllipse(200, 400, 300, 150);
        graphics.fillEllipse(500, 450, 400, 200);
        graphics.fillEllipse(700, 420, 250, 140);
        graphics.generateTexture('background-layer2', 800, 600);
        graphics.clear();
        
        // Background Layer 3 (closest)
        graphics.fillStyle(0x333333, 0.3);
        graphics.fillEllipse(100, 350, 200, 100);
        graphics.fillEllipse(400, 380, 250, 120);
        graphics.fillEllipse(650, 400, 300, 150);
        graphics.generateTexture('background-layer3', 800, 600);
        graphics.clear();
        
        // Tree
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(20, 50, 10, 50);
        graphics.fillCircle(25, 40, 25);
        graphics.fillCircle(15, 50, 15);
        graphics.fillCircle(35, 50, 15);
        graphics.generateTexture('tree', 50, 100);
        graphics.clear();
        
        // Fog
        graphics.fillStyle(0xaaaaaa, 0.15);
        for (let i = 0; i < 5; i++) {
            graphics.fillEllipse(
                Math.random() * 800, 
                300 + Math.random() * 200, 
                200 + Math.random() * 200, 
                100 + Math.random() * 100
            );
        }
        graphics.generateTexture('fog', 800, 600);
        graphics.clear();
        
        // Joystick base
        graphics.lineStyle(4, 0xffffff, 0.3);
        graphics.strokeCircle(64, 64, 60);
        graphics.fillStyle(0x000000, 0.2);
        graphics.fillCircle(64, 64, 60);
        graphics.generateTexture('joystick-base', 128, 128);
        graphics.clear();
        
        // Joystick thumb
        graphics.fillStyle(0xffffff, 0.5);
        graphics.fillCircle(32, 32, 28);
        graphics.fillStyle(0xffffff, 0.3);
        graphics.fillCircle(32, 32, 20);
        graphics.generateTexture('joystick-thumb', 64, 64);
        graphics.clear();
        
        // Shield powerup
        graphics.lineStyle(3, 0x00ffff, 1);
        graphics.strokeCircle(16, 16, 14);
        graphics.fillStyle(0x00ffff, 0.3);
        graphics.fillCircle(16, 16, 14);
        graphics.generateTexture('powerup-shield', 32, 32);
        graphics.clear();
        
        // Speed powerup
        graphics.fillStyle(0xffff00, 0.8);
        graphics.beginPath();
        graphics.moveTo(8, 16);
        graphics.lineTo(24, 10);
        graphics.lineTo(18, 16);
        graphics.lineTo(24, 22);
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('powerup-speed', 32, 32);
        graphics.clear();
        
        // Score powerup
        graphics.fillStyle(0x00ff00, 0.8);
        const points = 5;
        const inner = 8;
        const outer = 14;
        let rot = Math.PI / 2 * 3;
        let x = 16;
        let y = 16;
        const step = Math.PI / points;
        graphics.beginPath();
        graphics.moveTo(16, 16 - outer);
        for (let i = 0; i < points; i++) {
            x = 16 + Math.cos(rot) * outer;
            y = 16 + Math.sin(rot) * outer;
            graphics.lineTo(x, y);
            rot += step;
            x = 16 + Math.cos(rot) * inner;
            y = 16 + Math.sin(rot) * inner;
            graphics.lineTo(x, y);
            rot += step;
        }
        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('powerup-score', 32, 32);
        graphics.clear();
        
        // Slowmo powerup
        graphics.fillStyle(0xff00ff, 0.8);
        graphics.fillCircle(16, 16, 12);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(14, 8, 4, 10);
        graphics.fillRect(14, 8, 8, 3);
        graphics.generateTexture('powerup-slowmo', 32, 32);
        
        graphics.destroy();
        
        this.scene.start('MenuScene');
    }
}