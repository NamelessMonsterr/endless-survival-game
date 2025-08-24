export default class VirtualJoystick extends Phaser.GameObjects.Container {
  constructor(scene, x, y, radius=72){
    super(scene, x, y);
    this.scene = scene;
    this.radius = radius;
    this.deadzone = 0.12;
    this.pointerId = null;
    this._force = 0;
    this._angle = 0;

    this.base = scene.add.image(0,0,'joyBase').setAlpha(0.9);
    this.thumb = scene.add.image(0,0,'joyThumb').setAlpha(0.95).setScale(0.6);

    this.add([this.base, this.thumb]);
    this.setDepth(1000).setScrollFactor(0);
    this.setSize(radius*2, radius*2);
    this.setInteractive(
      new Phaser.Geom.Circle(this.width/2, this.height/2, radius),
      Phaser.Geom.Circle.Contains
    );

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);

    scene.add.existing(this);
  }
  onDown(p){
    if(this.pointerId !== null) return;
    if(!this.getBounds().contains(p.x,p.y)) return;
    this.pointerId = p.id;
    this.updateKnob(p);
  }
  onMove(p){
    if(p.id !== this.pointerId) return;
    this.updateKnob(p);
  }
  onUp(p){
    if(p.id !== this.pointerId) return;
    this.pointerId = null;
    this.thumb.setPosition(0,0);
    this._force = 0;
  }
  updateKnob(p){
    const local = this.worldToLocal(p.worldX, p.worldY);
    const vec = new Phaser.Math.Vector2(local.x, local.y);
    const max = this.radius;
    if(vec.length() > max) vec.setLength(max);
    this.thumb.setPosition(vec.x, vec.y);
    const force = Phaser.Math.Clamp(vec.length()/max, 0, 1);
    const angle = Math.atan2(vec.y, vec.x);
    this._force = force < this.deadzone ? 0 : (force - this.deadzone)/(1-this.deadzone);
    this._angle = angle;
  }
  worldToLocal(wx, wy){
    const p = this.parentContainer ? this.parentContainer : this;
    const m = p.getWorldTransformMatrix();
    const inv = m.applyInverse(wx, wy, new Phaser.Math.Vector2());
    return { x: inv.x - this.x, y: inv.y - this.y };
  }
  get force(){ return this._force; }
  get angle(){ return this._angle; }
  toVelocity(max){
    if(this._force<=0) return {x:0,y:0};
    return { x: Math.cos(this._angle)*max*this._force, y: Math.sin(this._angle)*max*this._force };
  }
}
