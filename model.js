import * as T from './three.module.js';
import {systems,facts} from './data.js';
import {tissueMaterial,sculptedSphere} from './tissue.js';
export function buildModel(scene){
const structures=[],meshes=[]; const groups={};for(const k in systems){groups[k]=new T.Group();scene.add(groups[k]);}
const sphere=new T.SphereGeometry(1,32,24);
function entry(name,system,region,key,extra={}){const d={id:structures.length,name,system,region,...(facts[key]||{}),...extra,parts:[],hidden:false};structures.push(d);return d;}
function mat(d,color){return tissueMaterial(d.system,color||systems[d.system].color,systems[d.system].opacity);}
function add(d,geom,p,s=[1,1,1],color){const m=new T.Mesh(geom,mat(d,color));m.position.set(...p);m.scale.set(...s);m.userData.structure=d;m.userData.base=p.slice();m.userData.scale=s.slice();d.parts.push(m);meshes.push(m);groups[d.system].add(m);return m;}
function ell(d,p,s,color){return add(d,sculptedSphere(sphere,d.name,p[0]<0?-1:1),p,s,color);}
function tube(d,points,r=.04,color){const path=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)));const center=path.getPoint(.5);const shifted=points.map(p=>new T.Vector3(...p).sub(center));const curve=new T.CatmullRomCurve3(shifted);const m=add(d,new T.TubeGeometry(curve,Math.max(16,points.length*(r<=.015?4:8)),r,r<=.015?6:10,false),center.toArray(),[1,1,1],color);m.userData.path=path;return m;}
function bone(d,a,b,r=.085){tube(d,[a,b],r);ell(d,a,[r*1.65,r*1.4,r*1.55]);ell(d,b,[r*1.65,r*1.4,r*1.55]);}
// Coordinates: +X = patient's left, +Y = superior, +Z = anterior.
const skin=entry('Skin & external surface','skin','Whole body',null,{function:'External protective covering.',location:'Surface of the body.',relationships:'A translucent schematic body envelope; facial, genital, and skin microanatomy are not detailed.'});
ell(skin,[0,8.05,0],[.48,.64,.43]);ell(skin,[0,7.48,0],[.24,.40,.24]);ell(skin,[0,6.4,0],[.96,.99,.46]);ell(skin,[0,5.32,0],[.71,.75,.40]);ell(skin,[0,4.65,-.015],[.83,.63,.48]);
for(const s of [-1,1]){ell(skin,[s*1.05,6.62,0],[.32,.44,.32]);let a=ell(skin,[s*1.30,5.95,0],[.25,.72,.26]);a.rotation.z=s*.19;let b=ell(skin,[s*1.56,4.9,.025],[.20,.57,.21]);b.rotation.z=s*.15;ell(skin,[s*1.70,4.20,.02],[.20,.29,.09]);for(let i=0;i<4;i++){const x=s*(1.56+i*.09);tube(skin,[[x,4.13,.03],[x+s*.04,3.77+(i===0?.08:i===3?.1:0),.03]],.039);}tube(skin,[[s*1.84,4.32,.02],[s*1.99,4.13,.09]],.065);ell(skin,[s*.46,3.53,0],[.36,1,.37]);ell(skin,[s*.45,1.55,-.03],[.25,.92,.27]);ell(skin,[s*.46,.39,.20],[.25,.22,.49]);}
const skull=entry('Skull','bone','Head & neck',null,{function:'Protects the brain and supports the face.',location:'Head.',relationships:'Cranial vault and facial skeleton are approximated, without foramina or individual cranial bones.'});ell(skull,[0,8.16,-.025],[.445,.51,.40]);ell(skull,[0,7.79,.14],[.31,.23,.28]);
for(const s of [-1,1])ell(skull,[s*.19,8.03,.335],[.105,.09,.035],'#776f62');
const spine=entry('Vertebral column','bone','Back',null,{function:'Supports the trunk and encloses the vertebral canal.',relationships:'Vertebral levels and curvature are illustrative, not measurement-grade.'});for(let i=0;i<24;i++){let y=7.55-i*.128;let z=-.20-.09*Math.sin(i*.21);ell(spine,[0,y,z],[.17,.058,.16]);tube(spine,[[0,y,z],[0,y-.025,z-.20]],.036);}
const discs=entry('Intervertebral discs','joint','Back',null,{function:'Distribute loads between vertebral bodies.',clinical:'Disc displacement may affect nearby nerve roots; no herniation simulation is included.'});for(let i=0;i<23;i++)ell(discs,[0,7.48-i*.128,-.24],[.16,.020,.145]);
const sternum=entry('Sternum','bone','Thorax');ell(sternum,[0,6.54,.40],[.09,.51,.07]);
for(const s of [-1,1]){const side=s<0?'Right':'Left';const rib=entry(side+' rib cage','bone','Thorax',null,{relationships:'Twelve ribs are suggested as a group; individual articulations and costal cartilage are simplified.'});for(let i=0;i<12;i++){let y=7.05-i*.127;let w=.46+Math.sin((i+1)/13*Math.PI)*.36;let front=i>8?.16:.35;tube(rib,[[s*.10,y,-.24],[s*w*.88,y-.04,-.40],[s*w,y-.13,-.07],[s*w*.82,y-.24,.31],[s*.10,y-.30,front]],.035);}
let clav=entry(side+' clavicle','bone','Upper limb');bone(clav,[s*.08,7.04,.31],[s*.98,7.00,.06],.055);
let scap=entry(side+' scapula','bone','Upper limb');let sc=ell(scap,[s*.65,6.61,-.40],[.31,.42,.042]);sc.rotation.z=s*-.25;
let pelvis=entry(side+' hip bone','bone','Pelvis');ell(pelvis,[s*.53,4.75,-.10],[.32,.42,.19]);tube(pelvis,[[s*.70,4.48,0],[s*.48,4.19,.14],[s*.11,4.30,.24],[s*.12,4.49,.07],[s*.53,4.7,-.10]],.10);
let hum=entry(side+' humerus','bone','Upper limb');bone(hum,[s*1.06,6.87,0],[s*1.45,5.48,0],.085);
let radius=entry(side+' radius','bone','Upper limb');bone(radius,[s*1.52,5.46,.03],[s*1.78,4.42,.04],.047);
let ulna=entry(side+' ulna','bone','Upper limb');bone(ulna,[s*1.40,5.45,-.02],[s*1.64,4.42,-.01],.047);
let hand=entry(side+' hand bones','bone','Upper limb',null,{relationships:'Grouped carpals, metacarpals, and phalanges; individual bones are not resolved.'});for(let i=0;i<4;i++)bone(hand,[s*(1.57+i*.086),4.34,.025],[s*(1.60+i*.096),3.83+(i===0?.08:i===3?.1:0),.025],.025);bone(hand,[s*1.8,4.33,.02],[s*1.95,4.14,.08],.025);
let fem=entry(side+' femur','bone','Lower limb',null,{function:'Transfers loads between hip and knee.'});bone(fem,[s*.54,4.36,0],[s*.43,2.45,.02],.13);
let tib=entry(side+' tibia','bone','Lower limb');bone(tib,[s*.4,2.33,.07],[s*.40,.63,.01],.085);
let fib=entry(side+' fibula','bone','Lower limb');bone(fib,[s*.59,2.31,-.045],[s*.58,.57,-.03],.043);
let pat=entry(side+' patella','bone','Lower limb');ell(pat,[s*.43,2.38,.24],[.13,.16,.07]);
let foot=entry(side+' foot bones','bone','Lower limb');ell(foot,[s*.46,.41,.01],[.18,.16,.25]);for(let i=0;i<5;i++)bone(foot,[s*(.29+i*.075),.32,.18],[s*(.29+i*.075),.27,.60-i*.025],.025);
let knee=entry(side+' knee joint','joint','Lower limb',null,{function:'Permits flexion and extension with coupled rotation.',relationships:'Joint region only. Menisci, articular surfaces, and cruciate footprints require validated assets.'});ell(knee,[s*.43,2.39,.01],[.22,.17,.20]);
let acl=entry(side+' anterior cruciate ligament','joint','Lower limb',null,{function:'Helps resist anterior translation of the tibia relative to the femur.',relationships:'Schematic course; insertion footprints are not validated.'});tube(acl,[[s*.43,2.25,.1],[s*.48,2.51,-.06]],.028);
let tendon=entry(side+' calcaneal tendon','joint','Lower limb',null,{common:'Achilles tendon',function:'Transmits force from the triceps surae to the calcaneus.'});tube(tendon,[[s*.46,1.15,-.24],[s*.46,.4,-.21]],.05);
let del=entry(side+' deltoid','muscle','Upper limb','deltoid');ell(del,[s*1.01,6.79,.035],[.34,.38,.30]);
let bic=entry(side+' biceps brachii','muscle','Upper limb','biceps');let bm=ell(bic,[s*1.28,6.02,.12],[.17,.59,.19]);bm.rotation.z=s*.20;
let tri=entry(side+' triceps brachii','muscle','Upper limb',null,{function:'Extends the elbow.',innervation:'Radial nerve.',relationships:'Posterior arm muscle; individual heads are not separated.'});let tm=ell(tri,[s*1.27,6.06,-.16],[.17,.58,.15]);tm.rotation.z=s*.20;
let pec=entry(side+' pectoralis major','muscle','Thorax');ell(pec,[s*.49,6.71,.40],[.46,.29,.16]);
let rect=entry(side+' rectus abdominis','muscle','Abdomen');for(let i=0;i<4;i++)ell(rect,[s*.18,5.96-i*.30,.37],[.16,.15,.10]);
let quad=entry(side+' quadriceps group','muscle','Lower limb',null,{function:'Extends the knee.',relationships:'Grouped representation; four separate heads are not resolved.'});ell(quad,[s*.47,3.42,.18],[.28,.85,.22]);
let calf=entry(side+' gastrocnemius','muscle','Lower limb');ell(calf,[s*.46,1.71,-.18],[.21,.65,.21]);
let glute=entry(side+' gluteus maximus','muscle','Pelvis');ell(glute,[s*.45,4.51,-.35],[.35,.40,.18]);
}
const sac=entry('Sacrum','bone','Pelvis');ell(sac,[0,4.55,-.24],[.23,.36,.12]);
let brain=entry('Brain','central','Brain','brain');for(const s of [-1,1]){ell(brain,[s*.19,8.20,-.015],[.225,.38,.32]);for(let j=0;j<9;j++)tube(brain,[[s*.035,8.01+j*.055,.24],[s*.18,8.02+j*.055,.29],[s*.32,8.03+j*.055,.20]],.014,'#aa7d88');}ell(brain,[0,7.91,-.23],[.25,.14,.18]);
let cord=entry('Spinal cord','central','Spinal cord','cord');tube(cord,[[0,7.98,-.11],[0,7.51,-.25],[0,6.4,-.33],[0,5.48,-.24]],.048);
const cauda=entry('Cauda equina','nerve','Spinal cord',null,{relationships:'Lumbar and sacral nerve roots continuing below the conus medullaris.'});for(let i=-3;i<=3;i++)tube(cauda,[[0,5.52,-.23],[i*.019,5.15,-.23],[i*.045,4.65,-.2]],.010);
for(const s of [-1,1]){let side=s<0?'Right':'Left';let nerves=entry(side+' spinal nerve branches','nerve','Back',null,{relationships:'Selected schematic branches, not a complete root or dermatome map.'});for(let i=0;i<13;i++)tube(nerves,[[0,7.45-i*.20,-.27],[s*.22,7.41-i*.20,-.32],[s*.40,7.33-i*.20,-.30]],.017);
let sci=entry(side+' sciatic nerve','nerve','Lower limb',null,{location:'Posterior pelvis and thigh.',relationships:'Course is schematic; tibial and common fibular divisions are not modeled.'});tube(sci,[[s*.20,4.68,-.24],[s*.52,4.16,-.29],[s*.49,3.30,-.24],[s*.45,2.48,-.2]],.032);
let median=entry(side+' median nerve','nerve','Upper limb');tube(median,[[s*.80,6.83,.05],[s*1.23,6.05,.04],[s*1.44,5.44,.06],[s*1.67,4.44,.07]],.023);
}
let heart=entry('Heart','heart','Thorax','heart');let hm=ell(heart,[.16,6.37,.22],[.31,.43,.27]);hm.rotation.z=-.28;ell(heart,[-.035,6.64,.14],[.18,.17,.18]);ell(heart,[.23,6.68,.09],[.19,.16,.17]);
let aorta=entry('Aorta','vessel','Thorax',null,{function:'Carries blood from the left ventricle into the systemic arterial circulation.',ref:'heart'});tube(aorta,[[.10,6.60,.12],[.08,6.94,.07],[.33,7.05,-.06],[.37,6.73,-.14],[.16,5.9,-.16],[.11,4.85,-.16]],.065,'#b93d48');
let vena=entry('Inferior vena cava','vessel','Abdomen',null,{function:'Returns venous blood from the lower body toward the right atrium.',ref:'heart'});tube(vena,[[-.14,4.85,-.13],[-.16,5.7,-.12],[-.11,6.48,.03]],.070,'#5278a3');
let svc=entry('Superior vena cava','vessel','Thorax',null,{function:'Returns venous blood from the upper body toward the right atrium.',ref:'heart'});tube(svc,[[-.13,7.37,0],[-.20,6.90,.04],[-.11,6.60,.07]],.063,'#5278a3');
for(const s of [-1,1]){let side=s<0?'Right':'Left';let artery=entry(side+' arterial pathways','vessel','Whole body',null,{relationships:'Selected routes only; branching and anastomoses are incomplete.'});tube(artery,[[s*.10,6.95,.08],[s*.28,7.38,.07],[s*.22,7.83,.09]],.035,'#b93d48');tube(artery,[[s*.13,6.96,.06],[s*.98,6.91,.05],[s*1.36,5.8,.05],[s*1.70,4.40,.06]],.03,'#b93d48');tube(artery,[[.1,4.85,-.16],[s*.44,4.35,.12],[s*.41,2.37,.06],[s*.42,.62,.07]],.04,'#b93d48');}
let trachea=entry('Trachea','respiratory','Head & neck',null,{function:'Conducts air toward the main bronchi.'});tube(trachea,[[0,7.6,.15],[0,6.82,.13]],.075,'#9cbab9');for(let i=0;i<8;i++)ell(trachea,[0,7.53-i*.075,.15],[.088,.018,.084],'#aac9c5');
for(const s of [-1,1]){let side=s<0?'Right':'Left';let lung=entry(side+' lung','respiratory','Thorax','lung');let lm=ell(lung,[s*.55,6.43,-.015],[s<0?.35:.30,.67,.32]);lm.rotation.z=s*.09;let bron=entry(side+' main bronchus','respiratory','Thorax');tube(bron,[[0,6.89,.13],[s*.23,6.65,.08],[s*.48,6.44,.01]],.050,'#96b8b4');}
let diaphragm=entry('Diaphragm','respiratory','Thorax',null,{function:'Primary muscle of inspiration.',relationships:'Separates thoracic and abdominal cavities. Modeled as a flattened dome.',innervation:'Phrenic nerves, primarily C3–C5.'});ell(diaphragm,[0,5.83,-.01],[.80,.13,.38],'#b16c76');
let liver=entry('Liver','digestive','Abdomen','liver');let li=ell(liver,[-.34,5.68,.17],[.51,.27,.29],'#ae4036');li.rotation.z=.10;ell(liver,[.10,5.74,.16],[.35,.15,.21],'#ae4036');
let gall=entry('Gallbladder','digestive','Abdomen','gallbladder');ell(gall,[-.34,5.45,.23],[.085,.14,.065],'#6b8c60');
let stomach=entry('Stomach','digestive','Abdomen',null,{location:'Left upper abdomen.',function:'Stores and mixes ingested food.',relationships:'Inferior to the diaphragm and anterior to the pancreas.'});ell(stomach,[.36,5.55,.18],[.28,.32,.22],'#bd7979');tube(stomach,[[.30,5.55,.16],[.33,5.27,.12],[.10,5.23,.13]],.10,'#bd7979');
let esophagus=entry('Esophagus','digestive','Thorax');tube(esophagus,[[0,7.6,-.025],[0,6.8,-.08],[.025,5.94,-.04],[.25,5.71,.10]],.05,'#c89388');
let pancreas=entry('Pancreas','digestive','Abdomen','pancreas');ell(pancreas,[.04,5.39,-.10],[.43,.11,.10],'#c7a271');
let bowel=entry('Small intestine','digestive','Abdomen',null,{function:'Major site of nutrient absorption.',relationships:'Coils are illustrative; duodenum, jejunum, and ileum are not separated.'});let coils=[];for(let i=0;i<55;i++){let t=i/54;coils.push([Math.sin(t*Math.PI*9)*.36,5.25-t*.68,.10+Math.cos(t*Math.PI*9)*.08]);}tube(bowel,coils,.056,'#c99882');
let colon=entry('Large intestine','digestive','Abdomen',null,{function:'Absorbs water and supports fecal formation.',relationships:'Ascending colon on patient right; descending colon on patient left. Haustra and mesenteries are not modeled.'});tube(colon,[[-.48,4.65,.20],[-.53,5.15,.19],[-.47,5.36,.22],[0,5.27,.30],[.49,5.34,.20],[.50,4.81,.17],[.30,4.54,.09],[.05,4.38,-.05]],.085,'#b98171');
let appendix=entry('Vermiform appendix','digestive','Abdomen');tube(appendix,[[-.48,4.66,.19],[-.56,4.50,.16],[-.46,4.43,.13]],.025);
let rectum=entry('Rectum','digestive','Pelvis');tube(rectum,[[.05,4.38,-.05],[0,4.05,-.13]],.07);
for(const s of [-1,1]){let side=s<0?'Right':'Left';let y=s<0?5.35:5.47;let kidney=entry(side+' kidney','urinary','Abdomen','kidney');let km=ell(kidney,[s*.47,y,-.24],[.17,.28,.14]);km.rotation.z=s*-.18;
let ureter=entry(side+' ureter','urinary','Abdomen',null,{function:'Conveys urine from the renal pelvis to the bladder.'});tube(ureter,[[s*.37,y,-.19],[s*.33,4.89,-.16],[s*.16,4.43,.13]],.019,'#d2b177');let adrenal=entry(side+' adrenal gland','endocrine','Abdomen');ell(adrenal,[s*.46,y+.29,-.24],[.13,.08,.09]);}
let bladder=entry('Urinary bladder','urinary','Pelvis',null,{function:'Stores urine.',location:'Anterior pelvic cavity.'});ell(bladder,[0,4.32,.23],[.22,.20,.19],'#c2a477');
let thyroid=entry('Thyroid gland','endocrine','Head & neck','thyroid');for(const s of [-1,1])ell(thyroid,[s*.12,7.36,.205],[.09,.14,.06]);tube(thyroid,[[-.12,7.31,.21],[.12,7.31,.21]],.027);
let pit=entry('Pituitary gland','endocrine','Brain',null,{location:'Base of the brain.',relationships:'Sella turcica and stalk are not resolved.'});ell(pit,[0,7.97,.09],[.055,.045,.05]);
let spleen=entry('Spleen','lymph','Abdomen','spleen');ell(spleen,[.66,5.65,-.07],[.13,.24,.12],'#795968');
for(const s of [-1,1]){let side=s<0?'Right':'Left';for(const [region,p]of [['Head & neck',[s*.20,7.56,0]],['Upper limb',[s*.87,6.66,.07]],['Pelvis',[s*.44,4.47,.18]]]){let node=entry(side+' '+(region==='Head & neck'?'cervical':region==='Upper limb'?'axillary':'inguinal')+' lymph nodes','lymph',region,'node');for(let i=0;i<3;i++)ell(node,[p[0]+s*i*.05,p[1]-i*.05,p[2]],[.04,.05,.035]);}}
let thymus=entry('Thymus','lymph','Thorax',null,{relationships:'Adult remnant illustrated; size changes substantially with age.'});ell(thymus,[0,6.94,.27],[.10,.16,.06]);
let uterus=entry('Uterus','female','Pelvis',null,{function:'Supports implantation and fetal development.',relationships:'Between bladder and rectum; reproductive geometry requires expert validation.'});ell(uterus,[0,4.43,.035],[.18,.19,.105]);tube(uterus,[[0,4.35,.03],[0,4.08,.08]],.065);
for(const s of [-1,1]){let side=s<0?'Right':'Left';let ovary=entry(side+' ovary','female','Pelvis',null,{function:'Produces oocytes and reproductive hormones.'});ell(ovary,[s*.30,4.44,.02],[.075,.09,.05]);let fall=entry(side+' uterine tube','female','Pelvis');tube(fall,[[s*.11,4.53,.04],[s*.26,4.58,.035],[s*.36,4.51,.02],[s*.31,4.43,.02]],.022);let testis=entry(side+' testis','male','Pelvis',null,{function:'Produces sperm and testosterone.'});ell(testis,[s*.12,3.96,.16],[.085,.13,.08]);let duct=entry(side+' ductus deferens','male','Pelvis');tube(duct,[[s*.12,3.99,.12],[s*.26,4.38,.13],[s*.17,4.50,-.025],[s*.08,4.21,.1]],.016);}
let prostate=entry('Prostate','male','Pelvis',null,{location:'Inferior to the bladder.',relationships:'Surrounds the proximal urethra; internal zones are not represented.'});ell(prostate,[0,4.12,.21],[.12,.085,.10]);
// Surface relief belongs to each parent structure for selection, opacity, and sections.
// These decorative contours remain schematic rather than validated anatomical landmarks.
for(const d of structures.filter(d=>d.system==='muscle')){
  for(const m of d.parts.slice()){
    if(m.geometry.type!=='SphereGeometry')continue;
    const [rx,ry,rz]=m.userData.scale;
    for(let i=-3;i<=3;i++){
      const u=i*.19, points=[];
      for(let j=0;j<=12;j++){
        const v=-.82+j*1.64/12;
        const z=rz*Math.sqrt(Math.max(0,1-u*u-v*v));
        const local=new T.Vector3(rx*u,ry*v,z+.006).applyEuler(m.rotation).add(m.position);
        points.push(local.toArray());
      }
      tube(d,points,.007,'#953d44');
    }
  }
}
// Sculpted cerebral ridges on the two hemispheres.
for(const s of [-1,1])for(let i=0;i<10;i++){
  const points=[], latitude=-.9+i*.18;
  for(let j=0;j<=18;j++){
    const angle=.18+j*(Math.PI-.36)/18;
    const y=8.20+.38*Math.sin(latitude), ring=Math.cos(latitude);
    points.push([s*.19+.228*ring*Math.cos(angle),y+.014*Math.sin(j*.9+i),-.015+.326*ring*Math.sin(angle)]);
  }
  tube(brain,points,.012,'#b78c96');
}
// Raised surface contours give the heart and lungs more readable depth.
for(const s of [-1,1])tube(heart,[[.16+s*.08,6.69,.31],[.16+s*.21,6.48,.44],[.16+s*.16,6.22,.41],[.15,6.05,.28]],.014,'#a91c38');
for(const d of structures.filter(d=>d.name.endsWith(' lung'))){
 const m=d.parts[0], [x,y,z]=m.userData.base, [rx,ry,rz]=m.userData.scale;
 for(const level of [-.22,.15]){
  const pts=[];for(let j=0;j<=12;j++){const u=-.78+j*.13,v=level+u*.16;pts.push([x+rx*u,y+ry*v,z+rz*Math.sqrt(Math.max(0,1-u*u-v*v))+.004]);}
  tube(d,pts,.012,'#a5797e');
 }
}
for(const d of structures){const box=new T.Box3();d.parts.forEach(m=>box.expandByObject(m));d.center=box.getCenter(new T.Vector3());}
return {structures,meshes,groups};}
