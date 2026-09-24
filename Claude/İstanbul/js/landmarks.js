'use strict';
// İç mekân bölgeleri (ziyaret algılama)
const INTERIORS=[];
function addInterior(key,mb,lx,lz,hw,hd){const p=mb.W(lx,lz);INTERIORS.push({key,x:p[0],z:p[1],c:mb.c,s:mb.s,hw,hd});}
function insideI(it,x,z){const dx=x-it.x,dz=z-it.z,lx=dx*it.c-dz*it.s,lz=dx*it.s+dz*it.c;return Math.abs(lx)<it.hw&&Math.abs(lz)<it.hd;}

// ---------- ağaçlar ----------
function tree(mb,x,z,k='pl',s=1,col=true){const y=groundY(x,z)-0.2;
  if(k==='cy'){mb.cyl(x,y,z,.25*s,1.5*s,5,C.wood);mb.lathe(x,y+1*s,z,[[0,0],[1.2*s,1.5*s],[1.1*s,6*s],[.5*s,9*s],[0,10.5*s]],7,C.cypress);}
  else if(k==='pi'){mb.cyl(x,y,z,.35*s,9*s,5,C.wood,0,.25*s);mb.lathe(x,y+8*s,z,[[0,0],[4.5*s,.8*s],[4.8*s,1.8*s],[3*s,2.8*s],[0,3.1*s]],9,[.2,.36,.18]);}
  else{mb.cyl(x,y,z,.45*s,4*s,6,C.wood,0,.3*s);const g=[.24+Math.sin(x)*.04,.42,.2];
    mb.lathe(x,y+3.5*s,z,[[0,0],[3*s,1.2*s],[3.6*s,3.5*s],[2.6*s,5.6*s],[0,6.4*s]],9,g);
    mb.lathe(x+1.8*s,y+5*s,z+.8*s,[[0,0],[2*s,.9*s],[2.2*s,2.4*s],[0,3.8*s]],8,[g[0]*.9,g[1]*.95,g[2]]);}
  if(col)COL.circ(x,z,.6*s,y-1,y+8*s);}

// dikey disk (madalyon, saat)
function vdisc(mb,x,y,z,r,ry,col,e=0,seg=20){const c=Math.cos(ry),s=Math.sin(ry);const P=a=>[x+Math.cos(a)*r*c,y+Math.sin(a)*r,z-Math.cos(a)*r*s];
  for(let i=0;i<seg;i++)mb.tri([x,y,z],P(i/seg*TAU),P((i+1)/seg*TAU),col,e);}
// yuvarlak delikli döşeme (kubbe altı)
function ringSlab(mb,R,Sx,Sz,y,th,col,e){const N=64;for(let i=0;i<N;i++){const a0=i/N*TAU,a1=(i+1)/N*TAU;
  const q=a=>{const c=Math.cos(a),s=Math.sin(a),d=Math.min(Sx/Math.max(Math.abs(c),1e-4),Sz/Math.max(Math.abs(s),1e-4));return[c,s,d];};
  const A=q(a0),B=q(a1);for(const yy of[y,y+th])mb.quad([A[0]*R,yy,A[1]*R],[A[0]*A[2],yy,A[1]*A[2]],[B[0]*B[2],yy,B[1]*B[2]],[B[0]*R,yy,B[1]*R],col,e);
  mb.quad([A[0]*R,y,A[1]*R],[B[0]*R,y,B[1]*R],[B[0]*R,y+th,B[1]*R],[A[0]*R,y+th,A[1]*R],col,e);}}
function alem(mb,x,y,z,s=1){mb.lathe(x,y,z,[[.35*s,0],[.2*s,1.2*s],[.55*s,1.6*s],[.5*s,2.1*s],[.12*s,2.5*s],[0,3.2*s]],8,C.gold,.4);}
function minaret(mb,lx,lz,h,ser,col,dc,r=1.2){mb.box(lx,-.5,lz,r*2.9,5,r*2.9,col,.2);
  mb.lathe(lx,4.5,lz,[[r*1.3,0],[r*1.1,2],[r,h-4.5]],12,col,.2);
  for(let i=0;i<ser;i++){const y=h*(.55+.35*(ser>1?i/(ser-1):1))-2;mb.cyl(lx,y,lz,r*1.65,.6,12,col,.25);mb.cyl(lx,y+.6,lz,r*1.6,.9,12,col,.5,r*1.6,false);}
  const w=mb.W(lx,lz);COL.circ(w[0],w[1],r*1.5);mb.cyl(lx,h,lz,r*.85,3,10,col,.2);mb.lathe(lx,h+3,lz,[[r*1.1,0],[r*.9,2],[0,9*r/1.2]],12,dc,.15);alem(mb,lx,h+3+9*r/1.2,lz,.7);}

