'use strict';
const CIS={x:3000,y:-200,z:3000};   // Yerebatan iç mekânı (yeraltı, harita dışı)
const GALATA={x:10,z:-300,top:0};

function galataTower(mb){const {x,z}=GALATA,g=groundY(x,z)-1,st=[.74,.69,.6];GALATA.top=g+40.6;
  mb.lathe(x,g,z,[[9.6,0],[9.1,40]],24,st,.15);
  for(let k=0;k<5;k++)for(let i=0;i<8;i++){const a=i/8*TAU+k*.4;mb.box(x+Math.cos(a)*9.3,g+6+k*6.5,z+Math.sin(a)*9.3,.6,2.2,1.1,C.dark,.5,-a);}
  mb.box(x,g,z+9.1,3,4.5,1.2,C.wood);
  mb.cyl(x,g+40,z,11.6,.6,28,st,.2);mb.cyl(x,g+40.6,z,11.5,1.1,28,C.dark,.1,11.5,false);
  mb.lathe(x,g+40.6,z,[[8.3,0],[8.3,7]],24,st,.2);for(let i=0;i<16;i++){const a=i/16*TAU;mb.box(x+Math.cos(a)*8.35,g+42,z+Math.sin(a)*8.35,.3,3.4,1.6,[.3,.3,.32],.9,-a);}
  mb.cyl(x,g+47.6,z,9.2,.5,24,st);mb.lathe(x,g+48,z,[[9,0],[5,7],[0,15]],24,C.leadD,.15);alem(mb,x,g+63,z,.8);
  COL.circ(x,z,9.7,g-1,g+39);}

function galataBridge(mb){const x=-15,gS=groundY(x,-30),gN=groundY(x,-178);
  deck(x,-102.5,22,115,0,5);deck(x,-37.5,22,15,0,5,gS);deck(x,-169,22,18,0,gN,5);
  mb.box(x,4.4,-102.5,22,.6,115,[.62,.62,.6]);mb.box(x,4.5,-102.5,10,.02,115,C.asph);
  const ramp=(z0,z1,y0,y1)=>{mb.quad([x-11,y0,z0],[x+11,y0,z0],[x+11,y1,z1],[x-11,y1,z1],[.62,.62,.6]);};ramp(-45,-30,5,gS+.05);ramp(-178,-160,gN+.05,5);
  mb.box(x,-.5,-102.5,19,4.6,108,[.75,.72,.66],2);
  for(let z=-150;z<=-55;z+=19){mb.cyl(x-7,-8,z,1.4,8,8,C.stoneD);mb.cyl(x+7,-8,z,1.4,8,8,C.stoneD);}
  for(const s of[-1,1]){mb.box(x+s*11,5,-102.5,.25,1.1,145,[.35,.4,.38]);COL.box(x+s*11.3,-102.5,.6,146,0,3,8);
    for(let z=-170;z<=-35;z+=15){mb.cyl(x+s*10.5,5,z,.12,6,5,[.3,.32,.3]);mb.box(x+s*10,10.8,z,1.4,.25,.5,C.lamp,1);}}
  for(const s of[-.8,.8])mb.box(x+s,4.52,-102.5,.12,.06,140,[.6,.6,.62]);}

function bosphorusBridge(mb,L){const z=-1000,DY=64,TW=113,xa=285,xb=545,st=[.8,.8,.78];
  for(const tx of[xa,xb]){const g=groundY(tx,z)-2;for(const s of[-1,1]){mb.box(tx,g,z+s*12,3.5,TW-g,3.5,st,.1);COL.box(tx,z+s*12,3.5,3.5);}
    for(const h of[DY-4,90,TW-2])mb.box(tx,h,z,3,3,27,st,.1);}
  mb.box(415,DY-3,z,690,3,26,st,.05);mb.box(415,DY,z,690,.05,20,C.asph);for(const s of[-1,1])mb.box(415,DY,z+s*12.5,690,1.2,.3,st);
  for(const px of[90,130,170,210,250,590,630,670,710,750]){const g=groundY(px,z)-1;if(g>0)mb.box(px,g,z,5,DY-3-g,14,[.7,.7,.68]);}
  const cab=(xx)=>{if(xx<xa)return lerp(DY+1,TW,Math.pow((xx-120)/(xa-120),1.6));if(xx>xb)return lerp(DY+1,TW,Math.pow((710-xx)/(710-xb),1.6));const t=(xx-(xa+xb)/2)/((xb-xa)/2);return DY+6+(TW-DY-6)*t*t;};
  for(const s of[-1,1]){const zz=z+s*12;let prev=null;
    for(let xx=120;xx<=710;xx+=10){const p=[xx,cab(xx),zz];if(prev)mb.beam(prev,p,.35,[.75,.75,.75]);prev=p;
      if(xx%20===0&&cab(xx)>DY+3)mb.beam([xx,DY,zz],p,.06,[.7,.7,.7]);
      L.box(xx,p[1]+.35,zz,1.2,.4,.4,[1,1,1],1);}
    for(let xx=85;xx<=745;xx+=6)L.box(xx,DY+1.3,zz+s*.3,.8,.3,.3,[1,1,1],1);}}

