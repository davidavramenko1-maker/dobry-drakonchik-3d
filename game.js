import * as THREE from 'three';

// ---------- data (same as 2D original) ----------
const STORE = 'dobry-drakonchik-3d-v1';
const NAMES = ['Солнечная поляна','Холмы у речки','Радужный берег','Облачная опушка','Яблоневый сад'];
const HOUSE_COLORS = ['#FFB6C1','#FFD700','#ADD8E6','#FFA07A','#98FB98'];
const PALS = [
  {top:'#6ec8ee',mid:'#e7f7ff',hill:'#8ed36a',grass:'#62b84a',sun:'#ffe56a'},
  {top:'#f2b56a',mid:'#ffe7c4',hill:'#86c864',grass:'#5aaa42',sun:'#ffb03a'},
  {top:'#8ec8f5',mid:'#e4f3ff',hill:'#7dccb0',grass:'#4eae78',sun:'#fff1a8'},
  {top:'#b9d4f5',mid:'#f3f7ff',hill:'#9bce8a',grass:'#6eb85a',sun:'#fff6d0'},
  {top:'#f6c1d4',mid:'#fff0f5',hill:'#8ed07a',grass:'#63b84e',sun:'#ffe08a'}];
const TH = [
  {n:'night',a:['Звёздная','Лунная','Ночная'],top:'#1f2a5a',mid:'#4a5a9a',hill:'#3f7a5a',grass:'#2f6a48',sun:'#f4f1ff'},
  {n:'winter',a:['Снежная','Морозная','Зимняя'],top:'#9fc4e8',mid:'#f2f8ff',hill:'#e6f0f7',grass:'#cfe0ea',sun:'#fff7e6'},
  {n:'autumn',a:['Осенняя','Листопадная','Рыжая'],top:'#9cc3d8',mid:'#fbeee0',hill:'#d0a060',grass:'#b07a3e',sun:'#ffd2a0'},
  {n:'sunset',a:['Закатная','Вечерняя','Розовая'],top:'#7a5aa8',mid:'#ffb3a0',hill:'#6aa86a',grass:'#4e8e52',sun:'#ff9a7a'},
  {n:'spring',a:['Весенняя','Цветочная','Росистая'],top:'#8fd0f0',mid:'#f0fbff',hill:'#9ad88a',grass:'#6cc060',sun:'#fff0d0'},
  {n:'mist',a:['Туманная','Жемчужная','Тихая'],top:'#b8c4d8',mid:'#eef0f6',hill:'#8fb8a0',grass:'#6a9e80',sun:'#ffffff'}];
const NN = ['поляна','опушка','долина','лужайка','роща','горка'];
function rng(seed){let t=seed>>>0;return()=>{t|=0;t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);e=e+Math.imul(e^e>>>7,61|e)^e;return((e^e>>>14)>>>0)/4294967296}}
function shade(hex,d){const n=parseInt(hex.slice(1),16),c=v=>Math.max(0,Math.min(255,v+d));return '#'+[c(n>>16&255),c(n>>8&255),c(n&255)].map(v=>v.toString(16).padStart(2,'0')).join('')}
function meadow(f){
  if(f<=5) return {name:NAMES[f-1],kind:'classic'+(f-1),pal:PALS[f-1]};
  const k=f-6,t=TH[k%TH.length],r=rng(f*7919+3),j=x=>shade(x,Math.round((r()-.5)*28)),c=Math.floor(k/108);
  return {name:t.a[Math.floor(k/6)%3]+' '+NN[Math.floor(k/18)%6]+(c>0?' '+(c+1):''),kind:t.n,pal:{top:j(t.top),mid:j(t.mid),hill:j(t.hill),grass:j(t.grass),sun:t.sun}};
}
function load(){const d={version:1,bestRounds:0,totalGifts:0,muted:false};try{const v=JSON.parse(localStorage.getItem(STORE)||'null');return v&&v.version===1?{...d,...v}:d}catch{return d}}
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({version:1,bestRounds:S.best,totalGifts:S.total,muted:S.muted}))}catch{}};