// ---------- genel cami ----------
function mosque(mb,o){const gy=groundY(o.x,o.z);mb.at(o.x,gy,o.z,o.ry||0);
  const Sx=o.Sx||o.S,Sz=o.Sz||o.S,H=o.H,R=o.R,T=1.6,D=o.door||6,DH=Math.min(9,H*.55),col=o.col,dc=o.dc||C.lead,ic=o.ic||C.stone,dH=o.drum||3,dk=o.dk||.9,E=o.e??.2;
  const y0=gy-2,y1=gy+H;
  // platform
  mb.box(0,-3,0,2*Sx+4,3,2*Sz+4,C.stoneD);
  // duvarlar
  mb.box(0,0,Sz-T/2,2*Sx,H,T,col,E);COL.lbox(mb,0,Sz-T/2,2*Sx,T,y0,y1);
  for(const s of[-1,1]){mb.box(s*(Sx-T/2),0,0,T,H,2*Sz,col,E);COL.lbox(mb,s*(Sx-T/2),0,T,2*Sz,y0,y1);
    const w=Sx-D/2,cx=s*(D/2+w/2);mb.box(cx,0,-Sz+T/2,w,H,T,col,E);COL.lbox(mb,cx,-Sz+T/2,w,T,y0,y1);
    mb.box(s*(D/2+.8),0,-Sz-.4,1.6,DH+2.5,1.4,C.stoneD,E);}
  mb.box(0,DH,-Sz+T/2,D,H-DH,T,col,E);mb.box(0,DH+1,-Sz-.4,D+3.2,1.6,1.4,C.stoneD,E);
  // iç kaplama
  const L=.12;mb.box(0,0,Sz-T-L/2,2*Sx-2*T,H,L,ic);for(const s of[-1,1]){mb.box(s*(Sx-T-L/2),0,0,L,H,2*Sz-2*T,ic);mb.box(s*(D/2+(Sx-T-D/2)/2),0,-Sz+T+L/2,Sx-T-D/2,H,L,ic);}
  // pencereler
  const winC=[.18,.2,.25],wE=.7;for(const lvl of[.3,.62]){const wy=H*lvl;
    for(let i=-Math.floor(Sx/6);i<=Math.floor(Sx/6);i++){if(Math.abs(i*6)<D&&lvl<.5)continue;mb.box(i*6,wy,Sz+.05,2,3,.2,winC,wE);mb.box(i*6,wy,-Sz-.05,2,3,.2,winC,wE);}
    for(let i=-Math.floor(Sz/6);i<=Math.floor(Sz/6);i++){mb.box(Sx+.05,wy,i*6,.2,3,2,winC,wE);mb.box(-Sx-.05,wy,i*6,.2,3,2,winC,wE);}}
  // çatı, kasnak, kubbe
  ringSlab(mb,R,Sx,Sz,H,1.2,col,E);mb.box(0,H+1.2,Sz-.5,2*Sx,1.2,1,col,E);mb.box(0,H+1.2,-Sz+.5,2*Sx,1.2,1,col,E);
  mb.box(Sx-.5,H+1.2,0,1,1.2,2*Sz,col,E);mb.box(-Sx+.5,H+1.2,0,1,1.2,2*Sz,col,E);
  mb.cyl(0,H,0,R,dH,32,col,E,R,false);for(let i=0;i<20;i++){const a=i/20*TAU;mb.box(Math.cos(a)*(R+.05),H+dH*.25,Math.sin(a)*(R+.05),1,dH*.5,1,winC,wE,-a);}
  mb.dome(0,H+dH,0,R+.3,dc,E,dk,28);mb.dome(0,H+dH,0,R-.2,o.dic||ic,.1,dk,28);alem(mb,0,H+dH+(R+.3)*dk,0,1.2);
  if(o.half===4||o.half===2){const hs=o.half===4?[[0,1],[0,-1],[1,0],[-1,0]]:[[0,1],[0,-1]];
    for(const[a,b]of hs){const p0=b===1?0:b===-1?Math.PI:a===1?-Math.PI/2:Math.PI/2;
      mb.dome(a*R*.55,H+.6,b*R*.55,R*(o.hr||.85),dc,E,dk*.8,18,p0,p0+Math.PI);mb.dome(a*R*.55,H+.6,b*R*.55,R*(o.hr||.85)*.4,dc,E,dk*.8,10,p0,p0+Math.PI);}}
  if(o.corner){for(const a of[-1,1])for(const b of[-1,1]){mb.cyl(a*Sx*.72,H+1.2,b*Sz*.72,Sx*.16,1.5,12,col,E);mb.dome(a*Sx*.72,H+2.7,b*Sz*.72,Sx*.16,dc,E,.9,12);}}
  if(o.turret){for(const a of[-1,1])for(const b of[-1,1]){const tx=a*(R+2),tz=b*(R+2);mb.cyl(tx,H+1.2,tz,1.7,5,10,col,E);mb.dome(tx,H+6.2,tz,1.8,dc,E,1,10);alem(mb,tx,H+8,tz,.4);}}
  if(o.buttress){for(const a of[-1,1])for(const b of[-.6,.6]){mb.box(a*(Sx+3),0,b*Sz,6,H*.85,9,col,E);COL.lbox(mb,a*(Sx+3),b*Sz,6,9,y0,y1);mb.roof(a*(Sx+3),H*.85,b*Sz,6,9,3,col);}}
  // iç mekân
  const iw=2*Sx-2*T,id=2*Sz-2*T;mb.box(0,.01,0,iw,.06,id,o.carpet||C.carpet);
  for(let z=-Sz+T+1;z<Sz-T-1;z+=1.8)mb.box(0,.07,z,iw-.4,.02,.35,o.carpet2||C.carpet2);
  mb.box(0,0,Sz-T-.4,3.4,6.5,.8,[.88,.82,.66],.1);mb.box(0,.4,Sz-T-.85,2,4.5,.2,C.gold,.3);
  mb.box(4.5,0,Sz-T-4,1.2,3.5,6,C.marble);mb.lathe(4.5,3.5,Sz-T-1.6,[[.7,0],[0,3]],4,C.lead);
  const cr=R*.72,cy=4.8;for(let i=0;i<32;i++){const a=i/32*TAU;mb.box(Math.cos(a)*cr,cy,Math.sin(a)*cr,.35,.45,.35,C.lamp,1);}
  for(let i=0;i<8;i++){const a=i/8*TAU;mb.beam([Math.cos(a)*cr,cy,Math.sin(a)*cr],[Math.cos(a)*cr*.4,H+dH,Math.sin(a)*cr*.4],.03,C.dark);}
  if(o.pillars){const pr=o.pr||2.4;for(const a of[-1,1])for(const b of[-1,1]){const px=a*R*.78,pz=b*R*.78;
    if(o.pillars==='sq'){mb.box(px,0,pz,pr*2,H,pr*2,o.pc||ic);COL.lbox(mb,px,pz,pr*2,pr*2,y0,y1);}
    else{mb.cyl(px,0,pz,pr,H,16,o.pc||ic);mb.cyl(px,H*.7,pz,pr*1.1,1,16,C.gold,.1);const w=mb.W(px,pz);COL.circ(w[0],w[1],pr,y0,y1);}}}
  if(o.roundels){for(const a of[-1,1])for(const b of[-1,1])vdisc(mb,a*(Sx-T-.3),H*.55,b*Sz*.45,3.2,Math.PI/2,[.1,.22,.15],.05);}
  // minareler
  for(const m of o.min||[])minaret(mb,m[0],m[1],m[2],m[3],m[4]||col,dc,m[5]||1.2);
  addInterior(o.key,mb,0,0,Sx-T,Sz-T);
  // avlu
  if(o.court){const Cc=o.court,cz=-Sz-Cc,wh=6;mb.box(0,0,cz,2*Cc,.08,2*Cc,C.marble);
    const wall=(lx,lz,w,d)=>{mb.box(lx,0,lz,w,wh,d,col,E);COL.lbox(mb,lx,lz,w,d,y0,gy+wh);};
    wall(-Cc,cz,1.4,2*Cc);wall(Cc,cz,1.4,2*Cc);const gw=5;wall(-(Cc+gw/2)/2,cz-Cc,Cc-gw/2,1.4);wall((Cc+gw/2)/2,cz-Cc,Cc-gw/2,1.4);
    mb.box(0,4.6,cz-Cc,gw+2,wh-4.6+1.5,1.8,col,E);
    const port=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),n=Math.round(L/5),ux=(bx-ax)/L,uz=(bz-az)/L;
      for(let i=0;i<n;i++){const t=(i+.5)*L/n,px=ax+ux*t,pz=az+uz*t;mb.dome(px,5.4,pz,2.2,dc,E,.8,10);mb.cyl(px-uz*2.1-ux*2.4,0,pz+ux*2.1-uz*2.4,.3,5.2,6,C.marble);}
      mb.box((ax+bx)/2,5,(az+bz)/2,Math.abs(bx-ax)+4.4,.5,Math.abs(bz-az)+4.4,col,E);};
    port(-Cc+2.4,cz-Cc+2.4,-Cc+2.4,cz+Cc-2.4);port(Cc-2.4,cz-Cc+2.4,Cc-2.4,cz+Cc-2.4);port(-Cc+4.8,cz-Cc+2.4,Cc-4.8,cz-Cc+2.4);port(-Cc+4.8,-Sz-2.4,Cc-4.8,-Sz-2.4);
    mb.cyl(0,0,cz,3.2,1,8,C.marble);for(let i=0;i<8;i++){const a=i/8*TAU;mb.cyl(Math.cos(a)*3,1,cz+Math.sin(a)*3,.2,3,5,C.marble);}
    mb.cyl(0,4,cz,3.6,.5,8,dc);mb.dome(0,4.5,cz,3.4,dc,E,.7,8);const sw=mb.W(0,cz);COL.circ(sw[0],sw[1],3.3,y0,gy+5);}
  mb.at();}

