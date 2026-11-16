/* IBONARIUM KYIV — all sprites baked procedurally (16-bit Mega Drive style) */
IB.SPR = (function(){
  const P=IB.PAL, M=IB.M;
  const SPR={ground:{},road:[],props:{},cats:{},zomb:{},player:{},cars:{},items:{},big:{},icons:{}};

  /* ---------------- GROUND TILES (32x16) ---------------- */
  function tile(fn,n=1){
    const out=[];
    for(let v=0;v<n;v++){
      const c=IB.mk(32,16),g=c.g;
      g.save();g.beginPath();g.moveTo(16,0);g.lineTo(32,8);g.lineTo(16,16);g.lineTo(0,8);g.closePath();g.clip();
      fn(g,v);g.restore();out.push(c);
    }
    return out;
  }
  function G(g,base,base2,seed,s2){IB.rhomb(g,0,0,32,16,base);IB.speck(g,0,0,32,16,base2,30,seed);if(s2)IB.speck(g,0,0,32,16,s2,10,seed+3);IB.speck(g,0,0,32,16,P.ash1,7,seed+9);IB.speck(g,0,0,32,16,P.ash2,5,seed+17);}
  /* суха трава з проплешинами, купками, камінням та сміттям — БАГАТО ДЕТАЛЕЙ (батч 8) */
  SPR.ground.grass = tile((g,v)=>{G(g,P.g3,P.g4,v,P.g2);
    for(let i=0;i<4;i++){const x=4+(IB.hsh(i,v,41)*24)|0,y=3+(IB.hsh(i,v,42)*9)|0;IB.P(g,x,y,3,1,P.b2);IB.P(g,x+1,y+1,2,1,P.b1);IB.P(g,x,y+2,1,1,P.b1);}
    if(IB.hsh(v,1,9)<0.55){IB.P(g,8+v*4,6,2,1,P.g5);IB.P(g,14,10+v,2,1,P.g5);}
    /* купки трави (2px стебла) */
    for(let i=0;i<3;i++){const x=2+(IB.hsh(i,v,46)*28)|0,y=2+(IB.hsh(i,v,47)*11)|0;IB.P(g,x,y,1,2,P.g5);IB.P(g,x+1,y+1,1,1,P.g6);}
    /* камінці та уламки */
    for(let i=0;i<2;i++){const x=3+(IB.hsh(i,v,48)*26)|0,y=3+(IB.hsh(i,v,49)*10)|0;IB.P(g,x,y,2,1,P.gr3);IB.P(g,x,y+1,1,1,P.gr1);}
    IB.P(g,(IB.hsh(v,7,44)*28|0)+2,(IB.hsh(v,8,45)*12|0)+2,1,1,P.gr2);
    /* шматочок сміття/паперу */
    if(IB.hsh(v,2,50)<0.4){IB.P(g,10+v*3,4+v,2,1,P.ash1);IB.P(g,11+v*3,5+v,1,1,P.ash2);}},3);
  SPR.ground.park  = tile((g,v)=>{G(g,P.g3,P.g4,v+11,P.g1);const fl=[P.y4,P.wht,P.rd3][v%3];
    for(let i=0;i<4;i++){IB.P(g,4+(IB.hsh(i,v,51)*24)|0,3+(IB.hsh(i,v,52)*9)|0,1,1,fl);}
    IB.P(g,20,9,1,1,fl);IB.P(g,12,11,1,1,fl);IB.speck(g,0,0,32,16,P.b2,5,v+31);
    for(let i=0;i<2;i++){const x=2+(IB.hsh(i,v,53)*28)|0,y=2+(IB.hsh(i,v,54)*11)|0;IB.P(g,x,y,1,2,P.g5);IB.P(g,x+1,y+1,1,1,P.g6);}},3);
  SPR.ground.field = tile((g,v)=>{G(g,P.sa2,P.sa3,v+21,P.g3);IB.P(g,10+v*3,7,3,1,P.sa1);IB.speck(g,0,0,32,16,P.b2,6,v+51);},2);
  SPR.ground.sidewalk = tile(g=>{IB.rhomb(g,0,0,32,16,P.c2);IB.P(g,0,8,32,1,P.c3);IB.P(g,16,0,1,16,P.c3);IB.P(g,0,0,32,16,P.c2);IB.PA(g,[[16,0],[32,8],[16,16],[0,8]],P.c2);IB.P(g,0,8,32,1,P.c3);IB.P(g,16,0,1,16,P.c3);IB.speck(g,0,0,32,16,P.c1,12,4);IB.speck(g,0,0,32,16,P.ash2,7,14);IB.speck(g,0,0,32,16,P.b3,3,19);
    /* тріщини плит та вилітна шва */
    g.strokeStyle=P.c1;g.beginPath();g.moveTo(6,3);g.lineTo(9,6);g.lineTo(7,10);g.stroke();
    g.beginPath();g.moveTo(22,10);g.lineTo(26,7);g.stroke();
    IB.P(g,5,4,1,1,P.a3);IB.P(g,24,5,2,1,P.a3);IB.P(g,12,11,1,1,P.a3);});
  SPR.ground.pave  = tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.c3);IB.PA(g,[[0,8],[16,0],[16,16],[0,8]],P.c3);IB.P(g,2,7,12,1,P.c2);IB.P(g,18,7,12,1,P.c2);IB.P(g,8+v*4,2,1,5,P.c2);IB.P(g,22,9,1,5,P.c2);IB.speck(g,0,0,32,16,P.c4,9,v+6);IB.speck(g,0,0,32,16,P.ash2,8,v+61);
    g.strokeStyle=P.d02;g.beginPath();g.moveTo(4+v*3,2);g.lineTo(8+v*3,6);g.lineTo(6+v*3,10);g.stroke();
    /* цятки бруду та жуйка */
    IB.P(g,10+v*2,9,1,1,P.b3);IB.P(g,19,4,1,1,P.b2);IB.speck(g,0,0,32,16,P.b2,4,v+63);},2);
  SPR.ground.cobble= tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.gr2);for(let i=0;i<16;i++){const x=(IB.hsh(i,v,5)*28)|0,y=(IB.hsh(i,v,6)*12)|0;IB.P(g,x,y+2,3,2,P.gr3);IB.P(g,x,y+3,3,1,P.gr1);if(i%4===0){IB.P(g,x+1,y+2,1,1,P.gr4);}}IB.speck(g,0,0,32,16,P.gr1,9,v);IB.speck(g,0,0,32,16,P.ash2,7,v+71);
    /* мох між камінням */
    IB.speck(g,0,0,32,16,P.g3,5,v+73);IB.P(g,8,6,1,1,P.g4);IB.P(g,20,10,2,1,P.g4);},2);
  SPR.ground.concrete=tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.c1);IB.speck(g,0,0,32,16,P.a3,18,v+8);IB.speck(g,0,0,32,16,P.ash1,9,v+81);IB.P(g,4,6+v,9,1,P.a1);IB.P(g,20,10,8,1,P.a1);
    g.strokeStyle=P.d02;g.beginPath();g.moveTo(2,12);g.lineTo(9,9);g.lineTo(15,12);g.stroke();
    /* деформаційні шви та плями */
    IB.P(g,0,4+v,32,1,P.c3);IB.P(g,17,0,1,16,P.c3);IB.speck(g,0,0,32,16,P.b2,4,v+83);},2);
  SPR.ground.plaza = tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.mn2);IB.PA(g,[[16,2],[28,8],[16,14],[4,8]],P.mn1);IB.PA(g,[[16,4],[24,8],[16,12],[8,8]],P.mn2);IB.P(g,15,7,2,2,P.gr3);IB.speck(g,0,0,32,16,P.c4,6,v+2);IB.speck(g,0,0,32,16,P.ash2,8,v+91);IB.P(g,7+v*4,4,2,1,P.b2);IB.P(g,21,11,2,1,P.gr3);
    /* вивітрені шви плит */
    IB.P(g,11,5,1,1,P.mn1);IB.P(g,22,7,1,1,P.mn1);IB.P(g,16,10,1,1,P.mn1);IB.P(g,10,10,1,1,P.ash2);},2);
  SPR.ground.rubble= tile((g,v)=>{IB.rhomb(g,0,0,32,16,P.a2);for(let i=0;i<14;i++){const x=4+(IB.hsh(i,v,15)*22)|0,y=3+(IB.hsh(i,v,16)*10)|0;IB.P(g,x,y,2,1,P.gr3);IB.P(g,x+1,y+1,2,1,P.b2);IB.P(g,x,y-1,1,1,P.gr4);IB.P(g,(IB.hsh(i,v,25)*28|0)+2,(IB.hsh(i,v,26)*12|0)+2,1,1,P.d01);
    /* шматки цегли та битого скла */
    if(i%3===0){IB.P(g,x,y+2,1,1,P.r2);}else if(i%3===1){IB.P(g,x+2,y,1,1,P.wht);}}IB.speck(g,0,0,32,16,P.gr2,12,v);IB.speck(g,0,0,32,16,P.ash1,8,v+99);IB.speck(g,0,0,32,16,P.r1,3,v+101);},2);
  SPR.ground.dirt  = tile((g,v)=>{G(g,P.b2,P.b3,v+31,P.b1);},2);
  SPR.ground.sand  = tile((g,v)=>{G(g,P.sa2,P.sa3,v+41,P.sa1);},2);
  SPR.ground.rail  = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.P(g,0,4,32,2,P.gr3);IB.P(g,0,11,32,2,P.gr3);IB.P(g,0,5,32,1,P.m4);IB.P(g,0,12,32,1,P.m4);IB.speck(g,0,0,32,16,P.a3,12,7);IB.speck(g,0,0,32,16,P.ru1,6,17);});
  /* ---------------- МЕТРО: скеля, тунель, колія, платформа (підземний шар) ---------------- */
  /* скеля навколо тунелів — темний граніт з тріщинами, виступами і мохом */
  SPR.ground.rock = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#181a22');IB.speck(g,0,0,32,16,'#101218',26,v+3);IB.speck(g,0,0,32,16,'#22242e',18,v+7);IB.speck(g,0,0,32,16,'#2c2e3a',8,v+11);
    g.strokeStyle='#0c0d12';g.beginPath();g.moveTo(4+v*3,3);g.lineTo(11+v*2,8);g.lineTo(7+v*2,13);g.stroke();
    g.beginPath();g.moveTo(20,4+v);g.lineTo(26,9+v);g.stroke();
    IB.P(g,6+v*4,5,3,1,'#3a3e2c');IB.P(g,7+v*4,6,1,1,'#4a4e38');   /* мох */
    if(v%2)IB.P(g,22,10,2,1,'#3a2c1c');},2);
  /* бетонна підлога тунелю: бруд, дренаж, кабель-канал */
  SPR.ground.tunnel=tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#3a3d46');IB.speck(g,0,0,32,16,'#2e3138',20,v+5);IB.speck(g,0,0,32,16,'#464952',12,v+9);IB.speck(g,0,0,32,16,'#26282f',8,v+13);
    IB.P(g,0,7+v%2,32,1,'#2a2c33');                                 /* шов плити */
    IB.P(g,12+v*3,10,2,2,'#1d1f26');                                /* дренажна решітка */
    IB.P(g,3+v*4,3,4,1,'#4e5160');                                  /* кабель-канал */
    IB.speck(g,0,0,32,16,'#565a40',4,v+17);},2);
  /* колія: щебінь, шпали, блискучі рейки */
  SPR.ground.track=tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#2a2c33');IB.speck(g,0,0,32,16,'#3a3d46',18,v+3);IB.speck(g,0,0,32,16,'#1d1f26',14,v+7);
    for(let i=0;i<4;i++){IB.P(g,2+i*8,5+(i%2),6,2,'#3e3226');}      /* шпали */
    IB.P(g,0,3,32,2,'#787e8c');IB.P(g,0,11,32,2,'#787e8c');         /* рейки */
    IB.P(g,0,3,32,1,'#a4aab8');IB.P(g,0,11,32,1,'#a4aab8');         /* блиск */
    IB.speck(g,0,0,32,16,'#181a20',10,v+11);},2);
  /* платформа станції: плитка + жовта лінія безпеки */
  SPR.ground.plat = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#4a4e58');IB.speck(g,0,0,32,16,'#3e424c',14,v+5);IB.speck(g,0,0,32,16,'#565a64',10,v+9);
    IB.P(g,0,8,32,1,'#3e424c');IB.P(g,16,0,1,16,'#3e424c');         /* шви плит */
    IB.P(g,0,12,32,2,v%2?'#d8a834':'#c49830');                      /* лінія безпеки */
    IB.P(g,2,6,2,1,'#5a4a2c');IB.P(g,20,4,2,1,'#5a4a2c');           /* бруд */
    IB.speck(g,0,0,32,16,'#2a2c33',6,v+13);},2);
  SPR.ground.water0= tile(g=>{IB.rhomb(g,0,0,32,16,P.w2);IB.P(g,6,4,9,1,P.w3);IB.P(g,18,9,10,1,P.w3);IB.P(g,3,11,7,1,P.w1);IB.P(g,22,3,6,1,P.w4);IB.speck(g,0,0,32,16,P.gr3,4,11);IB.P(g,12,7,2,1,P.ash2);});
  SPR.ground.water1= tile(g=>{IB.rhomb(g,0,0,32,16,P.w2);IB.P(g,4,6,11,1,P.w3);IB.P(g,16,4,8,1,P.w3);IB.P(g,8,11,9,1,P.w1);IB.P(g,24,8,5,1,P.w4);IB.speck(g,0,0,32,16,P.gr3,4,13);IB.P(g,6,10,2,1,P.ash2);IB.P(g,19,12,3,1,P.w1);});
  SPR.ground.bridge_h = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.P(g,0,7,32,2,P.a3);IB.P(g,0,4,32,1,P.y3);IB.P(g,0,12,32,1,P.y3);IB.speck(g,0,0,32,16,P.a1,10,9);IB.speck(g,0,0,32,16,P.ru1,5,19);});
  SPR.ground.bridge_v = tile(g=>{IB.rhomb(g,0,0,32,16,P.a2);IB.PA(g,[[16,0],[24,4],[16,8],[8,4]],P.a3);IB.P(g,10,2,1,2,P.y3);IB.P(g,21,10,1,2,P.y3);IB.P(g,13,12,1,2,P.y3);IB.P(g,18,3,1,2,P.y3);IB.speck(g,0,0,32,16,P.a1,10,9);IB.speck(g,0,0,32,16,P.ru1,5,19);});
  /* ---------------- БАТЧ 13: ІНТЕР'ЄРИ — паркет, плитка, бетон, килим ---------------- */
  SPR.ground.floorw = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#6a4e34');IB.speck(g,0,0,32,16,'#5a422c',18,v+3);IB.speck(g,0,0,32,16,'#78593c',12,v+7);
    for(let i=0;i<4;i++){IB.P(g,i*8+(v%2)*4,3+(i%2)*4,7,1,'#57402a');IB.P(g,i*8+(v%2)*4,4+(i%2)*4,7,1,'#4a3826');}
    IB.speck(g,0,0,32,16,'#3e2e1e',8,v+11);IB.speck(g,0,0,32,16,'#8a6a48',5,v+13);},2);
  SPR.ground.floort = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#9aa2ac');for(let yy=0;yy<4;yy++)for(let xx=0;xx<8;xx++){IB.P(g,xx*4+(yy%2)*2,yy*4,3,3,(xx+yy+v)%3?'#8a92a0':'#7e8694');}
    IB.speck(g,0,0,32,16,'#6a707c',8,v+5);IB.speck(g,0,0,32,16,'#5a5a62',6,v+9);IB.P(g,10+v*4,11,3,1,'#54585e');},2);
  SPR.ground.floorc = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#4e5058');IB.speck(g,0,0,32,16,'#42444c',20,v+3);IB.speck(g,0,0,32,16,'#5a5c64',12,v+7);
    IB.P(g,0,8,32,1,'#3a3c44');IB.P(g,16,0,1,16,'#3a3c44');
    IB.O(g,6+v*3,5,5,2,'rgba(20,22,26,0.5)');IB.O(g,20,10,4,2,'rgba(20,22,26,0.4)');
    IB.speck(g,0,0,32,16,'#2e3038',8,v+11);},2);
  SPR.ground.floorr = tile((g,v)=>{IB.rhomb(g,0,0,32,16,'#7c3c34');IB.speck(g,0,0,32,16,'#6c322c',16,v+3);IB.speck(g,0,0,32,16,'#8c463c',10,v+7);
    IB.PA(g,[[16,3],[26,8],[16,13],[6,8]],'#5a2a26');IB.PA(g,[[16,5],[22,8],[16,11],[10,8]],'#8c4c40');
    IB.speck(g,0,0,32,16,'#4a2220',6,v+11);},2);
  /* road 16 mask variants: bit1=N(edge NW) bit2=E(NE) bit4=S(SE) bit8=W(SW) — вивітрілий асфальт з тріщинами */
  for(let m=0;m<16;m++){
    const c=IB.mk(32,16),g=c.g;
    g.save();g.beginPath();g.moveTo(16,0);g.lineTo(32,8);g.lineTo(16,16);g.lineTo(0,8);g.closePath();g.clip();
    IB.rhomb(g,0,0,32,16,P.a2);IB.speck(g,0,0,32,16,P.a3,14,m);IB.speck(g,0,0,32,16,P.a1,12,m+5);IB.speck(g,0,0,32,16,P.ash2,6,m+15);
    /* тріщини та масні плями */
    if(m%4===0||m%4===2){g.strokeStyle=P.d01;g.beginPath();g.moveTo(3+(m%5)*5,2+(m%3)*3);g.lineTo(9+(m%5)*5,7);g.lineTo(6+(m%5)*5,12);g.stroke();}
    IB.O(g,6+(m%3)*8,5+(m%4)*2,4,2,'rgba(14,14,18,0.45)');
    const bits=[[1,24,4],[2,24,4],[4,24,12],[8,8,12]];
    const cnt=((m&1)?1:0)+((m&2)?1:0)+((m&4)?1:0)+((m&8)?1:0);
    if(cnt==2){
      if((m&3)===3||((m&12)===12)){ /* straight */
        if(m&1){IB.P(g,15,0,2,16,P.c4);IB.P(g,16,1,1,4,P.y4);IB.P(g,16,9,1,4,P.y4);}
        else{IB.P(g,0,8,32,1,P.c4);IB.P(g,3,8,4,1,P.y4);IB.P(g,13,8,4,1,P.y4);IB.P(g,23,8,4,1,P.y4);}
      } else { /* corner curve */
        if((m&2)&&(m&4)){IB.P(g,16,8,10,1,P.y4);IB.P(g,16,4,1,6,P.y4);}
        if((m&2)&&(m&8)){IB.P(g,10,8,12,1,P.y4);}
        if((m&1)&&(m&4)){IB.P(g,16,2,1,12,P.y4);}
        if((m&1)&&(m&8)){IB.P(g,8,6,6,1,P.y4);IB.P(g,14,6,1,8,P.y4);}
      }
    }
    g.restore();SPR.road.push(c);
  }

  /* ---------------- PROPS ---------------- */
  function prop(name,fn){const c=IB.mk(64,64);fn(c.g,32,56);SPR.props[name]={c,ax:32,ay:56};}
  function small(name,w,h,fn){const c=IB.mk(w,h);fn(c.g,w/2,h-2);SPR.props[name]={c,ax:w/2,ay:h-2};}

  prop('tree_o',(g,x,y)=>{IB.P(g,x-2,y-14,4,14,P.b2);IB.P(g,x-1,y-14,1,14,P.b1);
    IB.O(g,x,y-26,13,11,P.g2);IB.O(g,x-7,y-30,9,8,P.g3);IB.O(g,x+7,y-31,9,8,P.g4);IB.O(g,x-2,y-34,8,7,P.g5);IB.O(g,x+2,y-33,5,4,P.g6);IB.speck(g,x-12,y-38,22,16,P.g1,14,3);});
  prop('tree_o2',(g,x,y)=>{IB.P(g,x-2,y-12,3,12,P.b2);IB.O(g,x,y-24,11,10,P.g1);IB.O(g,x-5,y-28,8,7,P.g2);IB.O(g,x+6,y-27,7,6,P.g3);IB.O(g,x,y-31,6,5,P.g4);});
  prop('pine',(g,x,y)=>{IB.P(g,x-2,y-10,4,10,P.b2);
    for(let i=0;i<4;i++){const w=16-i*3,yy=y-10-i*7;IB.PA(g,[[x-w,yy],[x+w,yy],[x,yy-9]],i%2?P.g2:P.g3);}
    IB.PA(g,[[x-4,y-38],[x+4,y-38],[x,y-44]],P.g4);});
  prop('dead',(g,x,y)=>{IB.P(g,x-2,y-18,3,18,P.b1);IB.P(g,x-1,y-18,1,18,P.gr2);
    g.strokeStyle=P.gr2;g.lineWidth=1;g.beginPath();g.moveTo(x-1,y-18);g.lineTo(x-8,y-26);g.moveTo(x-1,y-14);g.lineTo(x+7,y-22);g.moveTo(x-1,y-24);g.lineTo(x+3,y-31);g.stroke();});
  prop('bush',(g,x,y)=>{IB.O(g,x,y-5,9,6,P.g2);IB.O(g,x-4,y-8,6,5,P.g3);IB.O(g,x+4,y-8,5,4,P.g4);IB.O(g,x-1,y-10,4,3,P.g5);});
  prop('bench',(g,x,y)=>{IB.P(g,x-9,y-6,18,3,P.b3);IB.P(g,x-9,y-3,18,2,P.b2);IB.P(g,x-9,y-10,18,2,P.b3);IB.P(g,x-8,y-8,2,2,P.b2);IB.P(g,x+6,y-8,2,2,P.b2);IB.P(g,x-8,y-1,2,2,P.b1);IB.P(g,x+6,y-1,2,2,P.b1);});
  prop('lamp',(g,x,y)=>{IB.P(g,x-1,y-26,2,26,P.m2);IB.P(g,x-2,y-28,4,3,P.m3);IB.P(g,x-3,y-25,6,2,P.m2);IB.O(g,x,y-30,4,3,P.y3);IB.O(g,x,y-30,2,2,P.y4);});
  prop('lamp_b',(g,x,y)=>{IB.P(g,x-1,y-24,2,24,P.m2);IB.P(g,x,y-26,6,2,P.m3);IB.P(g,x+6,y-24,2,4,P.m3);IB.P(g,x-2,y-26,3,2,P.gr2);});
  prop('barr',(g,x,y)=>{for(let i=0;i<3;i++){IB.P(g,x-10+i*2,y-4-i,18-i*2,2,i%2?P.r3:P.wht);}IB.P(g,x-11,y-2,22,3,P.a3);IB.P(g,x-8,y-9,2,8,P.a2);IB.P(g,x+7,y-9,2,8,P.a2);});
  prop('barrels',(g,x,y)=>{IB.O(g,x-4,y-4,4,3,P.ru1);IB.P(g,x-8,y-8,8,6,P.ru2);IB.O(g,x-4,y-8,4,2,P.ru1);IB.O(g,x+5,y-5,4,3,P.ol1);IB.P(g,x+1,y-9,8,6,P.ol2);IB.O(g,x+5,y-9,4,2,P.ol1);IB.P(g,x-4,y-8,1,6,P.gr2);IB.P(g,x+5,y-9,1,6,P.gr2);});
  prop('dumpster',(g,x,y)=>{IB.isoBox(g,x-11,y-10,22,10,9,P.g1,P.g2,P.ol1);IB.P(g,x-9,y-11,18,2,P.ol2);IB.P(g,x-10,y-6,1,5,P.a2);IB.P(g,x+9,y-6,1,5,P.a2);IB.P(g,x-12,y-2,24,1,P.d01);});
  prop('crate',(g,x,y)=>{IB.isoBox(g,x-8,y-7,16,8,7,P.b3,P.b2,P.b1);IB.P(g,x-7,y-6,14,1,P.b4);IB.P(g,x-6,y-3,12,1,P.b1);});
  prop('shelf',(g,x,y)=>{IB.P(g,x-9,y-16,18,16,P.b2);IB.P(g,x-8,y-15,16,1,P.b4);IB.P(g,x-8,y-10,16,1,P.b4);IB.P(g,x-8,y-5,16,1,P.b4);
    for(let i=0;i<4;i++){IB.P(g,x-7+i*4,y-14,2,3,[P.c4,P.g4,P.y3,P.rd3][i%4]);IB.P(g,x-6+i*4,y-9,2,3,[P.m4,P.wht,P.g5][i%3]);}});
  prop('fridge',(g,x,y)=>{IB.isoBox(g,x-6,y-6,12,6,12,P.gr4,P.gr3,P.gr2);IB.P(g,x-4,y-8,2,1,P.gr1);IB.P(g,x-1,y-8,2,1,P.gr1);IB.P(g,x+4,y-10,1,3,P.rd3);});
  prop('wreck1',(g,x,y)=>{IB.O(g,x,y-6,14,7,P.a1);IB.P(g,x-10,y-10,20,6,P.a2);IB.O(g,x,y-10,9,4,P.a1);IB.P(g,x-9,y-11,3,1,P.d01);IB.O(g,x-9,y-4,3,2,P.d02);IB.O(g,x+9,y-4,3,2,P.d02);IB.speck(g,x-9,y-11,18,7,P.ru1,10,2);IB.P(g,x-2,y-14,6,3,P.a1);});
  prop('wreck2',(g,x,y)=>{IB.O(g,x,y-6,12,6,P.d02);IB.P(g,x-9,y-9,18,5,P.a1);IB.O(g,x,y-9,7,3,P.d01);IB.O(g,x-8,y-4,3,2,P.d01);IB.O(g,x+8,y-4,3,2,P.d01);IB.P(g,x-1,y-13,5,2,P.a2);IB.speck(g,x-8,y-10,16,6,P.gr2,12,5);});
  prop('swing',(g,x,y)=>{IB.P(g,x-10,y-14,2,14,P.m2);IB.P(g,x+10,y-14,2,14,P.m2);IB.P(g,x-10,y-14,21,2,P.m3);IB.P(g,x-5,y-12,1,7,P.gr3);IB.P(g,x+4,y-12,1,7,P.gr3);IB.P(g,x-6,y-5,3,2,P.b3);IB.P(g,x+3,y-5,3,2,P.b3);IB.P(g,x-9,y-1,3,2,P.m2);IB.P(g,x+8,y-1,3,2,P.m2);});
  prop('slide',(g,x,y)=>{IB.P(g,x-8,y-14,2,14,P.m2);IB.P(g,x+2,y-14,2,10,P.m2);IB.P(g,x-8,y-16,12,2,P.u3);IB.PA(g,[[x+2,y-12],[x+12,y-2],[x+10,y-1],[x,y-11]],P.y3);IB.P(g,x+12,y-2,3,2,P.m2);});
  prop('kiosk',(g,x,y)=>{IB.isoBox(g,x-13,y-9,26,13,15,P.c3,P.c2,P.c1);IB.P(g,x-11,y-11,22,4,P.rd2);IB.P(g,x-8,y-3,7,6,P.wht);IB.P(g,x-7,y-2,5,4,P.d02);IB.P(g,x+8,y-1,1,3,P.a2);IB.P(g,x-12,y+3,24,1,P.d01);});
  prop('fountain',(g,x,y)=>{IB.O(g,x,y-6,13,7,P.c3);IB.O(g,x,y-6,10,5,P.w3);IB.O(g,x,y-6,5,3,P.w4);IB.P(g,x-1,y-12,3,6,P.c3);IB.O(g,x,y-14,3,2,P.w4);IB.O(g,x,y-15,2,1,P.wht);});
  prop('statue',(g,x,y)=>{IB.isoBox(g,x-6,y-5,12,6,4,P.gr3,P.gr2,P.gr1);IB.P(g,x-2,y-14,4,10,P.m3);IB.P(g,x-3,y-16,7,3,P.m4);IB.P(g,x-1,y-21,3,6,P.m3);IB.O(g,x,y-24,3,2,P.m2);});
  prop('sandbag',(g,x,y)=>{for(let i=0;i<3;i++)IB.O(g,x-8+i*7,y-3,5,3,P.sa1);for(let i=0;i<2;i++)IB.O(g,x-5+i*7,y-6,5,3,P.sa2);IB.O(g,x-1,y-9,5,3,P.sa1);IB.speck(g,x-10,y-10,20,7,P.sa3,10,4);});
  prop('pipe',(g,x,y)=>{IB.P(g,x-14,y-5,28,4,P.ru1);IB.P(g,x-14,y-5,28,1,P.ru2);IB.P(g,x-14,y-2,28,1,P.d01);IB.P(g,x-14,y-6,3,2,P.m2);IB.P(g,x+11,y-6,3,2,P.m2);});
  prop('tank',(g,x,y)=>{IB.isoBox(g,x-12,y-9,24,10,14,P.m2,P.m1,P.gr2);IB.O(g,x,y-9,12,5,P.m3);IB.O(g,x,y-9,8,3,P.m2);IB.P(g,x-12,y-3,24,1,P.ru1);});
  prop('chimney',(g,x,y)=>{IB.P(g,x-4,y-34,8,34,P.r2);IB.P(g,x-4,y-34,2,34,P.r3);IB.P(g,x-4,y-34,8,3,P.r1);IB.P(g,x-2,y-28,2,3,P.d01);IB.P(g,x+1,y-20,2,3,P.d01);IB.speck(g,x-4,y-34,8,32,P.d01,10,8);});
  prop('doorp',(g,x,y)=>{IB.P(g,x-5,y-14,10,14,P.b1);IB.P(g,x-4,y-13,8,13,P.d02);IB.P(g,x-2,y-8,4,7,P.y1);IB.P(g,x-5,y-15,10,1,P.gr2);});
  prop('stairs',(g,x,y)=>{IB.PA(g,[[x-8,y-2],[x+8,y-2],[x+4,y-12],[x-4,y-12]],P.d01);IB.P(g,x-4,y-11,8,1,P.gr2);IB.P(g,x-4,y-8,8,1,P.gr2);IB.P(g,x-4,y-5,8,1,P.gr2);IB.P(g,x-7,y-3,2,2,P.y3);IB.P(g,x+5,y-3,2,2,P.y3);});
  prop('cache',(g,x,y)=>{IB.isoBox(g,x-6,y-6,12,7,5,P.ol1,P.ol2,P.ol1);IB.P(g,x-3,y-8,6,3,P.y3);IB.P(g,x-2,y-9,1,1,P.y4);IB.P(g,x+2,y-9,1,1,P.y4);});
  prop('corpse',(g,x,y)=>{IB.O(g,x,y-3,9,4,P.zd2);IB.O(g,x+4,y-2,5,3,P.zd2);IB.P(g,x-6,y-5,8,3,P.ol1);IB.O(g,x+6,y-5,3,3,P.zd);IB.speck(g,x-8,y-6,16,6,P.rd1,8,3);});
  prop('fence',(g,x,y)=>{for(let i=-12;i<=12;i+=6){IB.P(g,i+x-1,y-9,2,9,P.m1);}IB.P(g,x-13,y-8,26,1,P.m2);IB.P(g,x-13,y-4,26,1,P.m2);IB.speck(g,x-12,y-9,24,9,P.ru1,6,2);});
  prop('wall_s',(g,x,y)=>{IB.P(g,x-14,y-10,28,10,P.gr2);IB.P(g,x-14,y-10,28,2,P.gr3);IB.speck(g,x-14,y-8,28,8,P.gr1,14,9);IB.P(g,x-14,y-1,28,1,P.d01);});
  prop('wall_m',(g,x,y)=>{IB.P(g,x-14,y-12,28,12,P.c4);IB.P(g,x-14,y-12,28,2,P.wht);IB.P(g,x-14,y-3,28,2,P.c3);IB.speck(g,x-14,y-10,28,9,P.c3,8,11);IB.P(g,x-14,y-1,28,1,P.d01);});
  prop('gate_m',(g,x,y)=>{IB.P(g,x-16,y-18,6,18,P.c4);IB.P(g,x+10,y-18,6,18,P.c4);IB.P(g,x-16,y-20,32,3,P.c3);IB.P(g,x-10,y-14,20,14,P.d02);IB.P(g,x-8,y-12,4,4,P.y3);IB.P(g,x+4,y-12,4,4,P.y3);IB.P(g,x-2,y-22,4,5,P.y3);IB.O(g,x,y-24,3,2,P.y4);IB.P(g,x-16,y-24,32,1,P.d01);});
  /* ВХІД У МЕТРО (поверхня): пілон з КРАСНИМ знаком-буквою М (як логотип КМЗ),
     сходи вниз з перилами, жовта підсвітка — видно здалеку */
  prop('metro_m',(g,x,y)=>{
    /* сходи вниз — темний прямокутний спуск */
    IB.PA(g,[[x-13,y-2],[x+13,y-2],[x+9,y+6],[x-9,y+6]],'#0e0e14');
    IB.P(g,x-11,y-1,22,1,P.gr1);IB.P(g,x-10,y+1,20,1,P.gr1);IB.P(g,x-9,y+3,18,1,P.gr1);
    IB.P(g,x-14,y-2,2,9,P.m2);IB.P(g,x+12,y-2,2,9,P.m2);            /* перила */
    /* пілон зі знаком М */
    IB.P(g,x-3,y-26,10,26,P.gr2);IB.P(g,x-3,y-26,2,26,P.gr3);IB.P(g,x-3,y-2,10,2,P.gr1);
    /* червона панель з білою М */
    IB.P(g,x-8,y-34,20,14,'#b84840');IB.P(g,x-8,y-34,20,2,'#cc6252');IB.P(g,x-8,y-22,20,2,'#7c2820');
    /* літера М — білі пікселі 5x7 */
    const mpts=[[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,1],[2,2],[3,1],[4,0],[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[2,3],[3,2],[4,3]];
    for(const p of mpts)IB.P(g,x-3+p[0],y-31+p[1],1,1,'#f4f4f8');
    /* лампа над входом — світлова пляма */
    IB.O(g,x+8,y-28,3,2,P.y3);IB.O(g,x+8,y-28,1.5,1,P.y4);
    IB.speck(g,x-8,y-34,20,34,P.ash2,6,5);
  });
  /* ЗНАК М В ПІДЗЕМЦІ: пілон з красним М + стрілка виходу */
  prop('metro_m2',(g,x,y)=>{
    IB.P(g,x-3,y-24,7,24,P.gr2);IB.P(g,x-3,y-24,2,24,P.gr3);
    IB.P(g,x-8,y-30,18,12,'#b84840');IB.P(g,x-8,y-30,18,2,'#cc6252');
    const mpts=[[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[1,1],[2,2],[3,1],[4,0],[5,0],[5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[2,3],[3,2],[4,3]];
    for(const p of mpts)IB.P(g,x-4+p[0],y-27+p[1],1,1,'#f4f4f8');
    IB.P(g,x+4,y-14,5,2,P.y3);IB.PA(g,[[x+8,y-16],[x+11,y-13],[x+8,y-10]],P.y3);  /* стрілка */
  });
  /* ЛАМПА ПІДЗЕМКИ: підвішений світильник з світловим конусом */
  prop('lamp_m',(g,x,y)=>{
    IB.P(g,x-1,y-30,2,3,P.d01);                                     /* кріплення до стелі */
    IB.P(g,x-4,y-27,8,3,P.gr2);IB.P(g,x-3,y-24,6,2,P.gr1);
    IB.O(g,x,y-22,4,2,P.y3);IB.O(g,x,y-22,2,1.2,P.y4);
    /* конус світла на підлогу */
    IB.PA(g,[[x-3,y-22],[x+3,y-22],[x+9,y-2],[x-9,y-2]],'rgba(240,188,66,0.10)');
    IB.PA(g,[[x-2,y-22],[x+2,y-22],[x+5,y-2],[x-5,y-2]],'rgba(240,188,66,0.13)');
  });
  prop('hydrant',(g,x,y)=>{IB.P(g,x-2,y-8,4,8,P.rd2);IB.O(g,x,y-9,3,2,P.rd3);IB.P(g,x-4,y-5,8,2,P.rd2);});
  /* БАТЧ 17: РАДІОСТАНЦІЯ БАЗИ ВВ13 — стіл з передавачем, зелений індикатор, антенка */
  prop('radio_post',(g,x,y)=>{
    IB.isoBox(g,x-10,y-6,20,10,8,P.b3,P.b2,P.b1);
    IB.P(g,x-8,y-14,16,8,P.gr1);IB.P(g,x-8,y-14,16,2,P.gr2);
    IB.O(g,x-4,y-11,2,2,'#3ce06a');IB.O(g,x+1,y-11,2,2,P.y3);
    IB.P(g,x-2,y-12,6,1,P.d01);
    IB.P(g,x+6,y-22,2,10,P.m3);IB.O(g,x+7,y-24,2,2,P.m2);
    IB.P(g,x-6,y-16,10,1,P.d02);
  });
  /* ---------------- БАТЧ 13: ІНТЕР'ЄРИ — стіни, двері, серверні, майстерні ---------------- */
  prop('intwall',(g,x,y)=>{
    IB.isoBox(g,x-16,y-8,32,16,26,'#b8ac96','#8a7e68','#9a8e78');
    IB.P(g,x-16,y+5,16,2,'#6e6250');IB.P(g,x,y+13,16,2,'#6e6250');
    IB.P(g,x-16,y-2,32,2,'#c4b8a2');
    for(let i=0;i<4;i++){IB.P(g,x-12+i*8,y-6,2,16,'rgba(140,120,96,0.35)');}
    IB.speck(g,x-16,y-4,32,24,P.ash2,6,3);
  });
  prop('intwall2',(g,x,y)=>{
    IB.isoBox(g,x-16,y-8,32,16,26,'#98a0a8','#6e767e','#7e868e');
    IB.P(g,x-16,y+5,16,2,'#5a6068');IB.P(g,x,y+13,16,2,'#5a6068');
    IB.P(g,x-10,y-16,8,10,'#4e565e');IB.P(g,x-9,y-15,6,8,'#8ec8d8');
    IB.P(g,x-9,y-15,6,1,'#a8d8e4');
  });
  prop('intwall3',(g,x,y)=>{
    IB.isoBox(g,x-16,y-8,32,16,26,'#8a8276','#5e5850','#6e685e');
    for(let i=0;i<3;i++){IB.P(g,x-14+i*10,y-4,9,7,'rgba(0,0,0,0.12)');}
    IB.P(g,x-16,y+6,16,1,'#4a463e');IB.P(g,x,y+14,16,1,'#4a463e');
    IB.speck(g,x-16,y-4,32,26,P.ru1,7,5);
  });
  prop('intdoor',(g,x,y)=>{
    IB.P(g,x-16,y-8,5,30,'#9a8e78');IB.P(g,x+11,y-8,5,30,'#9a8e78');
    IB.P(g,x-16,y-8,5,2,'#b0a490');IB.P(g,x+11,y-8,5,2,'#b0a490');
    IB.P(g,x-11,y-30,22,3,'#8a7e68');
    IB.P(g,x-2,y-27,4,1,P.y3);
  });
  prop('rack',(g,x,y)=>{
    IB.isoBox(g,x-7,y-4,14,8,22,'#2e3440','#22262e','#262a34');
    IB.P(g,x-6,y-24,12,2,'#3a4150');
    for(let r=0;r<5;r++){
      IB.P(g,x-6,y-21+r*4,12,3,'#1a1e26');
      IB.P(g,x-5,y-20+r*4,2,1,(r+1)%3?'#4ee06a':'#e0a03a');
      IB.P(g,x-2,y-20+r*4,1,1,'#38b8d8');
      IB.P(g,x+1,y-20+r*4,4,1,'#262c36');
    }
    IB.P(g,x-1,y-26,2,3,'#444c5a');
  });
  prop('bench_w',(g,x,y)=>{
    IB.isoBox(g,x-12,y-6,24,12,10,'#7a5a38','#5e462c','#6a5030');
    IB.isoBox(g,x-12,y-16,24,12,3,'#8a6a44','#6e5636','#7a5e3e');
    IB.P(g,x-8,y-18,4,2,'#444c5a');IB.P(g,x+2,y-19,6,2,'#444c5a');
    IB.P(g,x-4,y-21,3,4,'#c8ccd4');IB.P(g,x-3,y-25,5,4,'#e04a3a');
    IB.P(g,x+5,y-22,2,5,'#5a6a7a');IB.O(g,x+6,y-23,2,1,P.y3);
    IB.speck(g,x-12,y-16,24,12,P.ash1,5,7);
  });
  prop('wagon',(g,x,y)=>{
    IB.isoBox(g,x-28,y-16,56,32,26,'#8a92a0','#5e6470','#6e7684');
    IB.P(g,x-28,y+10,56,3,'#444c58');
    for(let i=0;i<3;i++){IB.P(g,x-22+i*18,y-24,10,8,'#2a303a');IB.P(g,x-21+i*18,y-23,8,6,'#9ab8cc');}
    IB.P(g,x-28,y-14,56,2,'#c43c30');IB.P(g,x-28,y-6,56,2,'#c43c30');
    IB.P(g,x+22,y-22,6,6,'#3a4150');
  });
  prop('busstop',(g,x,y)=>{IB.P(g,x-10,y-10,20,10,P.c4);IB.P(g,x-10,y-10,20,2,P.u3);IB.P(g,x-9,y-3,18,2,P.gr3);IB.P(g,x-10,y,20,1,P.gr2);IB.P(g,x-11,y-11,2,11,P.m2);IB.P(g,x+9,y-11,2,11,P.m2);IB.speck(g,x-8,y-7,16,4,P.c3,6,5);});
  prop('traff',(g,x,y)=>{IB.P(g,x-1,y-22,2,22,P.m2);IB.P(g,x-2,y-24,5,9,P.d02);IB.O(g,x,y-22,1.5,1.5,P.rd3);IB.O(g,x,y-19,1.5,1.5,P.y3);IB.O(g,x,y-16,1.5,1.5,P.g5);});
  prop('antenna',(g,x,y)=>{IB.P(g,x-1,y-18,1,18,P.m3);IB.P(g,x-5,y-14,10,1,P.m2);IB.P(g,x-3,y-11,7,1,P.m2);IB.P(g,x-6,y-18,2,2,P.rd3);});
  prop('vent',(g,x,y)=>{IB.isoBox(g,x-6,y-5,12,6,5,P.gr3,P.gr2,P.gr1);IB.speck(g,x-5,y-8,10,4,P.gr1,6,3);});
  prop('solar',(g,x,y)=>{IB.PA(g,[[x-9,y-4],[x,y-10],[x+9,y-4],[x,y+1]],P.u2);IB.P(g,x-6,y-5,5,2,P.u3);IB.P(g,x+1,y-7,5,2,P.u3);IB.P(g,x-1,y-2,3,2,P.m2);});
  prop('hole',(g,x,y)=>{IB.O(g,x,y-2,10,5,P.d01);IB.O(g,x-3,y-3,5,3,P.blk);IB.speck(g,x-8,y-4,16,4,P.gr1,6,7);});
  prop('cone',(g,x,y)=>{IB.PA(g,[[x-3,y],[x+3,y],[x,y-9]],P.or1);IB.P(g,x-2,y-3,4,1,P.wht);IB.P(g,x-4,y,8,1,P.rd2);});

  /* ---------------- BUILDING CATEGORIES ---------------- */
  function winFace(g,A,B,hh,cols,rows,dark,lit,seed,skip=0.2){
    for(let r=0;r<rows;r++)for(let c2=0;c2<cols;c2++){
      if(IB.hsh(c2,r,seed)<skip)continue;
      const u=(c2+0.15)/cols, uw=0.7/cols, v=(r+0.12)/rows, vh=0.62/rows;
      const ax=IB.lerp(A[0],B[0],u),ay=IB.lerp(A[1],B[1],u)+v*hh;
      const bx=IB.lerp(A[0],B[0],u+uw)-ax, by=IB.lerp(A[1],B[1],u+uw)-ay;
      const on=IB.hsh(c2,r,seed+9)<0.14;
      IB.PA(g,[[ax,ay],[ax+bx,ay+by],[ax+bx,ay+by+vh*hh],[ax,ay+vh*hh]],on?lit:dark);
      if(on)IB.PA(g,[[ax,ay],[ax+bx,ay+by],[ax+bx,ay+by+vh*hh*0.3],[ax,ay+vh*hh*0.3]],IB.shade(lit,-0.2));
    }
  }
  function bakeCat(name,wT,dT,hpx,fn){const W=(wT+dT)*16+4,H=(wT+dT)*8+hpx+8;const c=IB.mk(W,H);fn(c.g,wT,dT,hpx);SPR.cats[name]=c;}
  function bldShell(g,wT,dT,hpx,ct,cl,cr){
    const N=[2+dT*16,8],E=[2+(wT+dT)*16,8+wT*8],S=[2+wT*16,8+(wT+dT)*8],Wc=[2,8+dT*8];
    IB.PA(g,[Wc,S,[S[0],S[1]+hpx],[Wc[0],Wc[1]+hpx]],cl);
    IB.PA(g,[S,E,[E[0],E[1]+hpx],[S[0],S[1]+hpx]],cr);
    IB.PA(g,[N,E,S,Wc],ct);
    return {N,E,S,Wc};
  }
  function mkCat(name,wT,dT,hpx,cols,rows,ct,cl,cr,dark,lit,opt={}){
    bakeCat(name,wT,dT,hpx,(g)=>{
      const f=bldShell(g,wT,dT,hpx,ct,cl,cr);
      winFace(g,f.Wc,f.S,hpx-6,cols,rows,dark,lit,name.length*7+1,opt.skip);
      winFace(g,f.S,f.E,hpx-6,cols,rows,dark,lit,name.length*7+2,opt.skip);
      if(opt.cor)IB.PA(g,[f.Wc,f.S,f.E,[f.E[0],f.E[1]+3],[f.S[0],f.S[1]+5],[f.Wc[0],f.Wc[1]+3]],opt.cor);
      if(opt.roofTile){IB.PA(g,[f.N,f.E,f.S,f.Wc],opt.roofTile);IB.PA(g,[[f.N[0],f.N[1]+2],[f.E[0],f.E[1]+2],[f.S[0],f.S[1]+2],[f.Wc[0],f.Wc[1]+2]],IB.shade(opt.roofTile,0.15));}
      if(opt.vent)IB.isoBox(g,(f.N[0]+f.S[0])/2-4,f.N[1]+4,8,5,4,P.gr2,P.gr1,P.a3);
      if(opt.crack){g.strokeStyle=P.d01;g.beginPath();const cx=f.S[0]-6;g.moveTo(cx,f.S[1]+2);g.lineTo(cx+2,f.S[1]+10);g.lineTo(cx-2,f.S[1]+16);g.stroke();}
      IB.speck(g,0,0,64,64,opt.speck||P.d01,opt.spn||0,3);
    });
  }
  /* Житлові панельки та історичні будинки — розміри = footprint світу, висоти МАСШТАБНІ (Zombie City HD: всі вищі за героя 30px) */
  mkCat('khrus',1,1,56,3,4,P.c2,P.c3,P.c1,P.d02,P.y3,{cor:P.c4,vent:1});
  mkCat('khrus2',1,1,58,3,4,P.b4,P.c3,P.b3,P.d02,P.y3,{cor:P.c4,vent:1,skip:0.28});
  mkCat('panel9',2,2,144,4,11,P.c3,P.c2,P.c1,P.d02,P.y3,{cor:P.c4,vent:1});
  mkCat('panel9b',2,2,144,4,11,P.b4,P.c4,P.b3,P.d02,P.y3,{cor:P.c4,vent:1,skip:0.3});
  mkCat('hist2',1,1,42,2,3,P.r3,P.r4,P.r2,P.d02,P.y3,{roofTile:P.t2,skip:0.25});
  mkCat('hist3',2,1,50,3,4,P.b4,P.c4,P.b3,P.d02,P.y3,{roofTile:P.t1,cor:P.c4});
  mkCat('hist2b',1,1,42,2,3,P.sa2,P.sa3,P.sa1,P.d02,P.y3,{roofTile:P.t3,skip:0.25});
  mkCat('hist2c',1,1,42,2,3,P.g5,P.g6,P.g4,P.d02,P.y3,{roofTile:P.t2,skip:0.25});
  mkCat('admin3',3,2,84,5,7,P.c4,P.c3,P.c2,P.d02,P.y3,{cor:P.wht,skip:0.15});
  mkCat('admin4',3,2,120,5,10,P.c3,P.c4,P.c2,P.d02,P.y3,{cor:P.wht,skip:0.12});
  mkCat('shop1',1,1,40,2,3,P.r3,P.r4,P.r2,P.d02,P.y3,{roofTile:P.t3,skip:0.35});
  mkCat('shop2',1,1,44,2,3,P.u2,P.u3,P.u1,P.d02,P.y3,{roofTile:P.t2,skip:0.35});
  mkCat('factory',3,2,52,6,4,P.r2,P.r3,P.r1,P.d01,P.y2,{roofTile:P.a3,vent:1});
  mkCat('factory2',3,2,68,5,5,P.c2,P.c3,P.c1,P.d01,P.y2,{roofTile:P.a2,vent:1,crack:1});
  mkCat('garage',1,1,32,1,2,P.gr2,P.gr3,P.gr1,P.d01,P.y2,{roofTile:P.a3});
  mkCat('khrus_dmg',1,1,54,3,4,P.c2,P.c3,P.c1,P.d01,P.d02,{vent:1,crack:1,skip:0.55,spn:P.gr2,spn:12});
  mkCat('panel9_dmg',2,2,132,4,10,P.c3,P.c2,P.c1,P.d01,P.d02,{vent:1,crack:1,skip:0.6});
  mkCat('hist_ruin',1,1,26,2,2,P.a3,P.a4,P.a2,P.d01,P.d02,{roofTile:P.a1,crack:1,skip:0.8});
  /* дачі Ірпеня — великі (2x2), з двосхилими дахами, всі ВИЩІ за героя */
  mkCat('dacha1',2,2,52,3,3,P.b4,P.c4,P.b3,P.d02,P.y3,{roofTile:P.t2,skip:0.2});
  mkCat('dacha2',2,2,46,3,3,P.r3,P.r4,P.r2,P.d02,P.y3,{roofTile:P.t3,skip:0.22});
  mkCat('dacha3',2,2,58,4,3,P.g5,P.g6,P.g4,P.d02,P.y3,{roofTile:P.t1,skip:0.2});

  /* ---------------- ZOMBIES (Kenney palette) + контур ---------------- */
  /* темний контур навколо силуету — читабельність на дрібному маштабі */
  function outlineStamp(c){
    const s=IB.mk(c.width,c.height),sg=s.g;
    sg.drawImage(c,0,0);
    sg.globalCompositeOperation='source-in';
    sg.fillStyle=P.d01;
    sg.fillRect(0,0,c.width,c.height);
    sg.globalCompositeOperation='source-over';
    const out=IB.mk(c.width,c.height),og=out.g;
    og.drawImage(s,-1,0);og.drawImage(s,1,0);og.drawImage(s,0,-1);og.drawImage(s,0,1);
    og.drawImage(c,0,0);
    return out;
  }
  const ZT={
    walker:{c1:'#515566',c2:'#3a3e4c',skin:'#61cb8b',ex:0},
    runner:{c1:'#cf534f',c2:'#a83a38',skin:'#faae8a',ex:0},
    screamer:{c1:'#3c6cb8',c2:'#2a4a80',skin:'#c9d2e0',ex:0},
    brute:{c1:'#5a6a3a',c2:'#46552e',skin:'#61cb8b',ex:0},
    blind:{c1:'#666b80',c2:'#4a5060',skin:'#a8b0c4',ex:0},
    crawler:{c1:'#4a9a6e',c2:'#3f7a58',skin:'#61cb8b',ex:0},
    guardian:{c1:'#38383d',c2:'#2a2a30',skin:'#61cb8b',ex:1},
    alpha:{c1:'#8a2a3a',c2:'#661e2c',skin:'#cf534f',ex:1},
  };
  function zFront(g,type,ph){
    const T=ZT[type],big=type==='brute'||type==='alpha',low=type==='crawler';
    const cx=32,cy=56;
    if(low){ // crawler horizontal
      IB.O(g,cx,cy-3,9,3,T.c1);IB.O(g,cx-5,cy-5,4,3,T.c1);
      IB.O(g,cx+6,cy-5,4,3,IB.shade(T.c1,0.12));
      IB.O(g,cx+9,cy-6,3,3,T.skin);
      IB.P(g,cx+8,cy-7,1,1,P.rd3);IB.P(g,cx+11,cy-7,1,1,P.rd3);
      IB.P(g,cx-3,cy-1+(ph?1:0),2,2,T.c2);IB.P(g,cx+3,cy-1+(ph?0:1),2,2,T.c2);
      return;
    }
    /* людські пропорції, трохи менші за героя та горбаті: зріст 24-30px */
    const H=big?30:(type==='alpha'?28:(type==='guardian'?26:24));
    const bw=big?13:9;
    const legH=IB.M.round(H*0.34),torH=IB.M.round(H*0.38),headR=big?4:3;
    const legT=cy-legH,chest=legT-torH,headY=chest-headR*2;
    /* ноги — рвані штани, босі стопи */
    IB.P(g,cx-bw/2+1,legT+(ph?1:0),3,legH-(ph?1:0),T.c2);
    IB.P(g,cx+bw/2-3,legT+(ph?0:1),3,legH-(ph?0:1),IB.shade(T.c2,-0.18));
    IB.P(g,cx-bw/2+1,cy-2,3,2,P.d01);IB.P(g,cx+bw/2-3,cy-2,3,2,P.d01);
    /* торс — пошарпаний одяг з рваною кромкою */
    IB.P(g,cx-bw/2,chest,bw,torH-1,T.c1);
    IB.P(g,cx-bw/2,chest,2,torH-1,IB.shade(T.c1,-0.22));
    IB.P(g,cx+bw/2-2,chest+1,2,torH-2,IB.shade(T.c1,0.14));
    for(let i=0;i<bw;i+=2)IB.P(g,cx-bw/2+i,chest+torH-1-((i>>1)%2),2,2,IB.shade(T.c1,-0.3));
    /* дірки, бруд, кров */
    IB.P(g,cx-1,chest+3,2,2,IB.shade(T.c1,-0.45));
    IB.P(g,cx+bw/2-3,chest+5,1,2,P.rd1);
    IB.P(g,cx-2,chest+torH-4,1,2,P.rd1);
    IB.P(g,cx+2,chest+6,2,2,T.skin);          /* оголений шмат */
    /* руки тягнуться вперед */
    const ay=chest+2;
    IB.P(g,cx-bw/2-3,ay+(ph?1:0),4,3,T.c1);
    IB.P(g,cx+bw/2-1,ay+(ph?0:1),4,3,IB.shade(T.c1,-0.12));
    IB.O(g,cx-bw/2-4,ay+1+(ph?1:0),2,2,T.skin);
    IB.O(g,cx+bw/2+3,ay+1+(ph?0:1),2,2,T.skin);
    /* голова нахилена вперед */
    IB.O(g,cx+1,headY+2,headR,headR+1,T.skin);
    IB.P(g,cx-1,headY,5,2,IB.shade(T.skin,-0.3));
    IB.P(g,cx,headY+3,1,1,P.rd1);IB.P(g,cx+3,headY+4,1,1,P.rd1);
    if(type==='screamer'){IB.O(g,cx+2,headY+5,2,2,P.d01);}
    if(type==='blind'){IB.P(g,cx-1,headY+2,5,2,'#3a3e4c');}
    if(type==='guardian'){IB.P(g,cx-bw/2-2,chest,bw+4,3,P.y3);IB.P(g,cx,headY-2,2,5,P.y3);}
    if(type==='alpha'){IB.O(g,cx+1,headY-2,headR,2,P.rd2);IB.P(g,cx-1,headY+3,2,2,P.y4);IB.P(g,cx+3,headY+4,2,2,P.y4);}
    IB.speck(g,cx-bw/2,chest,bw,torH-3,P.rd1,big?5:2,4);
  }
  function zSide(g,type,ph,flip){
    const T=ZT[type],big=type==='brute'||type==='alpha';
    const cx=32,cy=56;
    if(type==='crawler'){
      IB.O(g,cx,cy-3,10,3,T.c1);IB.O(g,cx-6,cy-5,4,3,T.skin);
      IB.P(g,cx-7,cy-6,1,1,P.rd3);
      IB.P(g,cx+4,cy-1+(ph?1:0),3,2,T.c2);IB.P(g,cx-1,cy-1+(ph?0:1),3,2,T.c2);
      return;
    }
    const H=big?30:(type==='alpha'?28:(type==='guardian'?26:24));
    const legH=IB.M.round(H*0.34),torH=IB.M.round(H*0.38),headR=big?4:3;
    const legT=cy-legH,chest=legT-torH,headY=chest-headR*2;
    IB.P(g,cx-3,legT+(ph?1:0),3,legH-(ph?1:0),T.c2);
    IB.P(g,cx+1,legT+(ph?0:1),3,legH-(ph?0:1),IB.shade(T.c2,-0.18));
    IB.P(g,cx-3,cy-2,3,2,P.d01);IB.P(g,cx+1,cy-2,3,2,P.d01);
    IB.P(g,cx-4,chest,8,torH-1,T.c1);
    IB.P(g,cx-4,chest,2,torH-1,IB.shade(T.c1,-0.22));
    for(let i=0;i<8;i+=2)IB.P(g,cx-4+i,chest+torH-1-((i>>1)%2),2,2,IB.shade(T.c1,-0.3));
    IB.P(g,cx-1,chest+3,2,1,P.rd1);
    IB.P(g,cx+3,chest+2,5,3,T.c1);            /* руки вперед */
    IB.O(g,cx+8,chest+3,2,2,T.skin);
    IB.O(g,cx+1,headY+2,headR,headR+1,T.skin);
    IB.P(g,cx-1,headY,4,2,IB.shade(T.skin,-0.3));
    IB.P(g,cx+2,headY+3,1,1,P.rd1);
    if(type==='guardian'){IB.P(g,cx-5,chest,10,3,P.y3);IB.P(g,cx+2,headY-2,2,5,P.y3);}
    if(type==='alpha'){IB.O(g,cx+1,headY-2,headR,2,P.rd2);}
    if(flip){/* mirrored at draw time */}
  }
  for(const t in ZT){
    const f1=IB.mk(64,60),f2=IB.mk(64,60),s1=IB.mk(64,60),s2=IB.mk(64,60);
    zFront(f1.g,t,0);zFront(f2.g,t,1);zSide(s1.g,t,0);zSide(s2.g,t,1);
    SPR.zomb[t]={f:[outlineStamp(f1),outlineStamp(f2)],s:[outlineStamp(s1),outlineStamp(s2)]};
  }

  /* ---------------- PLAYER + NPC (постапок-виживенець) ---------------- */
  /* палітра виживенця: оливкова куртка, джинси, рюкзак */
  const HERO_PAL={J:'#66723e',Jd:'#4c5632',Jl:'#7e8e54',B:'#2a3e5c',Bd:'#1f2e48',SK:'#f0a482',HR:'#3e3220',BP:'#6e5636',BPd:'#54402a'};
  function mkPlayerFrame(dir,ph,mode,pal){
    const c=IB.mk(64,64),g=c.g;const cx=32,cy=58;
    pal=pal||HERO_PAL;
    const J=pal.J,Jd=pal.Jd,Jl=pal.Jl,B=pal.B,Bd=pal.Bd,SK=pal.SK||P.sk1,HR=pal.HR||P.b1,BP=pal.BP||P.b2,BPd=pal.BPd||P.b1;
    /* людські пропорції, зріст 30px: ноги 10 + тулуб 11 + голова 7 + волосся 2 */
    const legH=10,torH=11;
    const legT=cy-legH,chest=legT-torH,headY=chest-7;
    const step=ph&3;
    const lift=2, bob=(step===1||step===3)?1:0;
    const bt=chest+bob;                     /* торс підіймається у кроці */
    /* ноги — джинси + черевики, крок у 4 фазах */
    if(dir==='side'){
      const str=step===1?-2:(step===3?2:0);
      IB.P(g,cx-3+str,legT,4,legH,Bd);
      IB.P(g,cx+1-str,legT,3,legH-(str?1:0),B);
      IB.P(g,cx-3+str,cy-2,4,2,P.d01);
      IB.P(g,cx+1-str,cy-2,3,2,P.d01);
    }else{
      IB.P(g,cx-4,legT+(step===1?lift:0),4,legH-(step===1?lift:0),B);
      IB.P(g,cx+1,legT+(step===3?lift:0),4,legH-(step===3?lift:0),Bd);
      IB.P(g,cx-4,cy-2,4,2,P.d01);IB.P(g,cx+1,cy-2,4,2,P.d01);
      IB.P(g,cx-4,cy-2,4,1,IB.shade(P.d01,0.35));IB.P(g,cx+1,cy-2,4,1,IB.shade(P.d01,0.35));
    }
    /* торс — оливкова куртка: тінь, блиск, блискавка, комір, потертості */
    IB.P(g,cx-5,bt,10,torH,J);
    IB.P(g,cx-5,bt,3,torH,Jd);
    IB.P(g,cx+2,bt+1,3,torH-2,Jl);
    IB.P(g,cx-1,bt,1,torH-1,Jd);
    IB.P(g,cx-5,bt,10,2,Jd);
    IB.P(g,cx-4,bt+8,3,1,P.b1);IB.P(g,cx+2,bt+6,2,1,P.b1);
    /* голова + волосся (на людину схожа: чіткі риси) */
    IB.O(g,cx,headY+3+bob,4,4,SK);
    IB.P(g,cx-4,headY-1+bob,9,3,HR);
    IB.P(g,cx-4,headY-1+bob,9,1,IB.shade(HR,0.22));
    IB.P(g,cx-4,headY+2+bob,1,3,HR);IB.P(g,cx+3,headY+2+bob,1,3,HR);
    if(dir==='front'){IB.P(g,cx-2,headY+3+bob,1,1,P.d02);IB.P(g,cx+2,headY+3+bob,1,1,P.d02);IB.P(g,cx-1,headY+6+bob,3,1,IB.shade(SK,-0.3));}
    if(dir==='side'){IB.P(g,cx+1,headY+3+bob,1,1,P.d02);IB.P(g,cx+3,headY+5+bob,1,1,IB.shade(SK,-0.35));IB.P(g,cx,headY+6+bob,3,1,IB.shade(SK,-0.3));}
    if(dir==='back'){IB.P(g,cx-4,headY+1+bob,9,5,HR);IB.P(g,cx-4,headY+1+bob,9,1,IB.shade(HR,-0.2));}
    /* рюкзак */
    if(dir==='back'){
      IB.P(g,cx-4,bt+1,9,9,BP);IB.P(g,cx-4,bt+1,9,2,BPd);IB.P(g,cx-2,bt+6,5,3,P.gr2);
    } else if(dir==='side'){
      IB.P(g,cx-7,bt+1,3,8,BP);IB.P(g,cx-7,bt+1,3,2,BPd);
      IB.P(g,cx-2,bt+1,1,8,BPd);IB.P(g,cx+2,bt+1,1,8,BPd);
    } else {
      IB.P(g,cx-3,bt+1,2,7,BPd);IB.P(g,cx+2,bt+1,2,7,BPd);
    }
    /* руки */
    if(mode==='attack'){
      IB.P(g,cx+3,bt+1,4,4,Jl);
      g.strokeStyle=P.m4;g.lineWidth=2;g.beginPath();
      g.moveTo(cx+6,bt+2);g.lineTo(cx+14,bt-5);g.stroke();
      IB.P(g,cx+12,bt-7,4,3,P.m4);
      IB.P(g,cx-7,bt+4,3,7,Jd);
    } else if(mode==='gun'){
      /* ВИНТОВКА: дерев'яний приклад біля плеча, довга стволина вперед, дві руки */
      IB.P(g,cx+2,bt+5,4,3,P.b3);
      IB.P(g,cx+5,bt+3,7,2,P.b2);
      IB.P(g,cx+11,bt+3,8,2,P.d01);
      IB.P(g,cx+18,bt+2,2,1,P.d02);
      IB.P(g,cx+8,bt+5,3,3,P.gr3);
      IB.P(g,cx+3,bt+2,4,3,Jl);
      IB.P(g,cx-7,bt+3,3,6,Jd);
    } else {
      const armSw=step===1?1:(step===3?-1:0);
      if(dir==='side'){
        IB.P(g,cx+3+armSw*2,bt+3,3,7,Jl);
        IB.O(g,cx+5+armSw*2,bt+10,1.5,1.5,SK);
        IB.P(g,cx-6,bt+3,3,7,Jd);
      } else {
        IB.P(g,cx-7,bt+2+IB.M.max(0,armSw),3,8-IB.M.max(0,armSw),Jd);
        IB.P(g,cx+5,bt+2+IB.M.max(0,-armSw),3,8-IB.M.max(0,-armSw),Jl);
        IB.O(g,cx-5,bt+10+IB.M.max(0,armSw),1.5,1.5,SK);
        IB.O(g,cx+7,bt+10+IB.M.max(0,-armSw),1.5,1.5,SK);
      }
    }
    return outlineStamp(c);
  }
  ['F','B','R','L'].forEach(d=>{
    const dir=d==='F'?'front':d==='B'?'back':'side';
    const flip=d==='L';
    const f=[];
    for(let ph=0;ph<4;ph++){
      let c=mkPlayerFrame(dir,ph,'walk');f.push(c);
    }
    f.push(mkPlayerFrame(dir,0,'attack'));
    f.push(mkPlayerFrame(dir,0,'gun'));
    SPR.player[d]=f;
  });

  /* NPC-варіанти (роль -> палітра): торговка, медик, табір, вартовий, Ганя */
  const NPCPAL={
    trader:{J:'#a878e8',Jd:'#8a5ac4',Jl:'#c09af0',B:'#515566',Bd:'#3a3e4c',HR:'#38383d'},
    medic:{J:'#f4f4f8',Jd:'#c9d2e0',Jl:'#ffffff',B:'#3c6cb8',Bd:'#2a4a80',HR:'#b06041'},
    camp:{J:'#ff7e44',Jd:'#c95c30',Jl:'#ffa070',B:'#515566',Bd:'#3a3e4c',HR:'#4a3a24'},
    guard:{J:'#4a9a6e',Jd:'#3f7a58',Jl:'#6cc98e',B:'#38383d',Bd:'#2a2a30',HR:'#38383d'},
    trader2:{J:'#ffc044',Jd:'#c89428',Jl:'#ffd878',B:'#7a8a4a',Bd:'#5a6a3a',HR:'#38383d'},
    /* вцілілі герої (кричать HELP) — пошарпаний цивільний одяг */
    sv1:{J:'#8a6a52',Jd:'#6a4e3a',Jl:'#a88468',B:'#4a4438',Bd:'#36322a',HR:'#2e2a24'},
    sv2:{J:'#7a8ca0',Jd:'#5c6c80',Jl:'#98aabc',B:'#3e444e',Bd:'#2e323a',HR:'#5a3a22'},
    sv3:{J:'#a05a48',Jd:'#7e4438',Jl:'#bc7660',B:'#424a3e',Bd:'#323830',HR:'#38302a'},
  };
  SPR.npcs={};
  for(const role in NPCPAL){
    const f=[];
    for(let ph=0;ph<2;ph++)f.push(mkPlayerFrame('front',ph,'walk',NPCPAL[role]));
    SPR.npcs[role]=f;
  }

  /* ---------------- CARS — ДЕТАЛЬНІ (батч 10): реальний силует з СЕГМЕНТІВ ----------------
     Більше НЕ "плоскі прямокутники": кожне авто зібране з окремих блоків —
     низький капот, висока кабіна з похилим лобовим, багажник, арки коліс,
     бампери, решітка, фари-кластери, номерні плати, ручки, дзеркала, вихлоп,
     іржа/бруд. 6 моделей: седан, хетчбек, ліфтбек, таксі, позашляховик, пікап.
     Канвас 112x76, лінія землі y=46. */
  const CARS={
    vaz:  {name:'ВАЗ-2101',  body:'#d8d2c4', roof:'#efece2', lt:2.75, wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9,   cabH:10,  max:7.5, fuelUse:1.0, hp:90,  chrome:1},
    lanos:{name:'Lanos HB',  body:'#5c86c8', roof:'#7ba0dc', lt:2.7,  wt:1.15, cab:[-0.46,0.44], trunk:null,         bodyH:9,   cabH:10.5,max:8,   fuelUse:1.0, hp:85,  hatch:1},
    skoda:{name:'Skoda',     body:'#54b07c', roof:'#74cc9a', lt:2.9,  wt:1.15, cab:[-0.36,0.38], trunk:[-1.0,-0.36], bodyH:9.5, cabH:10.5,max:8.5, fuelUse:0.9, hp:95},
    taxi: {name:'Таксі',     body:'#e2b23a', roof:'#f0c454', lt:2.75, wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9,   cabH:10,  max:7.5, fuelUse:1.0, hp:90,  taxi:1},
    suv:  {name:'Позашляховик',body:'#5e6e50',roof:'#7c8c6c', lt:2.9,  wt:1.28, cab:[-0.62,0.26], trunk:null,         bodyH:11,  cabH:11,  max:6.8, fuelUse:1.3, hp:140, suv:1},
    truck:{name:'Пікап',     body:'#5e6472', roof:'#8a90a0', lt:3.4,  wt:1.2,  cab:[0.0,0.0],    trunk:null,         bodyH:11,  cabH:10,  max:6.5, fuelUse:1.4, hp:130, truck:1},
    /* БАТЧ 13: Kenney Car Kit — нові моделі міста */
    police:{name:'Поліція',  body:'#2e3e6e', roof:'#3e4e7e', lt:2.8,  wt:1.15, cab:[-0.30,0.42], trunk:[-1.0,-0.30], bodyH:9,   cabH:10,  max:8.5, fuelUse:1.0, hp:100, police:1},
    ambulance:{name:'Швидка',body:'#e8e8ec', roof:'#f4f4f8', lt:3.2,  wt:1.3,  cab:[-0.55,0.30], trunk:null,         bodyH:11,  cabH:10,  max:7.0, fuelUse:1.2, hp:120, amb:1},
    van:  {name:'Фургон',    body:'#c8b890', roof:'#d8caa4', lt:3.1,  wt:1.3,  cab:[-0.58,0.28], trunk:null,         bodyH:11,  cabH:11,  max:6.6, fuelUse:1.2, hp:110, van:1},
    delivery:{name:'Вантажівка',body:'#3e6e4e',roof:'#4e7e5e', lt:3.5,  wt:1.35, cab:[-0.62,0.24], trunk:null,         bodyH:12,  cabH:11,  max:6.2, fuelUse:1.5, hp:140, truck:1},
  };
  /* кольорові варіанти (Kenney рендери vaz_a/b, lanos_a/b, skoda_a/b) — ті самі ТТХ */
  for(const [base,vars] of [['vaz',['vaz_a','vaz_b']],['lanos',['lanos_a','lanos_b']],['skoda',['skoda_a','skoda_b']]])
    for(const v of vars)CARS[v]=Object.assign({},CARS[base],{name:CARS[base].name});
  const CAR_CW=112, CAR_CH=76, CAR_GY=46;    /* центр, лінія землі */
  SPR.CAR_ANCH=CAR_GY;
  function slab(g,C,A,B,z0,h,cols){
    const cr=(sa,sb)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]];
    const F1=cr(1,-1),F2=cr(1,1),R2=cr(-1,1),R1=cr(-1,-1);
    const up=p=>[p[0],p[1]-z0],dn=(p)=>[p[0],p[1]-z0+h];
    const faces=[
      {q:[up(F1),up(F2),dn(F2),dn(F1)],y:(F1[1]+F2[1])/2,c:cols[0]},   /* передня */
      {q:[up(F2),up(R2),dn(R2),dn(F2)],y:(F2[1]+R2[1])/2,c:cols[1]},   /* права */
      {q:[up(R2),up(R1),dn(R1),dn(R2)],y:(R2[1]+R1[1])/2,c:cols[2]},   /* задня */
      {q:[up(R1),up(F1),dn(F1),dn(R1)],y:(R1[1]+F1[1])/2,c:cols[3]},   /* ліва */
    ];
    faces.sort((a,b)=>a.y-b.y);
    for(const f of faces)IB.PA(g,f.q,f.c);
    IB.PA(g,[up(F1),up(F2),up(R2),up(R1)],cols[4]);
    return {F1,F2,R1,R2,up};
  }
  function mirrorCanvas(src){
    const c=IB.mk(src.width,src.height),g=c.g;
    g.translate(src.width,0);g.scale(-1,1);g.drawImage(src,0,0);
    return c;
  }
  /* СЕГМЕНТ кузова: slab у діапазоні s0..s1 (уздовж осі), висота h над z0 */
  function seg(g,C,A,B,s0,s1,z0,h,body,sh){
    const cc=[C[0]+A[0]*(s0+s1)/2,C[1]+A[1]*(s0+s1)/2];
    const aa=[A[0]*(s1-s0),A[1]*(s1-s0)];
    const bb=[B[0]*0.96,B[1]*0.96];
    slab(g,cc,aa,bb,z0,h,[sh[0],sh[1],sh[2],sh[1],IB.shade(body,0.14)]);
  }
  /* ---- БАТЧ 11: ОПУКЛІСТЬ — авто більше не квадратні ----
     1) дах-КУПОЛ: темна окантовка по периметру + світле ядро + спекулярний блик;
     2) вертикальний градієнт видимого борту (вигнуте крило: світло зверху, тінь знизу);
     3) світлий пояс по верхній кромці кузова (beltline);
     4) закруглена тінь-ромб (зрізані кути). */
  function roofDome(g,cr,s0,s1,zTop,roofC,wS){
    const dn=p=>[p[0],p[1]-zTop];
    IB.PA(g,[dn(cr(s0,-wS)),dn(cr(s1,-wS)),dn(cr(s1,wS)),dn(cr(s0,wS))],IB.shade(roofC,-0.30));
    IB.PA(g,[dn(cr(s0+0.10,-wS*0.66)),dn(cr(s1-0.10,-wS*0.66)),dn(cr(s1-0.10,wS*0.66)),dn(cr(s0+0.10,wS*0.66))],IB.shade(roofC,0.13));
    const mx=(s0+s1)/2;
    IB.PA(g,[dn(cr(mx-0.12,-wS*0.44)),dn(cr(mx+0.16,-wS*0.44)),dn(cr(mx+0.16,wS*0.08)),dn(cr(mx-0.12,wS*0.08))],IB.shade(roofC,0.36));
  }
  function flankShade(g,cr,s0,s1,hTop,visSd,bodyC){
    const p0=cr(s0,visSd),p1=cr(s1,visSd);
    const band=(f0,f1,c)=>IB.PA(g,[[p0[0],p0[1]-hTop*f0],[p1[0],p1[1]-hTop*f0],[p1[0],p1[1]-hTop*f1],[p0[0],p0[1]-hTop*f1]],c);
    band(0.0,0.30,IB.shade(bodyC,-0.12));
    band(0.30,0.68,IB.shade(bodyC,-0.32));
    band(0.68,0.88,IB.shade(bodyC,-0.50));
    band(0.88,1.0,IB.shade(bodyC,-0.68));
    IB.PA(g,[[p0[0],p0[1]-hTop],[p1[0],p1[1]-hTop],[p1[0],p1[1]-hTop+1.4],[p0[0],p0[1]-hTop+1.4]],IB.shade(bodyC,0.34));
  }
  function roundShadow(g,cr){
    const q=[[1,-0.84],[0.92,-1],[-0.92,-1],[-1,-0.84],[-1,0.84],[-0.92,1],[0.92,1],[1,0.84]].map(s=>cr(s[0],s[1]));
    g.fillStyle='rgba(8,10,16,0.38)';
    g.beginPath();g.moveTo(q[0][0],q[0][1]);for(let i=1;i<8;i++)g.lineTo(q[i][0],q[i][1]);g.closePath();g.fill();
  }
  function carCanvas(model,ne,damaged){
    const T=CARS[model];
    const c=IB.mk(CAR_CW,CAR_CH),g=c.g;
    const C=[CAR_CW/2,CAR_GY];
    const lt=T.lt,wt=T.wt;
    /* пів-вектори осі (A) та попереку (B) у екранних пікселях.
       NE: вісь (0,-1) → (16,-8)/тайл; поперек — світовий ±x → (±16,8).
       SE: вісь (1,0) → (16,8); поперек — світовий ±y → (∓16,8) */
    const A=[8*lt,ne?-4*lt:4*lt], B=ne?[8*wt,4*wt]:[-8*wt,4*wt];
    const cr=(sa,sb)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]];
    const body=damaged?IB.shade(T.body,-0.12):T.body;
    const GL=damaged?'#141820':(T.glass||'#42485a');
    const GL2=damaged?'#141820':(T.glass||'#565e74');
    const visSd=ne?1:-1;                        /* видимий бік (B-напрям) */
    const eEnd=ne?-1:1;                          /* видимий торець: для NE видно ТИЛ, для SE — НІС */
    /* закруглена тінь-ромб під авто (зрізані кути — м'який силует) */
    roundShadow(g,cr);
    /* колеса з дисками + АРКИ (темні пів-еліпси над колесами) */
    const wb=T.suv?0.60:0.62,ws=1.0;
    const wheel=(sa,sb)=>{const p=cr(sa,sb);IB.O(g,p[0],p[1]-2,4.4,3,P.d01);IB.O(g,p[0],p[1]-2,2.4,1.6,P.gr1);IB.O(g,p[0],p[1]-2,1,0.7,P.m3);};
    wheel(wb,-ws);wheel(wb,ws);wheel(-wb,-ws);wheel(-wb,ws);
    if(T.truck){wheel(-0.1,-ws);wheel(-0.1,ws);}
    /* ---- КУЗОВ ІЗ СЕГМЕНТІВ (силует!) ---- */
    const bh=T.bodyH;
    const s1d=IB.shade(body,-0.16),s2d=IB.shade(body,-0.34),s3d=IB.shade(body,-0.46),sh=[s1d,s2d,s3d];
    if(T.truck){
      /* ПІКАП: кабіна спереду (капот низький + салон) + вантажний кузов з ребрами */
      seg(g,C,A,B,0.28,1.0,0,bh*0.62,body,sh);                    /* капот */
      seg(g,C,A,B,-0.12,0.28,0,bh,body,sh);                        /* кабіна-база */
      /* кабіна-салон */
      const cabA=[A[0]*0.40,A[1]*0.40],cabC=[C[0]+A[0]*0.08,C[1]+A[1]*0.08],cabB=[B[0]*0.82,B[1]*0.82];
      slab(g,cabC,cabA,cabB,bh,T.cabH,[s1d,s2d,s3d,s2d,T.roof]);
      /* вантажний кузов: борта + темний вантаж + 3 ребра + тент-дуги */
      const bedA=[A[0]*0.78,A[1]*0.78],bedC=[C[0]-A[0]*0.11,C[1]-A[1]*0.11],bedB=[B[0],B[1]];
      const bedC2='#3e3226';
      seg(g,C,A,B,-1.0,-0.12,0,bh*0.88,body,sh);                   /* дно кузова */
      /* борта вище */
      const bw=3.4;
      slab(g,[bedC[0],bedC[1]],bedA,[bedB[0],bedB[1]],bh*0.88,bw,[s1d,s2d,s3d,s2d,IB.shade(body,-0.24)]);
      /* ОПУКЛІСТЬ пікапа (батч 11): вигнуті борти + купол даху кабіни */
      flankShade(g,cr,0.30,1.0,bh*0.62,visSd,body);
      flankShade(g,cr,-0.12,0.28,bh,visSd,body);
      flankShade(g,cr,-1.0,-0.12,bh*0.88,visSd,body);
      roofDome(g,cr,-0.10,0.24,bh+T.cabH,T.roof,0.70);
      /* ребра на видимому борту */
      for(let i=0;i<3;i++){
        const p0=cr(-0.24-i*0.22,visSd*0.97),p1=cr(-0.24-i*0.22,visSd*0.45);
        IB.P(g,IB.M.min(p0[0],p1[0]),IB.M.min(p0[1],p1[1])-bh*0.88,1,bw+1,IB.shade(body,-0.4));
      }
      /* темний вантаж над бортом */
      IB.PA(g,[cr(-0.9,visSd*0.5).map((v,i)=>i?v-bh*0.88-bw:v),cr(-0.15,visSd*0.5).map((v,i)=>i?v-bh*0.88-bw:v)],'#2c2419');
      /* дуги тенту */
      for(let i=0;i<3;i++){const p=cr(-0.32-i*0.26,0);IB.P(g,p[0]-1,p[1]-bh*0.88-bw-4,2,4,P.gr1);}
      /* вітрове скло кабіни пікапа — вузька смуга під дахом */
      const w0=cr(0.28,visSd*0.62),w1=cr(0.28,-visSd*0.62);
      IB.PA(g,[[w0[0],w0[1]-bh-T.cabH+3],[w1[0],w1[1]-bh-T.cabH+3],[w1[0],w1[1]-bh-3],[w0[0],w0[1]-bh-3]],GL);
      /* дзеркала */
      const m0=cr(0.28,visSd*0.82);
      IB.P(g,m0[0]+(ne?2:-2),m0[1]-bh-T.cabH+3,2,2,body);IB.P(g,m0[0]+(ne?3:-3),m0[1]-bh-T.cabH+2,1,1,P.gr4);
      /* решітка + фари на видимому торці (нос для SE) */
      const g0=cr(1.0,0);
      IB.P(g,g0[0]-3,g0[1]-bh*0.62+1,6,2,IB.shade(body,-0.5));
      const hl=cr(0.98,-0.5),hr=cr(0.98,0.5);
      IB.P(g,hl[0]-1,hl[1]-bh*0.62+2,3,2,P.y3);IB.P(g,hr[0]-1,hr[1]-bh*0.62+2,3,2,P.y3);
      /* задні ліхтарі + бампер */
      const rl=cr(-0.98,-0.55),rr=cr(-0.98,0.55);
      IB.P(g,rl[0]-1,rl[1]-bh*0.88+1,2,2,P.rd3);IB.P(g,rr[0]+1,rr[1]-bh*0.88+1,2,2,P.rd3);
    } else {
      /* ЛЕГКОВІ: багажник (низький) → база → капот (низький) → кабіна (висока) */
      const trunkS=T.trunk;
      if(trunkS)seg(g,C,A,B,trunkS[0],trunkS[1],0,bh*0.82,body,sh);
      const midS=trunkS?trunkS[1]:-1.0;
      seg(g,C,A,B,midS,T.cab[1],0,bh,body,sh);                     /* салонна база до лобового */
      seg(g,C,A,B,T.cab[1],1.0,0,bh*0.66,body,sh);                 /* низький капот */
      /* КАБІНА (висока, стоїть на базі) */
      const c0=T.cab[0],c1=T.cab[1];
      const cabA=[A[0]*(c1-c0-0.04),A[1]*(c1-c0-0.04)];
      const cabC=[C[0]+A[0]*(c0+c1)/2+A[0]*0.02,C[1]+A[1]*(c0+c1)/2+A[0>0?0:0]*0+A[1]*0.02];
      const cabB=[B[0]*0.8,B[1]*0.8];
      slab(g,cabC,cabA,cabB,bh,T.cabH,[s1d,s2d,s3d,s2d,T.roof]);
      /* ПОХИЛЕ ЛОБОВЕ СКЛО (батч 11): ШИРОКА похила площина від даху до капота */
      {
        const sW=c1;
        const t0=cr(sW-0.01,visSd*0.66),t1=cr(sW-0.01,-visSd*0.66);
        const b0=cr(IB.M.min(1,sW+0.24),visSd*0.56),b1=cr(IB.M.min(1,sW+0.24),-visSd*0.56);
        IB.PA(g,[[t0[0],t0[1]-bh-T.cabH+2],[t1[0],t1[1]-bh-T.cabH+2],[b0[0],b0[1]-bh*0.66+1],[b1[0],b1[1]-bh*0.66+1]],GL2);
        /* світлий відблиск на склі */
        IB.PA(g,[[t0[0]+(t1[0]-t0[0])*0.5,t0[1]-bh-T.cabH+2+(t1[1]-t0[1])*0.5],[t0[0]+(t1[0]-t0[0])*0.74,t0[1]-bh-T.cabH+2+(t1[1]-t0[1])*0.74],[b0[0],b0[1]-bh*0.66+1]],IB.shade(GL2,0.24));
      }
      /* ЗАДНЄ СКЛО: довша похила площина (або крута у хетчбека) */
      if(T.hatch){
        const r0=cr(c0+0.01,visSd*0.64),r1=cr(c0+0.01,-visSd*0.64);
        IB.PA(g,[[r0[0],r0[1]-bh-T.cabH+2],[r1[0],r1[1]-bh-T.cabH+2],[r0[0],r0[1]-bh+1],[r1[0],r1[1]-bh+1]],GL);
        const sp0=cr(c0-0.10,visSd*0.85),sp1=cr(c0-0.10,-visSd*0.85);
        IB.PA(g,[[sp0[0],sp0[1]-bh-1],[sp1[0],sp1[1]-bh-1],[sp1[0],sp1[1]-bh+1],[sp0[0],sp0[1]-bh+1]],IB.shade(body,-0.3));
      } else {
        const r0=cr(c0-0.01,visSd*0.62),r1=cr(c0-0.01,-visSd*0.62);
        const r2=cr(c0-0.16,visSd*0.60),r3=cr(c0-0.16,-visSd*0.60);
        IB.PA(g,[[r0[0],r0[1]-bh-T.cabH+2],[r1[0],r1[1]-bh-T.cabH+2],[r2[0],r2[1]-bh*0.82+1],[r3[0],r3[1]-bh*0.82+1]],GL);
      }
      /* БІЧНІ ВІКНА (батч 11): ВИСОКА смуга скла — салон читається як скло, не як плита */
      const wq=(sa0,sa1,sb)=>{
        const p0=cr(sa0,sb),p1=cr(sa1,sb);
        const wTop=p0[1]-bh-T.cabH+2.5, wBot=p0[1]-bh-2.5;
        IB.PA(g,[[p0[0],wTop],[p1[0],wTop],[p1[0],wBot],[p0[0],wBot]],IB.shade(body,-0.42));
        IB.PA(g,[[p0[0],wTop+1],[p1[0],wTop+1],[p1[0],wBot-0.5],[p0[0],wBot-0.5]],GL);
        /* світлий відблиск на склі */
        IB.PA(g,[[p0[0]+(p1[0]-p0[0])*0.58,wTop+1],[p0[0]+(p1[0]-p0[0])*0.78,wTop+1],[p0[0]+(p1[0]-p0[0])*0.78,wBot-0.5],[p0[0]+(p1[0]-p0[0])*0.58,wBot-0.5]],IB.shade(GL,0.24));
      };
      wq(c0+0.06,c1-0.08,visSd);
      wq(c0+0.10,c1-0.14,-visSd);
      /* стійка B між вікнами видимого борту (через смугу скла) */
      const pb=cr((c0+c1)/2,visSd);
      IB.P(g,pb[0],pb[1]-bh-T.cabH+2.5,1,T.cabH-5,IB.shade(body,-0.30));
      /* ---- ОПУКЛІСТЬ (батч 11): купол даху + вигнуті борти + світлий пояс ---- */
      if(trunkS)flankShade(g,cr,trunkS[0],trunkS[1],bh*0.82,visSd,body);
      flankShade(g,cr,midS,T.cab[1],bh,visSd,body);
      flankShade(g,cr,T.cab[1],0.985,bh*0.66,visSd,body);
      roofDome(g,cr,c0+0.06,c1-0.06,bh+T.cabH,T.roof,0.72);
      /* ---- ДЕТАЛІ ---- */
      /* бампери: передній/задній (світлий пластик) */
      seg(g,C,A,B,0.94,1.02,0.6,2.8,P.gr3,[IB.shade(P.gr3,-0.2),IB.shade(P.gr3,-0.35),IB.shade(P.gr3,-0.45)]);
      seg(g,C,A,B,-1.02,-0.94,0.6,2.8,P.gr3,[IB.shade(P.gr3,-0.2),IB.shade(P.gr3,-0.35),IB.shade(P.gr3,-0.45)]);
      /* РЕШІТКА + ФАРИ на видимому торці (SE — ніс, NE — тильна стор. не видно: малюємо зboth краще на обох) */
      {
        const ge=eEnd;
        const g0=cr(ge*0.985,0);
        IB.P(g,g0[0]-3,g0[1]-bh*0.66+1,6,2,IB.shade(body,-0.52));          /* решітка */
        IB.P(g,g0[0]-2,g0[1]-bh*0.66+1,1,2,IB.shade(body,-0.6));
        const h0=cr(ge*0.97,-0.52),h1=cr(ge*0.97,0.52);
        IB.P(g,h0[0]-1,h0[1]-bh*0.66+1,3,2,P.y3);IB.P(g,h0[0],h0[1]-bh*0.66+1,1,1,P.y4);
        IB.P(g,h1[0]-1,h1[1]-bh*0.66+1,3,2,P.y3);IB.P(g,h1[0],h1[1]-bh*0.66+1,1,1,P.y4);
        /* номерна плата спереду */
        IB.P(g,g0[0]-2,g0[1]-bh*0.66+4,5,2,P.wht);IB.P(g,g0[0]-1,g0[1]-bh*0.66+4,1,1,P.d02);IB.P(g,g0[0]+1,g0[1]-bh*0.66+4,1,1,P.d02);
        /* задні ліхтарі + плата ззаду */
        const r0=cr(-ge*0.985,-0.55),r1=cr(-ge*0.985,0.55);
        IB.P(g,r0[0]-1,r0[1]-bh*0.82+1,2,2,P.rd3);IB.P(g,r1[0]+1,r1[1]-bh*0.82+1,2,2,P.rd3);
        IB.P(g,IB.M.min(r0[0],r1[0]),IB.M.min(r0[1],r1[1])-bh*0.82+4,3,2,P.wht);
      }
      /* дзеркала на обох боках кабіни (прив'язані до кута кабіни B*0.8) */
      const m0=cr(c1,visSd*0.8),m1=cr(c1,-visSd*0.8);
      IB.P(g,m0[0]+(ne?2:-2),m0[1]-bh-T.cabH+2,2,2,body);IB.P(g,m0[0]+(ne?3:-3),m0[1]-bh-T.cabH+1,1,1,P.gr4);
      IB.P(g,m1[0]-(ne?2:-2),m1[1]-bh-T.cabH+2,2,2,IB.shade(body,-0.25));
      /* ручки дверей (видимий бік) — на поясі під вікнами */
      const d0=cr(c0+0.16,visSd),d1=cr((c0+c1)/2+0.10,visSd);
      IB.P(g,d0[0],d0[1]-bh-2,2,1,P.gr4);IB.P(g,d1[0],d1[1]-bh-2,2,1,P.gr4);
      /* дверна лінія (по низу кузова, через поріг) */
      const dl=cr(c0+0.04,visSd);
      IB.P(g,dl[0],dl[1]-bh-3,1,bh+1,IB.shade(body,-0.42));
      /* АРКИ КОЛІС: темні пів-еліпси над колесами видимого борту */
      for(const sa of[wb,-wb]){
        const p=cr(sa,visSd*ws);
        g.fillStyle=IB.shade(body,-0.5);
        g.beginPath();g.ellipse(p[0],p[1]-3,5,2.6,0,IB.M.PI,0);g.fill();
        /* опукле крило: світла дуга над аркою (батч 11) */
        g.strokeStyle=IB.shade(body,0.26);g.lineWidth=1;
        g.beginPath();g.ellipse(p[0],p[1]-3.4,4.5,2.0,0,IB.M.PI,IB.M.PI*1.85);g.stroke();
      }
      /* вихлоп + антенна */
      const ex=cr(-0.96,visSd*0.8);
      IB.P(g,ex[0]-1,ex[1]-1,3,1,P.gr1);
      const an=cr(-0.7,visSd*0.9);
      IB.P(g,an[0],an[1]-bh-6,1,6,P.m3);
      /* хром-молдинг (ВАЗ) */
      if(T.chrome){
        const cA=cr(0.9,visSd*0.99),cB=cr(-0.9,visSd*0.99);
        IB.P(g,IB.M.min(cA[0],cB[0]),IB.M.min(cA[1],cB[1])-bh*0.5,IB.M.abs(cA[0]-cB[0])+1,1,P.gr4);
      }
      /* ТАКСІ: шашлі по борту + знак на даху */
      if(T.taxi){
        for(let i=0;i<9;i++){
          const p=cr(0.85-i*0.22,visSd*0.99);
          IB.P(g,p[0]-1,p[1]-bh*0.5,2,2,i%2?'#1a1a20':'#f4f4f8');
        }
        const ts=cr((c0+c1)/2,0);
        IB.isoBox(g,ts[0]-3,ts[1]-bh-T.cabH-4,7,4,3,P.y3,P.y2,P.or1);
        IB.P(g,ts[0]-2,ts[1]-bh-T.cabH-3,5,1,P.d02);
      }
      /* ПОЗАШЛЯХОВИК: багажник на даху + запаска + силовий бампер */
      if(T.suv){
        const rk0=cr(c1-0.06,-0.5),rk1=cr(c0+0.06,-0.5),rk2=cr(c0+0.06,0.5),rk3=cr(c1-0.06,0.5);
        IB.PA(g,[[rk0[0],rk0[1]-bh-T.cabH],[rk1[0],rk1[1]-bh-T.cabH],[rk2[0],rk2[1]-bh-T.cabH],[rk3[0],rk3[1]-bh-T.cabH]],IB.shade(body,-0.4));
        IB.P(g,IB.M.min(rk0[0],rk1[0])-2,IB.M.min(rk0[1],rk1[1])-bh-T.cabH-1,IB.M.abs(rk0[0]-rk1[0])+5,1,P.m2);
        const spw=cr(-0.96,0);
        IB.O(g,spw[0],spw[1]-bh*0.6,3.4,3,P.d01);IB.O(g,spw[0],spw[1]-bh*0.6,1.8,1.6,P.gr2);IB.O(g,spw[0],spw[1]-bh*0.6,0.7,0.6,P.m3);
        const bb0=cr(1.0,-0.85),bb1=cr(1.0,0.85);
        IB.P(g,bb0[0]-1,bb0[1]-bh*0.66,2,3,P.m2);IB.P(g,bb1[0]-1,bb1[1]-bh*0.66,2,3,P.m2);
        IB.P(g,IB.M.min(bb0[0],bb1[0])-1,IB.M.min(bb0[1],bb1[1])-bh*0.66,IB.M.abs(bb0[0]-bb1[0])+3,1,P.m3);
      }
      /* відблиск даху */
      const rf0=cr(c1-0.08,-0.5),rf1=cr(c1-0.08,0.5),rb0=cr(c0+0.08,-0.5),rb1=cr(c0+0.08,0.5);
      IB.PA(g,[[rf0[0],rf0[1]-bh-T.cabH],[rf1[0],rf1[1]-bh-T.cabH],[rb1[0],rb1[1]-bh-T.cabH],[rb0[0],rb0[1]-bh-T.cabH]],IB.shade(T.roof,0.16));
    }
    /* бруд/іржа по низу + більше для битих */
    IB.speck(g,C[0]-A[0]-B[0],C[1]-bh+2,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,bh-2,P.ash2,7,7);
    if(damaged){
      IB.speck(g,C[0]-A[0]-B[0],C[1]-bh-T.cabH-2,IB.M.abs(A[0])*2+IB.M.abs(B[0])*2,bh+T.cabH+6,P.ru1,14,9);
      IB.P(g,C[0]-3,C[1]-bh-T.cabH-2,6,2,P.a1);
      IB.P(g,C[0]+7,C[1]-bh+3,4,2,P.gr1);
      IB.P(g,C[0]-10,C[1]-bh+5,3,2,P.a2);
    }
    return c;
  }
  for(const mdl in CARS){
    const ne=carCanvas(mdl,true,false),se=carCanvas(mdl,false,false);
    const ne_d=carCanvas(mdl,true,true),se_d=carCanvas(mdl,false,true);
    SPR.cars[mdl]={ne,se,nw:mirrorCanvas(ne),sw:mirrorCanvas(se),
      ne_d,se_d,nw_d:mirrorCanvas(ne_d),sw_d:mirrorCanvas(se_d)};
  }
  /* випалені рештки — теж великі, 4 напрями */
  (function(){
    function wreckCanvas(big){
      const c=IB.mk(CAR_CW,CAR_CH),g=c.g;
      const C=[CAR_CW/2,CAR_GY];
      const lt=big?3.3:2.75,wt=big?1.3:1.15;
      const ne=false; /* базова орієнтація SE */
      const A=[8*lt,4*lt],B=[-8*wt,4*wt];
      const cr=(sa,sb)=>[C[0]+sa*A[0]+sb*B[0],C[1]+sa*A[1]+sb*B[1]];
      g.fillStyle='rgba(8,10,16,0.4)';
      g.beginPath();g.moveTo(cr(1,-1)[0],cr(1,-1)[1]);g.lineTo(cr(1,1)[0],cr(1,1)[1]);g.lineTo(cr(-1,1)[0],cr(-1,1)[1]);g.lineTo(cr(-1,-1)[0],cr(-1,-1)[1]);g.closePath();g.fill();
      IB.O(g,cr(0.6,-0.95)[0],cr(0.6,-0.95)[1]-2,3.4,2.4,P.d01);IB.O(g,cr(0.6,0.95)[0],cr(0.6,0.95)[1]-2,3.4,2.4,P.d01);
      IB.O(g,cr(-0.6,-0.95)[0],cr(-0.6,-0.95)[1]-2,3.4,2.4,P.d01);IB.O(g,cr(-0.6,0.95)[0],cr(-0.6,0.95)[1]-2,3.4,2.4,P.d01);
      const h=big?12:9;
      slab(g,[C[0],C[1]-1],A,B,h,h,[P.a1,P.d02,P.d01,P.d02,P.a2]);
      /* обгорілий каркас салону */
      const ca=[A[0]*0.5,A[1]*0.5],cc=[C[0]-A[0]*0.15,C[1]-A[1]*0.15],cb=[B[0]*0.8,B[1]*0.8];
      slab(g,cc,ca,cb,h+5,5,[P.d02,P.d01,P.d01,P.d01,P.d02]);
      IB.speck(g,C[0]-A[0]-B[0],C[1]-A[1]-B[1]-h-8,Math.abs(A[0])*2+Math.abs(B[0])*2,h+14,P.ru1,16,7);
      IB.P(g,C[0]-1,C[1]-h-8,3,2,P.a2);
      return c;
    }
    const w1=wreckCanvas(false),w2=wreckCanvas(true);
    SPR.cars.wreck={ne:mirrorCanvas(w1),se:w1,nw:mirrorCanvas(w1),sw:w1};
    SPR.cars.wreck2={ne:mirrorCanvas(w2),se:w2,nw:mirrorCanvas(w2),sw:w2};
  })();

  /* ---------------- ITEMS ---------------- */
  const IT={
    food:{n:'Консерви',c:P.ol2,d:'+40 їжі'},water:{n:'Вода 0.5л',c:P.u3,d:'+45 води'},
    stew:{n:'Тушонка',c:P.b3,d:'+60 їжі'},energy:{n:'Енергетик',c:P.u2,d:'+40 витривалості'},
    mask:{n:'Протигаз',c:P.or1,d:'Одягнути: промзона без шкоди'},
    medkit:{n:'Аптечка',c:P.wht,d:'+55 HP'},bandage:{n:'Бинт',c:'#d8d0c0',d:'+25 HP'},
    pills:{n:'Знеболювальне',c:P.y4,d:'+15 HP, +10 ST'},
    ammo:{n:'Патрони 5.45',c:P.y3,d:'Винтовка СКС'},fuel:{n:'Каністра пального',c:P.rd2,d:'Пальне 40%'},
    parts:{n:'Запчастини',c:P.m3,d:'Ремонт'},battery:{n:'Батарейки',c:P.gr3,d:'Ліхтар'},
    alcohol:{n:'Спирт',c:P.c4,d:'Крафт'},cloth:{n:'Ганчірки',c:P.b4,d:'Крафт'},
    bottle:{n:'Пляшка',c:P.g5,d:'Крафт'},grenade:{n:'Граната РГД',c:P.g2,d:'Вибух'},
    radio_p:{n:'Підсилювач сигналу',c:P.y4,d:'Для вежі'},keycard:{n:'Ключ-картка',c:P.u3,d:'Доступ'},
    docs:{n:'Документи',c:P.b4,d:'Архіви'},pump_p:{n:'Частина насоса',c:P.m4,d:'Вода для табору'},
  };
  function itemIcon(fn){const c=IB.mk(24,22);fn(c.g,12,11);return c;}
  const ICD={
    food:g=>{IB.isoBox(g,4,4,12,6,5,P.ol2,P.ol1,P.ol2);IB.P(g,6,5,8,2,P.y3);IB.P(g,7,9,3,1,P.gr3);},
    stew:g=>{IB.isoBox(g,4,4,13,7,6,P.b3,P.b2,P.b1);IB.P(g,6,5,9,2,P.y4);IB.P(g,8,9,6,3,P.b4);IB.P(g,9,10,4,1,P.rd3);},
    energy:g=>{IB.P(g,8,3,7,13,P.u2);IB.P(g,9,2,5,2,P.m4);IB.P(g,9,5,2,8,P.u3);IB.P(g,8,12,7,3,P.u1);IB.P(g,10,6,4,2,P.y4);},
    mask:g=>{IB.O(g,12,12,6,5,P.or1);IB.O(g,12,12,3,2,P.d02);IB.P(g,5,6,3,2,P.gr3);IB.P(g,16,6,3,2,P.gr3);IB.P(g,7,7,2,4,P.gr4);IB.P(g,15,7,2,4,P.gr4);},
    water:g=>{IB.P(g,8,3,7,12,P.u2);IB.P(g,9,2,5,2,P.c4);IB.P(g,9,5,2,8,P.u3);IB.P(g,8,10,7,3,P.u1);},
    medkit:g=>{IB.isoBox(g,4,4,14,7,7,P.wht,P.c4,P.gr4);IB.P(g,9,5,4,7,P.rd3);IB.P(g,7,7,9,3,P.rd3);},
    bandage:g=>{IB.O(g,12,11,7,5,'#d8d0c0');IB.O(g,12,11,4,2,P.b4);IB.P(g,5,9,14,1,P.gr3);},
    pills:g=>{IB.P(g,7,5,10,10,P.y4);IB.P(g,8,6,8,3,P.d02);IB.P(g,9,10,2,3,P.wht);IB.P(g,13,10,2,3,P.wht);},
    ammo:g=>{IB.isoBox(g,5,4,12,6,5,P.g2,P.g3,P.g1);IB.P(g,7,6,3,3,P.y3);IB.P(g,12,6,3,3,P.y3);},
    fuel:g=>{IB.P(g,6,4,11,12,P.rd2);IB.P(g,8,3,4,2,P.rd3);IB.P(g,7,6,9,1,P.y4);IB.P(g,9,8,5,5,P.wht);},
    parts:g=>{IB.O(g,9,10,4,4,P.m3);IB.O(g,9,10,2,2,P.d02);IB.P(g,13,4,4,8,P.m2);IB.P(g,11,4,8,2,P.m4);},
    battery:g=>{IB.P(g,7,5,4,11,P.gr3);IB.P(g,13,5,4,11,P.gr2);IB.P(g,7,4,4,2,P.m4);IB.P(g,13,4,4,2,P.m4);},
    alcohol:g=>{IB.P(g,8,4,8,13,P.c4);IB.P(g,9,2,6,3,P.gr4);IB.P(g,9,7,6,6,P.wht);},
    cloth:g=>{IB.PA(g,[[5,6],[17,5],[19,12],[7,14]],P.b4);IB.P(g,8,8,6,1,P.b3);IB.P(g,10,11,6,1,P.b3);},
    bottle:g=>{IB.P(g,9,5,6,12,P.g5);IB.P(g,10,3,4,3,P.g6);IB.P(g,10,8,2,7,P.g4);},
    grenade:g=>{IB.O(g,12,12,5,5,P.g2);IB.P(g,10,4,4,4,P.m3);IB.P(g,13,6,5,2,P.gr3);IB.O(g,9,7,2,2,P.m2);},
    radio_p:g=>{IB.P(g,5,8,14,7,P.gr3);IB.P(g,7,4,2,5,P.m4);IB.P(g,11,3,2,6,P.m2);IB.O(g,15,10,2,2,P.rd3);IB.P(g,6,9,3,2,P.y3);},
    keycard:g=>{IB.P(g,6,6,12,9,P.u3);IB.P(g,7,7,10,3,P.u2);IB.P(g,8,11,5,2,P.y4);},
    docs:g=>{IB.P(g,6,4,12,13,P.b4);IB.P(g,7,5,10,2,P.b3);IB.P(g,7,9,10,1,P.gr1);IB.P(g,7,12,8,1,P.gr1);},
    pump_p:g=>{IB.O(g,12,11,6,6,P.m4);IB.O(g,12,11,3,3,P.m2);IB.P(g,6,6,4,4,P.gr3);IB.P(g,14,3,3,5,P.m3);},
  };
  for(const id in IT){SPR.items[id]={c:itemIcon(ICD[id]),d:IT[id]};}
  SPR.itemsDB=IT;

  /* ---------------- HUD ICONS ---------------- */
  SPR.icons.machete=(()=>{const c=IB.mk(26,22),g=c.g;g.strokeStyle=P.gr4;g.lineWidth=2;g.beginPath();g.moveTo(5,17);g.lineTo(13,10);g.stroke();g.strokeStyle=P.m4;g.beginPath();g.moveTo(13,10);g.lineTo(21,4);g.stroke();IB.P(g,4,16,4,3,P.b3);return c;})();
  SPR.icons.rifle=(()=>{const c=IB.mk(26,22),g=c.g;
    IB.P(g,3,13,5,4,P.b3);            /* приклад */
    IB.P(g,7,11,9,3,P.b2);            /* ців'я */
    IB.P(g,15,10,9,2,P.d01);          /* ствол */
    IB.P(g,23,9,2,2,P.d02);           /* мушка */
    IB.P(g,11,13,3,4,P.gr3);          /* магазин */
    IB.P(g,6,9,2,4,P.b4);             /* приціл */
    return c;})();
  SPR.icons.pistol=SPR.icons.rifle;   /* слот 2 — винтовка */
  SPR.icons.medkit=SPR.items.medkit.c;
  SPR.icons.grenade=SPR.items.grenade.c;
  SPR.face=(()=>{const c=IB.mk(46,46),g=c.g;
    IB.P(g,0,0,46,46,P.d02);
    IB.P(g,8,8,30,36,P.sk1);
    IB.P(g,8,8,30,10,P.b2);IB.P(g,8,6,30,4,P.b3);IB.P(g,6,10,3,14,P.b2);IB.P(g,37,10,3,14,P.b2);
    IB.P(g,14,22,5,4,P.wht);IB.P(g,27,22,5,4,P.wht);IB.P(g,16,23,2,3,P.u1);IB.P(g,29,23,2,3,P.u1);
    IB.P(g,18,32,10,2,P.sk3);IB.P(g,21,36,4,2,P.sk2);
    IB.speck(g,10,34,26,8,P.sk3,10,2);
    IB.P(g,0,40,46,6,P.ol2);IB.P(g,0,40,46,1,P.ol1);
    return c;})();

  /* ================================================================
     БАТЧ 14: НОВІ БУДІВЛІ (код-рендер у стилі Kenney: SW-стіна СВІТЛА, SE — ТІНЬ,
     конвенція канваса як у build_assets: низ = південний кут footprint),
     ВЕЛИКІ ДЕРЕВА (дуб/береза/тополЯ/смерека/яблуня), АЗС, ВИВІСКИ, ГРАФІТІ
     ================================================================ */
  function cat(name,wT,dT,hpx,fn){
    const W2=(wT+dT)*16+4,H2=(wT+dT)*8+hpx+8;
    const c=IB.mk(W2,H2),g=c.g;
    const f={wT,dT,hpx,
      N:[2+dT*16,8+hpx],E:[2+(wT+dT)*16,8+wT*8+hpx],S:[2+wT*16,8+(wT+dT)*8+hpx],Wc:[2,8+dT*8+hpx]};
    f.up=(p,dy)=>[p[0],p[1]-dy];
    fn(g,f);
    SPR.cats[name]=c;SPR.cats[name+'_0']=c;
  }
  function catShell(g,f,ct,cl,cr){   /* корпус: SW світла, SE тінь, дах */
    IB.PA(g,[f.Wc,f.S,f.up(f.S,f.hpx),f.up(f.Wc,f.hpx)],cl);
    IB.PA(g,[f.S,f.E,f.up(f.E,f.hpx),f.up(f.S,f.hpx)],cr);
    IB.PA(g,[f.up(f.N,f.hpx),f.up(f.E,f.hpx),f.up(f.S,f.hpx),f.up(f.Wc,f.hpx)],ct);
    /* вертикальні кути-кромки */
    IB.P(g,f.Wc[0],f.Wc[1]-f.hpx,1,f.hpx,IB.shade(cl,-0.38));
    IB.P(g,f.S[0]-1,f.S[1]-f.hpx,1,f.hpx,IB.shade(cl,-0.30));
    IB.P(g,f.E[0]-1,f.E[1]-f.hpx,1,f.hpx,IB.shade(cr,-0.42));
    IB.P(g,f.S[0]-1,f.S[1]-f.hpx,1,2,IB.shade(cl,0.30));   /* світлий пояс під дахом */
  }
  function para(g,x0,y0,len,sl,dy,c){   /* похила смуга, слідує ізосклону 0.5 */
    IB.PA(g,[[x0,y0],[x0+len,y0+sl*len],[x0+len,y0+sl*len+dy],[x0,y0+dy]],c);
  }
  function catWin(g,x0,y0,len,h,cols,rows,seed,o){
    o=o||{};
    const cw=(len-4)/cols,rh=(h-6)/rows;
    for(let r=0;r<rows;r++)for(let c2=0;c2<cols;c2++){
      if(IB.hsh(c2,r,seed)<(o.skip||0.16))continue;
      const wx=x0+2+cw*c2+IB.M.max(0.5,(cw-4)/2);
      const wy=y0+(o.sl||0.5)*(wx-x0)+3+rh*r;
      const ww=IB.M.max(2,cw-3),wh=IB.M.max(2,rh-2.5);
      const on=IB.hsh(c2,r,seed+7)<(o.lit||0.09);
      IB.P(g,wx,wy,ww,wh,on?'#e8c860':(o.glass||'#3a4250'));
      IB.P(g,wx,wy+wh-1,ww,1,'#161e28');
      if(o.frame){IB.P(g,wx-1,wy-1,ww+2,1,o.frame);IB.P(g,wx-1,wy+wh,ww+2,1,o.frame);}
    }
  }
  function roofStuff(g,f,seed){
    const cx=2+(f.wT+f.dT)*8,cy=8+(f.wT+f.dT)*4;
    for(let i=0;i<3;i++){
      const ox=(IB.hsh(i,seed,1)-0.5)*f.wT*10,oy=(IB.hsh(i,seed,2)-0.5)*f.dT*5;
      IB.isoBox(g,cx+ox-5,cy+oy-3,10,6,5,P.gr2,P.gr3,P.gr1);
      IB.speck(g,cx+ox-6,cy+oy-10,12,12,P.rust1,4,seed+i);
    }
    IB.speck(g,2,8,(f.wT+f.dT)*16,(f.wT+f.dT)*8,P.ash2,12,seed+9);
  }
  /* ---- ТРОЄЩИНА: КОЛОРИТНІ ПАНЕЛЬНІ БАШТИ (жовто-синьо-цегляні пояси) ---- */
  cat('panel_c1',3,3,224,(g,f)=>{
    catShell(g,f,'#b0a890','#c9c4b2','#96928a');
    const bands=['#4e7ec8','#d8a834','#c85a3c','#4e8e68'];
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      for(let r=0;r<10;r++)para(g,x0+1,y0+3+22*r,len-2,0.5,3,bands[(r+fi)%4]);
      catWin(g,x0,y0,len,f.hpx,4,10,301+fi*5,{frame:'#f0ece0',glass:'#38445c'});
      IB.speck(g,x0,y0,len,f.hpx,P.ash2,10,320+fi);
    }
    roofStuff(g,f,311);
  });
  cat('panel_c2',3,3,232,(g,f)=>{
    catShell(g,f,'#8a9288','#b8c0b4','#8a9288');
    const bands=['#e07838','#3e8ea8','#d8c060','#c85a3c'];
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      for(let r=0;r<11;r++)para(g,x0+1,y0+3+21*r,len-2,0.5,3,bands[(r*2+fi)%4]);
      catWin(g,x0,y0,len,f.hpx,4,11,341+fi*5,{frame:'#e4e8dc',glass:'#2e3e50'});
      IB.speck(g,x0,y0,len,f.hpx,P.ash1,12,350+fi);
    }
    roofStuff(g,f,351);
  });
  cat('panel_c3',4,3,248,(g,f)=>{
    catShell(g,f,'#9a7a68','#d0b09a','#9a7a68');
    const bands=['#5c78a4','#d8a834','#a84848','#4e8e68','#e07838'];
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      for(let r=0;r<12;r++)para(g,x0+1,y0+3+20*r,len-2,0.5,3,bands[(r+fi*2)%5]);
      catWin(g,x0,y0,len,f.hpx,5,12,371+fi*5,{frame:'#e8e2d4',glass:'#33415a'});
      IB.speck(g,x0,y0,len,f.hpx,P.ash2,14,380+fi);
      if(fi===0){ /* під'їзд */
        const cx2=x0+len/2,yb=y0+0.5*(cx2-x0)+f.hpx;
        IB.PA(g,[[cx2-5,yb-26],[cx2+5,yb-26+2],[cx2+5,yb+2],[cx2-5,yb]],'#26221e');
        IB.P(g,cx2-3,yb-22,2,3,P.y3);
      }
    }
    roofStuff(g,f,381);
  });
  /* ---- НОВОБУДОВА: скляна башта (вища за все місто) ---- */
  cat('tower_g',3,3,264,(g,f)=>{
    catShell(g,f,'#3e4856','#5a6474','#4a5464');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,4,13,401+fi*5,{skip:0.06,lit:0.16,glass:'#2e3a4e',frame:'#8a94a4'});
      for(let yy=18;yy<f.hpx;yy+=20)para(g,x0+1,y0+yy,len-2,0.5,1,'#7a8494');
      IB.speck(g,x0,y0,len,f.hpx,P.ash1,10,420+fi);
    }
    const cx=2+(f.wT+f.dT)*8,cy=8+(f.wT+f.dT)*4;
    IB.P(g,cx-1,cy-24,2,22,P.gr2);IB.P(g,cx-1,cy-26,2,3,'#e04a3a');
    roofStuff(g,f,421);
  });
  /* ---- СУПЕРМАРКЕТ FN< — довга низька коробка, червона смуга, вітрини ---- */
  cat('fnmarket',5,3,92,(g,f)=>{
    catShell(g,f,'#a8a498','#dcd8cc','#a8a498');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      para(g,x0,y0+24,len,0.5,18,'#3a4858');
      for(let i=0;i<len-8;i+=8){const wx=x0+4+i,wy=y0+24+0.5*4+0.5*i;
        IB.P(g,wx,wy+1,6,16,'#5c78a4');IB.P(g,wx,wy+14,6,3,'#2a3646');IB.P(g,wx,wy+1,6,1,'#7c98c4');}
      para(g,x0,y0+8,len,0.5,12,'#c8342c');
      para(g,x0,y0+8,len,0.5,3,'#e05044');
      para(g,x0,y0+20,len,0.5,2,'#8a201c');
      IB.P(g,x0,y0,1,f.hpx,'#8a867a');
      IB.P(g,Math.round(x0+len),Math.round(y0+0.5*len),1,f.hpx-Math.round(0.5*len),'#787468');
      IB.speck(g,x0,y0+22,len,f.hpx-22,P.ash2,8,430+fi);
    }
    /* напис FN< на довгому фасаді */
    g.font='bold 12px monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle='#8a201c';g.fillText('FN<',f.Wc[0]+f.wT*8+1,f.Wc[1]-f.hpx+13.5);
    g.fillStyle='#f8f8f4';g.fillText('FN<',f.Wc[0]+f.wT*8,f.Wc[1]-f.hpx+12.5);
    /* вхід з підсвіткою */
    const cx2=f.Wc[0]+f.wT*16*0.72,yb=f.Wc[1]-f.hpx+0.5*(cx2-f.Wc[0])+f.hpx;
    IB.PA(g,[[cx2-6,yb-26],[cx2+6,yb-26+3],[cx2+6,yb+3],[cx2-6,yb]],'#26221e');
    IB.P(g,cx2-4,yb-24,8,2,P.y3);
    roofStuff(g,f,431);
  });
  /* ---- СЕЛИЩНІ БУДИНОКИ ІРПІНЯ: цегла + черепиця ---- */
  cat('vill1',3,2,92,(g,f)=>{
    catShell(g,f,'#a05a40','#b8906a','#96745a');
    const N2=f.up(f.N,f.hpx),E2=f.up(f.E,f.hpx),S2=f.up(f.S,f.hpx),W2=f.up(f.Wc,f.hpx);
    /* черепиця: ряди на схилах даху */
    for(let i=1;i<6;i++){para(g,W2[0],W2[1]+i*4,(E2[0]-W2[0]),((S2[1]-W2[1])/((S2[0]-W2[0])||1)),1,'#8a4a34');}
    IB.PA(g,[[W2[0],W2[1]],[E2[0],E2[1]],[E2[0],E2[1]+2],[W2[0],W2[1]+2]],'#7c3e2a');
    IB.isoBox(g,N2[0]+f.wT*6,N2[1]+6,7,5,10,P.r2,P.r3,P.r1);
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,3,2,441+fi*5,{frame:'#e8e0d0',glass:'#4a4038',lit:0.2});
      IB.speck(g,x0,y0,len,f.hpx,'#8a6a50',12,450+fi);
      if(fi===0){const cx2=x0+len*0.5,yb=y0+0.5*(cx2-x0)+f.hpx;
        IB.PA(g,[[cx2-4,yb-24],[cx2+4,yb-24+2],[cx2+4,yb+2],[cx2-4,yb]],'#3a2c20');
        IB.P(g,cx2-2,yb-20,2,2,P.y3);}
    }
  });
  cat('vill2',2,2,78,(g,f)=>{
    catShell(g,f,'#7a5238','#c8b898','#a89878');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,2,2,461+fi*5,{frame:'#f0e8d8',glass:'#3e3630',lit:0.18});
      IB.speck(g,x0,y0,len,f.hpx,P.ash2,8,470+fi);
    }
    roofStuff(g,f,471);
  });

  /* ================================================================
     БАТЧ 16: БУДІВЛІ НОВИХ РАЙОНІВ КИЇВСЬКОЇ ОБЛАСТІ — кожен район має
     ВЛАСНИЙ КОЛІР і ТИП, щоб одразу було видно, що ти в іншому місці:
     МОЩУН — темні дерев'яні хати лісового села (мох на даху),
     БУЧА — світлі котеджі новобудови з теракотовим дахом,
     ВИШГОРОД — бежево-жовті панельки, БРОВАРИ — сині та зелені панельки.
     ================================================================ */
  /* --- ДЕРЕВ'ЯНА ХАТА (Мощун): темні стіни, сіро-зелений моховий дах --- */
  cat('wood1',2,2,64,(g,f)=>{
    catShell(g,f,'#4e463c','#5c4a38','#473426');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,2,1,481+fi*5,{frame:'#3a3226',glass:'#2a241c',lit:0.14});
      IB.speck(g,x0,y0,len,f.hpx,'#3a3024',10,486+fi);
    }
    /* мох на даху */
    const N2=f.up(f.N,f.hpx),E2=f.up(f.E,f.hpx),S2=f.up(f.S,f.hpx),W2=f.up(f.Wc,f.hpx);
    for(let i=1;i<5;i++){para(g,W2[0],W2[1]+i*4,(E2[0]-W2[0]),((S2[1]-W2[1])/((S2[0]-W2[0])||1)),1,'#4a5e3e');}
    IB.PA(g,[[W2[0],W2[1]],[E2[0],E2[1]],[E2[0],E2[1]+2],[W2[0],W2[1]+2]],'#3a4a2e');
    /* труба з каменю */
    IB.isoBox(g,N2[0]+f.wT*4,N2[1]+8,5,4,8,P.r2,P.r3,P.r1);
  });
  cat('wood2',2,2,60,(g,f)=>{
    catShell(g,f,'#6a5636','#8a7250','#6e5a3c');
    /* пофарбована дерев'яна хата: вохристі стіни, дошки */
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      for(let yy=6;yy<f.hpx-4;yy+=7)IB.P(g,x0+1,y0+yy,len-2,1,'#5a4628');
      catWin(g,x0,y0,len,f.hpx,2,1,491+fi*5,{frame:'#2e2618',glass:'#3a3028',lit:0.16});
      IB.speck(g,x0,y0,len,f.hpx,'#4e3e28',8,496+fi);
    }
    const N2=f.up(f.N,f.hpx),E2=f.up(f.E,f.hpx),S2=f.up(f.S,f.hpx),W2=f.up(f.Wc,f.hpx);
    for(let i=1;i<5;i++){para(g,W2[0],W2[1]+i*4,(E2[0]-W2[0]),((S2[1]-W2[1])/((S2[0]-W2[0])||1)),1,'#7c8288');}
    IB.PA(g,[[W2[0],W2[1]],[E2[0],E2[1]],[E2[0],E2[1]+2],[W2[0],W2[1]+2]],'#6a7078');
    roofStuff(g,f,501);
  });
  /* --- КОТЕДЖ НОВОБУДОВИ (Буча): світлий фасад, теракотовий дах --- */
  cat('cottage_b',2,2,88,(g,f)=>{
    catShell(g,f,'#c07850','#e8d8c0','#c0a880');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,2,2,511+fi*5,{frame:'#f4ece0',glass:'#5a7086',lit:0.22});
      IB.speck(g,x0,y0,len,f.hpx,'#b8a890',10,516+fi);
    }
    /* теракотова черепиця */
    const N2=f.up(f.N,f.hpx),E2=f.up(f.E,f.hpx),S2=f.up(f.S,f.hpx),W2=f.up(f.Wc,f.hpx);
    for(let i=1;i<6;i++){para(g,W2[0],W2[1]+i*4,(E2[0]-W2[0]),((S2[1]-W2[1])/((S2[0]-W2[0])||1)),1,'#b05e3a');}
    IB.PA(g,[[W2[0],W2[1]],[E2[0],E2[1]],[E2[0],E2[1]+2],[W2[0],W2[1]+2]],'#9a4e2e');
    IB.isoBox(g,N2[0]+f.wT*6,N2[1]+6,6,5,9,'#d8d0c4','#e8e0d4','#c8c0b4');
    roofStuff(g,f,521);
  });
  /* --- ПАНЕЛЬКИ БРОВАРІВ: синя й зелена серії --- */
  cat('panel_b1',3,3,168,(g,f)=>{
    catShell(g,f,'#3e5a80','#547aa8','#486a94');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,4,9,531+fi*5,{skip:0.05,lit:0.14});
      for(let yy=10;yy<f.hpx;yy+=17)para(g,x0,y0+yy,len,0.5,1,'#c8d4e0');
      IB.speck(g,x0,y0,len,f.hpx,P.ash1,10,536+fi);
    }
    roofStuff(g,f,541);
  });
  cat('panel_b2',3,3,184,(g,f)=>{
    catShell(g,f,'#3e6a4e','#548a64','#466e50');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,4,10,546+fi*5,{skip:0.06,lit:0.15});
      for(let yy=12;yy<f.hpx;yy+=18)para(g,x0,y0+yy,len,0.5,1,'#d0dcc8');
      IB.speck(g,x0,y0,len,f.hpx,P.ash2,10,551+fi);
    }
    roofStuff(g,f,556);
  });
  /* --- ПАНЕЛЬКИ ВИШГОРОДА: бежево-жовта серія --- */
  cat('panel_v1',3,3,176,(g,f)=>{
    catShell(g,f,'#8a7440','#c8b880','#a08c58');
    const faces=[[f.Wc[0],f.Wc[1]-f.hpx,f.wT*16,0],[f.S[0],f.S[1]-f.hpx,f.dT*16,1]];
    for(const[x0,y0,len,fi]of faces){
      catWin(g,x0,y0,len,f.hpx,4,9,561+fi*5,{skip:0.05,lit:0.16,frame:'#e8e0c8',glass:'#3e4450'});
      for(let yy=10;yy<f.hpx;yy+=17)para(g,x0,y0+yy,len,0.5,1,'#e8dcb4');
      IB.speck(g,x0,y0,len,f.hpx,'#a89878',10,566+fi);
    }
    roofStuff(g,f,571);
  });

  /* ---- ВЕЛИКІ ДЕРЕВА (батч 14) ---- */
  function prop2(name,w,h,ax,ay,fn){const c=IB.mk(w,h);fn(c.g,ax,ay);SPR.props[name]={c,ax,ay};}
  prop2('tree_big',64,84,32,80,(g,x,y)=>{
    IB.P(g,x-3,y-26,6,26,P.b2);IB.P(g,x-3,y-26,2,26,P.b1);IB.P(g,x+1,y-26,2,26,P.b3);
    IB.P(g,x-9,y-18,4,3,P.b2);IB.P(g,x+6,y-15,4,3,P.b2);
    IB.O(g,x,y-44,20,14,P.g2);IB.O(g,x-11,y-50,13,10,P.g3);IB.O(g,x+11,y-51,12,10,P.g4);
    IB.O(g,x,y-58,12,9,P.g5);IB.O(g,x-5,y-62,8,6,P.g6);IB.O(g,x+7,y-60,7,5,P.g6);
    IB.speck(g,x-20,y-64,38,24,P.g1,16,7);IB.speck(g,x-14,y-56,26,16,P.g5,10,13);
  });
  prop2('tree_b',44,70,22,66,(g,x,y)=>{
    IB.P(g,x-2,y-30,4,30,'#d8d4c8');IB.P(g,x-2,y-30,1,30,'#f0ece0');
    for(let i=0;i<6;i++)IB.P(g,x-2+((i%2)*3),y-26-i*4,2,1,'#2e2e2e');
    IB.O(g,x,y-46,11,8,P.g4);IB.O(g,x-6,y-52,8,6,P.g5);IB.O(g,x+6,y-51,7,6,P.g6);IB.O(g,x,y-56,6,5,P.g5);
    IB.speck(g,x-10,y-56,20,16,P.g6,8,21);
  });
  prop2('tree_p',36,88,18,84,(g,x,y)=>{
    IB.P(g,x-2,y-22,4,22,P.b2);
    for(let i=0;i<6;i++){const w=10-i,yy=y-20-i*9;IB.PA(g,[[x-w,yy],[x+w,yy],[x,yy-12]],i%2?P.g3:P.g4);}
    IB.PA(g,[[x-5,y-72],[x+5,y-72],[x,y-84]],P.g5);
    IB.speck(g,x-8,y-64,16,30,P.g2,10,33);
  });
  prop2('tree_s',52,80,26,76,(g,x,y)=>{
    IB.P(g,x-3,y-14,6,14,P.b1);
    for(let i=0;i<5;i++){const w=20-i*3,yy=y-12-i*10;IB.PA(g,[[x-w,yy],[x+w,yy],[x,yy-13]],i%2?P.g2:P.g3);IB.PA(g,[[x-w+2,yy-2],[x,yy-6],[x+w-2,yy-2]],P.g1);}
    IB.PA(g,[[x-8,y-60],[x+8,y-60],[x,y-72]],P.g4);
    IB.speck(g,x-16,y-58,32,40,P.g1,14,41);
  });
  prop2('tree_a',44,60,22,56,(g,x,y)=>{
    IB.P(g,x-2,y-14,4,14,P.b2);
    IB.O(g,x,y-26,13,9,P.g3);IB.O(g,x-7,y-31,8,6,P.g5);IB.O(g,x+7,y-30,7,6,P.g4);
    for(let i=0;i<7;i++)IB.O(g,x-9+IB.hsh(i,1,51)*18,y-30+IB.hsh(i,2,52)*10,1.6,1.6,P.rd2);
    IB.speck(g,x-12,y-36,24,14,P.g2,8,55);
  });
  /* ---- АЗС (батч 14): навіс-плита (прохідний), колонка, пілон, криниця селища ---- */
  prop2('gas_canopy',104,60,52,56,(g,x,y)=>{
    for(const px of[x-38,x-12,x+12,x+38])IB.P(g,px-2,y-30,4,30,P.m2);
    IB.P(g,x-40,y-2,2,30,P.m1);IB.P(g,x+38,y-2,2,30,P.m1);
    IB.PA(g,[[x-48,y-32],[x,y-44],[x+48,y-32],[x,y-20]],P.rd1);
    IB.PA(g,[[x-48,y-32],[x,y-44],[x,y-41],[x-48,y-29]],'#cc5a4c');
    IB.PA(g,[[x,y-44],[x+48,y-32],[x+48,y-29],[x,y-41]],P.rd2);
    IB.PA(g,[[x-30,y-30],[x,y-38],[x+30,y-30],[x,y-22]],'#e06a50');
    IB.P(g,x-6,y-40,3,3,P.y4);IB.P(g,x+4,y-38,3,3,P.y4);
  });
  prop2('gas_pump',36,44,18,40,(g,x,y)=>{
    IB.isoBox(g,x-7,y-8,14,8,22,P.wht,P.gr4,P.gr2);
    IB.P(g,x-5,y-24,10,6,'#1a222e');IB.P(g,x-4,y-23,8,4,'#3aa050');
    IB.P(g,x-4,y-16,8,2,P.rd2);IB.P(g,x-4,y-13,8,1,P.y3);
    IB.P(g,x+7,y-20,4,2,P.d02);IB.P(g,x+10,y-28,2,9,P.d02);
    IB.P(g,x-7,y,14,1,P.d01);
  });
  prop2('gas_sign',40,66,20,62,(g,x,y)=>{
    IB.P(g,x-2,y-40,4,40,P.m1);IB.P(g,x-3,y-38,1,36,P.m2);
    IB.PA(g,[[x-16,y-58],[x+16,y-58],[x+16,y-38],[x-16,y-38]],P.rd2);
    IB.P(g,x-16,y-58,32,2,P.rd3);IB.P(g,x-16,y-40,32,2,P.rd1);
    IB.P(g,x-12,y-54,24,4,'#f4f4f8');IB.P(g,x-12,y-48,16,4,P.y4);
    IB.P(g,x-14,y-36,28,2,P.d01);
  });
  prop2('well',40,44,20,40,(g,x,y)=>{
    IB.O(g,x,y-4,10,5,P.gr2);IB.O(g,x,y-4,7,3.4,'#1a222e');
    IB.P(g,x-9,y-16,2,14,P.b2);IB.P(g,x+7,y-16,2,14,P.b2);
    IB.PA(g,[[x-11,y-15],[x,y-22],[x+11,y-15]],P.r2);
    IB.P(g,x-1,y-20,2,8,P.b1);IB.O(g,x,y-11,3.4,2.4,P.gr3);
    IB.speck(g,x-10,y-8,20,8,P.g3,6,57);
  });
  /* ---- ВИВІСКИ КРАМНИЦЬ (батч 14) ---- */
  function mkSign(txt,bg,fg){
    const w=txt.length*7+16,c=IB.mk(w,16),g=c.g;
    IB.P(g,0,0,w,16,IB.shade(bg,-0.4));IB.P(g,1,1,w-2,14,bg);
    IB.P(g,1,1,w-2,2,IB.shade(bg,0.25));
    g.font='bold 10px monospace';g.textAlign='center';g.textBaseline='middle';
    g.fillStyle=fg;g.fillText(txt,w/2,8.5);
    IB.speck(g,1,1,w-2,14,P.ash2,6,7);
    return c;
  }
  SPR.signs=[
    mkSign('FN<','#c8342c','#f4f4f8'),
    mkSign('ПРОДУКТИ','#2e7a48','#f0f0e4'),
    mkSign('АПТЕКА','#2a8a8a','#f4f4f8'),
    mkSign('КАФЕ','#d8a834','#2a2018'),
    mkSign('ХЛІБ','#a06230','#f4ecdc'),
    mkSign('КОМФОРТ','#3e5a94','#e8ecf4'),
    mkSign('БАРБЕР','#6a4a8a','#f0e8f4'),
    mkSign('САНТЕХНІКА','#4a6a8a','#eef2f6'),
    mkSign('ПАЛЬНЕ','#c8681e','#f8f4e8'),
    mkSign('РАДІОТОВАРИ','#8a3e6a','#f4e8f0'),
    /* батч 15: ще вивіски по районах */
    mkSign('КЛУБ «ДНЕСНА»','#2a6a8e','#f0f4f8'),
    mkSign('ІГРОМАТ','#8e2a6a','#f8f0f4'),
    mkSign('РИБАЛКА','#2a7a5a','#f0f8f0'),
    mkSign('М\'ЯСО','#a03a2a','#f8f0e4'),
    mkSign('СИР','#d8b030','#f8f4e0'),
    mkSign('ЛОМБАРД','#4a4a8e','#f0f0f8'),
    mkSign('АВТОЗАПЧАСТИНИ','#3a5a3a','#f0f4ec'),
    mkSign('ГУРТОЖИТОК','#6a5a3a','#f4f0e4'),
  ];
  /* ---- ГРАФІТІ (батч 14): LOL, LEGEND, VIKTOR... ---- */
  function mkGraf(txt,c1,c2){
    const w=txt.length*6+14,c=IB.mk(w,16),g=c.g;
    g.font='bold 11px monospace';g.textAlign='center';g.textBaseline='middle';
    g.save();g.translate(w/2,8);g.rotate(-0.05);
    g.fillStyle=c2||IB.shade(c1,-0.35);g.fillText(txt,1,1.5);
    g.fillStyle=c1;g.fillText(txt,0,0);
    g.restore();
    IB.speck(g,0,2,w,12,c1,8,9);
    for(let i=0;i<3;i++){const dx=(IB.hsh(i,4,61)*w)|0;IB.P(g,dx,10+((IB.hsh(i,5,62)*4)|0),1,3,c1);}
    return c;
  }
  SPR.grafs=[
    mkGraf('LOL','#e0d040'),
    mkGraf('LEGEND','#e07038','#8a3a18'),
    mkGraf('VIKTOR','#4ec0d8'),
    mkGraf('KYIV','#d8d4c8'),
    mkGraf('ЗСУ','#4ea05c'),
    mkGraf('1986','#c8c0a8'),
    mkGraf('НЕ БОЯТИСЬ','#e0e4ec'),
    mkGraf('***','#d84a8a'),
    mkGraf('ПУХІВКА','#58c868'),
    mkGraf('ТРИПІЛЬ','#d8a834'),
  ];
  /* ---- БАТЧ 15: ПАЛАТКИ ТАБОРУ + БАГАТТЯ (Трипільська гора) ---- */
  function tent(name,c1,c2){prop2(name,44,42,22,38,(g,x,y)=>{
    IB.PA(g,[[x-16,y],[x,y-26],[x+16,y]],c1);
    IB.PA(g,[[x-16,y],[x,y-26],[x-1,y]],IB.shade(c1,-0.35));
    IB.PA(g,[[x+4,y],[x+15,y-15],[x+15,y]],c2);
    IB.P(g,x-2,y-20,3,7,'#26221e');
    IB.P(g,x-16,y-1,32,2,IB.shade(c1,-0.5));
    IB.speck(g,x-14,y-14,28,14,P.ash2,6,71);
  });}
  tent('tent_a','#d8742e','#e8a050');
  tent('tent_b','#4e8e5c','#6ab078');
  tent('tent_c','#3e6ea8','#5a8ec8');
  prop2('campfire',36,32,18,28,(g,x,y)=>{
    for(let i=0;i<7;i++){const a=i/7*6.28;IB.P(g,x-1+Math.cos(a)*7,y-2+Math.sin(a)*3.5,3,2,P.gr3);}
    IB.P(g,x-7,y-3,14,3,P.d01);
    IB.PA(g,[[x-4,y-4],[x+4,y-4],[x,y-14]],'#e87830');
    IB.PA(g,[[x-2,y-4],[x+2,y-4],[x,y-10]],'#f0c050');
    IB.P(g,x-1,y-16,2,4,'#e8e8e0');
    IB.speck(g,x-6,y-12,12,8,'#e8a050',5,73);
  });
  IB.SPRG_NS=SPR.signs.length;   /* кількість вивісок (для генерації світу) */
  IB.SPRG_NG=SPR.grafs.length;   /* кількість графіті */

  SPR.CARS=CARS;
  /* ШАХЕД — дельта-крило з толкаючим гвинтом і вогнем (вид згори-збоку в ізометрії) */
  SPR.shahed=(()=>{
    const c=IB.mk(48,20),g=c.g;
    /* тіньовий силует дельта-крила */
    IB.PA(g,[[4,10],[36,3],[46,10],[36,17]],'#8a8f9c');
    IB.PA(g,[[4,10],[36,3],[36,7],[8,11]],'#aeb3c0');
    IB.PA(g,[[4,10],[36,17],[36,13],[8,10]],'#5e6270');
    IB.P(g,38,8,7,4,'#3a3e46');          /* мотогондола */
    IB.P(g,44,7,3,6,'#2e3238');          /* гвинт */
    IB.P(g,16,4,10,2,'#d0d4dc');         /* світла смуга */
    IB.P(g,10,8,4,4,'#4a4e58');          /* голова дрона */
    return c;
  })();
  return SPR;
})();
