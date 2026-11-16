/* IBONARIUM KYIV — ents.js: гравець, заражені, авто, снаряди, лут, вцілілі, шахеди */
IB.ENTS={zombies:[],bullets:[],pickups:[],fires:[],throws:[],parts:[],decals:[],survivors:[],shaheds:[]};
IB.NOISE=[];
IB.PL=null;

IB.ZSTATS={
  walker:  {hp:80, dmg:10, spd:1.35, sight:7,  n:'WALKER'},
  runner:  {hp:55, dmg:12, spd:3.4,  sight:9,  n:'RUNNER'},
  screamer:{hp:45, dmg:8,  spd:1.6,  sight:8,  n:'SCREAMER'},
  brute:   {hp:240,dmg:26, spd:1.1,  sight:6,  n:'BRUTE'},
  blind:   {hp:70, dmg:9,  spd:1.8,  sight:0,  hear:13, n:'BLIND'},
  crawler: {hp:40, dmg:7,  spd:1.0,  sight:5,  n:'CRAWLER'},
  guardian:{hp:130,dmg:16, spd:1.4,  sight:7,  n:'GUARDIAN'},
  alpha:   {hp:200,dmg:18, spd:1.7,  sight:10, n:'ALPHA'},
};

IB.initEnts=function(){
  const E=IB.ENTS;E.zombies=[];E.bullets=[];E.pickups=[];E.fires=[];E.throws=[];E.parts=[];E.decals=[];E.survivors=[];E.shaheds=[];IB.NOISE=[];
  const W=IB.WORLD;
  IB.PL={x:91.5,y:111.5,fx:0,fy:1,dirKey:'F',hp:100,st:100,hu:80,wa:80,inv:{ammo:24,food:1,water:1,medkit:1,grenade:1,battery:1},
    slot:0,car:null,atkCd:0,shootCd:0,kickCd:0,flash:false,batt:100,alive:true,anim:0,moving:false,hurtT:0,invT:0,kills:0,shNoise:0,lowAmmoT:0};
};

/* ---- спільний рух з колізіями (r=радіус у тайлах) ---- */
IB.moveEnt=function(e,dx,dy,r,climbElev){
  const W=IB.WORLD;
  /* БАТЧ 17: гравець на поверхні ВМІЄ ПЛАВАТИ — вода для нього прохідна
     (повільно, з витратою сил; далеко від берега — тоне). Решта сутностей
     (заражені, авто) у воду не заходять — вода для них суцільна. */
  const canSwim=e===IB.PL&&IB.layer==='city'&&!e.car&&!IB.HIDE;
  const passable=(tx,ty)=>{
    if(!W.solid(tx,ty))return true;
    if(canSwim&&W.ter[W.ridx(tx,ty)]===12)return true;   /* вода — пливе */
    return false;
  };
  /* АНТИ-ЗАМУРОВУВАННЯ: якщо сутність опинилась усередині суцільного тайла —
     витягуємо її в найближчий вільний, щоб рух ніколи не "вимерав" у текстурах */
  if(W.solid(e.x|0,e.y|0)&&!(canSwim&&W.ter[W.ridx(e.x|0,e.y|0)]===12)){
    const f=W.freeSpot(e.x,e.y,5);
    if(f){e.x=f.x;e.y=f.y;}
  }
  const ok=(nx,ny)=>{
    for(const[ox,oy]of[[r,0],[-r,0],[0,r],[0,-r],[r*0.7,r*0.7],[-r*0.7,r*0.7],[r*0.7,-r*0.7],[-r*0.7,-r*0.7]]){
      const tx=(nx+ox)|0,ty=(ny+oy)|0;
      if(!passable(tx,ty))return false;
      const el=W.elevAt(tx,ty),el0=W.elevAt(nx|0,ny|0);
      if(IB.M.abs(el-el0)>1)return false;
    }
    return true;
  };
  let moved=false;
  if(ok(e.x+dx,e.y)){e.x+=dx;moved=true;}
  if(ok(e.x,e.y+dy)){e.y+=dy;moved=true;}
  /* обидві осі заблоковані, але поруч є вільний тайл — ковзання навколо кута */
  if(!moved&&(dx||dy)){
    if(ok(e.x+dx,e.y-dy*0.6)){e.x+=dx;e.y-=dy*0.6;}
    else if(ok(e.x-dx*0.6,e.y+dy)){e.x-=dx*0.6;e.y+=dy;}
  }
  e.x=IB.clamp(e.x,2,W.W-3);e.y=IB.clamp(e.y,2,W.H-3);
};
/* авто не проїдуть крізь будівлі: перевіряємо ГАБАРИТ кузова (фронт/тил/борти), а не одну точку —
   раніше перевірявся лише центр, тож довге авто (2.75-4 тайли) візуально "заїзджало" в стіну */
IB.carBlocked=function(nx,ny,dir,hl,hw){
  const W=IB.WORLD;
  const dv=[[1,0],[-1,0],[0,1],[0,-1]][dir||0]||[1,0];
  hl=hl||1.2;hw=hw||0.42;
  const px=-dv[1],py=dv[0];   /* поперек кузова */
  const pts=[[hl,0],[hl,hw],[hl,-hw],[-hl,0],[-hl,hw],[-hl,-hw],[0,hw],[0,-hw],[0,0]];
  for(const[sa,sb]of pts){
    const tx=(nx+dv[0]*sa+px*sb)|0,ty=(ny+dv[1]*sa+py*sb)|0;
    if(W.solid(tx,ty))return true;
  }
  return false;
};

