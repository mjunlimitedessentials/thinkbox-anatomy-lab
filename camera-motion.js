import * as T from './three.module.js';
export class CameraMotion {
  constructor(camera,controls,reduced=false){this.camera=camera;this.controls=controls;this.reduced=reduced;this.active=null;}
  move(position,target){
    if(!this.controls)return;
    if(this.reduced){this.camera.position.copy(position);this.controls.target.copy(target);this.controls.update();return;}
    this.active={from:this.camera.position.clone(),targetFrom:this.controls.target.clone(),to:position.clone(),targetTo:target.clone(),time:0};
  }
  cancel(){this.active=null;}
  update(dt){
    const a=this.active;if(!a)return false;a.time=Math.min(1,a.time+dt/.95);
    const ease=a.time*a.time*(3-2*a.time);
    this.camera.position.lerpVectors(a.from,a.to,ease);this.controls.target.lerpVectors(a.targetFrom,a.targetTo,ease);
    if(a.time===1)this.active=null;return true;
  }
}
