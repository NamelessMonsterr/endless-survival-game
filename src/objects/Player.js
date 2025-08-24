// src/objects/Player.js
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'player');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setBounce(0.1);
        this.setDrag(500, 0);
        
        // Player properties
        this.jumpPower = -400;
        this.moveSpeed = 200;
        this.dashSpeed = 400;
        this.canJump = true;
        this.canDash = true;
        this.isDashing = false;
        this.isInvulnerable = false;
        this.speedBoost = 1;
        
        // Create particle emitter for dash trail
        this.dashParticles = scene.add.particles(0, 0, 'projectile', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            blendMode: 'ADD',
            lifespan: 200,
            frequency: 50,
            follow: this,
            alpha: 0.5
        });
        this.dashParticles.stop();
        
        // Shield effect
        this.shieldGraphics = scene.add.graphics();
        this.shieldGraphics.setVisible(false);
        
        // Shadow
        this.shadow = scene.add.ellipse(x, y + 20, 30, 10, 0x000000, 0.3);
    }
    
    update(moveX, jump, dash) {
        const onGround = this.body.blocked.down;
        
        // Update shadow position
        this.shadow.x = this.x;
        this.shadow.y = this.scene.cameras.main.height - 40;
        this.shadow.scaleX = onGround ? 1 : 0.6;
        this.shadow.alpha = onGround ? 0.3 : 0.15;
        
        // Reset abilities when on ground
        if (onGround) {
            this.canJump = true;
            this.canDash = true;
            this.isDashing = false;
        }
        
        // Horizontal movement
        if (moveX !== 0) {
            this.setVelocityX(moveX * this.moveSpeed * this.speedBoost);
            this.setFlipX(moveX < 0);
        }
        
        // Jump
        if (jump && this.canJump && onGround) {
            this.setVelocityY(this.jumpPower);
            this.canJump = false;
            
            // Jump dust effect
            this.createDustEffect();
        }
        
        // Dash
        if (dash && this.canDash && !onGround) {
            this.isDashing = true;
            this.canDash = false;
            this.setVelocityY(this.dashSpeed);
            this.dashParticles.start();
            
            this.scene.time.delayedCall(300, () => {
                this.isDashing = false;
                this.dashParticles.stop();
            });
        }
        
        // Update shield position
        if (this.shieldGraphics.visible) {
            this.shieldGraphics.clear();
            this.shieldGraphics.lineStyle(2, 0x00ffff, 0.5);
            this.shieldGraphics.strokeCircle(this.x, this.y, 30);
            
            // Rotating shield effect
            const time = this.scene.time.now;
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI * 2 / 6) * i + time * 0.002;
                const x = this.x + Math.cos(angle) * 35;
                const y = this.y + Math.sin(angle) * 35;
                this.shieldGraphics.fillStyle(0x00ffff, 0.3);
                this.shieldGraphics.fillCircle(x, y, 3);
            }
        }
        
        // Update tint based on state
        if (this.isInvulnerable) {
            this.setTint(0x00ffff);
        } else if (this.speedBoost > 1) {
            this.setTint(0xffff00);
        } else if (this.isDashing) {
            this.setTint(0xff00ff);
        } else {
            this.clearTint();
        }
        
        // Rotation based on velocity
        if (!onGround) {
            this.rotation = this.body.velocity.y * 0.0005;
        } else {
            this.rotation = 0;
        }
    }
    
    hit() {
        if (this.isInvulnerable) return;
        
        // Knockback
        this.setVelocityY(-200);
        this.setVelocityX(this.flipX ? 200 : -200);
        
        // Flash effect
        this.scene.tweens.add({
            targets: this,
            alpha: { from: 0.5, to: 1 },
            duration: 100,
            repeat: 3,
            yoyo: true
        });
        
        // Temporary invulnerability
        this.isInvulnerable = true;
        this.scene.time.delayedCall(1000, () => {
            this.isInvulnerable = false;
        });
    }
    
    activateShield(duration) {
        this.isInvulnerable = true;
        this.shieldGraphics.setVisible(true);
        
        // Shield pulse effect
        this.scene.tweens.add({
            targets: this.shieldGraphics,
            alpha: { from: 0.3, to: 0.7 },
            duration: 500,
            yoyo: true,
            repeat: duration / 1000
        });
        
        this.scene.time.delayedCall(duration, () => {
            this.isInvulnerable = false;
            this.shieldGraphics.setVisible(false);
        });
    }
    
    activateSpeedBoost(duration) {
        this.speedBoost = 1.5;
        
        // Speed trail effect
        const speedTrail = this.scene.add.particles(0, 0, 'projectile', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 300,
            frequency: 30,
            follow: this,
            tint: 0xffff00,
            alpha: 0.3
        });
        
        this.scene.time.delayedCall(duration, () => {
            this.speedBoost = 1;
            speedTrail.destroy();
        });
    }
    
    createDustEffect() {
        for (let i = 0; i < 5; i++) {
            const dust = this.scene.add.circle(
                this.x + Phaser.Math.Between(-10, 10),
                this.y + 20,
                Phaser.Math.Between(2, 4),
                0x666666
            );
            
            this.scene.tweens.add({
                targets: dust,
                x: dust.x + Phaser.Math.Between(-20, 20),
                y: dust.y + Phaser.Math.Between(-10, -30),
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => dust.destroy()
            });
        }
    }
}