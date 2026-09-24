'use strict';
// ================= yardımcılar =================
const clamp=(v,a,b)=>v<a?a:v>b?b:v, lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const TAU=Math.PI*2;
function RNG(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
const mixC=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const angDiff=(a,b)=>{let d=(b-a)%TAU;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;return d;};

// ================= matris =================
const Mat={
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s;}return o;},
  persp(fy,asp,n,f){const t=1/Math.tan(fy/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(f+n)/(n-f);m[11]=-1;m[14]=2*f*n/(n-f);return m;},
  lookAt(e,c,u){let zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2];let l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;
    let xx=u[1]*zz-u[2]*zy,xy=u[2]*zx-u[0]*zz,xz=u[0]*zy-u[1]*zx;l=Math.hypot(xx,xy,xz);xx/=l;xy/=l;xz/=l;
    const yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx,m=new Float32Array(16);
    m[0]=xx;m[4]=xy;m[8]=xz;m[1]=yx;m[5]=yy;m[9]=yz;m[2]=zx;m[6]=zy;m[10]=zz;
    m[12]=-(xx*e[0]+xy*e[1]+xz*e[2]);m[13]=-(yx*e[0]+yy*e[1]+yz*e[2]);m[14]=-(zx*e[0]+zy*e[1]+zz*e[2]);m[15]=1;return m;},
  // T * Ry * Rx * Rz * S
  trs(x,y,z,ry=0,rx=0,s=1,rz=0){const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
    const a=[[cy,sy*sx,sy*cx],[0,cx,-sx],[-sy,cy*sx,cy*cx]]; // Ry*Rx
    const b=[[cz,-sz,0],[sz,cz,0],[0,0,1]],m=new Float32Array(16);
    for(let r=0;r<3;r++)for(let c=0;c<3;c++){let v=0;for(let k=0;k<3;k++)v+=a[r][k]*b[k][c];m[c*4+r]=v*s;}
    m[12]=x;m[13]=y;m[14]=z;m[15]=1;return m;},
  xform(m,x,y,z){return[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14],m[3]*x+m[7]*y+m[11]*z+m[15]];}
};

