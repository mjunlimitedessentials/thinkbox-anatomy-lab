import * as T from './three.module.js';

// Original procedural surface detail, for visual illustration rather than histology.
const surfaceCache=new Map();
export function tissueSurface(system){
  if(surfaceCache.has(system))return surfaceCache.get(system);
  const size=128,color=new Uint8Array(size*size*4),height=new Uint8Array(size*size*4);
  let seed=137;for(const c of system)seed=(seed*31+c.charCodeAt(0))>>>0;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const noise=random(),fiber=system==='muscle'?Math.sin(x*.95+Math.sin(y*.08)*2)*.5+.5:noise;
    const cell=system==='respiratory'?Math.pow(Math.sin(x*.7)*Math.sin(y*.75),2):noise;
    const vessel=system==='heart'?Math.pow(Math.max(0,Math.cos(x*.11+Math.sin(y*.07)*2)),18):0;
    const v=Math.round(231+noise*18+fiber*5-cell*8-vessel*20),h=Math.round(100+noise*70+fiber*30+cell*20);
    const i=(y*size+x)*4;color.set([v,v,v,255],i);height.set([h,h,h,255],i);
  }
  const map=new T.DataTexture(color,size,size),bump=new T.DataTexture(height,size,size);
  for(const t of [map,bump]){t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.repeat.set(system==='muscle'?3:2,2);t.needsUpdate=true;}
  map.colorSpace=T.SRGBColorSpace;
  const surface={map,bump};surfaceCache.set(system,surface);return surface;
}
export function tissueMaterial(system,color,opacity){
  const {map,bump}=tissueSurface(system),bone=system==='bone',skin=system==='skin';
  return new T.MeshPhysicalMaterial({color,map,bumpMap:bump,bumpScale:bone?.007:skin?.005:.012,
    roughness:bone?.68:system==='muscle'?.53:.4,metalness:0,
    clearcoat:bone?.06:skin?.12:.24,clearcoatRoughness:.5,
    transparent:true,opacity,side:T.DoubleSide});
}
export function sculptedSphere(base,name,side=1){
  if(!/lung|kidney|Heart|Stomach|Liver|Brain|Pancreas/.test(name))return base;
  const g=base.clone(),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    let x=p.getX(i),y=p.getY(i),z=p.getZ(i),radial=1;
    if(name.endsWith(' lung')){
      radial=.94-.13*y+.025*Math.sin(y*10)*Math.cos(x*8);
      // Medial concavity and a tapered apex; contours remain illustrative.
      x*=1-.22*Math.exp(-Math.pow((y-.03)*2.8,2))*Math.max(0,-x*side);
    }else if(name.endsWith(' kidney')){
      x*=1-.48*Math.exp(-y*y*11)*Math.max(0,-x*side);radial=1+.035*Math.cos(y*5);
    }else if(name==='Heart'){
      radial=.82+.18*y;x+=.10*(1-y*y);z*=1+.08*Math.sin(y*5);
    }else if(name==='Liver'){
      radial=.94+.08*Math.sin(x*3);y*=.92+.12*x;z*=1+.04*Math.cos(x*5);
    }else if(name==='Stomach'){
      x+=.16*(1-y*y);radial=.91+.12*y;
    }else if(name==='Brain'){
      radial=1+.021*Math.sin(x*23+y*11)*Math.sin(z*21-y*13);
    }else if(name==='Pancreas')radial=1+.055*Math.sin(x*27)*Math.cos(y*9);
    p.setXYZ(i,x*radial,y*radial,z*radial);
  }
  g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();g.userData.sculpted=true;return g;
}