function kizKulesi(mb){const x=555,z=60,wc=[.94,.92,.86],E=.35;
  mb.lathe(x,-7,z,[[15,0],[13.5,6],[13,8.2],[0,8.2]],20,[.5,.47,.42]);deck(x,z,24,24,0,1.25);
  mb.box(x+2,1.2,z,14,7,9,wc,E);mb.roof(x+2,8.2,z,14.5,9.5,2.5,C.lead);COL.box(x+2,z,14,9,0,-2,9);
  mb.box(x-6,1.2,z,6.5,17,6.5,wc,E);COL.box(x-6,z,6.5,6.5,0,-2,18);mb.lathe(x-6,18.2,z,[[3.6,0],[3.4,4.5],[3.9,5]],8,wc,.5);
  for(let i=0;i<8;i++){const a=i/8*TAU;mb.box(x-6+Math.cos(a)*3.5,19,z+Math.sin(a)*3.5,.25,2.6,1.3,[.25,.28,.3],.9,-a);}
  mb.lathe(x-6,23.2,z,[[4,0],[0,7]],8,C.lead,.2);alem(mb,x-6,30,z,.5);
  mb.cyl(x+7,8.2,z-3,.1,7,4,C.dark);mb.box(x+7,13.5,z-3+1.3,.05,1.6,2.4,C.red,.3);
  for(let i=0;i<10;i++)mb.box(x-4+i*1.6,4,z+4.55,.8,1.8,.1,C.dark,2);
  mb.box(570,1.2,60,8,.5,8,[.55,.5,.44]);deck(570,60,8,8,0,1.75);}

function piers(mb){for(const k in PIERS){const p=PIERS[k];if(k==='kizkulesi')continue;const y=1.8;
  deck(p.x,p.z,p.w,p.d,0,y);mb.box(p.x,y-.7,p.z,p.w,.7,p.d,[.55,.5,.44]);
  for(let i=-1;i<=1;i+=2)for(let j=-1;j<=1;j+=2)mb.cyl(p.x+i*(p.w/2-1),-6,p.z+j*(p.d/2-1),.6,7.2,6,C.stoneD);
  const cw=Math.min(p.w,p.d)*.5,cl=Math.max(p.w,p.d)*.45,rx=p.w>p.d?cl:cw,rz=p.w>p.d?cw:cl;
  for(const a of[-1,1])for(const b of[-1,1])mb.cyl(p.x+a*rx*.45,y,p.z+b*rz*.45,.2,4.2,6,[.3,.35,.35]);
  mb.box(p.x,y+4.2,p.z,rx,.4,rz,[.85,.82,.75],.2);mb.roof(p.x,y+4.6,p.z,rx+.6,rz+.6,2.4,C.lead);
  mb.box(p.x,y+3.4,p.z,rx*.9,.25,.25,C.lamp,1);
  for(let i=0;i<4;i++)mb.cyl(p.x-p.w/2+2+i*(p.w-4)/3,y,p.z+(p.w>p.d?-p.d/2+.6:0)+0,.25,.6,6,C.dark);}}

