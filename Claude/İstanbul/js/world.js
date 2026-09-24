'use strict';
// ================= coğrafya =================
// x: doğu, z: güney (kuzey = -z). 1 birim ≈ 1 metre (şehir sıkıştırılmış ölçekte)
const WX0=-1400,WX1=1400,WZ0=-1704,WZ1=800,STEP=8;
const bosX=z=>470+60*Math.sin(z*0.002), bosW=z=>130+30*Math.sin(z*0.003+1);
const ghZ=x=>-100+25*Math.sin(x*0.004), ghW=x=>Math.max(22,55-Math.max(0,-x-600)*0.03);
const marZ=x=>400+50*Math.sin(x*0.0025+0.5);
function waterDist(x,z){let d=Math.abs(x-bosX(z))-bosW(z);if(x<bosX(z))d=Math.min(d,Math.abs(z-ghZ(x))-ghW(x));return Math.min(d,marZ(x)-z);}
const gau=(x,z,cx,cz,r,h)=>h*Math.exp(-((x-cx)**2+(z-cz)**2)/(r*r));
function rawH(x,z){const d=waterDist(x,z);if(d<0)return Math.max(-14,-2.5+d*0.25);
  let h=6+8*(0.5+0.5*Math.sin(x*0.006+1)*Math.cos(z*0.005))+3*Math.sin(x*0.013+z*0.011);
  h+=gau(x,z,1000,-420,190,72)+gau(x,z,-120,-560,260,22)+gau(x,z,80,180,140,6)+gau(x,z,-250,40,130,14)+gau(x,z,950,50,320,25)
   +gau(x,z,-100,-1300,420,30)+gau(x,z,250,-1300,220,28)+gau(x,z,800,-900,300,40)+gau(x,z,-700,120,300,18);
  return 1.6+smooth(0,90,d)*h;}

// ================= önemli yerler =================
const LM={
  ayasofya:{n:'Ayasofya',x:140,z:150,pad:62,ph:40},
  sultanahmet:{n:'Sultanahmet Camii',x:85,z:270,pad:72,ph:45},
  hipodrom:{n:'Hipodrom & Dikilitaş',x:-15,z:260,pad:60,ph:20},
  topkapi:{n:'Topkapı Sarayı',x:245,z:45,pad:78,ph:25},
  yerebatan:{n:'Yerebatan Sarnıcı',x:80,z:135,pad:12,ph:4},
  kapali:{n:'Kapalıçarşı',x:-160,z:160,pad:66,ph:10},
  misir:{n:'Mısır Çarşısı',x:-75,z:20,pad:42,ph:8},
  yenicami:{n:'Yeni Cami',x:5,z:15,pad:38,ph:30},
  suleymaniye:{n:'Süleymaniye Camii',x:-250,z:25,pad:62,ph:45},
  galataKopru:{n:'Galata Köprüsü',x:-15,z:-100,pad:0,ph:5},
  galata:{n:'Galata Kulesi',x:10,z:-300,pad:28,ph:50},
  istiklal:{n:'İstiklal Caddesi',x:-110,z:-550,pad:0,ph:6},
  taksim:{n:'Taksim Meydanı',x:-200,z:-738,pad:46,ph:8},
  dolmabahce:{n:'Dolmabahçe Sarayı',x:270,z:-620,pad:86,ph:15},
  ortakoy:{n:'Ortaköy Camii',x:298,z:-935,pad:26,ph:20},
  kopru:{n:'15 Temmuz Şehitler Köprüsü',x:415,z:-1000,pad:0,ph:80},
  kizkulesi:{n:'Kız Kulesi',x:555,z:60,pad:0,ph:15},
  uskudar:{n:'Mihrimah Sultan Camii',x:660,z:-90,pad:30,ph:25},
  kadikoy:{n:'Kadıköy Boğa Heykeli',x:725,z:290,pad:28,ph:3},
  camlica:{n:'Çamlıca Camii',x:1000,z:-420,pad:72,ph:60},
  haydarpasa:{n:'Haydarpaşa Garı',x:700,z:405,pad:30,ph:20},
  rumeli:{n:'Rumeli Hisarı',x:225,z:-1400,pad:45,ph:25},
};
const PADS=[];
function initPads(){for(const k in LM){const l=LM[k];if(l.pad>0)PADS.push({x:l.x,z:l.z,r:l.pad,h:rawH(l.x,l.z)});}
  // ek düzlükler
  [[-15,190,30],[120,215,26],[20,-40,30],[-5,-195,18],[640,-140,26],[260,-935,22],[20,-320,22]].forEach(p=>PADS.push({x:p[0],z:p[1],r:p[2],h:rawH(p[0],p[1])}));
  // çekirdekleri kesişen düzlükleri aynı yüksekliğe çek
  const par=PADS.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i]));
  for(let i=0;i<PADS.length;i++)for(let j=i+1;j<PADS.length;j++){const a=PADS[i],b=PADS[j];if(Math.hypot(a.x-b.x,a.z-b.z)<a.r+b.r)par[f(i)]=f(j);}
  const grp={};PADS.forEach((p,i)=>{(grp[f(i)]=grp[f(i)]||[]).push(p);});
  for(const k in grp){const g=grp[k],h=g.reduce((s,p)=>s+p.h*p.r,0)/g.reduce((s,p)=>s+p.r,0);g.forEach(p=>p.h=h);}}
