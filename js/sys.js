/* IBONARIUM KYIV — sys.js: виживання, місії, радіо, схованки, крафт, збереження */
IB.DAY_LEN=360;           /* сек на добу */
IB.G={mode:'boot',t:8,day:1,mi:0,mdone:[],flags:{},stash:{},visited:{},deaths:0,evT:90,
      spawn:{x:31.5,y:31.5},search:null,slot:0,ending:false,
      stats:{att:0,saved:0},            /* статики: атак пережито / людей врятовано */
      shah:{t:300,phase:null,s1:false,sirT:0,spawnN:0,count:0,targets:[],tip:false,offT:0},
      survT:75,atBase:false};
IB.layer='city';      /* 'city' — поверхня, 'metro' — підземка (батч 10) */
IB.HIDE=null;          /* гравець сховався в будинку (двері + E) */

IB.nightFactor=function(){
  if(IB.layer==='metro')return 1;        /* у підземці завжди темно — потрібен ліхтар */
  if(IB.layer==='interior')return 0.55;  /* всередині будівлі приглушено (батч 13) */
  const h=IB.G.t%24;
  if(h<5)return 1;
  if(h<8)return 1-(h-5)/3;
  if(h<18)return 0;
  if(h<21)return (h-18)/3;
  return 1;
};
IB.clockStr=function(){
  const h=IB.G.t%24;
  const hh=IB.M.floor(h),mm=IB.M.floor((h-hh)*60);
  return (hh<10?'0':'')+hh+':'+(mm<10?'0':'')+mm;
};

/* ---------- ПОГОДА: сонце / дощ / вітер ---------- */
IB.WX={
  type:'sun', t:150,
  label(){return this.type==='sun'?'СОНЦЕ':(this.type==='rain'?'ДОЩ':'ВІТЕР');},
  /* дощ приховує силуети, вітер розносить шум */
  sight(){return this.type==='rain'?0.75:1;},
  noise(){return this.type==='wind'?1.3:(this.type==='rain'?0.85:1);},
};
IB.WX.next=function(){
  const r=IB.rnd(0,1);
  const nx=r<0.46?'sun':(r<0.73?'wind':'rain');
  if(nx!==IB.WX.type){
    IB.WX.type=nx;
    IB.toast('ПОГОДА ЗМІНИЛАСЬ: '+IB.WX.label(),'gold');
  }
  IB.WX.t=IB.rnd(120,220);
};

/* ---------- 13 СЮЖЕТНИХ МІСІЙ (інтегровані у відкритий світ) ---------- */
IB.MISSIONS=[
 {t:'ОСТАННІЙ ВИХІД',x:31,y:29,r:1.6,zone:'ОБОЛОНЬ',
  d:'Віктор Легенд Хоменко. 12 днів тому Київ замовк. У квартирі ще тикає годинник, а рація ловить останній сигнал: «Кто-нибудь… ответьте…»',
  lore:'РАЦІЯ: «…тут Батьківщина-Мати, музей-заповідник, працює останній передавач. Хто почує — ідіть на південні пагорби. Виживання — це сигнал.»',
  reward:{}},
 {t:'АПТЕКА НА ОБЕЛОНІ',x:48,y:45,r:1.8,zone:'ОБОЛОНЬ',
  d:'Аптечка на Минській розграбована наполовину. Заражені чергують біля вітрин, але в задніх ящиках ще є знеболювальне.',
  lore:'Ти зібрав медикаменти. Руки тремтять, але рація шепоче дякуючу тишу.',
  reward:{medkit:2,bandage:2}},
 {t:'ПАЛЬНЕ ДЛЯ ВИЖИВАННЯ',x:66,y:52,r:2.0,zone:'ОБОЛОНЬ',
  d:'Річковий порт Оболоні. У старих бочках і каністрах — пальне. Без нього не буде ні генератора, ні втечі.',
  lore:'Каністри повні. Генератор у схованці тепер живий.',
  reward:{fuel:2,parts:1}},
 {t:'МІСТ ЧЕРЕЗ ДНІПРО',x:180,y:104,r:2.2,zone:'ЛІВИЙ БЕРЕГ',
  d:'Метроміст — єдиний шлях на лівий берег. Внизу Дніпро, на полотні — покинуті машини і щось, що сичить у темряві.',
  lore:'Ти перетнув Дніпро. Лівий берег тихий, але тиша тут — неправильна.',
  reward:{ammo:12}},
 {t:'ТАБІР НА ГІДРОПАРКУ',x:158,y:133,r:2.0,zone:'ГІДРОПАРК',
  d:'Серед акацій острова — вогнище вцілілих. Вони діляться водою і новинами: велика орда збиралася на Майдані.',
  lore:'Сергій: «Тримайся острова вночі. Місто — не твій друг.»',
  reward:{water:2,food:2}},
 {t:'ВОДА ДЛЯ ТАБОРУ',x:116,y:84,r:2.0,x2:158,y2:133,zone:'ПОДІЛ',
  d:'Насос Річкового вокзалу зламаний. Частину насоса обіцяли за лишити собі бракувальники з підвалу… Знайди частину і віднеси до табору на Гідропарку.',
  lore:'Оля з табору дивиться на частину насоса: «Тепер вода буде. Ти — не байдужий. Це рідкість.»',
  reward:{pills:1,ammo:8},
  two:true},
 {t:'ВРЯТУВАТИ РАДІСТА',x:204,y:84,r:2.0,zone:'ЛІВИЙ БЕРЕГ',
  d:'Русанівка. У панельній дев’ятиповерсі застряг радіст із передавача. Ключ-картка вхідних дверей — у сусідів. GUARDIAN не дає проходу.',
  lore:'Радіст передав тобі підсилювач сигналу. Тепер вежі чують краще.',
  reward:{radio_p:1,ammo:15}},
 {t:'СИГНАЛ З МАЙДАНУ',x:141,y:150,r:1.6,zone:'МАЙДАН НЕЗАЛЕЖНОСТІ',
  d:'Колона Незалежності. Під нею — барикади, під переходами — документи штабу цивільного захисту.',
  lore:'Документи: «Сектор Майдан — 0 живих. Сектор Лавра — ІНШІ. Ідіть до печер.»',
  reward:{docs:1,ammo:10}},
 {t:'ХРЕЩАТИК: ЗАКЛАД',x:120,y:152,r:1.8,zone:'ХРЕЩАТИК',
  d:'Супермаркет на Хрещатику. Полиці вигнуті від часу, але консерви ще стоять рядами — як солдати.',
  lore:'Рюкзак вага на 3 кілограми важчий. Це — життя на тиждень.',
  reward:{food:3,water:2}},
 {t:'ЗОЛОТІ ВОРОТА: ПІДМУРКИ',x:64,y:141,r:1.5,zone:'СТАРЕ МІСТО',
  d:'Під Золотими Воротами — княжі підмурки. Хтось із вчених сховав там дослідницький схов і ключ-картку.',
  lore:'У підмурках — пахне землею і воском. Ключ-картка твоя.',
  reward:{keycard:1,ammo:10}},
 {t:'СОФІЯ: ДЗВІНИЦЯ',x:90,y:131,r:1.6,zone:'СТАРЕ МІСТО',
  d:'Дзвіниця Софійського собору. З верхнього ярусу видно весь Київ: Дніпро, Лавру, Монумент. Звідси місто — мапа.',
  lore:'З дзвіниці ти бачиш, як орда повільно стікає до промзони. Мапа в голові — точніша за будь-які документи.',
  reward:{bandage:2,pills:1}},
 {t:'ЛАВРА: ПЕЧЕРИ',x:151,y:186,r:1.5,zone:'КИЄВО-ПЕЧЕРСЬКА ЛАВРА',
  d:'Дальні печери Лаври. За замкненими ґратами — дослідницька зона: столи, пробірки, прилади. І GUARDIAN у рясі.',
  lore:'Журнал дослідника: «Зразок 7 активований. ГЕТЬ ЗВІДТИ.» Ключ від музею Монумента — в ящику.',
  reward:{ammo:15,medkit:1}},
 {t:'БАТЬКІВЩИНА-МАТИ: ПЕРЕДАЧА',x:152,y:199,r:2.0,zone:'БАТЬКІВЩИНА-МАТИ',
  d:'Музей під Монументом. Останній передавач Києва. Щит і меч над містом. Піднімись — і подай сигнал.',
  lore:'Ти натискаєш ключ. Антени Монумента сяють. «Тут Київ. Ми ще тут. Хто почує — живий. Ідіть до нас.» Останній сигнал передано.',
  reward:{},
  final:true},
];
/* БАТЧ 17: координати місій задані у старому ядрі 440x520 — зсуваємо на нову карту (+300, +80) */
for(const m of IB.MISSIONS){m.x+=300;m.y+=80;if(m.x2!==undefined){m.x2+=300;m.y2+=80;}}


/* ---------- ЛУТ ---------- */
IB.LOOT={
 pharmacy:['medkit','bandage','pills','alcohol'],
 market:['food','food','stew','water','water','bandage','energy'],
 dumpster:['cloth','bottle','alcohol','cloth','energy'],
 crate:['ammo','parts','cloth','grenade','energy','stew'],
 barrels:['fuel','fuel','parts'],
 cache:['grenade','ammo','pills','parts','mask'],
 flat:['food','water','stew','bandage','energy'],
 gate:['ammo','parts','docs','keycard'],
 caves:['docs','ammo','medkit','keycard','mask'],
 museum:['docs','ammo','fuel','mask'],
 podil:['cloth','bottle','parts'],
 andrew:['bandage','alcohol','docs'],
 trunk:['parts','cloth','ammo','fuel'],
 metro:['ammo','ammo','parts','battery','battery','cloth','bottle','alcohol','food'],   /* лут підземки: батарейки для ліхтаря! */
 well:['water','water','food'],      /* батч 14: криниця селища */
};
IB.RECIPES=[
 {id:'bandage',n:'БИНТ',req:{cloth:1,alcohol:1}},
 {id:'molotov',n:'КОКТЕЛЬ МОЛОТОВА',req:{bottle:1,fuel:1,cloth:1}},
 {id:'medkit',n:'АПТЕЧКА',req:{bandage:2,alcohol:1}},
 {id:'ammo10',n:'ПАТРОНИ 5.45 ×10',req:{parts:2,cloth:1},out:{id:'ammo',n:10},base:1},   /* крафт тільки на базі ВВ13 */
 {id:'grenade',n:'ГРАНАТА РГД',req:{parts:1,fuel:1,cloth:1},base:1},
];