/* ---- інвентар ---- */
IB.addItem=function(id,n=1){
  const p=IB.PL;if(!p)return;
  p.inv[id]=(p.inv[id]||0)+n;
  if(p.inv[id]<=0)delete p.inv[id];
  return true;
};
IB.hasItem=function(id,n=1){return (IB.PL&&IB.PL.inv[id]||0)>=n;};
IB.takeItem=function(id,n=1){
  const p=IB.PL;if(!IB.hasItem(id,n))return false;
  p.inv[id]-=n;if(p.inv[id]<=0)delete p.inv[id];return true;
};

/* ---- заражені ---- */
IB.makeZombie=function(type,x,y,home){
  const s=IB.ZSTATS[type]||IB.ZSTATS.walker;
  const z={type,x,y,hp:s.hp,dmg:s.dmg,spd:s.spd*(0.9+IB.rnd(0,0.25)),sight:s.sight,
    state:'idle',tgt:null,cd:IB.rnd(0,1),anim:IB.rnd(0,1),wT:IB.rnd(1,3),screamed:false,home:home||{x,y},boost:1,
    stag:0,rec:0,wind:0,ang:IB.rnd(0,6.28),orbDir:IB.rnd(0,1)<0.5?-1:1,tgtS:null};
  IB.ENTS.zombies.push(z);return z;
};
/* УДАР ПО ЗАРАЖЕНОМУ: dmg + відкидання/оглушення (kb) — бойовка 9-го бачу:
   меч збиває з ніг, заражений не встигає відповісти, натовп не "гризе" безперервно */
IB.hurtZombie=function(z,dmg,kx,ky,kb){
  z.hp-=dmg;z.state='chase';z.tgt={x:IB.PL.x,y:IB.PL.y};z.tgtS=null;
  for(let i=0;i<4;i++)IB.ENTS.parts.push({x:z.x,y:z.y,vx:(kx||0)*2+IB.rnd(-1,1),vy:(ky||0)*2+IB.rnd(-1,1),ttl:0.4,c:'#8c1c18'});
  /* БАТЧ 14: бризки крові при кожному ударі */
  for(let i=0;i<2;i++)IB.ENTS.parts.push({x:z.x+kx*0.2,y:z.y+ky*0.2,vx:(kx||0)*3+IB.rnd(-0.8,0.8),vy:(ky||0)*3+IB.rnd(-0.8,0.8),ttl:0.3,c:'#a82018'});
  if(kb){
    z.stag=Math.max(z.stag||0,kb===2?0.55:0.3);      /* меч оглушує сильніше за кулю */
    z.wind=0;z.rec=0;z.cd=IB.M.max(z.cd,kb===2?0.75:0.4);
    const l=IB.M.max(0.01,IB.M.hypot(kx||0,ky||0));
    IB.moveEnt(z,(kx||0)/l*(kb===2?0.55:0.3),(ky||0)/l*(kb===2?0.55:0.3),0.24,false);
  }
  if(z.hp<=0){
    IB.PL.kills++;IB.AUDIO.sfx('zdie');
    /* БАТЧ 13: зомбі інтер'єрів — позначаємо def мертвим (зачистка поверху) */
    const WZ=IB.WORLD;
    if(WZ&&WZ.interior&&WZ.zdefs&&z.def!==undefined)WZ.zdefs[z.def].dead=true;
    /* БАТЧ 14: калюча крові на місці смерті */
    if(IB.rnd(0,1)<0.7)IB.ENTS.decals.push({t:'blood',x:z.x+IB.rnd(-0.4,0.4),y:z.y+IB.rnd(-0.3,0.3)});
    IB.ENTS.decals.push({t:'corpse',x:z.x,y:z.y});
    if(IB.ENTS.decals.length>130)IB.ENTS.decals.shift();
    if(IB.rnd(0,1)<0.42){
      const drop=[['ammo',IB.ri(4,10)],['cloth',1],['bottle',1],['alcohol',1],['food',1],['bandage',1],['parts',1]][IB.ri(0,6)];
      IB.ENTS.pickups.push({item:drop[0],n:drop[1],x:z.x,y:z.y,bob:IB.rnd(0,6)});
    }
    IB.ENTS.zombies.splice(IB.ENTS.zombies.indexOf(z),1);
  }
};
IB.damagePlayer=function(n,pierce){
  const p=IB.PL;if(!p.alive)return;
  if(!pierce&&p.invT>0)return;            /* і-фрейми: після удару 0.7с недоторканості */
  p.hp-=n;p.hurtT=1;p.invT=0.72;IB.AUDIO.sfx('hurt');
  if(p.hp<=0){p.hp=0;p.alive=false;}
};
IB.fireBullet=function(x,y,dx,dy,dmg,opt){
  opt=opt||{};
  const spd=opt.spd||16,ttl=opt.ttl||0.65;
  IB.ENTS.bullets.push({x,y,vx:dx*spd,vy:dy*spd,ttl,dmg});
  IB.AUDIO.sfx('shot');IB.NOISE.push({x,y,r:12,t:'shot'});
  for(let i=0;i<3;i++)IB.ENTS.parts.push({x:x+dx*0.3,y:y+dy*0.3,vx:dx*3+IB.rnd(-0.6,0.6),vy:dy*3+IB.rnd(-0.6,0.6),ttl:0.12,c:'#f0d050'});
};
IB.explode=function(x,y,r,dmg,self){
  IB.AUDIO.sfx('boom');IB.NOISE.push({x,y,r:18,t:'boom'});
  for(let i=0;i<14;i++)IB.ENTS.parts.push({x,y,vx:IB.rnd(-3,3),vy:IB.rnd(-3,3),ttl:IB.rnd(0.2,0.5),c:i%2?'#f0d050':'#b83424'});
  const zs=IB.ENTS.zombies.slice();
  for(const z of zs){const d=IB.dist(x,y,z.x,z.y);if(d<r+0.3)IB.hurtZombie(z,dmg*(1-d/(r+0.3))+20,(z.x-x)/IB.M.max(0.1,d),(z.y-y)/IB.M.max(0.1,d));}
  if(self){const pd=IB.dist(x,y,IB.PL.x,IB.PL.y);if(pd<r)IB.damagePlayer(IB.M.round(45*(1-pd/r)));}
  IB.ENTS.decals.push({t:'scorch',x,y});
};
IB.throwObj=function(kind){
  const p=IB.PL;
  const tx=p.x+p.fx*3.2,ty=p.y+p.fy*3.2;
  IB.ENTS.throws.push({kind,x:p.x,y:p.y,tx,ty,t:0});
};

