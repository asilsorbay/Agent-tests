'use strict';
// ================= ses (WebAudio sentezi) =================
const AUD={on:false,vol:.8,music:true,P:null,
 init(){if(this.ctx)return;try{const A=window.AudioContext||window.webkitAudioContext;this.ctx=new A();}catch(e){return;}
  const c=this.ctx;this.master=c.createGain();this.master.gain.value=this.vol;this.master.connect(c.destination);
  const len=c.sampleRate*2,buf=c.createBuffer(1,len,c.sampleRate),d=buf.getChannelData(0);let b=0;for(let i=0;i<len;i++){b=b*.98+(Math.random()*2-1)*.2;d[i]=b;}this.noiseBuf=buf;
  const mk=(f,q,type)=>{const s=c.createBufferSource();s.buffer=buf;s.loop=true;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();g.gain.value=0;s.connect(fl);fl.connect(g);g.connect(this.master);s.start();return{g,fl};};
  this.sea=mk(500,.5,'lowpass');this.city=mk(900,.8,'bandpass');this.on=true;this.nextGull=2;this.nextNote=1;this.t=0;},
 env(g,t0,a,d,v){g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+a);g.gain.exponentialRampToValueAtTime(.0001,t0+a+d);},
 osc(type,f,t0,dur,v,f2){const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+dur);
  o.connect(g);g.connect(this.master);this.env(g,t0,.01,dur,v);o.start(t0);o.stop(t0+dur+.05);return o;},
 dist(x,z){if(!this.P)return 0;return Math.hypot(x-this.P.x,z-this.P.z);},
 update(dt,P,nearWater,night){if(!this.on)return;this.P=P;const c=this.ctx,t=c.currentTime;this.t+=dt;
  this.sea.g.gain.setTargetAtTime(nearWater*.35,t,.5);this.sea.fl.frequency.setTargetAtTime(350+Math.sin(this.t*.4)*150,t,.3);
  this.city.g.gain.setTargetAtTime((1-nearWater)*.05*(night?.4:1),t,.8);
  this.nextGull-=dt;if(this.nextGull<0){this.nextGull=(nearWater>.3?2:9)+Math.random()*6;if(nearWater>.1)this.gull(.12*nearWater+.03);}
  if(this.music){this.nextNote-=dt;if(this.nextNote<0)this.playNote();}},
 gull(v=.1){const t=this.ctx.currentTime;const n=2+Math.floor(Math.random()*3);for(let i=0;i<n;i++){const f=1500+Math.random()*500;this.osc('triangle',f,t+i*.22,.18,v,f*.65);this.osc('sine',f*2,t+i*.22,.12,v*.3,f*1.2);}},
 horn(l){if(!this.on)return;const d=this.dist(l.x,l.z);if(d>600)return;const v=.35*(1-d/600),t=this.ctx.currentTime;for(const f of[98,123,147]){const o=this.osc('sawtooth',f,t,2.2,v*.3);}},
 bell(){if(!this.on||!ENT.tram)return;const d=this.dist(ENT.tram.x,ENT.tram.z);if(d>200)return;const v=.3*(1-d/200),t=this.ctx.currentTime;this.osc('sine',1320,t,.9,v);this.osc('sine',2640,t,.5,v*.4);this.osc('sine',1320,t+.35,.9,v);},
 honk(){if(!this.on)return;const t=this.ctx.currentTime;this.osc('square',420,t,.25,.05);this.osc('square',520,t,.25,.04);},
 meow(){if(!this.on)return;const c=this.ctx,t=c.currentTime,o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';
  o.frequency.setValueAtTime(480,t);o.frequency.linearRampToValueAtTime(780,t+.18);o.frequency.linearRampToValueAtTime(420,t+.55);
  f.type='bandpass';f.Q.value=4;f.frequency.setValueAtTime(900,t);f.frequency.linearRampToValueAtTime(1600,t+.2);f.frequency.linearRampToValueAtTime(700,t+.55);
  o.connect(f);f.connect(g);g.connect(this.master);this.env(g,t,.05,.55,.35);o.start(t);o.stop(t+.7);},
 purr(){if(!this.on)return;const t=this.ctx.currentTime;for(let i=0;i<12;i++)this.osc('sawtooth',55,t+i*.09,.07,.05);},
 cash(){if(!this.on)return;const t=this.ctx.currentTime;this.osc('sine',1400,t,.12,.15);this.osc('sine',2100,t+.08,.25,.15);},
 shutter(){if(!this.on)return;const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noiseBuf;f.type='highpass';f.frequency.value=2500;
  s.connect(f);f.connect(g);g.connect(this.master);this.env(g,t,.002,.08,.6);s.start(t);s.stop(t+.12);this.osc('square',180,t+.05,.04,.1);},
 quest(){if(!this.on)return;const t=this.ctx.currentTime;[587,622,740,880].forEach((f,i)=>this.osc('triangle',f,t+i*.11,.4,.15));},
 splash(){if(!this.on)return;const c=this.ctx,t=c.currentTime,s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=this.noiseBuf;f.type='lowpass';f.frequency.value=1200;
  s.connect(f);f.connect(g);g.connect(this.master);this.env(g,t,.01,.35,.4);s.start(t);s.stop(t+.5);},
 // Hicaz makamında üretken bağlama/ud melodisi
 scale:[293.7,311.1,370,392,440,466.2,523.3,587.3,622.3,740],mi:4,
 pluck(f,t,v){const c=this.ctx,o=c.createOscillator(),o2=c.createOscillator(),fl=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*1.003;
  fl.type='lowpass';fl.frequency.setValueAtTime(f*6,t);fl.frequency.exponentialRampToValueAtTime(f*1.2,t+.4);o.connect(fl);o2.connect(fl);fl.connect(g);g.connect(this.master);
  this.env(g,t,.005,1.1,v);o.start(t);o2.start(t);o.stop(t+1.3);o2.stop(t+1.3);},
 playNote(){const t=this.ctx.currentTime;this.mi=clamp(this.mi+Math.round((Math.random()-.5)*3.2),0,this.scale.length-1);
  const f=this.scale[this.mi]*(Math.random()<.15?.5:1);this.pluck(f,t,.045);if(Math.random()<.3)this.pluck(f,t+.12,.03);
  if(Math.random()<.2)this.pluck(this.scale[0]/2,t,.035);this.nextNote=[.25,.25,.5,.5,.75,1][Math.floor(Math.random()*6)]+(Math.random()<.08?2:0);},
 setVol(v){this.vol=v;if(this.master)this.master.gain.value=v;}
};