// ---------- audio (port of p()) ----------
function audio(){let e=null,g=null,muted=false;
  function init(){if(e)return;const A=window.AudioContext||window.webkitAudioContext;if(!A)return;e=new A({latencyHint:'interactive'});g=e.createGain();g.gain.value=muted?0:.22;g.connect(e.destination)}
  function tone(f,d,type,v,to,delay=0){if(!e||!g||muted)return;const t=e.currentTime+delay,o=e.createOscillator(),a=e.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(40,f),t);to&&o.frequency.exponentialRampToValueAtTime(Math.max(40,to),t+d);a.gain.setValueAtTime(1e-4,t);a.gain.exponentialRampToValueAtTime(Math.max(1e-4,v),t+.012);a.gain.exponentialRampToValueAtTime(1e-4,t+d);o.connect(a);a.connect(g);o.start(t);o.stop(t+d+.03)}
  return{unlock(){init();e&&e.state==='suspended'&&e.resume()},setMuted(m){muted=m;e&&g&&g.gain.setTargetAtTime(m?0:.22,e.currentTime,.03)},
    tap(){tone(620,.07,'sine',.07)},toss(){tone(420,.14,'sine',.06,760)},
    deliver(){const k=.94+Math.random()*.12;tone(523*k,.12,'sine',.11);tone(784*k,.2,'triangle',.09,0,.05)},
    win(){[523,659,784,1046].forEach((f,i)=>tone(f,.28,'triangle',.1,0,i*.11))},
    fire(){tone(260,.16,'triangle',.07,640)},poof(){tone(900,.14,'sine',.1,260);tone(1400,.1,'triangle',.06,0,.05);tone(620,.12,'sine',.05,1100,.1)},
    bonk(){tone(330,.2,'sine',.08,170)},catch(){tone(523,.1,'sine',.07,880)}}}
const snd=audio();

// ---------- three setup ----------
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(2,devicePixelRatio||1));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,1,.1,500);
const hemi=new THREE.HemisphereLight(0xffffff,0x5a8a4a,1.0);scene.add(hemi);
const sunLight=new THREE.DirectionalLight(0xffffff,1.6);sunLight.position.set(30,60,20);scene.add(sunLight);
const M=c=>new THREE.MeshLambertMaterial({color:c});
const sphere=new THREE.SphereGeometry(1,20,14), box=new THREE.BoxGeometry(1,1,1), cone=new THREE.ConeGeometry(1,1,16), cyl=new THREE.CylinderGeometry(1,1,1,12);
function mesh(g,c,sx=1,sy=1,sz=1,x=0,y=0,z=0){const m=new THREE.Mesh(g,typeof c==='string'||typeof c==='number'?M(c):c);m.scale.set(sx,sy,sz);m.position.set(x,y,z);return m}
const W=60, D=36; // world half extents

// ---------- dragon ----------
function makeDragon(){
  const g=new THREE.Group(), body=new THREE.Group();g.add(body);
  body.add(mesh(sphere,'#7cdb4a',1.6,1.0,1.1));            // body
  body.add(mesh(sphere,'#eaffc8',1.0,.6,.85,0,-.35,0));     // belly
  body.add(mesh(sphere,'#7cdb4a',1.0,.95,.95,0,.7,1.5));    // head
  body.add(mesh(sphere,'#98ee68',.55,.45,.5,0,.5,2.35));    // snout
  for(const s of[-1,1]){
    body.add(mesh(sphere,'#ffffff',.32,.36,.2,.42*s,1.0,2.25));
    body.add(mesh(sphere,'#1c2a1c',.17,.2,.1,.44*s,1.0,2.42));
    body.add(mesh(sphere,'#ffffff',.06,.06,.04,.38*s,1.08,2.5));
    const horn=mesh(cone,'#ffe08a',.18,.6,.18,.35*s,1.65,1.3);horn.rotation.x=-.4;body.add(horn);
    body.add(mesh(sphere,'#ffa07a',.18,.1,.05,.75*s,.55,2.05));
    body.add(mesh(sphere,'#6ed14a',.32,.22,.4,.6*s,-.85,.4));  // feet
  }
  const spine=mesh(cone,'#3e9a32',.3,.6,.2,0,1.0,0);body.add(spine);
  const tail=mesh(cone,'#62c844',.45,2.6,.45,0,-.1,-2.3);tail.rotation.x=-Math.PI/2-.2;body.add(tail);
  const tip=mesh(cone,'#62c844',.35,.6,.12,0,0,-3.6);tip.rotation.x=-Math.PI/2;body.add(tip);
  const wings=[];
  for(const s of[-1,1]){const piv=new THREE.Group();piv.position.set(.5*s,.6,.1);
    const w=mesh(sphere,'#c8f7a8',1.4,.12,.8,1.3*s,0,0);piv.add(w);body.add(piv);wings.push({piv,s})}
  const gift=makeGift(.9);gift.position.set(0,-1.35,.4);body.add(gift);
  g.userData={body,wings,gift};return g}
