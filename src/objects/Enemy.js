// src/objects/Enemy.js
export default class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        const textureMap = {
            'walker': 'enemy',
            'bat': 'bat',
            'turret': 'turret'
        };
        
        super(scene, x, y, textureMap[type] || 'enemy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.type = type;
        this.scene = scene;
        this.setCollideWorldBounds(true);
        
        // Initialize based on type
        switch(type) {
            case 'walker':
                this.initWalker();
                break;
            case 'bat':
                this.initBat();
                break;
            case 'turret':
                this.initTurret();
                break;
        }
        
        // Add shadow
        this.shadow = scene.add.ellipse(x, y, 20, 8, 0x000000, 0.2);
    }
    
    initWalker() {
        this.speed = 50;
        this.direction = 1;
        this.patrolDistance = 200;
        this.startX = this.x;
        this.setVelocityX(this.speed * this.direction);
        this.setBounce(0.1);
        
        // Walking animation (bobbing)
        this.scene.tweens.add({
            targets: this,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    initBat() {
        this.speed = 100;
        this.swoopRange = 300;
        this.swooping = false;
        this.originalY = this.y;
        this.body.setAllowGravity(false);
        
        // Floating animation
        this.floatTween = this.scene.tweens.add({
            targets: this,
            y: this.y + 30,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Wing flapping
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.8,
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }
    
    initTurret() {
        this.fireRate = 2000;
        this.lastFired = 0;
        this.range = 400;
        this.body.setImmovable(true);
        this.body.setAllowGravity(false);
        
        // Scanning animation
        this.scene.tweens.add({
            targets: this,
            angle: -15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    update(time, delta, player, isSlowMotion) {
        const speedMod = isSlowMotion ? 0.3 : 1;
        
        // Update shadow
        if (this.shadow) {
            this.shadow.x = this.x;
            if (this.type === 'bat') {
                this.shadow.y = this.scene.cameras.main.height - 40;
                this.shadow.alpha = 0.1;
                this.shadow.scaleX = 0.5 + (this.scene.cameras.main.height - this.y) / 1000;
            } else {
                this.shadow.y = this.y + 25;
            }
        }
        
        switch(this.type) {
            case 'walker':
                this.updateWalker(speedMod);
                break;
            case 'bat':
                this.updateBat(player, speedMod);
                break;
            case 'turret':
                this.updateTurret(time, player, speedMod);
                break;
        }
    }
    
    updateWalker(speedMod) {
        // Patrol back and forth
        if (Math.abs(this.x - this.startX) > this.patrolDistance) {
            this.direction *= -1;
            this.setVelocityX(this.speed * this.direction * speedMod);
            this.setFlipX(this.direction < 0);
        }
        
        // Ensure velocity is maintained
        if (Math.abs(this.body.velocity.x) < 10) {
            this.setVelocityX(this.speed * this.direction * speedMod);
        }
    }
    
    updateBat(player, speedMod) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        if (distance < this.swoopRange && !this.swooping) {
            this.swooping = true;
            
            // Stop floating animation
            if (this.floatTween) {
                this.floatTween.stop();
            }
            
            // Swoop towards player
            const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
            this.setVelocity(
                Math.cos(angle) * this.speed * 2 * speedMod,
                Math.sin(angle) * this.speed * 2 * speedMod
            );
            
            // Create swoop trail
            const swoopTrail = this.scene.add.particles(0, 0, 'projectile', {
                speed: { min: 10, max: 30 },
                scale: { start: 0.3, end: 0 },
                lifespan: 200,
                frequency: 20,
                follow: this,
                tint: 0x000000,
                alpha: 0.3
            });
            
            // Return to original position after swoop
            this.scene.time.delayedCall(2000 / speedMod, () => {
                this.swooping = false;
                this.setVelocity(0, 0);
                this.y = this.originalY;
                swoopTrail.destroy();
                
                // Restart floating
                this.floatTween = this.scene.tweens.add({
                    targets: this,
                    y: this.y + 30,
                    duration: 2000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            });
        }
    }
    
    updateTurret(time, player, speedMod) {
        const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        
        // Show targeting laser when in range
        if (distance < this.range) {
            if (!this.targetLaser) {
                this.targetLaser = this.scene.add.graphics();
            }
            
            this.targetLaser.clear();
            this.targetLaser.lineStyle(1, 0xff0000, 0.3);
            this.targetLaser.lineBetween(this.x, this.y - 10, player.x, player.y);
            
            // Fire projectile
            if (time > this.lastFired + (this.fireRate / speedMod)) {
                this.lastFired = time;
                this.fire(player, speedMod);
            }
        } else if (this.targetLaser) {
            this.targetLaser.clear();
        }
        
        // Face player
        this.setFlipX(player.x < this.x);
    }
    
    fire(player, speedMod) {
        const projectile = this.scene.physics.add.sprite(this.x, this.y - 10, 'projectile');
        projectile.body.setAllowGravity(false);
        
        const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        projectile.setVelocity(
            Math.cos(angle) * 200 * speedMod,
            Math.sin(angle) * 200 * speedMod
        );
        
        // Add trail to projectile
        const trail = this.scene.add.particles(0, 0, 'projectile', {
            speed: 0,
            scale: { start: 0.5, end: 0 },
            lifespan: 100,
            frequency: 10,
            follow: projectile,
            alpha: 0.5
        });
        
        projectile.trail = trail;
        projectile.update = function() {
            if (!this.scene) {
                trail.destroy();
            }
        };
        
        this.scene.projectiles.add(projectile);
        
        // Muzzle flash
        const flash = this.scene.add.circle(this.x, this.y - 10, 10, 0xffff00);
        this.scene.tweens.add({
            targets: flash,
            scale: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }
    
    destroy() {
        if (this.shadow) {
            this.shadow.destroy();
        }
        if (this.targetLaser) {
            this.targetLaser.destroy();
        }
        super.destroy();
    }
}