// ---------- hipodrom ----------
function hippodrome(mb){const x=-15,g=z=>groundY(x,z);
  mb.box(x,g(240)-.5,240,4.4,3.2,4.4,C.marble);mb.lathe(x,g(240)+2.7,240,[[1.45,0],[1.05,19],[0,21.5]],4,[.72,.55,.5],.15,Math.PI/4,Math.PI/4+TAU);COL.box(x,240,4.6,4.6);
  mb.box(x,g(265)-.5,265,2.4,1.5,2.4,C.stone);mb.lathe(x,g(265)+1,265,[[.55,0],[.7,1.5],[.5,3],[.65,4.5],[.4,5.5]],8,[.33,.28,.2]);COL.circ(x,265,1.4);
  mb.box(x,g(292)-.5,292,4,2.5,4,C.stoneD);mb.lathe(x,g(292)+2,292,[[1.9,0],[1.25,24],[0,26.5]],4,[.6,.55,.48],.1,Math.PI/4,Math.PI/4+TAU);COL.box(x,292,4.2,4.2);
  const fy=g(195);mb.cyl(x,fy,195,4.2,.8,8,C.marble);for(let i=0;i<8;i++){const a=i/8*TAU;mb.cyl(x+Math.cos(a)*3.6,fy+.8,195+Math.sin(a)*3.6,.3,4,6,[.3,.45,.35]);}
  mb.cyl(x,fy+4.8,195,4.4,.6,8,[.85,.8,.7]);mb.dome(x,fy+5.4,195,4,[.35,.55,.45],.2,.8,8);COL.circ(x,195,4.2);
  for(let z=185;z<335;z+=14)for(const s of[-9,9])tree(mb,x+s,z,'pl',.8);}