// ================= mesh oluşturucu =================
// Vertex: pos3 nor3 rgb3 e1 (e: 0..1 ışıma, 2 = pencereli cephe)
class MB{
  constructor(){this.v=[];this.idx=[];this.n=0;this.at();}
  at(x=0,y=0,z=0,ry=0){this.ox=x;this.oy=y;this.oz=z;this.c=Math.cos(ry);this.s=Math.sin(ry);this.ry=ry;return this;}
  P(x,y,z){return[this.ox+x*this.c+z*this.s,this.oy+y,this.oz-x*this.s+z*this.c];}
  N(x,y,z){return[x*this.c+z*this.s,y,-x*this.s+z*this.c];}
  W(x,z){return[this.ox+x*this.c+z*this.s,this.oz-x*this.s+z*this.c];} // yerelden dünya xz
  vert(p,n,c,e){this.v.push(p[0],p[1],p[2],n[0],n[1],n[2],c[0],c[1],c[2],e);return this.n++;}
  quad(a,b,c,d,col,e=0){const A=this.P(...a),B=this.P(...b),C=this.P(...c),D=this.P(...d);
    const ux=B[0]-A[0],uy=B[1]-A[1],uz=B[2]-A[2],vx=D[0]-A[0],vy=D[1]-A[1],vz=D[2]-A[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz)||1;const n=[nx/l,ny/l,nz/l];
    const i=this.vert(A,n,col,e);this.vert(B,n,col,e);this.vert(C,n,col,e);this.vert(D,n,col,e);
    this.idx.push(i,i+1,i+2,i,i+2,i+3);}
  tri(a,b,c,col,e=0){this.quad(a,b,c,c,col,e);}
  // x,z merkez, y taban
  box(x,y,z,w,h,d,col,e=0,ry=0,nob=false){const c=Math.cos(ry),s=Math.sin(ry);
    const P=(i,j,k)=>{const lx=(i-.5)*w,lz=(k-.5)*d;return[x+lx*c+lz*s,y+j*h,z-lx*s+lz*c];};
    this.quad(P(0,0,0),P(0,0,1),P(0,1,1),P(0,1,0),col,e);this.quad(P(1,0,0),P(1,1,0),P(1,1,1),P(1,0,1),col,e);
    if(!nob)this.quad(P(0,0,0),P(1,0,0),P(1,0,1),P(0,0,1),col,e);
    this.quad(P(0,1,0),P(0,1,1),P(1,1,1),P(1,1,0),col,e);
    this.quad(P(0,0,0),P(0,1,0),P(1,1,0),P(1,0,0),col,e);this.quad(P(0,0,1),P(1,0,1),P(1,1,1),P(0,1,1),col,e);}
  // dönel yüzey: prof=[[r,h],...] alttan üste
  lathe(x,y,z,prof,seg,col,e=0,p0=0,p1=TAU){const base=this.n,L=prof.length;
    for(let j=0;j<L;j++){const a=prof[Math.max(0,j-1)],b=prof[Math.min(L-1,j+1)];let nr=b[1]-a[1],ny=-(b[0]-a[0]);const l=Math.hypot(nr,ny)||1;nr/=l;ny/=l;
      for(let i=0;i<=seg;i++){const t=p0+(p1-p0)*i/seg,c=Math.cos(t),s=Math.sin(t),r=prof[j][0];
        this.vert(this.P(x+c*r,y+prof[j][1],z+s*r),this.N(c*nr,ny,s*nr),col,e);}}
    for(let j=0;j<L-1;j++)for(let i=0;i<seg;i++){const a=base+j*(seg+1)+i,b=a+seg+1;this.idx.push(a,b,a+1,a+1,b,b+1);}}
  cyl(x,y,z,r,h,seg,col,e=0,rt=r,cap=true){this.lathe(x,y,z,cap?[[0,0],[r,0],[r,0],[rt,h],[rt,h],[0,h]]:[[r,0],[rt,h]],seg,col,e);}
  dome(x,y,z,r,col,e=0,k=1,seg=20,p0=0,p1=TAU,rings=7){const p=[];for(let i=0;i<=rings;i++){const a=i/rings*Math.PI/2;p.push([r*Math.cos(a),r*Math.sin(a)*k]);}this.lathe(x,y,z,p,seg,col,e,p0,p1);}
  // kırma çatı
  roof(x,y,z,w,d,h,col,ry=0){const c=Math.cos(ry),s=Math.sin(ry),R=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];
    const hw=w/2,hd=d/2;if(w>=d){const r=(w-d)/2;const a=R(-r,h,0),b=R(r,h,0);
      this.quad(R(-hw,0,-hd),R(hw,0,-hd),b,a,col);this.quad(R(hw,0,hd),R(-hw,0,hd),a,b,col);
      this.tri(R(-hw,0,hd),R(-hw,0,-hd),a,col);this.tri(R(hw,0,-hd),R(hw,0,hd),b,col);}
    else{const r=(d-w)/2;const a=R(0,h,-r),b=R(0,h,r);
      this.quad(R(-hw,0,hd),R(-hw,0,-hd),a,b,col);this.quad(R(hw,0,-hd),R(hw,0,hd),b,a,col);
      this.tri(R(-hw,0,-hd),R(hw,0,-hd),a,col);this.tri(R(hw,0,hd),R(-hw,0,hd),b,col);}}
  gable(x,y,z,w,d,h,col,ry=0,colEnd){const c=Math.cos(ry),s=Math.sin(ry),R=(lx,ly,lz)=>[x+lx*c+lz*s,y+ly,z-lx*s+lz*c];const hw=w/2,hd=d/2;
    this.quad(R(-hw,0,-hd),R(hw,0,-hd),R(hw,h,0),R(-hw,h,0),col);this.quad(R(hw,0,hd),R(-hw,0,hd),R(-hw,h,0),R(hw,h,0),col);
    this.tri(R(-hw,0,hd),R(-hw,0,-hd),R(-hw,h,0),colEnd||col);this.tri(R(hw,0,-hd),R(hw,0,hd),R(hw,h,0),colEnd||col);}
  // şerit (yol, kablo): noktalar dünya/yerel
  ribbon(pts,w,col,e=0){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1];let dx=b[2]-a[2],dz=-(b[0]-a[0]);const l=Math.hypot(dx,dz)||1;dx*=w/2/l;dz*=w/2/l;
    this.quad([a[0]-dx,a[1],a[2]-dz],[a[0]+dx,a[1],a[2]+dz],[b[0]+dx,b[1],b[2]+dz],[b[0]-dx,b[1],b[2]-dz],col,e);}}
  beam(a,b,t,col,e=0){ // iki nokta arası ince kiriş
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const l=Math.hypot(dx,dy,dz);let px=-dz,pz=dx;const pl=Math.hypot(px,pz)||1;px*=t/pl;pz*=t/pl;
    this.quad([a[0]-px,a[1],a[2]-pz],[a[0]+px,a[1],a[2]+pz],[b[0]+px,b[1],b[2]+pz],[b[0]-px,b[1],b[2]-pz],col,e);
    this.quad([a[0],a[1]-t,a[2]],[a[0],a[1]+t,a[2]],[b[0],b[1]+t,b[2]],[b[0],b[1]-t,b[2]],col,e);}
}

