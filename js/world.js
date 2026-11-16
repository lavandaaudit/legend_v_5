/* IBONARIUM KYIV — world.js: ВЕЛИКА мапа 560x660 (батч 16: КИЇВСЬКА ОБЛАСТЬ НАВКОЛО — МОЩУН, ВИШГОРОД з греблею,
   НОВІ ПЕТРІВЦІ, БУЧА, БРОВАРИ, ТРИПІЛЛЯ; батч 15: ДЕСНА, ВИГУРІВЩИНА, ХАРКІВСЬКИЙ МАСИВ, БРОВАРСЬКИЙ ЛІС,
   СЕЛО ПУХІВКА з ОЗЕРОМ і човнами, СЕЛО РОЖНИ, ТРИПІЛЬСЬКА ГОРА з палатками),
   райони, АЗС, супермаркети FN<, стадіони, вивіски, графіті, великі дерева */
IB.TER={grass:0,park:1,field:2,sidewalk:3,pave:4,cobble:5,concrete:6,plaza:7,rubble:8,dirt:9,sand:10,rail:11,water:12,road:13,
  rock:14,tunnel:15,track:16,plat:17,   /* + підземка (батч 10): скеля, тунель, колія, платформа */
  floorw:18,floort:19,floorc:20,floorr:21};   /* + інтер'єри (батч 13): паркет, кахель, бетон, килим */
