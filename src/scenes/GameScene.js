// src/scenes/GameScene.js
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import PowerUp from '../objects/PowerUp.js';
import VirtualJoystick from '../objects/VirtualJoystick.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.health = 100;
        this.difficulty = 1;
        this.scoreMultiplier = 1;
        this.isSlowMotion = false;
    }

    create() {
        const { width, height } = this.cameras.main;
        
        // Create parallax backgrounds
        this.bg3 = this.add.tileSprite(0, 0, width, height, 'background-layer3')
            .setOrigin(0, 0)
            .setScrollFactor(0.2, 1);
        this.bg2 = this.add.tileSprite(0, 0, width, height, 'background-layer2')
            .setOrigin(0, 0)
            .setScrollFactor(0.5, 1)
            .setAlpha(0.7);
        this.bg1 = this.add.tileSprite(0, 0, width, height, 'background-layer1')
            .setOrigin(0, 0)
            .setScrollFactor(0.8, 1)
            .setAlpha(0.5);
        
        // Create fog layer
        this.fogLayer = this.add.tileSprite(0, 0, width, height, 'fog')
            .setOrigin(0, 0)
            .setScrollFactor(0, 0)
            .setAlpha(0.3);
        
        // Create ground
        this.ground = this.physics.add.staticGroup();
        const groundGraphics = this.add.graphics();
        groundGraphics.fillStyle(0x000000, 1);
        groundGraphics.fillRect(0, height - 50, width * 3, 50);
        const groundZone = this.add.zone(width * 1.5, height - 25, width * 3, 50);
        this.physics.add.existing(groundZone, true);
        this.ground.add(groundZone);
        
        // Create player
        this.player = new Player(this, 100, height - 150);
        
        // Create groups
        this.enemies = this.physics.add.group();
        this.spikes = this.physics.add.staticGroup();
        this.projectiles = this.physics.add.group();
        this.powerUps = this.physics.add.group();
        this.trees = this.add.group();
        
        // Add initial enemies and decorations
        this.spawnInitialLevel();
        
        // Setup collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.enemies, this.ground);
        this.physics.add.collider(this.powerUps, this.ground);
        
        // Setup overlaps
        this.physics.add.overlap(this.player, this.enemies, this.handleEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.spikes, this.handleSpikeCollision, null, this);
        this.physics.add.overlap(this.player, this.projectiles, this.handleProjectileCollision, null, this);
        this.physics.add.overlap(this.player, this.powerUps, this.handlePowerUpCollection, null, this);
        
        // Setup camera
        this.physics.world.setBounds(0, 0, width * 3, height);
        this.cameras.main.setBounds(0, 0, width * 3, height);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.fadeIn(500);
        
        // Create UI
        this.createUI();
        
        // Create virtual joystick for mobile
        if (this.sys.game.device.input.touch) {
            this.virtualJoystick = new VirtualJoystick(this, 120, height - 120);
        }
        
        // Setup keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,A,S,D');
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Timers
        this.scoreTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateScore,
            callbackScope: this,
            loop: true
        });
        
        this.difficultyTimer = this.time.addEvent({
            delay: 30000,
            callback: this.increaseDifficulty,
            callbackScope: this,
            loop: true
        });
        
        this.enemySpawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });
        
        this.powerUpSpawnTimer = this.time.addEvent({
            delay: 8000,
            callback: this.spawnPowerUp,
            callbackScope: this,
            loop: true
        });
    }
    
    update(time, delta) {
        // Update parallax backgrounds
        this.bg3.tilePositionX = this.cameras.main.scrollX * 0.2;
        this.bg2.tilePositionX = this.cameras.main.scrollX * 0.5;
        this.bg1.tilePositionX = this.cameras.main.scrollX * 0.8;
        this.fogLayer.tilePositionX = time * 0.01;
        
        // Handle player input
        let moveX = 0;
        let jump = false;
        let dash = false;
        
        // Keyboard input
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            moveX = 1;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown || this.spaceKey.isDown) {
            jump = true;
            dash = true;
        }
        
        // Virtual joystick input
        if (this.virtualJoystick) {
            const joystickData = this.virtualJoystick.getData();
            if (joystickData.isPressed) {
                moveX = joystickData.x;
                if (joystickData.y < -0.5) {
                    jump = true;
                }
            }
        }
        
        // Update player
        this.player.update(moveX, jump, dash);
        
        // Update enemies
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.update) {
                enemy.update(time, delta, this.player, this.isSlowMotion);
            }
            // Remove if too far behind
            if (enemy.x < this.cameras.main.scrollX - 100) {
                enemy.destroy();
            }
        });
        
        // Update projectiles
        this.projectiles.children.entries.forEach(projectile => {
            if (projectile.x < 0 || projectile.x > this.physics.world.bounds.width ||
                projectile.y < 0 || projectile.y > this.physics.world.bounds.height) {
                projectile.destroy();
            }
        });
        
        // Check if player fell off world
        if (this.player.y > this.cameras.main.height) {
            this.health = 0;
        }
        
        // Check game over
        if (this.health <= 0) {
            this.gameOver();
        }
    }
    
    createUI() {
        const { width, height } = this.cameras.main;
        
        // Score text
        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setScrollFactor(0).setDepth(100);
        
        // Health bar background
        this.add.rectangle(width - 120, 30, 204, 24, 0x000000, 0.5)
            .setScrollFactor(0).setDepth(100);
        
        // Health bar
        this.healthBar = this.add.rectangle(width - 220, 30, 200, 20, 0x00ff00)
            .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
        
        // Health text
        this.add.text(width - 120, 30, 'HEALTH', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setScrollFactor(0).setDepth(102);
    }
    
    updateHealthBar() {
        const healthPercent = Math.max(0, this.health / 100);
        this.healthBar.width = 200 * healthPercent;
        
        if (healthPercent > 0.5) {
            this.healthBar.fillColor = 0x00ff00;
        } else if (healthPercent > 0.25) {
            this.healthBar.fillColor = 0xffff00;
        } else {
            this.healthBar.fillColor = 0xff0000;
        }
    }
    
    spawnInitialLevel() {
        // Add some trees for decoration
        for (let i = 0; i < 10; i++) {
            const tree = this.add.image(
                200 + i * 250 + Math.random() * 100,
                this.cameras.main.height - 50 - Math.random() * 50,
                'tree'
            ).setOrigin(0.5, 1).setAlpha(0.3).setDepth(-1);
            this.trees.add(tree);
        }
        
        // Add initial spikes
        for (let i = 0; i < 5; i++) {
            const spike = this.spikes.create(
                400 + i * 300,
                this.cameras.main.height - 82,
                'spike'
            );
            spike.setOrigin(0.5);
        }
        
        // Add initial walking enemies
        for (let i = 0; i < 3; i++) {
            const enemy = new Enemy(this, 500 + i * 400, this.cameras.main.height - 100, 'walker');
            this.enemies.add(enemy);
        }
        
        // Add a turret
        const turret = new Enemy(this, 800, this.cameras.main.height - 90, 'turret');
        this.enemies.add(turret);
    }
    
    spawnEnemy() {
        const types = ['walker', 'bat', 'turret'];
        const type = Phaser.Math.RND.pick(types);
        const x = this.player.x + Phaser.Math.Between(400, 800);
        let y;
        
        switch(type) {
            case 'bat':
                y = Phaser.Math.Between(100, 300);
                break;
            case 'turret':
                y = this.cameras.main.height - 90;
                break;
            default:
                y = this.cameras.main.height - 100;
        }
        
        const enemy = new Enemy(this, x, y, type);
        this.enemies.add(enemy);
        
        // Chance to spawn a spike cluster
        if (Math.random() < 0.3) {
            for (let i = 0; i < 3; i++) {
                const spike = this.spikes.create(
                    x + 100 + i * 40,
                    this.cameras.main.height - 82,
                    'spike'
                );
                spike.setOrigin(0.5);
            }
        }
    }
    
    spawnPowerUp() {
        const types = ['shield', 'speed', 'score', 'slowmo'];
        const type = Phaser.Math.RND.pick(types);
        const x = this.player.x + Phaser.Math.Between(300, 600);
        const y = this.cameras.main.height - 200;
        
        const powerUp = new PowerUp(this, x, y, type);
        this.powerUps.add(powerUp);
    }
    
    handleEnemyCollision(player, enemy) {
        if (player.isInvulnerable) return;
        
        if (player.isDashing && player.body.velocity.y > 0) {
            // Player defeats enemy while dashing
            this.createDeathEffect(enemy.x, enemy.y);
            enemy.destroy();
            this.addScore(20);
            this.sound.play('hit', { volume: 0.5 });
        } else {
            // Player takes damage
            this.takeDamage(10);
            player.hit();
        }
    }
    
    handleSpikeCollision(player, spike) {
        if (!player.isInvulnerable) {
            this.takeDamage(15);
            player.hit();
        }
    }
    
    handleProjectileCollision(player, projectile) {
        if (!player.isInvulnerable) {
            this.takeDamage(10);
            projectile.destroy();
            player.hit();
        }
    }
    
    handlePowerUpCollection(player, powerUp) {
        const type = powerUp.getData('type');
        
        switch(type) {
            case 'shield':
                player.activateShield(5000);
                this.showFloatingText(powerUp.x, powerUp.y, 'SHIELD!', '#00ffff');
                break;
            case 'speed':
                player.activateSpeedBoost(8000);
                this.showFloatingText(powerUp.x, powerUp.y, 'SPEED!', '#ffff00');
                break;
            case 'score':
                this.scoreMultiplier = 2;
                this.time.delayedCall(10000, () => { this.scoreMultiplier = 1; });
                this.showFloatingText(powerUp.x, powerUp.y, '2X SCORE!', '#00ff00');
                break;
            case 'slowmo':
                this.isSlowMotion = true;
                this.time.delayedCall(5000, () => { this.isSlowMotion = false; });
                this.showFloatingText(powerUp.x, powerUp.y, 'SLOW MOTION!', '#ff00ff');
                break;
        }
        
        this.sound.play('collect', { volume: 0.5 });
        this.addScore(10);
        powerUp.destroy();
    }
    
    takeDamage(amount) {
        this.health -= amount;
        this.updateHealthBar();
        this.cameras.main.shake(200, 0.01);
        this.cameras.main.flash(200, 255, 0, 0, false, 0.2);
        this.sound.play('hit', { volume: 0.5 });
    }
    
    updateScore() {
        this.addScore(1);
    }
    
    addScore(points) {
        this.score += points * this.scoreMultiplier;
        this.scoreText.setText('Score: ' + this.score);
    }
    
    increaseDifficulty() {
        this.difficulty++;
        this.enemySpawnTimer.delay = Math.max(1000, 3000 - (this.difficulty * 200));
        this.showFloatingText(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            100,
            'WAVE ' + this.difficulty,
            '#ff0000'
        );
    }
    
    showFloatingText(x, y, text, color) {
        const floatingText = this.add.text(x, y, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: color,
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: floatingText,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => floatingText.destroy()
        });
    }
    
    createDeathEffect(x, y) {
        // Create particles
        for (let i = 0; i < 10; i++) {
            const particle = this.add.circle(x, y, 3, 0x000000);
            const angle = (Math.PI * 2 / 10) * i;
            const speed = 100 + Math.random() * 100;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                duration: 500,
                onComplete: () => particle.destroy()
            });
        }
    }
    
    gameOver() {
        this.sound.play('gameover', { volume: 0.5 });
        this.scene.start('GameOverScene', { score: this.score });
    }
}