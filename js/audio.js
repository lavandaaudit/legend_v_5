/* IBONARIUM KYIV — WebAudio chiptune SFX (square/pulse/noise, Mega Drive vibe) */
IB.AUDIO = (function(){
  let ctx=null, master=null, engOsc=null, engGain=null, engFilter=null, engOn=false;
  let muted=false, vol=0.55;
  function ensure(){
    if(!ctx){
      try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return false;}
      master=ctx.createGain();master.gain.value=vol;master.connect(ctx.destination);
    }
    if(ctx.state==='suspended')ctx.resume();
    return true;
  }
  function tone(f0,f1,dur,type,vol,delay){
    if(!ensure()||muted)return;
    const t=ctx.currentTime+(delay||0);
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type||'square';
    o.frequency.setValueAtTime(IB.M.max(20,f0),t);
    o.frequency.exponentialRampToValueAtTime(IB.M.max(20,f1||f0),t+dur);
    g.gain.setValueAtTime(vol||0.2,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.02);
  }
  function noise(dur,vol,f0,f1,q,delay){
    if(!ensure()||muted)return;
    const t=ctx.currentTime+(delay||0);
    const n=Math.ceil(ctx.sampleRate*dur);
    const buf=ctx.createBuffer(1,n,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    const src=ctx.createBufferSource();src.buffer=buf;
    const flt=ctx.createBiquadFilter();flt.type='bandpass';
    flt.frequency.setValueAtTime(f0||800,t);
    flt.frequency.exponentialRampToValueAtTime(f1||f0||800,t+dur);
    flt.Q.value=q||1;
    const g=ctx.createGain();g.gain.setValueAtTime(vol||0.3,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+dur);
    src.connect(flt);flt.connect(g);g.connect(master);
    src.start(t);src.stop(t+dur);
  }
  const S={
    ui:()=>{tone(660,660,0.06,'square',0.12);},
    sel:()=>{tone(440,880,0.09,'square',0.14);},
    pickup:()=>{tone(520,1040,0.09,'square',0.16);tone(780,1560,0.09,'square',0.12,0.07);},
    eat:()=>{tone(300,180,0.12,'triangle',0.2);},
    heal:()=>{tone(392,523,0.14,'square',0.14);tone(523,659,0.14,'square',0.12,0.12);},
    shot:()=>{noise(0.14,0.5,1600,300,0.7);tone(190,50,0.12,'square',0.25);},
    dry:()=>{tone(300,300,0.05,'square',0.12);},
    melee:()=>{noise(0.12,0.22,900,2400,1.4);},
    hit:()=>{noise(0.09,0.3,300,120,1);tone(120,60,0.1,'triangle',0.22);},
    hurt:()=>{tone(160,90,0.16,'sawtooth',0.3);},
    growl:()=>{tone(90+IB.rnd(-15,15),60,0.3,'sawtooth',0.12);},
    scream:()=>{tone(500,950,0.35,'sawtooth',0.22);noise(0.4,0.18,1200,2400,2);},
    zdie:()=>{tone(140,40,0.3,'sawtooth',0.2);noise(0.2,0.2,500,150,1);},
    boom:()=>{noise(0.5,0.7,300,60,0.5);tone(90,30,0.4,'triangle',0.4);},
    crash:()=>{noise(0.25,0.45,500,150,0.8);tone(140,60,0.2,'sawtooth',0.25);},
    door:()=>{noise(0.12,0.25,300,600,1);},
    step:()=>{},
    radio:()=>{noise(0.3,0.14,1400,1400,3);tone(880,880,0.07,'square',0.1,0.32);tone(660,660,0.07,'square',0.1,0.45);},
    mission:()=>{tone(523,523,0.1,'square',0.16);tone(659,659,0.1,'square',0.16,0.1);tone(784,784,0.18,'square',0.18,0.2);},
    landmark:()=>{tone(392,392,0.12,'square',0.15);tone(523,523,0.12,'square',0.15,0.12);tone(659,659,0.12,'square',0.15,0.24);tone(784,784,0.25,'square',0.18,0.36);},
    alarm:()=>{tone(700,500,0.3,'square',0.14);},
    siren:()=>{tone(560,920,0.75,'square',0.15);tone(920,560,0.75,'square',0.15,0.75);tone(560,920,0.75,'square',0.13,1.5);},
    buzz:()=>{tone(88+IB.rnd(-7,7),92,0.36,'sawtooth',0.07);noise(0.12,0.018,150,170,6);},
    craft:()=>{noise(0.15,0.2,800,400,1);tone(500,700,0.1,'square',0.12,0.14);},
  };
  function engineStart(){
    if(!ensure()||engOn)return;
    engOn=true;
    engOsc=ctx.createOscillator();engOsc.type='sawtooth';engOsc.frequency.value=55;
    engGain=ctx.createGain();engGain.gain.value=0.0;
    engFilter=ctx.createBiquadFilter();engFilter.type='lowpass';engFilter.frequency.value=320;
    engOsc.connect(engFilter);engFilter.connect(engGain);engGain.connect(master);
    engOsc.start();
  }
  function engineSet(speed){
    if(!engOn)return;
    engOsc.frequency.setValueAtTime(45+speed*9,ctx.currentTime);
    engGain.gain.setTargetAtTime(muted?0:(speed>0.2?0.14:0.05),ctx.currentTime,0.1);
  }
  function engineStop(){
    if(!engOn)return;
    try{engGain.gain.setTargetAtTime(0,ctx.currentTime,0.05);const o=engOsc;setTimeout(()=>{try{o.stop()}catch(e){}},300);}catch(e){}
    engOn=false;
  }
  function jingle(){ // title theme, short loop
    if(!ensure()||muted)return;
    const notes=[196,233,262,294,262,233,196,165,196,0,262,0,294,262,233,196];
    notes.forEach((f,i)=>{ if(f)tone(f,f,0.22,'square',0.11,i*0.22); if(f)tone(f/2,f/2,0.22,'triangle',0.08,i*0.22); });
    noise(0.05,0.05,4000,4000,2);
    for(let i=0;i<notes.length;i++)noise(0.03,0.04,5000,5000,2,i*0.22);
  }
  return {
    init:ensure,
    sfx:n=>{try{(S[n]||(()=>{}))();}catch(e){}},
    engineStart,engineSet,engineStop,jingle,
    setVol:v=>{vol=v;if(master)master.gain.value=muted?0:v;},
    toggleMute:()=>{muted=!muted;if(master)master.gain.value=muted?0:vol;return muted;},
  };
})();