function makeGift(s=1){const g=new THREE.Group();
  g.add(mesh(box,'#fffdf8',s,s*.8,s));
  g.add(mesh(box,'#ff7a45',s*.2,s*.82,s*1.02));g.add(mesh(box,'#ff7a45',s*1.02,s*.82,s*.2));
  g.add(mesh(sphere,'#ff7a45',s*.25,s*.15,s*.18,-s*.18,s*.48,0));g.add(mesh(sphere,'#ff7a45',s*.25,s*.15,s*.18,s*.18,s*.48,0));return g}

// ---------- witch ----------
function makeWitch(){const g=new THREE.Group();
  const stick=mesh(cyl,'#8a5a3c',.1,4,.1,0,0,0);stick.rotation.x=Math.PI/2;g.add(stick);
  const br=mesh(cone,'#e8b86a',.55,1.2,.55,0,0,-2.3);br.rotation.x=Math.PI/2;g.add(br);
  g.add(mesh(cone,'#9b7fd4',.7,1.4,.7,0,.6,0));                 // dress
  g.add(mesh(sphere,'#ff9a6a',.5,.55,.45,0,1.5,-.15));            // hair
  g.add(mesh(sphere,'#ffd7b5',.48,.48,.48,0,1.55,.05));           // face
  for(const s of[-1,1]){g.add(mesh(sphere,'#243228',.07,.08,.04,.17*s,1.62,.5));g.add(mesh(sphere,'#ff7a8a',.1,.06,.03,.28*s,1.45,.46))}
  g.add(mesh(cyl,'#7a5ab8',.8,.08,.8,0,1.95,0));                  // brim
  const hat=mesh(cone,'#7a5ab8',.45,1.2,.45,0,2.55,-.1);hat.rotation.x=-.25;g.add(hat);
  g.add(mesh(cyl,'#ffb6c1',.47,.14,.47,0,2.1,0));
  g.add(mesh(sphere,'#5a4590',.18,.12,.3,0,.0,.6));               // shoes
  g.scale.setScalar(1.1);return g}

// ---------- house ----------
function makeHouse(color){const g=new THREE.Group(),c=new THREE.Color(color);
  const wall=M(color);g.add(mesh(box,wall,3.2,3,3.2,0,1.5,0));
  const roof=mesh(new THREE.ConeGeometry(2.7,2,4),shade(color,-48),1,1,1,0,4,0);roof.rotation.y=Math.PI/4;g.add(roof);
  g.add(mesh(box,shade(color,-28),.5,1.2,.5,.8,4.3,.3));
  g.add(mesh(box,'#6b4636',.8,1.4,.1,0,.7,1.61));
  const winM=new THREE.MeshLambertMaterial({color:'#e7f7ff',emissive:'#000000'});
  for(const x of[-.9,.9])g.add(mesh(box,winM,.6,.6,.1,x,2.1,1.61));
  const gift=makeGift(1);gift.position.y=6.2;g.add(gift);
  g.userData={winM,gift};return g}

// ---------- state ----------
const saved=load();
const S={phase:'menu',round:1,score:0,total:saved.totalGifts,best:saved.bestRounds,muted:saved.muted,chased:0,wind:0};
snd.setMuted(S.muted);
let world=new THREE.Group();scene.add(world);
const dragon=makeDragon();scene.add(dragon);
const P=new THREE.Vector3(0,8,24);let yaw=Math.PI, vel=new THREE.Vector3(), flap=0;
let houses=[],tosses=[],witches=[],fireballs=[],particles=[],drops=null,carry=true,fcd=0,waveT=2,waveN=0,clearT=0,allDone=false,weather=null,time=0,hintOn=true;
const keys=new Set();let drag=null,steer={x:0,y:0};

function skyTexture(p){const cv=document.createElement('canvas');cv.width=4;cv.height=256;const x=cv.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,p.top);gr.addColorStop(.62,p.mid);gr.addColorStop(1,p.grass);x.fillStyle=gr;x.fillRect(0,0,4,256);const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;return t}