function H(x,z){let h=rawH(x,z);if(h<0.5)return h;
  let core=null,cq=1;for(const p of PADS){const d=Math.hypot(x-p.x,z-p.z);if(d<p.r+30)h=lerp(h,p.h,smooth(p.r+30,p.r,d));if(d<p.r&&d/p.r<cq){cq=d/p.r;core=p;}}return core?core.h:h;}

// ================= ızgara yükseklik =================
const NX=(WX1-WX0)/STEP+1,NZ=(WZ1-WZ0)/STEP+1;let HG=null;
function buildHG(){initPads();HG=new Float32Array(NX*NZ);for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++)HG[j*NX+i]=H(WX0+i*STEP,WZ0+j*STEP);}
function groundY(x,z){const fx=(x-WX0)/STEP,fz=(z-WZ0)/STEP;const i=Math.floor(fx),j=Math.floor(fz);
  if(i<0||j<0||i>=NX-1||j>=NZ-1)return rawH(x,z);const u=fx-i,v=fz-j,k=j*NX+i;
  const h00=HG[k],h10=HG[k+1],h01=HG[k+NX],h11=HG[k+NX+1];
  return u>v?h00+u*(h10-h00)+v*(h11-h10):h00+v*(h01-h00)+u*(h11-h01);}

// ================= yollar =================
const ROADS=[
 {p:[[110,195],[60,175],[0,165],[-60,168],[-104,168]],w:9,k:'c',n:'Divan Yolu'},
 {p:[[-218,160],[-300,160],[-420,150],[-600,160]],w:10,k:'a',n:'Ordu Caddesi'},
 {p:[[110,195],[90,110],[70,60],[50,10],[40,-25]],w:9,k:'a',n:'Alemdar Caddesi'},
 {p:[[-250,-40],[-100,-38],[-15,-30],[100,-26],[160,-12]],w:11,k:'a',n:'Eminönü Sahil'},
 {p:[[-15,-178],[-12,-220],[0,-275]],w:7,k:'c',n:'Galata Kulesi Sokak'},
 {p:[[8,-328],[-12,-362],[-35,-390]],w:7,k:'c',n:'Galip Dede Caddesi'},
 {p:[[-35,-390],[-70,-470],[-110,-550],[-150,-630],[-185,-705]],w:11,k:'c',n:'İstiklal Caddesi'},
 {p:[[-15,-180],[60,-175],[130,-170],[220,-220],[280,-320],[285,-450],[248,-535],[228,-620],[238,-700],[280,-800],[275,-900],[270,-1000],[290,-1200],[270,-1400],[280,-1600]],w:12,k:'a',n:'Sahil Yolu'},
 {p:[[-182,-730],[-80,-700],[60,-660],[160,-630],[226,-620]],w:12,k:'a',n:'İnönü Caddesi'},
 {p:[[-205,-770],[-180,-900],[-150,-1100],[-100,-1300],[0,-1350],[100,-1420]],w:14,k:'a',n:'Cumhuriyet Caddesi'},
 {p:[[305,120],[300,250],[250,360],[100,395],[-100,380],[-300,360],[-600,340],[-900,330]],w:12,k:'a',n:'Kennedy Caddesi'},
 {p:[[-15,180],[-15,340]],w:16,k:'p',n:'At Meydanı'},
 {p:[[110,195],[150,210],[200,215],[300,250]],w:8,k:'c',n:'Kabasakal Caddesi'},
 {p:[[-222,158],[-232,110],[-248,82]],w:7,k:'c',n:'Süleymaniye Yokuşu'},
 {p:[[610,-400],[615,-250],[612,-150],[640,0],[656,120],[668,200],[680,300],[700,380]],w:11,k:'a',n:'Üsküdar Sahil'},
 {p:[[615,-150],[700,-200],[820,-300],[930,-390],[970,-415]],w:9,k:'a',n:'Çamlıca Yolu'},
 {p:[[680,300],[800,290],[950,250],[1150,200]],w:9,k:'a',n:'Bahariye'},
 {p:[[680,300],[720,200],[800,100],[900,0]],w:8,k:'a',n:'Kadıköy İç Yol'},
 {p:[[-250,-40],[-500,-45],[-800,-35],[-1100,-10],[-1350,10]],w:10,k:'a',n:'Haliç Sahil'},
 {p:[[-300,160],[-400,40],[-500,-45]],w:8,k:'a',n:'Fatih Yolu'},
 {p:[[-600,160],[-700,40],[-800,-35]],w:8,k:'c',n:'Balat Sokak'},
 {p:[[-80,-700],[-60,-900],[0,-1050],[120,-1100],[270,-1000]],w:9,k:'a',n:'Barbaros Bulvarı'},
];
const SEGS=[];
function initRoads(){for(const r of ROADS)for(let i=0;i<r.p.length-1;i++){const a=r.p[i],b=r.p[i+1];SEGS.push({ax:a[0],az:a[1],bx:b[0],bz:b[1],w:r.w,r});}}
function roadInfo(x,z){let best=1e9,ang=0,seg=null;for(const s of SEGS){const dx=s.bx-s.ax,dz=s.bz-s.az,l2=dx*dx+dz*dz;
  let t=((x-s.ax)*dx+(z-s.az)*dz)/l2;t=clamp(t,0,1);const d=Math.hypot(x-(s.ax+dx*t),z-(s.az+dz*t))-s.w/2;
  if(d<best){best=d;ang=Math.atan2(dx,dz);seg=s;}}return{d:best,ang,seg};}