IB.SYS={
  /* ---------- МЕТРО: спуск у підземку / підйом (батч 10) ---------- */
  descend(st){
    if(!IB.MWORLD)return;
    const G=IB.G,p=IB.PL;
    /* шахеди не летять під землю — атаку відміняємо */
    const S=G.shah;
    if(S&&S.phase){S.phase=null;S.t=IB.M.max(S.t,240);S.targets=[];S.s1=false;IB.ENTS.shaheds.length=0;
      IB.toast('У ТУНЕЛЯХ ТИХО — АТАКА ЗАЛИШИЛАСЬ НАГОРІ','gold');}
    if(p.car){IB.exitCar();}
    IB.CPOS={x:p.x,y:p.y};
    IB.layer='metro';IB.WORLD=IB.MWORLD;
    IB.ENTS.zombies=[];IB.ENTS.bullets=[];IB.ENTS.fires=[];IB.ENTS.shaheds=[];IB.ENTS.parts=[];IB.ENTS.decals=[];IB.ENTS.pickups=[];IB.ENTS.survivors=[];IB.ENTS.throws=[];
    const f=IB.snapFree(st.x+1.5,st.y);
    p.x=f.x;p.y=f.y;
    IB.cam.x=p.x;IB.cam.y=p.y;
    IB.AUDIO.sfx('door');
    IB.banner('МЕТРО • '+st.n);
    IB.toast('ПІДЗЕМКА: ТУНЕЛІ ВЕДУТЬ В ІНШІ РАЙОНИ • ПОВІТРЯНІ АТАКИ ТУТ НЕ ДІЮТЬ','gold');
    IB.toast('ТЕМНО — УВІМКНИ ЛІХТАР (F) • ВНИМАЙ: У ТУНЕНЯХ ХТОСЬ Є','red');
    /* перші заражені підземки */
    for(let i=0;i<3;i++)IB.SYS.trySpawn(9,16);
    IB.SYS.save();
  },
  ascend(){
    const p=IB.PL,W=IB.MWORLD;
    /* знаходимо станцію підземки, біля якої стоїмо */
    let st=null,nd=1e9;
    for(const s of W.stations){const d=IB.dist(p.x,p.y,s.x,s.y);if(d<nd){nd=d;st=s;}}
    if(!st||nd>9){IB.toast('СХОДИ Є ТІЛЬКИ НА СТАНЦІЯХ — ЙДИ ДО ЗНАКА М','red');return;}
    /* на поверхні — біля свого входу */
    const surf=(IB.CWORLD&&IB.CWORLD.stations||[]).find(q=>q.n===st.n)||IB.CWORLD.stations[0];
    IB.layer='city';IB.WORLD=IB.CWORLD;
    IB.ENTS.zombies=[];IB.ENTS.bullets=[];IB.ENTS.fires=[];IB.ENTS.shaheds=[];IB.ENTS.parts=[];IB.ENTS.decals=[];IB.ENTS.pickups=[];IB.ENTS.throws=[];
    const f=IB.snapFree(surf.x+1.4,surf.y+0.6);
    p.x=f.x;p.y=f.y;
    IB.cam.x=p.x;IB.cam.y=p.y;
    IB.AUDIO.sfx('door');
    IB.banner(surf.n);
    if(IB.HIDE)IB.HIDE=null;
    IB.SYS.save();
  },
  /* ---------- СХОВАТИСЯ В БУДИНКУ (двері + E): зомбі втрачають слід ---------- */
  hideIn(pr){
    const p=IB.PL;
    if(p.car)return;
    IB.HIDE={x:pr.x,y:pr.y,t:0};
    p.flash=false;
    /* заражені втрачають слід і розходяться */
    let dis=0;
    for(const z of IB.ENTS.zombies){
      if(z.state==='chase'){z.state='idle';z.tgt=null;z.tgtS=null;z.lostT=0;dis++;}
      z.wind=0;z.cd=IB.M.max(z.cd,1.2);
    }
    /* вцілілі поруч теж ховаються — далекі лишаються надворі (йти треба акуратно!) */
    for(const s of IB.ENTS.survivors){
      if(IB.dist(s.x,s.y,p.x,p.y)<2.6)s.hidden=true;
    }
    IB.AUDIO.sfx('door');
    IB.banner('ТИ В БУДИНКУ • СХОВАНО');
    IB.toast(dis?'ЗАРАЖЕНІ ВТРАТИЛИ СЛІД — РОЗХОДЯТЬСЯ…':'ТИХО. МОЖНА ПЕРЕЧЕКАТИ (E — ВИЙТИ)','gold');
  },
  unhide(){
    const p=IB.PL;
    IB.HIDE=null;
    for(const s of IB.ENTS.survivors)s.hidden=false;
    IB.AUDIO.sfx('door');
    IB.NOISE.push({x:p.x,y:p.y,r:2,t:'door'});
    IB.toast('ВИЙШОВ НА ВУЛИЦЮ — ОЗИРНИСЯ','dim');
  },
  /* ---------- БАТЧ 17: БАЗА ВВ13 • КПІ — ЗАЙТИ ВСЕРЕДИНУ (як у будинок) ---------- */
  enterBase(){
    const p=IB.PL;
    if(p.car)return;
    if(IB.INT){IB.SYS.exitInterior();return;}
    IB.CPOS={x:p.x,y:p.y};
    IB.INT={bi:-1,floor:0,base:true};
    const W=IB.buildBase();
    const B=IB.CWORLD.base;
    W.exitTo={x:B.x,y:B.y+1.6};
    IB.layer='interior';IB.WORLD=W;
    IB.ENTS.zombies=[];IB.ENTS.bullets=[];IB.ENTS.fires=[];IB.ENTS.shaheds=[];IB.ENTS.parts=[];IB.ENTS.decals=[];IB.ENTS.pickups=[];IB.ENTS.survivors=[];IB.ENTS.throws=[];
    const dp=W.props.find(q=>q.meta==='exit');
    const f=IB.snapFree(dp?dp.x:W.W/2,dp?(dp.y-1):W.H/2);
    p.x=f.x;p.y=f.y;
    IB.cam.x=p.x;IB.cam.y=p.y;
    IB.G.spawn={x:IB.CPOS.x,y:IB.CPOS.y,n:'БАЗА ВВ13'};
    IB.AUDIO.sfx('door');
    IB.banner('БАЗА ВВ13 • КПІ — ТИ ВСЕРЕДИНІ');
    IB.toast('ВЕРСТАК — КРАФТ • ЛІЖКО — ВІДПОЧИНОК • СКЛАД • РАДІО 103.1 • ТЕРМІНАЛ — ЗБЕРЕГТИ','gold');
    IB.toast('ВИХІД — ЖОВТА СТРІЛКА НАД ДВЕРЯМИ (E)','dim');
    IB.SYS.save();
  },
  /* радіо 103.1 всередині бази: ефір листів, коли квест зібрано */
  radio103(){
    const G=IB.G;
    if(IB.MAIL&&IB.MAIL.progress().read>=IB.MAIL.TOTAL&&!G.flags.mailFin){IB.MAIL.finalBroadcast();return;}
    IB.dialog('РАДІО 103.1 • НІЧНА ГОЛОСНА','Передавач бази ВВ13 гуде. Крізь шипіння — шепіт Світлани Гуменюк: читає недоставлені листи Києва.\n\n(Збери ВСІ листи квесту «НЕДОСТАВЛЕНІ» — і постав їх в ефір звідси.)',[
      {t:'СЛУХАТИ ЕФІР',f:()=>{IB.toast('«…Вокзальна, 9. Пошта має працювати…»','dim');IB.AUDIO.sfx('radio');}},
      {t:'ЗАКРИТИ',f:()=>{}},
    ]);
    IB.AUDIO.sfx('radio');
  },
  /* ---------- БАТЧ 13: ІНТЕР'ЄРИ — ЗАХОДУ В БУДІВЛЮ, ЗАЧИСТКА, ЗАХОПЛЕННЯ ---------- */
  enterBuilding(pr){
    const bi=pr.bld;
    const b=IB.CWORLD.blds[bi];
    const p=IB.PL;
    if(p.car||!b)return;
    if(IB.INT){IB.SYS.exitInterior();return;}
    IB.CPOS={x:p.x,y:p.y};
    const st=IB.bldState(bi);
    IB.INT={bi,floor:st.floor||0};
    this.enterFloor(IB.INT.floor,true);
    for(const z of IB.ENTS.zombies){if(z.state==='chase'){z.state='idle';z.tgt=null;z.tgtS=null;z.lostT=0;}}
  },
  enterFloor(f,entry){
    const bi=IB.INT.bi;
    const b=IB.CWORLD.blds[bi];
    if(f<0||f>=(b.floors||2))return;
    const W=IB.buildInterior(bi,f);
    IB.INT.floor=f;
    const st=IB.bldState(bi);
    st.floor=f;
    const p=IB.PL;
    IB.layer='interior';IB.WORLD=W;
    IB.ENTS.zombies=[];IB.ENTS.bullets=[];IB.ENTS.fires=[];IB.ENTS.shaheds=[];IB.ENTS.parts=[];IB.ENTS.decals=[];IB.ENTS.pickups=[];IB.ENTS.survivors=[];IB.ENTS.throws=[];
    const alive=W.zdefs.filter(d=>!d.dead).length;
    if(!st.cleared){
      W.zdefs.forEach((d,zi)=>{
        if(d.dead)return;
        const z=IB.makeZombie(d.t,d.x,d.y);
        z.def=zi;
      });
    }
    let sp=null;
    if(entry&&f===0){const dp=W.props.find(q=>q.meta==='exit');if(dp)sp={x:dp.x,y:dp.y-1};}
    else{
      const stp=W.props.find(q=>q.meta===(f>0&&entry?'fdown':'fup'))||W.props.find(q=>q.meta==='exit');
      if(stp)sp={x:stp.x,y:stp.y};
    }
    const fs=IB.snapFree(sp?sp.x:W.W/2,sp?sp.y:W.H/2);
    p.x=fs.x;p.y=fs.y;
    IB.cam.x=p.x;IB.cam.y=p.y;
    IB.AUDIO.sfx('door');
    const st2=IB.bldState(bi);
    IB.banner(IB.WORLD.zoneName());
    if(!st2.cleared&&alive>0)IB.toast('ЗАРАЖЕНІ ВСЕРЕДИНІ: '+alive+' • ЗАЧИСТИ ПОВЕРХ!','red');
    else if(st2.cleared)IB.toast('БУДІВЛЯ ЗВІЛЬНЕНА • ТИХО І БЕЗПЕЧНО (30-40 ХВ)','gold');
    IB.SYS.save();
  },
  exitInterior(){
    const p=IB.PL;
    const wasBase=!!(IB.INT&&IB.INT.base);
    const bi=IB.INT?IB.INT.bi:-1;
    let dp=null;
    if(wasBase){dp=IB.WORLD.exitTo||{x:IB.CWORLD.base.x,y:IB.CWORLD.base.y+1.6};}
    else{const b=IB.CWORLD.blds[bi];dp=b.door||{x:b.x,y:b.y+b.dT};}
    IB.layer='city';IB.WORLD=IB.CWORLD;IB.INT=null;
    IB.ENTS.zombies=[];IB.ENTS.bullets=[];IB.ENTS.fires=[];IB.ENTS.shaheds=[];IB.ENTS.parts=[];IB.ENTS.decals=[];IB.ENTS.pickups=[];IB.ENTS.survivors=[];IB.ENTS.throws=[];
    const f=IB.snapFree(dp.x,dp.y+0.9);
    p.x=f.x;p.y=f.y;
    IB.cam.x=p.x;IB.cam.y=p.y;
    if(!wasBase){
      IB.bldState(bi).floor=0;
      const st=IB.bldState(bi);
      IB.banner(st.cleared?'ЗВІЛЬНЕНА БУДІВЛЯ • ВИХІД':'ВИЙШОВ НА ВУЛИЦЮ • ОЗИРНИСЬ');
    } else {
      IB.banner("БАЗА ВВ13 • ВИЙШОВ НА ПОДВІР'Я");
    }
    IB.AUDIO.sfx('door');
    IB.NOISE.push({x:p.x,y:p.y,r:2,t:'door'});
    IB.SYS.save();
  },
  clearedCheck(){
    const W=IB.WORLD,G=IB.G;
    if(!W||!W.interior||!W.zdefs)return;
    const bi=W.bld;
    if(bi==null||bi<0)return;               /* база ВВ13 — без заражених */
    const st=IB.bldState(bi);
    if(st.cleared)return;
    const b=IB.CWORLD.blds[bi];
    let infested=0;
    for(let f=0;f<(b.floors||2);f++){
      const iw=IB.INTERIORS[bi+'_'+f];
      if(iw&&iw.zdefs)for(const d of iw.zdefs)if(!d.dead)infested++;
    }
    if(infested===0){
      st.cleared=1;st.t=G.playT||0;
      G.stats.bld=(G.stats.bld||0)+1;
      IB.AUDIO.sfx('mission');
      IB.banner('БУДІВЛЮ ЗВІЛЬНЕНО • ЗОМБІ ПОВЕРНУТЬСЯ ЧЕРЕЗ 30-40 ХВ');
      IB.toast('НА КАРТІ БУДИНОК СТАВ ЗЕЛЕНИМ • ВСЕРЕДИНІ МОЖНА ХОВАТИСЬ І ВІДПОЧИВАТИ','gold');
      const z=b.zone;
      let tot=0,clr=0;
      for(let i=0;i<IB.CWORLD.blds.length;i++){
        const bb=IB.CWORLD.blds[i];
        if(!bb.door||bb.zone!==z)continue;
        tot++;
        if(IB.bldState(i).cleared)clr++;
      }
      if(tot>0&&clr>=tot&&!G.flags['zcl'+z]){
        G.flags['zcl'+z]=1;G.stats.zones=(G.stats.zones||0)+1;
        IB.banner('РАЙОН ЗЧИЩЕНО: '+(IB.ZONES[z]?IB.ZONES[z].n:'')+' • '+tot+' БУДИНКІВ','gold');
        IB.AUDIO.sfx('radio');
      }
      IB.SYS.save();
    } else {
      const alive=W.zdefs.filter(d=>!d.dead).length;
      if(alive===0&&!W.floorToast){
        W.floorToast=1;
        IB.toast('ПОВЕРХ ЗАЧИЩЕНО • СХОДИ ВГОРУ — ДАЛІ ЗАРАЖЕНІ','gold');
      }
    }
  },
  recaptureTick(){
    const G=IB.G;
    if(!G.blds)return;
    const playT=G.playT||0;
    let re=0;
    for(const k in G.blds){
      const st=G.blds[k];
      if(!st.cleared)continue;
      const bi=+k;
      const win=1800+((IB.hsh(bi,1,166)*600)|0);      /* 30-40 хв */
      if(playT-st.t>win){
        st.cleared=0;st.t=0;st.floor=0;
        const b=IB.CWORLD.blds[bi];
        if(b)for(let f=0;f<(b.floors||2);f++){
          const iw=IB.INTERIORS[bi+'_'+f];
          if(iw){iw.clearedFlag=false;iw.floorToast=0;if(iw.zdefs)for(const d of iw.zdefs)d.dead=false;}
        }
        re++;
        if(IB.INT&&IB.INT.bi===bi)IB.toast('ЦЮ БУДІВЛЮ ЗНОВУ ЗАХОПИЛИ — ЗОМБІ ПОВЕРТАЮТЬСЯ!','red');
      }
    }
    if(re>0){
      IB.toast('ДИНАМІКА МІСТА: '+re+' БУД. ЗНОВУ ЗАРАЖЕНО (ЧЕРВОНІ НА КАРТІ)','red');
      IB.AUDIO.sfx('growl');
      IB.SYS.save();
    }
  },
  workbench(){
    IB.dialog('ВЕРСТАК • МАЙСТЕРНЯ БАЗИ ВВ13','Робочий стіл з інструментами. Генератор гудить. Тут можна крафтити патрони з запчастин і збирати приладдя.',[
      {t:'КРАФТ (ПАТРОНИ, ГРАНАТИ, БИНТИ)',f:()=>{IB.MAIN&&IB.MAIN.openInv&&IB.MAIN.openInv();}},
      {t:'ЗАКРИТИ',f:()=>{}},
    ]);
  },
  /* ---------- ініт нової гри ---------- */
  newGame(){
    IB.initEnts();
    const G=IB.G;
    IB.layer='city';IB.HIDE=null;
    if(IB.CWORLD)IB.WORLD=IB.CWORLD;    /* нова гра починається на поверхні */
    G.t=8;G.day=1;G.mi=0;G.mdone=[];G.flags={};G.stash={};G.visited={};G.deaths=0;G.evT=100;G.ending=false;
    G.stats={att:0,saved:0,bld:0,zones:0};
    G.blds={};G.playT=0;
    IB.INTERIORS={};
    G.shah={t:IB.rnd(260,330),phase:null,s1:false,sirT:0,spawnN:0,count:0,targets:[],tip:false,offT:0};
    G.survT=IB.rnd(70,110);G.atBase=false;
    IB.clearMissionAreas();
    IB.MAIL&&IB.MAIL.spawn&&IB.MAIL.spawn();   /* квест «НЕДОСТАВЛЕНІ»: конверти по районах */
    const sp=IB.snapFree(331.5,111.5);   /* двір на Оболоні: батч 16 +60,+80; батч 17 +240 */   /* двір на Оболоні (батч 16: контент зсунутий на +60,+80) */
    G.spawn={x:sp.x,y:sp.y};
    IB.PL.x=sp.x;IB.PL.y=sp.y;
    G.visited[0]=true;
    IB.toast('КВАРТИРА ВІКТОРА — ОБОЛОНЬ');
    IB.banner('ОБОЛОНЬ • ДЕНЬ 1');
    IB.toast('КВЕСТ «НЕДОСТАВЛЕНІ»: ПО МІСТУ ЛИШАЛИСЬ ЛИСТИ — ШУКАЙ ЖОВТІ КОНВЕРТИ (TAB — КАРТА)','gold');
    IB.SYS.spawnStartProps();
  },
  spawnStartProps(){ /* перші заражені довкола, не перед носом */
    for(let i=0;i<6;i++)IB.SYS.trySpawn(13,19);
  },
  /* ---------- пошук взаємодій ---------- */
  interactables(){
    const p=IB.PL,W=IB.WORLD,G=IB.G,out=[];
    if(!p)return out;
    const city=IB.layer==='city';       /* тільки на вулицях (не метро, не інтер'єр) */
    /* ---------- ІНТЕР'ЄР: власні взаємодії ---------- */
    if(W&&W.interior){
      for(const pr of W.props){
        const d=IB.dist(p.x,p.y,pr.x,pr.y);
        if(pr.meta==='exit'&&d<1.8)out.push({d,label:'E — ВИЙТИ НА ВУЛИЦЮ',act:()=>IB.SYS.exitInterior(),kind:'exit'});
        else if(pr.meta==='fup'&&d<1.8)out.push({d,label:'E — СХОДИ ВГОРУ (ПОВЕРХ '+(IB.INT.floor+2)+' З '+W.floors+')',act:()=>IB.SYS.enterFloor(IB.INT.floor+1),kind:'st'});
        else if(pr.meta==='fdown'&&d<1.8)out.push({d,label:'E — СХОДИ ВНИЗ (ПОВЕРХ '+IB.INT.floor+')',act:()=>IB.SYS.enterFloor(IB.INT.floor-1),kind:'st'});
        else if(pr.t==='furn_bed'&&d<1.6&&(W.bld<0||IB.bldState(W.bld).cleared))out.push({d,label:'E — ВІДПОЧИТИ (ДО 08:00, +40 HP)',act:()=>IB.SYS.rest(),kind:'rest'});
        else if(pr.meta==='radio103'&&d<2.0)out.push({d,label:'E — РАДІО 103.1 «НІЧНА ГОЛОСНА» • ЕФІР ЛИСТІВ',act:()=>IB.SYS.radio103(),kind:'radio'});
        else if(pr.meta==='stash'&&d<1.6)out.push({d,label:'E — СКЛАД БАЗИ ВВ13 — ПОКЛАСТИ / ЗАБРАТИ',act:()=>IB.SYS.stashUI(),kind:'stash'});
        else if(pr.meta==='save'&&d<1.6)out.push({d,label:'E — ТЕРМІНАЛ: ЗБЕРЕГТИ ГРУ',act:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО НА БАЗІ ВВ13');IB.AUDIO.sfx('sel');},kind:'save'});
        else if(pr.meta==='maptbl'&&d<1.6)out.push({d,label:'E — ПЛАН МІСТА (ВЕЛИКА КАРТА)',act:()=>{IB.MAIN&&IB.MAIN.openMap&&IB.MAIN.openMap();},kind:'map'});
        else if(pr.meta==='craft'&&d<1.8)out.push({d,label:'E — ВЕРСТАК: КРАФТ ПАТРОНІВ/ПРИЛАДЬ',act:()=>IB.SYS.workbench(),kind:'craft'});
        else if(pr.loot&&!pr.looted&&d<1.4)out.push({d,label:'E — ОГЛЯНУТИ '+(pr.t==='shelf'?'ПОЛИЦЮ':pr.t==='dumpster'?'КОНТЕЙНЕР':pr.t==='barrels'?'БОЧКИ':pr.t==='crate'?'ЯЩИК':''),act:()=>IB.SYS.search(pr),kind:'loot'});
      }
      out.sort((a,b)=>a.d-b.d);
      return out;
    }
    if(IB.HIDE){out.push({d:0,label:'E — ВИЙТИ НА ВУЛИЦЮ',act:()=>IB.SYS.unhide(),kind:'hide'});return out;}
    /* сюжетна точка (тільки на поверхні) */
    const m=IB.MISSIONS[G.mi];
    if(city&&m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x, ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      const d=IB.dist(p.x,p.y,tx+0.5,ty+0.5);
      const lbl=(m.two&&G.flags['m6a'])?'ВІДДАТИ НАСОС У ТАБІР':m.t;
      if(d<m.r+0.6)out.push({d,label:'E — '+lbl,act:()=>IB.SYS.missionPoint(),kind:'mission'});
    }
    if(city)for(const s of W.safes){const d=IB.dist(p.x,p.y,s.x+0.5,s.y+0.5);if(d<1.4)out.push({d,label:'E — СХОВАНКА: '+s.n,act:()=>IB.SYS.safehouse(s),kind:'safe'});}
    /* МЕТРО: на поверхні — спуск у підземку (батч 10) */
    if(city)for(const st of W.stations){const d=IB.dist(p.x,p.y,st.x+0.5,st.y+0.5);if(d<1.6)out.push({d,label:'E — МЕТРО «'+st.n+'» — СПУСТИТИСЯ У ПІДЗЕМКУ',act:()=>IB.SYS.metroDialog(st),kind:'metro'});}
    for(const pr of W.props){
      const d=IB.dist(p.x,p.y,pr.x,pr.y);
      if(pr.meta==='up'&&d<1.4)out.push({d,label:'E — СХОДИ НАГОРУ: НА ПОВЕРХНЮ',act:()=>IB.SYS.ascend(),kind:'up'});
      else if(pr.meta==='enter'&&city&&!IB.HIDE&&d<1.3&&pr.bld!==undefined){
        const bb=IB.CWORLD.blds[pr.bld],stt=IB.bldState(pr.bld);
        out.push({d,label:stt.cleared
          ?'E — ЗАЙТИ В БУДІНОК (БЕЗПЕЧНО • МОЖНА СХОВАТИСЬ)'
          :'E — УВІЙТИ В БУДІВЛЮ • '+(bb.floors||2)+' ПОВЕРХИ • ЗАЧИСТИТИ',act:()=>IB.SYS.enterBuilding(pr),kind:'enter'});
      }
      else if(pr.meta==='vv13'&&city&&d<1.6)out.push({d,label:'E — БАЗА ВВ13 • КПІ — ЗАЙТИ ВСЕРЕДИНУ (СКЛАД • КРАФТ • ВІДПОЧИНОК)',act:()=>IB.SYS.enterBase(),kind:'base'});
      else if(pr.meta==='pass'&&city&&d<1.25)out.push({d,label:'E — СПУСТИТИСЯ У ПІДЗЕМНИЙ ПЕРЕХІД',act:()=>IB.SYS.passage(pr),kind:'pass'});
      else if(pr.meta==='pump'&&city&&d<1.5)out.push({d,label:'E — АЗС: ЗАПРАВКА АВТО (КАНІСТРИ: '+IB.SYS.fuelCount()+')',act:()=>IB.SYS.refuel(pr),kind:'pump'});
      else if(city&&pr.loot==='gate'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО ПІДМУРКІВ',act:()=>IB.SYS.deep(pr,'ПІДМУРКИ ЗОЛОТИХ ВОРІТ'),kind:'deep'});
      else if(city&&pr.loot==='caves'&&d<1.3)out.push({d,label:'E — УВІЙТИ ДО ПЕЧЕР',act:()=>IB.SYS.deep(pr,'ДАЛЬНІ ПЕЧЕРИ ЛАВРИ'),kind:'deep'});
      else if(city&&pr.loot==='museum'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО МУЗЕЮ',act:()=>IB.SYS.deep(pr,'ЗАКРИТІ ПОВЕРХИ МУЗЕЮ'),kind:'deep'});
      else if(city&&pr.loot==='podil'&&d<1.3)out.push({d,label:'E — СПУСТИТИСЯ ДО ПІДВАЛУ',act:()=>IB.SYS.deep(pr,'ПОДІЛЬСЬКИЙ ПІДВАЛ'),kind:'deep'});
      else if(city&&pr.loot==='andrew'&&d<1.3)out.push({d,label:'E — УВІЙТИ ДО КЛАДОВИ',act:()=>IB.SYS.deep(pr,'КЛАДОВА АНДРІЇВСЬКОЇ ЦЕРКВИ'),kind:'deep'});
      else if(pr.loot&&!pr.looted&&d<1.4)out.push({d,label:'E — ОГЛЯНУТИ '+(pr.t==='shelf'?'ПОЛИЦІ':pr.t==='dumpster'?'КОНТЕЙНЕР':pr.t==='barrels'?'БОЧКИ':pr.t==='cache'?'ТАЙНИК':pr.t==='crate'?'ЯЩИК':pr.t==='kiosk'?'КІОСК':pr.t==='well'?'КРИНИЦЮ':''),act:()=>IB.SYS.search(pr),kind:'loot'});
    }
    /* КВЕСТ «НЕДОСТАВЛЕНІ»: конверти листів (тільки на поверхні) */
    if(city&&W.letters)for(const lt of W.letters){const d=IB.dist(p.x,p.y,lt.x,lt.y);if(d<1.7)out.push({d,label:'E — ПРОЧИТАТИ ЛИСТ • '+((IB.ZONES[lt.z]||{}).n||'КИЇВ'),act:()=>IB.MAIL.openLetter(lt.id),kind:'mail'});}
    if(city)for(const c of W.cars){
      const d=IB.dist(p.x,p.y,c.x,c.y);
      if(d<1.45&&!p.car)out.push({d,c,label:c.broken?'E — ОГЛЯНУТИ АВТО':'E — СІСТИ: '+(IB.SPR.CARS[c.mdl].name).toUpperCase(),act:c.broken?()=>IB.SYS.carLoot(c):()=>IB.enterCar(c),kind:'car'});
    }
    if(city)for(let i=0;i<W.towers.length;i++){
      const tw=W.towers[i];const d=IB.dist(p.x,p.y,tw.x+0.5,tw.y+0.5);
      if(d<2.0)out.push({d,label:G.flags['radio'+i]?'E — РАДІОСИГНАЛ (ПРОСЛУХАТИ ЗНОВУ)':'E — РАДІОСИГНАЛ: '+tw.n,act:()=>IB.SYS.radioTower(i),kind:'radio'});
    }
    if(city)for(const np of W.npcs){const d=IB.dist(p.x,p.y,np.x,np.y);if(d<1.3)out.push({d,label:'E — '+np.n,act:()=>IB.SYS.talk(np),kind:'npc'});}
    if(city)for(const s of IB.ENTS.survivors){
      if(s.hidden)continue;
      const d=IB.dist(p.x,p.y,s.x,s.y);
      if(s.state==='help'&&d<1.7)out.push({d,label:'E — ЗАБРАТИ З СОБОЮ: '+s.name,act:()=>IB.SYS.recruit(s),kind:'surv'});
      else if(s.state==='follow'&&d<2.2)out.push({d,label:s.name+' — ІДЕ ЗА ТОБОЮ • ВЕДИ НА БАЗУ ВВ13',act:()=>{},kind:'survf'});
    }
    /* БАЗА ВВ13: вхід через двері на фасаді (meta 'vv13'); подвір'я лишається безпечною зою */
    out.sort((a,b)=>a.d-b.d);
    return out;
  },
  /* ---------- діалог входу метро (батч 10) ---------- */
  metroDialog(st){
    IB.dialog('МЕТРО «'+st.n+'»','У темряві сходи вниз. Підземка досі веде крізь усе місто: від Оболоні до Печерська. У тунелях темно і хтось там ходить. Зато шахеди сюди не дістануть.',[
      {t:'СПУСТИТИСЯ У ПІДЗЕМКУ',f:()=>IB.SYS.descend(st)},
      {t:'ЗАЛИШИТИСЯ НАГОРІ',f:()=>{}},
    ]);
  },
  /* ---------- місії ---------- */
  missionPoint(){
    const G=IB.G,m=IB.MISSIONS[G.mi];
    if(m.two&&!G.flags['m6a']){
      if(IB.dist(IB.PL.x,IB.PL.y,m.x+0.5,m.y+0.5)<m.r){
        IB.dialog('МІСІЯ: '+m.t,m.d+' Частина насоса — на Річковому вокзалі Подолу? Ні: насос вже тут, у підвалі. Візьми його.',[
          {t:'ВЗЯТИ ЧАСТИНУ НАСОСА',f:()=>{
            G.flags['m6a']=1;IB.addItem('pump_p',1);IB.toast('+ ЧАСТИНА НАСОСА');IB.AUDIO.sfx('pickup');
            IB.dialog('МІСІЯ: '+m.t,'Тепер віднеси частину насоса до табору на Гідропарку. Оля чекає.',[{t:'ДОБРЕ',f:()=>{}}]);
          }},{t:'ПІЗНІШЕ',f:()=>{}},
        ]);
        return;
      }
    }
    if(m.two&&G.flags['m6a']&&IB.hasItem('pump_p')){
      IB.dialog('ТАБІР ГІДРОПАРК','Оля: «Насос! Ти зробив це. Тепер у таборі буде вода.»',[{t:'ВІДДАТИ ЧАСТИНУ',f:()=>{IB.takeItem('pump_p',1);IB.SYS.completeMission();}},{t:'ПІЗНІШЕ',f:()=>{}}]);
      return;
    }
    IB.dialog('МІСІЯ: '+m.t,m.d+'\n\n'+(m.lore||''),[{t:'ПРОДОВЖИТИ',f:()=>{IB.SYS.completeMission();}},{t:'ПІЗНІШЕ',f:()=>{}}]);
  },
  completeMission(){
    const G=IB.G,m=IB.MISSIONS[G.mi];
    if(!m)return;
    G.mdone.push(G.mi);
    for(const k in m.reward||{})IB.addItem(k,m.reward[k]);
    IB.AUDIO.sfx('mission');
    IB.banner('МІСІЮ ВИКОНАНО • '+m.t);
    if(m.final){
      G.ending=true;
      setTimeout(()=>{IB.MAIN&&IB.MAIN.showEnd();},2600);
      IB.SYS.save();
      return;
    }
    G.mi++;
    IB.toast('НОВА ЦІЛЬ: '+IB.MISSIONS[G.mi].t,'gold');
    IB.SYS.save();
  },
  /* ---------- взаємодії ---------- */
  /* БАТЧ 14: заправка на АЗС — каністра з рюкзака → бак найближчого авто */
  fuelCount(){
    return (IB.PL&&IB.PL.inv&&IB.PL.inv.fuel)||0;
  },
  refuel(pr){
    const p=IB.PL;
    if(!p)return;
    let car=p.car||null,bd=1e9;
    if(!car&&IB.WORLD)for(const c of IB.WORLD.cars){
      if(c.broken)continue;
      const d=IB.dist(pr.x,pr.y,c.x,c.y);
      if(d<3.4&&d<bd){bd=d;car=c;}
    }
    if(!car){IB.toast("ПІД'ЇДЬ АВТО ДО КОЛОНКИ АЗС",'red');return;}
    if(!IB.hasItem('fuel')){IB.toast('ПОТРІБНА КАНІСТРА ПАЛЬНОГО — ШУКАЙ У БОЧКАХ/НА АЗС','red');return;}
    IB.takeItem('fuel',1);
    car.fuel=IB.M.min(100,car.fuel+45);
    IB.toast('АЗС: БАК +45% (ТЕПЕР '+IB.M.round(car.fuel)+'%)','gold');
    IB.AUDIO.sfx('pickup');
  },
  search(pr){
    if(IB.G.search)return;
    IB.G.search={t:0.9,prop:pr};
    IB.AUDIO.sfx('door');
  },
  finishSearch(pr){
    /* схованка з листа (квест «НЕДОСТАВЛЕНІ»): гарантований лут автора */
    if(pr.meta==='mailstash'){
      pr.looted=true;
      for(const en of (pr.mailLoot||[])){IB.addItem(en[0],en[1]);IB.toast('+ '+((IB.SPR.itemsDB[en[0]]||{}).n||en[0])+(en[1]>1?' ×'+en[1]:''),'gold');}
      IB.AUDIO.sfx('pickup');
      IB.banner('СХОВАНКА З ЛИСТА • '+(pr.mailN||'АВТОР'));
      IB.SYS.save();
      return;
    }
    pr.looted=true;
    const table=IB.LOOT[pr.loot]||['cloth'];
    const n=IB.ri(1,2);
    for(let i=0;i<n;i++){
      const id=table[IB.ri(0,table.length-1)];
      IB.addItem(id,id==='ammo'?IB.ri(5,12):1);
      const nm=(IB.SPR.itemsDB[id]||{}).n||id;
      IB.toast('+ '+nm,'gold');
    }
    IB.AUDIO.sfx('pickup');
    /* засідка у підвалів */
    if(['gate','caves','museum','podil','andrew'].indexOf(pr.loot)>=0){
      const kinds=['guardian','crawler','guardian'];
      for(let i=0;i<2;i++)IB.SYS.trySpawnAt(IB.PL.x+IB.rnd(-3,3),IB.PL.y+IB.rnd(-3,3),kinds[i%2]);
      IB.toast('ЗАСІДКА! З ГЛИБИНИ ЙДУТЬ…','red');IB.AUDIO.sfx('growl');
    }
  },
  deep(pr,name){
    IB.dialog(name,'Темрява. Краплі води. На стінах — сліди чужих пальців.\n\n(тут сховані ресурси і небезпека)',[{t:'ОГЛЯНУТИ СХОВАНОК',f:()=>IB.SYS.finishSearch(pr)},{t:'ВІЙТИ',f:()=>{IB.toast('ТИХО… ТУТ ХТОСЬ Є','red');}}]);
  },
  carLoot(c){
    if(c.looted){IB.toast('ПУСТО');return;}
    c.looted=true;
    const id=['parts','cloth','ammo','fuel'][IB.ri(0,3)];
    IB.addItem(id,id==='ammo'?IB.ri(5,10):1);
    IB.toast('+ '+((IB.SPR.itemsDB[id]||{}).n||id),'gold');
    IB.AUDIO.sfx('door');
  },
  passage(pr){
    const W=IB.WORLD;
    const p=W.passages.find(pp=>IB.dist(pp.a[0]+0.5,pp.a[1]+0.5,pr.x,pr.y)<0.6||IB.dist(pp.b[0]+0.5,pp.b[1]+0.5,pr.x,pr.y)<0.6);
    if(!p)return;
    const from=IB.dist(p.a[0]+0.5,p.a[1]+0.5,pr.x,pr.y)<0.6?p.b:p.a;
    IB.MAIN&&IB.MAIN.fadeTo(()=>{const f=IB.snapFree(from[0]+0.5,from[1]+1.4);IB.PL.x=f.x;IB.PL.y=f.y;IB.clearNear(10);});
    IB.banner(p.n);IB.AUDIO.sfx('door');
  },
  safehouse(s){
    const sp=IB.snapFree(s.x+1.2,s.y+1.2);
    IB.G.spawn={x:sp.x,y:sp.y,n:s.n};
    const opts=[
      {t:'ВІДПОЧИТИ (ДО 08:00, +40 HP)',f:()=>IB.SYS.rest()},
      {t:'СКЛАД — ПОКЛАСТИ / ЗАБРАТИ',f:()=>IB.SYS.stashUI()},
      {t:'ЗБЕРЕГТИ ГРУ',f:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО');IB.AUDIO.sfx('sel');}},
    ];
    IB.dialog('СХОВАНКА: '+s.n,'Тут пахне домом. Генератор гудить. Можна відпочити, скласти зайве і зберегти прогрес.',opts);
  },
  rest(){
    const G=IB.G;
    G.t=8;G.day++;
    IB.PL.hp=IB.M.min(100,IB.PL.hp+40);IB.PL.st=100;
    IB.PL.hu=IB.M.max(15,IB.PL.hu-18);IB.PL.wa=IB.M.max(15,IB.PL.wa-15);
    IB.banner('ДЕНЬ '+G.day+' • 08:00');
    IB.ENTS.zombies=IB.ENTS.zombies.filter(z=>IB.dist(z.x,z.y,IB.PL.x,IB.PL.y)>14);
    IB.SYS.spawnStartProps();
    IB.SYS.save();
  },
  stashUI(){
    const items=Object.keys(IB.PL.inv).filter(k=>['ammo','machete'].indexOf(k)<0);
    const opts=items.map(id=>({t:'ПОКЛАСТИ: '+((IB.SPR.itemsDB[id]||{}).n||id)+' ×'+IB.PL.inv[id],f:()=>{
      IB.addItemTo(IB.G.stash,id,1);IB.takeItem(id,1);IB.AUDIO.sfx('sel');IB.SYS.stashUI();
    }}));
    const st=Object.keys(IB.G.stash).filter(k=>IB.G.stash[k]>0);
    for(const id of st)opts.push({t:'ЗАБРАТИ: '+((IB.SPR.itemsDB[id]||{}).n||id)+' ×'+IB.G.stash[id],f:()=>{
      IB.addItem(id,1);IB.G.stash[id]--;if(IB.G.stash[id]<=0)delete IB.G.stash[id];IB.AUDIO.sfx('sel');IB.SYS.stashUI();
    }});
    opts.push({t:'ЗАКРИТИ СКЛАД',f:()=>{}});
    IB.dialog('СКЛАД СХОВАНКИ','Речі з рюкзака й складу. Обери дію.',opts);
  },
  radioTower(i){
    const G=IB.G,tw=IB.WORLD.towers[i];
    const lore=[
      '«Ірпінь, дачний масив… ми сховались на горищі. Лісом до Києва — тільки вночі, сосни гулкі.» Сигнал обривається.',
      '«Тут Гідропарк. Табір живий. Не йдіть на Лівий берег ночі — там ходить щось велике.»',
      '«Старе місто… ми замкнулись у дзвіниці Софії. Дзвін — це сигнал. Три удари — небезпека.»',
      '«Печерськ… Лавра не відповідає. У печерах бути НЕ можна без світла.»',
      '«Дарниця, промзона. Тут пальне. І тут — ОРДА. Тихо, чуєте? ТИХО…»',
    ];
    const first=!G.flags['radio'+i];
    G.flags['radio'+i]=1;
    if(first){IB.addItem('ammo',8);IB.toast('+ ПАТРОНИ ×8 (СХОВАНО БІЛЯ ВЕЖІ)','gold');}
    IB.dialog('РАДІОСИГНАЛ • '+tw.n,lore[i],[{t:'ЗАКРИТИ',f:()=>{}}]);
    IB.AUDIO.sfx('radio');
  },
  talk(np){
    if(np.role==='trader'){
      const opts=[
        {t:'ОБМІН: 2 ЗАПЧАСТИНИ → 10 ПАТРОНІВ',f:()=>{
          if(IB.takeItem('parts',2)){IB.addItem('ammo',10);IB.AUDIO.sfx('pickup');IB.toast('+ ПАТРОНИ ×10');}
          else IB.toast('НЕМА 2 ЗАПЧАСТИН','red');
          IB.SYS.talk(np);
        }},
        {t:'ОБМІН: 3 КОНСЕРВИ → АПТЕЧКА',f:()=>{
          if(IB.takeItem('food',3)){IB.addItem('medkit',1);IB.AUDIO.sfx('pickup');IB.toast('+ АПТЕЧКА');}
          else IB.toast('НЕМА 3 КОНСЕРВІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'«ЩО ЧУЄШ?»',f:()=>{IB.dialog('ВАЛЕНТИНА','«Орда йде з Майдану ночами. А ще: у метро тихо, тільки не бігай по платформах.»',[{t:'ДЯКУЮ',f:()=>{}}]);}},
        {t:'ВИЙТИ',f:()=>{}},
      ];
      IB.dialog('ВАЛЕНТИНА • КОНТРАКТОВА ПЛОЩА','«Товар є. Патрони — золото. Міняй та живи.»',opts);
    } else if(np.role==='trader2'){
      const G=IB.G;
      const opts=[
        {t:'ОБМІН: 4 ПАТРОНИ → ТУШОНКА',f:()=>{
          if(IB.takeItem('ammo',4)){IB.addItem('stew',1);IB.AUDIO.sfx('pickup');IB.toast('+ ТУШОНКА');}
          else IB.toast('НЕМА 4 ПАТРОНІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'ОБМІН: 2 КОНСЕРВИ → ВОДА ×2',f:()=>{
          if(IB.takeItem('food',2)){IB.addItem('water',2);IB.AUDIO.sfx('pickup');IB.toast('+ ВОДА ×2');}
          else IB.toast('НЕМА 2 КОНСЕРВІВ','red');
          IB.SYS.talk(np);
        }},
        {t:'«ЩО ТУТ, НА ЛІВОМУ?»',f:()=>{IB.dialog('ГАНЯ','«Тихо. Занадто тихо. І ще: у промзоні без протигаза краще не ходи — хімія з заводів досі висить над Дарницею.»',[{t:'ДЯКУЮ',f:()=>{}}]);}},
        {t:'ВИЙТИ',f:()=>{}},
      ];
      IB.dialog('ГАНЯ • ЛІВОБЕРЕЖЖЯ','«Все міняю: тушонку на патрони, патрони на їжу. Виживаємо як умеємо.»',opts);
    } else if(np.role==='guard'){
      const G=IB.G;
      if(!G.flags.guardMet){
        G.flags.guardMet=1;IB.addItem('energy',1);IB.addItem('ammo',6);
        IB.AUDIO.sfx('pickup');IB.toast('+ ЕНЕРГЕТИК, ПАТРОНИ ×6','gold');
      }
      IB.dialog('ПАТОН • МЕТРОМІСТ','«Я тримаю цей міст з першого дня. Переходь швидко і не шумій — внизу під мостом хтось дихає.»',[{t:'ДОБРЕ',f:()=>{}}]);
    } else if(np.role==='camp'){
      IB.dialog('СЕРГІЙ • ТАБІР','«Київ впав, але не здався. Тримайся острова, слухай вежі, і коли буде сила — піднімись до Матері-Батьківщини. Там передавач.»',[{t:'ДЯКУЮ',f:()=>{}}]);
    } else {
      const G=IB.G;
      if(G.flags['heal'+G.day]){IB.dialog('ОЛЯ','«Я вже допомогла тобі сьогодні. Береги себе.»',[{t:'ОК',f:()=>{}}]);}
      else{
        G.flags['heal'+G.day]=1;IB.PL.hp=IB.M.min(100,IB.PL.hp+30);
        IB.AUDIO.sfx('heal');IB.dialog('ОЛЯ • МЕДСЕСТРА','«Сідай, перев’яжу… Живи, чуєш? Живи.» (+30 HP)',[{t:'ДЯКУЮ',f:()=>{}}]);
      }
    }
  },
  /* ---------- БАЗА ВВ13 • КПІ: безпечне місце + склад + верстак ---------- */
  mm13(){
    const B=IB.WORLD.base,p=IB.PL;
    const sp=IB.snapFree(B.x,B.y+1.2);
    IB.G.spawn={x:sp.x,y:sp.y,n:'БАЗА ВВ13'};
    const s=IB.G.stats;
    IB.dialog('БАЗА ВВ13 • КПІ','Безпечна зона. Калітка закрита, генератор гудить, на даху — синьо-жовтий прапор. Тут складаєш усе що зібрав, крафтиш патрони й гранати на верстаку і перепочиваєш.\n\nСТАТИСТИКА: заражених знищено '+ (p.kills||0) +' • атак пережито '+s.att+' • людей врятовано '+s.saved,[
      {t:'ВІДПОЧИТИ (ДО 08:00, +40 HP)',f:()=>IB.SYS.rest()},
      {t:'СКЛАД — ПОКЛАСТИ / ЗАБРАТИ',f:()=>IB.SYS.stashUI()},
      {t:'ВЕРСТАК — КРАФТ (ПАТРОНИ, ГРАНАТИ)',f:()=>{IB.MAIN&&IB.MAIN.openInv&&IB.MAIN.openInv();}},
      /* КВЕСТ «НЕДОСТАВЛЕНІ»: фінальний ефір, коли всі листи зібрані */
      (IB.MAIL&&IB.MAIL.progress().read>=IB.MAIL.TOTAL&&!IB.G.flags.mailFin
        ?{t:'ЕФІР 103.1 — ПОСТАВИТИ ЛИСТИ В ГОЛОС (КВЕСТ «НЕДОСТАВЛЕНІ»)',f:()=>IB.MAIL.finalBroadcast()}
        :null),
      {t:'ЗБЕРЕГТИ ГРУ',f:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО НА БАЗІ ВВ13');IB.AUDIO.sfx('sel');}},
    ].filter(Boolean));
    IB.AUDIO.sfx('radio');
  },
  /* ---------- ВЦІЛІЛІ: крик HELP → Е — забрати → веди на ВВ13 ---------- */
  recruit(s){
    if(s.state!=='help')return;
    s.state='follow';
    IB.AUDIO.sfx('sel');
    IB.dialog(s.name,'«ЛЕГЕНДО! Дякую тобі… Я за тобою. Тільки акуратно: заражені чують крик і бачать мене. Веди мене на базу ВВ13 — це поруч з вокзалом, у КПІ.»',[{t:'ЙДИ ЗА МНОЮ',f:()=>{}}]);
    IB.toast(s.name+' ІДЕ ЗА ТОБОЮ — ВЕДИ НА ВВ13','gold');
  },
  spawnSurvivorNear(){
    if(IB.layer!=='city')return;       /* вцілілі — тільки на вулицях (не метро/інтер'єр) */
    const p=IB.PL,W=IB.WORLD;
    if(IB.ENTS.survivors.length>=2)return;
    const a=IB.rnd(0,6.28),d=IB.rnd(13,19);
    const x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
    const tx=x|0,ty=y|0;
    if(!W.inb(tx,ty))return;
    if(W.solid(tx,ty)||W.ter[W.ridx(tx,ty)]===12)return;
    if(W.danger(W.zoneAt(tx,ty))===0)return;
    if(W.base&&IB.dist(x,y,W.base.x,W.base.y)<W.base.r+4)return;
    IB.makeSurvivor(W.freeSpot?W.freeSpot(x,y,4).x:x,W.freeSpot?W.freeSpot(x,y,4).y:y);
    IB.AUDIO.sfx('scream');
    IB.toast('ДЕСЬ ПОБЛИЗУ ХТОСЬ КРИЧИТЬ «HELP!»','gold');
  },
  /* ---------- захист від шахедів: в укритті (база/схованка/метро/будинок) ---------- */
  protectedFrom(){
    const p=IB.PL,W=IB.WORLD;if(!p||!W)return false;
    if(IB.layer==='metro')return true;               /* підземка — шахеди не дістануть */
    if(IB.layer==='interior')return true;            /* всередині будівлі — теж укриття (батч 13) */
    if(IB.HIDE)return true;                          /* сховався в будинку */
    if(W.base&&IB.dist(p.x,p.y,W.base.x,W.base.y)<W.base.r)return true;
    for(const s of W.safes)if(IB.dist(p.x,p.y,s.x+0.5,s.y+0.5)<2.1)return true;
    return false;
  },
  /* ---------- ПОВІТРЯНА АТАКА: раз на 5-10 хв (ЛИШЕ НА ПОВЕРХНІ — у метро не діє) ---------- */
  updateRaid(dt){
    const G=IB.G,S=G.shah,p=IB.PL,W=IB.WORLD;
    if(G.mode!=='game'||!p||!p.alive)return;
    if(!S.phase&&S.offT>0)S.offT-=dt;   /* "ВІДБІЙ" ще світиться якийсь час */
    if(IB.layer!=='city')return;         /* у метро та всередині будівель атака на паузі */
    if(!S.phase){
      S.t-=dt;
      if(S.t<=28&&!S.s1){S.s1=true;IB.AUDIO.sfx('siren');IB.banner('ПОВІТРЯНА ТРИВОГА');IB.toast('СИРЕНА: ШАХЕДИ НА ПІДЛЬОТІ — ШУКАЙ УКРИТТЯ','red');}
      if(S.t<=0){
        /* СТАРТ АТАКИ: 5-6 цілей по району, де ти зараз */
        S.phase='raid';S.s1=false;S.sirT=6;S.spawnN=0;S.tip=false;
        S.count=IB.ri(5,6);S.targets=[];
        for(let i=0;i<S.count;i++){
          const a=IB.rnd(0,6.28),d=IB.rnd(4,16);
          let x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
          x=IB.clamp(x,4,W.W-5);y=IB.clamp(y,4,W.H-5);
          if(W.ter[W.ridx(x|0,y|0)]===12){x=p.x;y=p.y;}
          S.targets.push({x:x+0.5,y:y+0.5});
        }
        IB.toast('ГРУПА ШАХЕДІВ ('+S.count+' шт) ЙДЕ НА РАЙОН: '+W.zoneName(W.zoneAt(p.x|0,p.y|0)),'red');
      }
    } else {
      S.sirT-=dt;
      if(S.sirT<=0){S.sirT=IB.rnd(7,11);IB.AUDIO.sfx('siren');}
      /* пускаємо шахеди з інтервалом */
      if(S.spawnN<S.count){
        S.sT=(S.sT||0)-dt;
        if(S.sT<=0){
          const tg=S.targets[S.spawnN%S.targets.length];
          IB.makeShahed(tg.x,tg.y);
          S.spawnN++;S.sT=IB.rnd(0.7,1.9);
          if(!S.tip){S.tip=true;IB.toast('ЧЕРВОНІ ХРЕСТИ НА ЗЕМЛІ — ТОЧКИ ПАДІННЯ. ВІДХОДИ','red');}
        }
      }
      /* підказка про укриття */
      if(!S.ptip&&IB.SYS.protectedFrom()){S.ptip=true;IB.toast('ТИ В УКРИТТІ — ШАХЕДИ ТЕБЕ НЕ ДОСТАНУТЬ','gold');}
      /* кінець атаки */
      if(S.spawnN>=S.count&&IB.ENTS.shaheds.length===0){
        S.phase=null;S.t=IB.rnd(300,600);   /* наступна через 5-10 хв */
        S.targets=[];S.ptip=false;S.offT=16; /* індикатор "ВІДБІЙ" на ~16с */
        if(p.alive){
          G.stats.att++;
          if(!G.shahHit)IB.toast('АТАКУ ПЕРЕЖИТО БЕЗ ВТРАТ','gold');
          IB.banner('ТРИВОГУ ВІДМІНЕНО • АТАК ПЕРЕЖИТО: '+G.stats.att);
        }
        G.shahHit=false;
        IB.SYS.save();
      }
    }
  },
  /* ---------- виживання ---------- */
  update(dt){
    const G=IB.G,p=IB.PL,W=IB.WORLD;
    if(G.mode!=='game'||!p)return;
    /* база ВВ13: у безпечній зоні — на подвір'ї АБО всередині бази (крафт) */
    G.atBase=!!(IB.INT&&IB.INT.base)||!!(W.base&&IB.dist(p.x,p.y,W.base.x,W.base.y)<W.base.r);
    /* ПОВІТРЯНА АТАКА */
    IB.SYS.updateRaid(dt);
    /* герої, що криять HELP */
    G.survT-=dt;
    if(G.survT<=0){
      G.survT=IB.rnd(95,150);
      IB.SYS.spawnSurvivorNear();
    }
    /* час */
    G.t+=dt*24/IB.DAY_LEN;
    G.playT=(G.playT||0)+dt;                         /* реальний час сесії (рекаптура будівель) */
    if(G.t>=24){G.t-=24;G.day++;IB.banner('ДЕНЬ '+G.day);IB.SYS.save();}
    /* БАТЧ 13: зачистка інтер'єрів + рекаптура */
    IB.SYS.clearedCheck();
    IB.SYS.recaptureTick();
    /* погода: сонце → вітер → дощ */
    IB.WX.t-=dt;
    if(IB.WX.t<=0)IB.WX.next();
    /* пошук */
    if(G.search){
      G.search.t-=dt;
      if(G.search.t<=0){const pr=G.search.prop;G.search=null;IB.SYS.finishSearch(pr);}
    }
    if(!p.alive){G.deaths++;return;}
    /* голод/спрага */
    const inCar=!!p.car;
    p.hu=IB.clamp(p.hu-dt*(100/520)*(inCar?0.7:1),0,100);
    p.wa=IB.clamp(p.wa-dt*(100/380)*(inCar?0.7:1),0,100);
    if(p.hu<=0||p.wa<=0)p.hp-=dt*2.2;
    else if(p.hu>50&&p.wa>50&&p.hp<100)p.hp=IB.M.min(100,p.hp+dt*0.9);
    if(p.hp<=0&&p.alive){p.alive=false;G.deaths++;}
    /* зона відвідування */
    const z=W.zoneAt(IB.PL.x,IB.PL.y);
    if(!G.visited[z]){
      G.visited[z]=true;
      IB.banner(W.zoneName(z));
      IB.AUDIO.sfx('landmark');
    }
    /* токсична промзона: без протигаза медленно шкідливо */
    if(z===10&&!G.flags.mask&&p.alive&&!p.car){
      p.hp-=dt*1.4;
      G.toxT=(G.toxT||0)+dt;
      if(G.toxT>6){G.toxT=0;IB.toast('ПРОМЗОНА ОТРУЙНА — ЗНАЙДИ ПРОТИГАЗ','red');IB.AUDIO.sfx('hurt');}
      if(p.hp<=0&&p.alive){p.hp=0;p.alive=false;}
    }
    /* спавн */
    IB.SYS.spawnT=(IB.SYS.spawnT||0)-dt;
    if(IB.SYS.spawnT<=0){
      IB.SYS.spawnT=1.7;
      IB.SYS.tickSpawns();
    }
    /* події */
    G.evT-=dt;
    if(G.evT<=0){G.evT=IB.rnd(110,170);IB.SYS.randomEvent();}
  },
  tickSpawns(){
    const W=IB.WORLD,p=IB.PL,E=IB.ENTS,G=IB.G;
    if(W&&W.interior)return;          /* в інтер'єрі зомбі тільки з zdefs поверху */
    const night=IB.nightFactor();
    const z=W.zoneAt(p.x,p.y);
    const danger=W.danger(z);
    const metro=IB.layer==='metro';
    /* у підземці кап нижчий: тунелі страшні, але не переповнені */
    const cap=metro?IB.M.min(18,6+danger*4):IB.M.min(46,12+danger*5+IB.M.round(night*danger*2.5));
    /* despawn далеких + заражені не заходять у безпечну зону ВВ13 */
    for(let i=E.zombies.length-1;i>=0;i--){
      const zz=E.zombies[i];
      if(IB.dist(zz.x,zz.y,p.x,p.y)>(metro?40:62))E.zombies.splice(i,1);
      else if(W.base&&IB.dist(zz.x,zz.y,W.base.x,W.base.y)<W.base.r)E.zombies.splice(i,1);
    }
    if(E.zombies.length>=cap)return;
    IB.SYS.trySpawn(14,22);
  },
  trySpawn(min,max){
    const W=IB.WORLD,p=IB.PL;
    const a=IB.rnd(0,6.28),d=IB.rnd(min,max);
    const x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
    IB.SYS.trySpawnAt(x,y,null);
  },
  trySpawnAt(x,y,forceType){
    const W=IB.WORLD,E=IB.ENTS,p=IB.PL;
    const tx=x|0,ty=y|0;
    if(!W.inb(tx,ty))return;
    const t=W.ter[W.ridx(tx,ty)];
    if(t===12||W.solid(tx,ty))return;
    if(IB.dist(x,y,p.x,p.y)<9)return;   /* не перед носом */
    if(W.base&&IB.dist(x,y,W.base.x,W.base.y)<W.base.r+2)return;   /* біля бази ВВ13 — безпечно */
    const night=IB.nightFactor()>=0.5;
    const danger=W.danger(W.zoneAt(tx,ty));
    if(danger===0)return;
    let type=forceType;
    if(!type){
      const r=IB.rnd(0,1);
      if(IB.layer==='metro'){
        /* фауна підземки: сліпі, повзуни і блукачі — темрява їм не завада */
        type=r<0.34?'blind':(r<0.62?'crawler':(r<0.88?'walker':'guardian'));
      }
      else if(danger<=2)type=r<0.72?'walker':(r<0.92?'runner':'crawler');
      else if(danger===3)type=r<0.45?'walker':(r<0.72?'runner':(r<0.82?'screamer':(r<0.92?'blind':'crawler')));
      else type=r<0.3?'walker':(r<0.58?'runner':(r<0.7?'screamer':(r<0.8?'blind':(r<0.9?(night&&IB.rnd(0,1)<0.2?'alpha':'brute'):'guardian'))));
    }
    IB.makeZombie(type,x,y);
  },
  randomEvent(){
    const r=IB.rnd(0,1),p=IB.PL;
    if(IB.layer==='metro'){IB.AUDIO.sfx('growl');IB.toast('ЩОСЬ СИЧИТЬ У ТУНЕНЯХ…');return;}
    if(IB.layer==='interior'){IB.AUDIO.sfx('growl');IB.toast('ЗА СТІНАМИ ХТОСЬ ХОДИТЬ…');return;}
    if(r<0.4){
      IB.toast('ОРДА ЗСУВАЄТЬСЯ ДО ТЕБЕ…','red');IB.AUDIO.sfx('alarm');
      const types=['walker','runner','screamer','walker','runner'];
      for(let i=0;i<7;i++){
        const a=IB.rnd(0,6.28),d=IB.rnd(20,26);
        IB.SYS.trySpawnAt(p.x+IB.M.cos(a)*d,p.y+IB.M.sin(a)*d,types[i%types.length]);
      }
    } else if(r<0.72){
      IB.toast('СИГНАЛ: ДЕСАНТ ПРИПАСІВ БІЛЯ [((·))]','gold');
      const a=IB.rnd(0,6.28),d=IB.rnd(18,26);
      const x=p.x+IB.M.cos(a)*d,y=p.y+IB.M.sin(a)*d;
      IB.ENTS.pickups.push({item:'ammo',n:IB.ri(8,14),x,y,bob:0});
      IB.ENTS.pickups.push({item:['food','medkit','fuel'][IB.ri(0,2)],n:1,x:x+0.6,y,bob:2});
      IB.G.flags.drop={x,y};
      setTimeout(()=>{IB.G.flags.drop=null;},60000);
    } else {
      IB.AUDIO.sfx('growl');IB.toast('ЩОСЬ СИЧИТЬ У ТЕМРЯВІ…');
    }
  },
  /* ---------- предмети ---------- */
  useItem(id){
    const p=IB.PL;
    switch(id){
      case 'food':if(IB.takeItem(id)){p.hu=IB.M.min(100,p.hu+40);IB.AUDIO.sfx('eat');IB.toast('+40 ЇЖІ');}break;
      case 'stew':if(IB.takeItem(id)){p.hu=IB.M.min(100,p.hu+60);IB.AUDIO.sfx('eat');IB.toast('+60 ЇЖІ • ТУШОНКА');}break;
      case 'energy':if(IB.takeItem(id)){p.st=IB.M.min(100,p.st+40);IB.AUDIO.sfx('eat');IB.toast('+40 ВИТРИВАЛОСТІ');}break;
      case 'mask':if(IB.takeItem(id)){IB.G.flags.mask=1;IB.AUDIO.sfx('craft');IB.banner('ПРОТИГАЗ ОДЯГО — ПРОМЗОНА БЕЗПЕЧНА');}break;
      case 'water':if(IB.takeItem(id)){p.wa=IB.M.min(100,p.wa+45);IB.AUDIO.sfx('eat');IB.toast('+45 ВОДИ');}break;
      case 'medkit':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+55);IB.AUDIO.sfx('heal');IB.toast('+55 HP');}break;
      case 'bandage':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+25);IB.AUDIO.sfx('heal');IB.toast('+25 HP');}break;
      case 'pills':if(IB.takeItem(id)){p.hp=IB.M.min(100,p.hp+15);p.st=IB.M.min(100,p.st+10);IB.AUDIO.sfx('heal');IB.toast('+15 HP +10 ST');}break;
      case 'battery':if(IB.takeItem(id)){p.batt=100;IB.toast('ЛІХТАР ЗАРЯДЖЕНО');}break;
      case 'fuel':if(p.car){if(IB.takeItem(id)){p.car.fuel=IB.M.min(100,p.car.fuel+40);IB.toast('БАК +40%');}}else IB.toast('СІДЬ В АВТО, ЩОБ ЗАПРАВИТИСЯ','red');break;
      case 'parts':if(p.car){if(IB.takeItem(id)){p.car.hp=IB.M.min(IB.SPR.CARS[p.car.mdl].hp,p.car.hp+30);p.car.broken=false;IB.toast('АВТО ВІДРЕМОНТОВАНО +30');IB.AUDIO.sfx('craft');}}else IB.toast('Ремонт — тільки в авто','red');break;
      case 'molotov':if(IB.takeItem(id)){IB.throwObj('molotov');IB.AUDIO.sfx('melee');}break;
      case 'grenade':IB.throwObj('grenade');IB.AUDIO.sfx('melee');break;
      default:IB.toast((IB.SPR.itemsDB[id]||{}).d||'','dim');
    }
  },
  craft(rid){
    const r=IB.RECIPES.find(x=>x.id===rid);
    if(!r)return;
    if(r.base&&!IB.G.atBase){IB.toast('ЦЕ РОБИТЬ ТІЛЬКИ ВЕРСТАК НА БАЗІ ВВ13 • КПІ','red');return;}
    for(const k in r.req)if(!IB.hasItem(k,r.req[k])){IB.toast('НЕМА РЕСУРСІВ: '+((IB.SPR.itemsDB[k]||{}).n||k),'red');return;}
    for(const k in r.req)IB.takeItem(k,r.req[k]);
    const out=r.out||{id:r.id,n:1};
    IB.addItem(out.id,out.n);
    IB.AUDIO.sfx('craft');IB.toast('СТВОРЕНО: '+r.n+(out.n>1?' ×'+out.n:''),'gold');
  },
  /* ---------- збереження ---------- */
  save(){
    const G=IB.G;
    let p=IB.PL;
    if(!p)return;
    try{
      const looted=IB.WORLD.props.filter(pr=>pr.looted).map(pr=>pr.id);
      /* всередині будівлі: зберігаємо позицію біля дверей з надворі */
      if(IB.INT&&IB.CPOS&&IB.layer==='interior'){p={x:IB.CPOS.x,y:IB.CPOS.y,hp:p.hp,st:p.st,hu:p.hu,wa:p.wa,inv:p.inv,batt:p.batt,kills:p.kills,alive:p.alive};}
      const cars=IB.WORLD.cars.map(c=>({mdl:c.mdl,x:c.x,y:c.y,dir:c.dir,fuel:c.fuel,hp:c.hp,broken:c.broken,drivable:c.drivable,looted:c.looted}));
      localStorage.setItem('ibonarium_kyiv_save',JSON.stringify({
        v:4,day:G.day,t:G.t,mi:G.mi,mdone:G.mdone,flags:G.flags,stash:G.stash,visited:G.visited,deaths:G.deaths,   /* v4 — батч 16: мапа 560x660, старі сейви несумісні */
        wx:{type:IB.WX.type,t:IB.WX.t},
        layer:IB.layer||'city',             /* де ти був: на поверхні чи в метро */
        lootedM:IB.layer==='metro'&&IB.MWORLD?IB.MWORLD.props.filter(pr=>pr.looted).map(pr=>pr.id):[],
        pl:{x:p.x,y:p.y,hp:p.hp,st:p.st,hu:p.hu,wa:p.wa,inv:p.inv,batt:p.batt,kills:p.kills,sword2:!!p.sword2},
        stats:{att:G.stats.att,saved:G.stats.saved,bld:G.stats.bld||0,zones:G.stats.zones||0},shah:{t:G.shah.t},
        blds:G.blds||{},playT:G.playT||0,
        looted,cars,
      }));
      G.flags.saved=1;
    }catch(e){}
  },
  hasSave(){try{return !!localStorage.getItem('ibonarium_kyiv_save');}catch(e){return false;}},
  load(){
    let d=null;
    try{d=JSON.parse(localStorage.getItem('ibonarium_kyiv_save'));}catch(e){}
    if(!d||d.v!==4)return false;   /* v4 — мапа області (батч 16); старі v2/v3 — зсув контенту, не читаємо */
    IB.initEnts();
    const G=IB.G,p=IB.PL;
    G.day=d.day;G.t=d.t;G.mi=d.mi;G.mdone=d.mdone||[];G.flags=d.flags||{};G.stash=d.stash||{};G.visited=d.visited||{};G.deaths=d.deaths||0;G.ending=false;
    G.stats=Object.assign({att:0,saved:0,bld:0,zones:0},d.stats||{});
    G.blds=d.blds||{};G.playT=d.playT||0;
    G.shah={t:(d.shah&&d.shah.t)||IB.rnd(220,330),phase:null,s1:false,sirT:0,spawnN:0,count:0,targets:[],tip:false,offT:0};
    G.survT=IB.rnd(70,110);G.atBase=false;
    if(d.wx&&d.wx.type)IB.WX.type=d.wx.type;
    IB.WX.t=(d.wx&&d.wx.t)||IB.rnd(60,140);
    /* шар: метро чи поверхня (тільки v3) */
    IB.layer=(d.v>=3&&d.layer==='metro'&&IB.MWORLD)?'metro':'city';
    IB.HIDE=null;
    IB.WORLD=IB.layer==='metro'?IB.MWORLD:IB.CWORLD;
    Object.assign(p,d.pl);
    IB.clearMissionAreas();
    IB.MAIL&&IB.MAIL.spawn&&IB.MAIL.spawn();   /* квест «НЕДОСТАВЛЕНІ»: конверти + схованки за сейвом */
    const f=IB.snapFree(p.x,p.y);p.x=f.x;p.y=f.y;
    if(G.spawn&&G.spawn.x!==undefined){const sf=IB.snapFree(G.spawn.x,G.spawn.y);G.spawn={x:sf.x,y:sf.y,n:G.spawn.n};}
    p.alive=true;p.car=null;p.fx=0;p.fy=1;p.dirKey='F';
    for(const id of d.looted||[]){const pr=IB.WORLD.props.find(q=>q.id===id);if(pr)pr.looted=true;}
    if(d.v>=3){for(const id of d.lootedM||[]){const pr=IB.MWORLD.props.find(q=>q.id===id);if(pr)pr.looted=true;}}
    if(IB.WORLD.cars.length)(d.cars||[]).forEach((cs,i)=>{const c=IB.WORLD.cars[i];if(c&&c.mdl===cs.mdl)Object.assign(c,cs);});
    IB.SYS.spawnStartProps();
    IB.banner(IB.layer==='metro'?'МЕТРО • ПРОДОВЖЕННЯ':'КИЇВ • ПРОДОВЖЕННЯ');
    return true;
  },
  respawn(){
    const G=IB.G,p=IB.PL;
    /* смерть у метро/сховану — повертаєм на поверхню */
    IB.layer='city';IB.HIDE=null;
    if(IB.CWORLD)IB.WORLD=IB.CWORLD;
    for(const s of IB.ENTS.survivors)s.hidden=false;
    const f=IB.snapFree(G.spawn.x,G.spawn.y);
    p.x=f.x;p.y=f.y;p.hp=60;p.st=100;p.hu=IB.M.max(p.hu,55);p.wa=IB.M.max(p.wa,55);p.alive=true;p.car=null;
    IB.ENTS.zombies=[];
    IB.SYS.spawnStartProps();
    IB.banner('ТИ ЗНОВУ ЖИВИЙ • '+(G.spawn.n||'СХОВАНКА'));
  },
};
IB.addItemTo=function(o,id,n){o[id]=(o[id]||0)+n;};
IB.clearNear=function(r){IB.ENTS.zombies=IB.ENTS.zombies.filter(z=>IB.dist(z.x,z.y,IB.PL.x,IB.PL.y)>r);};
/* --- анти-замуровування: снеп до найближчого вільного тайла --- */
IB.snapFree=function(x,y){
  if(!IB.WORLD)return {x,y};
  const f=IB.WORLD.freeSpot(x,y,5);
  return f||{x,y};
};
IB.clearMissionAreas=function(){
  if(!IB.WORLD)return;
  for(const m of IB.MISSIONS){
    IB.WORLD.clearArea(m.x+0.5,m.y+0.5,m.r+0.8);
    if(m.two&&m.x2!==undefined)IB.WORLD.clearArea(m.x2+0.5,m.y2+0.5,m.r+0.8);
  }
};