function buildRound(){
  scene.remove(world);world.traverse(o=>{o.geometry&&o.geometry!==sphere&&o.geometry!==box&&o.geometry!==cone&&o.geometry!==cyl&&o.geometry.dispose()});
  world=new THREE.Group();scene.add(world);
  const md=meadow(S.round),p=md.pal,r=rng(S.round*9973+17);
  scene.background=skyTexture(p);scene.fog=new THREE.Fog(new THREE.Color(p.mid),70,170);
  const night=md.kind==='night';hemi.intensity=night?.55:1.0;sunLight.intensity=night?.5:1.6;
  hemi.groundColor=new THREE.Color(p.grass);
  const ground=mesh(new THREE.PlaneGeometry(400,400),p.grass);ground.rotation.x=-Math.PI/2;world.add(ground);
  for(let i=0;i<9;i++){const h=mesh(sphere,p.hill,14+r()*12,4+r()*5,10+r()*8,(r()-.5)*160,-1,-50-r()*40);world.add(h)}
  for(let i=0;i<6;i++){const h=mesh(sphere,p.hill,10+r()*8,2+r()*3,8,(i%2?-1:1)*(70+r()*20),-1,(r()-.5)*60);world.add(h)}
  const sun=new THREE.Mesh(new THREE.SphereGeometry(7,24,16),new THREE.MeshBasicMaterial({color:p.sun,fog:false}));sun.position.set(60,55,-140);world.add(sun);
  for(let i=0;i<10;i++){const c=new THREE.Group(),m=new THREE.MeshLambertMaterial({color:'#ffffff',emissive:'#cccccc'});
    for(let k=0;k<4;k++)c.add(mesh(sphere,m,3+r()*2,1.8+r(),2.5,k*3-4,r(),r()*2));c.position.set((r()-.5)*180,26+r()*14,(r()-.5)*140-30);c.userData.sp=.6+r()*.8;world.add(c)}
  // flowers
  const fc=['#ff7a45','#ffe08a','#fffdf8','#ffb6c1'];
  for(let i=0;i<70;i++){const x=(r()-.5)*2*W,z=(r()-.5)*2*D;world.add(mesh(cyl,'#2f6b32',.05,.8,.05,x,.4,z));world.add(mesh(sphere,fc[i%4],.22,.22,.22,x,.85,z))}
  // classic decorations
  if(md.kind==='classic1'){const riv=mesh(new THREE.CircleGeometry(1,32),'#78c4e6',22,9,1,0,.05,-14);riv.rotation.x=-Math.PI/2;world.add(riv)}
  if(md.kind==='classic2'){['#ff8f8f','#ffd56a','#fff4b0','#9ee58a','#8fd4ee'].forEach((c,i)=>{const t=new THREE.Mesh(new THREE.TorusGeometry(26-i*1.6,.7,8,48,Math.PI),M(c));t.position.set(10,0,-60);world.add(t)})}
  if(md.kind==='classic4')for(let i=0;i<7;i++){const x=-48+i*16,z=-30+(i%2)*4;world.add(mesh(cyl,'#6b4636',.4,3,.4,x,1.5,z));world.add(mesh(sphere,'#67b84a',2.2,2,2.2,x,4,z));for(let k=0;k<4;k++)world.add(mesh(sphere,'#ff5d5d',.3,.3,.3,x+Math.cos(k*1.6)*1.9,4+Math.sin(k*2)*.8,z+Math.sin(k*1.6)*1.9))}
  // weather particles for procedural meadows
  weather=null;
  if(['night','winter','autumn','spring'].includes(md.kind)){
    const n=md.kind==='night'?400:md.kind==='winter'?700:250,pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){pos[i*3]=(r()-.5)*220;pos[i*3+1]=md.kind==='night'?40+r()*60:r()*50;pos[i*3+2]=(r()-.5)*220}
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const col={night:'#ffffff',winter:'#ffffff',autumn:'#e07a3a',spring:'#ffb6c1'}[md.kind];
    const pts=new THREE.Points(geo,new THREE.PointsMaterial({color:col,size:md.kind==='night'?.9:.6,fog:md.kind!=='night'}));
    world.add(pts);weather={pts,kind:md.kind}}
  if(md.kind==='night'){const moon=sun;moon.scale.setScalar(.8)}
  // houses
  const cols=[...HOUSE_COLORS];if(S.round>1)for(let i=4;i>0;i--){const j=Math.floor(r()*(i+1));[cols[i],cols[j]]=[cols[j],cols[i]]}
  houses=[];
  for(let i=0;i<5;i++){const h=makeHouse(cols[i]);const x=-40+i*20+(S.round>1?(r()-.5)*6:0),z=S.round>1?(r()-.5)*30:-6+(i%2)*6;
    const lift=S.round>1?r()*r()*4:0;h.position.set(x,lift,z);h.rotation.y=(r()-.5)*.6;
    if(lift>.1)world.add(mesh(sphere,p.hill,5,lift+.4,5,x,0,z));
    world.add(h);houses.push({g:h,has:true,happy:false,cheer:0,x,z,top:lift+5.2})}
  tosses=[];witches=[];fireballs=[];drops=null;carry=true;fcd=0;waveT=1.8;waveN=0;clearT=0;allDone=false;S.score=0;
  S.wind=S.round<=1?0:(S.round%2===0?1:-1)*Math.min(78,18+S.round*9);
  P.set(0,8,26);yaw=Math.PI;vel.set(0,0,0);
  ui();}

