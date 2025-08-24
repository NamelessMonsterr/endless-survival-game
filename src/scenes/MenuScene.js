export default class MenuScene extends Phaser.Scene {
  constructor(){ super('Menu'); }
  create(){
    const { width, height } = this.scale;
    this.add.image(0, height-200, 'bg1').setOrigin(0,1).setScrollFactor(0).setAlpha(0.5);
    this.add.image(0, height-220, 'bg2').setOrigin(0,1).setScrollFactor(0).setAlpha(0.4);
    this.add.image(0, height-240, 'bg3').setOrigin(0,1).setScrollFactor(0).setAlpha(0.3);
    this.add.image(0, height-260, 'fog').setOrigin(0,1).setAlpha(0.25);

    this.add.text(width/2, height*0.3, 'ENDLESS SURVIVAL', { fontSize: 36, color: '#fff' }).setOrigin(0.5);
    this.add.text(width/2, height*0.4, 'Silhouette Edition', { fontSize: 16, color: '#aaa' }).setOrigin(0.5);

    const start = this.add.text(width/2, height*0.6, '▶ START', { fontSize: 28, color: '#fff', backgroundColor: '#222', padding: 8 })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    start.on('pointerdown', ()=> this.scene.start('Game'));

    const instr = this.add.text(width/2, height*0.7, 'Controls: WASD/Arrows or Joystick (tap=jump, hold=dash)', { fontSize: 14, color: '#ddd' })
      .setOrigin(0.5);
  }
}