IB.ZONES=[
  {k:'OBO', n:'ОБОЛОНЬ', d:2},
  {k:'POD', n:'ПОДІЛ', d:2},
  {k:'OLD', n:'СТАРЕ МІСТО', d:3},
  {k:'HR',  n:'ХРЕЩАТИК', d:4},
  {k:'MAI', n:'МАЙДАН НЕЗАЛЕЖНОСТІ', d:5},
  {k:'PECH',n:'ПЕЧЕРСЬК', d:3},
  {k:'LVR', n:'КИЄВО-ПЕЧЕРСЬКА ЛАВРА', d:4},
  {k:'MOT', n:'БАТЬКІВЩИНА-МАТИ', d:4},
  {k:'LEFT',n:'ЛІВИЙ БЕРЕГ', d:2},
  {k:'ISL', n:'ГІДРОПАРК', d:1},
  {k:'IND', n:'ПРОМЗОНА • ДАРНИЦЯ', d:4},
  {k:'VOK', n:'ЗАЛІЗНИЧНИЙ ВОКАЗАЛ', d:2},
  {k:'RIV', n:'ДНІПРО', d:0},
  {k:'IRP', n:'ІРПІНЬ • ЛІС ЗА МІСТОМ', d:1},
  {k:'TR',  n:'ТРОЄЩИНА', d:2},
  /* ---- БАТЧ 15: схід і південний схід ---- */
  {k:'VYG', n:'ВИГУРІВЩИНА', d:2},
  {k:'DESN',n:'ДЕСНА', d:0},
  {k:'BRV', n:'БРОВАРСЬКИЙ ЛІС', d:1},
  {k:'PUH', n:'СЕЛО ПУХІВКА', d:1},
  {k:'HRK', n:'ХАРКІВСЬКИЙ МАСИВ', d:2},
  {k:'RZN', n:'СЕЛО РОЖНИ', d:1},
  {k:'TRP', n:'ТРИПІЛЬСЬКА ГОРА', d:3},
  /* ---- БАТЧ 16: Київська область навколо ---- */
  {k:'MOS', n:'СЕЛО МОЩУН • ЛІС', d:1},
  {k:'VYSH',n:'ВИШГОРОД • ГРЕБЛЯ', d:2},
  {k:'NPT', n:'НОВІ ПЕТРІВЦІ', d:1},
  {k:'BUCH',n:'БУЧА', d:1},
  {k:'BRV2',n:'БРОВАРИ', d:2},
  {k:'TRPL',n:'СЕЛО ТРИПІЛЛЯ', d:2},
  /* ---- БАТЧ 17: географічне розширення Києва — захід і південь ---- */
  {k:'SHU', n:'ШУЛЯВКА • КПІ', d:2},
  {k:'SVT', n:'СВЯТОШИН', d:2},
  {k:'AKD', n:'АКАДЕММІСТЕЧКО', d:2},
  {k:'LIB', n:'ЛИБІДСЬКА', d:2},
  {k:'DEM', n:'ДЕМІЇВСЬКА', d:2},
  {k:'IPO', n:'ІПОДРОМ • ТЕРЕМКИ', d:2},
  {k:'VSH', n:'ВИШНЕВЕ', d:1},
  {k:'GOL', n:'ГОЛОСІЇВСЬКИЙ ЛІС', d:1},
];
IB.SEctORS=null;
IB.buildWorld=function(){
  const W=440,H=520;   /* КИЇВ + Троєщина + Десна + села за Десною + Ірпінь + ТРИПІЛЬСЬКА ГОРА (батч 15) */
  const ter=new Uint8Array(W*H),vrn=new Uint8Array(W*H),rdm=new Uint8Array(W*H),
        elev=new Uint8Array(W*H), zone=new Uint8Array(W*H), blk=new Uint8Array(W*H),
        brg=new Uint8Array(W*H);
  const idx=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const T=IB.TER;
  const rnd=IB.rnd, ri=IB.ri, hsh=IB.hsh;
  /* ---- база: трава ---- */
  ter.fill(T.grass);
  for(let i=0;i<W*H;i++){vrn[i]=ri(0,2);}
  /* ---- річка Дніпро з вигинами ---- */
  const cx=y=>152+IB.M.round(8*IB.M.sin(y*0.043)+4*IB.M.sin(y*0.011+2));
  for(let y=0;y<H;y++){
    const c=cx(y);
    for(let x=c;x<=c+16;x++){ter[idx(x,y)]=T.water;vrn[idx(x,y)]=0;}
  }
  /* ---- БАТЧ 15: річка ДЕСНА за Троєщиною — звивиста, в півдні впадає в Дніпро ---- */
  const dxs=y=>332+IB.M.round(6*IB.M.sin(y*0.02)+3*IB.M.sin(y*0.007+1));
  for(let y=0;y<H;y++){
    const c=dxs(y);
    for(let x=c;x<=c+12;x++){const i=idx(x,y);if(ter[i]!==T.water){ter[i]=T.water;vrn[i]=0;}}
  }
  /* устье Десни: широке з'­єднання з Дніпром у самому низу карти */
  for(let x=166;x<=338;x++){
    const by=498+IB.M.round(6*IB.M.sin(x*0.03));
    for(let d=0;d<=9;d++){const yy=by+d;if(inb(x,yy)){const i=idx(x,yy);if(ter[i]!==T.water){ter[i]=T.water;vrn[i]=0;}}}
  }
  /* ---- БАТЧ 15: ОЗЕРО ПУХІВСЬКЕ за Десною — човни watercraft-kit ---- */
  for(let y=116;y<=150;y++)for(let x=370;x<=410;x++){
    if(!inb(x,y))continue;
    const q=((x-390)/15.5)*((x-390)/15.5)+((y-133)/10.5)*((y-133)/10.5);
    if(q<=1){const i=idx(x,y);if(ter[i]!==T.dirt&&ter[i]!==T.road){ter[i]=T.water;vrn[i]=0;}}
  }
  /* ---- острови: Труханів, Гідропарк ---- */
  function island(cxx,cyy,rx,ry,kind){
    for(let y=cyy-ry;y<=cyy+ry;y++)for(let x=cxx-rx;x<=cxx+rx;x++){
      if(!inb(x,y))continue;
      const q=((x-cxx)/rx)**2+((y-cyy)/ry)**2;
      if(q<=1){ter[idx(x,y)]=q>0.72?T.sand:kind;vrn[idx(x,y)]=ri(0,2);}
    }
  }
  island(160,72,5,20,T.grass);   // Труханів
  island(155,128,7,15,T.grass);  // Гідропарк
  /* ---- пагорби (рельєф Києва) ---- */
  function hill(x0,y0,x1,y1,e){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(inb(x,y)&&ter[idx(x,y)]!==T.water)elev[idx(x,y)]=e;}
  }
  hill(58,120,132,172,2);  // Старе місто
  hill(128,158,174,212,2); // Печерськ
  hill(146,186,174,212,3); // пагорб Батьківщини-Матері
  /* ---- дороги ---- */
  function R(x,y,t){if(inb(x,y)&&ter[idx(x,y)]!==T.water){ter[idx(x,y)]=t;vrn[idx(x,y)]=0;}}
  function VR(x0,x1,y0,y1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t);}
  function HR(y0,y1,x0,x1,t){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t);}
  const cob=T.cobble, rd=T.road, sw=T.sidewalk, pv=T.pave, con=T.concrete;
  /* Оболонь — магістралі 3-4 смуги */
  VR(33,36,8,62,rd); HR(39,42,8,64,rd); HR(23,26,10,60,rd); VR(49,52,14,58,rd);
  /* Гавань/Поділ */
  VR(66,67,42,72,rd); HR(83,86,60,126,rd); HR(99,102,60,124,rd);
  VR(75,78,74,116,rd); VR(107,110,74,116,rd); HR(91,94,78,124,rd);
  /* Набережна (вздовж Дніпра) */
  const BR=[56,104,160,206];
  for(let y=36;y<=196;y++){if(BR.indexOf(y)>=0)continue;const ex=cx(y)-6;if(inb(ex,y)&&ter[idx(ex,y)]!==T.water)R(ex,y,rd);if(inb(ex+1,y)&&ter[idx(ex+1,y)]!==T.water)R(ex+1,y,rd);}
  /* Андріївський узвіз: брукований спуск з пагорба */
  VR(102,103,108,126,cob);
  for(let y=112;y<=115;y++){elev[idx(102,y)]=1;elev[idx(103,y)]=1;}
  for(let y=116;y<=121;y++){elev[idx(102,y)]=2;elev[idx(103,y)]=2;}
  /* ---- БАТЧ 15: ТРИПІЛЬСЬКА ГОРА — хребти зі скелями (walkable гребені) ---- */
  function ridgeY(x){return 468+IB.M.round(11*IB.M.sin(x*0.028)+6*IB.M.sin(x*0.013+2));}
  for(let x=180;x<=326;x++){
    const ry=ridgeY(x);
    for(let d=-4;d<=4;d++){
      const yy=ry+d;if(!inb(x,yy))continue;
      const i=idx(x,yy);
      if(ter[i]===T.water||ter[i]===T.dirt||ter[i]===T.road)continue;
      elev[i]=1+IB.M.round((1-IB.M.abs(d)/5)*2);
      if(IB.M.abs(d)<=1)ter[i]=T.rock;
    }
    /* другий гребінь нижче */
    const ry2=492+IB.M.round(8*IB.M.sin(x*0.021+1));
    for(let d=-2;d<=2;d++){
      const yy=ry2+d;if(!inb(x,yy))continue;
      const i=idx(x,yy);
      if(ter[i]===T.water||ter[i]===T.dirt||ter[i]===T.road)continue;
      if(IB.M.abs(d)<=1)ter[i]=T.rock;
    }
  }
  /* Старе місто */
  HR(132,133,60,128,pv); HR(148,149,60,128,pv); VR(88,89,120,166,pv); VR(120,121,120,166,pv);
  /* Хрещатик — головна магістраль 4 смуги + Європейська площа */
  HR(149,152,106,133,rd);
  for(let y=144;y<=156;y++)for(let x=108;x<=118;x++)if(ter[idx(x,y)]!==T.road)R(x,y,pv);
  /* Майдан: велика площа з малюнком */
  for(let y=142;y<=162;y++)for(let x=132;x<=152;x++)R(x,y,T.plaza);
  /* Печерськ + Лавра */
  VR(137,140,158,190,rd); HR(167,170,128,154,rd); HR(175,178,140,154,rd);
  VR(147,150,158,163,rd);
  /* ТРОЄЩИНА (батч 14) — за Дніпром на північ: магістралі і вулиці спального району */
  HR(30,33,186,238,rd); VR(190,193,8,50,rd); VR(212,215,8,50,rd); HR(14,17,190,234,rd); VR(224,227,18,48,rd);
  /* ---- БАТЧ 15: Троєщина на схід + ВИГУРІВЩИНА + ХАРКІВСЬКИЙ МАСИВ + дорога на Десну ---- */
  HR(30,33,238,322,rd); HR(14,17,238,300,rd); VR(258,261,8,52,rd); VR(286,289,14,52,rd);
  HR(58,61,190,320,rd); HR(84,87,190,320,rd); VR(214,217,52,108,rd); VR(286,289,52,108,rd); VR(246,249,52,108,rd);
  HR(118,121,238,322,rd);
  /* ---- БАТЧ 15: СЕЛА ЗА ДЕСНОЮ — ґрунтові вулички Пухівки і Рожнів + стежки лісу ---- */
  HR(118,121,352,412,T.dirt); VR(366,369,96,178,T.dirt); VR(392,395,96,176,T.dirt); HR(152,155,352,408,T.dirt); HR(96,99,352,410,T.dirt);
  HR(200,203,352,432,T.dirt); VR(378,381,176,242,T.dirt); VR(408,411,176,232,T.dirt); HR(224,227,352,428,T.dirt);
  VR(376,377,8,94,T.dirt); VR(414,415,8,92,T.dirt);
  /* ---- БАТЧ 15: ґрунтовка на ТРИПІЛЬСЬКУ ГОРУ — від промзони через ліс по хребтах ---- */
  VR(206,209,216,472,T.dirt); HR(438,441,206,304,T.dirt); HR(462,465,220,314,T.dirt); VR(252,255,440,494,T.dirt); VR(286,289,438,486,T.dirt);
  /* Батьківщина-Мати: кільце + проїзд */
  HR(195,198,138,152,rd); VR(149,152,184,206,rd); VR(145,148,190,206,rd);
  /* Лівий берег — магістралі */
  VR(194,197,8,124,rd); HR(102,105,178,216,rd); HR(83,86,178,216,rd); HR(39,42,178,216,rd);
  VR(204,207,8,120,rd); HR(63,66,178,216,rd);
  /* Промзона Дарниця */
  HR(158,161,178,216,rd); VR(202,205,128,216,rd); HR(183,186,178,216,rd);
  /* Вокзал (південний захід) — далі дорога йде лісом на Ірпінь */
  VR(62,65,190,224,rd); HR(195,198,56,100,rd); HR(171,174,8,64,rd); VR(27,30,66,172,rd);
  /* ---- ЛІС + ІРПІНЬ ДАЛЕКО ЗА МІСТОМ (пд-захід): ґрунтовка від вокзалу крізь хвойний ліс ---- */
  for(let y=224;y<=301;y++){
    const wx=62+IB.M.round(7*IB.M.sin(y*0.045)+3*IB.M.sin(y*0.013+1));
    for(let x=wx;x<=wx+1;x++)R(x,y,T.dirt);
  }
  /* вулички дачного масиву + СЕЛИЩА Ірпеня (ґрунт) — батч 14: селище простягається до y≈414 */
  VR(40,41,298,414,T.dirt); VR(56,57,294,414,T.dirt); VR(72,73,294,414,T.dirt); VR(88,89,300,408,T.dirt);
  HR(300,301,34,96,T.dirt); HR(316,317,34,96,T.dirt); HR(332,333,34,96,T.dirt); HR(348,349,38,92,T.dirt);
  HR(362,363,44,88,T.dirt); HR(376,377,34,96,T.dirt); HR(392,393,34,96,T.dirt); HR(408,409,40,92,T.dirt);
  VR(58,59,16,56,rd); HR(32,33,36,62,rd);          /* Оболонь */
  VR(98,99,76,116,rd);                             /* Поділ */
  VR(104,105,124,164,pv); HR(140,141,64,128,pv);   /* Старе місто */
  VR(186,187,40,120,rd); HR(124,125,178,216,rd);   /* Лівий берег */
  HR(156,157,128,152,rd);                          /* Печерськ */
  /* залізниця */
  for(let x=178;x<=218;x++)if(ter[idx(x,188)]!==T.water)ter[idx(x,188)]=T.rail;
  for(let x=66;x<=132;x++)if(ter[idx(x,208)]!==T.water)ter[idx(x,208)]=T.rail;
  for(let y=196;y<=216;y++)if(ter[idx(70,y)]!==T.water)ter[idx(70,y)]=T.rail;
  /* ---- мости через Дніпро ---- */
  const BRIDGES=[[56,'ПІВНІЧНИЙ МІСТ'],[104,'МЕТРО МІСТ'],[160,'МІСТ ПАТОНА'],[206,'ПІВДЕННИЙ МІСТ']];
  for(const [by] of BRIDGES){
    const c=cx(by);
    for(let x=c-9;x<=c+25;x++){const i=idx(x,by);ter[i]=T.road;brg[i]=1;vrn[i]=0;blk[i]=0;}
  }
  /* ---- БАТЧ 15: мости через ДЕСНУ — чекпоїнти на вихід за місто ---- */
  const DBRIDGES=[[30,'ТРОЄЩИНО-ДЕСНЯНСЬКИЙ МІСТ'],[120,'ДЕСНЯНСЬКИЙ МІСТ']];
  for(const [by] of DBRIDGES){
    const c=dxs(by);
    for(let x=c-8;x<=c+18;x++){const i=idx(x,by);ter[i]=T.road;brg[i]=1;vrn[i]=0;blk[i]=0;}
    /* бетонні блоки-пост на обох берегах (чекпоїнт) — пропси поставляться нижче, у put */
    for(const bx of [c-9,c+19]){
      if(inb(bx,by-2)&&ter[idx(bx,by-2)]!==T.road)blk[idx(bx,by-2)]=1;
      if(inb(bx,by+1)&&ter[idx(bx,by+1)]!==T.road)blk[idx(bx,by+1)]=1;
    }
  }
  /* тротуари вздовж доріг */
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(ter[idx(x,y)]!==T.grass&&ter[idx(x,y)]!==T.field)continue;
    if(rd===1)continue;
    let near=false;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.road)near=true;}
    if(near&&hsh(x,y,77)<0.92)ter[idx(x,y)]=T.sidewalk;
  }
  /* пляжі біля води */
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(ter[idx(x,y)]!==T.grass)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.water){if(hsh(x,y,55)<0.5)ter[idx(x,y)]=T.sand;break;}}
  }
  /* руїни/сміття у промзоні та Майдані */
  for(let y=140;y<=160;y++)for(let x=114;x<=131;x++){if(ter[idx(x,y)]===T.road&&hsh(x,y,31)<0.14)ter[idx(x,y)]=T.rubble;}
  for(let y=130;y<=216;y++)for(let x=180;x<=216;x++){if(ter[idx(x,y)]===T.grass&&hsh(x,y,32)<0.18)ter[idx(x,y)]=T.rubble;}
  /* ---- зони ---- */
  function zoneAt(x,y){
    if(ter[idx(x,y)]===T.water)return (x>=300&&y<480)?16:((y>=480&&x>=172)?16:12);
    if(x>=346){                                    /* за Десною (батч 15) */
      if(y<95)return 17;                           /* БРОВАРСЬКИЙ ЛІС */
      if(y<178)return 18;                          /* СЕЛО ПУХІВКА + озеро */
      return 20;                                   /* СЕЛО РОЖНИ */
    }
    if(y>=436)return 21;                           /* ТРИПІЛЬСЬКА ГОРА */
    if(x<170&&y>=220)return 13;                             // ІРПІНЬ + ліс + СЕЛИЩЕ за містом — ДАЛЕКО на пд-захід
    if(y>=240)return 13;                                    // хвойні ліси на півдні карти
    if(y>=113&&y<=143&&x>=148&&x<=162)return 9;             // Гідропарк
    if(x>=176&&y<52)return 14;                              // ТРОЄЩИНА (батч 14) — за Дніпром на північ
    if(x>=244&&y>=52&&y<108)return 19;                      // ХАРКІВСЬКИЙ МАСИВ (батч 15)
    if(x>=190&&x<244&&y>=52&&y<108)return 15;               // ВИГУРІВЩИНА (батч 15, ретро)
    if(x<66&&y<66)return 0;
    if(x>=56&&x<132&&y>=64&&y<120)return 1;
    if(x>=132&&x<154&&y>=140&&y<164)return 4;               // Майдан
    if(x>=108&&x<132&&y>=144&&y<156)return 3;               // Хрещатик
    if(x>=140&&x<158&&y>=163&&y<189)return 6;               // Лавра
    if(x>=144&&x<170&&y>=189&&y<212)return 7;               // Батьківщина-Мати
    if(x>=56&&x<132&&y>=120&&y<172)return 2;                // Старе місто
    if(x>=128&&x<176&&y>=156&&y<212)return 5;               // Печерськ
    if(x>=176&&y<128)return 8;                              // Лівий берег
    if(x>=176&&y>=128)return 10;                            // Промзона
    if(x>=56&&x<104&&y>=188)return 11;                      // Вокзал
    return (y<120?1:(y<172?2:5));
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)zone[idx(x,y)]=zoneAt(x,y);
  /* ---- масиви колізій ---- */
  for(let i=0;i<W*H;i++){if(ter[i]===T.water)blk[i]=2;}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(x<2||y<2||x>=W-2||y>=H-2)blk[idx(x,y)]=4;}
  /* ---- road mask ---- */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    if(ter[idx(x,y)]!==T.road)continue;
    let m=0;
    const isr=(x,y)=>inb(x,y)&&(ter[idx(x,y)]===T.road);
    if(isr(x,y-1))m|=1; if(isr(x+1,y))m|=2; if(isr(x,y+1))m|=4; if(isr(x-1,y))m|=8;
    rdm[idx(x,y)]=m;
  }
  /* друга прохідка: перехрестя всередині широкої (3+) дороги -> суцільний асфальт */
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const i=idx(x,y);
    if(rdm[i]!==15)continue;
    const n15=(dx,dy)=>inb(x+dx,y+dy)&&rdm[idx(x+dx,y+dy)]===15;
    if(n15(0,-1)||n15(0,1)||n15(-1,0)||n15(1,0))rdm[i]=16;
  }
  /* ---- локації-домінанти (IB.LM) ---- */
  const LMS=[
    ['sophia_cath',81,127],['sophia_bell',89,129],['golden_gate',63,137],
    ['maidan_col',141,151],['lachida',140,157],
    ['lavra_cath',144,169],['lavra_bell',149,166],['lavra_refect',144,177],['caves_chapel',150,182],
    ['st_andrew',98,116],['motherland',152,191],['museum',150,196],
    ['gostyny',86,88],['samson',94,92],
    ['stadium',137,104],['stadium2',200,18],              /* СТАДІОНИ (батч 14): Лобановського + Троєщина */
    ['chapel',58,380],                                    /* КАПЛИЦЯ селища Ірпінь */
    ['chapel2',360,130],                                  /* БАТЧ 15: церквка Пухівки */
    ['radio_tower',26,356],['radio_tower',154,126],['radio_tower',60,133],['radio_tower',140,194],['radio_tower',212,142],['radio_tower',208,44],
    ['radio_tower',420,100],['radio_tower',300,452],      /* БАТЧ 15: вишки лісу і гори */
    ['mm13',76,210],                          /* БАЗА ВВ13 • КПІ — безпечна зона, склад і верстак */
  ];
  const lms=[];
  for(const[key,x,y]of LMS){
    const d=IB.LM[key];const wT=d.wT,dT=d.dT;
    for(let yy=y;yy<y+dT;yy++)for(let xx=x;xx<x+wT;xx++){if(inb(xx,yy)){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=3;}}
    lms.push({key,x,y,wT,dT,zone:zoneAt(x,y)});
  }
  /* ---- стіни Лаври ---- */
  const props=[];
  let propId=0;
  function prop(t,x,y,o={}){
    const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};
    props.push(p);return p;
  }
  for(let x=141;x<=154;x++){ if(x>=146&&x<=149)continue; prop('wall_m',x,163,{s:1}); prop('wall_m',x,187,{s:1}); }
  for(let y=164;y<=186;y++){ prop('wall_m',141,y,{s:1}); if(y!==175&&y!==176)prop('wall_m',154,y,{s:1}); }
  prop('gate_m',148,163,{s:0});
  /* ---- будівлі по районах (Kenney City Kit footprints) — ФУТПРИНТИ СИНХРОННІ з build_assets.py CATS (БАТЧ 8:
     всі будівлі БІЛЬШІ: 3x2 житлові, 3x3 панельки-башти, 4x2 адмінки/істиричні, 4x3 заводи) —
     спрайт рендериться під цей самий футпринт, тому будівля завжди стоїть рівно на своїх тайлах */
  const CATS={
    khrus:[3,2],khrus2:[3,2],panel9:[3,3],panel9b:[3,3],hist2:[3,2],hist2b:[3,2],hist2c:[3,2],hist3:[4,2],
    admin3:[4,2],admin4:[4,3],shop1:[3,1],shop2:[3,1],factory:[4,3],factory2:[4,3],garage:[1,1],
    khrus_dmg:[3,2],panel9_dmg:[3,3],hist_ruin:[2,1],
    dacha1:[3,2],dacha2:[3,2],dacha3:[3,2],
    /* батч 14: колоритні башти Троєщини, новобудова, супермаркет FN<, селищні будинки */
    panel_c1:[3,3],panel_c2:[3,3],panel_c3:[4,3],tower_g:[3,3],fnmarket:[5,3],vill1:[3,2],vill2:[2,2],
    /* батч 15: РЕТРО-ВИГУРІВЩИНА (retro-urban-kit), ХАРКІВСЬКИЙ МАСИВ (modular-buildings) */
    retroA:[2,2],retroB:[2,2],retroC:[2,2],retroD:[3,2],retroE:[2,2],
    towerb1:[3,3],towerb2:[3,3],bhouse1:[2,2],bhouse2:[2,2],
    /* батч 16: райони області — власний колір/тип у кожному районі */
    wood1:[2,2],wood2:[2,2],cottage_b:[2,2],panel_b1:[3,3],panel_b2:[3,3],panel_v1:[3,3],
  };
  /* АЗС (батч 14): прямокутники майданчиків — будівлі на них не лізуть */
  const GAS_RECTS=[{x:38,y:46,w:7,d:6},{x:208,y:74,w:7,d:6},{x:218,y:20,w:7,d:6},{x:58,y:250,w:7,d:6},{x:264,y:92,w:7,d:6},{x:354,y:184,w:7,d:6}];
  const POOL={khrus:6,khrus2:4,panel9:4,panel9b:3,hist2:6,hist2b:4,hist2c:4,hist3:4,admin3:3,admin4:3,shop1:3,shop2:4,factory:4,factory2:4,garage:4,khrus_dmg:4,panel9_dmg:3,hist_ruin:3,dacha1:2,dacha2:2,dacha3:1,
    retroA:1,retroB:1,retroC:1,retroD:1,retroE:1,towerb1:2,towerb2:2,bhouse1:1,bhouse2:2,
    wood1:1,wood2:1,cottage_b:1,panel_b1:1,panel_b2:1,panel_v1:1};
  const blds=[];
  const ZB={
    0:['panel9','panel9b','khrus','khrus2','shop1','panel9_dmg'],
    1:['hist2','hist2b','hist2c','hist3','shop1','khrus'],
    2:['hist2','hist3','hist2b','hist2c','admin3','hist_ruin'],
    3:['admin4','admin3','shop2','hist3'],
    4:['admin4','admin3'],
    5:['admin3','khrus','panel9b','shop1'],
    8:['panel9','panel9b','khrus','khrus2','shop2','panel9_dmg'],
    10:['factory','factory2','garage','factory2','garage'],
    11:['admin3','factory','garage','hist_ruin'],
    13:['dacha1','dacha2','dacha3','hist3','vill1','vill2'],   /* дачі + СЕЛИЩНІ будинки Ірпеня */
    14:['panel_c1','panel_c2','panel_c3','tower_g','khrus','shop1'],  /* ТРОЄЩИНА — колоритні башти */
   15:['retroA','retroB','retroC','retroD','retroE','shop1'],         /* ВИГУРІВЩИНА — ретро (батч 15) */
   19:['towerb1','towerb2','bhouse1','bhouse2','admin3','shop2'],     /* ХАРКІВСЬКИЙ МАСИВ (батч 15) */
  };
  /* дачі не можуть стояти на ґрунтових вуличках */
  function onStreet(x,y,w,d){
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))return true;
      const t=ter[idx(xx,yy)];
      if(t===T.dirt||t===T.road||t===T.water||t===T.rail)return true;
    }
    return false;
  }
  function nearRoadOrWater(x,y,w,d){
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))return true;
      const t=ter[idx(xx,yy)];
      /* заборонено тільки дорога/вода/рейки/площа. Тротуар/бруківка — це фасад, будуємо впритул */
      if(t===T.road||t===T.water||t===T.rail||t===T.plaza||blk[idx(xx,yy)])return true;
    }
    return false;
  }
  /* фасад: хочемо будівлю впритул до тротуару/бруківки (як у справжньому місті) */
  function hasFrontage(x,y,w,d){
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))continue;
      const t=ter[idx(xx,yy)];
      if(t===T.sidewalk||t===T.pave||t===T.cobble)return true;
    }
    return false;
  }
  function placeB(x,y,w,d,cat,z){
    if(x<3||y<3||x+w>W-3||y+d>H-3)return false;
    if(nearRoadOrWater(x,y,w,d))return false;
    /* двір бази ВВ13 • КПІ — будівлі не лізуть */
    if(x+w>73&&x<85&&y+d>209&&y<218)return false;
    /* майданчики АЗС — будівлі не лізуть (батч 14) */
    for(const gr of GAS_RECTS){if(x+w>gr.x-1&&x<gr.x+gr.w+1&&y+d>gr.y-1&&y<gr.y+gr.d+1)return false;}
    for(let yy=y;yy<y+d;yy++)for(let xx=x;xx<x+w;xx++){if(blk[idx(xx,yy)])return false;}
    for(let yy=y;yy<y+d;yy++)for(let xx=x;xx<x+w;xx++){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=1;}
    const b={cat,x,y,wT:w,dT:d,zone:z,mural:false,var:ri(0,(POOL[cat]||1)-1)};
    blds.push(b);
    if((cat==='panel9'||cat==='panel9b'||cat==='panel_c1'||cat==='panel_c2')&&hsh(x,y,44)<0.3)b.mural=true;
    if((cat==='khrus'||cat==='khrus2')&&hsh(x,y,45)<0.12)b.mural=true;
    /* батч 14: ВИВІСКИ на крамницях/адмінках + ГРАФІТІ на стінах */
    if(cat==='fnmarket')b.sign=0;
    else if(cat==='shop1'||cat==='shop2')b.sign=1+ri(0,IB.SPRG_NS-2);
    else if((cat==='hist2'||cat==='hist3'||cat==='admin3'||cat==='khrus')&&hsh(x,y,447)<0.4)b.sign=1+ri(0,IB.SPRG_NS-2);
    if(cat!=='garage'&&cat!=='fnmarket'&&!b.mural&&hsh(x,y,448)<0.38)b.graf=ri(0,IB.SPRG_NG-1);
    return b;
  }
  /* лут-пропси біля будівель */
  function lootProp(x,y){
    if(!inb(x,y)||blk[idx(x,y)])return;
    const t=ter[idx(x,y)];
    if(t===T.water||t===T.road)return;
    const r=hsh(x,y,60);
    if(r<0.2)prop('dumpster',x,y,{s:1,loot:'dumpster'});
    else if(r<0.34)prop('crate',x,y,{s:1,loot:'crate'});
    else if(r<0.42)prop('barrels',x,y,{s:1,loot:'barrels'});
  }
  /* ДВІР: ґрунт, лавиці, дерева, гойдалки, контейнери — комплекси живуть навколо нього */
  function courtyard(x0,y0,w,d,z){
    for(let yy=y0;yy<y0+d;yy++)for(let xx=x0;xx<x0+w;xx++){
      if(!inb(xx,yy))continue;
      const i=idx(xx,yy);
      const t=ter[i];
      if(blk[i]||t===T.road||t===T.water||t===T.sidewalk||t===T.plaza||t===T.rail)continue;
      ter[i]=(z===3||z===4)?T.pave:T.dirt;
    }
    const cx2=(x0+w/2)|0,cy2=(y0+d/2)|0;
    const r=hsh(cx2,cy2,61);
    if(r<0.75&&inb(cx2,cy2)&&!blk[idx(cx2,cy2)])prop('bench',cx2,cy2,{s:1});
    if(r<0.55&&inb(cx2-2,cy2)&&!blk[idx(cx2-2,cy2)]){
      const tw=hsh(cx2,cy2,62);
      prop(tw<0.30?'tree_o':tw<0.50?'tree_o2':tw<0.66?'tree_b':tw<0.80?'tree_big':tw<0.90?'tree_a':'tree_p',cx2-2,cy2,{s:0});
    }
    if(r<0.62&&inb(cx2+2,cy2)&&!blk[idx(cx2+2,cy2)])prop('bush',cx2+2,cy2,{s:0});
    if(r>0.66&&(z===0||z===1||z===8)&&inb(cx2,cy2-1)&&!blk[idx(cx2,cy2-1)]){prop('swing',cx2,cy2-1,{s:1});prop('slide',cx2+1,cy2-1,{s:1});}
    if(r>0.52&&inb(x0,cy2)&&!blk[idx(x0,cy2)])prop('dumpster',x0,cy2,{s:1,loot:'dumpster'});
  }
  /* резерв: двір дачі-схованки та вишки в Ірпені — будинки в двори не лізуть */
  for(let yy=315;yy<=325;yy++)for(let xx=41;xx<=52;xx++){const ii=idx(xx,yy);if(inb(xx,yy)&&ter[ii]!==T.dirt&&!blk[ii])blk[ii]=1;}
  for(let yy=353;yy<=359;yy++)for(let xx=23;xx<=30;xx++){const ii=idx(xx,yy);if(inb(xx,yy)&&ter[ii]!==T.dirt&&!blk[ii])blk[ii]=1;}
  /* резерв: площа СЕЛИЩА Ірпінь з каплицею (батч 14) — дачі не лізуть у центр села */
  for(let yy=379;yy<=387;yy++)for(let xx=48;xx<=66;xx++){const ii=idx(xx,yy);if(inb(xx,yy)&&ter[ii]!==T.dirt&&!blk[ii])blk[ii]=1;}
  /* батч 14: СУПЕРМАРКЕТИ FN< (Оболонь + Троєщина) — великі коробки з червоною вивіскою */
  placeB(42,35,5,3,'fnmarket',0);
  placeB(204,36,5,3,'fnmarket',14);
  /* батч 15: FN< у Харківському масиві */
  placeB(272,66,5,3,'fnmarket',19);
  /* селищні будинки Ірпеня — гарантовані вздовж головних вулиць */
  placeB(43,380,3,2,'vill1',13);placeB(61,380,2,2,'vill2',13);placeB(76,380,3,2,'vill1',13);
  placeB(43,396,2,2,'vill2',13);placeB(62,398,3,2,'vill1',13);placeB(79,396,3,2,'vill1',13);
  for(let gy=6;gy<H-8;gy+=8)for(let gx=6;gx<W-8;gx+=8){
    const z=zone[idx(gx+2,gy+2)];
    /* ІРПІНЬ (z13): дачний масив — 2-3 ВЕЛИКИХ дачі (3x2, вищі за героя) на блок між ґрунтовими вуличками,
     паркани, сади; СЕЛИЩЕ (нижче y≈372) — селищні будинки; поза селом — тільки ліс */
    if(z===13){
      if(gy>=292&&gx>=30&&gx<=100&&hsh(gx,gy,774)<0.92){
        const dcs=gy>=368?['vill1','vill2','dacha1']:['dacha1','dacha2','dacha3'];
        const spots=[[1,1],[5,1],[1,4],[5,4],[3,2],[1,2],[5,3]];
        let n=0;
        for(let si=0;si<5;si++){
          const sp=spots[(si+((hsh(gx,gy,775)*5)|0))%5];
          const cat=dcs[((hsh(gx+sp[0],gy+sp[1],776)*3)|0)%3];
          const dw=CATS[cat][0],dd=CATS[cat][1];
          const bx0=gx+sp[0],by0=gy+sp[1];
          if(bx0+dw>W-4||by0+dd>H-4)continue;
          if(onStreet(bx0,by0,dw,dd))continue;
          if(placeB(bx0,by0,dw,dd,cat,13))n++;
        }
        /* паркан уздовж фронту ділянки */
        if(n>0&&hsh(gx,gy,778)<0.55){
          for(let fx=gx;fx<gx+4;fx++){
            const py2=gy+7;
            if(inb(fx,py2)&&!blk[idx(fx,py2)]&&ter[idx(fx,py2)]!==T.dirt&&ter[idx(fx,py2)]!==T.road&&ter[idx(fx,py2)]!==T.water)prop('fence',fx,py2,{s:0});
          }
        }
        if(n>0)lootProp(gx+3,gy+6);
      }
      continue;
    }
    /* ---- БАТЧ 15: СЕЛА ЗА ДЕСНОЮ (Пухівка z18, Рожни z20) — хати вздовж ґрунтових вуличок ---- */
    if(z===18||z===20){
      if(hsh(gx,gy,781)<0.92){
        const dcs=['vill1','vill2','dacha1','dacha3'];
        const spots=[[1,1],[5,1],[1,4],[5,4],[3,2],[1,2],[5,3]];
        let n=0;
        for(let si=0;si<5;si++){
          const sp=spots[(si+((hsh(gx,gy,782)*5)|0))%5];
          const cat=dcs[((hsh(gx+sp[0],gy+sp[1],783)*4)|0)%4];
          const dw=CATS[cat][0],dd=CATS[cat][1];
          const bx0=gx+sp[0],by0=gy+sp[1];
          if(bx0+dw>W-4||by0+dd>H-4)continue;
          if(onStreet(bx0,by0,dw,dd))continue;
          if(placeB(bx0,by0,dw,dd,cat,z))n++;
        }
        if(n>0&&hsh(gx,gy,784)<0.72){
          for(let fx=gx;fx<gx+4;fx++){
            const py2=gy+7;
            if(inb(fx,py2)&&!blk[idx(fx,py2)]&&ter[idx(fx,py2)]!==T.dirt&&ter[idx(fx,py2)]!==T.road&&ter[idx(fx,py2)]!==T.water)prop('fence',fx,py2,{s:0});
          }
        }
        if(n>0)lootProp(gx+3,gy+6);
      }
      continue;
    }
    const list=ZB[z];if(!list)continue;
    const roll=hsh(gx,gy,771);
    const res=(z===3||z===4);        /* адміністративно-торгові зони */
    if(z===10||z===11){
      /* промзона: ряди цехів і складів — РОЗМІРИ З CATS (спрайт = футпринт, заводи 4x3) */
      const c0=list[0],d0=CATS[c0];
      placeB(gx+1,gy+1,d0[0],d0[1],c0,z);
      if(roll<0.72){const c1=list[ri(0,list.length-1)],d1=CATS[c1];placeB(gx+1,gy+5,d1[0],d1[1],c1,z);}
      if(roll>0.42)placeB(gx+6,gy+2,1,1,'garage',z);
      lootProp(gx+4,gy+4);
      continue;
    }
    if(roll<0.52){
      /* КОМПЛЕКС-ПІДКОВА: 3-4 ВЕЛИКИХ будинки (футпринти 3x2…4x3) навколо спільного двору.
         Лейаути перераховані під нові розміри — правий будинок вирівняний до краю комірки */
      const o=hsh(gx,gy,772);
      const cA=list[ri(0,list.length-1)],cB=list[ri(0,list.length-1)],cC=list[ri(0,list.length-1)];
      const dA=CATS[cA],dB=CATS[cB],dC=CATS[cC];
      let n=0;
      if(o<0.25){          /* П-подібна: два будинки зверху по краях, один знизу по центру, отвір на південь */
        if(placeB(gx,gy,dA[0],dA[1],cA,z))n++;
        if(placeB(gx+8-dB[0],gy,dB[0],dB[1],cB,z))n++;
        if(placeB(gx+2,gy+5,dC[0],dC[1],cC,z))n++;
        if(n>=2&&roll<0.18){const cg=res?'shop1':'garage',dg=CATS[cg];placeB(gx+2,gy+7-dg[1],dg[0],dg[1],cg,z);}
        courtyard(gx+2,gy+2,4,3,z);
      } else if(o<0.5){    /* два ряди з двором-проходом посередині */
        if(placeB(gx,gy,dA[0],dA[1],cA,z))n++;
        if(placeB(gx+8-dB[0],gy,dB[0],dB[1],cB,z))n++;
        if(placeB(gx+2,gy+5,dC[0],dC[1],cC,z))n++;
        courtyard(gx+2,gy+2,4,3,z);
      } else if(o<0.75){   /* два ряди вертикально + бічний корпус */
        if(placeB(gx,gy,dA[0],dA[1],cA,z))n++;
        if(placeB(gx,gy+4,dB[0],dB[1],cB,z))n++;
        if(placeB(gx+5,gy+2,dC[0],dC[1],cC,z))n++;
        courtyard(gx+3,gy,2,8,z);
      } else {             /* Г-подібна */
        if(placeB(gx,gy,dA[0],dA[1],cA,z))n++;
        if(placeB(gx,gy+4,dB[0],dB[1],cB,z))n++;
        if(placeB(gx+5,gy+5,dC[0],dC[1],cC,z))n++;
        courtyard(gx+2,gy+2,3,3,z);
      }
      lootProp(gx+2,gy+7);
      if(n===0){ /* фолбек: окрема будівля */
        for(let tr=0;tr<3;tr++){
          const cat=list[ri(0,list.length-1)];
          const[w,d]=CATS[cat];
          if(placeB(gx+ri(0,7-w),gy+ri(0,7-d),w,d,cat,z))break;
        }
      }
    } else if(roll<0.78){
      /* РЯД уздовж фасаду — вулична лінія з крамницями (без обрізання футпринтів!) */
      const shopC=res?['shop1','shop2','admin3']:['hist2','hist3','shop1'];
      let x=gx;
      for(let i=0;i<3&&x<gx+8;i++){
        const cat=(i===1&&roll<0.74)?shopC[ri(0,shopC.length-1)]:list[ri(0,list.length-1)];
        const[w,d]=CATS[cat];
        if(placeB(x,gy+1,w,d,cat,z))x+=w+1; else x+=2;
      }
      courtyard(gx+1,gy+4,6,3,z);
    } else {
      /* БАГАТОПОВЕРХІВКА (3x3 башта / 4x3 адмінка) + зелений двір */
      const tall=res?'admin4':(z===19?(hsh(gx,gy,773)<0.5?'towerb1':'towerb2'):(z===15?'retroC':(hsh(gx,gy,773)<0.5?'panel9':'panel9b')));
      const[tW,tD]=CATS[tall];
      if(placeB(gx+2,gy+2,tW,tD,tall,z)){
        courtyard(gx+1,gy+1,6,1,z);
        courtyard(gx+1,gy+5,6,2,z);
      } else {
        const cat=list[ri(0,list.length-1)];
        const[w,d]=CATS[cat];
        placeB(gx+2,gy+2,w,d,cat,z);
      }
    }
  }
  /* ---- ВХОДИ В БУДИНКИ (батч 10): двері на південному фасаді — E = зайти і СХОВАТИСЯ ----
     ставимо двері на фасаді кожної житлової будівлі (не гараж/руїна), тайл під фасадом вільний */
  /* ---- БАТЧ 14: АЗС — майданчики з навісом, колонками (E — заправка), касою і пілоном ---- */
  const GASST=[];
  function gasStation(gx,gy,zn){
    for(let yy=gy;yy<gy+6;yy++)for(let xx=gx;xx<gx+7;xx++){
      if(!inb(xx,yy))continue;const i=idx(xx,yy);
      if(ter[i]===T.water||ter[i]===T.road)continue;
      ter[i]=T.concrete;vrn[i]=0;blk[i]=1;
    }
    for(let yy=gy+1;yy<=gy+4;yy++)for(let xx=gx+1;xx<=gx+5;xx++)blk[idx(xx,yy)]=0;
    for(let xx=gx+2;xx<=gx+4;xx++){if(inb(xx,gy+5))blk[idx(xx,gy+5)]=0;}
    prop('gas_canopy',gx+3,gy+1,{s:0});
    prop('gas_pump',gx+1,gy+2,{s:1,meta:'pump'});
    prop('gas_pump',gx+4,gy+2,{s:1,meta:'pump'});
    prop('gas_sign',gx+6,gy+5,{s:1});
    prop('kiosk',gx+1,gy+5,{s:1,loot:'trunk'});
    prop('barrels',gx+5,gy+5,{s:1,loot:'barrels'});
    prop('lamp_b',gx+3,gy+4,{s:1});
    GASST.push({x:gx+3.5,y:gy+3,n:'АЗС • '+(IB.ZONES[zn]?IB.ZONES[zn].n:'')});
  }
  gasStation(38,46,0);gasStation(208,74,8);gasStation(218,20,14);gasStation(58,250,13);
  gasStation(264,92,19);gasStation(354,184,20);   /* батч 15: АЗС масиву і Рожнів */
  let doorN=0;
  for(let bi=0;bi<blds.length;bi++){
    const b=blds[bi];
    if(b.cat==='garage'||b.cat==='hist_ruin')continue;
    const dx=b.x+((b.wT/2)|0), dy=b.y+b.dT;       /* тайл просто під південним фасадом */
    if(!inb(dx,dy))continue;
    const i=idx(dx,dy);
    if(blk[i]||ter[i]===T.road||ter[i]===T.water||ter[i]===T.plaza||ter[i]===T.rail)continue;
    const dp=prop('doorp',dx,dy,{s:0,meta:'enter'});
    dp.bld=bi;                    /* двері знають свою будівлю */
    b.door={x:dx,y:dy};           /* будівля знає свої двері */
    b.floors=IB.BLD_FLOORS(b);    /* 2-4 поверхи залежно від категорії */
    doorN++;
    /* ---- БАТЧ 15: РОЗШИРЕНИЙ ВХІД — площадка, килимок, лава, ліхтар ---- */
    const res2=b.zone===0||b.zone===1||b.zone===8||b.zone===14||b.zone===15||['dacha1','dacha2','dacha3','khrus','khrus2','panel9','panel9b','panel_c1','panel_c2','panel_c3','tower_g','towerb1','towerb2','bhouse1','bhouse2','vill1','vill2','retroA','retroB','retroD','retroE'].indexOf(b.cat)>=0;
    if(!res2)continue;
    for(let xx=dx-1;xx<=dx+1;xx++)for(let yy=dy;yy<=dy+1;yy++){
      if(!inb(xx,yy))continue;
      const ii2=idx(xx,yy);
      if(blk[ii2]===0&&(ter[ii2]===T.grass||ter[ii2]===T.dirt||ter[ii2]===T.sidewalk))ter[ii2]=T.pave;
    }
    if(inb(dx,dy+1)&&blk[idx(dx,dy+1)]===0)prop('doormat',dx,dy+1,{s:0});
    if(inb(dx-2,dy+1)&&blk[idx(dx-2,dy+1)]===0&&hsh(dx,dy,7715)<0.5)prop('bench',dx-2,dy+1,{s:1});
    if(inb(dx+2,dy+1)&&blk[idx(dx+2,dy+1)]===0&&hsh(dx,dy,7716)<0.55)prop('lamp_b',dx+2,dy+1,{s:1});
    if(inb(dx+1,dy+1)&&blk[idx(dx+1,dy+1)]===0&&hsh(dx,dy,7717)<0.3)prop('pallet_r',dx+1,dy+1,{s:0});
    if(inb(dx-1,dy+1)&&blk[idx(dx-1,dy+1)]===0&&hsh(dx,dy,7718)<0.25)prop('crate',dx-1,dy+1,{s:1,loot:'crate'});
  }
  /* ---- ключові лут-точки та декор ---- */
  const put=[
    ['shelf',47,44,{s:1,loot:'pharmacy'}],['shelf',49,46,{s:1,loot:'pharmacy'}],['kiosk',48,45,{s:1}],
    ['shelf',118,153,{s:1,loot:'market'}],['shelf',120,153,{s:1,loot:'market'}],['shelf',122,151,{s:1,loot:'market'}],
    ['hole',64,141,{s:0,loot:'gate'}],['hole',151,186,{s:0,loot:'caves'}],['hole',152,199,{s:0,loot:'museum'}],
    ['hole',66,105,{s:0,loot:'podil'}],['hole',98,120,{s:0,loot:'andrew'}],
    ['barrels',66,52,{s:1,loot:'barrels'}],['barrels',68,52,{s:1,loot:'barrels'}],['tank',62,50,{s:1}],
    ['cache',69,146,{s:1,loot:'cache'}],['cache',30,30,{s:0,loot:'flat'}],
    ['cache',205,159,{s:1,loot:'cache'}],['cache',197,61,{s:1,loot:'cache'}],
    ['cache',69,200,{s:1,loot:'cache'}],['cache',101,104,{s:1,loot:'cache'}],
    ['cache',135,186,{s:1,loot:'cache'}],['cache',150,199,{s:0,loot:'cache'}],
    ['cache',211,141,{s:1,loot:'cache'}],['cache',99,92,{s:1,loot:'cache'}],
    ['cache',143,150,{s:1,loot:'cache'}],['cache',109,148,{s:1,loot:'cache'}],
    ['bench',86,130,{s:1}],['bench',92,136,{s:1}],['fountain',84,133,{s:1}],['statue',87,136,{s:1}],
    ['bench',136,146,{s:1}],['fountain',136,147,{s:1}],['fountain',147,147,{s:1}],
    ['tree_o',112,128,{s:0}],['tree_o',116,142,{s:0}],['tree_o2',124,156,{s:0}],['bush',114,136,{s:0}],
    ['tree_o',134,170,{s:0}],['tree_o',142,166,{s:0}],['pine',130,200,{s:0}],['tree_o2',148,180,{s:0}],
    ['swing',36,30,{s:1}],['slide',38,31,{s:1}],['bench',37,33,{s:1}],['wreck1',35,32,{s:1}],
    ['swing',192,52,{s:1}],['slide',194,53,{s:1}],['wreck2',193,55,{s:1}],
    ['dumpster',33,34,{s:1,loot:'dumpster'}],['dumpster',196,58,{s:1,loot:'dumpster'}],
    ['traff',119,150,{s:1}],['traff',131,151,{s:1}],['busstop',115,153,{s:1}],['busstop',125,150,{s:1}],
    ['barr',116,151,{s:1}],['barr',121,151,{s:1}],['barr',126,151,{s:1}],['sandbag',118,149,{s:1}],['sandbag',124,153,{s:1}],
    ['wreck1',114,152,{s:1}],['wreck2',123,152,{s:1}],['wreck1',129,151,{s:1}],
    ['barr',139,154,{s:1}],['sandbag',143,156,{s:1}],['wreck2',137,156,{s:1}],
    ['lamp_b',80,90,{s:1}],['kiosk',90,96,{s:1,loot:'crate'}],
    ['pipe',186,166,{s:1}],['pipe',192,172,{s:1}],['chimney',182,158,{s:1}],['chimney',198,150,{s:1}],
    ['tank',190,164,{s:1}],['tank',200,170,{s:1}],['vent',188,178,{s:1}],['cone',196,182,{s:1}],
    ['wreck1',184,172,{s:1}],['wreck2',206,168,{s:1}],['dumpster',200,160,{s:1,loot:'dumpster'}],
    ['vent',70,204,{s:1}],['fence',74,196,{s:1}],['wreck2',60,198,{s:1}],
    ['doorp',36,29,{s:0}],['doorp',100,106,{s:0}],['doorp',71,148,{s:0}],['doorp',158,135,{s:0}],['doorp',198,62,{s:0}],['doorp',206,162,{s:0}],['doorp',69,202,{s:0}],
    ['cone',180,106,{s:0}],['barr',178,103,{s:1}],['sandbag',179,106,{s:1}],
    /* ІРПІНЬ (пд-захід, далеко): дачне життя біля схованки */
    ['kiosk',44,318,{s:1}],['cache',49,322,{s:1,loot:'cache'}],['cache',43,324,{s:1,loot:'cache'}],
    ['bench',48,318,{s:1}],['swing',43,321,{s:1}],['slide',44,321,{s:1}],
    ['wreck1',51,315,{s:1}],['dumpster',42,319,{s:1,loot:'dumpster'}],['barr',49,318,{s:1}],
    ['fence',44,323,{s:0}],['fence',45,323,{s:0}],['fence',46,323,{s:0}],
    ['pine',40,322,{s:0}],['pine',58,326,{s:0}],['bush',42,326,{s:0}],['tree_o2',39,318,{s:0}],
    /* СЕЛИЩЕ ІРПІНЬ (батч 14): площа з каплицею, криниця, кіоск, лавиці, паркан */
    ['well',56,385,{s:1,loot:'well'}],['kiosk',53,383,{s:1,loot:'crate'}],['bench',55,384,{s:1}],
    ['bench',60,384,{s:1}],['fence',50,387,{s:0}],['fence',51,387,{s:0}],['fence',52,387,{s:0}],
    ['barrels',62,385,{s:1,loot:'barrels'}],['wreck2',63,387,{s:1}],['lamp_b',54,382,{s:1}],['lamp_b',61,383,{s:1}],
    ['tree_s',50,381,{s:0}],['tree_a',64,382,{s:0}],['tree_b',47,384,{s:0}],['bush',65,384,{s:0}],
    ['cache',45,383,{s:1,loot:'cache'}],['dumpster',66,387,{s:1,loot:'dumpster'}],
    /* ТРОЄЩИНА (батч 14): двори колоритного району */
    ['bench',198,26,{s:1}],['tree_b',202,26,{s:0}],['swing',199,24,{s:1}],['dumpster',207,28,{s:1,loot:'dumpster'}],
    ['tree_p',214,24,{s:0}],['traff',191,34,{s:1}],['busstop',194,35,{s:1}],['kiosk',210,36,{s:1,loot:'crate'}],
    ['lamp_b',197,27,{s:1}],['bench',226,38,{s:1}],['tree_big',216,42,{s:0}],
    /* ---- БАТЧ 15: ДЕСНА — пости мостів-чекпоїнтів ---- */
    ['barr_s',329,28,{s:1}],['barr_s',329,31,{s:1}],['barr_s',357,28,{s:1}],['barr_s',357,31,{s:1}],
    ['barr_s',330,118,{s:1}],['barr_s',330,121,{s:1}],['barr_s',358,118,{s:1}],['barr_s',358,121,{s:1}],
    ['kiosk',326,26,{s:1,loot:'crate'}],['barrels',362,26,{s:1,loot:'barrels'}],['light_d',331,25,{s:1}],['light_d',356,25,{s:1}],
    /* ---- ДНІПРО: вантажний корабель, буксир, буї (watercraft-kit) ---- */
    ['ship_cargo',173,164,{s:0}],['boat_tug',181,171,{s:0}],['buoy',167,140,{s:0}],['buoy',176,190,{s:0}],['boat_row',164,186,{s:0}],['buoy',170,100,{s:0}],
    /* ---- ОЗЕРО ПУХІВСЬКЕ: човни, дерев'яний пірс ---- */
    ['boat_row2',382,124,{s:0}],['boat_fish',397,126,{s:0}],['boat_speed',384,142,{s:0}],['boat_row',401,139,{s:0}],['boat_fish',379,136,{s:0}],
    ['buoy',390,118,{s:0}],['buoy',399,143,{s:0}],['buoy',408,130,{s:0}],
    ['planks_r',388,131,{s:0}],['planks_r',388,134,{s:0}],['planks_r',391,128,{s:0}],['planks_r',394,137,{s:0}],['pallet_r',393,133,{s:0}],
    /* ---- СЕЛО ПУХІВКА: криниця, кіоск, пірс, паркани ---- */
    ['well',372,142,{s:1,loot:'well'}],['kiosk',364,140,{s:1,loot:'crate'}],['bench',373,139,{s:1}],['bench',370,144,{s:1}],
    ['pallet_r',376,146,{s:0}],['planks_r',378,146,{s:0}],['barrels',363,146,{s:1,loot:'barrels'}],
    ['fence',362,138,{s:0}],['fence',363,138,{s:0}],['lamp_b',365,136,{s:1}],['cache',358,144,{s:1,loot:'cache'}],
    ['tree_a',360,132,{s:0}],['tree_b',380,150,{s:0}],['bush',374,152,{s:0}],['bench_r',368,148,{s:1}],
    ['barric_win',366,134,{s:1}],['dumpster',378,142,{s:1,loot:'dumpster'}],
    /* ---- СЕЛО РОЖНИ ---- */
    ['well',384,212,{s:1,loot:'well'}],['kiosk',375,208,{s:1,loot:'crate'}],['bench',385,210,{s:1}],['bench_r',382,206,{s:1}],
    ['pallet_r',390,214,{s:0}],['barrels',393,206,{s:1,loot:'barrels'}],['fence',374,216,{s:0}],['fence',375,216,{s:0}],
    ['cache',372,222,{s:1,loot:'cache'}],['lamp_b',376,210,{s:1}],['tree_s',372,204,{s:0}],['pine',396,220,{s:0}],
    ['planks_r',386,216,{s:0}],['dumpster',398,210,{s:1,loot:'dumpster'}],['wreck2',404,204,{s:1}],
    /* ---- ВИГУРІВЩИНА: ретро-двір ---- */
    ['bench_r',222,64,{s:1}],['light_d',221,62,{s:1}],['awning_r',230,58,{s:0}],['pallet_r',235,70,{s:0}],['barr_s',228,72,{s:1}],
    ['tree_a',236,60,{s:0}],['bush',218,66,{s:0}],['kiosk',224,68,{s:1,loot:'crate'}],
    /* ---- ХАРКІВСЬКИЙ МАСИВ ---- */
    ['bench',268,70,{s:1}],['traff',252,62,{s:1}],['busstop',256,63,{s:1}],['dumpster',278,74,{s:1,loot:'dumpster'}],
    ['tree_b',290,68,{s:0}],['bush',284,72,{s:0}],['fpipe_h',294,80,{s:1}],['fbox',296,84,{s:1}],
    /* ---- ТРИПІЛЬСЬКА ГОРА: табір з палатками і багаттям ---- */
    ['tent_a',248,458,{s:1}],['tent_b',254,460,{s:1}],['tent_c',250,466,{s:1}],['tent_a',258,464,{s:1}],['tent_b',244,464,{s:1}],
    ['campfire',252,462,{s:0}],['pallet_r',246,462,{s:0}],['planks_r',258,462,{s:0}],['barrels',244,460,{s:1,loot:'barrels'}],
    ['bench',256,456,{s:1}],['cache',242,464,{s:1,loot:'cache'}],['light_d',249,455,{s:1}],['pallet_r',256,468,{s:0}],
    ['mtn_rock',262,456,{s:1}],['mtn_rock2',236,454,{s:1}],['mtn_rock3',266,468,{s:1}],
  ];
  for(const[t,x,y,o]of put)prop(t,x,y,o||{});
  /* ---- БАЗА ВВ13 • КПІ: укріплення навколо (мішки, барикади, генератор) ---- */
  const BASE={x:78.5,y:214.6,r:6.5};          /* центр безпечної зони (південний вхід бази) */
  prop('sandbag',74,210,{s:1});prop('sandbag',82,211,{s:1});prop('sandbag',75,213,{s:0});
  prop('barr',74,212,{s:1});prop('barr',82,213,{s:1});prop('tank',73,215,{s:1});
  prop('cache',80,215,{s:0,loot:'crate'});prop('dumpster',72,212,{s:1,loot:'dumpster'});
  prop('lamp_b',76,214,{s:1});prop('lamp_b',81,215,{s:1});prop('flag',79,213,{s:0});
  /* дерева на траві: у лісі Ірпеня — густі сосни і СМЕРЕКИ (батч 14), у місті — різноманіття */
  for(let y=4;y<H-4;y+=2)for(let x=4;x<W-4;x+=2){
    if(ter[idx(x,y)]!==T.grass||blk[idx(x,y)])continue;
    const r=hsh(x,y,808);
    const z=zone[idx(x,y)];
    if(z===13){
      if(r<0.1)prop('pine',x,y,{s:0});
      else if(r<0.18)prop('tree_s',x,y,{s:0});           /* смерека */
      else if(r<0.21)prop('tree_big',x,y,{s:0});
      else if(r<0.24)prop('tree_o2',x,y,{s:0});
      else if(r<0.26)prop('bush',x,y,{s:0});
      continue;
    }
    if(z===14){
      if(r<0.035){const tw=hsh(x,y,819);prop(tw<0.35?'tree_o':tw<0.6?'tree_b':tw<0.8?'tree_p':'tree_big',x,y,{s:0});}
      else if(r<0.05)prop('bush',x,y,{s:0});
      continue;
    }
    if(z===17){   /* БРОВАРСЬКИЙ ЛІС — густі хвойні (батч 15) */
      if(r<0.2)prop('pine',x,y,{s:0});
      else if(r<0.3)prop('tree_s',x,y,{s:0});
      else if(r<0.35)prop('tree_o2',x,y,{s:0});
      else if(r<0.38)prop('bush',x,y,{s:0});
      continue;
    }
    if(z===18||z===20){   /* села за Десною: фруктові дерева і кущі (густіше) */
      if(r<0.1){const tw=hsh(x,y,821);prop(tw<0.3?'tree_a':tw<0.6?'tree_b':tw<0.85?'tree_o2':'tree_big',x,y,{s:0});}
      else if(r<0.14)prop('bush',x,y,{s:0});
      continue;
    }
    if(z===21){   /* ТРИПІЛЬСЬКА ГОРА: рідкі сосни + валуни */
      if(r<0.05)prop('pine',x,y,{s:0});
      else if(r<0.09)prop('tree_s',x,y,{s:0});
      else if(r<0.115)prop('mtn_rock3',x,y,{s:1});
      else if(r<0.13)prop('bush',x,y,{s:0});
      continue;
    }
    const p=z===10||z===5?0.05:0.028;
    if(r<p){const tw=hsh(x,y,818);prop(tw<0.38?'tree_o':tw<0.58?'tree_o2':tw<0.72?'tree_b':tw<0.84?'tree_big':tw<0.92?'tree_p':'tree_a',x,y,{s:0});}
    else if(r<p+0.012)prop('bush',x,y,{s:0});
    else if(r<p+0.02&&(z===10||z===11))prop('dead',x,y,{s:0});
  }
  /* ліхтарі вздовж доріг */
  for(let y=6;y<H-6;y+=5)for(let x=6;x<W-6;x+=5){
    if(ter[idx(x,y)]!==T.sidewalk||blk[idx(x,y)])continue;
    if(hsh(x,y,909)<0.5)prop(hsh(x,y,910)<0.5?'lamp':'lamp_b',x,y,{s:1});
  }
  /* ---- метро: входи-станції (батч 14: + ТРОЄЩИНА) ---- */
  const stations=[
    {x:35,y:37,n:'ОБОЛОНЬ'},{x:92,y:97,n:'КОНТРАКТОВА ПЛОЩА'},{x:119,y:153,n:'ХРЕЩАТИК'},
    {x:136,y:154,n:'МАЙДАН НЕЗАЛЕЖНОСТІ'},{x:139,y:171,n:'ПЕЧЕРСЬКА'},
    {x:196,y:102,n:'ЛІВОБЕРЕЖНА'},{x:196,y:183,n:'ДАРНИЦЯ'},{x:66,y:199,n:'ВОКАЗАЛЬНА'},
    {x:196,y:30,n:'ТРОЄЩИНА'},
  ];
  for(const st of stations){prop('metro_m',st.x,st.y,{s:1,meta:st.n});blk[idx(st.x,st.y)]=0;}
  /* ---- підземні переходи ---- */
  const passages=[
    {a:[134,146],b:[148,156],n:'ПІДЗЕМНИЙ ПЕРЕХІД — МАЙДАН'},
    {a:[117,154],b:[127,149],n:'ПІДЗЕМНИЙ ПЕРЕХІД — ХРЕЩАТИК'},
    {a:[104,100],b:[110,92],n:'ПІДЗЕМНИЙ ПЕРЕХІД — ПОДІЛ'},
  ];
  for(const p of passages){prop('stairs',p.a[0],p.a[1],{s:0,meta:'pass'});prop('stairs',p.b[0],p.b[1],{s:0,meta:'pass'});}
  /* ---- схованки (safehouse) ---- */
  const safes=[
    {x:46,y:319,n:'ДАЧА В ІРПНІ',z:'ІРПІНЬ'},   /* далеко за містом — треба пройти ліс */
    {x:31,y:30,n:'КВАРТИРА ВІКТОРА',z:'ОБОЛОНЬ'},
    {x:101,y:105,n:'ПОДІЛЬСЬКИЙ ПІДВАЛ',z:'ПОДІЛ'},
    {x:70,y:147,n:'СТАРИЙ СКЛАД БІЛЯ ЗОЛОТИХ ВОРІТ',z:'СТАРЕ МІСТО'},
    {x:158,y:134,n:'ТАБІР НА ГІДРОПАРКУ',z:'ГІДРОПАРК'},
    {x:197,y:61,n:'КВАРТИРА НА ЛІВОБЕРЕЖЖІ',z:'ЛІВИЙ БЕРЕГ'},
    {x:205,y:160,n:'СКЛАД У ПРОМЗОНІ',z:'ПРОМЗОНА'},
    {x:68,y:201,n:'ГАРАЖ БІЛЯ ВОКАЗАЛУ',z:'ВОКАЗАЛ'},
    {x:212,y:46,n:'БУНКЕР ТРОЄЩИНИ',z:'ТРОЄЩИНА'},       /* батч 14 */
    {x:49,y:397,n:'СЕЛИЩСЬКА ХАТА',z:'ІРПІНЬ'},          /* батч 14 */
    {x:362,y:158,n:'ХАТА В ПУХІВЦІ',z:'ПУХІВКА'},         /* батч 15 */
    {x:384,y:222,n:'КОТРИЦЯ НА РОЖНАХ',z:'РОЖНИ'},        /* батч 15 */
    {x:252,y:462,n:'СТОЯНКА В ГОРАХ',z:'ТРИПІЛЬСЬКА ГОРА'},   /* батч 15 */
  ];
  for(const s of safes)prop('cache',s.x,s.y,{s:0,meta:'safe'});
  /* ---- NPC ---- */
  const npcs=[
    {x:95.5,y:94.5,n:'ВАЛЕНТИНА — ТОРГОВКА',role:'trader'},
    {x:157.5,y:132.5,n:'СЕРГІЙ — ТАБІР',role:'camp'},
    {x:160.5,y:136.5,n:'ОЛЯ — МЕДСЕСТРА',role:'medic'},
    {x:181.5,y:103.5,n:'ПАТОН — ВАРТОВИЙ МОСТУ',role:'guard'},
    {x:196.5,y:62.5,n:'ГАНЯ — ЛІВОБЕРЕЖЖЯ',role:'trader2'},
    {x:372.5,y:141.5,n:'МІКОЛА — РИБАЛКА З ПУХІВКИ',role:'trader2'},    /* батч 15 */
    {x:254.5,y:463.5,n:'ОЛЕКСІЙ — СТОЯНКА В ГОРАХ',role:'camp'},        /* батч 15 */
  ];
  /* ---- радіовежі (сигнали) ---- */
  const towers=[{x:26,y:356,n:'ВИШКА ІРПІНЬ'},{x:154,y:126,n:'ВИШКА ГІДРОПАРК'},{x:60,y:133,n:'ВИШКА СТАРОГО МІСТА'},{x:140,y:194,n:'ВИШКА ПЕЧЕРСЬКА'},{x:212,y:142,n:'ВИШКА ДАРНИЦЯ'},{x:208,y:44,n:'ВИШКА ТРОЄЩИНИ'},{x:420,y:100,n:'ВИШКА БРОВАРСЬКОГО ЛІСУ'},{x:300,y:452,n:'ВИШКА ТРИПІЛЬСЬКОЇ ГОРИ'}];
  /* ---- авто: припарковані вздовж доріг усього міста (багато, БІЛЯ ПРАВОГО УЗБІЧЧЯ — правосторонній рух,
     щоб авто не вилазили за край дороги і не здавалися "більшими за дорогу") ---- */
  const CARS=IB.SPR.CARS;
  const cars=[];
  function addCar(mdl,x,y,dir,drivable,fuel,hp,exact){
    /* батч 13: кольоровий варіант (Kenney car-kit рендери _a/_b), детермінований */
    const vr=hsh(x*7+y,3,715)<0.42?(hsh(x,y,716)<0.5?'a':'b'):null;
    cars.push({mdl,var:vr,x:exact?x:x+0.5,y:exact?y:y+0.5,dir,drivable,fuel,hp,broken:!drivable,looted:false});
  }
  /* зсув до узбіччя (side=1 праворуч / -1 ліворуч): скануємо дорогу поперек напряму, паркунок так,
     щоб увесь габарит (hw = половина ширини моделі) вліз в асфальт із зазором */
  function curbOff(x,y,dir,hw,side){
    const dv=[[1,0],[-1,0],[0,1],[0,-1]][dir];
    const p=side===-1?[dv[1],-dv[0]]:[-dv[1],dv[0]];   /* бік паркування */
    let r=0;while(r<5&&inb(x+p[0]*(r+1),y+p[1]*(r+1))&&ter[idx(x+p[0]*(r+1),y+p[1]*(r+1))]===T.road&&!brg[idx(x+p[0]*(r+1),y+p[1]*(r+1))])r++;
    let l=0;while(l<5&&inb(x-p[0]*(l+1),y-p[1]*(l+1))&&ter[idx(x-p[0]*(l+1),y-p[1]*(l+1))]===T.road&&!brg[idx(x-p[0]*(l+1),y-p[1]*(l+1))])l++;
    const hi=r+0.5-hw-0.07, lo=hw+0.07-(l+0.5);   /* межі: не за край дороги з обох боків */
    return [p,Math.max(lo,hi)];
  }
  addCar('vaz',33,28,0,true,45,95);  // перше авто біля дому
  addCar('truck',64,48,1,true,60,120);
  const MDLS=['vaz','lanos','skoda','taxi','suv','vaz','lanos','truck','vaz','police','skoda','van','lanos','delivery','taxi','ambulance'];   /* довгі автобуси прибрано — 6 ДЕТАЛЬНИХ моделей легкових+пікап */
  let carN=2;
  outer:
  for(let y=8;y<H-8;y+=5)for(let x=8;x<W-8;x+=5){
    if(carN>=120)break outer;
    if(ter[idx(x,y)]!==T.road||brg[idx(x,y)]||hsh(x,y,707)>0.34)continue;
    const rm=rdm[idx(x,y)];
    if(rm===15||rm===16)continue;               /* не на перехрестях */
    const vert=(rm&1||rm&4)&&!(rm&2||rm&8);
    const horiz=(rm&2||rm&8)&&!(rm&1||rm&4);
    const dir=vert?(hsh(x,y,709)<0.5?1:3):(horiz?(hsh(x,y,710)<0.5?0:2):(hsh(x,y,711)<0.5?0:2));
    const mdl=MDLS[ri(0,MDLS.length-1)];
    const[cp,off]=curbOff(x,y,dir,IB.SPR.CARS[mdl].wt*0.5);
    addCar(mdl,x+0.5+cp[0]*off,y+0.5+cp[1]*off,dir,hsh(x,y,712)<0.6,15+IB.M.round(55*hsh(x,y,713)),70+IB.M.round(30*hsh(x,y,714)),true);
    carN++;
  }
  addCar('lanos',116,150,0,false,0,0);addCar('skoda',124,153,2,true,35,88);
  addCar('skoda',140,196,1,true,50,110);addCar('vaz',150,199,0,false,0,0);
  addCar('truck',186,161,0,true,70,140);addCar('skoda',182,104,0,true,40,90);
  /* дорога на пд крізь ліс + вулички Ірпеня (далеко за містом) */
  addCar('vaz',53,240,1,true,30,80);addCar('skoda',54,260,1,true,25,75);
  addCar('lanos',59,280,1,true,20,70);
  addCar('vaz',57,302,1,true,35,85);addCar('vaz',41,316,2,true,20,70);
  addCar('skoda',73,316,2,true,30,80);addCar('vaz',89,318,1,true,15,60);
  addCar('lanos',57,334,1,false,0,0);addCar('vaz',44,333,0,true,25,75);
  addCar('skoda',58,350,2,true,30,75);addCar('vaz',75,349,0,false,0,0);
  /* батч 14: авто селища і Троєщини */
  addCar('vaz',58,392,0,true,30,80);addCar('skoda',74,408,0,true,25,75);addCar('lanos',44,377,2,false,0,0);
  addCar('skoda',192,32,1,true,40,90);addCar('vaz',220,30,0,true,35,85);addCar('suv',205,22,1,true,45,100);
  /* батч 15: авто східних районів, сіл за Десною і гірської ґрунтовки */
  addCar('lanos',250,31,1,true,35,80);addCar('vaz',288,31,1,true,30,75);addCar('skoda',264,15,1,true,30,70);
  addCar('skoda',220,59,0,true,35,85);addCar('vaz',238,85,2,true,30,75);addCar('lanos',288,66,1,true,30,70);
  addCar('suv',288,95,3,true,40,95);addCar('vaz',270,119,0,true,30,75);
  addCar('vaz',370,119,0,true,25,70);addCar('skoda',384,153,2,true,25,70);addCar('vaz',392,98,0,false,0,0);
  addCar('vaz',380,201,0,true,20,65);addCar('lanos',410,201,0,true,20,60);addCar('skoda',378,225,0,false,0,0);
  addCar('suv',208,300,1,true,30,75);addCar('vaz',207,380,1,true,25,70);addCar('lanos',208,440,1,true,20,60);
  /* ---- випалени рештки (декор) ---- */
  prop('wreck1',70,44,{s:1});prop('wreck2',44,42,{s:1});prop('wreck1',110,90,{s:1});
  prop('wreck2',86,102,{s:1});prop('wreck1',142,168,{s:1});prop('wreck2',164,176,{s:1});
  prop('corpse',120,148,{s:0});prop('corpse',84,104,{s:0});prop('corpse',138,158,{s:0});prop('corpse',192,168,{s:0});
  /* ---- блокування від пропсів ---- */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  /* АВТО НЕ СТОЯТЬ У БУДІВЛЯХ: перевіряємо ВЕСЬ ГАБАРИТ кузова (довге авто ~4 тайли),
     зсуваємо на найближче вільне місце — інакше clearArea нижче стирає колізію будівлі
     і в неї ПРОЇДЖАЮТЬ НАСКРІЗЬ */
  function carFits(x,y,dir,lt,wt){
    const dv=[[1,0],[-1,0],[0,1],[0,-1]][dir];
    const px=-dv[1],py=dv[0],hl=lt*0.5,hw=wt*0.5+0.1;
    for(const[sa,sb]of[[hl,0],[-hl,0],[0,hw],[0,-hw],[hl,hw],[hl,-hw],[-hl,hw],[-hl,-hw],[0,0]]){
      const tx=(x+dv[0]*sa+px*sb)|0,ty=(y+dv[1]*sa+py*sb)|0;
      if(!inb(tx,ty)||blk[idx(tx,ty)]||ter[idx(tx,ty)]===T.water||ter[idx(tx,ty)]===T.rail)return false;
    }
    return true;
  }
  for(const c of cars){
    const spec=CARS[c.mdl],cx0=c.x|0,cy0=c.y|0;
    if(!carFits(c.x,c.y,c.dir,spec.lt,spec.wt)){
      let done=false;
      for(let rr=1;rr<=3&&!done;rr++){
        for(let yy=cy0-rr;yy<=cy0+rr&&!done;yy++)for(let xx=cx0-rr;xx<=cx0+rr&&!done;xx++){
          if(!inb(xx,yy))continue;
          const fx=xx+0.5,fy=yy+0.5;
          if(carFits(fx,fy,c.dir,spec.lt,spec.wt)){c.x=fx;c.y=fy;done=true;}
        }
      }
      if(!done){c.x=cx0+0.5;c.y=cy0+0.5;}
    }
    /* другий прохід: авто на дорозі — підтягнути до узбіччя (спочатку правого, якщо зайнято — лівого) */
    const sx0=c.x|0,sy0=c.y|0;
    if(inb(sx0,sy0)&&ter[idx(sx0,sy0)]===T.road&&!brg[idx(sx0,sy0)]){
      for(const side of [1,-1]){
        const[cp2,off2]=curbOff(sx0,sy0,c.dir,spec.wt*0.5,side);
        const fx2=sx0+0.5+cp2[0]*off2, fy2=sy0+0.5+cp2[1]*off2;
        if(carFits(fx2,fy2,c.dir,spec.lt,spec.wt)){c.x=fx2;c.y=fy2;break;}
      }
    }
  }
  /* ---- ГАРАНТОВАНІ ЧИСТІ ЗОНИ: ніколи не замуровуємо ключові точки ---- */
  function clearArea(cx,cy,r){
    for(let yy=Math.max(1,Math.floor(cy-r));yy<=Math.min(H-2,Math.ceil(cy+r));yy++)
    for(let xx=Math.max(1,Math.floor(cx-r));xx<=Math.min(W-2,Math.ceil(cx+r));xx++){
      const i=idx(xx,yy);
      if(ter[i]===T.water)continue;
      if(blk[i]===4)continue;                  /* кордон карти лишається */
      if(blk[i])blk[i]=0;
    }
  }
  /* спавн гравця — двір квартири */
  for(let yy=28;yy<=34;yy++)for(let xx=28;xx<=35;xx++){const i=idx(xx,yy);if(ter[i]===T.grass&&blk[i]===0)ter[i]=T.dirt;}
  clearArea(31.5,31.5,2.6);
  for(const s of safes)clearArea(s.x+0.5,s.y+0.5,2.2);
  for(const st of stations)clearArea(st.x+0.5,st.y+0.5,2.2);
  for(const gs of GASST){clearArea(gs.x,gs.y+3.8,2.4);}   /* батч 14: під'їзд до АЗС */
  clearArea(57,384.5,3.0);                                /* батч 14: площа селища */
  clearArea(200.5,26.5,3.0);                              /* батч 14: двір Троєщини */
  for(const p of passages){clearArea(p.a[0]+0.5,p.a[1]+0.5,1.6);clearArea(p.b[0]+0.5,p.b[1]+0.5,1.6);}
  for(const n of npcs)clearArea(n.x,n.y,1.6);
  for(const c of cars)clearArea(c.x,c.y,0.55);   /* лише свій тайл — НЕ стираємо колізію сусідніх будівель */
  for(const l of lms){                          /* входи до локацій */
    clearArea(l.x+l.wT/2,l.y-1,1.8);
    clearArea(l.x-1,l.y+l.dT/2,1.8);
    clearArea(l.x+l.wT+0.5,l.y+l.dT/2,1.8);
  }
  /* БАЗА ВВ13: clearArea входів розмиває футпринт — відновлюємо суцільну колізію корпусу */
  for(let yy=210;yy<=212;yy++)for(let xx=76;xx<=79;xx++){const ii=idx(xx,yy);if(inb(xx,yy)){blk[ii]=1;ter[ii]=T.concrete;}}
  /* вільні тайли підходу з півдня (двір бази) */
  for(let xx=75;xx<=83;xx++){const ii=idx(xx,213);if(inb(xx,213))blk[ii]=0;}
  /* БАТЧ 17: ВХІД НА БАЗУ ВВ13 — двері на південному фасаді, E = зайти всередину (інтер'єр бази) */
  prop('doorp',79,213,{s:0,meta:'vv13'});
  /* ---- мінімапа ---- */
  const mm=IB.mk(W,H);const g=mm.g;
  const MC={[T.grass]:'#1c3a1e',[T.park]:'#225028',[T.field]:'#3e4422',[T.sidewalk]:'#3a3f4a',[T.pave]:'#40444e',[T.cobble]:'#3a3830',
    [T.concrete]:'#2e3138',[T.plaza]:'#4e2a20',[T.rubble]:'#2e3138',[T.dirt]:'#3a3228',[T.sand]:'#565638',[T.rail]:'#40404a',[T.water]:'#1c3860',[T.road]:'#4c4c55',[T.rock]:'#43474f'};
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){g.fillStyle=MC[ter[idx(x,y)]]||'#1c3a1e';g.fillRect(x,y,1,1);}
  for(const b of blds){g.fillStyle='#5a606c';g.fillRect(b.x,b.y,b.wT,b.dT);}
  for(const l of lms){g.fillStyle='#f0d050';g.fillRect(l.x,l.y,l.wT,l.dT);}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(elev[idx(x,y)]>=2){g.fillStyle='#ffffff10';g.fillRect(x,y,1,1);}}
  const world={W,H,ter,vrn,rdm,elev,zone,blk,brg,blds,lms,props,cars,stations,passages,safes,npcs,towers,mm,base:BASE,gas:GASST,
    bridges:BRIDGES.concat(DBRIDGES),ridx:idx,inb,clearArea,
    /* БАТЧ 15: POI для навігатора */
    lake:{x:390.5,y:133.5,n:'ОЗЕРО ПУХІВСЬКЕ'},
    mtn:{x:252,y:462,n:'СТОЯНКА В ГОРАХ'},
    villages:[{x:368,y:140,n:'СЕЛО ПУХІВКА'},{x:388,y:210,n:'СЕЛО РОЖНИ'}],
    /* найближчий вільний тайл навколо точки (спіраль) — анти-замуровування */
    freeSpot:(x,y,maxR=6)=>{
      x|=0;y|=0;
      if(!inb(x,y))return {x:IB.M.max(3,IB.M.min(W-4,x)),y:IB.M.max(3,IB.M.min(H-4,y))};
      if(!blk[idx(x,y)]&&ter[idx(x,y)]!==T.water)return {x:x+0.5,y:y+0.5};
      for(let r=1;r<=maxR;r++){
        let best=null,bd=1e9;
        for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){
          if(!inb(xx,yy)||blk[idx(xx,yy)]||ter[idx(xx,yy)]===T.water)continue;
          const d=(xx-x)*(xx-x)+(yy-y)*(yy-y);
          if(d<bd){bd=d;best={x:xx+0.5,y:yy+0.5};}
        }
        if(best)return best;
      }
      return null;
    },
    zoneAt:(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0,
    zoneName:z=>IB.ZONES[z]?IB.ZONES[z].n:'—',
    danger:z=>IB.ZONES[z]?IB.ZONES[z].d:0,
    elevAt:(x,y)=>inb(x|0,y|0)?elev[idx(x|0,y|0)]:0,
    solid:(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;},
  };
  IB._expandCity(world);   /* БАТЧ 16: поля області навколо всього міста */
  IB._expandCity3(world);  /* БАТЧ 17: захід — Шулявка/Святошин/Академмістечко, південь — Либідська/Деміївська/Іподром/Вишневе; Ірпінь — за Академмістечком */
  IB.WORLD=world;
  return world;
};

