export default class GameOverScene extends Phaser.Scene {
  constructor(){ super('GameOver'); }
  init(data){ this.finalScore = data?.score || 0; }
  create(){
    const { width, height } = this.scale;
    this.add.text(width/2, height*0.4, 'Game Over', { fontSize: 42, color: '#fff' }).setOrigin(0.5);
    this.add.text(width/2, height*0.5, 'Score: ' + this.finalScore, { fontSize: 22, color: '#ddd' }).setOrigin(0.5);
    const retry = this.add.text(width/2, height*0.65, '↻ Restart', { fontSize: 26, color: '#fff', backgroundColor: '#222', padding: 8 })
      .setOrigin(0.5).setInteractive({ useHandCursor: true });
    retry.on('pointerdown', ()=> this.scene.start('Game'));
    const menu = this.add.text(width/2, height*0.75, '⟵ Menu', { fontSize: 18, color: '#ccc' }).setOrigin(0.5).setInteractive({useHandCursor:true});
    menu.on('pointerdown', ()=> this.scene.start('Menu'));
  }
}