// ================= renk paleti =================
const C={stone:[.82,.78,.70],stoneD:[.62,.58,.52],marble:[.93,.92,.88],lead:[.52,.58,.64],leadD:[.42,.47,.53],gold:[.95,.75,.3],
  tile:[.72,.33,.22],tileD:[.58,.27,.2],white:[.95,.95,.93],dark:[.12,.12,.14],glass:[.25,.35,.42],wood:[.45,.3,.18],
  red:[.75,.12,.1],green:[.25,.42,.2],cypress:[.12,.25,.14],asph:[.24,.24,.26],cobble:[.5,.46,.41],pink:[.8,.56,.47],
  carpet:[.55,.08,.1],carpet2:[.42,.05,.08],blueTile:[.35,.55,.72],lamp:[1,.85,.5],water:[.2,.45,.55]};

// ================= WebGL =================
const GL={
  init(cv){const gl=cv.getContext('webgl2',{antialias:true,preserveDrawingBuffer:true});if(!gl)throw new Error('WebGL2 desteklenmiyor');
    this.gl=gl;gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
    this.main=this.prog(VS_MAIN,FS_MAIN);this.water=this.prog(VS_WATER,FS_WATER);this.sky=this.prog(VS_SKY,FS_SKY);
    this.skyVao=gl.createVertexArray();this.waterMesh=this.upload(this.waterGrid(),true);return gl;},
  prog(vs,fs){const gl=this.gl;const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;};
    const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);
    if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
    const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i);u[a.name]=gl.getUniformLocation(p,a.name);}return{p,u};},
  upload(mb,posOnly){const gl=this.gl,vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(mb.v),gl.STATIC_DRAW);
    const st=posOnly?12:40;gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,st,0);
    if(!posOnly){gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,st,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,4,gl.FLOAT,false,st,24);}
    const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(mb.idx),gl.STATIC_DRAW);
    gl.bindVertexArray(null);return{vao,count:mb.idx.length};},
  waterGrid(){const N=128,S=40,v=[],idx=[];for(let j=0;j<=N;j++)for(let i=0;i<=N;i++)v.push((i-N/2)*S,0,(j-N/2)*S);
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;idx.push(a,a+1,a+N+2,a,a+N+2,a+N+1);}return{v,idx};},
  frame(P,V,cam,env,cb){this.P=P;this.V=V;this.cam=cam;this.env=env;this.cb=cb;},
  common(pr){const gl=this.gl,u=pr.u,e=this.env;gl.useProgram(pr.p);
    const s=(k,f,...a)=>{if(u[k]!==undefined&&u[k]!==null)gl[f](u[k],...a);};
    s('uProj','uniformMatrix4fv',false,this.P);s('uView','uniformMatrix4fv',false,this.V);s('uCam','uniform3fv',this.cam);
    s('uSun','uniform3fv',pr===this.sky?e.sun:e.light);s('uSunCol','uniform3fv',e.sunCol);s('uSkyAmb','uniform3fv',e.skyAmb);s('uGndAmb','uniform3fv',e.gndAmb);
    s('uFogCol','uniform3fv',e.hor);s('uHor','uniform3fv',e.hor);s('uTop','uniform3fv',e.top);s('uFogD','uniform1f',e.fogD);
    s('uNight','uniform1f',e.night);s('uTime','uniform1f',e.time);},
  drawSky(){const gl=this.gl,pr=this.sky,cb=this.cb;this.common(pr);gl.depthMask(false);gl.disable(gl.DEPTH_TEST);
    gl.uniform3fv(pr.u.uR,cb.r);gl.uniform3fv(pr.u.uU,cb.u);gl.uniform3fv(pr.u.uF,cb.f);gl.uniform1f(pr.u.uTan,cb.tan);gl.uniform1f(pr.u.uAsp,cb.asp);
    gl.bindVertexArray(this.skyVao);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);},
  beginMain(){this.common(this.main);this.tint([1,1,1]);},
  tint(t){this.gl.uniform3fv(this.main.u.uTint,t);},
  draw(m,model){const gl=this.gl;gl.uniformMatrix4fv(this.main.u.uModel,false,model);gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);},
  drawWater(){const gl=this.gl,pr=this.water;this.common(pr);const S=40;
    gl.uniform2f(pr.u.uOff,Math.round(this.cam[0]/S)*S,Math.round(this.cam[2]/S)*S);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.bindVertexArray(this.waterMesh.vao);gl.drawElements(gl.TRIANGLES,this.waterMesh.count,gl.UNSIGNED_INT,0);gl.disable(gl.BLEND);}
};
const IDENT=Mat.trs(0,0,0);