/* ================================================================
   БАТЧ 16: КИЇВСЬКА ОБЛАСТЬ НАВКОЛО ВСЬОГО.
   Мапа 440x520 -> 560x660: весь старий контент зсувається на (+60,+80),
   а навколо нього малюються ПОЛЯ ОБЛАСТІ:
     ЗАХІД:  СЕЛО МОЩУН у лісі + СЕЛО БУЧА (котеджі новобудови)
     ПІВНІЧ: ВИШГОРОД з ГРЕБЛЕЮ через Дніпро + СЕЛО НОВІ ПЕТРІВЦІ за Десною
     СХІД:   МІСТО БРОВАРИ (сині/зелені панельки, FN<, АЗС)
     ПІВДЕНЬ: СЕЛО ТРИПІЛЛЯ над Дніпром під Трипільською горою
   Дороги з'єднують усе: з Оболоні тепер можна піти на захід/північ,
   з Троєщини — на північ за Десну, з Рожнів — на схід у Бровари.
   ================================================================ */
IB._expandCity=function(wd){
  const T=IB.TER;
  const W0=wd.W,H0=wd.H,OX=60,OY=80;
  const W2=W0+OX+60,H2=H0+OY+60;                    /* 560 x 660 */
  const grow=src=>{const d=new Uint8Array(W2*H2);for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)d[(y+OY)*W2+(x+OX)]=src[y*W0+x];return d;};
  const ter=grow(wd.ter),vrn=grow(wd.vrn),elev=grow(wd.elev),zone=grow(wd.zone),blk=grow(wd.blk),brg=grow(wd.brg);
  const rdm=new Uint8Array(W2*H2);
  const idx=(x,y)=>y*W2+x,inb=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2;
  const hsh=IB.hsh;
  const isContent=(x,y)=>x>=OX&&x<OX+W0&&y>=OY&&y<OY+H0;
  /* ---- 1. зсув усіх об'єктів старого контенту ---- */
  const sh=o=>{if(o&&o.x!==undefined){o.x+=OX;o.y+=OY;}};
  for(const b of wd.blds){sh(b);if(b.door)sh(b.door);}
  for(const a of wd.lms)sh(a);
  for(const p of wd.props)sh(p);
  for(const c of wd.cars)sh(c);
  for(const s of wd.stations)sh(s);
  for(const p of wd.passages||[])sh(p);
  for(const s of wd.safes)sh(s);
  for(const n of wd.npcs)sh(n);
  for(const t of wd.towers)sh(t);
  sh(wd.base);
  for(const g of wd.gas||[])sh(g);
  for(const v of wd.villages||[])sh(v);
  if(wd.lake)sh(wd.lake);
  if(wd.mtn)sh(wd.mtn);
  for(const bn of wd.bridges||[]){bn[0]+=OY;bn[2]=(bn[0]===110||bn[0]===200)?402:228;}
  /* ---- 2. старі кордони карти відкриваємо ---- */
  const edgeClear=(x,y)=>{const i=idx(x,y);if(blk[i]===4)blk[i]=(ter[i]===T.water)?2:0;};
  for(let y=OY;y<OY+H0;y++){edgeClear(OX,y);edgeClear(OX+1,y);edgeClear(OX+W0-2,y);edgeClear(OX+W0-1,y);}
  for(let x=OX;x<OX+W0;x++){edgeClear(x,OY);edgeClear(x,OY+1);edgeClear(x,OY+H0-2);edgeClear(x,OY+H0-1);}
  /* ---- 3. терраїн полів: річки, водосховище, поля ---- */
  function R(x,y,t,force){if(!inb(x,y))return;if(!force&&(ter[idx(x,y)]===T.water))return;ter[idx(x,y)]=t;vrn[idx(x,y)]=0;}
  function VRX(x0,x1,y0,y1,t,f){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t,f);}
  function HRY(y0,y1,x0,x1,t,f){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R(x,y,t,f);}
  const cxN=y=>60+152+IB.M.round(8*IB.M.sin((y-OY)*0.043)+4*IB.M.sin((y-OY)*0.011+2));   /* Дніпро: продовження формули міста */
  const dxN=y=>60+332+IB.M.round(6*IB.M.sin((y-OY)*0.02)+3*IB.M.sin((y-OY)*0.007+1));    /* Десна: продовження */
  /* Дніпро на півночі + КИЇВСЬКЕ ВОДОСХОВИЩЕ (широке над греблею) */
  for(let y=OY-1;y>=2;y--){const c=cxN(y);for(let x=c;x<=c+16;x++)R(x,y,T.water,true);}
  for(let y=2;y<=33;y++){const c=cxN(y);for(let x=c-6;x<=c+24;x++)R(x,y,T.water,true);}
  /* Десна тягнеться на північ (за Троєщину) */
  for(let y=OY-1;y>=4;y--){const c=dxN(y);for(let x=c;x<=c+12;x++){if(!inb(x,y))continue;const i=idx(x,y);if(ter[i]!==T.water){ter[i]=T.water;vrn[i]=0;}}}
  /* Дніпро на півдні (за Трипільською горою) */
  for(let y=OY+H0;y<H2-2;y++){const c=cxN(y);for(let x=c;x<=c+16;x++)R(x,y,T.water,true);}
  /* поля на півдні */
  for(let y=600;y<H2-4;y++)for(let x=64;x<=208;x++){if(!inb(x,y))continue;const i=idx(x,y);if(ter[i]===T.grass&&hsh(x,y,901)<0.55)ter[i]=T.field;}
  /* ---- 4. ГРЕБЛЯ ВИШГОРОДСЬКА — дорога через водосховище ---- */
  HRY(34,37,150,304,T.road,true);
  for(let y=33;y<=38;y++)for(let x=196;x<=250;x++){const i=idx(x,y);if(ter[i]===T.road){blk[i]=0;elev[i]=0;}}
  /* ---- 5. ДОРОГИ ОБЛАСТІ ---- */
  /* захід: Оболонь -> МОЩУН -> БУЧА -> Ірпінь */
  HRY(119,122,16,68,T.road);
  VRX(14,15,86,196,T.road); VRX(14,15,199,332,T.road);
  /* північ: Вишгород, гребля, Нові Петрівці */
  HRY(28,29,14,196,T.road);
  VRX(284,287,58,98,T.road); VRX(346,349,58,94,T.road);
  /* схід: Рожни -> БРОВАРИ */
  HRY(206,209,482,516,T.road); HRY(288,290,484,516,T.road);
  /* південь: гора -> Трипілля */
  VRX(120,121,556,606,T.dirt);
  /* ---- 6. СЕЛО МОЩУН (z22) — дерев'яні хати в лісі ---- */
  const NB=[];let propId=wd.props.length;
  function P16(t,x,y,o={}){const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};wd.props.push(p);return p;}
  HRY(196,199,8,56,T.dirt); VRX(29,30,182,238,T.dirt); VRX(44,45,186,230,T.dirt);
  function placeB2(x,y,cat,z){
    const w=({wood1:2,wood2:2,cottage_b:2,panel_b1:3,panel_b2:3,panel_v1:3,vill1:3,vill2:2,dacha1:3,dacha2:3,dacha3:3,bhouse1:2,bhouse2:2,shop2:3,fnmarket:5,garage:1,hist_ruin:2})[cat]||2;
    const d=(({vill1:2,panel_b1:3,panel_b2:3,panel_v1:3,fnmarket:3,shop2:1,garage:1,hist_ruin:1})[cat]||2);
    if(x<4||y<4||x+w>W2-4||y+d>H2-4)return null;
    for(let yy=y;yy<y+d;yy++)for(let xx=x;xx<x+w;xx++){const i=idx(xx,yy);if(blk[i]||ter[i]===T.water||ter[i]===T.road||ter[i]===T.dirt)return null;}
    for(let yy=y;yy<y+d;yy++)for(let xx=x;xx<x+w;xx++){const i=idx(xx,yy);ter[i]=T.concrete;blk[i]=1;}
    const b={cat,x,y,wT:w,dT:d,zone:z,mural:false,var:0};
    if(cat==='fnmarket')b.sign=0;else if(cat==='shop2')b.sign=1;
    wd.blds.push(b);NB.push(b);return b;
  }
  placeB2(10,192,'wood1',22);placeB2(17,192,'wood2',22);placeB2(24,190,'vill2',22);placeB2(33,191,'wood1',22);placeB2(40,191,'wood2',22);
  placeB2(12,202,'vill2',22);placeB2(20,202,'wood1',22);placeB2(36,202,'wood2',22);placeB2(46,194,'wood2',22);
  placeB2(32,212,'wood1',22);placeB2(42,212,'wood2',22);placeB2(16,212,'vill2',22);
  placeB2(10,218,'wood2',22);placeB2(18,218,'wood1',22);placeB2(26,218,'vill2',22);placeB2(34,218,'wood1',22);placeB2(42,218,'wood2',22);
  placeB2(12,224,'vill2',22);placeB2(20,224,'wood1',22);placeB2(28,224,'wood2',22);placeB2(36,224,'vill2',22);placeB2(44,222,'wood1',22);
  /* городи і паркани Мощуна */
  for(let y=222;y<=228;y++)for(let x=34;x<=42;x++){const i=idx(x,y);if(ter[i]===T.grass)ter[i]=T.field;}
  for(let x=10;x<=50;x++){if(hsh(x,200,911)<0.5&&blk[idx(x,200)]===0&&ter[idx(x,200)]!==T.road)P16('fence',x,200,{s:0});}
  P16('barrels',26,206,{s:1,loot:'barrels'});P16('crate',38,206,{s:1,loot:'crate'});
  wd.safes.push({x:34,y:206,n:'ХАТА ЛІСНИКА • МОЩУН',z:'МОЩУН'});P16('cache',34,206,{s:0,meta:'safe'});
  /* ---- 7. СЕЛО БУЧА (z25) — котеджі новобудови ---- */
  HRY(431,433,8,56,T.dirt); VRX(29,30,410,470,T.dirt); VRX(44,45,414,468,T.dirt); HRY(431,433,56,104,T.dirt);
  placeB2(10,427,'cottage_b',25);placeB2(17,427,'vill1',25);placeB2(24,427,'dacha2',25);placeB2(33,427,'cottage_b',25);placeB2(40,427,'wood2',25);placeB2(47,428,'dacha1',25);
  placeB2(10,437,'dacha2',25);placeB2(18,437,'cottage_b',25);placeB2(26,437,'wood2',25);placeB2(34,437,'vill1',25);placeB2(44,438,'cottage_b',25);
  placeB2(30,444,'cottage_b',25);placeB2(38,444,'dacha2',25);
  placeB2(10,444,'vill2',25);placeB2(18,444,'wood2',25);placeB2(46,444,'wood1',25);placeB2(12,450,'cottage_b',25);placeB2(20,450,'vill1',25);
  placeB2(28,450,'wood2',25);placeB2(36,450,'cottage_b',25);placeB2(44,450,'dacha2',25);placeB2(16,456,'wood1',25);placeB2(32,456,'cottage_b',25);
  for(let x=10;x<=54;x++){if(hsh(x,435,912)<0.45&&blk[idx(x,435)]===0&&ter[idx(x,435)]!==T.road)P16('fence',x,435,{s:0});}
  P16('barrels',21,441,{s:1,loot:'barrels'});P16('crate',41,441,{s:1,loot:'crate'});
  wd.safes.push({x:36,y:441,n:'КОТЕДЖ • БУЧА',z:'БУЧА'});P16('cache',36,441,{s:0,meta:'safe'});
  /* ---- 8. ВИШГОРОД (z23) — бежеві панельки над водосховищем ---- */
  placeB2(36,16,'panel_v1',23);placeB2(48,24,'panel_v1',23);placeB2(84,14,'bhouse1',23);placeB2(90,30,'vill2',23);placeB2(102,16,'vill2',23);
  placeB2(130,40,'cottage_b',23);placeB2(112,42,'cottage_b',23);placeB2(40,38,'wood1',23);placeB2(56,44,'wood2',23);placeB2(146,30,'wood2',23);placeB2(74,44,'wood2',23);
  wd.safes.push({x:86,y:40,n:'СХОВАНКА • ВИШГОРОД',z:'ВИШГОРОД'});P16('cache',86,40,{s:0,meta:'safe'});
  /* церква Вишгорода-Петрівців (chapel3) — майданчик під неї */
  (function(){const d3=IB.LM['chapel3'];const x=128,y=22;
    for(let yy=y;yy<y+d3.dT;yy++)for(let xx=x;xx<x+d3.wT;xx++){if(inb(xx,yy)){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=3;}}
    wd.lms.push({key:'chapel3',x,y,wT:d3.wT,dT:d3.dT,zone:23});})();
  /* ---- 9. СЕЛО НОВІ ПЕТРІВЦІ (z24) — хати за Десною ---- */
  HRY(56,57,292,386,T.dirt); VRX(330,331,20,72,T.dirt); VRX(360,361,30,66,T.dirt); HRY(30,31,330,386,T.dirt);
  placeB2(306,50,'vill2',24);placeB2(314,50,'wood2',24);placeB2(322,49,'dacha1',24);placeB2(338,50,'wood2',24);placeB2(348,50,'vill2',24);
  placeB2(352,50,'dacha1',24);placeB2(370,50,'wood2',24);placeB2(378,50,'vill2',24);
  placeB2(306,60,'wood2',24);placeB2(320,60,'dacha1',24);placeB2(334,60,'vill2',24);placeB2(350,60,'wood2',24);placeB2(364,60,'vill2',24);placeB2(374,60,'wood2',24);
  placeB2(304,66,'dacha1',24);placeB2(318,66,'wood1',24);placeB2(330,66,'vill2',24);placeB2(344,66,'wood2',24);placeB2(358,66,'dacha1',24);placeB2(372,66,'vill1',24);
  (function(){const d3=IB.LM['chapel3'];const x=340,y=36;
    for(let yy=y;yy<y+d3.dT;yy++)for(let xx=x;xx<x+d3.wT;xx++){if(inb(xx,yy)){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=3;}}
    wd.lms.push({key:'chapel3',x,y,wT:d3.wT,dT:d3.dT,zone:24});})();
  wd.safes.push({x:352,y:40,n:'ХАТА • НОВІ ПЕТРІВЦІ',z:'НОВІ ПЕТРІВЦІ'});P16('cache',352,40,{s:0,meta:'safe'});
  /* ---- 10. МІСТО БРОВАРИ (z26) — сині й зелені панельки ---- */
  HRY(206,209,500,556,T.road); HRY(238,240,500,556,T.road); VRX(516,519,182,282,T.road); VRX(536,538,192,270,T.road); HRY(270,271,502,556,T.dirt);
  placeB2(508,180,'fnmarket',26);
  placeB2(504,214,'panel_b1',26);placeB2(510,214,'panel_b1',26);placeB2(524,214,'panel_b2',26);placeB2(542,214,'panel_b2',26);
  placeB2(504,226,'panel_b2',26);placeB2(510,226,'panel_b1',26);placeB2(524,226,'panel_b2',26);placeB2(542,226,'panel_b1',26);
  placeB2(514,244,'shop2',26);placeB2(530,244,'garage',26);placeB2(532,244,'garage',26);placeB2(534,244,'garage',26);
  placeB2(504,276,'bhouse1',26);placeB2(512,276,'bhouse2',26);placeB2(520,276,'bhouse1',26);placeB2(528,276,'bhouse2',26);placeB2(536,276,'bhouse1',26);placeB2(544,276,'bhouse2',26);
  /* АЗС Броварів */
  (function(){for(let y=196;y<=201;y++)for(let x=546;x<=552;x++){if(!inb(x,y))continue;const i=idx(x,y);if(!blk[i]&&ter[i]!==T.road)ter[i]=T.concrete;}
    wd.gas.push({x:549.5,y:199,n:'АЗС • БРОВАРИ'});P16('lamp_b',547,202,{s:1});P16('barrels',551,202,{s:1,loot:'barrels'});})();
  wd.safes.push({x:520,y:246,n:'ПІДВАЛ БРОВАРІВ',z:'БРОВАРИ'});P16('cache',520,246,{s:0,meta:'safe'});
  /* ---- 11. СЕЛО ТРИПІЛЛЯ (z27) — старі хати над Дніпром ---- */
  HRY(628,629,92,168,T.dirt); VRX(120,121,606,650,T.dirt); VRX(146,147,612,644,T.dirt); HRY(612,613,96,166,T.dirt);
  placeB2(94,624,'vill2',27);placeB2(102,624,'wood1',27);placeB2(110,624,'dacha3',27);placeB2(118,624,'vill2',27);placeB2(126,624,'wood1',27);placeB2(134,624,'wood2',27);
  placeB2(98,632,'wood2',27);placeB2(108,632,'vill2',27);placeB2(118,632,'wood1',27);placeB2(128,632,'dacha3',27);placeB2(138,632,'wood2',27);placeB2(148,632,'vill2',27);
  placeB2(100,640,'vill2',27);placeB2(112,640,'wood1',27);placeB2(124,640,'wood2',27);placeB2(136,640,'vill2',27);placeB2(148,640,'wood1',27);placeB2(96,618,'wood2',27);placeB2(146,618,'vill2',27);
  wd.safes.push({x:124,y:618,n:'ХАТА • ТРИПІЛЛЯ',z:'ТРИПІЛЛЯ'});P16('cache',124,618,{s:0,meta:'safe'});
  P16('barrels',140,622,{s:1,loot:'barrels'});
  /* ---- 12. ЛІСИ ПОЛЯ: Мощунський, Бучанський, петрівці, схід ---- */
  function forest(x0,y0,x1,y1,dens,sn){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(!inb(x,y)||isContent(x,y))continue;
      const i=idx(x,y);
      if(ter[i]!==T.grass||blk[i])continue;
      const r=hsh(x,y,sn);
      if(r>=dens)continue;
      if(r<dens*0.42)P16('pine',x,y,{s:0});
      else if(r<dens*0.62)P16('tree_s',x,y,{s:0});
      else if(r<dens*0.78)P16('tree_big',x,y,{s:0});
      else if(r<dens*0.9)P16('tree_o2',x,y,{s:0});
      else P16('bush',x,y,{s:0});
    }
  }
  forest(2,84,58,318,0.36,921);            /* Мощунський ліс */
  forest(2,334,58,398,0.30,922);           /* ліс між Мощуном і Бучею */
  forest(2,446,58,556,0.32,923);           /* Бучанський ліс на південь */
  forest(2,556,58,598,0.20,929);           /* ліс до південного поля */
  forest(406,4,470,78,0.34,924);           /* ліс за Десною (схід) */
  forest(280,4,300,30,0.20,925);
  forest(500,300,556,556,0.3,926);        /* ліс південніше Броварів */
  forest(64,600,90,656,0.16,927);          /* ліс перед Трипіллям (захід) */
  forest(184,600,206,654,0.18,928);
  /* радіовишки нових районів */
  function addTow(x,y,n){
    const d=IB.LM['radio_tower'];
    for(let yy=y;yy<y+d.dT;yy++)for(let xx=x;xx<x+d.wT;xx++){if(inb(xx,yy)){ter[idx(xx,yy)]=T.concrete;blk[idx(xx,yy)]=3;}}
    wd.lms.push({key:'radio_tower',x,y,wT:d.wT,dT:d.dT,zone:zone[idx(x,y)]});
    wd.towers.push({x:x+d.wT/2,y:y+d.dT/2,n:n});
  }
  addTow(20,146,'ВИШКА МОЩУНСЬКОГО ЛІСУ');addTow(142,52,'ВИШКА ВИШГОРОДА');
  addTow(298,20,'ВИШКА ПЕТРІВЦЬКА');addTow(548,178,'ВИШКА БРОВАРІВ');addTow(166,604,'ВИШКА ТРИПІЛЛЯ');
  wd.bridges.push([35,'ГРЕБЛЯ ВИШГОРОДСЬКА',228]);
  /* POI сіл області для мінікарти і навігатора */
  wd.villages.push({x:30,y:206,n:'СЕЛО МОЩУН'},{x:30,y:441,n:'СЕЛО БУЧА'},{x:86,y:40,n:'ВИШГОРОД'},{x:352,y:40,n:'НОВІ ПЕТРІВЦІ'},{x:525,y:225,n:'БРОВАРИ'},{x:124,y:618,n:'СЕЛО ТРИПІЛЛЯ'});
  /* ---- 13. авто нових районів ---- */
  function C16(mdl,x,y,dir,dr,f,hp){const vr=hsh(x*7+y,3,715)<0.42?(hsh(x,y,716)<0.5?'a':'b'):null;wd.cars.push({mdl,var:vr,x:x+0.5,y:y+0.5,dir,drivable:dr,fuel:f,hp:hp,broken:!dr,looted:false});}
  C16('vaz',30,120,0,true,30,75);C16('skoda',44,121,1,true,25,70);C16('lanos',50,120,0,false,0,0);
  C16('suv',70,28,0,true,40,90);C16('vaz',110,29,1,true,30,70);C16('vaz',222,35,0,true,25,60);
  C16('skoda',300,56,0,true,30,75);C16('vaz',354,57,0,true,20,60);
  C16('lanos',508,207,0,true,30,75);C16('vaz',524,208,1,true,25,70);C16('skoda',540,207,0,true,30,80);
  C16('suv',517,246,1,true,35,85);C16('lanos',537,239,2,false,0,0);
  C16('vaz',22,432,0,true,20,60);C16('skoda',36,433,1,true,25,65);
  C16('vaz',110,630,0,false,0,0);C16('skoda',140,629,0,true,15,55);
  /* ---- 14. двері нових будівель + дворики ---- */
  for(const b of NB){
    if(b.cat==='garage'||b.cat==='hist_ruin')continue;
    const dx=b.x+((b.wT/2)|0),dy=b.y+b.dT;
    if(!inb(dx,dy))continue;
    const i=idx(dx,dy);
    if(blk[i]||ter[i]===T.road||ter[i]===T.water)continue;
    const dp=P16('doorp',dx,dy,{s:0,meta:'enter'});
    dp.bld=wd.blds.indexOf(b);
    b.door={x:dx,y:dy};b.floors=IB.BLD_FLOORS(b);
    for(let xx=dx-1;xx<=dx+1;xx++)for(let yy=dy;yy<=dy+1;yy++){
      if(!inb(xx,yy))continue;const ii=idx(xx,yy);
      if(blk[ii]===0&&(ter[ii]===T.grass||ter[ii]===T.dirt||ter[ii]===T.sidewalk))ter[ii]=T.pave;
    }
    if(inb(dx,dy+1)&&blk[idx(dx,dy+1)]===0)P16('doormat',dx,dy+1,{s:0});
  }
  /* ---- 15. колізії пропсів, чисті зони ---- */
  for(const p of wd.props){const tx=p.x|0,ty=p.y|0;if(p.s&&inb(tx,ty)){const i=idx(tx,ty);if(blk[i]===0&&(ter[i]===T.grass||ter[i]===T.field||ter[i]===T.dirt||ter[i]===T.sidewalk))blk[i]=1;}}
  function clear16(cx,cy,r){
    for(let yy=IB.M.max(2,IB.M.floor(cy-r));yy<=IB.M.min(H2-2,IB.M.ceil(cy+r));yy++)
    for(let xx=IB.M.max(2,IB.M.floor(cx-r));xx<=IB.M.min(W2-2,IB.M.ceil(cx+r));xx++){
      const i=idx(xx,yy);if(blk[i]===4||ter[i]===T.water)continue;if(blk[i])blk[i]=0;
    }
  }
  for(const s of wd.safes){if(!isContent(s.x|0,s.y|0))clear16(s.x+0.5,s.y+0.5,2.2);}
  /* ---- 16. тротуари і пляжі полів ---- */
  for(let y=2;y<H2-2;y++)for(let x=2;x<W2-2;x++){
    if(isContent(x,y))continue;
    const i=idx(x,y),t=ter[i];
    if(t!==T.grass&&t!==T.field)continue;
    if(blk[i])continue;
    let near=false;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.road)near=true;
    if(near&&hsh(x,y,77)<0.92)ter[i]=T.sidewalk;
  }
  for(let y=2;y<H2-2;y++)for(let x=2;x<W2-2;x++){
    if(isContent(x,y))continue;
    if(ter[idx(x,y)]!==T.grass)continue;
    for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){if(inb(x+dx,y+dy)&&ter[idx(x+dx,y+dy)]===T.water){if(hsh(x,y,55)<0.5)ter[idx(x,y)]=T.sand;break;}}
  }
  /* ---- 17. зони полів ---- */
  function zoneAt2(x,y){
    if(ter[idx(x,y)]===T.water)return (x>=380&&y<80)?16:12;
    if(y<80){
      if(y>=33&&y<=38&&x>=150&&x<=300)return 23;
      if(x<170)return 23;
      if(x<280)return 12;
      return 24;
    }
    if(x<60)return y<330?22:(y<560?25:13);
    if(x>=500)return y<300?26:13;
    if(y>=600)return (x>=80&&x<180)?27:13;
    return zone[idx(x,y)];
  }
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(!isContent(x,y))zone[idx(x,y)]=zoneAt2(x,y);}
  /* ---- 18. новий кордон карти ---- */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(x<2||y<2||x>=W2-2||y>=H2-2)blk[idx(x,y)]=4;}
  /* ---- 19. road mask (свіжий на всю мапу) ---- */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    if(ter[idx(x,y)]!==T.road)continue;
    let m=0;const isr=(x,y)=>inb(x,y)&&(ter[idx(x,y)]===T.road);
    if(isr(x,y-1))m|=1;if(isr(x+1,y))m|=2;if(isr(x,y+1))m|=4;if(isr(x-1,y))m|=8;
    rdm[idx(x,y)]=m;
  }
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    const i=idx(x,y);if(rdm[i]!==15)continue;
    const n15=(dx,dy)=>inb(x+dx,y+dy)&&rdm[idx(x+dx,y+dy)]===15;
    if(n15(0,-1)||n15(0,1)||n15(-1,0)||n15(1,0))rdm[i]=16;
  }
  /* ---- 20. мінімапа заново (більший розмір) ---- */
  const mm=IB.mk(W2,H2),mg=mm.g;
  const MC={[T.grass]:'#1c3a1e',[T.park]:'#225028',[T.field]:'#3e4422',[T.sidewalk]:'#3a3f4a',[T.pave]:'#40444e',[T.cobble]:'#3a3830',
    [T.concrete]:'#2e3138',[T.plaza]:'#4e2a20',[T.rubble]:'#2e3138',[T.dirt]:'#3a3228',[T.sand]:'#565638',[T.rail]:'#40404a',[T.water]:'#1c3860',[T.road]:'#4c4c55',[T.rock]:'#43474f'};
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){mg.fillStyle=MC[ter[idx(x,y)]]||'#1c3a1e';mg.fillRect(x,y,1,1);}
  for(const b of wd.blds){mg.fillStyle='#5a606c';mg.fillRect(b.x,b.y,b.wT,b.dT);}
  for(const l of wd.lms){mg.fillStyle='#f0d050';mg.fillRect(l.x,l.y,l.wT,l.dT);}
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(elev[idx(x,y)]>=2){mg.fillStyle='#ffffff10';mg.fillRect(x,y,1,1);}}
  /* ---- 21. перебіндінг замикань світу ---- */
  wd.W=W2;wd.H=H2;wd.ter=ter;wd.vrn=vrn;wd.rdm=rdm;wd.elev=elev;wd.zone=zone;wd.blk=blk;wd.brg=brg;wd.mm=mm;
  wd.ridx=idx;wd.inb=inb;
  wd.clearArea=(cx,cy,r)=>{for(let yy=IB.M.max(1,IB.M.floor(cy-r));yy<=IB.M.min(H2-2,IB.M.ceil(cy+r));yy++)for(let xx=IB.M.max(1,IB.M.floor(cx-r));xx<=IB.M.min(W2-2,IB.M.ceil(cx+r));xx++){const i=idx(xx,yy);if(ter[i]===T.water)continue;if(blk[i]===4)continue;if(blk[i])blk[i]=0;}};
  wd.freeSpot=(x,y,maxR=6)=>{x|=0;y|=0;if(!inb(x,y))return{x:IB.M.max(3,IB.M.min(W2-4,x)),y:IB.M.max(3,IB.M.min(H2-4,y))};if(!blk[idx(x,y)]&&ter[idx(x,y)]!==T.water)return{x:x+0.5,y:y+0.5};for(let r=1;r<=maxR;r++){let best=null,bd=1e9;for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){if(!inb(xx,yy)||blk[idx(xx,yy)]||ter[idx(xx,yy)]===T.water)continue;const d=(xx-x)*(xx-x)+(yy-y)*(yy-y);if(d<bd){bd=d;best={x:xx+0.5,y:yy+0.5};}}if(best)return best;}return null;};
  wd.zoneAt=(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0;
  wd.elevAt=(x,y)=>inb(x|0,y|0)?elev[idx(x|0,y|0)]:0;
  wd.solid=(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;};
};

