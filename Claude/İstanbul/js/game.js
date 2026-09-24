'use strict';
// ================= oyuncu & kamera =================
const P={x:125,y:0,z:200,vy:0,yaw:Math.PI,pitch:-.12,face:Math.PI,ground:true,ph:0,moving:false};
const CAM={fp:false,dist:4.8,fov:60,zoom:60,photo:false};
const KEY={};let VP=null,SW=1,SH=1,M={},lastT=0,hudT=0,thrown=[],tipT=0,lblPool=[],lockWanted=false;
const TSCALE=12; // 1 gerçek sn = 12 oyun sn

function insideCol(x,y,z){const S=COL.S,L=COL.g.get(Math.floor(x/S)*100003+Math.floor(z/S));if(!L)return false;
  for(const o of L){if(y<o.y0||y>o.y1)continue;if(o.when&&!o.when())continue;
    if(o.t===1){if(Math.hypot(x-o.x,z-o.z)<o.r)return true;}else{const dx=x-o.x,dz=z-o.z,lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;if(Math.abs(lx)<o.hw&&Math.abs(lz)<o.hd)return true;}}return false;}

// ================= ortam (gün döngüsü) =================
const SKYK=[{e:-.35,top:[.01,.015,.045],hor:[.03,.045,.09],sun:[.1,.12,.2],sky:[.06,.07,.12],gnd:[.03,.03,.05]},
 {e:-.06,top:[.05,.06,.16],hor:[.3,.2,.28],sun:[.18,.16,.24],sky:[.12,.12,.2],gnd:[.06,.05,.06]},
 {e:.06,top:[.25,.3,.55],hor:[1,.55,.3],sun:[1,.58,.32],sky:[.36,.33,.4],gnd:[.22,.17,.14]},
 {e:.3,top:[.28,.5,.85],hor:[.74,.83,.92],sun:[1,.93,.82],sky:[.45,.5,.6],gnd:[.28,.25,.2]},
 {e:1,top:[.22,.45,.85],hor:[.72,.83,.95],sun:[1.05,1,.92],sky:[.48,.53,.62],gnd:[.3,.27,.22]}];
function envAt(h,t){const a=(h-6.5)/13*Math.PI,el=Math.sin(a);let s=[Math.cos(a),el*.95,.35];const l=Math.hypot(...s);s=s.map(v=>v/l);
  let i=0;while(i<SKYK.length-2&&el>SKYK[i+1].e)i++;const A=SKYK[i],B=SKYK[i+1],k=clamp((el-A.e)/(B.e-A.e),0,1);const m=f=>mixC(A[f],B[f],k);
  const night=smooth(.05,-.12,el);const light=el>-.02?s:s.map(v=>-v);
  const e={sun:s,light,top:m('top'),hor:m('hor'),sunCol:m('sun'),skyAmb:m('sky'),gndAmb:m('gnd'),night,fogD:1/1500,time:t};
  if(G.mode==='cistern')Object.assign(e,{light:[0,1,0],sunCol:[.08,.06,.04],skyAmb:[.42,.32,.22],gndAmb:[.26,.2,.14],hor:[.05,.04,.03],top:[0,0,0],night:1,fogD:1/90});
  return e;}

