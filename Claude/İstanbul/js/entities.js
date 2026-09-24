'use strict';
// ================= model üreticiler =================
const SKIN=[[.93,.75,.6],[.8,.6,.45],[.62,.44,.32],[.96,.83,.72]];
const SHIRT=[[.8,.15,.15],[.15,.3,.6],[.9,.9,.88],[.2,.2,.22],[.3,.55,.3],[.95,.75,.2],[.55,.3,.55],[.5,.35,.25],[.2,.6,.7],[.85,.45,.55]];
const PANTS=[[.18,.22,.35],[.15,.15,.17],[.45,.4,.32],[.3,.32,.36],[.55,.5,.45]];
function personBody(mb,o){const sk=o.skin;mb.box(0,.87,0,.44,.14,.24,o.pants);mb.box(0,.99,0,.46,.58,.26,o.shirt);
  for(const s of[-1,1]){mb.box(s*.29,.97,0,.12,.58,.14,o.shirt);mb.box(s*.29,.87,0,.1,.12,.12,sk);}
  mb.box(0,1.55,0,.11,.08,.11,sk);mb.lathe(0,1.6,0,[[0,0],[.12,.03],[.13,.14],[.1,.24],[0,.27]],8,sk);
  if(o.hijab)mb.lathe(0,1.5,-.01,[[.2,0],[.15,.1],[.145,.2],[.14,.28],[.1,.36],[0,.39]],8,o.hijab);
  else mb.lathe(0,1.73,-.015,[[.135,0],[.12,.08],[0,.15]],8,o.hair||[.15,.1,.07]);
  if(o.hat==='fes'){mb.cyl(0,1.8,0,.11,.17,8,C.red,.1,.09);}
  if(o.hat==='sun'){mb.cyl(0,1.8,0,.3,.03,12,[.9,.85,.65]);mb.cyl(0,1.82,0,.14,.12,10,[.9,.85,.65]);}
  if(o.pack){mb.box(0,1,-.21,.34,.44,.16,[.2,.4,.3]);mb.box(0,1.12,.14,.14,.1,.08,C.dark);}
  if(o.apron)mb.box(0,.8,.13,.4,.6,.02,[.95,.95,.95]);}
function legGeo(mb){mb.box(0,-.84,0,.16,.84,.18,[1,1,1]);mb.box(0,-.87,.05,.17,.08,.28,[.5,.5,.5]);}
function personStatic(mb,x,y,z,ry,o){mb.at(x,y,z,ry);personBody(mb,o);for(const s of[-.11,.11]){mb.box(s,0,0,.16,.84,.18,o.pants);mb.box(s,-.03,.05,.17,.08,.28,C.dark);}mb.at();}
function randPerson(R){return{skin:SKIN[Math.floor(R()*4)],shirt:SHIRT[Math.floor(R()*SHIRT.length)],pants:PANTS[Math.floor(R()*PANTS.length)],
  hair:R()<.3?[.35,.25,.15]:R()<.2?[.8,.7,.4]:[.1,.08,.06],hijab:R()<.18?SHIRT[Math.floor(R()*SHIRT.length)]:null,hat:R()<.1?'sun':null,pack:R()<.2};}