// ================= shaderlar =================
const VS_MAIN=`#version 300 es
layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNor;layout(location=2)in vec4 aCol;
uniform mat4 uProj,uView,uModel;out vec3 vPos,vNor;out vec4 vCol;
void main(){vec4 w=uModel*vec4(aPos,1.);vPos=w.xyz;vNor=mat3(uModel)*aNor;vCol=aCol;gl_Position=uProj*uView*w;}`;
const FS_MAIN=`#version 300 es
precision highp float;in vec3 vPos,vNor;in vec4 vCol;out vec4 o;
uniform vec3 uSun,uSunCol,uSkyAmb,uGndAmb,uFogCol,uCam,uTint;uniform float uFogD,uNight,uTime;
float h2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){vec3 n=normalize(vNor);if(dot(n,uCam-vPos)<0.)n=-n;
 vec3 col=vCol.rgb*uTint;float e=vCol.a;
 if(e>1.5){e=0.;if(abs(n.y)<.5){vec2 t=normalize(vec2(-n.z,n.x));float u=dot(vPos.xz,t)/3.2,v=(vPos.y-.6)/3.3;
   vec2 f=fract(vec2(u,v)),cl=floor(vec2(u,v));float w=step(.28,f.x)*step(f.x,.72)*step(.28,f.y)*step(f.y,.8);
   float lit=step(.5,h2(cl+floor(vPos.xz*.02)*3.7));col=mix(col,vec3(.16,.2,.26),w*.85);
   col=mix(col,vec3(1.,.78,.42),w*lit*uNight);e=w*lit*uNight;}}
 float dif=max(dot(n,uSun),0.);vec3 amb=mix(uGndAmb,uSkyAmb,n.y*.5+.5);
 vec3 c=col*(amb+uSunCol*dif);c=mix(c,col,clamp(e*(.25+.75*uNight),0.,1.))+col*e*uNight*.5;
 float d=length(vPos-uCam);float f=1.-exp(-pow(d*uFogD,1.5));o=vec4(mix(c,uFogCol,f),1.);}`;