function dolmabahce(mb){const X=270,Z=-620,g=groundY(X,Z),wc=[.95,.93,.88],E=.35;mb.at(X,g,Z,0);
  mb.box(0,-1,0,26,16,150,wc,E);COL.lbox(mb,0,0,26,150,g-2,g+16);mb.box(0,15,0,27,1,151,[.85,.82,.75],E);
  mb.box(0,-1,0,38,25,38,wc,E);mb.dome(0,24,0,15,C.leadD,.2,.5,24);alem(mb,0,31.5,0,.8);COL.lbox(mb,0,0,38,38,g-2,g+24);
  for(let z=-72;z<=72;z+=4)for(const s of[-1,1]){mb.box(s*13.2,0,z,.8,14,.8,[.98,.97,.94],E);}
  for(let z=-70;z<=70;z+=4)for(const lv of[3,9])for(const s of[-1,1])mb.box(s*13.1,lv,z+2,.2,3,1.6,C.dark,2);
  mb.box(-30,0,40,24,.05,60,[.32,.48,.24]);mb.cyl(-30,0,40,4,.8,16,C.marble);mb.cyl(-30,.1,40,3.6,.8,16,C.water,.1);
  mb.at();const cx=268,cz=-525,cg=groundY(cx,cz);
  [[5.5,8],[4.6,7],[3.8,6],[3,5]].reduce((y,[w,h])=>{mb.box(cx,y,cz,w,h,w,wc,E);return y+h;},cg-1);
  for(let i=0;i<4;i++){const a=i*Math.PI/2;vdisc(mb,cx+Math.sin(a)*1.95,cg+19.5,cz+Math.cos(a)*1.95,1.2,a,[.98,.98,.92],.6);}
  mb.dome(cx,cg+25,cz,1.8,C.leadD,.2,1,10);alem(mb,cx,cg+26.8,cz,.4);COL.box(cx,cz,5.5,5.5);}

function taksim(mb){const x=-200,z=-738,g=groundY(x,z);
  mb.box(x,g,z,12,1.2,12,C.marble);mb.box(x,g+1.2,z,8,1.6,8,C.marble);for(const s of[-1,1])mb.box(x+s*3,g+2.8,z,1.8,10,5,C.marble);
  mb.box(x,g+12.8,z,8,1.8,5.4,C.marble);for(const s of[-1,1])for(const t of[-1,1])mb.box(x+s*1.2,g+2.8,z+t*3.2,1,2.2,.8,[.3,.24,.16]);
  mb.box(x,g+2.8,z+3.1,1.2,2.6,1,[.3,.24,.16]);mb.box(x,g+2.8,z-3.1,1.2,2.6,1,[.3,.24,.16]);COL.box(x,z,12,12);
  mb.box(x+.1,g+14.6,z,.1,1.2,2,C.red,.3);
  const ax=-145,az=-770,ag=groundY(ax,az);mb.box(ax,ag-1,az,50,19,25,[.2,.18,.18],2);mb.box(ax,ag+18,az,52,1,27,[.55,.2,.16],.4);COL.box(ax,az,50,25);
  mosque(mb,{key:'taksimcami',x:-238,z:-705,ry:Math.PI,S:11,H:11,R:7,dk:.95,col:[.88,.86,.8],min:[[-9,-9,32,1],[9,-9,32,1]]});}

function haydarpasa(mb){const x=700,z=405,g=groundY(x,z),wc=[.82,.72,.58],E=.3;
  mb.box(x,g-1,z,50,21,18,wc,2);mb.box(x,g+19,z,51,1,19,[.7,.6,.48]);mb.gable(x,g+20,z,50,18,5,[.35,.36,.4],0,wc);COL.box(x,z,50,18);
  for(const s of[-1,1]){mb.box(x+s*25,g-1,z,8,28,8,wc,E);mb.lathe(x+s*25,g+27,z,[[5.2,0],[3,6],[0,13]],4,[.3,.32,.36],.1,Math.PI/4,Math.PI/4+TAU);}}

function rumeli(mb){const st=[.72,.68,.6];const T=[[240,-1365,10,30],[245,-1440,11,28],[195,-1405,9,26]];
  for(const[x,z,r,h]of T){const g=groundY(x,z)-3;mb.lathe(x,g,z,[[r+.5,0],[r,h]],18,st,.15);mb.lathe(x,g+h,z,[[r+.3,0],[0,r*1.1]],18,C.leadD);COL.circ(x,z,r+.5);}
  for(let i=0;i<3;i++){const a=T[i],b=T[(i+1)%3];const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/4);
    for(let k=1;k<n;k++){const x=lerp(a[0],b[0],k/n),z=lerp(a[1],b[1],k/n),g=groundY(x,z)-2;mb.box(x,g,z,4.3,13,3,st,.1,Math.atan2(b[0]-a[0],b[1]-a[1])+Math.PI/2);mb.box(x,g+13,z,1.5,1.4,3,st);COL.circ(x,z,2.4);}}}

function bull(mb){const x=725,z=290,g=groundY(x,z),b=[.28,.22,.16];mb.box(x,g,z,4.5,1,2.5,C.stoneD);COL.box(x,z,4.5,2.5);
  mb.box(x,g+2,z,3.2,1.5,1.4,b);mb.box(x+1.9,g+2.4,z,1,1,.9,b);for(const s of[-1,1]){mb.beam([x+2.1,g+3.3,z+s*.4],[x+2.4,g+3.9,z+s*.9],.1,[.8,.75,.6]);
  for(const t of[-1,1])mb.box(x+t*1.2,g+1,z+s*.5,.35,1.1,.35,b);}mb.beam([x-1.6,g+3.2,z],[x-2.3,g+1.8,z],.08,b);}