/* ---- ВЦІЛІЛІ ГЕРОЇ (кричать HELP — веди їх на базу ВВ13) ---- */
const SURVNAMES=['ОЛЕГ','МАРИНА','ТАРАС','СОЛОМІЯ','ДЕНИС','ІГОР','ЯНА','БОГДАН','ОКСАНА','МИРОСЛАВ','НАТАЛКА','ВІТЯ'];
IB.makeSurvivor=function(x,y){
  const s={x,y,hp:55,spd:2.5,name:SURVNAMES[IB.ri(0,SURVNAMES.length-1)],
    pal:'sv'+IB.ri(1,3),state:'help',anim:0,moving:false,wT:0,wt:null,screamT:IB.rnd(0,1.5),hurtT:0};
  IB.ENTS.survivors.push(s);return s;
};
IB.killSurvivor=function(s){
  const E=IB.ENTS;
  const i=E.survivors.indexOf(s);if(i>=0)E.survivors.splice(i,1);
  E.decals.push({t:'corpse',x:s.x,y:s.y});
  IB.AUDIO.sfx('zdie');
  IB.toast(s.name+' ЗАГИНУВ… ТРЕБА БУЛО ЙТИ АКУРАТНІШЕ','red');
};

/* ---- ШАХЕДИ (повітряна атака) ---- */
IB.makeShahed=function(tx,ty){
  const a=IB.rnd(0,6.28),d=IB.rnd(26,34);
  const x=IB.clamp(tx+IB.M.cos(a)*d,4,IB.WORLD.W-5), y=IB.clamp(ty+IB.M.sin(a)*d,4,IB.WORLD.H-5);
  const sh={x,y,tx,ty,phase:'fly',alt:IB.rnd(96,132),spd:IB.rnd(6.2,7.6),t:0,buzzT:IB.rnd(0,0.4),fallT:0};
  IB.ENTS.shaheds.push(sh);return sh;
};

/* ---- авто ---- */
IB.enterCar=function(car){
  const p=IB.PL;
  if(car.broken||car.fuel<=0){IB.toast('ДВИГУН МЕРТВИЙ — ПОТРІБНЕ ПАЛЬНЕ АБО РЕМОНТ','red');return;}
  p.car=car;car.engine=true;IB.AUDIO.sfx('door');IB.AUDIO.engineStart();IB.toast(car.nameDe||IB.SPR.CARS[car.mdl].name+' — ГОТОВИЙ ДО ВИЇЗДУ');
};
IB.exitCar=function(){
  const p=IB.PL,car=p.car;if(!car)return;
  const dirs=[[0.9,0],[-0.9,0],[0,0.9],[0,-0.9]];
  for(const[ox,oy]of dirs){
    const nx=car.x+ox,ny=car.y+oy;
    if(!IB.WORLD.solid(nx|0,ny|0)&&IB.M.abs(IB.WORLD.elevAt(nx|0,ny|0)-IB.WORLD.elevAt(car.x|0,car.y|0))<=1){p.x=nx;p.y=ny;break;}
  }
  p.car=null;car.engine=false;IB.AUDIO.engineStop();IB.AUDIO.sfx('door');
};