// ================= parklar =================
const PARKS=[[165,15,25],[120,215,20],[200,-800,60],[-20,-620,45],[250,-1480,70],[720,-360,70],[950,-380,110],[-245,-800,22],[-800,150,60],[420,-1300,0],[-40,-1000,70]];
function parkF(x,z){let f=0;for(const p of PARKS){if(p[2]>0)f=Math.max(f,smooth(p[2]+6,p[2]-4,Math.hypot(x-p[0],z-p[1])));}return f;}

// ================= iskeleler =================
// deck: iskele yüzeyi. dock: vapurun yanaştığı nokta, ry: vapur ekseni
const PIERS={
 eminonu:{n:'Eminönü',x:60,z:-47,w:90,d:30,dock:[[85,-68.5,Math.PI/2],[30,-68.5,Math.PI/2]]},
 karakoy:{n:'Karaköy',x:100,z:-138,w:60,d:28,dock:[[100,-117.5,Math.PI/2]]},
 uskudar:{n:'Üsküdar',x:596,z:-130,w:28,d:44,dock:[[575.5,-130,0]]},
 kadikoy:{n:'Kadıköy',x:654,z:280,w:28,d:44,dock:[[633.5,280,0]]},
 salacak:{n:'Salacak',x:632,z:60,w:20,d:10,dock:[[618,60,0]]},
 kizkulesi:{n:'Kız Kulesi',x:570,z:60,w:8,d:8,dock:[[577,60,0]]},
};