function ferryGeo(mb,big=true){const L=big?42:9,W=big?11:3.2,Hh=big?3:1.2;const hl=L/2,hw=W/2;
  const hull=(y0,y1,c)=>{const P=[[-hw,-hl+3],[hw,-hl+3],[hw,hl-3],[-hw,hl-3]];mb.box(0,y0,0,W,y1-y0,L-6,c);
    for(const s of[-1,1]){mb.quad([-hw,y0,s*(hl-3)],[hw,y0,s*(hl-3)],[0,y0,s*hl],[0,y0,s*hl],c);mb.quad([-hw,y1,s*(hl-3)],[hw,y1,s*(hl-3)],[0,y1,s*hl],[0,y1,s*hl],c);
      for(const t of[-1,1])mb.quad([t*hw,y0,s*(hl-3)],[0,y0,s*hl],[0,y1,s*hl],[t*hw,y1,s*(hl-3)],c);}};
  hull(-1.5,-.4,[.12,.12,.14]);hull(-.4,Hh-1.4,big?[.97,.97,.95]:[.9,.9,.85]);
  if(big){mb.box(0,1.6,0,W-1.4,2.6,L-10,[.95,.93,.86],2);mb.box(0,4.1,0,W-.6,.15,L-8,[.6,.5,.4]);
    for(const s of[-1,1]){mb.box(0,4.25,s*(hl-6.5),4,2.2,3,[.95,.95,.92],.2);mb.box(0,5.2,s*(hl-5),3.8,.7,.1,C.glass,.5);
      mb.box(s*(hw-.4),4.25,0,.08,1,L-8,[.9,.9,.9]);mb.box(0,4.25,s*(hl-4),W-.6,1,.08,[.9,.9,.9]);}
    mb.cyl(0,4.2,0,.95,3.2,12,[.95,.95,.95]);mb.cyl(0,7.4,0,.97,.8,12,C.dark);mb.cyl(0,5.8,0,.97,.4,12,[.1,.2,.5]);
    for(let i=-4;i<=4;i++)if(i)mb.box(0,4.25,i*2.6,5,.45,.5,[.5,.35,.2]);mb.box(0,4.4,-1.5,.1,.1,.1,C.lamp,1);
    for(const s of[-1,1])mb.box(s*hw,.8,0,.1,.3,L-8,[.1,.25,.5]);}
  else{mb.box(0,Hh-1.4,-1,W-.6,1.4,3.5,[.95,.95,.95]);mb.box(0,Hh,-1,W-.4,.1,4,C.red);mb.box(0,Hh-.6,-1,W-.5,.5,3.6,C.glass,.3);}}
function tramGeo(mb){mb.box(0,.35,0,2.3,2.5,9,[.72,.08,.08],.15);mb.box(0,1.45,0,2.32,.95,8.6,[.95,.9,.75],2);mb.box(0,2.85,0,2.1,.3,8.6,[.9,.88,.84]);
  mb.box(0,2.85,-5,2.1,.2,1.2,[.9,.88,.84]);mb.box(0,.3,-5,2.1,.1,1.4,[.3,.3,.3]);for(const s of[-1,1])mb.box(s*1,.4,-5.6,.06,1,.06,[.8,.7,.3]);
  mb.beam([0,3.15,0],[0,4.4,1.2],.05,C.dark);mb.beam([0,4.4,1.2],[0,4.9,-.3],.05,C.dark);mb.box(0,1.9,4.52,.6,.3,.05,C.lamp,1);
  for(const z of[-3,3])for(const s of[-.7,.7])mb.cyl(s,0,z,.3,.12,8,C.dark);}
function carGeo(mb,col,taxi){mb.box(0,.35,0,1.8,.7,4.2,col,.05);mb.box(0,1.05,-.2,1.6,.6,2.2,col,.05);mb.box(0,1.07,-.2,1.62,.5,1.8,C.glass,.2);
  for(const s of[-1,1])for(const z of[-1.3,1.3])mb.lathe(s*.85,.33,z,[[0,-.33],[.33,-.2],[.33,.2],[0,.33]].map(p=>[p[0],p[1]]),8,C.dark);
  for(const s of[-.6,.6]){mb.box(s,.6,2.11,.35,.18,.02,[1,1,.9],1);mb.box(s,.6,-2.11,.35,.15,.02,[1,.1,.1],1);}
  if(taxi)mb.box(0,1.65,-.2,.7,.2,.3,[1,.95,.6],.8);}
function boatGeo(mb){mb.box(0,-.8,0,3.6,1.6,9,[.75,.2,.12],.2);mb.box(0,.8,0,3.8,.25,9.4,[.95,.75,.2],.3);for(const s of[-1,1])for(const z of[-4,4])mb.cyl(s*1.7,1,z,.07,2.2,4,[.9,.8,.3]);
  mb.box(0,3.2,0,4,.2,9.6,[.8,.15,.1],.3);mb.box(0,1,-2,2.4,.9,1.2,C.dark);mb.box(0,1.9,-2,2.2,.1,1,[1,.45,.1],1);}