/* ---- оновлення світу ---- */
IB.updateEnts=function(dt){
  const p=IB.PL,E=IB.ENTS,W=IB.WORLD;
  /* шум */
  const noises=IB.NOISE;IB.NOISE=[];
  /* --- гравець --- */
  if(p.alive&&!p.car){
    /* щокадрова перевірка: якщо гравець всередині суцільного тайла — миттєве витягування
       (у воді НЕ витягуємо — гравець плаває, батч 17) */
    if(W.solid(p.x|0,p.y|0)&&W.ter[W.ridx(p.x|0,p.y|0)]!==12){
      const f=W.freeSpot(p.x,p.y,5);
      if(f){p.x=f.x;p.y=f.y;}
    }
    if(IB.HIDE){
      /* СХОВАНО в будинку: стоїш всередині, відпочиваєш; зомбі не бачать і не чують */
      p.moving=false;
      IB.HIDE.t+=dt;
      p.st=IB.clamp(p.st+9*dt,0,100);                     /* відпочинок */
      p.hp=IB.M.min(100,p.hp+1.4*dt);                     /* повільна регенерація */
      p.atkCd=IB.M.max(0,p.atkCd-dt);
      p.shootCd=IB.M.max(0,(p.shootCd||0)-dt);
      p.invT=IB.M.max(0,(p.invT||0)-dt);
    } else {
      const inp=IB.Input.moveVec();
      let dx=inp.x,dy=inp.y;
      /* БАТЧ 17: ПЛАВАННЯ — вода на поверхні міста */
      const wtx=p.x|0,wty=p.y|0;
      p.swim=IB.layer==='city'&&!p.car&&W.ter[W.ridx(wtx,wty)]===12;
      if(p.swim){
        /* у воді: повільно, сила тане швидко; на нулі — починає тонути */
        if(p.moving||dx||dy){
          p.drownT=(p.drownT||0);
        }
        p.swimT=(p.swimT||0)+dt;
      } else {p.swimT=0;p.drownT=0;}
      const run=IB.Input.keys.shift&&p.st>4&&(dx||dy);
      let spd=(run?5.4:2.9)*dt;
      if(p.swim)spd*=0.42;                       /* у воді 4-5 разів повільніше */
      p.moving=!!(dx||dy);
      if(p.moving){
        const l=IB.M.hypot(dx,dy);dx/=l;dy/=l;p.fx=dx;p.fy=dy;
        p.dirKey=IB.M.abs(dx)>IB.M.abs(dy)?(dx>0?'R':'L'):(dy>0?'F':'B');
        IB.moveEnt(p,dx*spd,dy*spd,0.26,true);
        p.anim+=dt*(p.swim?4:(run?11:6.5));
        p.shNoise+=dt;
        if(p.shNoise>0.5){p.shNoise=0;IB.NOISE.push({x:p.x,y:p.y,r:run?5:2.2,t:'step'});}
        if(p.swim&&IB.rnd(0,1)<0.25)IB.ENTS.parts.push({x:p.x+IB.rnd(-0.4,0.4),y:p.y+IB.rnd(-0.3,0.3),vx:IB.rnd(-0.4,0.4),vy:IB.rnd(-0.4,0.4),ttl:0.5,c:'#b8d8f0'});
      }
      if(p.swim){
        p.st=IB.clamp(p.st-9*dt,0,100);          /* плавання виснажує */
        if(p.st<=0){
          p.drownT=(p.drownT||0)+dt;
          p.hp-=dt*7;                            /* ТОНЕШЬ */
          p.hurtT=IB.M.max(p.hurtT,0.4);
          p.drnToast=(p.drnToast||0)-dt;
          if(p.drnToast<=0){p.drnToast=2;IB.toast('ТИ НЕПАВ! СИЛИ ВИЧЕРПАНИ — ГРЕБИ ДО БЕРЕГА!','red');IB.AUDIO.sfx('hurt');}
          if(p.hp<=0&&p.alive){p.hp=0;p.alive=false;IB.toast('ТИ ВТОНУВ У '+ (W.zoneName(W.zoneAt(p.x|0,p.y|0))) ,'red');}
        }
        if(IB.rnd(0,1)<0.02)IB.ENTS.parts.push({x:p.x+IB.rnd(-0.5,0.5),y:p.y+IB.rnd(-0.4,0.4),vx:0,vy:0,ttl:0.6,c:'#e8f4ff'});
      } else {
      p.st=IB.clamp(p.st+(run?-14:8)*dt,0,100);
      }
      p.atkCd=IB.M.max(0,p.atkCd-dt);
      p.shootCd=IB.M.max(0,(p.shootCd||0)-dt);
      p.invT=IB.M.max(0,(p.invT||0)-dt);          /* і-фрейми після удару */
      p.lowAmmoT=IB.M.max(0,(p.lowAmmoT||0)-dt);
      if(p.flash){
        p.batt=IB.M.max(0,p.batt-dt*0.55);
        if(p.batt<=0){
          if(IB.hasItem('battery')){IB.takeItem('battery');p.batt=100;IB.toast('НОВА БАТАРЕЙКА — ЛІХТАР СВІТИТЬ','gold');}
          else p.flash=false;
        }
      }
    }
  }
  /* --- авто --- */
  if(p.car){
    const car=p.car,spec=IB.SPR.CARS[car.mdl];
    const inp=IB.Input.keys;
    const acc=(inp.w||inp.up)?1:((inp.s||inp.down)?-0.55:0);
    car.v=IB.clamp((car.v||0)+acc*(acc>0?7:9)*dt,spec.max*-0.4,spec.max);
    if(!acc)car.v*=(1-2.2*dt);
    if((inp.a||inp.left)&&car.v!==0){car.stT=(car.stT||0)-dt;if(car.stT<=0){car.dir=(car.dir+3)%4;car.stT=0.16;car.v*=0.86;}}
    if((inp.d||inp.right)&&car.v!==0){car.stT=(car.stT||0)-dt;if(car.stT<=0){car.dir=(car.dir+1)%4;car.stT=0.16;car.v*=0.86;}}
    const dv=[[1,0],[-1,0],[0,1],[0,-1]][car.dir];
    const nx=car.x+dv[0]*car.v*dt,ny=car.y+dv[1]*car.v*dt;
    const eNow=W.elevAt(car.x|0,car.y|0),eNext=W.elevAt((nx+dv[0]*0.5)|0,(ny+dv[1]*0.5)|0);
    if(!IB.carBlocked(nx,ny,car.dir,spec.lt*0.5,spec.wt*0.45)&&IB.M.abs(eNext-eNow)<=1){
      car.x=nx;car.y=ny;
      /* збиваємо заражених */
      for(const z of E.zombies.slice()){
        if(IB.dist(car.x,car.y,z.x,z.y)<0.85&&IB.M.abs(car.v)>1.5){
          IB.hurtZombie(z,60+IB.M.abs(car.v)*10,dv[0],dv[1],2);car.v*=0.9;IB.AUDIO.sfx('hit');
        }
      }
    } else if(IB.M.abs(car.v)>0.8){
      IB.AUDIO.sfx('crash');IB.NOISE.push({x:car.x,y:car.y,r:16,t:'crash'});
      car.hp-=IB.M.abs(car.v)*7;car.v=0;
      for(let i=0;i<6;i++)E.parts.push({x:car.x,y:car.y,vx:IB.rnd(-2,2),vy:IB.rnd(-2,2),ttl:0.3,c:'#90909a'});
      if(car.hp<=0){car.broken=true;car.engine=false;IB.AUDIO.engineStop();IB.exitCar();IB.damagePlayer(15);IB.toast('АВТО ВНЕСЛИ ДО ТЛУНИ — ВОНО БІЛЬШЕ НЕ ПОЇДЕ','red');}
    }
    if(car.engine){
      car.fuel=IB.M.max(0,car.fuel-spec.fuelUse*0.5*dt-IB.M.abs(car.v)*0.02*dt);
      if(car.fuel<=0){car.engine=false;IB.AUDIO.engineStop();IB.toast('ПАЛЬНЕ ЗАКІНЧИЛОСЬ','red');}
      car.engT=(car.engT||0)-dt;
      if(car.engT<=0){car.engT=0.45;IB.NOISE.push({x:car.x,y:car.y,r:6+IB.M.abs(car.v)*1.6,t:'engine'});}
      IB.AUDIO.engineSet(IB.M.abs(car.v)/spec.max);
      if((inp.space)&&car.hornCd!==undefined){} /* horn: */
      p.x=car.x;p.y=car.y;
    }
  }
  /* --- заражені: БОЙОВКА (9-й бач) ---
     не більше 2 одночасно тиснуть вплотну — решта кружляє кільцем;
     замах видно заздалегідь; після удару заражений відступає;
     меч відкидає й оглушує; удар у момент замаху можна ВІДБИТИ */
  const night=IB.nightFactor?IB.nightFactor():0;
  let alphaNear=null;
  for(const z of E.zombies){if(z.type==='alpha'&&IB.dist(z.x,z.y,p.x,p.y)<8){alphaNear=z;break;}}
  for(const z of E.zombies)z._atk=false;
  {
    const near=[];
    for(const z of E.zombies){const d=IB.dist(z.x,z.y,p.x,p.y);if(d<3.6)near.push([d,z]);}
    near.sort((a,b)=>a[0]-b[0]);
    for(let i=0;i<near.length&&i<2;i++)near[i][1]._atk=true;
  }
  for(const zi of E.zombies){
    const z=zi;
    z.cd-=dt;z.anim+=dt*2.4;
    /* ОГЛУШЕННЯ (від меча): стоїть, не б'є */
    if(z.stag>0){z.stag-=dt;continue;}
    /* ВІДСТУП ПІСЛЯ ВЛАСНОГО УДАРУ */
    if(z.rec>0){
      z.rec-=dt;
      const dp=IB.dist(z.x,z.y,p.x,p.y);
      if(dp>0.05&&dp<3)IB.moveEnt(z,(z.x-p.x)/dp*z.spd*0.9*dt,(z.y-p.y)/dp*z.spd*0.9*dt,0.24,false);
      continue;
    }
    if(alphaNear)z.boost=1.35;else z.boost=1;
    /* реакція на шум: вітер розносить звуки, дощ глушить (у схованку звуки не доходять) */
    if(!IB.HIDE)for(const nn of noises){
      const d=IB.dist(nn.x,nn.y,z.x,z.y);
      const hear=z.type==='blind'?13:8;
      if(d<IB.M.max(nn.r*IB.WX.noise(),hear)){if(z.state!=='chase'){z.state='chase';z.tgt={x:nn.x,y:nn.y};z.tgtS=null;z.lostT=0;}}
    }
    /* ЦІЛЬ: гравець АБО вцілілий герой (крик HELP приваблює заражених) */
    let sNear=null,sD=1e9;
    for(const s of E.survivors){if(s.hidden)continue;const d=IB.dist(z.x,z.y,s.x,s.y);if(d<sD){sD=d;sNear=s;}}
    const pd=IB.dist(z.x,z.y,p.x,p.y);
    const canSee=!IB.HIDE&&z.sight>0&&pd<z.sight*(night>0.5?0.6:1)*IB.WX.sight()&&(p.alive);   /* у схованку не бачать */
    const seesS=sNear&&sD<z.sight*0.95;
    const zTgtS=(seesS&&(!canSee||sD<pd-0.5))?sNear:null;
    if(canSee&&z.state!=='chase'){z.state='chase';z.tgt={x:p.x,y:p.y};z.tgtS=null;z.lostT=0;
      if(z.type==='screamer'&&!z.screamed){z.screamed=true;IB.AUDIO.sfx('scream');IB.NOISE.push({x:z.x,y:z.y,r:22,t:'scream'});IB.toast('SCREAMER ПОДІВ СИГНАЛ — ЙДЕ ОРДА','red');}
    }
    if(zTgtS&&z.state!=='chase'){z.state='chase';z.tgt={x:sNear.x,y:sNear.y};z.tgtS=sNear;z.lostT=0;}
    /* ЗАМАХ: видно заздалегідь ('!' над головою) — час відійти або відбити */
    if(z.wind>0){
      z.wind-=dt;z.anim+=dt*7;
      if(z.wind<=0){
        const dd=z.tgtS?IB.dist(z.x,z.y,z.tgtS.x,z.tgtS.y):(p.car?IB.dist(z.x,z.y,p.car.x,p.car.y):pd);
        if(z.tgtS){
          if(dd<1.15){
            z.tgtS.hp-=IB.M.round(z.dmg*0.9);z.tgtS.hurtT=0.3;IB.AUDIO.sfx('hit');
            if(z.tgtS.hp<=0)IB.killSurvivor(z.tgtS);
          }
          z.cd=1.5;z.rec=0.5;
        } else if(!p.car&&dd<1.18&&p.alive){
          if(IB.MAIN&&IB.MAIN.attackAnim>0.10){
            /* ВІДБИТТЯ: рубаєш у момент удару — заражений відлітає */
            z.stag=1.05;z.cd=1.1;
            IB.AUDIO.sfx('hit');
            for(let i=0;i<5;i++)E.parts.push({x:z.x,y:z.y-0.3,vx:IB.rnd(-1.5,1.5),vy:IB.rnd(-1.5,1.5),ttl:0.2,c:'#f0d050'});
            if(!IB.G.flags.parryTip){IB.G.flags.parryTip=1;IB.toast('ВІДБИТО! РУБАЙ У МОМЕНТ УДАРУ','gold');}
          } else {
            IB.damagePlayer(z.dmg*IB.M.max(0.55,1-night*0.15));
            const l=IB.M.max(0.01,pd);IB.moveEnt(p,(p.x-z.x)/l*0.4,(p.y-z.y)/l*0.4,0.3,true);
          }
          z.cd=IB.M.max(z.cd,1.4+IB.rnd(0,0.5));z.rec=0.55;
        } else if(p.car&&dd<1.2){
          const car=p.car;car.hp-=z.dmg*0.8;IB.AUDIO.sfx('hit');
          if(car.hp<=0){car.broken=true;car.engine=false;IB.AUDIO.engineStop();IB.exitCar();IB.toast('ЗАРАЖЕНІ ВИНЕСЛИ ДВИГУН!','red');}
          z.cd=1.4;z.rec=0.55;
        } else z.cd=IB.M.max(z.cd,0.5);
      }
      continue;
    }
    if(z.state==='chase'){
      if(z.tgtS&&E.survivors.indexOf(z.tgtS)<0)z.tgtS=null;
      /* ціль оновлюється щокадру: герой, що кричить HELP, ближчий — перемикаємось */
      if(z.wind<=0){
        if(zTgtS){z.tgtS=sNear;z.tgt={x:sNear.x,y:sNear.y};}
        else if(canSee&&!p.car){z.tgtS=null;z.tgt={x:p.x,y:p.y};}
      }
      const tg=z.tgtS;
      const chaseP=canSee||seesS||z.type==='guardian'&&pd<9;
      let tx,ty;
      if(p.car){tx=p.car.x;ty=p.car.y;}
      else if(tg){tx=tg.x;ty=tg.y;}
      else if(chaseP){tx=p.x;ty=p.y;}
      else{tx=z.tgt?z.tgt.x:z.x;ty=z.tgt?z.tgt.y:z.y;}
      const d=IB.dist(z.x,z.y,tx,ty);
      /* КІЛЬЦЕ: хто не отримав чергу — кружляє навколо, не лізе вплотну */
      if(!p.car&&!tg&&!z._atk&&canSee&&pd<2.3){
        z.ang+=z.orbDir*dt*1.5;
        const rx=p.x+IB.M.cos(z.ang)*1.9,ry=p.y+IB.M.sin(z.ang)*1.9;
        const dr=IB.dist(z.x,z.y,rx,ry);
        if(dr>0.2){
          const sp=z.spd*z.boost*0.6*dt;
          IB.moveEnt(z,(rx-z.x)/IB.M.max(0.01,dr)*sp,(ry-z.y)/IB.M.max(0.01,dr)*sp,0.24,false);
        }
      } else if(d>0.15){
        let sp=z.spd*z.boost*(z.type==='brute'&&pd<5&&z.cd<=0?2.6:1)*dt;
        const l=IB.M.max(0.001,d);
        IB.moveEnt(z,(tx-z.x)/l*sp,(ty-z.y)/l*sp,0.24,false);
      }
      if(!canSee&&!tg&&!p.car&&d<0.5){z.lostT=(z.lostT||0)+dt;if(z.lostT>4){z.state='idle';z.tgtS=null;}}
      /* почати замах (черга в attackers + дистанція) */
      if(z.cd<=0){
        if(!p.car&&z._atk&&!tg&&pd<0.95){z.wind=0.34;if(IB.rnd(0,1)<0.22)IB.AUDIO.sfx('growl');}
        else if(!p.car&&tg&&IB.dist(z.x,z.y,tg.x,tg.y)<0.9){z.wind=0.30;}
        else if(p.car&&IB.dist(z.x,z.y,p.car.x,p.car.y)<1.1){z.wind=0.32;}
      }
    } else {
      /* блукання */
      z.wT-=dt;
      if(z.wT<=0){
        z.wT=IB.rnd(1.5,4);
        if(z.type!=='guardian'){
          const a=IB.rnd(0,6.28),r=IB.rnd(1,3);
          z.wt={x:z.x+IB.M.cos(a)*r,y:z.y+IB.M.sin(a)*r};
        } else z.wt=null;
      }
      if(z.wt&&z.type!=='guardian'){
        const d=IB.dist(z.x,z.y,z.wt.x,z.wt.y);
        if(d>0.2)IB.moveEnt(z,(z.wt.x-z.x)/d*z.spd*0.4*dt,(z.wt.y-z.y)/d*z.spd*0.4*dt,0.24,false);
      }
      if(z.type==='guardian'&&!IB.HIDE&&pd<z.sight){z.state='chase';}
    }
  }
  /* --- ВЦІЛІЛІ ГЕРОЇ --- */
  for(let i=E.survivors.length-1;i>=0;i--){
    const s=E.survivors[i];
    if(s.hidden)continue;         /* сховалися разом з тобою — не малюються, не гинуть */
    s.hurtT=IB.M.max(0,(s.hurtT||0)-dt);
    let zD=1e9,zNear=null;
    for(const z of E.zombies){const d=IB.dist(z.x,z.y,s.x,s.y);if(d<zD){zD=d;zNear=z;}}
    if(s.state==='help'){
      s.anim+=dt*3.4;
      s.moving=false;
      /* тікає від найближчого зараженого */
      if(zNear&&zD<2.8){
        s.moving=true;s.anim+=dt*4.5;
        const l=IB.M.max(0.01,zD);
        IB.moveEnt(s,(s.x-zNear.x)/l*s.spd*0.85*dt,(s.y-zNear.y)/l*s.spd*0.85*dt,0.22,false);
      } else {
        s.wT-=dt;
        if(s.wT<=0){s.wT=IB.rnd(2,4);const a=IB.rnd(0,6.28),r=IB.rnd(0.6,1.8);s.wt={x:s.x+IB.M.cos(a)*r,y:s.y+IB.M.sin(a)*r};}
        if(s.wt){const d=IB.dist(s.x,s.y,s.wt.x,s.wt.y);if(d>0.2){IB.moveEnt(s,(s.wt.x-s.x)/d*s.spd*0.35*dt,(s.wt.y-s.y)/d*s.spd*0.35*dt,0.22,false);s.moving=true;}}
      }
      /* кричить HELP — шум приваблює і гравця, і заражених */
      s.screamT-=dt;
      if(s.screamT<=0){s.screamT=IB.rnd(2.5,4);IB.NOISE.push({x:s.x,y:s.y,r:7,t:'help'});}
    } else if(s.state==='follow'){
      const d=IB.dist(s.x,s.y,p.x,p.y);
      s.moving=false;
      if(d>1.7){
        const sp=d>5?3.7:3.0;
        const l=IB.M.max(0.01,d);
        IB.moveEnt(s,(p.x-s.x)/l*sp*dt,(p.y-s.y)/l*sp*dt,0.22,false);
        s.moving=true;s.anim+=dt*8;
      }
      if(zD<3.5){s.screamT-=dt;if(s.screamT<=0){s.screamT=2.2;IB.AUDIO.sfx('growl');IB.toast(s.name+': «ЗАРАЖЕНІ ПОБЛИЗУ!»','red');}}
      /* ДОВЕЛИ ДО ВВ13 — герой у безпеці */
      const B=W.base;
      if(B&&IB.dist(s.x,s.y,B.x,B.y)<B.r-1.2){
        E.survivors.splice(i,1);
        IB.G.stats.saved=(IB.G.stats.saved||0)+1;
        IB.AUDIO.sfx('mission');
        IB.banner(s.name+' У БЕЗПЕЦІ • БАЗА ВВ13');
        const rew=[['ammo',IB.ri(6,12)],['parts',IB.ri(1,3)],['medkit',1],['food',2]][IB.ri(0,3)];
        IB.addItem(rew[0],rew[1]);
        IB.toast('+ '+(IB.SPR.itemsDB[rew[0]]||{}).n+(rew[1]>1?' ×'+rew[1]:''),'gold');
        continue;
      }
    }
  }
  /* --- ШАХЕДИ: політ → падіння → вибух → пожежа горить 60-120с --- */
  for(let i=E.shaheds.length-1;i>=0;i--){
    const sh=E.shaheds[i];
    sh.buzzT-=dt;
    if(sh.buzzT<=0){sh.buzzT=0.42;IB.AUDIO.sfx('buzz');}
    if(sh.phase==='fly'){
      const dx=sh.tx-sh.x,dy=sh.ty-sh.y,d=IB.M.max(0.01,IB.M.hypot(dx,dy));
      const sp=sh.spd*dt;
      sh.x+=dx/d*sp;sh.y+=dy/d*sp;
      sh.alt=IB.lerp(sh.alt,58,IB.M.min(1,dt*0.55));
      if(IB.rnd(0,1)<0.55)E.parts.push({x:sh.x-dx/d*0.9,y:sh.y-dy/d*0.9,vx:IB.rnd(-0.4,0.4),vy:IB.rnd(-0.4,0.4),ttl:0.65,c:'#9aa0ae'});
      if(d<sp+1.7){sh.phase='fall';}
    } else {
      const dx=sh.tx-sh.x,dy=sh.ty-sh.y,d=IB.M.max(0.01,IB.M.hypot(dx,dy));
      sh.x+=dx/d*10*dt;sh.y+=dy/d*10*dt;
      sh.alt-=dt*190;
      if(IB.rnd(0,1)<0.8)E.parts.push({x:sh.x,y:sh.y,vx:IB.rnd(-0.6,0.6),vy:IB.rnd(-0.6,0.6),ttl:0.5,c:'#e07038'});
      if(sh.alt<=0){
        IB.explode(sh.tx,sh.ty,3.0,110,false);
        E.fires.push({x:sh.tx,y:sh.ty,ttl:IB.rnd(60,120)});
        IB.cam.shake=IB.M.max(IB.cam.shake,0.5);
        const pdist=IB.dist(p.x,p.y,sh.tx,sh.ty);
        if(!IB.SYS.protectedFrom()&&pdist<2.8&&!p.car){
          IB.damagePlayer(IB.M.round(50*(1-pdist/2.8)),true);
          IB.cam.shake=0.9;IB.G.shahHit=true;
          IB.toast('ШАХЕД ВЛУЧИВ ПОБЛИЗУ ТЕБЕ!','red');
        } else if(pdist<5.5)IB.G.shahHit=IB.G.shahHit||false;
        E.shaheds.splice(i,1);
      }
    }
  }
  /* розштовхування */
  const zs=E.zombies;
  for(let i=0;i<zs.length;i++)for(let j=i+1;j<zs.length;j++){
    const a=zs[i],b=zs[j];const d=IB.dist(a.x,a.y,b.x,b.y);
    if(d<0.5&&d>0.001){const px=(a.x-b.x)/d*0.5*dt,py=(a.y-b.y)/d*0.5*dt;a.x+=px;a.y+=py;b.x-=px;b.y-=py;}
  }
  /* --- кулі --- */
  for(let i=E.bullets.length-1;i>=0;i--){
    const b=E.bullets[i];b.ttl-=dt;
    let dead=b.ttl<=0;
    for(let s=0;s<3&&!dead;s++){
      b.x+=b.vx*dt/3;b.y+=b.vy*dt/3;
      if(IB.WORLD.solid(b.x|0,b.y|0)){dead=true;
        for(let k=0;k<3;k++)E.parts.push({x:b.x,y:b.y,vx:IB.rnd(-1.5,1.5),vy:IB.rnd(-1.5,1.5),ttl:0.15,c:'#f0d050'});break;}
      for(const z of E.zombies){
        if(IB.dist(b.x,b.y,z.x,z.y)<0.42){IB.hurtZombie(z,b.dmg,b.vx/16,b.vy/16,1);IB.AUDIO.sfx('hit');dead=true;break;}
      }
    }
    if(dead)E.bullets.splice(i,1);
  }
  /* --- кинути предмети (граната/молов) --- */
  for(let i=E.throws.length-1;i>=0;i--){
    const t=E.throws[i];t.t+=dt*1.5;
    if(t.t>=1){
      if(t.kind==='grenade')IB.explode(t.tx,t.ty,2.4,110,true);
      else{E.fires.push({x:t.tx,y:t.ty,ttl:7});IB.AUDIO.sfx('boom');IB.NOISE.push({x:t.tx,y:t.ty,r:12,t:'fire'});}
      E.throws.splice(i,1);
    }
  }
  /* --- пожежі --- */
  for(let i=E.fires.length-1;i>=0;i--){
    const f=E.fires[i];f.ttl-=dt;f.t2=(f.t2||0)+dt;
    if(f.t2>0.5){f.t2=0;
      for(const z of E.zombies.slice()){if(IB.dist(f.x,f.y,z.x,z.y)<1.9)IB.hurtZombie(z,16,0,0);}
      if(IB.dist(f.x,f.y,p.x,p.y)<1.6&&!p.car&&!IB.HIDE)IB.damagePlayer(6);
    }
    if(f.ttl<=0)E.fires.splice(i,1);
  }
  /* --- частинки --- */
  for(let i=E.parts.length-1;i>=0;i--){
    const q=E.parts[i];q.ttl-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;
    if(q.ttl<=0)E.parts.splice(i,1);
  }
  /* --- підбори --- */
  for(let i=E.pickups.length-1;i>=0;i--){
    const pk=E.pickups[i];pk.bob+=dt*4;
    if(IB.dist(pk.x,pk.y,p.x,p.y)<0.6){
      IB.addItem(pk.item,pk.n);IB.AUDIO.sfx('pickup');
      const nm=(IB.SPR.itemsDB[pk.item]||{}).n||pk.item;
      IB.toast('+ '+nm+(pk.n>1?' ×'+pk.n:''));
      E.pickups.splice(i,1);
    }
  }
};