const VS_WATER=`#version 300 es
layout(location=0)in vec3 aPos;uniform mat4 uProj,uView;uniform vec2 uOff;uniform float uTime;out vec3 vPos,vN;
float wv(vec2 p,float t){return .22*sin(p.x*.05+t*1.1)+.16*sin(p.y*.07-t*1.3+p.x*.02)+.07*sin((p.x+p.y)*.19+t*2.1);}
void main(){vec2 p=aPos.xz+uOff;float h=wv(p,uTime),hx=wv(p+vec2(.5,0),uTime),hz=wv(p+vec2(0,.5),uTime);
 vN=normalize(vec3(h-hx,.5,h-hz));vPos=vec3(p.x,h,p.y);gl_Position=uProj*uView*vec4(vPos,1.);}`;
const FS_WATER=`#version 300 es
precision highp float;in vec3 vPos,vN;out vec4 o;uniform vec3 uCam,uSun,uSunCol,uHor,uTop,uFogCol;uniform float uFogD,uNight,uTime;
void main(){vec3 v=normalize(uCam-vPos);float dd=exp(-length(uCam-vPos)/120.);vec3 n=normalize(vN+dd*vec3(sin(vPos.x*.9+uTime*2.)*.05+sin(vPos.z*1.7+vPos.x*.6-uTime*1.4)*.04,0.,cos(vPos.z*.8+uTime*1.5)*.05+sin(vPos.x*1.3-uTime)*.03));
 float fr=.08+.8*pow(1.-max(dot(n,v),0.),4.);vec3 deep=mix(vec3(.04,.2,.27),vec3(.01,.03,.06),uNight);
 vec3 r=reflect(-v,n);vec3 sky=mix(uHor,uTop,clamp(r.y*1.5,0.,1.));vec3 c=mix(deep,sky,fr);
 c+=uSunCol*pow(max(dot(r,uSun),0.),220.)*3.;
 c+=vec3(1.,.72,.35)*uNight*.35*pow(max(0.,sin(vPos.x*.31+uTime)*sin(vPos.z*.23-uTime*.7)),10.);
 float d=length(vPos-uCam);float f=1.-exp(-pow(d*uFogD,1.5));o=vec4(mix(c,uFogCol,f),.9);}`;
const VS_SKY=`#version 300 es
out vec2 vUV;void main(){vec2 p=vec2(gl_VertexID==1?3.:-1.,gl_VertexID==2?3.:-1.);vUV=p;gl_Position=vec4(p,1.,1.);}`;
const FS_SKY=`#version 300 es
precision highp float;in vec2 vUV;out vec4 o;uniform vec3 uR,uU,uF,uSun,uHor,uTop;uniform float uTan,uAsp,uNight,uTime;
float h2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h2(i),h2(i+vec2(1,0)),f.x),mix(h2(i+vec2(0,1)),h2(i+1.),f.x),f.y);}
void main(){vec3 d=normalize(uF+vUV.x*uR*uTan*uAsp+vUV.y*uU*uTan);float y=max(d.y,0.);
 vec3 c=mix(uHor,uTop,pow(y,.55));if(d.y<0.)c=uHor*.92;
 float sd=max(dot(d,uSun),0.);float day=1.-uNight;
 c+=vec3(1.,.75,.45)*pow(sd,10.)*.4*day+vec3(1.,.96,.85)*smoothstep(.9993,.9996,sd)*day*2.;
 float md=max(dot(d,-uSun),0.);c+=vec3(.9,.92,1.)*smoothstep(.9995,.9997,md)*uNight*1.5+vec3(.3,.35,.5)*pow(md,40.)*uNight*.3;
 if(d.y>0.){vec2 sp=d.xz/(d.y+.2)*260.;c+=vec3(step(.9965,h2(floor(sp))))*uNight*smoothstep(0.,.3,d.y);
  vec2 cp=d.xz/(d.y+.1)*1.6+vec2(uTime*.004,0.);float cl=n2(cp)*.55+n2(cp*2.2)*.3+n2(cp*5.1)*.15;
  cl=smoothstep(.5,.85,cl)*smoothstep(0.,.2,d.y);vec3 cc=mix(uHor,vec3(1.),.55)*(1.-uNight*.9)+uHor*.2;c=mix(c,cc,cl*.75);}
 o=vec4(c,1.);}`;