function hotel(mb){const x=-60,z=290,g=groundY(x,z);mb.box(x,g-1,z,14,14,12,[.86,.78,.64],2);mb.roof(x,g+13,z,14.5,12.5,3,C.tile);
  mb.box(x+7.05,g+9,z,.2,1.4,6,[.8,.1,.1],1);mb.box(x+7.05,g,z,.2,3,2.4,C.wood);COL.box(x,z,14,12);}

function istiklalRails(mb){const r=ROADS.find(q=>q.n==='İstiklal Caddesi').p;
  for(const off of[-.55,.55]){const pts=[];for(let i=0;i<r.length-1;i++){const a=r[i],b=r[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.ceil(L/4),ux=(b[1]-a[1])/L,uz=-(b[0]-a[0])/L;
      for(let k=0;k<=n;k++){const x=lerp(a[0],b[0],k/n)+ux*off,z=lerp(a[1],b[1],k/n)+uz*off;pts.push([x,groundY(x,z)+.17,z]);}}mb.ribbon(pts,.12,[.7,.7,.72]);}}

function cistern(mb){const {x,y,z}=CIS,W=70,D=44,H=9,st=[.55,.48,.4];
  mb.box(x,y-1.5,z,W,.9,D,[.12,.25,.28],.25);mb.box(x,y+H,z,W+2,1,D+2,st);
  mb.box(x,y-2,z-D/2-.5,W+2,H+3,1,st);mb.box(x,y-2,z+D/2+.5,W+2,H+3,1,st);mb.box(x-W/2-.5,y-2,z,1,H+3,D,st);mb.box(x+W/2+.5,y-2,z,1,H+3,D,st);
  COL.box(x,z-D/2-.5,W+2,1,0,-250,0);COL.box(x,z+D/2+.5,W+2,1,0,-250,0);COL.box(x-W/2-.5,z,1,D,0,-250,0);COL.box(x+W/2+.5,z,1,D,0,-250,0);
  for(let i=-6;i<=6;i++)for(let j=-4;j<=4;j++){const cx=x+i*5.2,cz=z+j*4.8;mb.cyl(cx,y-1.5,cz,.42,H+1.5,8,[.62,.56,.48]);mb.box(cx,y+H-.8,cz,1.2,.8,1.2,[.58,.52,.44]);
    if(i<6)mb.box(cx+2.6,y+H-.4,cz,4.4,.4,.5,st);if(j<4)mb.box(cx,y+H-.4,cz+2.4,.5,.4,4,st);
    if((i+j)%2===0)mb.box(cx,y-.6,cz+.5,.3,.3,.3,[1,.55,.2],1);
    COL.circ(cx,cz,.5,y-3,y+H);}
  const dk=[.4,.28,.18],wz=z+2.4;mb.box(x,y-.45,wz,W-4,.15,3,dk);deck(x,wz,W-4,3,0,y-.3);mb.box(x+28.6,y-.45,z-7,3,.15,18.8,dk);deck(x+28.6,z-7,3,18.8,0,y-.3);
  for(const s of[-1,1]){mb.box(x,y-.3,wz+s*1.5,W-4,.9,.08,dk);}
  const mx=x+30,mz=z-17;for(const[k,rot]of[[-2.5,0],[2.5,1]]){mb.cyl(mx+k,y-1.5,mz,.5,2,8,[.55,.5,.44]);
    mb.box(mx+k,y+.5,mz,1.6,1.6,1.3,[.5,.46,.4]);mb.box(mx+k+(rot?.0:.3),y+(rot?1.3:.7),mz+.66,.25,.2,.05,C.dark);mb.box(mx+k-(rot?.0:.3),y+(rot?.9:.7),mz+.66,.25,.2,.05,C.dark);
    mb.box(mx+k,y+.5,mz+.66,1.1,.3,.05,[.3,.4,.3]);mb.box(mx+k,y+.5,mz+.7,.9,.15,.05,[1,.6,.3],1);}
  mb.box(x-W/2+.5,y-.3,z+2.4,3,3,6,st);}

function buildLandmarks2(mb,L){galataTower(mb);galataBridge(mb);bosphorusBridge(mb,L);kizKulesi(mb);piers(mb);dolmabahce(mb);taksim(mb);
  haydarpasa(mb);rumeli(mb);bull(mb);hotel(mb);istiklalRails(mb);cistern(mb);}