function catGeo(mb){const c=[1,1,1];mb.box(0,.12,0,.2,.18,.44,c);mb.box(0,.2,.26,.17,.15,.15,c);mb.tri([-.08,.35,.28],[-.02,.35,.28],[-.06,.43,.28],c);mb.tri([.08,.35,.28],[.02,.35,.28],[.06,.43,.28],c);
  for(const s of[-1,1])for(const z of[-.15,.15])mb.box(s*.07,0,z,.05,.13,.05,c);mb.beam([0,.25,-.2],[0,.5,-.34],.025,c);mb.box(-.04,.28,.334,.03,.02,.01,[.2,.8,.3],.6);mb.box(.04,.28,.334,.03,.02,.01,[.2,.8,.3],.6);}
function gullGeo(b,w){b.box(0,-.06,-.02,.13,.12,.42,[.95,.95,.95]);b.box(0,-.03,.2,.1,.1,.12,[.97,.97,.97]);b.box(0,-.01,-.26,.1,.03,.14,[.75,.77,.8]);
  b.box(0,.02,.27,.02,.02,.08,[.95,.75,.1]);w.quad([0,0,-.08],[.45,0,-.12],[.5,0,.05],[0,0,.1],[.7,.72,.75]);w.quad([.45,0,-.12],[.62,0,-.1],[.62,0,0],[.5,0,.05],[.1,.1,.1]);}

// ================= yol takibi =================
function mkPath(pts,smooth=2){let p=pts.map(q=>[q[0],q[1]]);for(let k=0;k<smooth;k++){const n=[p[0]];for(let i=0;i<p.length-1;i++){const a=p[i],b=p[i+1];n.push([lerp(a[0],b[0],.25),lerp(a[1],b[1],.25)],[lerp(a[0],b[0],.75),lerp(a[1],b[1],.75)]);}n.push(p[p.length-1]);p=n;}
  const cum=[0];for(let i=1;i<p.length;i++)cum.push(cum[i-1]+Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]));return{p,cum,L:cum[cum.length-1]};}
function pathAt(P,s){s=clamp(s,0,P.L);let lo=0,hi=P.cum.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(P.cum[m]<=s)lo=m;else hi=m;}
  const a=P.p[lo],b=P.p[hi],seg=P.cum[hi]-P.cum[lo]||1,t=(s-P.cum[lo])/seg;return{x:lerp(a[0],b[0],t),z:lerp(a[1],b[1],t),ang:Math.atan2(b[0]-a[0],b[1]-a[1])};}

