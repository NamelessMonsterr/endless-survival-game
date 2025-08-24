// src/objects/VirtualJoystick.js
export default class VirtualJoystick {
    constructor(scene, x, y) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.radius = 60;
        this.isPressed = false;
        this.pointer = null;
        
        // Create joystick graphics
        this.base = scene.add.image(x, y, 'joystick-base')
            .setScrollFactor(0)
            .setAlpha(0.5)
            .setDepth(100)
            .setInteractive();
        
        this.thumb = scene.add.image(x, y, 'joystick-thumb')
            .setScrollFactor(0)
            .setAlpha(0.7)
            .setDepth(101);
        
        // Visual feedback ring
        this.feedbackRing = scene.add.graphics();
        this.feedbackRing.setScrollFactor(0);
        this.feedbackRing.setDepth(99);
        
        // Setup input events
        scene.input.on('pointerdown', this.handlePointerDown, this);
        scene.input.on('pointermove', this.handlePointerMove, this);
        scene.input.on('pointerup', this.handlePointerUp, this);
        scene.input.on('pointercancel', this.handlePointerUp, this);
    }
    
    handlePointerDown(pointer) {
        // Check if pointer is within joystick area
        const distance = Phaser.Math.Distance.Between(
            pointer.x, pointer.y,
            this.x, this.y
        );
        
        if (distance <= this.radius * 1.5) {
            this.isPressed = true;
            this.pointer = pointer;
            this.updateThumbPosition(pointer);
            
            // Visual feedback
            this.base.setAlpha(0.8);
            this.thumb.setAlpha(1);
            
            // Draw feedback ring
            this.feedbackRing.clear();
            this.feedbackRing.lineStyle(2, 0xffffff, 0.5);
            this.feedbackRing.strokeCircle(this.x, this.y, this.radius);
        }
    }
    
    handlePointerMove(pointer) {
        if (this.isPressed && pointer.id === this.pointer.id) {
            this.updateThumbPosition(pointer);
        }
    }
    
    handlePointerUp(pointer) {
        if (this.isPressed && (!this.pointer || pointer.id === this.pointer.id)) {
            this.isPressed = false;
            this.pointer = null;
            
            // Reset visual state
            this.base.setAlpha(0.5);
            this.thumb.setAlpha(0.7);
            this.feedbackRing.clear();
            
            // Animate thumb back to center
            this.scene.tweens.add({
                targets: this.thumb,
                x: this.x,
                y: this.y,
                duration: 100,
                ease: 'Power2'
            });
        }
    }
    
    updateThumbPosition(pointer) {
        const distance = Phaser.Math.Distance.Between(
            pointer.x, pointer.y,
            this.x, this.y
        );
        
        if (distance <= this.radius) {
            // Within bounds
            this.thumb.x = pointer.x;
            this.thumb.y = pointer.y;
        } else {
            // Clamp to radius
            const angle = Phaser.Math.Angle.Between(
                this.x, this.y,
                pointer.x, pointer.y
            );
            
            this.thumb.x = this.x + Math.cos(angle) * this.radius;
            this.thumb.y = this.y + Math.sin(angle) * this.radius;
        }
        
        // Update feedback ring color based on distance
        const normalizedDistance = Math.min(distance / this.radius, 1);
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            { r: 255, g: 255, b: 255 },
            { r: 255, g: 0, b: 0 },
            100,
            normalizedDistance * 100
        );
        
        this.feedbackRing.clear();
        this.feedbackRing.lineStyle(2, Phaser.Display.Color.GetColor(color.r, color.g, color.b), 0.5);
        this.feedbackRing.strokeCircle(this.x, this.y, this.radius);
    }
    
    getData() {
        const dx = this.thumb.x - this.x;
        const dy = this.thumb.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return {
            isPressed: this.isPressed,
            x: dx / this.radius,
            y: dy / this.radius,
            angle: Math.atan2(dy, dx),
            distance: Math.min(1, distance / this.radius),
            rawX: dx,
            rawY: dy
        };
    }
    
    destroy() {
        this.base.destroy();
        this.thumb.destroy();
        this.feedbackRing.destroy();
        
        this.scene.input.off('pointerdown', this.handlePointerDown, this);
        this.scene.input.off('pointermove', this.handlePointerMove, this);
        this.scene.input.off('pointerup', this.handlePointerUp, this);
        this.scene.input.off('pointercancel', this.handlePointerUp, this);
    }
}