// ---------- Topkapı ----------
function topkapi(mb){const X=245,Z=45,gy=groundY(X,Z),y0=gy-2;mb.at(X,gy,Z,0);const wc=[.8,.75,.64],E=.15;
  const W=(lx,lz,w,d,h=9,c=wc)=>{mb.box(lx,-1,lz,w,h+1,d,c,E);COL.lbox(mb,lx,lz,w,d,y0,gy+h);};
  W(0,-50,120,2.5);W(0,50,120,2.5);W(60,0,2.5,100,5);W(-60,-27.5,2.5,45);W(-60,27.5,2.5,45);
  // Bab-üs Selam
  for(const s of[-1,1]){mb.lathe(-60,-1,s*6,[[3.2,0],[3.2,15],[3.5,15.5],[3.5,16]],8,C.white,.3);mb.lathe(-60,16,s*6,[[3.6,0],[0,9]],8,C.lead,.2);alem(mb,-60,25,s*6,.6);COL.circ(X-60,Z+s*6,3.2);}
  mb.box(-60,6,0,4,5,6,C.white,.3);mb.gable(-60,11,0,6,8,2,C.lead,Math.PI/2);vdisc(mb,-62.1,8.5,0,1,Math.PI/2,C.gold,.3);
  COL.lbox(mb,-60,0,3,6,y0,gy+6,()=>!G.tix.topkapi);
  // orta duvar + Bab-üs Saadet
  W(0,-28,2,44,7);W(0,28,2,44,7);mb.box(0,6,0,8,1.5,8,C.white,.2);mb.roof(0,7.5,0,10,10,2.5,C.lead);for(const s of[-1,1])mb.cyl(-2,0,s*3,.35,6,6,C.marble);
  // Divan + Adalet Kulesi
  mb.box(-35,0,-38,22,8,10,C.white,E);for(let i=-1;i<=1;i++)mb.dome(-35+i*7,8,-38,3.5,C.lead,E,.8,12);COL.lbox(mb,-35,-38,22,10,y0,gy+8);
  mb.box(-20,0,-40,7,22,7,C.white,E);mb.lathe(-20,22,-40,[[3.6,0],[3.4,7],[3.8,7.5]],8,C.white,.3);mb.lathe(-20,29.5,-40,[[3.9,0],[1.2,7],[0,13]],8,C.lead,.2);alem(mb,-20,42.5,-40,.7);COL.lbox(mb,-20,-40,7,7,y0,gy+30);
  // mutfaklar
  mb.box(-30,0,42,50,7,7,wc,E);COL.lbox(mb,-30,42,50,7,y0,gy+7);for(let i=0;i<10;i++){const cx=-53+i*5;mb.dome(cx,7,42,2.2,C.lead,E,.8,10);mb.cyl(cx,8.6,42,.5,2.4,6,C.lead);mb.cyl(cx,11,42,.8,.3,6,C.lead);}
  // Harem, Hazine, Kütüphane, Bağdat Köşkü
  mb.box(30,0,-40,50,9,12,C.white,E);for(let i=0;i<5;i++)mb.dome(10+i*10,9,-40,3.2,C.lead,E,.8,12);COL.lbox(mb,30,-40,50,12,y0,gy+9);
  mb.box(50,0,5,12,8,38,C.white,E);for(let i=0;i<4;i++)mb.dome(50,8,-10+i*10,4.2,C.lead,E,.8,12);for(let i=0;i<8;i++)mb.cyl(43,0,-12+i*4.7,.35,6.5,6,C.marble);
  mb.box(50,6.3,5,14,.5,40,C.lead);COL.lbox(mb,50,5,12,38,y0,gy+8);
  mb.box(25,0,5,9,7,9,C.white,E);mb.dome(25,7,5,4,C.lead,E,.9,12);COL.lbox(mb,25,5,9,9,y0,gy+7);
  mb.lathe(40,0,38,[[5,0],[5,6],[8,6.5],[8.5,7],[5,7.4]],8,C.white,.3);mb.dome(40,7.4,38,4.8,[.8,.7,.45],.3,.9,12);alem(mb,40,11.8,38,.5);COL.circ(X+40,Z+38,5);
  // çimen ve ağaçlar
  mb.box(-30,0,0,56,.05,70,[.33,.47,.24]);mb.box(28,0,20,40,.05,30,[.33,.47,.24]);
  for(const p of[[-50,-18],[-45,15],[-25,-15],[-10,20],[-40,-5],[-15,-5],[15,18],[30,22],[10,32],[-50,28]])tree(mb,X+p[0],Z+p[1],'cy',1.1);
  for(const p of[[-45,-25],[-20,25],[-5,-20]])tree(mb,X+p[0],Z+p[1],'pl',1.2);
  addInterior('topkapi',mb,0,0,58,48);mb.at();}

