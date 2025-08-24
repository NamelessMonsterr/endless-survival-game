import VirtualJoystick from '../objects/VirtualJoystick.js';
import Player from '../objects/Player.js';
import Enemy from '../objects/Enemy.js';
import PowerUp from '../objects/PowerUp.js';

export default class GameScene extends Phaser.Scene {
  constructor(){ super('Game'); }
  create(){
    const { width, height } = this.scale;

    // Parallax background
    this.bg1 = this.add.tileSprite(0, height-150, width, 300, 'bg1').setOrigin(0,1).setScrollFactor(0).setAlpha(0.5);
    this.bg2 = this.add.tileSprite(0, height-170, width, 300, 'bg2').setOrigin(0,1).setScrollFactor(0).setAlpha(0.4);
    this.bg3 = this.add.tileSprite(0, height-190, width, 300, 'bg3').setOrigin(0,1).setScrollFactor(0).setAlpha(0.3);
    this.fog = this.add.tileSprite(0, height-210, width, 300, 'fog').setOrigin(0,1).setScrollFactor(0).setAlpha(0.25);

    // Ground
    const ground = this.add.rectangle(width/2, height-10, width, 20, 0x111111).setOrigin(0.5, 1);
    this.physics.add.existing(ground, true);

    // Player
    this.player = new Player(this, 120, height-80);

    // Groups
    this.enemies = this.physics.add.group();
    this.powerups = this.physics.add.group();
    this.projectiles = this.physics.add.group({ classType: Phaser.Physics.Arcade.Image });

    // Colliders
    this.physics.add.collider(this.player, ground);
    this.physics.add.collider(this.enemies, ground);
    this.physics.add.overlap(this.player, this.enemies, (player, enemy)=>{
      if(enemy.texture.key==='spike' || enemy.texture.key==='projectile' || enemy.type!=='spike'){
        this.player.hurt();
      }
    });
    this.physics.add.overlap(this.player, this.powerups, (player, p)=>{
      this.collectPower(p);
    });

    // Input: keyboard
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D,SPACE');

    // Touch joystick
    if(this.sys.game.device.input.touch){
      this.joy = new VirtualJoystick(this, 96, height-96, 80);
      this.joyButtonDown = false;

      // Simple action via tapping anywhere on right half
      this.input.on('pointerdown', (p)=>{
        if(p.x > width*0.6){
          this.player.tryJump();
          this.joyButtonDown = true;
          this.time.delayedCall(260, ()=>{
            if(this.joyButtonDown){
              // hold = dash
              let dir = new Phaser.Math.Vector2(this.player.flipX?-1:1, 0);
              if(this.joy && this.joy.force>0){
                dir.set(Math.cos(this.joy.angle), Math.sin(this.joy.angle));
              }
              this.player.dash(dir.normalize());
            }
          });
        }
      });
      this.input.on('pointerup', ()=>{ this.joyButtonDown = false; });
      this.scale.on('resize', (s)=>{
        this.joy.setPosition(96, s.height - 96);
      });
    }

    // Score & UI
    this.score = 0;
    this.scoreText = this.add.text(12,12,'Score: 0', { fontSize: 18, color: '#fff' }).setScrollFactor(0);
    this.hpText = this.add.text(width-12,12,'HP: 3', { fontSize: 18, color: '#fff' }).setOrigin(1,0).setScrollFactor(0);

    // Spawners
    this.time.addEvent({ delay: 1600, loop: true, callback: ()=> this.spawnEnemy() });
    this.time.addEvent({ delay: 4000, loop: true, callback: ()=> this.spawnPower() });
    this.surviveTimer = this.time.addEvent({ delay: 1000, loop: true, callback: ()=> this.addScore(1) });

    // BGM
    this.bgm = this.sound.add('bgm', { loop: true, volume: 0.3 });
    this.bgm.play();

    this.difficulty = 1;
    this.time.addEvent({ delay: 30000, loop: true, callback: ()=>{
      this.difficulty++;
      // speed up bgm slightly
      this.bgm.setRate(1 + (this.difficulty-1)*0.05);
    }});
  }