// ---------- floaters / particles ----------
const floatersEl=document.getElementById('floaters');
function floater(text,pos,color){const el=document.createElement('div');el.className='floater';el.textContent=text;el.style.color=color;floatersEl.appendChild(el);particles.push({el,pos:pos.clone(),life:1.1,max:1.1,vy:2.2})}
const sparkGeo=new THREE.SphereGeometry(.18,6,4);
function sparks(pos,colors,n=16,speed=8){for(let i=0;i<n;i++){const m=new THREE.Mesh(sparkGeo,new THREE.MeshBasicMaterial({color:colors[i%colors.length],transparent:true}));m.position.copy(pos);scene.add(m);
  const v=new THREE.Vector3(Math.random()-.5,Math.random()-.2,Math.random()-.5).normalize().multiplyScalar(speed*(.5+Math.random()));particles.push({m,v,life:.7+Math.random()*.4,max:1.1,grav:true})}}
function puff(pos){for(let i=0;i<6;i++){const m=new THREE.Mesh(sphere,new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.8}));m.scale.setScalar(.6);m.position.copy(pos).add(new THREE.Vector3((Math.random()-.5)*2,(Math.random()-.5)*2,(Math.random()-.5)*2));scene.add(m);particles.push({m,v:new THREE.Vector3(0,1.5,0),life:.7,max:.7,grow:true})}}

// ---------- gameplay ----------
function fwd(){return new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw))}
function fire(){if(S.phase!=='play'||fcd>0)return;fcd=.6;snd.unlock();snd.fire();
  const f=fwd(),m=new THREE.Mesh(new THREE.SphereGeometry(.55,14,10),new THREE.MeshBasicMaterial({color:'#ff7a45'}));
  m.add(new THREE.Mesh(new THREE.SphereGeometry(.32,10,8),new THREE.MeshBasicMaterial({color:'#ffe08a'})));
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.95,14,10),new THREE.MeshBasicMaterial({color:'#ff7a45',transparent:true,opacity:.35}));m.add(glow);
  m.position.copy(P).addScaledVector(f,3).add(new THREE.Vector3(0,.7,0));scene.add(m);let tgt=null,bd=1e9;for(const w of witches){if(w.st===2)continue;const to=w.g.position.clone().add(new THREE.Vector3(0,1,0)).sub(m.position),d=to.length();if(d<55&&to.clone().normalize().dot(f)>.8&&d<bd){bd=d;tgt=w}}
  fireballs.push({m,v:f.multiplyScalar(42),t:0,tgt});hideHint()}
function hideHint(){if(hintOn){hintOn=false;ui()}}
function waveSpeed(){return Math.min(24,6+S.round*1.8)}
function spawnWave(){const n=Math.min(10,S.round-1+Math.floor(waveN/2)),sp=waveSpeed();
  for(let i=0;i<n;i++){const g=makeWitch(),side=Math.random()<.5?-1:1,a=Math.random()*Math.PI*2;
    g.position.set(side*(W+15+i*6),8+Math.random()*10,(Math.random()-.5)*2*D);scene.add(g);
    witches.push({g,v:new THREE.Vector3(-side*sp,0,0),st:0,t:0,ph:Math.random()*6,spin:0})}
  waveN++;waveT=Math.max(2.6,8.5-S.round*.45)}
function deliver(i){const h=houses[i];if(!h||h.happy)return;h.happy=true;h.cheer=.001;S.score++;S.total++;
  h.g.userData.winM.color.set('#ffe08a');h.g.userData.winM.emissive.set('#a07a20');
  const top=new THREE.Vector3(h.x,h.top+1.5,h.z);sparks(top,[h.g.children[0].material.color.getStyle(),'#fffdf8','#ff6b8a'],18,7);floater('спасибо!',top,'#e25a28');snd.deliver();
  if(S.score>=5)allDone=true;save();ui()}