// ---------- çarşılar ----------
function bazaar(mb,o){const gy=groundY(o.x,o.z);mb.at(o.x,gy,o.z,0);const hw=o.hw,hd=o.hd,H=o.H,y0=gy-2,y1=gy+H+1,ic=[.9,.84,.72],R=RNG(o.seed),E=.12;
  const W=(lx,lz,w,d)=>{mb.box(lx,-1,lz,w,H+1,d,o.col,E);COL.lbox(mb,lx,lz,w,d,y0,y1);};
  W(0,-hd,2*hw,1.5);W(0,hd,2*hw,1.5);for(const s of[-1,1]){const g=o.aisle/2+.5,L=hd-g;W(s*hw,-(g+L/2),1.5,L);W(s*hw,g+L/2,1.5,L);
    mb.box(s*(hw+.6),0,-g-.8,1.6,H+2,1.6,C.stoneD,E);mb.box(s*(hw+.6),0,g+.8,1.6,H+2,1.6,C.stoneD,E);mb.box(s*(hw+.6),H-1,0,1.6,3,2*g+3,C.stoneD,E);vdisc(mb,s*(hw+1.45),H,0,1,Math.PI/2*s,C.gold,.3);}
  mb.box(0,H,0,2*hw,.8,2*hd,C.leadD);const nr=o.rows,nc=Math.floor(hw/7);
  for(let r=0;r<nr;r++)for(let c=-nc;c<=nc;c++)mb.dome(c*hw/(nc+.5),H+.8,-hd+(r+.5)*2*hd/nr,Math.min(3.2,hd/nr*.9),C.lead,E,.75,10);
  mb.box(0,H-.5,0,2*hw,.3,o.aisle,ic);for(let x=-hw;x<hw;x+=6)mb.box(x,H-1.5,0,.6,1,o.aisle,(Math.round(x/6)%2?[.75,.25,.2]:[.95,.92,.85]));
  const shopCols=[[.8,.15,.1],[.1,.35,.7],[.9,.65,.1],[.15,.55,.3],[.6,.1,.45],[.95,.95,.9],[.85,.4,.1]];
  for(const s of[-1,1]){const zc=s*(o.aisle/2+(hd-o.aisle/2-1)/2),dz=hd-o.aisle/2-1.2;
    for(const[a,b]of[[-hw+1,-o.cross/2],[o.cross/2,hw-1]]){mb.box((a+b)/2,0,zc,b-a,H-.5,dz,ic);COL.lbox(mb,(a+b)/2,zc,b-a,dz,y0,y1);
      for(let x=a+2.5;x<b-2;x+=5){const c=shopCols[Math.floor(R()*shopCols.length)],fz=s*(o.aisle/2-.5);
        mb.box(x,0,fz,4.2,1.1,1.2,C.wood);
        if(o.spice){for(let k=-1;k<=1;k++)mb.lathe(x+k*1.3,1.1,fz,[[.55,0],[0,.8]],8,shopCols[Math.floor(R()*4)]);}
        else for(let k=0;k<6;k++)mb.box(x-1.6+k*.65,1.1,fz,.5,.3+R()*.9,.9,shopCols[Math.floor(R()*shopCols.length)]);
        mb.box(x,2.6,s*(o.aisle/2+.05),4.4,1.8,.1,c,.25);mb.box(x,H-2.5,s*(o.aisle/2+.2),4.6,.6,.1,[.2,.15,.1]);
        for(let k=0;k<3;k++)mb.lathe(x-1.2+k*1.2,H-3.6-R()*.8,s*(o.aisle/2-.8),[[0,0],[.3,.2],[.25,.6],[0,.7]],6,shopCols[Math.floor(R()*shopCols.length)],1);}}}
  mb.box(0,0,0,2*hw,.05,o.aisle,[.55,.5,.44]);addInterior(o.key,mb,0,0,hw,o.aisle/2+1);mb.at();}