/* ================================================================
   МЕТРО — ПІДЗЕМНА КАРТА (батч 10): ДРУГА МАПА МІСТА.
   Ті ж координати, що й на поверхні: спустився на Оболоні (35,37) —
   і йдеш тунелями до Печерська (139,171). Тунелі-лабіринти, платформи,
   колії, сходи, ліхтарі, заражені в темряві. Повітряні атаки в метро
   НЕ ДІЮТЬ — це укриття №1 від шахедів.
   ================================================================ */
IB.MSTATIONS=[
  {x:35, y:37, n:'ОБОЛОНЬ'},
  {x:92, y:97, n:'КОНТРАКТОВА ПЛОЩА'},
  {x:119,y:153,n:'ХРЕЩАТИК'},
  {x:136,y:154,n:'МАЙДАН НЕЗАЛЕЖНОСТІ'},
  {x:139,y:171,n:'ПЕЧЕРСЬКА'},
  {x:196,y:102,n:'ЛІВОБЕРЕЖНА'},
  {x:196,y:183,n:'ДАРНИЦЯ'},
  {x:66, y:199,n:'ВОКАЗАЛЬНА'},
  {x:196,y:30, n:'ТРОЄЩИНА'},        /* батч 14 */
];
/* лінії тунелів (порядок станцій = маршрут) */
IB.MLINES=[
  [0,1,2,3,4],        /* Оболонь → Контрактова → Хрещатик → Майдан → Печерська */
  [1,7],              /* Контрактова → Вокзальна */
  [2,5,6],            /* Хрещатик → Лівобережна → Дарниця (під Дніпром) */
  [4,6],              /* Печерська → Дарниця (службовий, лабіринт) */
  [5,8],              /* Лівобережна → Троєщина (батч 14) */
];
IB.ZONES_M=[{k:'MET',n:'МЕТРО • ТУНЕЛІ',d:2}];
for(const st of IB.MSTATIONS)IB.ZONES_M.push({k:'M'+st.n,n:'МЕТРО • '+st.n,d:1});