// ================= çarpışma & zeminler =================
const COL={S:40,g:new Map(),st:0,
  add(o,R){const i0=Math.floor((o.x-R)/this.S),i1=Math.floor((o.x+R)/this.S),j0=Math.floor((o.z-R)/this.S),j1=Math.floor((o.z+R)/this.S);
    for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*100003+j;let a=this.g.get(k);if(!a)this.g.set(k,a=[]);a.push(o);}return o;},
  box(x,z,w,d,ry=0,y0=-50,y1=500,when){return this.add({t:0,x,z,hw:w/2,hd:d/2,c:Math.cos(ry),s:Math.sin(ry),y0,y1,when,m:0},Math.hypot(w,d)/2);},
  circ(x,z,r,y0=-50,y1=500,when){return this.add({t:1,x,z,r,y0,y1,when,m:0},r);},
  // yerel kutu (mb.at dönüşümüyle)
  lbox(mb,lx,lz,w,d,y0,y1,when){const p=mb.W(lx,lz);return this.box(p[0],p[1],w,d,mb.ry,y0,y1,when);},
  resolve(p,rad){this.st++;const i=Math.floor(p.x/this.S),j=Math.floor(p.z/this.S);let hit=false;
    for(let a=i-1;a<=i+1;a++)for(let b=j-1;b<=j+1;b++){const L=this.g.get(a*100003+b);if(!L)continue;
      for(const o of L){if(o.m===this.st)continue;o.m=this.st;if(p.y>o.y1-0.35||p.y+1.7<o.y0)continue;if(o.when&&!o.when())continue;
        if(o.t===1){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+rad;if(d<m&&d>1e-6){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m;hit=true;}}
        else{const dx=p.x-o.x,dz=p.z-o.z;let lx=dx*o.c-dz*o.s,lz=dx*o.s+dz*o.c;const ex=o.hw+rad-Math.abs(lx),ez=o.hd+rad-Math.abs(lz);
          if(ex>0&&ez>0){if(ex<ez)lx+=Math.sign(lx||1)*ex;else lz+=Math.sign(lz||1)*ez;p.x=o.x+lx*o.c+lz*o.s;p.z=o.z-lx*o.s+lz*o.c;hit=true;}}}}
    return hit;}};
const DECKS=[];
function deck(x,z,w,d,ry,y0,y1=y0){DECKS.push({x,z,hw:w/2,hd:d/2,c:Math.cos(ry),s:Math.sin(ry),y0,y1});}
function surfaceY(x,z,cur){const g=groundY(x,z);let best=g>0.3?g:-Infinity;
  for(const k of DECKS){const dx=x-k.x,dz=z-k.z,lx=dx*k.c-dz*k.s,lz=dx*k.s+dz*k.c;
    if(Math.abs(lx)<=k.hw&&Math.abs(lz)<=k.hd){const y=k.y0+(k.y1-k.y0)*(lz+k.hd)/(2*k.hd);if(y<=cur+1.3&&y>best)best=y;}}
  return best;}

// ================= semt adları =================
const DIST=[['Sultanahmet',110,200,160],['Eminönü',0,0,90],['Beyazıt',-190,150,110],['Süleymaniye',-250,30,80],['Karaköy',60,-180,70],
 ['Galata',10,-300,70],['Beyoğlu',-90,-500,150],['Taksim',-200,-740,90],['Dolmabahçe',250,-620,100],['Beşiktaş',200,-780,120],['Ortaköy',280,-930,90],
 ['Üsküdar',650,-130,140],['Salacak',650,60,70],['Kadıköy',720,290,130],['Haydarpaşa',700,400,50],['Çamlıca',960,-400,190],['Balat',-800,0,220],
 ['Fatih',-500,150,260],['Levent',-100,-1300,280],['Rumeli Hisarı',265,-1400,110],['Kuzguncuk',640,-520,150],['Sirkeci',120,-5,50],['Tophane',200,-300,80]];
function districtAt(x,z){if(groundY(x,z)<0.3){if(z>marZ(x)-25)return'Marmara Denizi';if(x<bosX(z)-bosW(z)+15&&Math.abs(z-ghZ(x))<ghW(x)+10)return'Haliç';return'İstanbul Boğazı';}
  let best=null,bd=1;for(const d of DIST){const q=Math.hypot(x-d[1],z-d[2])/d[3];if(q<bd){bd=q;best=d[0];}}
  return best||(x>bosX(z)?'Anadolu Yakası':'Avrupa Yakası');}