// ================= varlık sistemi =================
const ENT={t:0,
 init(){const R=RNG(99);this.R=R;const up=mb=>GL.upload(mb);
  this.bodies=[];for(let i=0;i<14;i++){const mb=new MB();personBody(mb,randPerson(R));this.bodies.push(up(mb));}
  const lg=new MB();legGeo(lg);this.leg=up(lg);
  const pb=new MB();personBody(pb,{skin:SKIN[0],shirt:[.25,.65,.75],pants:[.85,.78,.6],hair:[.45,.3,.15],hat:'sun',pack:true});this.playerBody=up(pb);
  const fm=new MB();ferryGeo(fm,true);this.ferryM=up(fm);const bm=new MB();ferryGeo(bm,false);this.boatM=up(bm);
  const tm=new MB();tramGeo(tm);this.tramM=up(tm);const km=new MB();boatGeo(km);this.fishBoatM=up(km);
  const CC=[[.85,.85,.87],[.15,.15,.18],[.6,.1,.1],[.2,.3,.5],[.5,.52,.55],[.9,.9,.9]];this.cars=CC.map(c=>{const m=new MB();carGeo(m,c);return up(m);});
  const tx=new MB();carGeo(tx,[.98,.8,.1],true);this.taxiM=up(tx);
  const ct=new MB();catGeo(ct);this.catM=up(ct);const gb=new MB(),gw=new MB();gullGeo(gb,gw);this.gullB=up(gb);this.gullW=up(gw);
  // simit
  const sm=new MB();sm.lathe(0,0,0,[[.08,0],[.12,.03],[.08,.06]],10,[.7,.42,.18]);this.simitM=up(sm);
  this.initStatic();this.initNPC();this.initCats();this.initVehicles();this.initGulls();},
 initStatic(){const R=this.R,mb=new MB();
  for(let i=0;i<24;i++){const s=i%2?1:-1,z=-52-i*4.4-(i%3),x=-15+s*10.2,y=5;personStatic(mb,x,y,z,s>0?Math.PI/2:-Math.PI/2,randPerson(R));
    mb.beam([x+s*.35,y+1.1,z],[x+s*4,y+3.2,z+.3],.02,[.3,.25,.2]);mb.beam([x+s*4,y+3.2,z+.3],[x+s*4,0,z+.3],.004,[.9,.9,.9]);mb.box(x-s*.4,y,z+.5,.3,.35,.3,[.2,.4,.7]);}
  for(const s of SPOTS){if(s.t==='ikart')continue;const o=randPerson(R);o.apron=true;o.hijab=null;if(s.t==='dondurma'||s.t==='kostum')o.hat='fes';
    let lx=0,lz=-1.1;if(s.t==='cay'||s.t==='kahve')lz=-4.9;if(s.t==='doner'||s.t==='kokorec')lz=-.5;if(s.t==='balik')lz=-1.2;
    const c=Math.cos(s.ry||0),sn=Math.sin(s.ry||0);let px=s.x+lx*c+lz*sn,pz=s.z-lx*sn+lz*c,ry=s.ry||0;
    if(s.ng){px=s.x+1.6;pz=s.z;ry=s.z<((s.t==='baharat'||s.t==='lokum')?20:160)?0:Math.PI;}
    personStatic(mb,px,groundY(px,pz),pz,ry,o);}
  const spots=[[120,200,14],[-15,230,20],[10,-285,10],[-200,-725,16],[725,280,10],[260,-930,10],[102,150,8],[82,270,10],[-250,-10,10],[1000,-470,14],[640,-140,12]];
  for(const[cx,cz,n]of spots)for(let i=0;i<n;i++){const a=R()*TAU,r=3+R()*12,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;const g=groundY(x,z);if(g<.5)continue;
    let ok=true;const tp={x,y:g,z};COL.resolve(tp,.3);if(Math.hypot(tp.x-x,tp.z-z)>.01)ok=false;if(ok)personStatic(mb,x,g,z,R()*TAU,randPerson(R));}
  this.staticM=GL.upload(mb);},
 initNPC(){const R=this.R;this.rp=ROADS.map(r=>mkPath(r.p,0));const tot=this.rp.reduce((a,p)=>a+p.L,0);this.npc=[];
  for(let i=0;i<260;i++){let q=R()*tot,k=0;while(q>this.rp[k].L){q-=this.rp[k].L;k++;}const r=ROADS[k];
    const side=r.k==='a'?(R()<.5?-1:1)*(r.w/2+1.2):(R()-.5)*(r.w-2);this.npc.push({k,s:q,dir:R()<.5?1:-1,off:side,sp:1.1+R()*.6,b:Math.floor(R()*this.bodies.length),
      pants:PANTS[Math.floor(R()*PANTS.length)],ph:R()*TAU,x:0,y:0,z:0,ry:0,stop:0});}},
 initCats(){const R=this.R;this.cats=[];const home=[[118,205],[100,225],[-10,-25],[20,-10],[5,-285],[25,-310],[-80,-505],[-140,-610],[720,300],[735,310],[700,285],[650,-130],[-160,146],[-40,160],[-60,305],
   [255,-940],[270,20],[-240,-15],[80,120],[40,-180],[-195,-745],[640,95],[-800,-20],[-780,10],[-15,300],[160,240],[-100,-30],[610,-160],[760,290],[30,150]];
  const cols=[[.95,.6,.25],[.15,.15,.15],[.95,.95,.93],[.55,.55,.58],[.6,.45,.3],[.9,.8,.6]];
  for(let i=0;i<home.length;i++){const[h0,h1]=home[i];const x=h0+(R()-.5)*4,z=h1+(R()-.5)*4;this.cats.push({hx:x,hz:z,x,z,ry:R()*TAU,col:cols[i%cols.length],st:R()<.4?'sleep':'sit',t:R()*10,tx:x,tz:z,pet:false,happy:0});}},
 initVehicles(){const R=this.R;
  this.lines=[
   {id:'A',n:'Eminönü ⇄ Üsküdar',m:this.ferryM,P:mkPath([[85,-68.5],[125,-68.5],[200,-72],[345,-55],[520,-45],[575.5,-78],[575.5,-130]]),sp:13,a:'eminonu',b:'uskudar',fare:27},
   {id:'B',n:'Karaköy ⇄ Kadıköy',m:this.ferryM,P:mkPath([[100,-117.5],[150,-117.5],[250,-100],[360,-60],[470,100],[600,215],[633.5,238],[633.5,280]]),sp:13,a:'karakoy',b:'kadikoy',fare:27},
   {id:'C',n:'Boğaz Turu',m:this.ferryM,loop:true,P:mkPath([[30,-68.5],[70,-84],[140,-90],[200,-95],[330,-120],[380,-300],[400,-600],[410,-1000],[440,-1300],[455,-1550],[480,-1610],[505,-1550],[485,-1000],[465,-600],[440,-300],[390,-140],[250,-100],[140,-92],[70,-84],[30,-68.5]],1),sp:15,a:'eminonu',b:'eminonu',fare:150},
   {id:'D',n:'Salacak ⇄ Kız Kulesi',m:this.boatM,small:true,P:mkPath([[618,60],[618,68],[600,78],[582,72],[577,64],[577,60]]),sp:5,a:'salacak',b:'kizkulesi',fare:350},
  ];
  for(const l of this.lines){l.s=0;l.dir=1;l.wait=l.id==='C'?30:10+R()*10;const p=pathAt(l.P,0);l.x=p.x;l.z=p.z;l.ry=p.ang;l.y=0;l.at=l.a;l.vx=0;l.vz=0;}
  this.lines[1].s=this.lines[1].P.L;this.lines[1].dir=-1;this.lines[1].at='kadikoy';{const p=pathAt(this.lines[1].P,this.lines[1].P.L);Object.assign(this.lines[1],{x:p.x,z:p.z,ry:p.ang});}
  const ist=ROADS.find(r=>r.n==='İstiklal Caddesi');this.tram={P:mkPath(ist.p,1),s:0,dir:1,wait:8,x:0,y:0,z:0,ry:0,at:'Tünel',vx:0,vz:0};
  this.traffic=[];const ar=ROADS.map((r,i)=>i).filter(i=>ROADS[i].k==='a');
  for(let i=0;i<90;i++){const k=ar[Math.floor(R()*ar.length)],P=this.rp[k];this.traffic.push({k,s:R()*P.L,dir:R()<.5?1:-1,sp:8+R()*5,m:R()<.3?this.taxiM:this.cars[Math.floor(R()*this.cars.length)],v:0,x:0,z:0,y:0,ry:0});}
  this.bridgeCars=[];for(let i=0;i<34;i++)this.bridgeCars.push({x:80+R()*680,lane:[-7.5,-3.5,3.5,7.5][i%4],sp:14+R()*6,m:R()<.25?this.taxiM:this.cars[i%this.cars.length]});
  this.fishBoats=[[-97,-59],[-81,-59.5],[-65,-59]].map(([x,z],i)=>({x,z,ph:i*1.7}));},
 initGulls(){const R=this.R;this.gulls=[];for(let i=0;i<70;i++){let cx,cz;do{cx=-300+R()*1000;cz=-600+R()*1000;}while(groundY(cx,cz)>0);
  this.gulls.push({cx,cz,r:15+R()*50,h:12+R()*25,w:(R()<.5?-1:1)*(.15+R()*.25),a:R()*TAU,fl:R()*TAU,follow:i<24?this.lines[i%3]:null,x:cx,y:20,z:cz,ry:0,tgt:null});}},
 // ---------- güncelle ----------
 update(dt,P){this.t+=dt;const t=this.t;
  for(const n of this.npc){const r=this.rp[n.k];if(n.stop>0)n.stop-=dt;else{n.s+=n.dir*n.sp*dt;n.ph+=n.sp*dt*5;}
    if(n.s>r.L){n.s=r.L;n.dir=-1;}if(n.s<0){n.s=0;n.dir=1;}const p=pathAt(r,n.s);const ox=Math.cos(p.ang)*n.off,oz=-Math.sin(p.ang)*n.off;
    n.x=p.x+ox;n.z=p.z+oz;n.ry=p.ang+(n.dir<0?Math.PI:0);
    const dx=n.x-P.x,dz=n.z-P.z;if(dx*dx+dz*dz<1.2&&n.stop<=0){n.stop=1.5;}}
  for(const c of this.cats){c.t-=dt;if(c.happy>0)c.happy-=dt;
    if(c.st==='walk'){const dx=c.tx-c.x,dz=c.tz-c.z,d=Math.hypot(dx,dz);if(d<.2||c.t<0){c.st=Math.random()<.5?'sit':'sleep';c.t=6+Math.random()*14;}else{c.x+=dx/d*.7*dt;c.z+=dz/d*.7*dt;c.ry=Math.atan2(dx,dz);}}
    else if(c.t<0){c.st='walk';c.t=8;const a=Math.random()*TAU;c.tx=c.hx+Math.cos(a)*3;c.tz=c.hz+Math.sin(a)*3;}}
  for(const l of this.lines){if(l.wait>0){l.wait-=dt;l.vx=l.vz=0;}else{const ps=l.s;l.s+=l.dir*l.sp*dt;
      if(l.loop){if(l.s>=l.P.L){l.s=0;l.wait=35;l.at=l.a;AUD.horn(l);}else l.at=null;}
      else{if(l.s>=l.P.L){l.s=l.P.L;l.dir=-1;l.wait=18;l.at=l.b;AUD.horn(l);}else if(l.s<=0){l.s=0;l.dir=1;l.wait=18;l.at=l.a;AUD.horn(l);}else l.at=null;}
      const p=pathAt(l.P,l.s);l.vx=(p.x-l.x)/dt;l.vz=(p.z-l.z)/dt;l.x=p.x;l.z=p.z;l.ry+=angDiff(l.ry,p.ang)*Math.min(1,dt*.8);}
    l.y=Math.sin(t*.9+l.x)*.15;l.roll=Math.sin(t*.7+l.z)*.02;}
  const tr=this.tram;if(tr.wait>0){tr.wait-=dt;tr.vx=tr.vz=0;}else{tr.s+=tr.dir*4.2*dt;if(tr.s>=tr.P.L){tr.s=tr.P.L;tr.dir=-1;tr.wait=14;tr.at='Taksim';AUD.bell();}
    else if(tr.s<=0){tr.s=0;tr.dir=1;tr.wait=14;tr.at='Tünel';AUD.bell();}else tr.at=null;}
  {const p=pathAt(tr.P,tr.s);tr.vx=tr.wait>0?0:(p.x-tr.x)/dt;tr.vz=tr.wait>0?0:(p.z-tr.z)/dt;tr.x=p.x;tr.z=p.z;tr.ry=p.ang;tr.y=groundY(p.x,p.z)+.17;}
  for(const c of this.traffic){const r=this.rp[c.k];const p=pathAt(r,c.s),fx=Math.sin(p.ang)*c.dir,fz=Math.cos(p.ang)*c.dir;
    const dx=P.x-c.x,dz=P.z-c.z,ahead=dx*fx+dz*fz,lat=Math.abs(-dx*fz+dz*fx);const blocked=ahead>0&&ahead<7&&lat<2.2&&Math.abs(P.y-c.y)<3;
    c.v=lerp(c.v,blocked?0:c.sp,Math.min(1,dt*(blocked?4:1)));if(blocked&&Math.random()<dt*.3)AUD.honk();
    c.s+=c.dir*c.v*dt;if(c.s>r.L){c.s=r.L;c.dir=-1;}if(c.s<0){c.s=0;c.dir=1;}
    const q=pathAt(r,c.s),ry=q.ang+(c.dir<0?Math.PI:0),rx=-Math.cos(ry)*2.6,rz=Math.sin(ry)*2.6;c.x=q.x+rx;c.z=q.z+rz;c.y=Math.max(groundY(c.x,c.z),.3)+.12;c.ry=ry;}
  for(const c of this.bridgeCars){c.x+=(c.lane>0?1:-1)*c.sp*dt;if(c.x>770)c.x=70;if(c.x<70)c.x=770;}
  for(const g of this.gulls){g.fl+=dt*(g.tgt?14:6);
    if(g.tgt){const T=g.tgt,dx=T.x-g.x,dy=T.y-g.y,dz=T.z-g.z,d=Math.hypot(dx,dy,dz);if(d<.8||T.done){T.done=true;g.tgt=null;}else{const v=Math.min(d,18*dt);g.x+=dx/d*v;g.y+=dy/d*v;g.z+=dz/d*v;g.ry=Math.atan2(dx,dz);}continue;}
    g.a+=g.w*dt;let cx=g.cx,cz=g.cz,h=g.h;if(g.follow){cx=g.follow.x;cz=g.follow.z;h=8+g.r*.1;}
    const r=g.follow?8+g.r*.2:g.r;const nx=cx+Math.cos(g.a)*r,nz=cz+Math.sin(g.a)*r,ny=h+Math.sin(t*.5+g.a)*2;
    g.ry=Math.atan2(nx-g.x,nz-g.z);const k=Math.min(1,dt*2);g.x=lerp(g.x,nx,k);g.y=lerp(g.y,ny,k);g.z=lerp(g.z,nz,k);}},
 feed(T){const L=this.gulls.map(g=>[g,Math.hypot(g.x-T.x,g.z-T.z)]).sort((a,b)=>a[1]-b[1]).slice(0,7);for(const[g]of L)g.tgt=T;return L.length;},
 // ---------- çiz ----------
 draw(cam,P){const near=(x,z,r)=>{const dx=x-cam[0],dz=z-cam[2];return dx*dx+dz*dz<r*r;};const t=this.t;
  GL.draw(this.staticM,IDENT);
  for(const n of this.npc){if(!near(n.x,n.z,230))continue;const y=groundY(n.x,n.z),sw=n.stop>0?0:Math.sin(n.ph)*.45;
    const base=Mat.trs(n.x,y+.87+Math.abs(Math.cos(n.ph))*.03,n.z,n.ry);GL.draw(this.bodies[n.b],Mat.trs(n.x,y+Math.abs(Math.cos(n.ph))*.03,n.z,n.ry));
    GL.tint(n.pants);GL.draw(this.leg,Mat.mul(base,Mat.trs(-.11,0,0,0,sw)));GL.draw(this.leg,Mat.mul(base,Mat.trs(.11,0,0,0,-sw)));GL.tint([1,1,1]);}
  for(const c of this.cats){if(!near(c.x,c.z,120))continue;GL.tint(c.col);const y=groundY(c.x,c.z)+(c.st==='walk'?Math.abs(Math.sin(t*8))*.02:0);
    GL.draw(this.catM,c.st==='sleep'?Mat.trs(c.x,y-.04,c.z,c.ry,0,1,1.3):Mat.trs(c.x,y,c.z,c.ry));}GL.tint([1,1,1]);
  for(const l of this.lines)GL.draw(l.m,Mat.trs(l.x,l.y,l.z,l.ry,l.roll,1));
  GL.draw(this.tramM,Mat.trs(this.tram.x,this.tram.y,this.tram.z,this.tram.ry));
  for(const c of this.traffic)if(near(c.x,c.z,350))GL.draw(c.m,Mat.trs(c.x,c.y,c.z,c.ry));
  for(const c of this.bridgeCars)GL.draw(c.m,Mat.trs(c.x,64.05,-1000+c.lane,c.lane>0?Math.PI/2:-Math.PI/2));
  for(const b of this.fishBoats)GL.draw(this.fishBoatM,Mat.trs(b.x,Math.sin(t*1.2+b.ph)*.18,b.z,Math.PI/2,Math.sin(t+b.ph)*.04,1,Math.sin(t*1.3+b.ph)*.05));
  for(const g of this.gulls){if(!near(g.x,g.z,400))continue;const f=Math.sin(g.fl)*.6;GL.draw(this.gullB,Mat.trs(g.x,g.y,g.z,g.ry,0,1.4));
    GL.draw(this.gullW,Mat.trs(g.x,g.y,g.z,g.ry,0,1.4,f));GL.draw(this.gullW,Mat.trs(g.x,g.y,g.z,g.ry+Math.PI,0,1.4,f));}}
};