/* ---- БАТЧ 13: поверхи будівель (2-4 за категорією) + спеціальні кімнати метро ---- */
IB.BLD_FLOORS=function(b){
  const F={panel9:4,panel9b:4,panel9_dmg:3,admin4:4,admin3:3,factory:2,factory2:2,
    khrus:2,khrus2:2,khrus_dmg:2,hist2:2,hist2b:2,hist2c:2,hist3:3,shop1:2,shop2:2,
    dacha1:2,dacha2:2,dacha3:2,
    panel_c1:4,panel_c2:4,panel_c3:5,tower_g:5,fnmarket:2,vill1:2,vill2:2,
    retroA:2,retroB:2,retroC:3,retroD:2,retroE:1,towerb1:5,towerb2:6,bhouse1:2,bhouse2:2,
    wood1:1,wood2:1,cottage_b:2,panel_b1:4,panel_b2:4,panel_v1:4};
  return F[b.cat]||2;
};
IB.MROOMS=[];
IB.buildMetro=function(){
  const W=440,H=520;   /* та ж сітка, що і місто (батч 16: розширюється до 560x660 разом із поверхнею) */
  const T=IB.TER;
  const ter=new Uint8Array(W*H),vrn=new Uint8Array(W*H),rdm=new Uint8Array(W*H),
        elev=new Uint8Array(W*H), zone=new Uint8Array(W*H), blk=new Uint8Array(W*H),
        brg=new Uint8Array(W*H);
  const idx=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const hsh=IB.hsh, ri=IB.ri;
  /* все — скеля, все solid */
  ter.fill(T.rock);
  vrn.fill(0);
  blk.fill(1);
  const props=[];let propId=0;
  function prop(t,x,y,o={}){
    const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};
    props.push(p);return p;
  }
  function carve(x,y,tt){       /* вирубати тайл: підлога тунелю/платформа/колія */
    if(!inb(x,y))return;
    const i=idx(x,y);
    ter[i]=tt;blk[i]=0;vrn[i]=0;elev[i]=0;
  }
  /* горизонтальна ділянка тунелю: 3 у перетині (підлога-колія-підлога) */
  function segH(x0,x1,y){
    const st=x0<=x1?1:-1;const pts=[];
    for(let x=x0;x!==x1+st;x+=st){
      carve(x,y-1,T.tunnel);carve(x,y,T.track);carve(x,y+1,T.tunnel);
      pts.push([x,y]);
    }
    return pts;
  }
  function segV(y0,y1,x){
    const st=y0<=y1?1:-1;const pts=[];
    for(let y=y0;y!==y1+st;y+=st){
      carve(x-1,y,T.tunnel);carve(x,y,T.track);carve(x+1,y,T.tunnel);
      pts.push([x,y]);
    }
    return pts;
  }
  const lampPts=[];
  /* маршрут між двома точками з меандром (лабіринтність) */
  function tunnel(a,b,seed){
    const mx=IB.M.round((a[0]+b[0])/2+hsh(seed,1,10)*10-5);
    const my=IB.M.round((a[1]+b[1])/2+hsh(seed,2,11)*10-5);
    const p1=segH(a[0],mx,a[1]);lampPts.push(...p1.filter((_,i)=>i%5===2));
    const p2=segV(a[1],my,mx);lampPts.push(...p2.filter((_,i)=>i%5===2));
    const p3=segH(mx,b[0],my);lampPts.push(...p3.filter((_,i)=>i%5===2));
    const p4=segV(my,b[1],b[0]);lampPts.push(...p4.filter((_,i)=>i%5===2));
  }
  /* ---- СТАНЦІЇ: зал з платформою, колією, сходами нагору, знаком М ---- */
  const stations=[];
  for(let si=0;si<IB.MSTATIONS.length;si++){
    const s=IB.MSTATIONS[si],x=s.x,y=s.y;
    /* зал: платформа 9x5 */
    for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-4;xx<=x+4;xx++)carve(xx,yy,T.plat);
    /* колія вздовж південного краю залу + вихід колії за межі */
    for(let xx=x-7;xx<=x+7;xx++)carve(xx,y+3,T.track);
    /* тупики колії закриті: тайли за краями залу лишаються скелею виходячи з колії не вийти */
    /* сходи нагору (північ центр) */
    carve(x,y-2,T.plat);
    prop('stairs',x,y-2,{s:0,meta:'up'});
    blk[idx(x,y-2)]=0;
    /* знак М + стрілка */
    prop('metro_m2',x-2,y,{s:0});
    /* лавки, лут-полиці, бочки, вогняні бочки-печки */
    prop('bench',x+3,y-1,{s:1});
    if(hsh(x,y,101)<0.8)prop('shelf',x+3,y+1,{s:1,loot:'metro'});
    if(hsh(x,y,102)<0.6)prop('shelf',x-3,y+1,{s:1,loot:'metro'});
    if(hsh(x,y,103)<0.5)prop('barrels',x-4,y+2,{s:1,loot:'barrels'});
    /* лампа під стелею в центрі залу */
    lampPts.push([x,y]);
    /* ---- БАТЧ 15: АРКАДНІ АВТОМАТИ на станціях (mini-arcade) ---- */
    if(hsh(x,y,134)<0.72)prop('arcade_vend',x-3,y-1,{s:1});
    if(hsh(x,y,135)<0.55)prop('arcade1',x+2,y-2,{s:1});
    if(hsh(x,y,136)<0.4)prop('arcade_pin',x-1,y+1,{s:1});
    if(hsh(x,y,137)<0.3)prop('arcade_dance',x+4,y-2,{s:1});
    if(hsh(x,y,138)<0.35)prop('arcade_claw',x-4,y-1,{s:1});
    if(hsh(x,y,139)<0.4)prop('arcade_cash',x+3,y-2,{s:1});
    /* ---- БАТЧ 13: ВАГОНИ (train-kit subway) — припарковані на колії ---- */
    const wn = 1 + ((hsh(x,y,131)*3)|0);
    for(let wi=0;wi<wn;wi++){
      const wx2 = x + 1 + wi*5;
      if(wx2+2<W-4 && inb(wx2,y+3)){
        const kind = wi===0 ? 'wagon_a' : ((hsh(x,wi,132)<0.5?'wagon_b':'wagon_c'));
        prop(kind,wx2,y+3,{s:1});
      }
    }
    stations.push({x,y,n:s.n});
  }
  /* ---- ТУНЕЛІ між станціями (лінії метро) ---- */
  for(let li=0;li<IB.MLINES.length;li++){
    const line=IB.MLINES[li];
    for(let k=0;k<line.length-1;k++){
      const a=IB.MSTATIONS[line[k]],b=IB.MSTATIONS[line[k+1]];
      tunnel([a.x,a.y+3],[b.x,b.y+3],li*17+k*7+3);
    }
  }
  /* ---- ЛАБІРИНТНИ ВІДГАЛУДКИ — БАТЧ 15: 30 гілок; кожна 3-я = СЕРВЕРНА / МАЙСТЕРНЯ / КОТЕЛЬНЯ /
     НАСОСНА / ЦЕХ (factory-kit), інші — заповнені комірки з лутом і барикадами ---- */
  for(let bi=0;bi<30;bi++){
    const base=lampPts[(hsh(bi,4,77)*lampPts.length)|0];
    if(!base)continue;
    let cx=base[0],cy=base[1];
    const len=4+((hsh(bi,5,78)*5)|0);
    for(let st=0;st<len;st++){
      const dir=(hsh(bi,st,79)*4)|0;
      if(dir===0){const p=segH(cx,cx+3,cy);cx+=3;lampPts.push(p[2]);}
      else if(dir===1){const p=segH(cx,cx-3,cy);cx-=3;lampPts.push(p[2]);}
      else if(dir===2){const p=segV(cy,cy+3,cx);cy+=3;lampPts.push(p[2]);}
      else {const p=segV(cy,cy-3,cx);cy-=3;lampPts.push(p[2]);}
    }
    if(bi%3===2){
      const rt=hsh(bi,9,133);            /* тип кімнати (батч 15) */
      const srv=rt<0.28, wrk=rt>=0.28&&rt<0.5, boil=rt>=0.5&&rt<0.66, pump=rt>=0.66&&rt<0.82;
      for(let yy=cy-2;yy<=cy+2;yy++)for(let xx=cx-3;xx<=cx+3;xx++)carve(xx,yy,T.plat);
      if(srv){
        prop('rack',cx-2,cy-1,{s:1});prop('rack',cx-1,cy-1,{s:1});prop('rack',cx,cy-1,{s:1});
        prop('shelf',cx+2,cy,{s:1,loot:'metro'});
        prop('corpse',cx-2,cy+1,{s:0});
      } else if(wrk){
        prop('bench_w',cx,cy-1,{s:1,meta:'craft'});
        prop('barrels',cx-2,cy+1,{s:1,loot:'barrels'});
        prop('shelf',cx+2,cy,{s:1,loot:'metro'});
      } else if(boil){
        /* КОТЕЛЬНЯ: казани + труби + вентилі (factory-kit) */
        prop('fboiler',cx-2,cy-1,{s:1});prop('fboiler',cx,cy-1,{s:1});
        prop('fpipe_valve',cx+2,cy-1,{s:1});prop('fpipe_bend',cx-2,cy+1,{s:1});
        prop('barrels',cx+2,cy+1,{s:1,loot:'barrels'});
        prop('shelf',cx,cy+1,{s:1,loot:'metro'});
      } else if(pump){
        /* НАСОСНА: поршні, скляні колени, крани */
        prop('fpiston',cx-2,cy-1,{s:1});prop('fpiston',cx-1,cy-1,{s:1});
        prop('fpipe_glass',cx+1,cy,{s:1});prop('fpipe_valve',cx-2,cy+1,{s:1});
        prop('fbox',cx+2,cy+1,{s:1});
      } else {
        /* ЦЕХ: верстати, конвеєр, роборука (factory-kit) */
        prop('fmachine',cx-2,cy-1,{s:1});prop('fmachine2',cx,cy-1,{s:1});
        prop('fconveyor',cx+1,cy+1,{s:1});prop('frobot',cx-2,cy+1,{s:1});
        prop('fbox',cx+2,cy,{s:1});prop('fscreen',cx,cy+1,{s:1});
      }
      prop('lamp_m',cx,cy,{s:0});
      lampPts.push([cx,cy]);
      const rn=srv?'СЕРВЕРНА':wrk?'МАЙСТЕРНЯ':boil?'КОТЕЛЬНЯ':pump?'НАСОСНА':'ЦЕХ';
      const ri2=srv?'C':wrk?'V':boil?'K':pump?'N':'Z';
      IB.MROOMS.push({x:cx,y:cy,srv,n:rn,ty:srv?'srv':wrk?'wrk':boil?'boil':pump?'pump':'hall',letter:ri2});
    } else {
      for(let yy=cy-1;yy<=cy+1;yy++)for(let xx=cx-1;xx<=cx+1;xx++)carve(xx,yy,T.tunnel);
      prop('shelf',cx,cy,{s:1,loot:'metro'});
      if(hsh(cx,cy,80)<0.5)prop('barrels',cx+1,cy+1,{s:1,loot:'barrels'});
      if(hsh(cx,cy,81)<0.35)prop('corpse',cx-1,cy,{s:0});
      if(hsh(cx,cy,82)<0.3)prop('fbox',cx+1,cy-1,{s:1});
      if(hsh(cx,cy,83)<0.25)prop('barric_win',cx-1,cy-1,{s:1});
    }
  }
  /* ---- БАТЧ 15: ЗАПОВНЕННЯ ТУНЕЛІВ — барикади, труби вздовж стін, уламки, схрони ---- */
  for(const[px,py]of lampPts){
    const r=hsh(px,py,741);
    if(!inb(px,py)||blk[idx(px,py)])continue;
    if(r<0.05)prop('barric_win',px,py,{s:1});
    else if(r<0.09)prop('barric_door',px,py,{s:1});
    else if(r<0.13)prop('fpipe_h',px,py,{s:0});
    else if(r<0.16)prop('fpipe_bend',px,py,{s:0});
    else if(r<0.19)prop('wreck2',px,py,{s:1});
    else if(r<0.22)prop('sandbag',px,py,{s:1});
    else if(r<0.25)prop('fdoor',px,py,{s:1});
    else if(r<0.28)prop('bpipe',px,py,{s:0});
    else if(r<0.30)prop('fbox',px,py,{s:1});
  }
  /* труби та кабелі уздовж стін тунелів — раз на ~6 тайлів */
  for(let i=0;i<lampPts.length;i+=6){
    const[px,py]=lampPts[i];
    if(!inb(px,py)||blk[idx(px,py)])continue;
    if(hsh(px,py,743)<0.5)prop(hsh(px,py,744)<0.5?'fpipe_h':'fpipe_glass',px,py-1,{s:0});
  }
  /* ---- ЛАМПИ вдоль тунелів (ближче до стін) ---- */
  for(const[px,py]of lampPts){
    if(!inb(px,py)||blk[idx(px,py)])continue;
    if(hsh(px,py,90)<0.62)prop('lamp_m',px,py,{s:0});
  }
  /* розкидуні ящики по тунелях */
  for(let i=0;i<30;i++){
    const p=lampPts[(hsh(i,9,88)*lampPts.length)|0];
    if(!p)continue;
    if(inb(p[0],p[1])&&!blk[idx(p[0],p[1])])prop(hsh(i,7,89)<0.3?'fbox':'crate',p[0],p[1],{s:1,loot:'crate'});
  }
  /* ---- блокування від пропсів (лавки/полиці/бочки — колізія) ---- */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  /* ---- зони ---- */
  function zoneAt(x,y){
    for(let si=0;si<stations.length;si++){
      const s=stations[si];
      if(IB.dist(x,y,s.x,s.y)<6)return si+1;
    }
    return 0;
  }
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++)zone[idx(xx,yy)]=zoneAt(xx,yy);
  /* ---- кордон карти ---- */
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){if(xx<2||yy<2||xx>=W-2||yy>=H-2)blk[idx(xx,yy)]=4;}
  /* ---- чисті зони у залах (спавн без замуровування) ---- */
  function clearArea(cx,cy,r){
    for(let yy=IB.M.max(1,IB.M.floor(cy-r));yy<=IB.M.min(H-2,IB.M.ceil(cy+r));yy++)
    for(let xx=IB.M.max(1,IB.M.floor(cx-r));xx<=IB.M.min(W-2,IB.M.ceil(cx+r));xx++){
      const i=idx(xx,yy);
      if(blk[i]===4)continue;
      if(blk[i])blk[i]=0;
    }
  }
  for(const st of stations){clearArea(st.x+0.5,st.y+0.5,3.4);}
  /* ---- мінімапа підземки (темні тунелі) ---- */
  const mm=IB.mk(W,H);const g=mm.g;
  const MC={[T.rock]:'#101218',[T.tunnel]:'#33363e',[T.track]:'#26282e',[T.plat]:'#3e4a58'};
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){g.fillStyle=MC[ter[idx(xx,yy)]]||'#101218';g.fillRect(xx,yy,1,1);}
  for(const st of stations){g.fillStyle='#cc4438';g.fillRect(st.x-1,st.y-1,3,3);}
  const world={W,H,ter,vrn,rdm,elev,zone,blk,brg,blds:[],lms:[],props,cars:[],stations,passages:[],safes:[],npcs:[],towers:[],mm,
    base:null,bridges:[],ridx:idx,inb,clearArea,
    metro:true,
    freeSpot:(x,y,maxR=6)=>{
      x|=0;y|=0;
      if(!inb(x,y))return {x:IB.M.max(3,IB.M.min(W-4,x)),y:IB.M.max(3,IB.M.min(H-4,y))};
      if(!blk[idx(x,y)])return {x:x+0.5,y:y+0.5};
      for(let r=1;r<=maxR;r++){
        let best=null,bd=1e9;
        for(let yy2=y-r;yy2<=y+r;yy2++)for(let xx2=x-r;xx2<=x+r;xx2++){
          if(!inb(xx2,yy2)||blk[idx(xx2,yy2)])continue;
          const d=(xx2-x)*(xx2-x)+(yy2-y)*(yy2-y);
          if(d<bd){bd=d;best={x:xx2+0.5,y:yy2+0.5};}
        }
        if(best)return best;
      }
      return null;
    },
    zoneAt:(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0,
    zoneName:z=>IB.ZONES_M[z]?IB.ZONES_M[z].n:'МЕТРО',
    danger:z=>IB.ZONES_M[z]?IB.ZONES_M[z].d:2,
    elevAt:(x,y)=>0,
    solid:(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;},
  };
  IB._expandMetro(world);   /* БАТЧ 16: підземка — ті ж поля, що й на поверхні */
  IB._expandMetro3(world);  /* БАТЧ 17: тунелі західної і південної гілок */
  IB.MWORLD=world;
  return world;
};

/* БАТЧ 16: метро зсувається разом із поверхнею (+60,+80), щоб виходи збігалися.
   Поля навколо старої сітки тунелів заливаються скелею — тунелі там не будувались. */
IB._expandMetro=function(wd){
  const T=IB.TER;
  const W0=wd.W,H0=wd.H,OX=60,OY=80;
  const W2=W0+OX+60,H2=H0+OY+60;
  const grow=src=>{const d=new Uint8Array(W2*H2);for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)d[(y+OY)*W2+(x+OX)]=src[y*W0+x];return d;};
  const ter=grow(wd.ter),vrn=grow(wd.vrn),elev=grow(wd.elev),zone=grow(wd.zone),blk=grow(wd.blk),brg=grow(wd.brg);
  const rdm=new Uint8Array(W2*H2);
  const idx=(x,y)=>y*W2+x,inb=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2;
  const isContent=(x,y)=>x>=OX&&x<OX+W0&&y>=OY&&y<OY+H0;
  const sh=o=>{if(o&&o.x!==undefined){o.x+=OX;o.y+=OY;}};
  for(const s of wd.stations)sh(s);
  for(const p of wd.props)sh(p);
  for(const p of wd.passages||[])sh(p);
  for(const r of IB.MROOMS||[])sh(r);
  /* старі кордони: стіни 4 -> скеля/тунель */
  for(let y=OY;y<OY+H0;y++)for(const xx of[OX,OX+1,OX+W0-2,OX+W0-1]){const i=idx(xx,y);if(blk[i]===4)blk[i]=(ter[i]===T.rock)?1:0;}
  for(let x=OX;x<OX+W0;x++)for(const yy of[OY,OY+1,OY+H0-2,OY+H0-1]){const i=idx(x,yy);if(blk[i]===4)blk[i]=(ter[i]===T.rock)?1:0;}
  /* поля: скеля */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    if(isContent(x,y))continue;
    const i=idx(x,y);
    if(ter[i]!==T.rock){ter[i]=T.rock;vrn[i]=0;}
    if(blk[i]===0)blk[i]=1;
  }
  /* новий кордон */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(x<2||y<2||x>=W2-2||y>=H2-2)blk[idx(x,y)]=4;}
  /* мінімапа підземки */
  const mm=IB.mk(W2,H2),mg=mm.g;
  const MC={[T.rock]:'#101218',[T.tunnel]:'#33363e',[T.track]:'#26282e',[T.plat]:'#3e4a58'};
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){mg.fillStyle=MC[ter[idx(x,y)]]||'#101218';mg.fillRect(x,y,1,1);}
  for(const st of wd.stations){mg.fillStyle='#cc4438';mg.fillRect(st.x-1,st.y-1,3,3);}
  wd.W=W2;wd.H=H2;wd.ter=ter;wd.vrn=vrn;wd.rdm=rdm;wd.elev=elev;wd.zone=zone;wd.blk=blk;wd.brg=brg;wd.mm=mm;
  wd.ridx=idx;wd.inb=inb;
  wd.clearArea=(cx,cy,r)=>{for(let yy=IB.M.max(1,IB.M.floor(cy-r));yy<=IB.M.min(H2-2,IB.M.ceil(cy+r));yy++)for(let xx=IB.M.max(1,IB.M.floor(cx-r));xx<=IB.M.min(W2-2,IB.M.ceil(cx+r));xx++){const i=idx(xx,yy);if(blk[i]===4)continue;if(blk[i])blk[i]=0;}};
  wd.freeSpot=(x,y,maxR=6)=>{x|=0;y|=0;if(!inb(x,y))return{x:IB.M.max(3,IB.M.min(W2-4,x)),y:IB.M.max(3,IB.M.min(H2-4,y))};if(!blk[idx(x,y)])return{x:x+0.5,y:y+0.5};for(let r=1;r<=maxR;r++){let best=null,bd=1e9;for(let yy2=y-r;yy2<=y+r;yy2++)for(let xx2=x-r;xx2<=x+r;xx2++){if(!inb(xx2,yy2)||blk[idx(xx2,yy2)])continue;const d=(xx2-x)*(xx2-x)+(yy2-y)*(yy2-y);if(d<bd){bd=d;best={x:xx2+0.5,y:yy2+0.5};}}if(best)return best;}return null;};
  wd.zoneAt=(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0;
  wd.solid=(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;};
};

