export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y){
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setBounce(0.0);
    this.setDragX(800);
    this.maxSpeed = 260;
    this.jumpSpeed = -420;
    this.isDashing = false;
    this.hp = 3;
  }
  move(vx){
    if(this.isDashing) return;
    this.setVelocityX(vx);
    if(vx < -10) this.setFlipX(true);
    if(vx > 10) this.setFlipX(false);
  }
  tryJump(){
    if(this.body.blocked.down){
      this.setVelocityY(this.jumpSpeed);
      this.scene.sound.play('jump', { volume: 0.5 });
    }
  }
  dash(dirVec){
    if(this.isDashing) return;
    this.isDashing = true;
    const speed = 520;
    this.setVelocity(dirVec.x*speed, dirVec.y*speed*0.2);
    const trail = this.scene.add.particles(0,0,'projectile', {
      speed: 0, scale: { start: 0.5, end: 0 }, alpha: { start: 0.8, end: 0 }, lifespan: 200
    });
    trail.startFollow(this);
    this.scene.time.delayedCall(150, ()=>{ this.isDashing=false; trail.destroy(); });
  }
  hurt(){
    this.hp = Math.max(0, this.hp - 1);
    this.scene.cameras.main.shake(150, 0.004);
    this.scene.sound.play('hit', { volume: 0.6 });
    if(this.hp <= 0){
      this.scene.gameOver();
    }
  }
}