function update(dt){
  time+=dt;
  // clouds drift + weather
  world.children.forEach(o=>{if(o.userData.sp){o.position.x+=o.userData.sp*dt;if(o.position.x>110)o.position.x=-110}});
  if(weather&&weather.kind!=='night'){const a=weather.pts.geometry.attributes.position;const sp=weather.kind==='winter'?3:2;
    for(let i=0;i<a.count;i++){let y=a.getY(i)-sp*dt;if(y<0)y=50;a.setY(i,y);a.setX(i,a.getX(i)+Math.sin(time+i)*dt*.6)}a.needsUpdate=true}
  if(weather&&weather.kind==='night')weather.pts.material.size=.8+Math.sin(time*2)*.15;
  // particles
  for(const p of particles){p.life-=dt;
    if(p.el){p.pos.y+=p.vy*dt;const v=p.pos.clone().project(camera);p.el.style.left=((v.x+1)/2*innerWidth)+'px';p.el.style.top=((1-v.y)/2*innerHeight)+'px';p.el.style.opacity=Math.max(0,p.life/p.max)}
    else{p.grav&&(p.v.y-=14*dt);p.m.position.addScaledVector(p.v,dt);p.m.material.opacity=Math.max(0,p.life/p.max);p.grow&&p.m.scale.multiplyScalar(1+dt*1.5)}}
  particles=particles.filter(p=>{if(p.life>0)return true;p.el?p.el.remove():(scene.remove(p.m),p.m.material.dispose());return false});
  // houses
  for(const h of houses){const gift=h.g.userData.gift;gift.visible=h.has;gift.position.y=6.2+Math.sin(time*3+h.x)*.25;gift.rotation.y+=dt;
    if(h.happy){h.cheer=Math.min(1,h.cheer+dt*1.8);h.g.position.y=(h.top-5.2)+Math.sin(h.cheer*Math.PI)*.6}}
  // tosses
  for(const t of tosses){t.t+=dt;const k=Math.min(1,t.t/.5),e=k*k*(3-2*k);t.m.position.lerpVectors(t.a,t.b,e);t.m.position.y+=Math.sin(k*Math.PI)*3;
    if(k>=1&&!t.done){t.done=true;scene.remove(t.m);deliver(t.i)}}
  tosses=tosses.filter(t=>!t.done);
  if(S.phase==='menu'){P.set(Math.sin(time*.4)*14,9+Math.sin(time*.9)*.6,10);yaw=Math.cos(time*.4)>0?Math.PI/2:-Math.PI/2;flap+=dt*8}
  if(S.phase==='play')play(dt);
  // dragon visuals
  dragon.position.copy(P);dragon.position.y+=Math.sin(time*2.7)*.25;dragon.rotation.y=yaw;
  const ud=dragon.userData;for(const w of ud.wings)w.piv.rotation.z=w.s*Math.sin(flap)*.6;ud.gift.visible=carry&&S.score<5&&S.phase!=='clear';
  ud.body.rotation.z=THREE.MathUtils.lerp(ud.body.rotation.z,-steerTurn*.35,.1);
  // camera follow
  const f=fwd(),camTarget=P.clone().addScaledVector(f,-15).add(new THREE.Vector3(0,6.5,0));
  camTarget.y=Math.max(2,camTarget.y);
  camera.position.lerp(camTarget,1-Math.exp(-4*dt));
  camera.lookAt(P.x+f.x*4,P.y+1.5,P.z+f.z*4);
}
let steerTurn=0;
function play(dt){
  // controls
  let turn=0,thr=0,up=0;
  if(keys.has('ArrowLeft')||keys.has('KeyA'))turn+=1;if(keys.has('ArrowRight')||keys.has('KeyD'))turn-=1;
  if(keys.has('ArrowUp')||keys.has('KeyW'))thr+=1;if(keys.has('ArrowDown')||keys.has('KeyS'))thr-=1;
  if(keys.has('KeyE')||keys.has('PageUp')||keys.has('ShiftLeft'))up+=1;if(keys.has('KeyQ')||keys.has('PageDown')||keys.has('ControlLeft'))up-=1;
  if(drag){turn+=-steer.x;thr+=-steer.y*1.2;up+=0}
  turn=Math.max(-1,Math.min(1,turn));thr=Math.max(-.6,Math.min(1.2,thr));
  if(turn||thr||up)hideHint();
  steerTurn=turn;yaw+=turn*2.2*dt;
  const f=fwd(),speed=thr*18;
  const target=f.clone().multiplyScalar(speed);target.y=up*9;
  vel.lerp(target,1-Math.exp(-4*dt));
  P.addScaledVector(vel,dt);P.x+=S.wind/12*dt;
  P.x=Math.max(-W-10,Math.min(W+10,P.x));P.z=Math.max(-D-14,Math.min(D+14,P.z));P.y=Math.max(2.2,Math.min(26,P.y));
  flap+=dt*(7+Math.abs(thr)*8);
  // auto delivery
  if(carry&&!tosses.length&&S.score<5){let best=-1,bd=36;for(let i=0;i<5;i++){const h=houses[i];if(!h.has)continue;const dx=P.x-h.x,dz=P.z-h.z,d=dx*dx+dz*dz;if(d<bd&&P.y<h.top+9){bd=d;best=i}}
    if(best>=0){const h=houses[best];h.has=false;const m=makeGift(.9);scene.add(m);tosses.push({m,a:P.clone().add(new THREE.Vector3(0,-1.2,0)),b:new THREE.Vector3(h.x,h.top+1.0,h.z),t:0,i:best});snd.toss();hideHint()}}
  // dropped gift
  if(drops){drops.v.y-=16*dt;drops.m.position.addScaledVector(drops.v,dt);if(drops.m.position.y<.5){drops.m.position.y=.5;drops.v.set(0,0,0)}
    drops.m.rotation.y+=dt*2;drops.ring.position.set(drops.m.position.x,.08,drops.m.position.z);drops.ring.material.opacity=.4+.3*Math.sin(time*6);
    const dx=P.x-drops.m.position.x,dz=P.z-drops.m.position.z;if(dx*dx+dz*dz<9&&P.y<drops.m.position.y+5){carry=true;floater('поймал!',drops.m.position,'#2f6b32');snd.catch();scene.remove(drops.m,drops.ring);drops=null;ui()}}
  // witches
  if(S.round>=2&&!allDone){waveT-=dt;if(waveT<=0)spawnWave()}
  const sp=waveSpeed();
  for(const w of witches){w.t+=dt;const g=w.g;
    if(w.st===0){const to=P.clone().sub(g.position),d=to.length()||1;to.multiplyScalar(sp/d);to.y*=.7;w.v.lerp(to,1-Math.exp(-1.3*dt));
      if(w.t>8)w.st=1;
      if(d<2.4){if(carry&&S.score<5){carry=false;const m=makeGift(1);m.position.copy(P);scene.add(m);
          const ring=new THREE.Mesh(new THREE.RingGeometry(1.2,1.8,24),new THREE.MeshBasicMaterial({color:'#fffdf8',transparent:true,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;scene.add(ring);
          drops={m,ring,v:new THREE.Vector3(w.v.x*.3,4,w.v.z*.3)};snd.bonk();floater('ой, подарок!',P.clone().add(new THREE.Vector3(0,2.5,0)),'#7a5ab8');ui()}
        w.st=1}}
    else if(w.st===1){const away=new THREE.Vector3(Math.sign(g.position.x||1)*sp*1.4,4,0);w.v.lerp(away,1-Math.exp(-2*dt))}
    else{w.v.y-=12*dt;w.spin+=dt*10;g.rotation.z=w.spin}
    g.position.addScaledVector(w.v,dt);
    if(w.st!==2){g.rotation.y=Math.atan2(w.v.x,w.v.z);g.position.y+=Math.sin(time*4+w.ph)*.02}}
  witches=witches.filter(w=>{const p=w.g.position,ok=w.st===0||(Math.abs(p.x)<W+40&&Math.abs(p.z)<D+60&&p.y>-5&&p.y<70);if(!ok)scene.remove(w.g);return ok});
  // fireballs
  fcd=Math.max(0,fcd-dt);
  for(const b of fireballs){b.t+=dt;if(b.tgt&&b.tgt.st!==2){const to=b.tgt.g.position.clone().add(new THREE.Vector3(0,1,0)).sub(b.m.position).normalize().multiplyScalar(42);b.v.lerp(to,1-Math.exp(-6*dt))}b.m.position.addScaledVector(b.v,dt);b.m.scale.setScalar(1+Math.sin(time*30)*.1);
    if(Math.random()<.6)sparks(b.m.position,['#ff7a45','#ffe08a'],1,1.5);
    for(const w of witches){if(w.st===2)continue;const c=w.g.position.clone().add(new THREE.Vector3(0,1,0));if(c.distanceTo(b.m.position)<2.6){
      w.st=2;w.v.copy(b.v).normalize().multiplyScalar(14);w.v.y=12;b.t=9;S.chased++;snd.poof();
      sparks(c,['#ff7a45','#ffe08a','#fffdf8','#c9b4f0'],18,9);puff(c);floater('пуф!',c,'#e25a28');ui();break}}}
  fireballs=fireballs.filter(b=>{if(b.t<1.4)return true;scene.remove(b.m);return false});
  if(allDone&&!tosses.length){clearT+=dt;if(clearT>.8){S.phase='clear';allDone=false;if(S.round>S.best)S.best=S.round;save();snd.win();
    for(const w of witches)w.st=1;
    sparks(P.clone().add(new THREE.Vector3(0,4,0)),HOUSE_COLORS,40,12);ui()}}
}

// ---------- UI ----------
const $=id=>document.getElementById(id);
function plural(n){const t=n%10,h=n%100;return t===1&&h!==11?'поляна':t>=2&&t<=4&&(h<12||h>14)?'поляны':'полян'}
function ui(){const ph=S.phase,md=meadow(S.round);
  $('menu').hidden=ph!=='menu';$('pause').hidden=ph!=='pause';$('clear').hidden=ph!=='clear';
  $('hud').hidden=ph==='menu';$('catcher').hidden=ph!=='play';$('fireBtn').hidden=ph!=='play';$('hint').hidden=!(ph==='play'&&hintOn);
  $('score').textContent=`${S.score} / 5`;$('chased').textContent=S.chased;$('chasedPill').hidden=S.round<2&&S.chased===0;
  $('meadow').textContent=`${S.round}. ${md.name}`;
  $('wind').hidden=!S.wind;$('wind').textContent=S.wind>0?'Ветерок →':'← Ветерок';
  $('carry').hidden=carry||ph!=='play';
  $('muteBtn').textContent=S.muted?'🔇':'🔊';$('muteBtn2').textContent=S.muted?'Звук выключен':'Звук включён';
  $('stats').hidden=!S.total;$('stats').textContent=`Подарено ${S.total} · рекорд ${S.best} ${plural(S.best)}`;
  $('clearStats').textContent=$('stats').textContent;$('clearMeadow').textContent=md.name;
  $('pauseText').textContent=`Доставлено ${S.score} из 5. Можно продолжить, когда будете готовы.`}
function clearActors(){for(const w of witches)scene.remove(w.g);for(const b of fireballs)scene.remove(b.m);if(drops)scene.remove(drops.m,drops.ring);for(const t of tosses)scene.remove(t.m)}
const startRound=()=>{clearActors();buildRound();S.phase='play';ui()};
$('startBtn').onclick=()=>{snd.unlock();snd.tap();S.round=Math.max(1,parseInt(new URLSearchParams(location.search).get('round'))||1);S.chased=0;hintOn=true;startRound()};
$('nextBtn').onclick=()=>{snd.tap();S.round++;hintOn=false;startRound()};
$('restartBtn').onclick=()=>{snd.tap();startRound()};
const toMenu=()=>{snd.tap();clearActors();S.round=1;buildRound();S.phase='menu';ui()};
$('menuBtn').onclick=toMenu;$('menuBtn2').onclick=toMenu;
$('pauseBtn').onclick=()=>{if(S.phase==='play'){S.phase='pause';ui()}};
$('resumeBtn').onclick=()=>{S.phase='play';ui()};
const toggleMute=()=>{S.muted=!S.muted;snd.setMuted(S.muted);if(!S.muted){snd.unlock();snd.tap()}save();ui()};
$('muteBtn').onclick=toggleMute;$('muteBtn2').onclick=toggleMute;
$('fireBtn').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();fire()});
addEventListener('keydown',e=>{if(S.phase==='play'&&(e.key.startsWith('Arrow')||e.code==='Space'))e.preventDefault();if(e.repeat)return;keys.add(e.code);
  if(e.code==='Space')fire();if(e.code==='Escape'||e.code==='KeyP'){if(S.phase==='play'){S.phase='pause';ui()}else if(S.phase==='pause'){S.phase='play';ui()}}});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>keys.clear());
const catcher=$('catcher');let lastTap=0;
catcher.addEventListener('pointerdown',e=>{catcher.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};steer={x:0,y:-.6};snd.unlock();
  const n=performance.now();if(n-lastTap<320){fire();lastTap=0}else lastTap=n});
catcher.addEventListener('pointermove',e=>{if(!drag)return;const s=Math.min(innerWidth,innerHeight)*.25;steer={x:Math.max(-1,Math.min(1,(e.clientX-drag.x)/s)),y:Math.max(-1,Math.min(1,(e.clientY-drag.y)/s-.6))}});
const endDrag=()=>{drag=null;steer={x:0,y:0}};catcher.addEventListener('pointerup',endDrag);catcher.addEventListener('pointercancel',endDrag);
document.querySelector('.game-root').addEventListener('contextmenu',e=>e.preventDefault());

function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<h?72:60;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
buildRound();camera.position.set(0,14,40);
let last=performance.now();
function loop(n){const dt=Math.min(.05,(n-last)/1000);last=n;if(S.phase!=='pause')update(dt);renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);
window.__drakon={S,get witches(){return witches.length},get fireballs(){return fireballs.length},fire,P};