/* ================= БАТЧ 13: ІНТЕР'ЄРИ БУДИНКІВ =================
   Кожна будівля має 2-4 поверхи (IB.BLD_FLOORS). Інтер'єр генерується при вході,
   сідується від id будівлі + поверху (детерміновано). Зомбі всередині: зачистив
   поверх/будівлю → будівля «ЗВІЛЬНЕНА» (позначка на карті, можна сховатись/відпочити).
   Через 30-40 хв реального часу зомбі захоплюють будівлю назад (динаміка). */
IB.INTERIORS={};          /* кеш: bldIdx_floor -> world */
IB.bldState=function(bi){  /* стан будівлі: {cleared: 0/1, t: коли зачищено, floor: останній} */
  const G=IB.G;
  G.blds=G.blds||{};
  return G.blds[bi]||(G.blds[bi]={cleared:0,t:0});
};

IB.buildInterior=function(bi,floor){
  const key=bi+'_'+floor;
  if(IB.INTERIORS[key])return IB.INTERIORS[key];
  const b=IB.CWORLD.blds[bi];
  const T=IB.TER;
  /* ---- БАТЧ 15: ІНТЕР'ЄРИ V2 — БІЛЬШІ ПЛАНИ, ОКРЕМІ КІМНАТИ (спальні з двома ліжками,
     кухні, ванні, вітальні, довгі коридори у довгих будинках, аркадні кімнати, цехи з трубами) ---- */
  const W=(b.wT*4+7)|0, H=(b.dT*4+7)|0;
  const ter=new Uint8Array(W*H),vrn=new Uint8Array(W*H),rdm=new Uint8Array(W*H),
        elev=new Uint8Array(W*H), zone=new Uint8Array(W*H), blk=new Uint8Array(W*H),
        brg=new Uint8Array(W*H);
  const idx=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const hsh=IB.hsh, ri=IB.ri, seed=bi*13+floor*7;
  /* тип інтер'єру за категорією будівлі */
  const res=b.zone===0||b.zone===1||b.zone===8||b.zone===14||b.zone===15||b.zone===23||b.zone===26||(b.zone>=28&&b.zone<=33)||b.cat==='dacha1'||b.cat==='dacha2'||b.cat==='dacha3'||b.cat==='khrus'||b.cat==='khrus2'||b.cat==='panel9'||b.cat==='panel9b'||b.cat==='panel_c1'||b.cat==='panel_c2'||b.cat==='panel_c3'||b.cat==='tower_g'||b.cat==='towerb1'||b.cat==='towerb2'||b.cat==='bhouse1'||b.cat==='bhouse2'||b.cat==='cottage_b'||b.cat==='panel_b1'||b.cat==='panel_b2'||b.cat==='panel_v1';
  const vill=b.cat==='vill1'||b.cat==='vill2'||b.cat==='retroA'||b.cat==='retroB'||b.cat==='retroD'||b.cat==='retroE'||b.cat==='wood1'||b.cat==='wood2';
  const ind=b.cat==='factory'||b.cat==='factory2';
  const off=b.zone===3||b.zone===4||b.cat==='admin3'||b.cat==='admin4'||b.cat==='hist3';
  const shop=b.cat==='shop1'||b.cat==='shop2'||b.cat==='fnmarket';
  const wallT=res||vill?'intwall':(off?'intwall2':'intwall3');
  const floorT=(res||vill)?T.floorw:(off?T.floorc:(ind?T.floorc:T.floort));
  for(let i=0;i<W*H;i++){ter[i]=floorT;blk[i]=1;}
  const x0=1,y0=1,x1=W-2,y1=H-2;
  for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++){blk[idx(xx,yy)]=0;}
  const props=[];let propId=0;
  function prop(t,x,y,o={}){
    const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};
    props.push(p);return p;
  }
  /* каркас стін по периметру */
  for(let xx=x0;xx<=x1;xx++){prop(wallT,xx,y0,{s:1});prop(wallT,xx,y1,{s:1});}
  for(let yy=y0+1;yy<y1;yy++){prop(wallT,x0,yy,{s:1});prop(wallT,x1,yy,{s:1});}
  /* ВИХІД: двері в центрі південної стіни + ПРИХОЖА (батч 15: розширений вхід) */
  const dx=((x0+x1)/2)|0;
  for(let xx=dx-1;xx<=dx+1;xx++){
    for(let pi=props.length-1;pi>=0;pi--){
      const q=props[pi];
      if(q.t===wallT&&q.x===xx+0.5&&q.y===y1+0.5)props.splice(pi,1);
    }
  }
  prop('intdoor',dx,y1,{s:0,meta:'exit'});
  /* сходи: ВНИЗ у південно-західному куті (поверх>0), ВГОРУ у південно-східному */
  if(floor>0){
    for(let yy=y0+1;yy<=y1-1;yy++)for(let xx=x0+1;xx<=x0+2;xx++)blk[idx(xx,yy)]=0;
    prop('stairs',x0+1,y1-1,{s:0,meta:'fdown'});
  }
  if(floor<(b.floors||2)-1){
    for(let yy=y0+1;yy<=y1-1;yy++)for(let xx=x1-2;xx<=x1-1;xx++)blk[idx(xx,yy)]=0;
    prop('stairs',x1-1,y1-1,{s:0,meta:'fup'});
  }
  /* ---- ПЛАНУВАННЯ: quad (4-6 кімнат) / long (коридор + довгі кімнати) / hall (зал) ---- */
  const rooms=[];
  const bigW=W>=19, bigH=H>=17;
  const kindL=hsh(bi,floor,901);
  const forceHall=ind||shop&&hsh(bi,floor,905)<0.5;
  let plan=forceHall?'hall':(bigW&&kindL<0.42)?'long':(bigW&&bigH&&kindL<0.72)?'quad':'quad';
  if(!bigW&&!bigH)plan=kindL<0.5?'quad':'long';
  if(vill)plan=hsh(bi,floor,906)<0.55?'long':'quad';        /* сільські хати — витягнуті */
  function wallH(xx,yy0,yy1,gaps){                           /* вертикальна стіна з прорізами */
    for(let yy=yy0;yy<=yy1;yy++){
      if(gaps.some(g=>yy>=g[0]&&yy<=g[1]))continue;
      prop(wallT,xx,yy,{s:1});
    }
  }
  function wallV(yy,xx0,xx1,gaps){                           /* горизонтальна стіна з прорізами */
    for(let xx=xx0;xx<=xx1;xx++){
      if(gaps.some(g=>xx>=g[0]&&xx<=g[1]))continue;
      prop(wallT,xx,yy,{s:1});
    }
  }
  if(plan==='quad'){
    const mx=(W/2)|0, my=(H/2)|0;
    wallV(my,x0+1,x1-1,[[mx-1,mx+1]]);                       /* горизонтальна стіна */
    wallH(mx,y0+1,my-1,[[my-2,my-1]]);                       /* верхня вертикаль */
    wallH(mx,my+1,y1-1,[[my+1,my+2]]);                       /* нижня вертикаль */
    rooms.push({x0:x0+1,y0:y0+1,x1:mx-1,y1:my-1,t:'nw'});
    rooms.push({x0:mx+1,y0:y0+1,x1:x1-1,y1:my-1,t:'ne'});
    rooms.push({x0:x0+1,y0:my+1,x1:mx-1,y1:y1-1,t:'sw'});
    rooms.push({x0:mx+1,y0:my+1,x1:x1-1,y1:y1-1,t:'se'});
  } else if(plan==='long'){
    /* коридор по центру + ДОВГІ кімнати з обох боків (батч 15: «деякі дома довгі») */
    const cy=(H/2)|0;
    const wyA=cy-2, wyB=cy+2;
    const nseg=Math.max(2,Math.min(3,(W/8)|0));
    const cuts=[x0+1,...Array.from({length:nseg-1},(_,s2)=>x0+1+Math.round((x1-x0-2)*(s2+1)/nseg)),x1-1];
    const gapsA=[[dx-1,dx+1],...cuts.slice(1,-1).map(c=>[c-1,c])];
    wallV(wyA,x0+1,x1-1,gapsA);                              /* північна стіна коридору */
    wallV(wyB,x0+1,x1-1,gapsA);                              /* південна стіна коридору */
    for(let s2=1;s2<nseg;s2++){
      const xm=cuts[s2];
      wallH(xm,y0+1,wyA-1,[]);                               /* розділювачі довгих кімнат */
      wallH(xm,wyB+1,y1-1,[]);
    }
    for(let s2=0;s2<nseg;s2++){
      rooms.push({x0:cuts[s2]+1,y0:y0+1,x1:cuts[s2+1]-1,y1:wyA-1,t:'n'+s2});
      rooms.push({x0:cuts[s2]+1,y0:wyB+1,x1:cuts[s2+1]-1,y1:y1-1,t:'s'+s2});
    }
    rooms.push({x0:x0+1,y0:wyA+1,x1:x1-1,y1:wyB-1,t:'cor'}); /* сам коридор */
  } else {
    rooms.push({x0:x0+1,y0:y0+1,x1:x1-1,y1:y1-1,t:'hall'});
  }
  /* ---- НАПОВНЕННЯ КІМНАТ (furniture-kit + factory-kit + mini-arcade) ---- */
  const LOOT={'furn_shelf2':'flat','furn_shelf':'flat','furn_box':'flat','furn_boxo':'flat','furn_fridge':'flat',
    'furn_drawer':'flat','furn_desk':'flat','furn_pc':'flat','rack':'flat','fbox':'flat','furn_wardrobe':'flat',
    'furn_tv':'flat','furn_tv2':'flat','barrels':'barrels'};
  const POOLS={
    res:[['bedroom'],['kids'],['living'],['kitchen'],['bath'],['storage'],['living'],['bedroom'],['kitchen'],['storage']],
    vill:[['bedroom'],['kitchen'],['living'],['pantry'],['storage'],['living'],['bedroom'],['pantry']],
    off:[['office'],['office'],['meeting'],['server'],['reception'],['storage'],['office'],['meeting']],
    ind:[['workshop'],['boiler'],['storage'],['office'],['workshop'],['boiler'],['storage']],
    shop:[['shopfloor'],['storage'],['arcade'],['shopfloor'],['storage'],['arcade']],
  };
  const PKEY=shop?'shop':ind?'ind':vill?'vill':off?'off':res?'res':'shop';
  const ROOMDEF={
    bedroom:[['furn_bed'],['furn_wardrobe'],['furn_rug','nolock'],['furn_lamp2'],['furn_bed2'],['furn_boxo','nolock'],['furn_plant'],['furn_chair2'],['furn_lamp'],['furn_shelf2'],['furn_bear'],['furn_drawer']],
    kids:[['furn_bed'],['furn_bear'],['furn_boxo','nolock'],['furn_rug','nolock'],['furn_lamp2'],['furn_chair'],['furn_table'],['furn_shelf']],
    living:[['furn_sofa'],['furn_tv'],['furn_table'],['furn_chair2'],['furn_shelf2'],['furn_rug','nolock'],['furn_sofa2'],['furn_plant2'],['furn_lamp'],['furn_tv2'],['furn_plant'],['furn_bench']],
    kitchen:[['furn_fridge'],['furn_stove'],['furn_sink'],['furn_table'],['furn_chair2'],['furn_drawer'],['furn_boxo','nolock'],['furn_shelf2'],['furn_washer'],['furn_bench']],
    bath:[['furn_toilet'],['furn_tub'],['furn_sink'],['furn_washer'],['furn_plant']],
    storage:[['furn_shelf2'],['furn_box'],['furn_boxo','nolock'],['furn_shelf2'],['barrels'],['furn_drawer'],['furn_box'],['furn_shelf'],['barrels'],['furn_shelf2'],['furn_boxo','nolock'],['furn_box']],
    pantry:[['furn_shelf2'],['furn_box'],['furn_boxo','nolock'],['furn_shelf'],['furn_drawer'],['furn_box'],['furn_shelf2']],
    office:[['furn_desk'],['furn_chair'],['furn_pc'],['furn_shelf2'],['furn_drawer'],['furn_plant'],['furn_desk'],['furn_chair2'],['furn_pc'],['furn_shelf']],
    meeting:[['furn_table'],['furn_chair2'],['furn_chair2'],['furn_plant'],['furn_shelf'],['furn_chair'],['furn_drawer']],
    server:[['rack'],['rack'],['furn_pc'],['furn_shelf'],['fscreen'],['fpipe_valve'],['rack'],['furn_shelf2'],['fbox']],
    reception:[['furn_desk'],['furn_chair2'],['furn_plant'],['furn_bench'],['furn_shelf2'],['furn_lamp']],
    workshop:[['bench_w'],['fmachine'],['fbox'],['furn_shelf2'],['barrels'],['fconveyor','nolock'],['fmachine2'],['fpipe_valve'],['furn_shelf2'],['fbox'],['barrels']],
    boiler:[['fboiler'],['fpipe_valve'],['fpipe_bend'],['barrels'],['furn_shelf2'],['fpipe_glass','nolock'],['fboiler'],['fpiston'],['barrels'],['furn_shelf']],
    shopfloor:[['furn_shelf2'],['furn_shelf2'],['arcade_cash'],['furn_fridge'],['furn_table'],['arcade_vend'],['furn_boxo','nolock'],['furn_shelf2'],['furn_chair2'],['furn_shelf'],['furn_box'],['arcade_claw']],
    arcade:[['arcade1'],['arcade_pin'],['arcade_dance'],['arcade_vend'],['arcade_air','nolock'],['furn_sofa'],['arcade_wheel'],['fscreen'],['arcade_gam'],['furn_table'],['arcade1'],['furn_lamp']],
    cor:[['furn_bench'],['furn_rug','nolock'],['barrels'],['furn_boxo','nolock'],['furn_lamp'],['furn_plant'],['furn_bench'],['furn_box','nolock'],['barrels']],
    hall:[['furn_table'],['furn_chair2'],['furn_chair2'],['furn_sofa'],['furn_shelf2'],['furn_rug','nolock'],['furn_plant'],['furn_boxo','nolock'],['furn_lamp'],['furn_bench'],['furn_tv'],['furn_shelf']],
  };
  function fillRoom(r,rt){
    const list=ROOMDEF[rt]||ROOMDEF.hall;
    const inside=[],edge=[];
    for(let yy=r.y0;yy<=r.y1;yy++)for(let xx=r.x0;xx<=r.x1;xx++){
      const wallAdj=xx===r.x0||xx===r.x1||yy===r.y0||yy===r.y1||blk[idx(xx-1,yy)]||blk[idx(xx+1,yy)]||blk[idx(xx,yy-1)]||blk[idx(xx,yy+1)];
      (wallAdj?edge:inside).push([xx,yy]);
    }
    const shuf=a=>{for(let i=a.length-1;i>0;i--){const j=(hsh(i*3+1,r.x0*7+r.y0+rt.length,931+i)*(i+1))|0;const t2=a[i];a[i]=a[j];a[j]=t2;}};
    shuf(edge);shuf(inside);
    const tset=edge.concat(inside);   /* спочатку стінові тайли — меблі стоять уздовж стін */
    let ii=0;
    for(const[xx,yy]of tset){
      if(ii>=list.length)break;
      if(blk[idx(xx,yy)])continue;
      let meta=false;
      for(const p of props)if(p.meta&&(p.x|0)===xx&&(p.y|0)===yy)meta=true;
      if(meta)continue;
      const it=list[ii];ii++;
      const noLock=it[1]==='nolock';
      const o={s:!noLock,loot:LOOT[it[0]]||null};
      if(it[0]==='bench_w')o.meta='craft';
      prop(it[0],xx,yy,o);
    }
    /* гарантоване заповнення: якщо кімната порожня — ящики і бочки */
    if(ii<3){
      for(let yy=r.y0;yy<=r.y1&&ii<4;yy++)for(let xx=r.x0;xx<=r.x1&&ii<4;xx++){
        if(blk[idx(xx,yy)])continue;
        let meta=false;
        for(const p of props)if(p.meta&&(p.x|0)===xx&&(p.y|0)===yy)meta=true;
        if(meta)continue;
        prop(hsh(xx,yy,951)<0.5?'furn_boxo':'barrels',xx,yy,{s:true,loot:hsh(xx,yy,952)<0.5?'flat':'barrels'});
        ii++;
      }
    }
    /* лампа під стелею в кожній кімнаті */
    const cxx=((r.x0+r.x1)/2)|0, cyy=((r.y0+r.y1)/2)|0;
    if(!blk[idx(cxx,cyy)])prop('lamp_m',cxx,cyy,{s:0});
  }
  for(const r of rooms){
    let rt;
    if(r.t==='cor')rt='cor';
    else if(r.t==='hall'){
      /* зал: для магазину — прилавки, для цеху — верстати, для житла — вітальня+куточок аркад */
      rt=shop?'shopfloor':ind?'workshop':(hsh(bi,floor,941)<0.3?'arcade':'living');
      fillRoom(r,rt);
      if(ind){  /* цех: РЯДИ ВЕРСТАТІВ і стелажів + труби по стінах (батч 15) */
        for(let yy=r.y0+1;yy<=r.y1-1;yy+=3){
          for(let xx=r.x0+1;xx<=r.x1-1;xx+=4){
            if(blk[idx(xx,yy)])continue;
            let meta=false;
            for(const p of props)if(p.meta&&(p.x|0)===xx&&(p.y|0)===yy)meta=true;
            if(meta)continue;
            const rr=hsh(xx,yy,961);
            prop(rr<0.35?'fmachine':rr<0.55?'fmachine2':rr<0.7?'fboiler':rr<0.85?'fbox':'furn_shelf2',xx,yy,{s:1,loot:rr<0.7?null:'flat'});
          }
          const py=yy+1;
          if(py<=r.y1-1&&!blk[idx(r.x0+2,py)])prop('fpipe_h',r.x0+2,py,{s:0});
        }
        for(let xx=r.x0;xx<=r.x1;xx+=3){
          if(!blk[idx(xx,r.y0)]&&hsh(xx,r.y0,943)<0.5)prop('fpipe_h',xx,r.y0,{s:0});
          if(!blk[idx(xx,r.y1)]&&hsh(xx,r.y1,944)<0.5)prop(hsh(xx,r.y1,945)<0.5?'fpipe_h':'bpipe',xx,r.y1,{s:0});
        }
        if(!blk[idx(r.x0+1,r.y1-1)])prop('bench_w',r.x0+1,r.y1-1,{s:1,meta:'craft'});
        if(!blk[idx(r.x1-2,r.y1-1)])prop('frobot',r.x1-2,r.y1-1,{s:1});
        if(!blk[idx(r.x1-3,r.y0+1)])prop('fscreen',r.x1-3,r.y0+1,{s:1});
      } else if(shop){
        /* магазин: РЯДИ ПРИЛАВКІВ уздовж залу */
        for(let yy=r.y0+1;yy<=r.y1-1;yy+=3){
          for(let xx=r.x0+1;xx<=r.x1-1;xx+=4){
            if(blk[idx(xx,yy)])continue;
            let meta=false;
            for(const p of props)if(p.meta&&(p.x|0)===xx&&(p.y|0)===yy)meta=true;
            if(meta)continue;
            const rr=hsh(xx,yy,963);
            prop(rr<0.45?'furn_shelf2':rr<0.65?'furn_fridge':rr<0.8?'furn_table':'arcade_cash',xx,yy,{s:rr>=0.8,loot:rr>=0.8?'flat':null});
          }
        }
        for(let xx=r.x0;xx<=r.x1;xx+=3){
          if(!blk[idx(xx,r.y0)]&&hsh(xx,r.y0,943)<0.5)prop('fpipe_h',xx,r.y0,{s:0});
          if(!blk[idx(xx,r.y1)]&&hsh(xx,r.y1,944)<0.5)prop(hsh(xx,r.y1,945)<0.5?'fpipe_h':'bpipe',xx,r.y1,{s:0});
        }
      }
      continue;
    }
    else{
      const pool=POOLS[PKEY];
      rt=pool[(hsh(bi*7+floor*3,r.x0,r.y0)*pool.length)|0][0];
    }
    fillRoom(r,rt);
  }
  /* ---- зомбі поверху (спавн при вході; зачистка = смерть усіх) ---- */
  const ndanger=Math.min(4,1+floor+((IB.ZONES[b.zone]||{}).d>=4?1:0));
  const zdefs=[];
  const types=['walker','crawler','runner'];
  for(let zi=0;zi<ndanger;zi++){
    const zx=x0+1+((hsh(bi,zi+floor*3,151)*(W-4))|0);
    const zy=y0+1+((hsh(zi,bi+floor,152)*(H-4))|0);
    const tt=types[(hsh(zi,bi,153)*3)|0];
    zdefs.push({x:IB.clamp(zx,x0+1,x1-1),y:IB.clamp(zy,y0+1,y1-1),t:tt,dead:false});
  }
  /* лампа освітлення в центрі (gfx light holes) */
  prop('lamp_m',((x0+x1)/2)|0,((y0+y1)/2)|0,{s:0});
  /* блокування від пропсів (стіни/меблі з s) */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  /* двері/сходи не блокують */
  for(const p of props){if((p.meta==='exit'||p.meta==='fup'||p.meta==='fdown')&&inb(p.x|0,p.y|0))blk[idx(p.x|0,p.y|0)]=0;}
  /* ---- мінімапа інтер'єру ---- */
  const mm=IB.mk(W,H);const g=mm.g;
  const MC={[T.floorw]:'#5e4630',[T.floort]:'#6e7680',[T.floorc]:'#44464e',[T.floorr]:'#6e3830'};
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){g.fillStyle=blk[idx(xx,yy)]?'#20232c':(MC[ter[idx(xx,yy)]]||'#4a4c54');g.fillRect(xx,yy,1,1);}
  /* БАТЧ 17: ЖОВТИЙ ВИХІД і блакитні сходи на мінімапі — щоб не губитись */
  const dpM=props.find(q=>q.meta==='exit');
  if(dpM){g.fillStyle='#f0d050';g.fillRect((dpM.x|0)-1,(dpM.y|0)-1,3,3);}
  const stM=props.find(q=>q.meta==='fup')||props.find(q=>q.meta==='fdown');
  if(stM){g.fillStyle='#60c8f0';g.fillRect((stM.x|0)-1,(stM.y|0)-1,3,3);}
  const zoneName='БУДИНОК • '+(IB.ZONES[b.zone]?IB.ZONES[b.zone].n:'КИЇВ')+' • ПОВЕРХ '+(floor+1)+'/'+(b.floors||2);
  const world={W,H,ter,vrn,rdm,elev,zone,blk,brg,blds:[],lms:[],props,cars:[],stations:[],passages:[],safes:[],npcs:[],towers:[],mm,
    base:null,bridges:[],ridx:idx,inb,
    clearArea:null,
    freeSpot:(x,y,maxR=5)=>{
      x|=0;y|=0;
      if(!inb(x,y))return{x:W/2,y:H/2};
      if(!blk[idx(x,y)])return{x:x+0.5,y:y+0.5};
      for(let r=1;r<=maxR;r++){
        for(let yy2=y-r;yy2<=y+r;yy2++)for(let xx2=x-r;xx2<=x+r;xx2++){
          if(!inb(xx2,yy2)||blk[idx(xx2,yy2)])continue;
          return{x:xx2+0.5,y:yy2+0.5};
        }
      }
      return{x:W/2,y:H/2};
    },
    zoneAt:()=>b.zone,
    zoneName:()=>zoneName,
    danger:()=>(IB.ZONES[b.zone]||{}).d||2,
    elevAt:()=>0,
    solid:(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;},
    interior:true,bld:bi,floor,floors:(b.floors||2),zdefs,
  };
  IB.INTERIORS[key]=world;
  return world;
};

/* ================================================================
   БАТЧ 17: ГЕОГРАФІЧНЕ РОЗШИРЕННЯ КИЇВА (запит гравця: «розширюємо Київ»).
   Мапа 560x660 -> 810x900: старий контент зсувається на (+240, 0).
     ЗАХІД (від вокзалу):   ШУЛЯВКА → СВЯТОШИН → АКАДЕММІСТЕЧКО
     ІРПІНЬ (ліс+селище) ПЕРЕНЕСЕНО за Академмістечко — ліс починається
       ТІЛЬКИ за Академгородком (тепер з вокзалу на захід іде МІСТО)
     ПІВДЕНЬ (від вокзалу/Печерська): ЛИБІДСЬКА → ДЕМІЇВСЬКА → ІПОДРОМ
       (з іподромом-еліпсом), за іподромом по той бік кільцевої — ВИШНЕВЕ
     ВИШГОРОДСЬКА ГЕС: промисловий комплекс біля греблі + заводи + ліс
     МЕТРО: гілки КПІ→Шулявська→Святошин→Академмістечко і
       Печерська→Либідська→Деміївська→Іподром (входи на поверхні)
   ================================================================ */
