export default class PowerUp extends Phaser.Physics.Arcade.Image {
  constructor(scene, x, y, kind='shield'){
    const key = kind==='shield'?'pShield': kind==='speed'?'pSpeed': kind==='score'?'pScore':'pSlow';
    super(scene, x, y, key);
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setScale(0.9);
    this.setAlpha(0.9);
    this.setDepth(5);
  }
}
