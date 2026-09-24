'use strict';
// ================= satıcılar / etkileşim noktaları =================
const SPOTS=[
 {t:'simit',x:105,z:205,ry:0},{t:'simit',x:0,z:-20,ry:0},{t:'simit',x:40,z:-190,ry:0},{t:'simit',x:-85,z:-519,ry:0},{t:'simit',x:705,z:310,ry:0},
 {t:'cay',x:642,z:90,ry:Math.PI/2,n:'Salacak Sahil Çay Bahçesi'},{t:'cay',x:150,z:232,ry:0,n:'Sultanahmet Çay Bahçesi'},
 {t:'balik',x:-81,z:-47.5,ry:0},{t:'dondurma',x:-123,z:-594,ry:0},{t:'doner',x:-157,z:-663,ry:0},{t:'kumpir',x:255,z:-945,ry:0},
 {t:'kahve',x:30,z:153,ry:0,n:'Divan Yolu Kahvecisi'},{t:'kahve',x:745,z:318,ry:0,n:'Kadıköy Kahvecisi'},{t:'doviz',x:60,z:190,ry:0},
 {t:'ikart',x:45,z:-36},{t:'ikart',x:80,z:-160},{t:'ikart',x:606,z:-112},{t:'ikart',x:664,z:262},{t:'ikart',x:638,z:52},{t:'ikart',x:-42,z:-398},{t:'ikart',x:-178,z:-712},
 {t:'midye',x:110,z:-184},{t:'kestane',x:-185,z:-720},{t:'bufe',x:26,z:-288},{t:'kokorec',x:760,z:305},{t:'kostum',x:95,z:218},
 {t:'hali',x:-190,z:157,ng:1},{t:'nazar',x:-170,z:163,ng:1},{t:'lamba',x:-140,z:157,ng:1},{t:'kuyumcu',x:-120,z:163,ng:1},{t:'carsicay',x:-160,z:146,ng:1},
 {t:'baharat',x:-90,z:17.5,ng:1},{t:'lokum',x:-60,z:22.5,ng:1},
];