IB._expandCity3=function(wd){
  const T=IB.TER;
  const W0=wd.W,H0=wd.H,DX=240,DY=0;
  const W2=W0+DX+10,H2=H0+240;                     /* 810 x 900 */
  const grow=src=>{const d=new Uint8Array(W2*H2);for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)d[y*W2+(x+DX)]=src[y*W0+x];return d;};
  const ter=grow(wd.ter),vrn=grow(wd.vrn),elev=grow(wd.elev),zone=grow(wd.zone),blk=grow(wd.blk),brg=grow(wd.brg);
  const rdm=new Uint8Array(W2*H2);
  const idx=(x,y)=>y*W2+x,inb=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2;
  const hsh=IB.hsh,ri=IB.ri,M=IB.M;
  /* ---- 1. зсув усього старого контенту на +240 ---- */
  const sh=o=>{if(o&&o.x!==undefined){o.x+=DX;o.y+=DY;}};
  for(const b of wd.blds){sh(b);if(b.door)sh(b.door);}
  for(const a of wd.lms)sh(a);
  for(const p of wd.props)sh(p);
  for(const c of wd.cars)sh(c);
  for(const s of wd.stations)sh(s);
  for(const p of wd.passages||[])sh(p);
  for(const s of wd.safes)sh(s);
  for(const n of wd.npcs)sh(n);
  for(const t of wd.towers)sh(t);
  sh(wd.base);
  for(const g of wd.gas||[])sh(g);
  for(const v of wd.villages||[])sh(v);
  if(wd.lake)sh(wd.lake);
  if(wd.mtn)sh(wd.mtn);
  for(const bn of wd.bridges||[])bn[2]=(bn[2]===undefined?228:bn[2])+DX;
  /* ---- 2. ІРПІНЬ: переносимо ліс/селище ЗА Академмістечко (на західний край).
     Джерело S — пд-захід старого контенту мінус вокзал/база (keepout K).
     Зсув: (-240, +40) ---- */
  const SX0=265,SX1=450,SY0=285,SY1=515;
  const KX0=348,KX1=412,KY0=262,KY1=312;
  const inS=(x,y)=>x>=SX0&&x<=SX1&&y>=SY0&&y<=SY1&&!((x>=KX0&&x<=KX1)&&(y>=KY0&&y<=KY1));
  const isContent=(x,y)=>x>=DX&&x<DX+W0&&y<H0&&!inS(x,y);
  const IRDX=-240,IRDY=40;
  /* 2a. терейн: копіюємо блок у західний край */
  const bandW=SX1-SX0+1;
  const snap=arr=>{
    const d=new Uint8Array(bandW*(SY1-SY0+1));
    for(let y=SY0;y<=SY1;y++)for(let x=SX0;x<=SX1;x++)d[(y-SY0)*bandW+(x-SX0)]=arr[idx(x,y)];
    return d;
  };
  const sTer=snap(ter),sVrn=snap(vrn),sElev=snap(elev),sZone=snap(zone),sBlk=snap(blk),sBrg=snap(brg);
  for(let y=SY0;y<=SY1;y++)for(let x=SX0;x<=SX1;x++){
    if(!inS(x,y))continue;
    const dx2=x+IRDX,dy2=y+IRDY;
    if(!inb(dx2,dy2))continue;
    const s=(y-SY0)*bandW+(x-SX0);
    ter[idx(dx2,dy2)]=sTer[s];vrn[idx(dx2,dy2)]=sVrn[s];elev[idx(dx2,dy2)]=sElev[s];
    zone[idx(dx2,dy2)]=13;                       /* ІРПІНЬ • ЛІС */
    blk[idx(dx2,dy2)]=sBlk[s]===4?0:sBlk[s];brg[idx(dx2,dy2)]=sBrg[s];
  }
  /* 2b. джерело заливаємо травою (вокзал/база в K не чіпаємо) */
  for(let y=SY0;y<=SY1;y++)for(let x=SX0;x<=SX1;x++){
    if(!inS(x,y))continue;
    const i=idx(x,y);
    ter[i]=T.grass;vrn[i]=ri(0,2);elev[i]=0;blk[i]=0;brg[i]=0;zone[i]=35;   /* тимчасово — Голосіїв, розстановка нижче */
  }
  /* 2c. об'єкти: пропси/будівлі/локації/схованки/авто/АЗС/вежі */
  const IRP=[];
  for(const p of wd.props){if(inS(p.x,p.y)){p.x+=IRDX;p.y+=IRDY;IRP.push(p);}}
  for(const b of wd.blds){if(inS(b.x+0.5,b.y+0.5)){b.x+=IRDX;b.y+=IRDY;b.zone=13;if(b.door){b.door.x+=IRDX;b.door.y+=IRDY;}IRP.push(b);}}
  for(const a of wd.lms){if(inS(a.x+0.5,a.y+0.5)&&a.key!=='vv13'){a.x+=IRDX;a.y+=IRDY;a.zone=13;IRP.push(a);}}
  for(const s of wd.safes){if(inS(s.x,s.y)){s.x+=IRDX;s.y+=IRDY;}}
  for(const c of wd.cars){if(inS(c.x,c.y)){c.x+=IRDX;c.y+=IRDY;}}
  for(const g of wd.gas||[]){if(inS(g.x,g.y)){g.x+=IRDX;g.y+=IRDY;}}
  for(const t of wd.towers){if(inS(t.x,t.y)){t.x+=IRDX;t.y+=IRDY;}}
  /* Мощунський ліс підрізаємо до y 214: південніше — ШУЛЯВКА (дерева/паркани прибираємо) */
  wd.props=wd.props.filter(p=>{
    if(p.x>=242&&p.x<=302&&p.y>=213&&p.y<=322){
      const t=p.t;
      if(t==='pine'||t==='bush'||t==='dead'||t==='fence'||t[0]==='t')return false;
    }
    return true;
  });
  function zoneSetF(x0,y0,x1,y1,z){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(!inb(x,y))continue;
      const i=idx(x,y);
      if(ter[i]===T.water)continue;
      zone[i]=z;
    }
  }
  zoneSetF(242,213,302,322,28);                   /* ШУЛЯВКА поверх Мощунського лісу */
  /* ---- 3. НОВІ ДОРОГИ ---- */
  function R3(x,y,t,f){if(!inb(x,y))return;if(!f&&ter[idx(x,y)]===T.water)return;ter[idx(x,y)]=t;vrn[idx(x,y)]=0;}
  function VR3(x0,x1,y0,y1,t,f){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R3(x,y,t,f);}
  function HR3(y0,y1,x0,x1,t,f){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)R3(x,y,t,f);}
  const rd=T.road,cob=T.cobble,drt=T.dirt;
  /* Берестейський проспект: вокзал -> Шулявка -> Святошин -> Академмістечко */
  HR3(276,281,148,356,rd);
  /* Шулявка */
  VR3(258,261,232,306,rd);VR3(288,291,238,302,rd);HR3(240,243,252,312,rd);HR3(262,265,252,312,rd);HR3(288,291,252,314,rd);
  /* Святошин */
  VR3(154,157,222,330,rd);VR3(184,187,222,330,rd);VR3(214,217,222,330,rd);VR3(240,243,222,330,rd);
  HR3(228,231,150,246,rd);HR3(258,261,150,246,rd);HR3(288,291,150,246,rd);HR3(315,318,150,246,rd);
  /* Академмістечко */
  VR3(40,43,218,334,rd);VR3(70,73,218,334,rd);VR3(100,103,218,334,rd);VR3(126,129,224,330,rd);
  HR3(224,227,34,136,rd);HR3(254,257,34,136,rd);HR3(304,307,34,136,rd);
  /* Оболонь -> Шулявка (старий відрізок дороги Оболоні продовжуємо) */
  VR3(267,270,252,276,rd);
  /* Південний коридор: Васильківський/Голосіївський проспект від вокзалу */
  VR3(378,383,306,545,rd);
  HR3(306,309,362,383,rd);                       /* від вокзалу на коридор */
  /* Либідська */
  HR3(330,333,350,412,rd);HR3(354,357,350,412,rd);
  /* Деміївська */
  HR3(392,395,350,412,rd);HR3(416,419,350,412,rd);
  /* Іподром: кільце-трек (пісок) + підтрибунний проїзд */
  (function(){
    const cx2=379,cy2=472,rx2=26,ry2=14;
    for(let y=cy2-ry2-3;y<=cy2+ry2+3;y++)for(let x=cx2-rx2-3;x<=cx2+rx2+3;x++){
      if(!inb(x,y))continue;
      const q=((x-cx2)/rx2)**2+((y-cy2)/ry2)**2;
      const qi=((x-cx2)/(rx2-5))**2+((y-cy2)/(ry2-4))**2;
      if(q<=1.06&&qi>=1){R3(x,y,T.sand);}
      else if(q<=1.06&&qi<1&&ter[idx(x,y)]!==T.road&&blk[idx(x,y)]===0){R3(x,y,T.grass);}
    }
    HR3(440,443,350,412,rd);HR3(500,503,350,412,rd);   /* підтрибунні вулиці */
  })();
  /* Кільцева дорога: Іподром -> Вишневе (за іподромом по той бік) */
  HR3(545,548,245,412,rd);
  /* Вишневе */
  VR3(262,265,455,540,rd);VR3(296,299,455,540,rd);VR3(326,329,455,540,rd);
  HR3(468,471,250,345,rd);HR3(498,501,250,345,rd);HR3(522,525,250,345,rd);
  /* Буча -> Вишневе (ґрунтовка) */
  VR3(269,270,470,498,drt);
  /* ГРЕБЛЯ -> ГЕС: під'їзд до промкомплексу з греблі */
  VR3(446,449,38,58,rd);
  /* ґрунтова дорога: Академмістечко -> ІРПІНЬ (ліс лише тут!) */
  VR3(56,59,334,384,drt);
  HR3(384,387,52,90,drt);
  /* Дніпро продовжується на південь у нові ряди карти */
  for(let y=658;y<H2-2;y++){
    const c=452+M.round(8*M.sin((y-80)*0.043)+4*M.sin((y-80)*0.011+2));
    for(let x=c;x<=c+16;x++)R3(x,y,T.water,true);
  }
  /* поля на новому півдні */
  for(let y=680;y<H2-4;y++)for(let x=250;x<=790;x++){
    if(!inb(x,y))continue;const i=idx(x,y);
    if(ter[i]===T.grass&&hsh(x,y,901)<0.5)ter[i]=T.field;
  }
  /* ---- 4. ЗОНИ НОВИХ РАЙОНІВ ---- */
  function zoneSet(x0,y0,x1,y1,z){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(!inb(x,y)||isContent(x,y))continue;
      const i=idx(x,y);
      if(ter[i]===T.water)continue;
      zone[i]=z;
    }
  }
  zoneSet(243,308,450,560,35);                    /* Голосіївський ліс (базово) */
  zoneSet(8,342,243,560,13);                      /* ІРПІНЬ • ЛІС (захід, за Академмістечком) */
  zoneSet(4,560,243,896,13);                      /* південно-західні ліси */
  zoneSet(4,80,243,208,13);                       /* північно-західний ліс до Мощуна */
  zoneSet(250,230,316,308,28);                    /* ШУЛЯВКА • КПІ */
  zoneSetF(242,213,302,322,28);                   /* і смуга Мощунського лісу */
  zoneSet(146,213,250,337,29);                    /* СВЯТОШИН */
  zoneSet(28,208,142,342,30);                     /* АКАДЕММІСТЕЧКО */
  zoneSet(346,310,414,376,31);                    /* ЛИБІДСЬКА */
  zoneSet(346,376,414,440,32);                    /* ДЕМІЇВСЬКА */
  zoneSet(346,440,414,542,33);                    /* ІПОДРОМ • ТЕРЕМКИ */
  zoneSet(266,450,344,552,34);                    /* ВИШНЕВЕ */
  zoneSet(414,308,450,512,35);                    /* схід коридору — ліс */
  zoneSet(243,660,806,896,35);                    /* південні поля області */
  zoneSet(798,4,806,896,17);                      /* східний край — Броварський ліс */
  /* ---- 5. БУДІВЛІ НОВИХ РАЙОНІВ (з дверима, поверхами, вивісками) ---- */
  const NB3=[];let propId=wd.props.length;
  function P16(t,x,y,o={}){const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};wd.props.push(p);return p;}
  const CAT3={panel9:[3,3],panel9b:[3,3],khrus:[3,2],khrus2:[3,2],admin3:[4,2],admin4:[4,3],shop1:[3,1],shop2:[3,1],panel_v1:[3,3],
    factory:[4,3],factory2:[4,3],fnmarket:[5,3],vill1:[3,2],vill2:[2,2],dacha1:[3,2],dacha2:[3,2],cottage_b:[2,2],
    wood1:[2,2],wood2:[2,2],garage:[1,1]};
  function placeB3(x,y,cat,z){
    const w=CAT3[cat][0],d=CAT3[cat][1];
    if(x<4||y<4||x+w>W2-4||y+d>H2-4)return null;
    for(let yy=y-1;yy<=y+d;yy++)for(let xx=x-1;xx<=x+w;xx++){
      if(!inb(xx,yy))return null;
      const i=idx(xx,yy),t=ter[i];
      if(t===T.road||t===T.water||t===T.rail||t===T.sand&&cat!=='garage')return null;
      if(blk[i])return null;
      if(cat!=='garage'&&(t===T.sidewalk||t===T.pave||t===T.cobble)&&hsh(x,y,44)<0.25)return null;
    }
    for(let yy=y;yy<y+d;yy++)for(let xx=x;xx<x+w;xx++){const i=idx(xx,yy);ter[i]=T.concrete;blk[i]=1;vrn[i]=0;}
    const b={cat,x,y,wT:w,dT:d,zone:z,mural:false,var:ri(0,3)};
    if(cat==='fnmarket')b.sign=0;
    else if(cat==='shop1'||cat==='shop2')b.sign=1+ri(0,2);
    else if((cat==='hist2'||cat==='admin3'||cat==='khrus'||cat==='panel9')&&hsh(x,y,447)<0.4)b.sign=1+ri(0,2);
    if(cat!=='garage'&&cat!=='fnmarket'&&!b.mural&&hsh(x,y,448)<0.34)b.graf=ri(0,4);
    wd.blds.push(b);NB3.push(b);
    /* двері + expansive вхід (як у місті) */
    if(cat!=='garage'){
      const dx=x+((w/2)|0),dy=y+d;
      if(inb(dx,dy)&&!blk[idx(dx,dy)]&&ter[idx(dx,dy)]!==T.road&&ter[idx(dx,dy)]!==T.water){
        const dp=P16('doorp',dx,dy,{s:0,meta:'enter'});
        dp.bld=wd.blds.indexOf(b);b.door={x:dx,y:dy};b.floors=IB.BLD_FLOORS(b);
        for(let xx=dx-1;xx<=dx+1;xx++)for(let yy2=dy;yy2<=dy+1;yy2++){
          if(!inb(xx,yy2))continue;const i2=idx(xx,yy2);
          if(blk[i2]===0&&(ter[i2]===T.grass||ter[i2]===T.dirt||ter[i2]===T.sidewalk))ter[i2]=T.pave;
        }
        if(inb(dx,dy+1)&&blk[idx(dx,dy+1)]===0)P16('doormat',dx,dy+1,{s:0});
      }
    }
    return b;
  }
  /* мікрорайон: сітка 8x8, комплекси/ряди/башти — як у місті */
  function district(x0,y0,x1,y1,z,cats,dens){
    for(let gy=y0;gy<y1-7;gy+=8)for(let gx=x0;gx<x1-7;gx+=8){
      const roll=hsh(gx,gy,1771);
      if(roll>dens)continue;
      const list=cats;
      const pick=seed=>list[((hsh(gx,gy,seed)*list.length)|0)%list.length]||list[0];
      let n=0;
      if(roll<dens*0.34){
        /* П-подібний комплекс */
        const cA=pick(1772),cB=pick(1773),cC=pick(1774);
        if(placeB3(gx,gy,cA,z))n++;
        if(placeB3(gx+8-CAT3[cB][0],gy,cB,z))n++;
        if(placeB3(gx+2,gy+5,cC,z))n++;
        /* двір */
        for(let yy=gy+2;yy<=gy+4;yy++)for(let xx=gx+2;xx<=gx+5;xx++){if(inb(xx,yy)&&!blk[idx(xx,yy)]&&ter[idx(xx,yy)]===T.grass)ter[idx(xx,yy)]=T.pave;}
        if(hsh(gx,gy,1775)<0.6&&inb(gx+3,gy+3)&&!blk[idx(gx+3,gy+3)])P16(hsh(gx,gy,1776)<0.4?'tree_o':'bench',gx+3,gy+3,{s:hsh(gx,gy,1777)<0.5});
      } else if(roll<dens*0.62){
        /* ряд уздовж фасаду */
        let xx=gx;
        for(let i2=0;i2<3&&xx<gx+8;i2++){
          const c=pick(1772+i2),[w2,d2]=CAT3[c];
          if(placeB3(xx,gy+1,c,z))xx+=w2+1;else xx+=2;
        }
        if(hsh(gx,gy,1778)<0.5&&inb(gx+4,gy+4)&&!blk[idx(gx+4,gy+4)])P16('tree_b',gx+4,gy+4,{s:0});
      } else {
        /* башта + зелений двір */
        const tall=hsh(gx,gy,1779)<0.5?(z===31?'admin4':'panel9b'):'panel9';
        if(placeB3(gx+2,gy+2,tall,z)){
          if(inb(gx+1,gy+1)&&!blk[idx(gx+1,gy+1)])P16('tree_o2',gx+1,gy+1,{s:0});
          if(inb(gx+6,gy+6)&&!blk[idx(gx+6,gy+6)])P16('bush',gx+6,gy+6,{s:0});
          n++;
        }
      }
      if(n>0&&hsh(gx,gy,1781)<0.4)P16(hsh(gx,gy,1782)<0.5?'dumpster':'barrels',gx+2,gy+6,{s:1,loot:hsh(gx,gy,1783)<0.5?'dumpster':'barrels'});
    }
  }
  district(252,232,314,304,28,['panel9','khrus','factory2','admin3','shop1'],0.9);      /* Шулявка */
  /* КПІ-корпуси і забудова щільніше навколо вокзалу/бази ВВ13 (запит: «це великий район — збільшуй») */
  placeB3(322,268,'factory2',28);placeB3(330,280,'admin3',28);placeB3(322,292,'khrus',28);
  placeB3(338,268,'panel9',28);placeB3(344,290,'admin3',28);
  placeB3(356,296,'admin3',11);placeB3(396,296,'factory',11);placeB3(366,300,'garage',11);placeB3(404,304,'garage',11);
  placeB3(360,270,'admin3',11);placeB3(392,268,'admin4',11);placeB3(400,284,'shop2',11);
  placeB3(368,306,'khrus',11);placeB3(398,306,'khrus2',11);
  district(148,222,246,318,29,['panel9b','panel9','khrus','admin3','shop2','khrus2'],0.92);  /* Святошин */
  district(34,218,136,330,30,['panel9','khrus2','panel9b','admin4','shop1'],0.9);       /* Академмістечко */
  district(350,312,412,374,31,['admin4','panel9b','panel9','shop2'],0.88);              /* Либідська (вежі-плаза) */
  district(350,376,412,438,32,['khrus','panel9','shop1','khrus2'],0.9);                 /* Деміївська */
  district(350,504,412,540,33,['panel9b','khrus','shop1'],0.85);                        /* Теремки (за іподромом) */
  /* Вишневе — котеджне містечко */
  district(268,452,344,540,34,['cottage_b','vill1','wood2','vill2','dacha2'],0.86);
  placeB3(300,478,'fnmarket',34);
  placeB3(332,500,'shop2',34);
  /* ---- 6. ІПОДРОМ: огорожа, трибуна, суддівська вежа, конюшня ---- */
  (function(){
    const cx2=379,cy2=472,rx2=26,ry2=14;
    for(let a=0;a<72;a++){
      const ang=a/72*Math.PI*2;
      const x=Math.round(cx2+Math.cos(ang)*(rx2+3)),y=Math.round(cy2+Math.sin(ang)*(ry2+3));
      if(inb(x,y)&&blk[idx(x,y)]===0&&ter[idx(x,y)]!==T.road&&a%2===0)P16('fence',x,y,{s:0});
    }
    /* трибуна вздовж північного краю треку */
    for(let x=cx2-14;x<=cx2+10;x+=2){if(inb(x,cy2-ry2-4)&&!blk[idx(x,cy2-ry2-4)])P16('bench',x,cy2-ry2-4,{s:1});}
    for(let x=cx2-14;x<=cx2+10;x+=2){if(inb(x,cy2-ry2-5)&&!blk[idx(x,cy2-ry2-5)])P16('wall_s',x,cy2-ry2-5,{s:1});}
    /* суддівська вежа + конюшня + верстати */
    if(placeB3(cx2-8,cy2+3,'factory',33)){}
    P16('tank',cx2+10,cy2+6,{s:1});P16('chimney',cx2+12,cy2+4,{s:1});
    P16('kiosk',cx2,cy2-6,{s:1,loot:'crate'});
    P16('barrels',cx2-12,cy2+6,{s:1,loot:'barrels'});
    P16('lamp_b',cx2,cy2,{s:1});
  })();
  /* ---- 7. ВИШГОРОДСЬКА ГЕС: промкомплекс біля греблі ---- */
  (function(){
    /* бетонна платформа ГЕС */
    for(let y=40;y<=56;y++)for(let x=424;x<=478;x++){
      if(!inb(x,y))continue;const i=idx(x,y);
      if(ter[i]===T.water||ter[i]===T.road||blk[i]===4)continue;
      ter[i]=T.concrete;vrn[i]=0;
    }
    placeB3(428,42,'factory',23);
    placeB3(436,42,'factory2',23);
    placeB3(428,48,'admin3',23);
    placeB3(438,49,'factory',23);
    placeB3(462,42,'factory2',23);
    /* гідроагрегати: труби, баки, градирня-труба, щити */
    P16('fpipe_h',426,47,{s:0});P16('fpipe_valve',427,49,{s:1});P16('fpipe_bend',429,50,{s:0});
    P16('tank',433,52,{s:1});P16('tank',437,53,{s:1});P16('tank',460,52,{s:1});
    P16('chimney',444,44,{s:1});P16('chimney',447,44,{s:1});P16('chimney',465,44,{s:1});
    P16('fboiler',430,54,{s:1});P16('fboiler',433,54,{s:1});
    P16('fbox',440,52,{s:1,loot:'parts'});P16('fbox',456,50,{s:1,loot:'parts'});
    P16('barrels',452,54,{s:1,loot:'barrels'});P16('barrels',466,50,{s:1,loot:'barrels'});
    P16('fence',424,57,{s:0});P16('fence',426,57,{s:0});P16('fence',428,57,{s:0});P16('fence',430,57,{s:0});
    P16('lamp_b',432,50,{s:1});P16('lamp_b',458,48,{s:1});
    wd.towers.push({x:446,y:44,n:'ВИШКА ГЕС • ВИШГОРОД'});
    wd.safes.push({x:470,y:48,n:'НАСОСНА ГЕС',z:'ВИШГОРОД'});P16('cache',470,48,{s:0,meta:'safe'});
  })();
  /* додаткові будинки Вишгорода (заповнюємо пустку) */
  placeB3(296,30,'panel_v1',23);placeB3(304,30,'panel_v1',23);placeB3(320,44,'wood1',23);
  placeB3(336,44,'wood2',23);placeB3(352,44,'vill1',23);placeB3(368,44,'wood1',23);
  placeB3(384,44,'panel_v1',23);placeB3(396,44,'vill2',23);placeB3(412,44,'panel_v1',23);
  placeB3(296,40,'vill2',23);placeB3(312,40,'vill1',23);placeB3(328,40,'cottage_b',23);
  /* ---- 8. МЕТРО: входи на поверхню (6 нових станцій) ---- */
  const ST3=[[282,285,'ШУЛЯВСЬКА'],[200,285,'СВЯТОШИН'],[95,285,'АКАДЕММІСТЕЧКО'],[386,321,'ЛИБІДСЬКА'],[386,401,'ДЕМІЇВСЬКА'],[386,452,'ІПОДРОМ']];
  for(const[x,y,n]of ST3){
    P16('metro_m',x,y,{s:1,meta:n});
    if(inb(x,y))blk[idx(x,y)]=0;
    wd.stations.push({x,y,n});
  }
  /* ---- 9. СХОВАНКИ / NPC / ВЕЖІ / АЗС НОВИХ РАЙОНІВ ---- */
  wd.safes.push({x:380,y:340,n:'ПІДВАЛ НА ЛИБІДСЬКІЙ',z:'ЛИБІДСЬКА'});P16('cache',380,340,{s:0,meta:'safe'});
  wd.safes.push({x:360,y:430,n:'КВАРТИРА НА ДЕМІЇВСЬКІЙ',z:'ДЕМІЇВСЬКА'});P16('cache',360,430,{s:0,meta:'safe'});
  wd.safes.push({x:288,y:522,n:'КОТЕДЖ У ВИШНЕВОМУ',z:'ВИШНЕВЕ'});P16('cache',288,522,{s:0,meta:'safe'});
  wd.npcs.push({x:297.5,y:500.5,n:'ВАСИЛЬ — ГОСПОДАР З ВИШНЕВОГО',role:'trader2'});
  wd.npcs.push({x:379.5,y:444.5,n:'ГРИЦЬКО — СТАРТА НА ІПОДРОМІ',role:'camp'});
  wd.towers.push({x:230,y:238,n:'ВИШКА СВЯТОШИНА'});
  wd.towers.push({x:355,y:470,n:'ВИШКА ІПОДРОМУ'});
  wd.towers.push({x:345,y:530,n:'ВИШКА ВИШНЕВОГО'});
  /* АЗС Вишневого */
  (function(){
    for(let y=482;y<=488;y++)for(let x=334;x<=341;x++){
      if(!inb(x,y))continue;const i=idx(x,y);
      if(ter[i]===T.road||ter[i]===T.water)continue;
      ter[i]=T.concrete;vrn[i]=0;blk[i]=1;
    }
    for(let y=483;y<=486;y++)for(let x=335;x<=340;x++)blk[idx(x,y)]=0;
    for(let x=336;x<=339;x++)blk[idx(x,487)]=0;
    P16('gas_canopy',337,483,{s:0});
    P16('gas_pump',335,484,{s:1,meta:'pump'});
    P16('gas_pump',339,484,{s:1,meta:'pump'});
    P16('kiosk',335,487,{s:1,loot:'trunk'});
    P16('barrels',340,487,{s:1,loot:'barrels'});
    wd.gas.push({x:337.5,y:485,n:'АЗС • ВИШНЕВЕ'});
  })();
  /* ---- 10. ДЕРЕВА НОВИХ КВАРТАЛІВ + ЛІСИ (Голосіївський, Ірпінь західний) ---- */
  function forest3(x0,y0,x1,y1,dens,sn,zonly){
    for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
      if(!inb(x,y))continue;
      const i=idx(x,y);
      if(ter[i]!==T.grass&&ter[i]!==T.field)continue;
      if(blk[i])continue;
      if(zonly&&zone[i]!==zonly)continue;
      const r=hsh(x,y,sn);
      if(r>=dens)continue;
      if(r<dens*0.4)P16('pine',x,y,{s:0});
      else if(r<dens*0.6)P16('tree_s',x,y,{s:0});
      else if(r<dens*0.78)P16('tree_big',x,y,{s:0});
      else if(r<dens*0.9)P16('tree_o2',x,y,{s:0});
      else P16('bush',x,y,{s:0});
    }
  }
  forest3(243,308,414,440,0.26,1931,35);          /* Голосіївський ліс */
  forest3(414,308,452,512,0.22,1932,35);
  forest3(8,342,243,410,0.24,1933,13);            /* ліс над Ірпенем */
  forest3(8,540,243,700,0.22,1934,13);
  forest3(4,208,28,342,0.22,1935,30);             /* ліс західного краю */
  forest3(212,342,250,450,0.2,1936,13);
  /* міські дерева нових кварталів (західний пояс + reclaimed Irpin-зона) */
  for(let y=208;y<=552;y++)for(let x=28;x<=414;x++){
    if(!(x<246||inS(x,y)))continue;
    const i=idx(x,y);
    if(ter[i]!==T.grass||blk[i])continue;
    const z=zone[i];
    const p=z===34?0.055:z===29?0.038:z===30?0.04:(z===28||z===31||z===32)?0.02:z===33?0.014:0;
    if(!p)continue;
    const r=hsh(x,y,1937);
    if(r<p){const tw=hsh(x,y,1938);P16(tw<0.3?'tree_o':tw<0.5?'tree_b':tw<0.68?'tree_o2':tw<0.84?'tree_big':tw<0.94?'tree_p':'tree_a',x,y,{s:0});}
    else if(r<p+0.014)P16('bush',x,y,{s:0});
  }
  /* ліс навколо ГЕС і Вишгорода (схили водосховища) */
  forest3(254,40,424,78,0.2,1939,23);
  forest3(478,40,540,78,0.2,1940,23);
  /* ліси південної смуги області і східного краю */
  forest3(246,664,806,890,0.15,1941,35);
  forest3(4,660,243,890,0.22,1944,13);
  forest3(798,4,806,890,0.2,1943,17);
  /* ---- 11. СВІЖІ ТРОТУАРИ НА НОВИХ ДОРОГАХ ---- */
  for(let y=2;y<H2-2;y++)for(let x=2;x<W2-2;x++){
    if(isContent(x,y))continue;
    const i=idx(x,y),t=ter[i];
    if(t!==T.grass&&t!==T.field)continue;
    if(blk[i])continue;
    let near=false;
    for(const[ddx,ddy]of[[1,0],[-1,0],[0,1],[0,-1]])if(inb(x+ddx,y+ddy)&&ter[idx(x+ddx,y+ddy)]===T.road)near=true;
    if(near&&hsh(x,y,77)<0.92)ter[i]=T.sidewalk;
  }
  /* ---- 12. ЧИСТІ ЗОНИ КЛЮЧОВИХ ТОЧОК ---- */
  function clear3(cx,cy,r){
    for(let yy=M.max(2,M.floor(cy-r));yy<=M.min(H2-2,M.ceil(cy+r));yy++)
    for(let xx=M.max(2,M.floor(cx-r));xx<=M.min(W2-2,M.ceil(cx+r));xx++){
      const i=idx(xx,yy);if(blk[i]===4||ter[i]===T.water)continue;if(blk[i])blk[i]=0;
    }
  }
  for(const[x,y]of ST3){clear3(x+0.5,y+0.5,2.4);}
  for(const s of wd.safes){if(!isContent(s.x|0,s.y|0))clear3(s.x+0.5,s.y+0.5,2.2);}
  for(const n of wd.npcs){if(!isContent(n.x|0,n.y|0))clear3(n.x,n.y,1.6);}
  for(const g of wd.gas||[]){if(!isContent(g.x|0,(g.y|0)))clear3(g.x,g.y+3.8,2.4);}
  for(const t of wd.towers){if(!isContent(t.x|0,t.y|0))clear3(t.x,t.y,1.6);}
  for(const c of wd.cars){if(!isContent(c.x|0,c.y|0))clear3(c.x,c.y,0.55);}
  for(const l of wd.lms){if(!isContent(l.x|0,l.y|0)){clear3(l.x+l.wT/2,l.y-1,1.8);clear3(l.x-1,l.y+l.dT/2,1.8);clear3(l.x+l.wT+0.5,l.y+l.dT/2,1.8);}}
  clear3(379.5,444.5,1.8);clear3(297.5,500.5,1.8);   /* NPC */
  /* ---- 13. ВОДА: усюди суцільна колізія (мости — дорога поверх) ----
     герой плавати може (ents.js), але стояти «на воді» як на суші — більше не можна */
  for(let i=0;i<W2*H2;i++){if(ter[i]===T.water&&blk[i]!==4)blk[i]=2;}
  /* ---- 14. АВТО НОВИХ РАЙОНІВ ---- */
  function C16(mdl,x,y,dir,dr,f,hp){const vr=hsh(x*7+y,3,715)<0.42?(hsh(x,y,716)<0.5?'a':'b'):null;wd.cars.push({mdl,var:vr,x:x+0.5,y:y+0.5,dir,drivable:dr,fuel:f,hp:hp,broken:!dr,looted:false});}
  C16('skoda',268,278,0,true,35,85);C16('vaz',300,278,1,true,30,75);C16('lanos',330,278,0,true,25,70);
  C16('vaz',170,278,0,true,30,80);C16('skoda',220,278,1,true,25,70);C16('suv',120,278,0,true,40,90);
  C16('lanos',382,320,3,true,35,85);C16('skoda',382,352,3,true,30,75);C16('vaz',382,384,3,true,30,70);
  C16('vaz',382,410,3,true,25,65);C16('suv',382,448,3,true,35,80);C16('skoda',382,508,3,true,30,75);
  C16('vaz',270,468,0,true,30,75);C16('lanos',300,498,1,true,25,70);C16('skoda',330,522,0,true,20,60);
  C16('vaz',450,44,0,true,40,95);C16('skoda',470,44,1,true,35,85);
  /* ---- 15. МІНІКАРТА ЗАНОВО ---- */
  const mm=IB.mk(W2,H2),mg=mm.g;
  const MC={[T.grass]:'#1c3a1e',[T.park]:'#225028',[T.field]:'#3e4422',[T.sidewalk]:'#3a3f4a',[T.pave]:'#40444e',[T.cobble]:'#3a3830',
    [T.concrete]:'#2e3138',[T.plaza]:'#4e2a20',[T.rubble]:'#2e3138',[T.dirt]:'#3a3228',[T.sand]:'#565638',[T.rail]:'#40404a',[T.water]:'#1c3860',[T.road]:'#4c4c55',[T.rock]:'#43474f'};
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){mg.fillStyle=MC[ter[idx(x,y)]]||'#1c3a1e';mg.fillRect(x,y,1,1);}
  for(const b of wd.blds){mg.fillStyle='#5a606c';mg.fillRect(b.x,b.y,b.wT,b.dT);}
  for(const l of wd.lms){mg.fillStyle='#f0d050';mg.fillRect(l.x,l.y,l.wT,l.dT);}
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(elev[idx(x,y)]>=2){mg.fillStyle='#ffffff10';mg.fillRect(x,y,1,1);}}
  /* ---- 16. road mask + кордон + перебіндінг ---- */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    if(ter[idx(x,y)]!==T.road)continue;
    let m=0;const isr=(x,y)=>inb(x,y)&&(ter[idx(x,y)]===T.road);
    if(isr(x,y-1))m|=1;if(isr(x+1,y))m|=2;if(isr(x,y+1))m|=4;if(isr(x-1,y))m|=8;
    rdm[idx(x,y)]=m;
  }
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    const i=idx(x,y);if(rdm[i]!==15)continue;
    const n15=(dx,dy)=>inb(x+dx,y+dy)&&rdm[idx(x+dx,y+dy)]===15;
    if(n15(0,-1)||n15(0,1)||n15(-1,0)||n15(1,0))rdm[i]=16;
  }
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(x<2||y<2||x>=W2-2||y>=H2-2)blk[idx(x,y)]=4;}
  wd.W=W2;wd.H=H2;wd.ter=ter;wd.vrn=vrn;wd.rdm=rdm;wd.elev=elev;wd.zone=zone;wd.blk=blk;wd.brg=brg;wd.mm=mm;
  wd.ridx=idx;wd.inb=inb;
  wd.clearArea=(cx,cy,r)=>{for(let yy=M.max(1,M.floor(cy-r));yy<=M.min(H2-2,M.ceil(cy+r));yy++)for(let xx=M.max(1,M.floor(cx-r));xx<=M.min(W2-2,M.ceil(cx+r));xx++){const i=idx(xx,yy);if(ter[i]===T.water)continue;if(blk[i]===4)continue;if(blk[i])blk[i]=0;}};
  wd.freeSpot=(x,y,maxR=6)=>{x|=0;y|=0;if(!inb(x,y))return{x:M.max(3,M.min(W2-4,x)),y:M.max(3,M.min(H2-4,y))};if(!blk[idx(x,y)]&&ter[idx(x,y)]!==T.water)return{x:x+0.5,y:y+0.5};for(let r=1;r<=maxR;r++){let best=null,bd=1e9;for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){if(!inb(xx,yy)||blk[idx(xx,yy)]||ter[idx(xx,yy)]===T.water)continue;const d=(xx-x)*(xx-x)+(yy-y)*(yy-y);if(d<bd){bd=d;best={x:xx+0.5,y:yy+0.5};}}if(best)return best;}return null;};
  wd.zoneAt=(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0;
  wd.elevAt=(x,y)=>inb(x|0,y|0)?elev[idx(x|0,y|0)]:0;
  wd.solid=(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;};
  /* POI нових районів для навігатора */
  wd.villages.push({x:379,y:472,n:'ІПОДРОМ • ТЕРЕМКИ'},{x:297,y:500,n:'ВИШНЕВЕ'},{x:450,y:46,n:'Вишгородська ГЕС'});
};

