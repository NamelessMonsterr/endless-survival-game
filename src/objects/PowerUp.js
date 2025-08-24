// src/objects/PowerUp.js
export default class PowerUp extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, type) {
        const textureMap = {
            'shield': 'powerup-shield',
            'speed': 'powerup-speed',
            'score': 'powerup-score',
            'slowmo': 'powerup-slowmo'
        };
        
        super(scene, x, y, textureMap[type]);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setData('type', type);
        this.body.setAllowGravity(false);
        
        // Floating animation
        scene.tweens.add({
            targets: this,
            y: y - 20,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Rotation animation
        scene.tweens.add({
            targets: this,
            angle: 360,
            duration: 3000,
            repeat: -1
        });
        
        // Pulsing glow
        this.setScale(1.2);
        scene.tweens.add({
            targets: this,
            scale: 1.5,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Particle aura
        this.particles = scene.add.particles(0, 0, 'projectile', {
            speed: { min: 20, max: 40 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 500,
            frequency: 100,
            follow: this,
            tint: this.getTintColor(type),
            alpha: 0.5
        });
        
        // Glowing ring effect
        this.ring = scene.add.graphics();
        this.updateRing();
    }
    
    getTintColor(type) {
        const colors = {
            'shield': 0x00ffff,
            'speed': 0xffff00,
            'score': 0x00ff00,
            'slowmo': 0xff00ff
        };
        return colors[type] || 0xffffff;
    }
    
    updateRing() {
        const time = this.scene.time.now;
        this.ring.clear();
        this.ring.lineStyle(2, this.getTintColor(this.getData('type')), 0.3);
        
        // Create rotating ring effect
        for (let i = 0; i < 3; i++) {
            const radius = 20 + i * 5;
            const alpha = 0.3 - i * 0.1;
            this.ring.lineStyle(1, this.getTintColor(this.getData('type')), alpha);
            this.ring.strokeCircle(this.x, this.y, radius + Math.sin(time * 0.003 + i) * 3);
        }
    }
    
    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        this.updateRing();
    }
    
    destroy() {
        if (this.particles) {
            this.particles.destroy();
        }
        if (this.ring) {
            this.ring.destroy();
        }
        super.destroy();
    }
}