// ================= oyun nesnesi =================
const Game={
 async init(){const cv=$('c');const gl=GL.init(cv);this.gl=gl;const step=async(t,f)=>{$('load').textContent=t;await new Promise(r=>setTimeout(r,30));f();};
  let lm,L;
  await step('Arazi ve denizler oluşturuluyor…',()=>{M.terrain=GL.upload(buildTerrain());});
  await step('Sokaklar döşeniyor…',()=>{M.roads=GL.upload(buildRoads());});
  await step('Tarihi Yarımada inşa ediliyor…',()=>{lm=new MB();L=new MB();buildLandmarks1(lm);});
  await step('Galata, Boğaz ve Üsküdar…',()=>{buildLandmarks2(lm,L);M.lm=GL.upload(lm);M.lights=GL.upload(L);lm=null;});
  await step('Mahalleler kuruluyor…',()=>{const cm=new MB();buildCity(cm);M.city=GL.upload(cm);});
  await step('Kediler, martılar ve vapurlar…',()=>{ENT.init();ACT.init();
    const cb=new MB();personBody(cb,{skin:SKIN[0],shirt:[.62,.1,.14],pants:[.85,.68,.2],hat:'fes'});cb.box(0,.2,0,.5,1.35,.32,[.62,.1,.14]);cb.box(0,.9,.17,.08,.6,.02,C.gold,.3);M.costume=GL.upload(cb);});
  await step('Harita çiziliyor…',()=>this.bakeMap());
  if(!this.dbg)P.y=groundY(P.x,P.z);$('load').textContent='';const go=$('go');go.disabled=false;go.textContent='Gezmeye başla';
  go.onclick=()=>{$('start').classList.add('hidden');$('hud').classList.remove('hidden');AUD.init();cv.requestPointerLock();
    setTimeout(()=>UI.dialog({title:'Hoş geldin, İstanbul\'a!',sub:'Gün 1 · Sultanahmet Meydanı',body:'<p>Karşında Ayasofya, arkanda Sultanahmet Camii. Cebinde <b>2.500 ₺</b> ve <b>200 €</b> var.</p><p>Görevlerin sağ üstte, tam liste <span class="k">J</span> tuşunda. Önce Ayasofya\'yı gezmeye ne dersin? Kapıda ayakkabılarını çıkarmayı unutma!</p>',buttons:[{t:'Hadi başlayalım!',pri:1,fn:()=>cv.requestPointerLock()}]}),400);};
  const hs=location.hash.slice(1).split(',').map(Number);if(hs.length>=2&&!isNaN(hs[0])){P.x=hs[0];P.z=hs[1];P.yaw=P.face=(hs[2]||0)*Math.PI/180;if(hs[3])G.time=hs[3];P.y=groundY(P.x,P.z);if(hs[4])P.pitch=hs[4]*Math.PI/180;Game.alt=hs[5]||0;if(hs[6])G.shoesOff=true;Game.dbg=hs[7]||0;
  if(this.dbg===1){G.mode='cistern';this.teleport(CIS.x-30,CIS.y-.3,CIS.z+2.4,Math.PI/2);}
  if(this.dbg===2){G.mode='galata';this.teleport(GALATA.x,GALATA.top,GALATA.z-10,Math.PI);}
  if(this.dbg===3){ENT.lines[0].wait=0;G.mode='ferry';G.ride=ENT.lines[0];G.lx=0;G.lz=-8;G.lastRy=ENT.lines[0].ry;}

    $('start').classList.add('hidden');$('hud').classList.remove('hidden');}
  this.bind(cv);addEventListener('resize',()=>this.resize());this.resize();requestAnimationFrame(t=>this.loop(t));},
 resize(){const d=Math.min(devicePixelRatio||1,1.5);const cv=$('c');SW=innerWidth;SH=innerHeight;cv.width=SW*d;cv.height=SH*d;},
 bind(cv){
  addEventListener('keydown',e=>{if(e.repeat&&e.code!=='KeyN')return;KEY[e.code]=true;if(!$('start').classList.contains('hidden'))return;
    if(e.code==='Escape'){if(!$('mapv').classList.contains('hidden'))this.map(false);else if(!$('journal').classList.contains('hidden')){$('journal').classList.add('hidden');G.ui=false;}else if(G.ui)UI.close();else if(CAM.photo)this.photoMode(false);return;}
    if(e.code==='KeyM'){this.map($('mapv').classList.contains('hidden'));return;}
    if(e.code==='KeyJ'){if($('journal').classList.contains('hidden'))journal();else{$('journal').classList.add('hidden');G.ui=false;}return;}
    if(G.ui)return;
    if(e.code==='KeyE')this.interact();
    if(e.code==='KeyC')this.photoMode(!CAM.photo);
    if(e.code==='KeyF'&&CAM.photo)this.shoot();
    if(e.code==='KeyV'){CAM.fp=!CAM.fp;UI.toast(CAM.fp?'Birinci şahıs kamera':'Üçüncü şahıs kamera');}
    if(e.code==='KeyG')this.throwSimit();
    if(e.code==='KeyN'){addTime(1);UI.toast('Saat ileri alındı: '+this.clock());}
    if(e.code==='KeyB'){AUD.music=!AUD.music;UI.toast(AUD.music?'Müzik açık ♪':'Müzik kapalı');}});
  addEventListener('keyup',e=>{KEY[e.code]=false;});
  cv.addEventListener('mousedown',e=>{if(G.ui)return;if(document.pointerLockElement!==cv){cv.requestPointerLock();return;}if(CAM.photo&&e.button===0)this.shoot();});
  addEventListener('mousemove',e=>{if(document.pointerLockElement!==cv)return;const s=.0023*(CAM.photo?CAM.zoom/60:1);P.yaw-=e.movementX*s;P.pitch=clamp(P.pitch-e.movementY*s,-1.3,1.3);});
  addEventListener('wheel',e=>{if(CAM.photo)CAM.zoom=clamp(CAM.zoom+Math.sign(e.deltaY)*4,12,75);else CAM.dist=clamp(CAM.dist+Math.sign(e.deltaY)*.6,2,14);});
  $('bigmap').addEventListener('click',e=>{const r=e.target.getBoundingClientRect();const u=(e.clientX-r.left)/r.width,v=(e.clientY-r.top)/r.height;
    const x=this.mapX0+u*this.mapS,z=this.mapZ0+v*this.mapS;const near=Object.values(LM).map(l=>[l,Math.hypot(l.x-x,l.z-z)]).sort((a,b)=>a[1]-b[1])[0];
    this.taxi(near[1]<60?near[0].x:x,near[1]<60?near[0].z:z,near[1]<60?near[0].n:districtAt(x,z));});},
 clock(){const h=Math.floor(G.time),m=Math.floor((G.time-h)*60);return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');},
 project(x,y,z){if(!VP)return null;const c=Mat.xform(VP,x,y,z);if(c[3]<=.1)return null;const nx=c[0]/c[3],ny=c[1]/c[3];if(Math.abs(nx)>1.2||Math.abs(ny)>1.2)return null;return[(nx*.5+.5)*SW,(1-(ny*.5+.5))*SH,c[3]];},
 fade(fn,ms=700){const f=$('fade');f.style.opacity=1;setTimeout(()=>{fn&&fn();setTimeout(()=>f.style.opacity=0,120);},ms);},
 teleport(x,y,z,yaw){P.x=x;P.y=y;P.z=z;P.vy=0;if(yaw!==undefined)P.yaw=P.face=yaw;},

 // ---------- etkileşimler ----------
 dynamicInteract(p){
  if(G.mode==='ferry'){const l=G.ride;if(l.wait>0&&l.at)return{l:'Vapurdan in — '+PIERS[l.at].n,fn:()=>this.leave(),pri:1};return null;}
  if(G.mode==='tram'){const t=ENT.tram;if(t.wait>0)return{l:'Tramvaydan in — '+t.at,fn:()=>this.leave(),pri:1};return null;}
  if(G.mode==='galata')return{l:'Kuleden aşağı in',fn:()=>this.fade(()=>{G.mode='walk';this.teleport(GALATA.x,groundY(GALATA.x,GALATA.z+12),GALATA.z+12,0);})};
  for(const l of ENT.lines){if(l.wait<=0||!l.at||p.y<1)continue;const d=Math.hypot(p.x-l.x,p.z-l.z);if(d<(l.small?9:25)){
    const to=l.id==='C'?'Boğaz Turu (Rumeli Hisarı\'na kadar)':(l.at===l.a?PIERS[l.b].n:PIERS[l.a].n);const card=l.id==='A'||l.id==='B';
    return{l:(l.small?'Tekneye bin → ':'Vapura bin → ')+to+' ('+fmt(l.fare)+(card?' · kart':'')+')',fn:()=>this.board(l,card),pri:1};}}
  const t=ENT.tram;if(t.wait>0&&Math.hypot(p.x-t.x,p.z-t.z)<7)return{l:'Nostaljik tramvaya bin → '+(t.at==='Tünel'?'Taksim':'Tünel')+' (27 ₺ · kart)',fn:()=>this.boardTram(),pri:1};
  let bc=null,bd=2.4;for(const c of ENT.cats){const d=Math.hypot(p.x-c.x,p.z-c.z);if(d<bd){bd=d;bc=c;}}
  if(bc)return{l:'Kediyi sev 🐈',fn:()=>{const c=bc;c.st='sit';c.t=8;c.happy=3;AUD.meow();setTimeout(()=>AUD.purr(),600);const y=groundY(c.x,c.z)+.6;
    for(let i=0;i<3;i++)setTimeout(()=>UI.float(['❤','💕','😻'][i],c.x,y,c.z),i*250);if(!c.pet){c.pet=true;prog('kedi');}else UI.toast('Mırr mırr… 🐈');}};
  return null;},
 interact(){const a=ACT.scan(P);if(a)a.fn();},
 board(l,card){if(!pay(l.fare,card))return;G.mode='ferry';G.ride=l;G.lx=0;G.lz=l.small?1:-8;G.lastRy=l.ry;G.fromPier=l.at;if(l.id==='C')G.tour=true;
  UI.toast(l.small?'Tekneye bindin. Kız Kulesi\'ne doğru…':'Vapura bindin! Üst güverte açık hava. Martılar için G. 🐦');},
 boardTram(){if(!pay(27,true))return;G.mode='tram';G.ride=ENT.tram;G.lastRy=ENT.tram.ry;UI.toast('Arka basamağa tutundun! Tramvay zili: çın çın 🔔');},
 leave(){if(G.mode==='ferry'){const l=G.ride,pr=PIERS[l.at];G.mode='walk';G.ride=null;
    if(l.at==='kizkulesi'){this.teleport(566,1.25,52);}else{const dx=pr.x-l.x,dz=pr.z-l.z,d=Math.hypot(dx,dz)||1;this.teleport(l.x+dx/d*Math.min(d,14),1.8,l.z+dz/d*Math.min(d,14));}
    if((l.at==='uskudar'||l.at==='kadikoy'))done('ferry');if(l.at==='kizkulesi')UI.toast('Kız Kulesi\'ndesin! Bilgi için E.');UI.toast(pr.n+' iskelesi');}
  else if(G.mode==='tram'){const t=ENT.tram;G.mode='walk';G.ride=null;const a=t.ry+Math.PI/2;this.teleport(t.x+Math.sin(a)*3,groundY(t.x,t.z),t.z+Math.cos(a)*3);}},
 galataUp(){this.fade(()=>{G.mode='galata';this.teleport(GALATA.x,GALATA.top,GALATA.z+10,0);done('galata');setTimeout(()=>info('galata'),800);});},
 cisternIn(){this.fade(()=>{G.mode='cistern';this.teleport(CIS.x-30,CIS.y-.3,CIS.z+2.4,Math.PI/2);UI.toast('Serin ve loş… Damlaların sesi yankılanıyor. 💧');setTimeout(()=>info('yerebatan'),900);});},
 cisternOut(){this.fade(()=>{G.mode='walk';this.teleport(72,groundY(72,135),135,-Math.PI/2);});},
 sit(s,cb){this.fade(()=>{cb();},900);},
 taxi(x,z,name){if(G.mode!=='walk'){UI.toast('Önce bulunduğun yerden in/çık.','bad');return;}const d=Math.hypot(x-P.x,z-P.z);if(d<30){UI.toast('Zaten buradasın!');return;}
  const fare=Math.round((120+d*1.1)/10)*10;this.map(false);
  UI.dialog({title:'🚕 Taksi',sub:'Hedef: '+name,body:`<p>Mesafe yaklaşık <b>${(d*4/1000).toFixed(1)} km</b>. Taksimetre ile tahmini ücret <b>${fmt(fare)}</b>.</p><p style="color:var(--mut);font-size:12px">"Abi köprü trafiği var, sahilden gidelim mi?"</p>`,
   buttons:[{t:'Bin, gidelim',pri:1,fn:()=>{if(!pay(fare))return;this.fade(()=>{const ri=roadInfo(x,z),s=ri.seg;let tx=x,tz=z;
      if(s&&ri.d<200){const dx=s.bx-s.ax,dz=s.bz-s.az,l2=dx*dx+dz*dz,t=clamp(((x-s.ax)*dx+(z-s.az)*dz)/l2,0,1);const px=s.ax+dx*t,pz=s.az+dz*t,off=s.w/2+1.5;const n=Math.hypot(dx,dz);tx=px+dz/n*off;tz=pz-dx/n*off;
        if(groundY(tx,tz)<.5){tx=px-dz/n*off;tz=pz+dx/n*off;}}
      const p={x:tx,y:groundY(tx,tz),z:tz};COL.resolve(p,.5);this.teleport(p.x,groundY(p.x,p.z),p.z,Math.atan2(x-p.x,z-p.z));addTime(d/3000+.1);UI.toast(name+' — iyi gezmeler!');},1000);}},{t:'Vazgeç'}]});},

 // ---------- simit & fotoğraf ----------
 throwSimit(){if(G.inv.simit<=0){UI.toast('Çantanda simit yok. Simitçiden "Çantaya koy" ile al.','bad');return;}G.inv.simit--;
  const cp=Math.cos(P.pitch),f=[Math.sin(P.yaw)*cp,Math.sin(P.pitch),Math.cos(P.yaw)*cp];
  const T={x:P.x+f[0],y:P.y+1.6,z:P.z+f[2],vx:f[0]*11+(G.ride?G.ride.vx||0:0),vy:f[1]*11+5,vz:f[2]*11+(G.ride?G.ride.vz||0:0),done:false,life:6,ferry:G.mode==='ferry'};
  thrown.push(T);const n=ENT.feed(T);UI.toast(n?'Simit havada! Martılar geliyor… 🐦':'Simidi fırlattın.');},
 photoMode(on){CAM.photo=on;CAM.zoom=60;$('photoFrame').classList.toggle('hidden',!on);$('cross').classList.toggle('hidden',!on);},
 shoot(){AUD.shutter();const fl=$('flash');fl.style.transition='none';fl.style.opacity=.85;requestAnimationFrame(()=>requestAnimationFrame(()=>{fl.style.transition='opacity .5s';fl.style.opacity=0;}));
  let best=null,bs=1e9;for(const k in LM){const l=LM[k];const y=groundY(l.x,l.z)+(k==='kizkulesi'?1:0)+l.ph*.6;const s=this.project(l.x,y,l.z);if(!s)continue;
    const d=Math.hypot(l.x-P.x,l.z-P.z);if(d>1100)continue;const cx=Math.abs(s[0]/SW-.5),cy=Math.abs(s[1]/SH-.5);if(cx>.38||cy>.4)continue;const sc=cx+cy+d/3000;if(sc<bs){bs=sc;best=[k,l.n];}}
  let extra=null;for(const c of ENT.cats){const s=this.project(c.x,groundY(c.x,c.z)+.3,c.z);if(s&&Math.hypot(c.x-P.x,c.z-P.z)<8&&Math.abs(s[0]/SW-.5)<.3&&Math.abs(s[1]/SH-.5)<.3){extra=['kedi','Sokak kedisi 🐈'];break;}}
  for(const g of ENT.gulls){const s=this.project(g.x,g.y,g.z);if(s&&Math.hypot(g.x-P.x,g.z-P.z)<14&&Math.abs(s[0]/SW-.5)<.3&&Math.abs(s[1]/SH-.5)<.3){extra=extra||['marti','Martı 🐦'];break;}}
  const pick=extra&&(!best||bs>.25)?extra:best||extra;const n=pick?pick[1]:districtAt(P.x,P.z)+' manzarası';
  this.snap(n);if(pick&&!G.fotoSet[pick[0]]){G.fotoSet[pick[0]]=1;if(LM[pick[0]])prog('foto');}UI.toast('📷 '+n);},
 snap(n){const c=document.createElement('canvas');c.width=320;c.height=Math.round(320*SH/SW);c.getContext('2d').drawImage($('c'),0,0,c.width,c.height);
  G.photos.push({img:c.toDataURL('image/jpeg',.82),n,d:G.day,t:this.clock()});if(G.photos.length>60)G.photos.shift();},
 selfie(n,cb){this.fade(()=>{this.selfieReq={n,cb};},600);},

 // ---------- harita ----------
 bakeMap(){const N=560,x0=-1400,z0=-1650,S=2450;this.mapX0=x0;this.mapZ0=z0;this.mapS=S;const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d'),img=g.createImageData(N,N);
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=x0+i/N*S,z=z0+j/N*S,h=groundY(x,z);let r,gg,b;
    if(h<.3){const d=clamp(-h/12,0,1);r=40-d*15;gg=110-d*30;b=150-d*20;}else{const pk=parkF(x,z);r=225-h*1.2;gg=215-h*1.1;b=190-h*1.4;if(pk>.3||z<-1450){r=150;gg=185;b=130;}}
    const k=(j*N+i)*4;img.data[k]=r;img.data[k+1]=gg;img.data[k+2]=b;img.data[k+3]=255;}
  g.putImageData(img,0,0);g.lineCap='round';for(const r of ROADS){g.strokeStyle=r.k==='a'?'#fff':'#f1d8a8';g.lineWidth=Math.max(1.5,r.w/S*N*1.3);g.beginPath();r.p.forEach((p,i)=>{const X=(p[0]-x0)/S*N,Y=(p[1]-z0)/S*N;i?g.lineTo(X,Y):g.moveTo(X,Y);});g.stroke();}
  g.strokeStyle='rgba(20,60,110,.8)';g.lineWidth=1;g.setLineDash([3,3]);for(const l of ENT.lines||[]){}g.setLineDash([]);this.mapImg=c;},
 m2c(x,z,N){return[(x-this.mapX0)/this.mapS*N,(z-this.mapZ0)/this.mapS*N];},
 map(on){const v=$('mapv');if(!on){v.classList.add('hidden');G.ui=false;return;}if(G.ui&&v.classList.contains('hidden')&&!$('dlg').classList.contains('hidden'))return;
  v.classList.remove('hidden');G.ui=true;document.exitPointerLock&&document.exitPointerLock();
  const side=v.querySelector('.side');side.innerHTML='<h3>🚕 Taksiyle git</h3><p style="font-size:12px;color:var(--mut)">Haritada bir yere tıkla ya da listeden seç. (Esc / M: kapat)</p>';
  for(const k in LM){const l=LM[k];if(k==='kizkulesi'||k==='kopru'||k==='galataKopru')continue;const d=Math.hypot(l.x-P.x,l.z-P.z);const b=document.createElement('button');b.className='dst';
    b.innerHTML=`${l.n} <span style="float:right;color:var(--gold)">${(d*4/1000).toFixed(1)} km</span>`;b.onclick=()=>this.taxi(l.x,l.z,l.n);side.appendChild(b);}
  this.drawBigMap();},
 drawBigMap(){const cv=$('bigmap'),g=cv.getContext('2d'),N=cv.width;g.drawImage(this.mapImg,0,0,N,N);g.font='bold 13px Segoe UI';g.textAlign='center';
  for(const k in LM){const l=LM[k],[X,Y]=this.m2c(l.x,l.z,N);g.fillStyle=G.done[k]?'#2bb3b1':'#c8372d';g.beginPath();g.arc(X,Y,5,0,TAU);g.fill();g.strokeStyle='#fff';g.lineWidth=1.5;g.stroke();
    g.fillStyle='#0d1b2e';g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;g.strokeText(l.n,X,Y-9);g.fillText(l.n,X,Y-9);}
  for(const k in PIERS){const p=PIERS[k],[X,Y]=this.m2c(p.x,p.z,N);g.fillStyle='#1a5fb4';g.fillRect(X-4,Y-4,8,8);}
  for(const l of ENT.lines){const[X,Y]=this.m2c(l.x,l.z,N);g.font='14px Segoe UI';g.fillText('⛴',X,Y+5);}
  const[X,Y]=this.m2c(P.x,P.z,N);g.save();g.translate(X,Y);g.rotate(-P.yaw+Math.PI);g.fillStyle='#e7b54a';g.strokeStyle='#000';g.beginPath();g.moveTo(0,-11);g.lineTo(7,8);g.lineTo(0,4);g.lineTo(-7,8);g.closePath();g.fill();g.stroke();g.restore();
  g.font='bold 22px Segoe UI';g.fillStyle='rgba(13,27,46,.55)';g.fillText('AVRUPA',N*.2,N*.45);g.fillText('ASYA',N*.83,N*.45);g.font='italic 15px Segoe UI';g.fillStyle='rgba(255,255,255,.8)';
  g.fillText('Boğaziçi',N*.73,N*.25);g.fillText('Haliç',N*.25,N*.6);g.fillText('Marmara Denizi',N*.45,N*.9);},
 drawMini(){const cv=$('mini'),g=cv.getContext('2d'),N=cv.width,R=260,s=N/(2*R),mS=this.mapImg.width/this.mapS;g.save();g.clearRect(0,0,N,N);g.beginPath();g.arc(N/2,N/2,N/2,0,TAU);g.clip();
  g.fillStyle='#284f6e';g.fillRect(0,0,N,N);g.translate(N/2,N/2);g.rotate(P.yaw-Math.PI);g.scale(s/mS,s/mS);g.translate(-(P.x-this.mapX0)*mS,-(P.z-this.mapZ0)*mS);g.drawImage(this.mapImg,0,0);g.restore();
  g.save();g.translate(N/2,N/2);g.rotate(P.yaw-Math.PI);const dot=(x,z,c,r=3.5)=>{const X=(x-P.x)*s,Y=(z-P.z)*s;if(X*X+Y*Y>(N/2)**2)return;g.fillStyle=c;g.beginPath();g.arc(X,Y,r,0,TAU);g.fill();};
  for(const k in LM)dot(LM[k].x,LM[k].z,G.done[k]?'#2bb3b1':'#c8372d',4);for(const l of ENT.lines)dot(l.x,l.z,'#fff',4);dot(ENT.tram.x,ENT.tram.z,'#e33',3);g.restore();
  g.fillStyle='#e7b54a';g.strokeStyle='#000';g.beginPath();g.moveTo(N/2,N/2-9);g.lineTo(N/2+6,N/2+7);g.lineTo(N/2,N/2+3);g.lineTo(N/2-6,N/2+7);g.closePath();g.fill();g.stroke();
  const a=P.yaw-Math.PI,rr=N/2-12;g.fillStyle='#fff';g.font='bold 14px Segoe UI';g.textAlign='center';g.fillText('K',N/2+rr*Math.sin(a),N/2-rr*Math.cos(a)+5);},

 // ---------- güncelleme ----------
 move(dt){const fw=(KEY.KeyW||KEY.ArrowUp?1:0)-(KEY.KeyS||KEY.ArrowDown?1:0),rt=(KEY.KeyD||KEY.ArrowRight?1:0)-(KEY.KeyA||KEY.ArrowLeft?1:0);
  const run=(KEY.ShiftLeft||KEY.ShiftRight)&&G.energy>5&&!CAM.photo;const sp=G.mode==='ferry'||G.mode==='galata'?2.2:run?9:4.3;
  const fx=Math.sin(P.yaw),fz=Math.cos(P.yaw),rx=-Math.cos(P.yaw),rz=Math.sin(P.yaw);let mx=fx*fw+rx*rt,mz=fz*fw+rz*rt;const ml=Math.hypot(mx,mz);P.moving=ml>0&&!G.ui;
  if(G.ui){mx=mz=0;}else if(ml>0){mx=mx/ml*sp*dt;mz=mz/ml*sp*dt;P.face+=angDiff(P.face,Math.atan2(mx,mz))*Math.min(1,dt*10);P.ph+=dt*sp*2.2;
    if(run&&P.moving)G.energy=Math.max(0,G.energy-dt*.6);}
  if(G.mode==='ferry'||G.mode==='tram'){const l=G.ride;const dr=angDiff(G.lastRy,l.ry);P.yaw+=dr;P.face+=dr;G.lastRy=l.ry;
    if(G.mode==='ferry'&&!l.small){const c=Math.cos(l.ry),s=Math.sin(l.ry);G.lx=clamp(G.lx+mx*c-mz*s,-4.5,4.5);G.lz=clamp(G.lz+mx*s+mz*c,-12.8,12.8);
      const d=Math.hypot(G.lx,G.lz);if(d<1.4){G.lx*=1.4/d;G.lz*=1.4/d;}}
    const lx=G.mode==='tram'?0:G.lx,lz=G.mode==='tram'?-5.1:G.lz,c=Math.cos(l.ry),s=Math.sin(l.ry);
    P.x=l.x+lx*c+lz*s;P.z=l.z-lx*s+lz*c;P.y=l.y+(G.mode==='tram'?.4:l.small?.9:4.25);P.vy=0;P.ground=true;
    if(G.mode==='ferry'){if(G.tour&&l.id==='C'&&l.z<-1005)done('bogaz');}
    if(G.mode==='tram'&&l.wait<=0)done('tram');return;}
  if(G.mode==='galata'){let x=P.x+mx,z=P.z+mz;const dx=x-GALATA.x,dz=z-GALATA.z,d=Math.hypot(dx,dz)||1,r=clamp(d,9.1,10.9);P.x=GALATA.x+dx/d*r;P.z=GALATA.z+dz/d*r;P.y=GALATA.top;return;}
  const tryMove=(nx,nz)=>{const s=surfaceY(nx,nz,P.y);if(s===-Infinity||s>P.y+1.25)return false;P.x=nx;P.z=nz;return true;};
  if(mx||mz){if(!tryMove(P.x+mx,P.z+mz)){tryMove(P.x+mx,P.z)||tryMove(P.x,P.z+mz);}}
  const ox=P.x,oz=P.z;COL.resolve(P,.35);if(surfaceY(P.x,P.z,P.y)===-Infinity){P.x=ox;P.z=oz;}
  const gy=surfaceY(P.x,P.z,P.y);if(KEY.Space&&P.ground&&!G.ui){P.vy=5.5;P.ground=false;}
  if(P.ground&&P.vy<=0&&gy>P.y-.6&&gy!==-Infinity){P.y=gy;P.vy=0;}else{P.vy-=18*dt;P.y+=P.vy*dt;if(P.y<=gy){P.y=gy;P.vy=0;P.ground=true;}else P.ground=false;}
  if(P.y<-400){this.teleport(125,groundY(125,200),200);}
  // camiler
  let inM=null;for(const it of INTERIORS)if(insideI(it,P.x,P.z)&&Math.abs(P.y-groundY(it.x,it.z))<6){inM=it;break;}
  if(inM){if(MOSQ[inM.key]&&!G.shoesOff){this.teleport(inM.door[0],groundY(inM.door[0],inM.door[1]),inM.door[1]);UI.toast('Görevli: "Lütfen ayakkabılarınızı çıkarın!" 🙏','bad');}
    else if(G.inside!==inM.key){G.inside=inM.key;const k=inM.key;if(['ayasofya','sultanahmet','suleymaniye','topkapi'].includes(k)){if(!G.done[k]){done(k);setTimeout(()=>info(k),500);}}
      else if(MOSQ[k])UI.toast(MOSQ[k]+' — huzurlu bir sessizlik…');else if(k==='kapali')UI.toast('Kapalıçarşı\'ya hoş geldin! 4000 dükkan, 61 sokak…');else if(k==='misir')UI.toast('Mısır Çarşısı: baharat kokuları burnunu dolduruyor…');}}
  else{G.inside=null;if(G.shoesOff){let far=true;for(const it of INTERIORS)if(it.door&&Math.hypot(P.x-it.door[0],P.z-it.door[1])<14)far=false;if(far){G.shoesOff=false;UI.toast('Ayakkabılarını tekrar giydin. 👟');}}}},
 checks(){const t=G.time;if(Math.hypot(P.x-1000,P.z+420)<95)done('camlica');
  if(Math.hypot(P.x-555,P.z-60)<14&&P.y>1)done('kizkulesi');
  if(P.x>-26&&P.x<-4&&P.z>-160&&P.z<-45&&P.y>4&&(t>20.5||t<5))done('gece');
  if(t>18.5&&t<19.75&&(G.mode==='galata'||G.mode==='ferry'||waterDist(P.x,P.z)<28))done('gunbatimi');
  if(G.full<12&&(tipT-=1)<0){tipT=40;UI.toast('Karnın guruldadı… Bir şeyler ye! 🥯','bad');}
  if(G.full<=0)G.energy=Math.max(0,G.energy-.3);else if(!P.moving)G.energy=Math.min(100,G.energy+.05);},
 updateHUD(){const nm=districtAt(P.x,P.z),side=G.mode==='cistern'?'YERALTI':groundY(P.x,P.z)<.3&&G.mode!=='walk'?'DENİZDE':P.x>bosX(P.z)?'ASYA':'AVRUPA';
  $('loc').querySelector('.d').textContent=G.mode==='cistern'?'Yerebatan Sarnıcı':G.mode==='galata'?'Galata Kulesi':nm;$('loc').querySelector('.c').textContent=side;
  const bar=(v,c)=>`<div class="bar"><i style="width:${v}%;background:${c}"></i></div>`;
  $('topL').innerHTML=`<div class="time">${this.clock()}<small>Gün ${G.day}</small></div><div class="row"><span>💵 ${fmt(G.tl)}</span><span>💶 ${G.eur} €</span></div>
   <div class="row"><span>💳 ${G.card===null?'İstanbulkart yok':fmt(G.card)}</span><span>🥯 ${G.inv.simit}</span></div>
   <div class="row" style="margin-top:6px"><span>Tokluk</span><span>Enerji</span></div><div class="row"><div style="flex:1">${bar(G.full,G.full<20?'#c8372d':'#e7b54a')}</div><div style="flex:1">${bar(G.energy,'#2bb3b1')}</div></div>`;
  const open=QUESTS.filter(q=>!G.done[q[0]]).slice(0,4);$('quests').innerHTML=`<h4>Görevler · ${Object.keys(G.done).length}/${QUESTS.length}</h4>`+open.map(q=>`<div class="q"><b>◆</b> ${q[1]}${QN[q[0]]?` (${G.prog[q[0]]}/${QN[q[0]]})`:''}</div>`).join('')+'<div class="q" style="color:var(--mut)">Tümü için J</div>';},
 labels(){const L=[];if(G.mode!=='cistern')for(const k in LM){const l=LM[k],d=Math.hypot(l.x-P.x,l.z-P.z);if(d>700||d<14)continue;L.push([l.n,l.x,groundY(l.x,l.z)+l.ph+6,l.z,d]);}
  for(const k in PIERS){const p=PIERS[k],d=Math.hypot(p.x-P.x,p.z-P.z);if(d<180&&d>6)L.push([p.n+' İskelesi',p.x,7,p.z,d]);}
  L.sort((a,b)=>a[4]-b[4]);let n=0;for(const l of L.slice(0,8)){const s=this.project(l[1],l[2],l[3]);if(!s)continue;let e=lblPool[n];if(!e){e=document.createElement('div');e.className='lbl';$('labels').appendChild(e);lblPool.push(e);}
    e.style.display='';e.style.left=s[0]+'px';e.style.top=s[1]+'px';const h=`${l[0]}<i>${Math.round(l[4]*4)} m</i>`;if(e._h!==h){e.innerHTML=h;e._h=h;}e.style.opacity=clamp(1.3-l[4]/700,.35,1);n++;}
  for(let i=n;i<lblPool.length;i++)lblPool[i].style.display='none';},

 loop(t){requestAnimationFrame(t2=>this.loop(t2));const dt=Math.min(.05,(t-lastT)/1000||.016);lastT=t;const gl=this.gl;
  const started=$('start').classList.contains('hidden');
  if(started){G.time+=dt*TSCALE/3600;if(G.time>=24){G.time-=24;G.day++;}G.full=Math.max(0,G.full-dt*TSCALE/3600*4);
   ENT.update(dt,P);this.move(dt);
   for(const T of thrown){if(T.done&&!T.told){T.told=true;if(T.y>.5){UI.toast('Martı simidi havada kaptı! 🐦🥯');if(T.ferry)done('simit');}}if(T.done)continue;
    T.vy-=12*dt;T.x+=T.vx*dt;T.y+=T.vy*dt;T.z+=T.vz*dt;T.life-=dt;const g=groundY(T.x,T.z);if(T.y<Math.max(g,0)){T.y=Math.max(g,0);T.vx=T.vy=T.vz=0;if(g<.3&&!T.spl){T.spl=1;AUD.splash();}}if(T.life<0)T.done=true;}
   thrown=thrown.filter(T=>!T.done||!T.told);
   hudT-=dt;if(hudT<0){hudT=.25;this.checks();this.updateHUD();const a=G.ui?null:ACT.scan(P);UI.prompt(a?`<kbd>E</kbd>${a.l}`:null);this.drawMini();}
   const nw=G.mode==='cistern'?0:clamp(1-(Math.max(0,waterDist(P.x,P.z))-5)/80,0,1);AUD.update(dt,P,G.mode==='ferry'?1:nw,G.time>20||G.time<6);}
  // kamera
  const env=envAt(G.time,t/1000);const head=[P.x,P.y+1.62,P.z];let eye,tgt;const cp=Math.cos(P.pitch),dir=[Math.sin(P.yaw)*cp,Math.sin(P.pitch),Math.cos(P.yaw)*cp];
  const fp=CAM.fp||CAM.photo||G.mode==='tram'||G.mode==='galata';
  if(!started){const a=t/1000*.05;eye=[140+Math.sin(a)*260,70,130+Math.cos(a)*260];tgt=[140,20,150];}
  else if(fp){eye=head;tgt=[head[0]+dir[0],head[1]+dir[1],head[2]+dir[2]];}
  else{const inI=!!G.inside||G.mode==='cistern';let dist=inI?2.6:CAM.dist;const hd=[P.x,P.y+1.5,P.z];
    for(let d=.4;d<=dist;d+=.25){const x=hd[0]-dir[0]*d,y=hd[1]-dir[1]*d,z=hd[2]-dir[2]*d;if(insideCol(x,y,z)||(G.mode==='walk'&&y<groundY(x,z)+.25)){dist=Math.max(.3,d-.3);break;}}
    eye=[hd[0]-dir[0]*dist,hd[1]-dir[1]*dist+.25,hd[2]-dir[2]*dist];tgt=[hd[0],hd[1]+.25,hd[2]];}
  if(this.alt){eye=[P.x,P.y+this.alt,P.z];tgt=[eye[0]+dir[0],eye[1]+dir[1],eye[2]+dir[2]];}
  if(this.selfieReq){const f=[Math.sin(P.face),0,Math.cos(P.face)];eye=[P.x+f[0]*3.2,P.y+1.5,P.z+f[2]*3.2];tgt=[P.x,P.y+1.2,P.z];}
  const fov=(CAM.photo?CAM.zoom:CAM.fov)*Math.PI/180,asp=SW/SH;const Pm=Mat.persp(fov,asp,.25,5000),Vm=Mat.lookAt(eye,tgt,[0,1,0]);VP=Mat.mul(Pm,Vm);
  let f=[tgt[0]-eye[0],tgt[1]-eye[1],tgt[2]-eye[2]];const fl=Math.hypot(...f);f=f.map(v=>v/fl);let r=[-f[2],0,f[0]];const rl=Math.hypot(...r)||1;r=r.map(v=>v/rl);
  r=[f[1]*0-f[2]*1,f[2]*0-f[0]*0,f[0]*1-f[1]*0];const rl2=Math.hypot(...r)||1;r=r.map(v=>v/rl2);const u=[r[1]*f[2]-r[2]*f[1],r[2]*f[0]-r[0]*f[2],r[0]*f[1]-r[1]*f[0]];
  GL.frame(Pm,Vm,eye,env,{r,u,f,tan:Math.tan(fov/2),asp});
  gl.viewport(0,0,gl.canvas.width,gl.canvas.height);const fc=env.hor;gl.clearColor(fc[0],fc[1],fc[2],1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  GL.drawSky();GL.beginMain();GL.draw(M.terrain,IDENT);GL.draw(M.lm,IDENT);GL.draw(M.city,IDENT);
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);GL.draw(M.roads,IDENT);gl.disable(gl.POLYGON_OFFSET_FILL);
  const hue=t/4000,night=env.night;GL.tint(night>.3?[.6+.4*Math.sin(hue),.5+.5*Math.sin(hue+2.1),.7+.3*Math.sin(hue+4.2)]:[.85,.85,.85]);GL.draw(M.lights,IDENT);GL.tint([1,1,1]);
  if(started)ENT.draw(eye,P);
  if(started&&(!fp||this.selfieReq)&&G.mode!=='tram'){const cost=!!this.selfieReq,sw=P.moving&&P.ground?Math.sin(P.ph)*.5:0,bob=P.moving?Math.abs(Math.cos(P.ph))*.04:0;
    GL.draw(cost?M.costume:ENT.playerBody,Mat.trs(P.x,P.y+bob,P.z,P.face));const base=Mat.trs(P.x,P.y+.87+bob,P.z,P.face);GL.tint(cost?[.85,.68,.2]:[.85,.78,.6]);
    GL.draw(ENT.leg,Mat.mul(base,Mat.trs(-.11,0,0,0,sw)));GL.draw(ENT.leg,Mat.mul(base,Mat.trs(.11,0,0,0,-sw)));GL.tint([1,1,1]);}
  for(const T of thrown)if(!T.done)GL.draw(ENT.simitM,Mat.trs(T.x,T.y,T.z,t/200,1,2));
  GL.drawWater();
  if(this.selfieReq){const q=this.selfieReq;this.selfieReq=null;AUD.shutter();this.snap(q.n);UI.toast('📷 '+q.n+' albüme eklendi (J)');q.cb&&q.cb();}
  if(started)this.labels();}
};
Game.init().catch(e=>{$('load').textContent='Hata: '+e.message;console.error(e);});