  addScore(v){
    this.score += v;
    this.scoreText.setText('Score: ' + this.score);
    const t = this.add.text(this.player.x, this.player.y-30, '+'+v, { fontSize: 14, color: '#fff' }).setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y-20, alpha: 0, duration: 600, onComplete: ()=> t.destroy() });
  }

  spawnEnemy(){
    const { width, height } = this.scale;
    const r = Phaser.Math.Between(0,3);
    if(r===0){
      // walker from right
      const e = new Enemy(this, width+20, height-80, 'walker');
      e.setVelocityX(- (100 + 20*this.difficulty));
      this.enemies.add(e);
    } else if(r===1){
      // bat from right
      const e = new Enemy(this, width+20, Phaser.Math.Between(80, 220), 'bat');
      e.speedX = - (60 + 15*this.difficulty);
      this.enemies.add(e);
    } else if(r===2){
      // spike on ground
      const e = new Enemy(this, Phaser.Math.Between(100, width-40), this.scale.height-20, 'spike');
      e.setOrigin(0.5,1);
      this.enemies.add(e);
    } else {
      // turret at random height firing
      const y = Phaser.Math.Between(140, this.scale.height-160);
      const e = new Enemy(this, this.scale.width-30, y, 'turret');
      this.enemies.add(e);
      // schedule shots
      this.time.addEvent({ delay: Math.max(1200 - this.difficulty*100, 400), loop: true, callback: ()=>{
        if(!e.active) return;
        const proj = this.physics.add.image(e.x-20, e.y, 'projectile');
        proj.body.setAllowGravity(false);
        proj.setVelocityX(- (180 + this.difficulty*30));
        this.projectiles.add(proj);
        // cleanup
        this.time.delayedCall(6000, ()=> proj.destroy());
        // hit player
        this.physics.add.overlap(this.player, proj, ()=>{
          if(proj.active){
            proj.destroy();
            this.player.hurt();
          }
        });
      }});
    }
  }

  spawnPower(){
    const { width } = this.scale;
    const kinds = ['shield','speed','score','slow'];
    const k = kinds[Phaser.Math.Between(0, kinds.length-1)];
    const p = new PowerUp(this, Phaser.Math.Between(80,width-80), 100+Phaser.Math.Between(0,100), k);
    this.powerups.add(p);
    this.tweens.add({ targets: p, y: p.y+20, yoyo: true, duration: 1000, repeat: -1, ease: 'sine.inOut' });
  }

  collectPower(p){
    this.sound.play('collect', { volume: 0.6 });
    if(p.kind==='shield'){
      // Temporary invulnerability
      this.player.setTint(0x88ffff);
      this.player.invul = true;
      this.time.delayedCall(4000, ()=>{ this.player.invul=false; this.player.clearTint(); });
    } else if(p.kind==='speed'){
      this.player.maxSpeed += 120;
      this.time.delayedCall(5000, ()=>{ this.player.maxSpeed -= 120; });
    } else if(p.kind==='score'){
      this.scoreMultiplier = 2;
      this.time.delayedCall(10000, ()=>{ this.scoreMultiplier = 1; });
      this.scoreMultiplier = 2;
    } else if(p.kind==='slow'){
      this.time.timeScale = 0.6;
      this.time.delayedCall(2500, ()=>{ this.time.timeScale = 1; });
    }
    this.addScore(10);
    p.destroy();
  }

  update(time, delta){
    // parallax motion
    this.bg1.tilePositionX += 0.1;
    this.bg2.tilePositionX += 0.2;
    this.bg3.tilePositionX += 0.3;
    this.fog.tilePositionX += 0.15;

    // input
    let targetVX = 0;
    if(this.joy){
      const v = this.joy.toVelocity(this.player.maxSpeed);
      targetVX = v.x;
      // jump on quick tap handled in pointerdown
    } else {
      const left = this.cursors.left.isDown || this.keys.A.isDown;
      const right = this.cursors.right.isDown || this.keys.D.isDown;
      if(left) targetVX = -this.player.maxSpeed;
      else if(right) targetVX = this.player.maxSpeed;
      if((this.cursors.up.isDown || this.keys.W.isDown || this.keys.SPACE.isDown)) this.player.tryJump();
    }
    this.player.move(targetVX);

    // update UI
    this.hpText.setText('HP: ' + this.player.hp);
  }

  gameOver(){
    this.sound.play('gameover', { volume: 0.8 });
    this.bgm.stop();
    this.scene.start('GameOver', { score: this.score });
  }
}