function stand(mb,s){const x=s.x,z=s.z,g=groundY(x,z),ry=s.ry||0;mb.at(x,g,z,ry);
  const cart=(col,top)=>{mb.box(0,.4,0,1.8,1,1,col,.1);for(const a of[-.7,.7])mb.cyl(a,0,.55,.35,.12,8,C.dark);mb.box(0,1.4,0,1.6,.8,.9,[.8,.9,.95],.3);top&&top();COL.circ(x,z,1.2,g-1,g+3);};
  switch(s.t){
  case'simit':cart(C.red,()=>{for(let i=0;i<5;i++)mb.cyl(-.6+i*.3,1.5,0,.14,.06,8,[.7,.42,.18]);});mb.cyl(.9,0,0,.05,2.8,4,C.dark);mb.lathe(.9,2.6,0,[[1.4,0],[0,.6]],8,[.9,.2,.15]);break;
  case'cay':for(let i=0;i<4;i++){const tx=(i%2)*3-1.5,tz=Math.floor(i/2)*3-1.5;mb.cyl(tx,0,tz,.5,.7,8,C.wood);for(const a of[-.9,.9])mb.box(tx+a,0,tz,.4,.4,.4,[.6,.2,.2]);}
    mb.box(0,0,-4,3,1.1,1,C.wood);mb.lathe(.6,1.1,-4,[[.3,0],[.35,.4],[.2,.7],[.1,.9]],8,[.8,.6,.3],.2);for(let i=0;i<4;i++)mb.lathe(-.8+i*.3,1.1,-4,[[.05,0],[.07,.12],[.05,.15]],6,[.8,.3,.1],.3);COL.box(x,z-4,3,1,ry);break;
  case'balik':mb.box(0,0,0,4,1,1.4,C.wood);for(let i=0;i<3;i++){mb.box(-3+i*3,0,2.5,1.2,.7,1.2,[.9,.8,.2]);for(const a of[-1,1])mb.box(-3+i*3+a,0,2.5,.4,.45,.4,[.2,.4,.7]);}COL.box(x,z,4,1.4,ry);break;
  case'dondurma':cart([.95,.8,.2],()=>{mb.box(0,1.8,0,1.9,.15,1.1,C.red,.2);for(let i=0;i<3;i++)mb.cyl(-.5+i*.5,1.55,0,.2,.35,8,[.95,.95,.9]);});mb.cyl(-.8,0,.3,.05,3,4,C.dark);mb.lathe(-.8,2.8,.3,[[1.3,0],[0,.5]],8,[.9,.1,.1]);break;
  case'doner':mb.box(0,-.5,-1.5,6,4.5,3,[.85,.75,.55],.2);mb.box(0,3,-.1,6.2,.8,.3,[.8,.1,.1],.8);mb.lathe(1.5,1,-.1,[[.35,0],[.5,.3],[.45,1.3],[.3,1.5]],10,[.55,.3,.15],.4);mb.cyl(1.5,.9,-.1,.04,1.8,4,C.dark);COL.box(x,z-1.5,6,3,ry);break;
  case'kumpir':for(let i=0;i<3;i++){mb.box(-3+i*3,0,0,2.6,1,1.2,[.95,.95,.9]);for(let k=0;k<5;k++)mb.box(-3.9+i*3+k*.45,1,0,.35,.12,.7,[[.9,.2,.1],[.2,.6,.2],[.95,.85,.2],[.9,.5,.1],[.6,.2,.5]][k]);}mb.box(0,2.6,0,9,.2,2,[.9,.2,.2],.3);for(const a of[-4.3,4.3])mb.cyl(a,0,.8,.06,2.6,4,C.dark);COL.box(x,z,9,1.4,ry);break;
  case'kahve':for(let i=0;i<3;i++){mb.cyl(-3+i*3,0,1.5,.45,.7,8,C.wood);mb.box(-3+i*3,0,2.4,.8,.45,.4,[.45,.2,.1]);}mb.box(0,0,-1,5,1.1,1,C.wood);mb.box(0,2.8,.5,7,.15,4,[.25,.15,.1]);COL.box(x,z-1,5,1,ry);break;
  case'doviz':mb.box(0,0,0,3,2.8,2.2,[.9,.88,.84],.1);mb.box(0,2.2,1.12,2.6,.5,.05,[.1,.7,.3],1);mb.box(0,0,1.12,1,2,.05,C.glass,.3);COL.box(x,z,3,2.2,ry);break;
  case'ikart':mb.box(0,0,0,.8,1.9,.5,[.1,.35,.75],.15);mb.box(0,1.1,.26,.5,.4,.02,[.6,.9,1],1);COL.box(x,z,.8,.5,ry);break;
  case'midye':mb.cyl(0,0,0,.5,.8,8,C.wood);mb.cyl(0,.8,0,.8,.12,12,[.85,.85,.8]);for(let i=0;i<10;i++)mb.box(Math.cos(i)*.5,.92,Math.sin(i)*.5,.18,.08,.1,[.1,.1,.12]);mb.box(0,.92,0,.2,.2,.2,[.95,.9,.2]);COL.circ(x,z,.8);break;
  case'kestane':cart([.3,.3,.32],()=>{mb.box(0,1.85,0,1.2,.1,.7,[1,.4,.1],1);});break;
  case'kokorec':mb.box(0,-.5,-1.5,5,4,3,[.7,.7,.72],2);mb.box(0,1,-.1,2,.2,.2,[.6,.35,.2]);mb.box(0,2.8,-.1,5.2,.6,.3,[.95,.8,.1],.8);COL.box(x,z-1.5,5,3,ry);break;
  case'bufe':mb.box(0,0,0,3,2.6,2.4,[.2,.5,.7],.2);mb.box(0,2.6,0,3.4,.2,2.8,[.9,.9,.9]);mb.box(0,1,1.21,2.4,1,.03,C.glass,.3);COL.box(x,z,3,2.4,ry);break;
  case'kostum':mb.box(0,0,-1.5,4,2.8,.2,[.6,.1,.15],.2);mb.box(-1.2,0,.5,.3,1.4,.3,C.dark);mb.box(-1.2,1.3,.5,.6,.4,.4,C.dark);mb.cyl(1.4,0,0,.3,1.9,6,C.red);mb.cyl(1.4,1.9,0,.25,.35,6,C.red);COL.box(x,z-1.5,4,.3,ry);break;
  }mb.at();}