// ---------- küçük yapılar ----------
function smallBits(mb){
  // Yerebatan girişi
  let x=80,z=135,y=groundY(x,z);mb.box(x,y-1,z,7,5.5,6,C.stone,.15);mb.roof(x,y+4.5,z,8,7,2.2,C.tile);mb.box(x-3.55,y,z,.2,3,2,C.dark,.4);COL.box(x,z,7,6);
  // Çemberlitaş sütunu
  x=-40;z=150;y=groundY(x,z);mb.box(x,y-1,z,4.5,4,4.5,C.stoneD);mb.cyl(x,y+3,z,1.7,28,14,[.45,.27,.24]);for(let i=1;i<8;i++)mb.cyl(x,y+3+i*3.5,z,1.85,.5,14,[.55,.4,.3]);COL.circ(x,z,2.4);
  // Çemberlitaş hamamı
  x=-40;z=190;y=groundY(x,z);mb.box(x,y-1,z,20,8,16,C.stone,.12);mb.dome(x-4,y+7,z,5.5,C.lead,.15,.8,14);mb.dome(x+6,y+7,z-3,3.5,C.lead,.15,.8,12);
  for(let i=0;i<14;i++)mb.box(x-9+i*1.4,y+7.2,z+5,.35,.25,.35,[.9,.9,.7],.8);mb.box(x,y,z-8.05,2.5,3.5,.2,C.wood);COL.box(x,z,20,16);
  // Sultanahmet meydanı çeşmesi
  x=120;z=215;y=groundY(x,z);mb.cyl(x,y,z,7,.7,24,C.marble);mb.cyl(x,y+.1,z,6.5,.65,24,C.water,.1,6.5,true);mb.lathe(x,y,z,[[1,0],[.6,2],[1.5,2.4],[.3,3],[.1,4.5]],10,C.marble);COL.circ(x,z,7);}