// ================= zemin ve yol mesh'i =================
function buildTerrain(){buildHG();initRoads();const mb=new MB(),R=RNG(7);
  const nrm=(i,j)=>{const g=(a,b)=>HG[clamp(b,0,NZ-1)*NX+clamp(a,0,NX-1)];const dx=g(i+1,j)-g(i-1,j),dz=g(i,j+1)-g(i,j-1);const l=Math.hypot(dx,2*STEP,dz);return[-dx/l,2*STEP/l,-dz/l];};
  for(let j=0;j<NZ;j++)for(let i=0;i<NX;i++){const x=WX0+i*STEP,z=WZ0+j*STEP,h=HG[j*NX+i];let c;
    if(h<0.9){c=mixC([.62,.58,.45],[.16,.24,.25],clamp(-h/10,0,1));}
    else{const n=Math.sin(x*.05)*Math.cos(z*.07)*.04+(R()-.5)*.05;c=[.6+n,.57+n,.51+n];
      const far=Math.max(smooth(-1050,-1450,z),smooth(1050,1350,x),smooth(-950,-1350,x),smooth(900,1200,Math.hypot(x-1000,z+420)*0));
      const pk=Math.max(parkF(x,z),far*.8,smooth(40,70,h)*.6);c=mixC(c,[.3+n,.44+n,.22+n],pk);
      if(waterDist(x,z)<5)c=[.68,.66,.62];}
    mb.vert([x,h,z],nrm(i,j),c,0);}
  for(let j=0;j<NZ-1;j++)for(let i=0;i<NX-1;i++){const a=j*NX+i;mb.idx.push(a,a+1,a+NX+1,a,a+NX+1,a+NX);}
  mb.n=NX*NZ;return mb;}
function buildRoads(){const mb=new MB();
  const col={a:C.asph,c:C.cobble,p:[.72,.68,.6]};
  for(const r of ROADS){const pts=[];for(let i=0;i<r.p.length-1;i++){const a=r.p[i],b=r.p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/4));
      for(let k=0;k<n;k++){const t=k/n,x=lerp(a[0],b[0],t),z=lerp(a[1],b[1],t);pts.push([x,0,z]);}}
    const e=r.p[r.p.length-1];pts.push([e[0],0,e[1]]);
    const land=pts.map(p=>[p[0],Math.max(groundY(p[0],p[2]),0.3)+0.12,p[2]]);
    if(r.k==='a'){mb.ribbon(land.map(p=>[p[0],p[1]-0.03,p[2]]),r.w+4,[.62,.6,.57]);mb.ribbon(land,r.w,col.a);
      for(let i=0;i<land.length-1;i+=3)mb.ribbon([[land[i][0],land[i][1]+.02,land[i][2]],[land[i+1][0],land[i+1][1]+.02,land[i+1][2]]],.25,[.85,.85,.8]);}
    else mb.ribbon(land,r.w,col[r.k]);}
  // meydanlar
  const plaza=(x,z,rad,c)=>{const seg=28,ring=5;for(let k=0;k<ring;k++)for(let s=0;s<seg;s++){const r0=rad*k/ring,r1=rad*(k+1)/ring,a0=s/seg*TAU,a1=(s+1)/seg*TAU;
      const P=(r,a)=>{const px=x+Math.cos(a)*r,pz=z+Math.sin(a)*r;return[px,groundY(px,pz)+0.1,pz];};mb.quad(P(r0,a0),P(r1,a0),P(r1,a1),P(r0,a1),c);}};
  plaza(120,215,24,[.74,.7,.62]);plaza(-200,-738,40,[.7,.67,.62]);plaza(20,-40,26,[.7,.67,.62]);plaza(10,-300,22,[.66,.62,.56]);
  plaza(640,-140,22,[.7,.67,.62]);plaza(725,290,20,[.7,.67,.62]);plaza(260,-935,18,[.7,.67,.62]);plaza(-15,190,22,[.72,.68,.6]);
  return mb;}
