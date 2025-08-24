export default class BootScene extends Phaser.Scene {
  constructor(){ super('Boot'); }
  preload(){
    // Images
    this.load.image('player', 'assets/images/player.png');
    this.load.image('walker', 'assets/images/enemy-walker.png');
    this.load.image('bat', 'assets/images/enemy-bat.png');
    this.load.image('spike', 'assets/images/enemy-spike.png');
    this.load.image('turret', 'assets/images/enemy-turret.png');
    this.load.image('projectile', 'assets/images/projectile.png');
    this.load.image('bg1', 'assets/images/background-layer1.png');
    this.load.image('bg2', 'assets/images/background-layer2.png');
    this.load.image('bg3', 'assets/images/background-layer3.png');
    this.load.image('fog', 'assets/images/fog.png');
    this.load.image('joyBase', 'assets/images/joystick-base.png');
    this.load.image('joyThumb', 'assets/images/joystick-thumb.png');
    this.load.image('pShield', 'assets/images/powerup-shield.png');
    this.load.image('pSpeed', 'assets/images/powerup-speed.png');
    this.load.image('pScore', 'assets/images/powerup-score.png');
    this.load.image('pSlow', 'assets/images/powerup-slowmo.png');
    // Audio
    this.load.audio('bgm', 'assets/audio/bgm.wav');
    this.load.audio('jump', 'assets/audio/jump.wav');
    this.load.audio('collect', 'assets/audio/collect.wav');
    this.load.audio('hit', 'assets/audio/hit.wav');
    this.load.audio('gameover', 'assets/audio/gameover.wav');

    const w = this.scale.width, h = this.scale.height;
    const txt = this.add.text(w/2, h/2, 'Loading...', { fontSize: 24, color: '#eee' }).setOrigin(0.5);
  }
  create(){ this.scene.start('Menu'); }
}