function buildLandmarks1(mb){
  mosque(mb,{key:'ayasofya',x:140,z:150,ry:Math.PI/2,Sx:34,Sz:38,H:20,R:17,dk:.55,drum:3,col:[.82,.6,.5],ic:[.78,.7,.55],dic:[.85,.7,.4],half:2,hr:1,buttress:true,
    pillars:'sq',pr:2.3,pc:[.7,.64,.55],carpet:[.12,.38,.45],carpet2:[.1,.3,.36],roundels:true,door:7,
    min:[[-40,-44,42,1,C.white,1],[40,-44,42,1,C.white,1],[-40,44,38,1,[.72,.45,.38],1.5],[40,44,38,1,[.72,.45,.38],1.5]]});
  mosque(mb,{key:'sultanahmet',x:110,z:270,ry:Math.PI/2,S:28,H:20,R:14,dk:.95,drum:4,col:[.84,.82,.78],ic:C.blueTile,dic:[.5,.65,.8],half:4,turret:true,corner:true,
    pillars:'round',pr:2.6,pc:[.9,.9,.88],court:22,
    min:[[-30,-30,58,3],[30,-30,58,3],[-30,30,58,3],[30,30,58,3],[-23.5,-73.5,50,2],[23.5,-73.5,50,2]]});
  mosque(mb,{key:'suleymaniye',x:-250,z:40,ry:0,S:30,H:22,R:15,dk:.95,drum:4,col:[.86,.83,.76],ic:[.92,.88,.78],half:2,corner:true,pillars:'round',pr:2.3,court:24,
    min:[[-25.5,-31.5,68,3],[25.5,-31.5,68,3],[-25.5,-80.5,52,2],[25.5,-80.5,52,2]]});
  mosque(mb,{key:'yenicami',x:22,z:15,ry:Math.PI/2,S:18,H:15,R:9,dk:.95,drum:3,col:[.84,.8,.72],half:4,corner:true,court:13,min:[[-15,-20,42,2],[15,-20,42,2]]});
  mosque(mb,{key:'mihrimah',x:660,z:-90,ry:Math.PI/2,S:13,H:13,R:8,dk:.95,col:[.85,.82,.75],court:8,min:[[-10,-16,36,1],[10,-16,36,1]]});
  mosque(mb,{key:'ortakoy',x:300,z:-935,ry:Math.PI/2,S:9,H:12,R:6.5,dk:1.05,drum:3,col:C.marble,e:.35,min:[[-7.5,-7.5,28,1,C.marble,.9],[7.5,-7.5,28,1,C.marble,.9]]});
  mosque(mb,{key:'camlica',x:1000,z:-420,ry:Math.PI/2,S:32,H:24,R:17,dk:.95,drum:4,col:[.9,.88,.84],ic:[.9,.86,.8],half:4,turret:true,corner:true,court:26,pillars:'round',pr:2.4,
    min:[[-35,-35,80,3],[35,-35,80,3],[-35,35,80,3],[35,35,80,3],[-27.5,-85.5,70,2],[27.5,-85.5,70,2]]});
  hippodrome(mb);topkapi(mb);smallBits(mb);
  bazaar(mb,{key:'kapali',x:-160,z:160,hw:55,hd:25,H:8,aisle:8,cross:6,rows:3,col:[.82,.78,.68],seed:3});
  bazaar(mb,{key:'misir',x:-75,z:20,hw:35,hd:9,H:8,aisle:6,cross:4,rows:1,col:[.8,.72,.6],seed:9,spice:true});}