/* ================================================================
   БАТЧ 17: МЕТРО — західна гілка (КПІ→Шулявська→Святошин→Академмістечко)
   і південна гілка (Печерська→Либідська→Деміївська→Іподром).
   Карта підземки виростає до 810x900 разом із поверхнею.
   ================================================================ */
IB._expandMetro3=function(wd){
  const T=IB.TER;
  const W0=wd.W,H0=wd.H,DX=240;
  const W2=W0+DX+10,H2=H0+240;
  const grow=src=>{const d=new Uint8Array(W2*H2);for(let y=0;y<H0;y++)for(let x=0;x<W0;x++)d[y*W2+(x+DX)]=src[y*W0+x];return d;};
  const ter=grow(wd.ter),vrn=grow(wd.vrn),elev=grow(wd.elev),zone=grow(wd.zone),blk=grow(wd.blk),brg=grow(wd.brg);
  const rdm=new Uint8Array(W2*H2);
  const idx=(x,y)=>y*W2+x,inb=(x,y)=>x>=0&&y>=0&&x<W2&&y<H2;
  const hsh=IB.hsh,ri=IB.ri,M=IB.M;
  const isContent=(x,y)=>x>=DX&&x<DX+W0&&y<H0;
  const sh=o=>{if(o&&o.x!==undefined){o.x+=DX;}};
  for(const s of wd.stations)sh(s);
  for(const p of wd.props)sh(p);
  for(const p of wd.passages||[])sh(p);
  for(const r of IB.MROOMS||[])sh(r);
  /* ---- СТАНЦІЇ БАТЧУ 17 ---- */
  const props=wd.props;let propId=props.length;
  const P16=(t,x,y,o={})=>{const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};props.push(p);return p;};
  const carve=(x,y,tt)=>{if(!inb(x,y))return;const i=idx(x,y);ter[i]=tt;blk[i]=0;vrn[i]=0;elev[i]=0;};
  const segH=(x0,x1,y)=>{const st=x0<=x1?1:-1;for(let x=x0;x!==x1+st;x+=st){carve(x,y-1,T.tunnel);carve(x,y,T.track);carve(x,y+1,T.tunnel);}};
  const segV=(y0,y1,x)=>{const st=y0<=y1?1:-1;for(let y=y0;y!==y1+st;y+=st){carve(x-1,y,T.tunnel);carve(x,y,T.track);carve(x+1,y,T.tunnel);}};
  function hall(x,y,n){
    for(let yy=y-2;yy<=y+2;yy++)for(let xx=x-4;xx<=x+4;xx++)carve(xx,yy,T.plat);
    for(let xx=x-7;xx<=x+7;xx++)carve(xx,y+3,T.track);
    carve(x,y-2,T.plat);
    P16('stairs',x,y-2,{s:0,meta:'up'});
    P16('metro_m2',x-2,y,{s:0});
    P16('bench',x+3,y-1,{s:1});
    if(hsh(x,y,101)<0.8)P16('shelf',x+3,y+1,{s:1,loot:'metro'});
    if(hsh(x,y,102)<0.6)P16('shelf',x-3,y+1,{s:1,loot:'metro'});
    if(hsh(x,y,103)<0.5)P16('barrels',x-4,y+2,{s:1,loot:'barrels'});
    P16('lamp_m',x,y,{s:0});
    const wn=1+((hsh(x,y,131)*3)|0);
    for(let wi=0;wi<wn;wi++){
      const wx2=x+1+wi*5;
      if(wx2+2<W2-4&&inb(wx2,y+3))P16(wi===0?'wagon_a':(hsh(x,wi,132)<0.5?'wagon_b':'wagon_c'),wx2,y+3,{s:1});
    }
    wd.stations.push({x,y,n});
    IB.ZONES_M.push({k:'M'+n,n:'МЕТРО • '+n,d:1});
  }
  /* західна гілка: Вокзальна(366,279) → Шулявська → Святошин → Академмістечко */
  hall(282,279,'ШУЛЯВСЬКА');hall(200,279,'СВЯТОШИН');hall(95,279,'АКАДЕММІСТЕЧКО');
  segH(282,366,282);
  segH(200,282,282);
  segH(95,200,282);
  /* південна гілка: Печерська(439,251) → Либідська → Деміївська → Іподром */
  hall(386,321,'ЛИБІДСЬКА');hall(386,401,'ДЕМІЇВСЬКА');hall(386,452,'ІПОДРОМ');
  segV(254,318,439);
  segH(386,439,321);
  segV(327,398,386);
  segV(407,449,386);
  /* пара службових відгалужень-лабіринтів у нові поля */
  for(let bi=0;bi<8;bi++){
    const bases=[[320,282],[240,282],[150,282],[386,360],[386,430],[386,470],[320,321],[300,282]];
    let cx2=bases[bi][0],cy2=bases[bi][1];
    const len=4+((hsh(bi,5,78)*5)|0);
    for(let st=0;st<len;st++){
      const dir=(hsh(bi,st,79)*4)|0;
      if(dir===0){segH(cx2,cx2+3,cy2);cx2+=3;}
      else if(dir===1){segH(cx2,cx2-3,cy2);cx2-=3;}
      else if(dir===2){segV(cy2,cy2+3,cx2);cy2+=3;}
      else{segV(cy2,cy2-3,cx2);cy2-=3;}
    }
    if(bi%3===2){
      const rt=hsh(bi,9,133);
      const srv=rt<0.4,wrk=!srv;
      for(let yy=cy2-2;yy<=cy2+2;yy++)for(let xx=cx2-3;xx<=cx2+3;xx++)carve(xx,yy,T.plat);
      if(srv){P16('rack',cx2-2,cy2-1,{s:1});P16('rack',cx2,cy2-1,{s:1});P16('shelf',cx2+2,cy2,{s:1,loot:'metro'});}
      else{P16('bench_w',cx2,cy2-1,{s:1,meta:'craft'});P16('barrels',cx2-2,cy2+1,{s:1,loot:'barrels'});P16('shelf',cx2+2,cy2,{s:1,loot:'metro'});}
      P16('lamp_m',cx2,cy2,{s:0});
      IB.MROOMS.push({x:cx2,y:cy2,srv,n:srv?'СЕРВЕРНА':'МАЙСТЕРНЯ',ty:srv?'srv':'wrk',letter:srv?'C':'V'});
    } else {
      for(let yy=cy2-1;yy<=cy2+1;yy++)for(let xx=cx2-1;xx<=cx2+1;xx++)carve(xx,yy,T.tunnel);
      P16('shelf',cx2,cy2,{s:1,loot:'metro'});
      if(hsh(cx2,cy2,80)<0.5)P16('barrels',cx2+1,cy2+1,{s:1,loot:'barrels'});
    }
  }
  /* лампи в нових тунелях */
  for(let y=270;y<=470;y++)for(let x=80;x<=450;x++){
    const i=idx(x,y);
    if(blk[i]||(ter[i]!==T.tunnel&&ter[i]!==T.track))continue;
    if((x+y)%7===0&&hsh(x,y,90)<0.6)P16('lamp_m',x,y,{s:0});
  }
  /* колізії пропсів */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  for(const p of props){if(p.meta==='up'&&inb(p.x|0,p.y|0))blk[idx(p.x|0,p.y|0)]=0;}
  /* чисті зони залів */
  for(const s of wd.stations){
    for(let yy=s.y-3;yy<=s.y+3;yy++)for(let xx=s.x-5;xx<=s.x+5;xx++){
      if(inb(xx,yy)&&blk[idx(xx,yy)]!==4)blk[idx(xx,yy)]=0;
    }
  }
  /* зони станцій (для HUD-назв) */
  for(let si=0;si<wd.stations.length;si++){
    const s=wd.stations[si];
    for(let yy=s.y-6;yy<=s.y+6;yy++)for(let xx=s.x-6;xx<=s.x+6;xx++){
      if(inb(xx,yy)&&IB.dist(xx,yy,s.x,s.y)<6)zone[idx(xx,yy)]=si+1;
    }
  }
  /* новий кордон + поля = скеля (вирубані тунелі/зали/колії НЕ чіпаємо!) */
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){
    const i=idx(x,y);
    if(ter[i]===T.tunnel||ter[i]===T.track||ter[i]===T.plat)continue;
    if(x<2||y<2||x>=W2-2||y>=H2-2)blk[i]=4;
    else if(!isContent(x,y)){
      if(ter[i]!==T.rock){ter[i]=T.rock;vrn[i]=0;}
      if(blk[i]===0)blk[i]=1;
    }
  }
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){if(x<2||y<2||x>=W2-2||y>=H2-2)blk[idx(x,y)]=4;}
  /* мінімапа підземки */
  const mm=IB.mk(W2,H2),mg=mm.g;
  const MC={[T.rock]:'#101218',[T.tunnel]:'#33363e',[T.track]:'#26282e',[T.plat]:'#3e4a58'};
  for(let y=0;y<H2;y++)for(let x=0;x<W2;x++){mg.fillStyle=MC[ter[idx(x,y)]]||'#101218';mg.fillRect(x,y,1,1);}
  for(const st of wd.stations){mg.fillStyle='#cc4438';mg.fillRect(st.x-1,st.y-1,3,3);}
  wd.W=W2;wd.H=H2;wd.ter=ter;wd.vrn=vrn;wd.elev=elev;wd.zone=zone;wd.blk=blk;wd.brg=brg;wd.rdm=rdm;wd.mm=mm;
  wd.ridx=idx;wd.inb=inb;
  wd.clearArea=(cx,cy,r)=>{for(let yy=M.max(1,M.floor(cy-r));yy<=M.min(H2-2,M.ceil(cy+r));yy++)for(let xx=M.max(1,M.floor(cx-r));xx<=M.min(W2-2,M.ceil(cx+r));xx++){const i=idx(xx,yy);if(blk[i]===4)continue;if(blk[i])blk[i]=0;}};
  wd.freeSpot=(x,y,maxR=6)=>{x|=0;y|=0;if(!inb(x,y))return{x:M.max(3,M.min(W2-4,x)),y:M.max(3,M.min(H2-4,y))};if(!blk[idx(x,y)])return{x:x+0.5,y:y+0.5};for(let r=1;r<=maxR;r++){let best=null,bd=1e9;for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){if(!inb(xx,yy)||blk[idx(xx,yy)])continue;const d=(xx-x)*(xx-x)+(yy-y)*(yy-y);if(d<bd){bd=d;best={x:xx+0.5,y:yy+0.5};}}if(best)return best;}return null;};
  wd.zoneAt=(x,y)=>inb(x|0,y|0)?zone[idx(x|0,y|0)]:0;
  wd.solid=(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;};
  wd.zoneName=z=>IB.ZONES_M[z]?IB.ZONES_M[z].n:'МЕТРО';
  wd.danger=z=>IB.ZONES_M[z]?IB.ZONES_M[z].d:2;
};

/* ================= БАТЧ 17: ІНТЕР'ЄР БАЗИ ВВ13 • КПІ =================
   Гравець ЗАХОДИТЬ ВСЕРЕДИНУ бази (як у будинок): головний зал з радіо
   103.1 і планом міста, майстерня з верстаком, спальня з ліжками,
   склад, кухонька. Без заражених — безпечна зона. */
IB.buildBase=function(){
  if(IB.BASEWORLD)return IB.BASEWORLD;
  const T=IB.TER;
  const W=30,H=22;
  const ter=new Uint8Array(W*H),vrn=new Uint8Array(W*H),rdm=new Uint8Array(W*H),
        elev=new Uint8Array(W*H), zone=new Uint8Array(W*H), blk=new Uint8Array(W*H),
        brg=new Uint8Array(W*H);
  const idx=(x,y)=>y*W+x, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const props=[];let propId=0;
  function prop(t,x,y,o={}){
    const p={id:propId++,t,x:x+0.5,y:y+0.5,s:!!o.s,loot:o.loot||null,looted:false,meta:o.meta||null};
    props.push(p);return p;
  }
  for(let i=0;i<W*H;i++){ter[i]=T.floorc;blk[i]=1;}
  const x0=1,y0=1,x1=W-2,y1=H-2;
  for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)blk[idx(xx,yy)]=0;
  /* стіни по периметру */
  for(let xx=x0;xx<=x1;xx++){prop('intwall2',xx,y0,{s:1});prop('intwall2',xx,y1,{s:1});}
  for(let yy=y0+1;yy<y1;yy++){prop('intwall2',x0,yy,{s:1});prop('intwall2',x1,yy,{s:1});}
  /* ВИХІД: двері в центрі південної стіни */
  const dx=((x0+x1)/2)|0;
  for(let xx=dx-1;xx<=dx+1;xx++){
    for(let pi=props.length-1;pi>=0;pi--){
      const q=props[pi];
      if(q.t==='intwall2'&&q.x===xx+0.5&&q.y===y1+0.5)props.splice(pi,1);
    }
  }
  prop('intdoor',dx,y1,{s:0,meta:'exit'});
  /* ---- ВНУТРІШНІ СТІНИ: 4 КІМНАТИ ---- */
  const mx=(W/2)|0, my=(H/2)|0;
  function wallV(yy,xx0,xx1,gaps){for(let xx=xx0;xx<=xx1;xx++){if(gaps.some(g=>xx>=g[0]&&xx<=g[1]))continue;prop('intwall2',xx,yy,{s:1});}}
  function wallH(xx,yy0,yy1,gaps){for(let yy=yy0;yy<=yy1;yy++){if(gaps.some(g=>yy>=g[0]&&yy<=g[1]))continue;prop('intwall2',xx,yy,{s:1});}}
  wallV(my,2,x1-1,[[mx-2,mx+2],[2,4]]);            /* поперечна стіна */
  wallH(mx,2,my-1,[[my-2,my-1]]);                  /* північна перегородка */
  wallH(mx,my+2,y1-1,[]);                          /* південна перегородка (склад/майстерня) */
  /* ---- ГОЛОВНИЙ ЗАЛ (пд-схід): радіо 103.1, план міста, прапор, диван ---- */
  prop('radio_post',mx+4,my+1,{s:1,meta:'radio103'});
  prop('furn_table',mx+7,my+1,{s:1,meta:'maptbl'});
  prop('furn_chair2',mx+7,my+3,{s:0});
  prop('furn_sofa',mx+2,my+3,{s:1});
  prop('furn_tv',mx+5,my+3,{s:1});
  prop('flag',mx+9,my-1,{s:0});
  prop('lamp_m',mx+5,my+2,{s:0});
  /* ---- МАЙСТЕРНЯ (пд-захід): верстак, полиці, бочки, ящики ---- */
  prop('bench_w',x0+3,y1-2,{s:1,meta:'craft'});
  prop('furn_shelf2',x0+6,y1-2,{s:1,loot:'flat'});
  prop('barrels',x0+2,y1-4,{s:1,loot:'barrels'});
  prop('fbox',x0+5,y1-4,{s:1,loot:'flat'});
  prop('fmachine',x0+3,my+2,{s:1});
  prop('lamp_m',x0+4,my+3,{s:0});
  /* ---- СПАЛЬНЯ (пн-захід): два ліжка, шафа, килим ---- */
  prop('furn_bed',x0+3,y0+2,{s:1});
  prop('furn_bed2',x0+6,y0+2,{s:1});
  prop('furn_wardrobe',x0+9,y0+2,{s:1});
  prop('furn_rug',x0+5,y0+4,{s:0});
  prop('furn_lamp2',x0+7,y0+3,{s:0});
  prop('lamp_m',x0+5,y0+3,{s:0});
  /* ---- СКЛАД (пн-схід): стелажі, тайник-склад, ящики ---- */
  prop('furn_shelf',x1-3,y0+2,{s:1,loot:'flat'});
  prop('furn_shelf',x1-3,y0+4,{s:1,loot:'flat'});
  prop('furn_box',x1-4,y0+2,{s:1,meta:'stash'});
  prop('furn_boxo',x1-4,y0+4,{s:0,loot:'flat'});
  prop('furn_boxo',x1-6,y0+3,{s:0,loot:'flat'});
  prop('furn_pc',x1-3,my-2,{s:1,meta:'save'});
  prop('lamp_m',x1-4,y0+3,{s:0});
  /* ---- КУХОНЬКА (кут пн-схід під стіною) ---- */
  prop('furn_fridge',x1-7,y0+2,{s:1,loot:'flat'});
  prop('furn_stove',x1-8,y0+2,{s:1,loot:'flat'});
  /* колізії від пропсів */
  for(const p of props){if(p.s&&inb(p.x|0,p.y|0)){if(blk[idx(p.x|0,p.y|0)]===0)blk[idx(p.x|0,p.y|0)]=1;}}
  for(const p of props){if((p.meta==='exit'||p.meta==='radio103'||p.meta==='maptbl'||p.meta==='stash'||p.meta==='save'||p.meta==='craft')&&inb(p.x|0,p.y|0))blk[idx(p.x|0,p.y|0)]=0;}
  /* ---- мінімапа з ЖОВТОЮ СТРІЛКОЮ ВИХОДУ ---- */
  const mm=IB.mk(W,H);const g=mm.g;
  const MC={[T.floorw]:'#5e4630',[T.floort]:'#6e7680',[T.floorc]:'#44464e',[T.floorr]:'#6e3830'};
  for(let yy=0;yy<H;yy++)for(let xx=0;xx<W;xx++){g.fillStyle=blk[idx(xx,yy)]?'#20232c':(MC[ter[idx(xx,yy)]]||'#4a4c54');g.fillRect(xx,yy,1,1);}
  const dp2=props.find(q=>q.meta==='exit');
  if(dp2){g.fillStyle='#f0d050';g.fillRect((dp2.x|0)-1,(dp2.y|0)-1,3,3);}
  const world={W,H,ter,vrn,rdm,elev,zone,blk,brg,blds:[],lms:[],props,cars:[],stations:[],passages:[],safes:[],npcs:[],towers:[],mm,
    base:null,bridges:[],ridx:idx,inb,
    clearArea:null,
    freeSpot:(x,y,maxR=5)=>{
      x|=0;y|=0;
      if(!inb(x,y))return{x:W/2,y:H/2};
      if(!blk[idx(x,y)])return{x:x+0.5,y:y+0.5};
      for(let r=1;r<=maxR;r++){
        for(let yy=y-r;yy<=y+r;yy++)for(let xx=x-r;xx<=x+r;xx++){
          if(!inb(xx,yy)||blk[idx(xx,yy)])continue;
          return{x:xx+0.5,y:yy+0.5};
        }
      }
      return{x:W/2,y:H/2};
    },
    zoneAt:()=>11,
    zoneName:()=>'БАЗА ВВ13 • КПІ • ВСЕРЕДИНІ',
    danger:()=>0,
    elevAt:()=>0,
    solid:(x,y)=>{x|=0;y|=0;if(!inb(x,y))return true;return blk[idx(x,y)]!==0;},
    interior:true,bld:-1,base:true,floor:0,floors:1,zdefs:[],
  };
  IB.BASEWORLD=world;
  return world;
};