// ================= şehir dokusu =================
const PAL={def:[[.93,.88,.78],[.9,.82,.68],[.86,.72,.6],[.95,.93,.88],[.82,.78,.72],[.9,.78,.62],[.78,.66,.55]],
  bal:[[.9,.45,.45],[.95,.8,.35],[.35,.65,.65],[.95,.6,.3],[.7,.55,.8],[.8,.3,.25],[.5,.75,.55]],
  mod:[[.75,.77,.8],[.6,.65,.7],[.85,.85,.83],[.5,.55,.6]],gl:[[.35,.48,.58],[.3,.4,.5],[.55,.62,.7]]};
function buildCity(mb){const R=RNG(42);let n=0;
  const EX=[];for(const k in LM){const l=LM[k];if(l.pad>0)EX.push([l.x,l.z,l.pad*.9]);}
  EX.push([-60,290,12],[-40,190,14],[-40,150,5],[268,-525,8],[-145,-770,30],[-238,-705,30],[80,135,8],[120,215,24],[-15,-210,12],[10,-300,26],[415,-1000,0]);
  for(const k in PIERS){const p=PIERS[k];EX.push([p.x,p.z,Math.max(p.w,p.d)*.6]);}
  for(const s of SPOTS)if(!s.ng)EX.push([s.x,s.z,6]);
  const bbX=[[80,280],[640,780]];
  for(let gz=WZ0+30;gz<WZ1-20;gz+=17)for(let gx=WX0+30;gx<WX1-30;gx+=17){
    const x=gx+(R()-.5)*7,z=gz+(R()-.5)*7;const d=waterDist(x,z);if(d<10)continue;
    const lev=Math.hypot(x+80,z+1320)<300;
    if(z<-1450&&!lev&&R()<.8)continue;if(parkF(x,z)>.15)continue;
    let w=8+R()*8,dp=8+R()*7,h=7+R()*9;
    const bal=Math.hypot(x+800,z)<260,bey=Math.hypot(x+100,z+500)<280,asia=x>bosX(z),kad=Math.hypot(x-760,z-250)<250;
    if(lev){if(R()<.55)continue;w=14+R()*12;dp=14+R()*10;h=28+R()*85;}else if(bey||kad)h=11+R()*12;else if(asia)h=8+R()*14;else if(bal)h=7+R()*6;
    const ri=roadInfo(x,z),half=Math.hypot(w,dp)/2;if(ri.d<half*.8+2.2)continue;
    let bad=false;for(const e of EX)if(Math.hypot(x-e[0],z-e[1])<e[2]+half){bad=true;break;}if(bad)continue;
    if(Math.abs(z+1000)<20&&x>60&&x<780)continue;
    const ang=ri.d<40?ri.ang:Math.sin(x*.004)*.4+Math.cos(z*.005)*.3;
    const c=Math.cos(ang),s=Math.sin(ang);let gmin=1e9,gmax=-1e9;
    for(const[a,b]of[[-1,-1],[1,-1],[1,1],[-1,1],[0,0]]){const gy=groundY(x+a*w/2*c+b*dp/2*s,z-a*w/2*s+b*dp/2*c);gmin=Math.min(gmin,gy);gmax=Math.max(gmax,gy);}
    if(gmin<.4)continue;const base=gmin-1,top=gmax+h;
    const pal=lev?(R()<.6?PAL.gl:PAL.mod):bal?PAL.bal:(asia&&R()<.3)||bey&&R()<.25?PAL.mod:PAL.def;const col=pal[Math.floor(R()*pal.length)];
    mb.box(x,base,z,w,top-base,dp,col,2,ang,true);
    if(!lev&&R()<.68){mb.roof(x,top,z,w+.8,dp+.8,2+R()*1.6,R()<.8?C.tile:C.tileD,ang);}
    else{mb.box(x,top,z,w+.3,.6,dp+.3,[col[0]*.85,col[1]*.85,col[2]*.85],0,ang,true);if(!lev&&R()<.5)mb.cyl(x+(R()-.5)*w*.4,top+.6,z+(R()-.5)*dp*.4,.9,1.6,8,[.85,.85,.88]);
      if(lev&&R()<.5)mb.cyl(x,top,z,.15,8,4,[.8,.2,.2],1);}
    if(!lev&&R()<.35){const bx=x+s*(dp/2+.5),bz=z+c*(dp/2+.5);mb.box(bx,top-h*.55,bz,w*.6,.2,1,[.3,.3,.3],0,ang);}
    COL.box(x,z,w,dp,ang,base-1,top+3);n++;}
  // yol ağaçları ve lambalar
  let li=0;for(const r of ROADS){if(r.k==='p')continue;for(let i=0;i<r.p.length-1;i++){const a=r.p[i],b=r.p[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;
    for(let t=8;t<L-4;t+=13){li++;const side=li%2?1:-1,off=r.w/2+1.3,x=a[0]+ux*t-uz*off*side,z=a[1]+uz*t+ux*off*side;const g=groundY(x,z);if(g<.5)continue;
      if(li%2===0||r.k==='c'){mb.cyl(x,g,z,.09,5.5,5,[.2,.22,.22]);mb.box(x+uz*side*.6,g+5.5,z-ux*side*.6,1.2,.12,.12,[.2,.22,.22],0,Math.atan2(uz,-ux));mb.box(x+uz*side*1.1,g+5.2,z-ux*side*1.1,.5,.3,.5,C.lamp,1);}
      else if(r.n==='Kennedy Caddesi'||r.n==='Sahil Yolu'||r.n==='Barbaros Bulvarı'||r.n==='Üsküdar Sahil'){const x2=a[0]+ux*t-uz*(off+1.5)*side,z2=a[1]+uz*t+ux*(off+1.5)*side;if(groundY(x2,z2)>.5&&roadInfo(x2,z2).d>1)tree(mb,x2,z2,R()<.5?'pl':'pi',.7+R()*.3);}}}}
  // parklar
  for(const p of PARKS){if(!p[2])continue;const N=Math.floor(p[2]*p[2]/90);for(let i=0;i<N;i++){const a=R()*TAU,r=Math.sqrt(R())*p[2],x=p[0]+Math.cos(a)*r,z=p[1]+Math.sin(a)*r;
    if(waterDist(x,z)<4||roadInfo(x,z).d<2)continue;let bad=false;for(const e of EX)if(Math.hypot(x-e[0],z-e[1])<e[2]*.9){bad=true;break;}if(bad)continue;
    const k=R();tree(mb,x,z,k<.35?'cy':k<.7?'pl':'pi',.8+R()*.5);}}
  // kuzey ormanı ve sırtlar
  for(let i=0;i<900;i++){const x=WX0+R()*(WX1-WX0),z=WZ0+R()*500;if(waterDist(x,z)<8||roadInfo(x,z).d<3||Math.hypot(x+80,z+1320)<320)continue;tree(mb,x,z,R()<.6?'pi':'pl',1+R()*.6,false);}
  for(const s of SPOTS)if(!s.ng)stand(mb,s);
  return n;}
