export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type='walker'){
    const key = (type==='walker')?'walker': (type==='bat')?'bat': (type==='turret')?'turret':'spike';
    super(scene, x, y, key);
    this.type = type;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if(type==='walker'){
      this.setGravityY(1000);
      this.setVelocityX(Phaser.Math.Between(-120,-60));
      this.setCollideWorldBounds(true);
      this.setBounce(0);
    } else if(type==='bat'){
      this.body.setAllowGravity(false);
      this.baseY = y;
      this.speedX = Phaser.Math.Between(-80,-40);
    } else if(type==='turret'){
      this.body.setAllowGravity(false);
      this.fireCooldown = 1200;
      this.lastShot = 0;
    } else if(type==='spike'){
      this.body.setAllowGravity(false);
      this.setImmovable(true);
    }
  }
  preUpdate(t, dt){
    super.preUpdate(t, dt);
    if(this.type==='bat'){
      this.x += this.speedX * (dt/1000);
      this.y = this.baseY + Math.sin(t/300)*10;
      if(this.x < -32) this.destroy();
    }
  }
}
