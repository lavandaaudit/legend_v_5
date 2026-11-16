/* IBONARIUM KYIV — gfx.js: ізометричний рендер, освітлення, мапи, компас */
IB.cam={x:31.5,y:31.5,shake:0};
IB.wx=(x,y)=>(x-y)*16;
IB.wy=(x,y)=>(x+y)*8;
/* камера віддальна: 480x336 (x1.5) — у кадрі більше міста, дрібніший маштаб */
IB.CAMW=480;IB.CAMH=336;
/* приблизна висота будівель по категоріях (для тіней + якоря землі) — СИНХРОН з build_assets.py CATS (БАТЧ 8):
   герой 30px, будівлі ЗБІЛЬШЕНІ: хрущовки 3x2 (стіна ~104px), панельки-башти 3x3 (~250px),
   адмінки 4x2/4x3, заводи 4x3 — усі значно вищі за героя, як у Zombie City HD */
IB.BLD_H={khrus:88,khrus2:90,panel9:210,panel9b:210,hist2:72,hist2b:74,hist2c:76,hist3:82,admin3:126,admin4:190,shop1:64,shop2:66,factory:92,factory2:112,garage:44,khrus_dmg:86,panel9_dmg:196,hist_ruin:48,dacha1:80,dacha2:74,dacha3:86,
  panel_c1:224,panel_c2:232,panel_c3:248,tower_g:264,fnmarket:92,vill1:92,vill2:78,
  /* батч 16: райони області */ wood1:64,wood2:60,cottage_b:88,panel_b1:168,panel_b2:184,panel_v1:176};

IB.GFX=(function(){
  const P=IB.PAL,M=IB.M;
  const lightC=IB.mk(IB.CAMW,IB.CAMH);

  /* ---- мурал (тризуб + КИЇВ) ---- */
  (function(){
    const c=IB.mk(64,52),g=c.g;
    IB.P(g,4,4,56,44,P.c3);IB.P(g,4,4,56,3,P.c4);IB.P(g,4,45,56,3,P.c2);
    IB.P(g,8,8,48,36,P.u2);IB.P(g,8,30,48,14,P.y4);
    const tx=24,ty=12;
    IB.P(g,tx-5,ty,3,14,P.y4);IB.P(g,tx+3,ty,3,14,P.y4);IB.P(g,tx-1,ty-3,3,18,P.y4);
    IB.P(g,tx-4,ty+12,9,3,P.y4);
    const L={'К':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,1],[2,3]],'И':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],'Ї':[[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],'В':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,1],[1,2],[2,3],[1,4]]};
    let ox=36;
    for(const ch of 'КИЇВ'){for(const p of (L[ch]||[]))IB.P(g,ox+p[0],24+p[1],1,1,P.wht);ox+=4;}
    IB.speck(g,4,4,56,44,P.gr1,14,4);
    if(!IB.SPR.props.mural)IB.SPR.props.mural={c,ax:32,ay:50};
  })();
  /* ---- іконка молотова ---- */
  (function(){
    if(!IB.SPR.itemsDB.molotov)IB.SPR.itemsDB.molotov={n:'КОКТЕЛЬ МОЛОТОВА',c:P.y3,d:'Кинути: пожежа'};
    const c=IB.mk(24,22),g=c.g;
    IB.P(g,9,4,6,13,P.g5);IB.P(g,10,2,4,3,P.g6);IB.P(g,10,7,2,8,P.g4);
    IB.P(g,9,2,7,3,P.b4);IB.O(g,13,1,2,2,P.rd3);IB.O(g,13,0,1.4,1.4,P.y4);
    IB.SPR.items.molotov={c,d:IB.SPR.itemsDB.molotov};
    if(!IB.SPR.icons.molotov)IB.SPR.icons.molotov=c;
  })();

  /* ---------- видимі межі тайлів ---------- */
  function tileBounds(csx,csy){
    const WW=IB.WORLD?IB.WORLD.W-1:223, WH=IB.WORLD?IB.WORLD.H-1:223;
    const a=csx/16,b=csy/8;
    const cxs=[a,a+30],cys=[b,b+42];
    let minTx=1e9,maxTx=-1e9,minTy=1e9,maxTy=-1e9;
    for(const A of cxs)for(const B of cys){
      const tx=(A+B)/2,ty=(B-A)/2;
      minTx=IB.M.min(minTx,tx);maxTx=IB.M.max(maxTx,tx);
      minTy=IB.M.min(minTy,ty);maxTy=IB.M.max(maxTy,ty);
    }
    return [IB.M.max(0,IB.M.floor(minTx)-1),IB.M.min(WW,IB.M.ceil(maxTx)+1),
            IB.M.max(0,IB.M.floor(minTy)-1),IB.M.min(WH,IB.M.ceil(maxTy)+1)];
  }

  /* ---------- земля ---------- */
  function drawGround(g){
    const W=IB.WORLD,PL=IB.PL,T=IB.TER;
    if(!W)return;
    const archQ=[];   /* БАТЧ 17: арки мостів — малюємо ДРУГИМ проходом, щоб вода не перекривала */
    const px=PL?(PL.car?PL.car.x:PL.x):IB.cam.x, py=PL?(PL.car?PL.car.y:PL.y):IB.cam.y;
    const csx=IB.wx(px,py)-IB.CAMW/2, csy=IB.wy(px,py)-IB.CAMH/2-26;
    const shx=IB.cam.shake>0?IB.rnd(-2,2):0, shy=IB.cam.shake>0?IB.rnd(-1.5,1.5):0;
    const[b0,b1,c0,c1]=tileBounds(csx,csy);
    for(let ty=c0;ty<=c1;ty++){
      for(let tx=b0;tx<=b1;tx++){
        const i=W.ridx(tx,ty);
        const sx=IB.wx(tx,ty)-csx+shx, sy=IB.wy(tx,ty)-csy+shy-W.elev[i]*14;
        if(sx<-36||sx>IB.CAMW+36||sy<-36||sy>IB.CAMH+36)continue;
        const tt=W.ter[i],vr=W.vrn[i];
        if(tt===T.road){
          if(W.brg[i]){
            g.drawImage(IB.SPR.ground.bridge_h[0],sx-16,sy-8);
            /* БАТЧ 17: МІСТ З АРКАМИ — перила по боках + кам'яні арки з пилонами */
            const horiz=W.inb(tx-1,ty)&&W.brg[W.ridx(tx-1,ty)]&&W.inb(tx+1,ty)&&W.brg[W.ridx(tx+1,ty)];
            if(horiz){
              /* перила: стійки по північному і південному краях настилу */
              if(tx%2===0){
                g.fillStyle='#4c505c';g.fillRect(sx+2,sy-3,2,4);
                g.fillRect(sx+12,sy+8,2,4);
                g.fillStyle='#6e7480';g.fillRect(sx-8,sy-4,32,1);
                g.fillRect(sx-8,sy+12,32,1);
              }
              /* кам'яні пілони з півколами-арками під настилом — кожні 4 тайли (2-й прохід) */
              if(tx%4===1)archQ.push({sx,sy,horiz:true});
            } else {
              archQ.push({sx,sy,horiz:false});
            }
          }
          else{const ri2=W.rdm[i];const rimg=IB.SPR.road[ri2]||IB.SPR.road[0];g.drawImage(rimg,sx-16,sy-8);}
        } else {
          let arr;
          if(tt===T.water)arr=[IB.SPR.ground.water0[0],IB.SPR.ground.water1[0]];
          else arr=IB.SPR.ground[['grass','park','field','sidewalk','pave','cobble','concrete','plaza','rubble','dirt','sand','rail','road','rock','tunnel','track','plat','floorw','floort','floorc','floorr'][tt]];
          if(!arr)continue;
          let v=vr%arr.length;
          if(tt===T.water)v=(IB.M.floor(Date.now()/700)+((tx*7+ty*13)&1))%arr.length;
          g.drawImage(arr[v],sx-16,sy-8);
        }
        /* скелі-обриви: південні сусіди нижчі */
        const e=W.elev[i];
        if(e>0){
          const s1=W.inb(tx+1,ty)?W.elev[W.ridx(tx+1,ty)]:e;
          const s2=W.inb(tx,ty+1)?W.elev[W.ridx(tx,ty+1)]:e;
          const hh1=(e-s1)*14, hh2=(e-s2)*14;
          if(hh1>0){IB.PA(g,[[sx,sy+8],[sx+16,sy+16],[sx+16,sy+16+hh1],[sx,sy+8+hh1]],'#241d18');IB.P(g,sx+15,sy+16,1,hh1,'#3a2f26');}
          if(hh2>0){IB.PA(g,[[sx,sy+8],[sx-16,sy+16],[sx-16,sy+16+hh2],[sx,sy+8+hh2]],'#1a1410');}
        }
      }
    }
    /* --- АРКИ МОСТІВ: другий прохід (поверх води) --- */
    for(const a of archQ){
      const sx=a.sx, sy=a.sy;
      if(!a.horiz){
        /* в'їзд на міст: підпірна стінка */
        g.fillStyle='#4a4e58';g.fillRect(sx,sy+8,32,5);
        g.fillStyle='#787e8a';g.fillRect(sx,sy+8,32,1);
        continue;
      }
      /* кам'яний пілон з півкруглою АРКОЮ під настилом — видно здалеку */
      g.fillStyle='rgba(8,10,16,0.4)';
      g.beginPath();g.ellipse(sx+8,sy+24,13,4,0,0,Math.PI*2);g.fill();
      g.fillStyle='#7e8492';
      g.fillRect(sx,sy+8,16,15);
      g.fillStyle='#989eaa';g.fillRect(sx,sy+8,16,2);
      g.fillStyle='#6e7482';g.fillRect(sx,sy+21,16,2);
      /* півкруглий отвір арки */
      g.fillStyle='#181c24';
      g.beginPath();g.arc(sx+8,sy+22,7,Math.PI,0);g.closePath();g.fill();
      g.strokeStyle='#5e6472';g.lineWidth=1.5;
      g.beginPath();g.arc(sx+8,sy+22,7,Math.PI,0);g.stroke();
      /* кам'яна кладка */
      g.strokeStyle='rgba(40,44,54,0.6)';g.lineWidth=1;
      g.beginPath();g.moveTo(sx,sy+12);g.lineTo(sx+16,sy+12);g.moveTo(sx+5,sy+8);g.lineTo(sx+5,sy+12);g.moveTo(sx+11,sy+12);g.lineTo(sx+11,sy+22);g.stroke();
    }
  }

  /* ---------- сутності ---------- */
  function drawScene(g){
    const W=IB.WORLD,PL=IB.PL,E=IB.ENTS;
    if(!W||!PL)return;
    const px=PL.car?PL.car.x:PL.x, py=PL.car?PL.car.y:PL.y;
    const csx=IB.wx(px,py)-IB.CAMW/2, csy=IB.wy(px,py)-IB.CAMH/2-26;
    const shx=IB.cam.shake>0?IB.rnd(-2,2):0, shy=IB.cam.shake>0?IB.rnd(-1.5,1.5):0;
    const lights=[];
    const items=[];
    const[b0,b1,c0,c1]=tileBounds(csx,csy);
    /* тіні будівель + ЛОКАЦІЙ */
    g.fillStyle='rgba(8,10,16,0.30)';
    function bShadow(tx,ty,wT,dT,hpx,e){
      const ex=IB.wx(tx+wT,ty)-csx, ey=IB.wy(tx+wT,ty)-csy-e*14;
      const sx=IB.wx(tx+wT,ty+dT)-csx, sy=IB.wy(tx+wT,ty+dT)-csy-e*14;
      const L=hpx*0.62;
      g.beginPath();g.moveTo(ex,ey);g.lineTo(sx,sy);g.lineTo(sx+L*1.35,sy+L*0.68);g.lineTo(ex+L*1.35,ey+L*0.68);g.closePath();g.fill();
    }
    for(const b of W.blds){
      if(b.x<b0-11||b.x>b1+4||b.y<c0-11||b.y>c1+6)continue;
      bShadow(b.x,b.y,b.wT,b.dT,IB.BLD_H[b.cat]||30,W.elevAt(b.x,b.y));
    }
    for(const l of W.lms){
      if(l.x<b0-13||l.x>b1+4||l.y<c0-13||l.y>c1+6)continue;
      const c=IB.LM[l.key];if(!c)continue;
      bShadow(l.x,l.y,l.wT,l.dT,(c.hpx||40)*0.85,W.elevAt(l.x,l.y));
    }
    /* ДЕКАЛІ: трупи, вигорілі плями (раніше створювались, але не малювались) */
    for(const d of E.decals){
      const dx2=d.x|0,dy2=d.y|0;
      if(dx2<b0||dx2>b1||dy2<c0||dy2>c1)continue;
      const gx=IB.wx(d.x,d.y)-csx,gy=IB.wy(d.x,d.y)-csy-W.elevAt(dx2,dy2)*14;
      if(d.t==='corpse'){
        g.fillStyle='rgba(8,10,16,0.35)';g.beginPath();g.ellipse(gx,gy,7,3,0,0,7);g.fill();
        g.fillStyle='#3c3230';g.beginPath();g.ellipse(gx,gy-1.5,6,2.4,0.4,0,7);g.fill();
        g.fillStyle='#2a2220';g.beginPath();g.ellipse(gx-4,gy-1,2.6,1.8,0.2,0,7);g.fill();
        g.fillStyle='rgba(120,28,24,0.5)';g.beginPath();g.ellipse(gx+3,gy,5,2,0,0,7);g.fill();
      } else if(d.t==='blood'){        /* БАТЧ 14: калючі крові */
        g.fillStyle='rgba(96,16,14,0.55)';g.beginPath();g.ellipse(gx,gy,6.5,3.2,0,0,7);g.fill();
        g.fillStyle='rgba(120,22,18,0.45)';g.beginPath();g.ellipse(gx+3,gy+1.5,3.4,2,0.3,0,7);g.fill();
        g.fillStyle='rgba(70,10,10,0.5)';g.beginPath();g.ellipse(gx-4,gy-1,2.6,1.6,0.2,0,7);g.fill();
      } else if(d.t==='scorch'){
        g.fillStyle='rgba(16,14,14,0.62)';g.beginPath();g.ellipse(gx,gy,11,6,0,0,7);g.fill();
        g.fillStyle='rgba(60,52,44,0.5)';g.beginPath();g.ellipse(gx,gy,7,4,0,0,7);g.fill();
      }
    }
    /* будівлі (варіанти Kenney: cat_0..cat_N) */
    for(const b of W.blds){
      if(b.x<b0-9||b.x>b1+2||b.y<c0-9||b.y>c1+2)continue;
      items.push({s:b.x+b.wT-1+b.y+b.dT-1,f:(gg)=>{
        const c=IB.SPR.cats[b.cat+'_'+(b.var!=null?b.var:0)]||IB.SPR.cats[b.cat];if(!c)return;
        const e=W.elevAt(b.x,b.y);
        /* АНКР ЗЕМЛІ: у канвасі будівлі під ґрунтовий ромб лежить внизу канваса
           (y = hpx+8 .. H), тому малюємо так, щоб низ канваса сів на південний
           кут footprint — будівля СТОЇТЬ на своїх тайлах, а не тоне в землі */
        const hpx=IB.BLD_H[b.cat]||30;
        const ch=c.height||((b.wT+b.dT)*8+hpx+8);
        gg.drawImage(c,IB.wx(b.x,b.y)-csx-(2+b.dT*16)+shx,IB.wy(b.x,b.y)-csy-e*14-((ch-((b.wT+b.dT)*8))+shy));
        if(b.mural){
          const mr=IB.SPR.props.mural;
          const mx=b.x+b.wT/2,my=b.y+b.dT;
          const mw=mr.c.width*0.82,mh=mr.c.height*0.82;
          gg.drawImage(mr.c,IB.wx(mx,my)-csx-mw/2+shx,IB.wy(mx,my)-csy-mh+shy-2,mw,mh);
        }
        /* БАТЧ 14: ВИВІСКА крамниці на фасаді (над дверима) */
        if(b.sign!=null&&IB.SPR.signs&&IB.SPR.signs.length){
          const sg=IB.SPR.signs[b.sign%IB.SPR.signs.length];
          const mx=b.x+b.wT/2,my=b.y+b.dT;
          const sw2=sg.width*0.92,sh2=sg.height*0.92;
          gg.drawImage(sg,IB.wx(mx,my)-csx-sw2/2+shx,IB.wy(mx,my)-csy-sh2-8+shy,sw2,sh2);
        }
        /* БАТЧ 14: ГРАФІТІ на стіні (LOL / LEGEND / VIKTOR...) — трохи збоку, при землі */
        if(b.graf!=null&&IB.SPR.grafs&&IB.SPR.grafs.length){
          const gf=IB.SPR.grafs[b.graf%IB.SPR.grafs.length];
          const off=((b.x*3+b.y*7)%5)-2;
          const gx2=b.x+b.wT*0.5+off*0.4,gy2=b.y+b.dT-0.15;
          const gw=gf.width*0.78,gh=gf.height*0.78;
          gg.drawImage(gf,IB.wx(gx2,gy2)-csx-gw/2+shx,IB.wy(gx2,gy2)-csy-gh+shy-1,gw,gh);
        }
      }});
    }
    /* локації-домінанти */
    for(const l of W.lms){
      if(l.x<b0-11||l.x>b1+2||l.y<c0-11||l.y>c1+2)continue;
      items.push({s:l.x+l.wT-1+l.y+l.dT-1,f:(gg)=>{
        const c=IB.LM[l.key];if(!c)return;
        const e=W.elevAt(l.x,l.y);
        /* якір: ay рахується у landmarks.js як (8+extraTop+ground) — низ "стін"
           сідає на південний кут footprint */
        const ay=c.ay!==undefined?c.ay:(c.c.height-((l.wT+l.dT)*8));
        gg.drawImage(c.c,IB.wx(l.x,l.y)-csx-(2+l.dT*16)+shx,IB.wy(l.x,l.y)-csy-e*14-ay+shy);
      }});
    }
    /* пропси */
    for(const pr of W.props){
      const prx=pr.x|0,pry=pr.y|0;
      if(prx<b0||prx>b1||pry<c0||pry>c1)continue;
      let sp=IB.SPR.props[pr.t];
      if(pr.t==='crate'&&IB.SPR.cratePool){
        const ci=IB.SPR.cratePool[(pr.id||0)%IB.SPR.cratePool.length];
        if(ci&&ci.width)sp={c:ci,ax:ci.width/2,ay:ci.height};
      }
      if(!sp)continue;
      const e=W.elevAt(prx,pry);
      items.push({s:pr.x+pr.y-0.5,f:(gg)=>{
        /* тінь під пропсом */
        const gx=IB.wx(pr.x,pr.y)-csx+shx, gy=IB.wy(pr.x,pr.y)-csy-e*14+shy;
        const rx=IB.M.min(15,sp.c.width*0.30), ry=IB.M.max(2,rx*0.40);
        gg.fillStyle='rgba(8,10,16,0.30)';gg.beginPath();gg.ellipse(gx,gy-1,rx,ry,0,0,7);gg.fill();
        gg.drawImage(sp.c,IB.wx(pr.x,pr.y)-csx-sp.ax+shx,IB.wy(pr.x,pr.y)-csy-e*14-sp.ay+shy);
      }});
      if(pr.t==='lamp'||pr.t==='lamp_b'){if(IB.nightFactor()>0.12)lights.push({x:pr.x,y:pr.y,r:4.4});}
      if(pr.t==='metro_m')lights.push({x:pr.x,y:pr.y,r:2.6});
      if(pr.t==='metro_m2'||pr.t==='lamp_m')lights.push({x:pr.x,y:pr.y,r:2.8});   /* підземка: світильники */
      if(pr.t==='rack')lights.push({x:pr.x,y:pr.y,r:1.8,flick:true});              /* серверні: моргають діоди */
      if(pr.t==='bench_w')lights.push({x:pr.x,y:pr.y,r:2.0});                      /* верстак: лампа */
      if(pr.t==='kiosk'&&IB.nightFactor()>0.3)lights.push({x:pr.x,y:pr.y,r:2.2});
      if(pr.t==='gas_pump')lights.push({x:pr.x,y:pr.y,r:2.4});   /* АЗС: колонки підсвічені */
      if(pr.t==='gas_sign')lights.push({x:pr.x,y:pr.y,r:2.8});
    }
    /* авто — великі 4-напрямні спрайти, БЕЗ дзеркальних перевертань на льоту */
    const CARKEY=['se','nw','sw','ne'];   /* 0=SE(+x) 1=NW(-x) 2=SW(+y) 3=NE(-y) */
    for(const c of W.cars){
      const cx2=c.x|0,cy2=c.y|0;
      if(cx2<b0||cx2>b1||cy2<c0||cy2>c1)continue;
      items.push({s:c.x+c.y-0.4,f:(gg)=>{
        /* батч 13: кольоровий варіант Kenney car-kit (_a/_b), якщо рендер завантажено */
        const mid=(c.var&&IB.SPR.cars[c.mdl+'_'+c.var])?c.mdl+'_'+c.var:c.mdl;
        const set=c.broken?(IB.SPR.cars.wreck):(IB.SPR.cars[mid]||IB.SPR.cars[c.mdl]);
        if(!set)return;
        let img=set[CARKEY[c.dir]]||set.ne;
        if(!c.broken&&c.hp<IB.SPR.CARS[c.mdl].hp*0.45&&set[CARKEY[c.dir]+'_d'])img=set[CARKEY[c.dir]+'_d'];
        const e=W.elevAt(cx2,cy2);
        const ANCH=IB.SPR.CAR_ANCH||44;
        const sx=IB.wx(c.x,c.y)-csx-(img.width/2)+shx, sy=IB.wy(c.x,c.y)-csy-e*14-ANCH+shy;
        gg.drawImage(img,sx,sy);
        if(c.engine&&!c.broken){ /* дим з вихлопа */
          if(IB.rnd(0,1)<0.2)E.parts.push({x:c.x,y:c.y,vx:IB.rnd(-0.3,0.3),vy:IB.rnd(-0.3,0.3),ttl:0.5,c:'#606a78'});
        }
      }});
    }
    /* заражені */
    for(const z of E.zombies){
      const zx=z.x|0,zy=z.y|0;
      if(zx<b0||zx>b1||zy<c0||zy>c1)continue;
      items.push({s:z.x+z.y-0.3,f:(gg)=>{
        const sp=IB.SPR.zomb[z.type];if(!sp)return;
        const fr=IB.M.floor(z.anim)%2;
        const dx=PL.x-z.x,dy=PL.y-z.y;
        const side=IB.M.abs(dx)>IB.M.abs(dy)*1.15&&z.state==='chase';
        const img=side?sp.s[fr]:sp.f[fr];
        const e=W.elevAt(zx,zy);
        const sx=IB.wx(z.x,z.y)-csx-32+shx, sy=IB.wy(z.x,z.y)-csy-e*14-56+shy;
        /* тінь */
        gg.fillStyle='rgba(8,10,16,0.32)';gg.beginPath();gg.ellipse(sx+32,IB.wy(z.x,z.y)-csy-e*14+shy+2,8,3,0,0,7);gg.fill();
        if(side&&dx<0){gg.save();gg.translate(sx+32,sy);gg.scale(-1,1);gg.drawImage(img,-32,0);gg.restore();}
        else gg.drawImage(img,sx,sy);
        /* ЗАМАХ: червоний '!' — встиг відійти або відбити */
        if(z.wind>0){
          gg.fillStyle='#e04a3a';gg.font='bold 9px monospace';gg.textAlign='center';
          gg.fillText('!',sx+32+IB.M.sin(Date.now()*0.02)*1.5,sy-5);
        }
        if(z.stag>0){
          gg.fillStyle='#f0d050';gg.font='bold 7px monospace';gg.textAlign='center';
          gg.fillText('★',sx+32,sy-6);
        }
      }});
    }
    /* ВЦІЛІЛІ ГЕРОЇ (кричать HELP) — сховані не малюються */
    for(const s of E.survivors){
      if(s.hidden)continue;
      const sx2=s.x|0,sy2=s.y|0;
      if(sx2<b0||sx2>b1||sy2<c0||sy2>c1)continue;
      items.push({s:s.x+s.y-0.3,f:(gg)=>{
        const set=(IB.SPR.npcs&&IB.SPR.npcs[s.pal])||IB.SPR.player.F;
        const img=set[IB.M.floor(s.anim)%set.length];
        const e=W.elevAt(sx2,sy2);
        const sx=IB.wx(s.x,s.y)-csx-32+shx, sy=IB.wy(s.x,s.y)-csy-e*14-58+shy;
        /* тінь */
        gg.fillStyle='rgba(8,10,16,0.32)';gg.beginPath();gg.ellipse(sx+32,IB.wy(s.x,s.y)-csy-e*14+shy+2,8,3,0,0,7);gg.fill();
        gg.drawImage(img,sx,sy);
        /* крик HELP — золота бульбаша */
        if(s.state==='help'){
          const bob=IB.M.sin(Date.now()*0.006)*1.5;
          gg.fillStyle='#f0d050';gg.font='bold 8px monospace';gg.textAlign='center';
          gg.fillText('HELP!',sx+32,sy-9+bob);
          gg.fillStyle='#e04a3a';gg.font='bold 6px monospace';
          gg.fillText(s.name,sx+32,sy-17+bob);
        } else {
          gg.fillStyle='#0b0d14cc';gg.font='5px monospace';gg.textAlign='center';
          gg.fillText(s.name,sx+32,sy-6);
        }
        /* смуга HP героя */
        if(s.hp<55){
          gg.fillStyle='#1a1a20';gg.fillRect(sx+24,sy-3,16,2);
          gg.fillStyle='#e04a3a';gg.fillRect(sx+24,sy-3,IB.M.max(1,16*s.hp/55),2);
        }
      }});
    }
    /* NPC */
    for(const np of W.npcs){
      const nx=np.x|0,ny=np.y|0;
      if(nx<b0||nx>b1||ny<c0||ny>c1)continue;
      items.push({s:np.x+np.y-0.3,f:(gg)=>{
        const set=(IB.SPR.npcs&&IB.SPR.npcs[np.role])||IB.SPR.player.F;
        const img=set[IB.M.floor(Date.now()/500)%set.length];
        const e=W.elevAt(nx,ny);
        const sx=IB.wx(np.x,np.y)-csx-32+shx, sy=IB.wy(np.x,np.y)-csy-e*14-58+shy;
        /* тінь */
        gg.fillStyle='rgba(8,10,16,0.32)';gg.beginPath();gg.ellipse(sx+32,IB.wy(np.x,np.y)-csy-e*14+shy+2,8,3,0,0,7);gg.fill();
        gg.drawImage(img,sx,sy);
        gg.fillStyle='#0b0d14cc';gg.font='5px monospace';gg.textAlign='center';
        gg.fillText(np.n.split(' — ')[0],IB.wx(np.x,np.y)-csx+shx,sy-6);
      }});
    }
    /* гравець (у схованку не видно — він всередині) */
    if(!PL.car&&PL.alive&&!IB.HIDE){
      items.push({s:PL.x+PL.y,f:(gg)=>{
        const set=IB.SPR.player[PL.dirKey];
        let img;
        if(IB.MAIN&&IB.MAIN.attackAnim>0)img=set[4];
        else if(IB.MAIN&&IB.MAIN.shootAnim>0)img=set[5];
        else img=PL.moving?set[IB.M.floor(PL.anim)%4]:set[0];
        const e=W.elevAt(PL.x|0,PL.y|0);
        const sx=IB.wx(PL.x,PL.y)-csx-32+shx;
        const gy=IB.wy(PL.x,PL.y)-csy-e*14+shy;
        if(PL.swim){
          /* БАТЧ 17: ПЛАВАННЯ — тіло занурене, кола-брижі на воді */
          const wt=Date.now()*0.004;
          gg.strokeStyle='rgba(216,232,248,0.5)';gg.lineWidth=1;
          for(let rr=0;rr<3;rr++){
            const rph=6+((wt+rr*2.1)%6);
            gg.beginPath();gg.ellipse(sx+32,gy+2,rph*1.7,rph*0.75,0,0,7);gg.stroke();
          }
          gg.fillStyle='rgba(216,232,248,0.25)';gg.beginPath();gg.ellipse(sx+32,gy+2,14,6,0,0,7);gg.fill();
          /* видно тільки верхню половину тіла */
          const vis=34;
          gg.save();gg.beginPath();gg.rect(sx-2,gy-vis,sx&&68,vis+2);gg.clip();
          gg.drawImage(img,sx,gy-58+8);
          gg.restore();
          /* голова над водою — бризки */
          if(PL.moving&&IB.rnd(0,1)<0.3)E.parts.push({x:PL.x+IB.rnd(-0.3,0.3),y:PL.y+IB.rnd(-0.2,0.2),vx:IB.rnd(-0.5,0.5),vy:IB.rnd(-0.5,0.5),ttl:0.4,c:'#d8e8f8'});
        } else {
          /* тінь */
          gg.fillStyle='rgba(8,10,16,0.34)';gg.beginPath();gg.ellipse(sx+32,gy+3,8.5,3,0,0,7);gg.fill();
          gg.drawImage(img,sx,gy-58);
        }
      }});
    }
    /* підбори */
    for(const pk of E.pickups){
      items.push({s:pk.x+pk.y-0.9,f:(gg)=>{
        const it=IB.SPR.items[pk.item];if(!it)return;
        const bob=IB.M.sin(pk.bob)*1.5;
        const gx=IB.wx(pk.x,pk.y)-csx+shx,gy=IB.wy(pk.x,pk.y)-csy+shy;
        gg.fillStyle='rgba(8,10,16,0.30)';gg.beginPath();gg.ellipse(gx,gy,4.5,1.8,0,0,7);gg.fill();
        gg.drawImage(it.c,gx-12,gy-26+bob);
      }});
    }
    /* КВЕСТ «НЕДОСТАВЛЕНІ»: конверти листів на поверхні */
    if(W.letters)for(const lt of W.letters){
      const lx=lt.x|0,ly=lt.y|0;
      if(lx<b0||lx>b1||ly<c0||ly>c1)continue;
      items.push({s:lt.x+lt.y-0.9,f:(gg)=>{
        const bob=IB.M.sin(Date.now()*0.004)*1.8;
        const gx=IB.wx(lt.x,lt.y)-csx+shx,gy=IB.wy(lt.x,lt.y)-csy+shy;
        const pul=0.12+0.1*IB.M.sin(Date.now()*0.005);
        gg.fillStyle='rgba(240,208,80,'+pul.toFixed(2)+')';gg.beginPath();gg.ellipse(gx,gy-12+bob,11,7.5,0,0,7);gg.fill();
        gg.fillStyle='rgba(8,10,16,0.30)';gg.beginPath();gg.ellipse(gx,gy,4.5,1.8,0,0,7);gg.fill();
        gg.fillStyle='#e8e2c8';gg.fillRect(gx-6,gy-16+bob,12,8);
        gg.strokeStyle='#8a7a44';gg.lineWidth=1;gg.strokeRect(gx-6.5,gy-16.5+bob,13,9);
        gg.beginPath();gg.moveTo(gx-6,gy-16+bob);gg.lineTo(gx,gy-10+bob);gg.lineTo(gx+6,gy-16+bob);gg.stroke();
      }});
    }
    /* пожежі */
    for(const f of E.fires){
      items.push({s:f.x+f.y-0.5,f:(gg)=>{
        const x=IB.wx(f.x,f.y)-csx+shx,y=IB.wy(f.x,f.y)-csy+shy;
        for(let i=0;i<5;i++){
          const h=6+IB.rnd(0,8),ox=IB.rnd(-6,6);
          IB.PA(gg,[[x+ox-2,y],[x+ox+2,y],[x+ox,y-h]],i%2?'#f0d050':'#b83424');
        }
      }});
      lights.push({x:f.x,y:f.y,r:3.6,flick:true});
    }
    items.sort((a,b)=>a.s-b.s);
    for(const it of items)it.f(g);
    /* БАТЧ 17: ЖОВТА СТРІЛКА-ВКАЗІВНИК ВИХОДУ (будинки і метро) —
       гравці губляться всередині: стрілка пульсує над дверима/сходами */
    if(IB.layer==='interior'||IB.layer==='metro'){
      const nowE=Date.now(),bobE=IB.M.sin(nowE*0.005)*3,pulE=0.5+0.5*IB.M.sin(nowE*0.006);
      const isBase=IB.INT&&IB.INT.base;
      for(const pr of W.props){
        const isExit=pr.meta==='exit'||(IB.layer==='metro'&&pr.meta==='up');
        if(!isExit)continue;
        const gx=IB.wx(pr.x,pr.y)-csx,gy=IB.wy(pr.x,pr.y)-csy;
        if(gx<-40||gx>IB.CAMW+40||gy<-60||gy>IB.CAMH+40)continue;
        /* сяйво на підлозі */
        g.fillStyle='rgba(240,208,80,'+(0.16+pulE*0.16).toFixed(2)+')';
        g.beginPath();g.ellipse(gx,gy,13,7,0,0,Math.PI*2);g.fill();
        /* трикутна стрілка, вістрям ДО дверей (вниз) */
        const ay=gy-26+bobE;
        g.fillStyle='#f0d050';
        g.beginPath();g.moveTo(gx,ay+10);g.lineTo(gx-9,ay-4);g.lineTo(gx-3,ay-4);g.lineTo(gx-3,ay-14);
        g.lineTo(gx+3,ay-14);g.lineTo(gx+3,ay-4);g.lineTo(gx+9,ay-4);g.closePath();g.fill();
        g.strokeStyle='#3a3005';g.lineWidth=1;g.stroke();
        /* підпис */
        g.font='bold 7px monospace';g.textAlign='center';
        g.fillStyle='#0b0d14';g.fillText(IB.layer==='metro'?'НА ПОВЕРХНЮ':'ВИХІД',gx+1,ay-18);
        g.fillStyle='#f0d050';g.fillText(IB.layer==='metro'?'НА ПОВЕРХНЮ':'ВИХІД',gx,ay-19);
      }
    }
    /* трасери */
    g.strokeStyle='#f0d050aa';g.lineWidth=1;
    for(const b of E.bullets){
      g.beginPath();g.moveTo(IB.wx(b.x,b.y)-csx,IB.wy(b.x,b.y)-csy-6);
      g.lineTo(IB.wx(b.x,b.y)-csx-b.vx*0.03,IB.wy(b.x,b.y)-csy-b.vy*0.03-6);g.stroke();
    }
    /* частинки */
    for(const q of E.parts){g.fillStyle=q.c;g.fillRect(IB.wx(q.x,q.y)-csx-1,IB.wy(q.x,q.y)-csy-4,2,2);}
    /* кидки */
    for(const th of E.throws){
      const ix=IB.lerp(th.x,th.tx,th.t),iy=IB.lerp(th.y,th.ty,th.t);
      const h=IB.M.sin(th.t*Math.PI)*18;
      IB.O(g,IB.wx(ix,iy)-csx,IB.wy(ix,iy)-csy-h,2,2,th.kind==='grenade'?'#3c5a3c':'#d0ac28');
    }
    /* --- ПОВІТРЯНА АТАКА: шахеди + тіні на землі + червоні хрести цілей --- */
    const SH=IB.G.shah;
    if(SH&&SH.targets&&SH.targets.length){
      const pul=0.5+IB.M.sin(Date.now()*0.008)*0.5;
      for(const tg of SH.targets){
        const gx=IB.wx(tg.x,tg.y)-csx,gy=IB.wy(tg.x,tg.y)-csy;
        if(gx<-40||gx>IB.CAMW+40||gy<-40||gy>IB.CAMH+40)continue;
        g.strokeStyle='rgba(224,74,58,'+(0.55+pul*0.45).toFixed(2)+')';g.lineWidth=2;
        g.beginPath();g.moveTo(gx-9,gy-9);g.lineTo(gx+9,gy+9);g.moveTo(gx+9,gy-9);g.lineTo(gx-9,gy+9);g.stroke();
        g.strokeStyle='rgba(224,74,58,'+(0.3+pul*0.4).toFixed(2)+')';g.lineWidth=1.5;
        g.beginPath();g.arc(gx,gy,13+pul*4,0,7);g.stroke();
      }
    }
    for(const sh of E.shaheds){
      const gx=IB.wx(sh.x,sh.y)-csx,gy=IB.wy(sh.x,sh.y)-csy;
      if(gx<-80||gx>IB.CAMW+80||gy<-140||gy>IB.CAMH+80)continue;
      /* тінь на землі — менша, коли вище */
      const sa=IB.M.max(0.14,0.4-sh.alt*0.002), sr=IB.M.max(5,13-sh.alt*0.05);
      g.fillStyle='rgba(8,10,16,'+sa.toFixed(2)+')';
      g.beginPath();g.ellipse(gx,gy,sr,sr*0.5,0,0,7);g.fill();
      /* сам шахед */
      const spr=IB.SPR.shahed;
      if(spr){
        const wob=IB.M.sin(Date.now()*0.02)*2;
        g.drawImage(spr,gx-24,gy-sh.alt-10+wob);
        if(sh.phase==='fall'){g.fillStyle='#f0d050';g.beginPath();g.arc(gx,gy-sh.alt+8+wob,2.5+IB.rnd(0,1.5),0,7);g.fill();}
      }
    }
    /* --- нічне освітлення --- */
    const nf=IB.nightFactor();
    if(nf>0.04){
      const lg=lightC.g;
      lg.clearRect(0,0,IB.CAMW,IB.CAMH);
      lg.fillStyle='rgba(8,10,30,'+(nf*0.84).toFixed(2)+')';
      lg.fillRect(0,0,IB.CAMW,IB.CAMH);
      lg.globalCompositeOperation='destination-out';
      function hole(wx2,wy2,rT,str){
        const x=IB.wx(wx2,wy2)-csx,y=IB.wy(wx2,wy2)-csy-8;
        const r=rT*16;
        if(x<-r||x>IB.CAMW+r||y<-r||y>IB.CAMH+r)return;
        const gr=lg.createRadialGradient(x,y,2,x,y,r);
        gr.addColorStop(0,'rgba(0,0,0,'+(str||0.9)+')');
        gr.addColorStop(1,'rgba(0,0,0,0)');
        lg.fillStyle=gr;lg.beginPath();lg.arc(x,y,r,0,7);lg.fill();
      }
      for(const L of lights)hole(L.x,L.y,L.r*(L.flick?0.85+IB.rnd(0,0.3):1),0.85);
      if(PL.flash&&!PL.car){
        for(let i=1;i<=4;i++)hole(PL.x+PL.fx*i*1.1,PL.y+PL.fy*i*1.1,2.4,0.5);
      }
      if(PL.car&&PL.car.engine){
        const dv=[[1,0],[-1,0],[0,1],[0,-1]][PL.car.dir];
        for(let i=1;i<=3;i++)hole(PL.car.x+dv[0]*i*1.3,PL.car.y+dv[1]*i*1.3,2.6,0.8);
        hole(PL.car.x,PL.car.y,2.2,0.5);
      }
      if(IB.MAIN&&IB.MAIN.muzzleT>0)hole(PL.x,PL.y,3.4,0.95);
      lg.globalCompositeOperation='source-over';
      g.drawImage(lightC,0,0);
    }

    /* --- ПОСТАПОКАЛІПТИЧНИЙ КОЛОР-ГРЕЙД: тепла пилова тонмапа (поверхня) / холодна волога тінь (метро) --- */
    const dayF=1-nf*0.62;
    if(IB.layer==='metro'){
      /* підземка: холодний синьо-зелений фільтр + вологость */
      g.globalCompositeOperation='multiply';
      g.fillStyle='rgb(168,190,205)';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
      g.globalCompositeOperation='source-over';
      g.fillStyle='rgba(40,60,70,0.10)';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
    } else if(IB.layer==='interior'){
      /* інтер'єр: тепле притлумлене освітлення кімнат (батч 13) */
      g.globalCompositeOperation='multiply';
      g.fillStyle='rgb(196,186,172)';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
      g.globalCompositeOperation='source-over';
      g.fillStyle='rgba(60,44,28,0.08)';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
    } else if(dayF>0.03){
      const gr2=IB.M.round(IB.lerp(255,203,dayF)), gg2=IB.M.round(IB.lerp(255,196,dayF)), gb2=IB.M.round(IB.lerp(255,178,dayF));
      g.globalCompositeOperation='multiply';
      g.fillStyle='rgb('+gr2+','+gg2+','+gb2+')';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
      g.globalCompositeOperation='source-over';
      g.fillStyle='rgba(150,124,74,'+(0.05*dayF).toFixed(3)+')';
      g.fillRect(0,0,IB.CAMW,IB.CAMH);
    }
    /* --- ПОГОДА: дощ / вітер / сонце (тільки на поверхні; у метро — краплі з стелі) --- */
    const wxT=IB.WX?IB.WX.type:'sun';
    if(IB.layer==='metro'){
      /* у тунелях: спокій, ледь помітна муть + краплі з стелі біля стін */
      const now3=Date.now();
      g.strokeStyle='rgba(150,170,200,0.30)';g.lineWidth=1;g.beginPath();
      for(let i=0;i<18;i++){
        const xx=((IB.hsh(i,3,79)*IB.CAMW+IB.M.sin(now3*0.001+i)*30)%IB.CAMW+IB.CAMW)%IB.CAMW;
        const yy=((IB.hsh(i,7,80)*IB.CAMH+now3*0.05)%IB.CAMH);
        g.moveTo(xx,yy);g.lineTo(xx,yy+5);
      }
      g.stroke();
    } else if(wxT==='rain'){
      /* холодний дощовий фільтр */
      g.globalCompositeOperation='multiply';
      g.fillStyle='rgba(148,163,196,0.42)';g.fillRect(0,0,IB.CAMW,IB.CAMH);
      g.globalCompositeOperation='source-over';
      /* краплі — швидкі косі штрихи */
      const now2=Date.now();
      g.strokeStyle='rgba(178,198,228,0.55)';g.lineWidth=1;g.beginPath();
      for(let i=0;i<64;i++){
        const sp=340+IB.hsh(i,1,71)*160;
        const yy=((IB.hsh(i,3,72)*IB.CAMH+now2*0.001*sp)%IB.CAMH);
        const xx=((IB.hsh(i,5,73)*IB.CAMW-now2*0.045)%IB.CAMW+IB.CAMW)%IB.CAMW;
        g.moveTo(xx,yy);g.lineTo(xx-2,yy+7);
      }
      g.stroke();
      /* бризки об землю */
      g.fillStyle='rgba(190,210,235,0.5)';
      for(let i=0;i<12;i++){
        const xx=((IB.hsh(i,7,74)*IB.CAMW+now2*0.02)%IB.CAMW);
        const yy=((IB.hsh(i,9,75)*IB.CAMH+now2*0.31)%IB.CAMH);
        g.fillRect(xx|0,yy|0,2,1);
      }
    } else if(wxT==='wind'){
      /* пориви: курява та листя летить поперек екрана */
      const now2=Date.now();
      for(let i=0;i<20;i++){
        const sp=(90+IB.hsh(i,1,76)*130);
        const xx=((IB.hsh(i,3,77)*IB.CAMW+now2*0.001*sp)%IB.CAMW);
        const yy=IB.hsh(i,5,78)*IB.CAMH+IB.M.sin(now2*0.004+i*1.7)*7;
        g.fillStyle=i%3?'rgba(112,122,72,0.5)':'rgba(152,142,102,0.42)';
        g.fillRect(xx|0,yy|0,2,1);
      }
      g.fillStyle='rgba(210,196,160,0.05)';g.fillRect(0,0,IB.CAMW,IB.CAMH);
    } else if(IB.layer!=='metro'){
      /* сонце: тепле сяйво */
      g.fillStyle='rgba(255,206,130,0.055)';g.fillRect(0,0,IB.CAMW,IB.CAMH);
    }
    /* --- БАТЧ 14: РАНКОВИЙ ТУМАН (5:00–9:30, поверхня) --- */
    if(IB.layer==='city'&&IB.G&&IB.G.t!=null){
      const hF=IB.G.t%24;
      const fAmp=(hF>4.6&&hF<9.6)?IB.M.sin((hF-4.6)/5*IB.M.PI)*0.55:0;
      if(fAmp>0.03){
        const nowF=Date.now();
        for(let i=0;i<4;i++){
          const yy=(0.14+0.22*i)*IB.CAMH+IB.M.sin(nowF*0.00023+i*2.1)*12;
          g.fillStyle='rgba(198,206,216,'+(fAmp*(0.13-0.024*i)).toFixed(3)+')';
          g.fillRect(0,yy,IB.CAMW,IB.CAMH*0.17);
        }
      }
    }
    /* --- ШОРОХОВАТІСТЬ: зерно кіноплівки (3 кадри, півкадровий строб) --- */
    grainT++;
    if(grainT%2===0)grainIdx=(grainIdx+1)%GRAIN.length;
    g.globalAlpha=0.085;
    g.drawImage(GRAIN[grainIdx],0,0);
    g.globalAlpha=1;
    /* --- попіл і пил у повітрі --- */
    drawAsh(g);
  }

  /* зерно: 3 детерміновані кадри шуму */
  const GRAIN=[];let grainIdx=0,grainT=0;
  (function(){
    for(let i=0;i<3;i++){
      const c=IB.mk(IB.CAMW,IB.CAMH),g2=c.g;
      const id=g2.createImageData(IB.CAMW,IB.CAMH);
      const d=id.data;
      for(let p=0;p<d.length;p+=4){
        const v=Math.random()<0.5?0:255;
        d[p]=d[p+1]=d[p+2]=v;
        d[p+3]=(Math.random()*70)|0;
      }
      g2.putImageData(id,0,0);
      GRAIN.push(c);
    }
  })();
  /* попіл: дрейфує з вітром */
  const ASH=[];(function(){for(let i=0;i<34;i++)ASH.push({x:IB.rnd(0,IB.CAMW),y:IB.rnd(0,IB.CAMH),v:IB.rnd(6,16),sw:IB.rnd(0,6.28),a:IB.rnd(0.25,0.7),s:IB.rnd(0.7,1.6)});})();
  let ashLast=0;
  function drawAsh(g){
    const now=performance.now();let dt=(now-ashLast)/1000;ashLast=now;
    dt=IB.clamp(dt,0,0.05);
    const windF=(IB.WX&&IB.WX.type==='wind')?3.1:(IB.WX&&IB.WX.type==='rain'?0.4:1);
    g.fillStyle='#c8c2b2';
    for(const f of ASH){
      f.sw+=dt*1.6;
      f.y+=f.v*dt*windF; f.x+=(6+IB.M.sin(f.sw)*8)*dt*windF;
      if(f.y>IB.CAMH+4){f.y=-4;f.x=IB.rnd(0,IB.CAMW);}
      if(f.x>IB.CAMW+4)f.x=-4;
      g.globalAlpha=f.a*0.55;
      const sz=f.s>1.2?2:1;
      g.fillRect(f.x|0,f.y|0,sz,sz);
    }
    g.globalAlpha=1;
  }

  /* ---------- БАТЧ 12/15: HUD — мінімапа (ЛОКАЛЬНО / ПЛАН МІСТА) + GPS-НАВІГАТОР (червона лінія) ---------- */
  const WAYC='#ff5040';                        /* червона лінія навігатора */
  function distTxt(d){return '≈'+IB.M.round(d*8)+' м';}
  /* ---- БАТЧ 15: BFS-пошук шляху по тайлах (обхід колізій) — червона лінія навігатора ---- */
  function computeRoute(sx,sy,tx,ty){
    const W=IB.WORLD;if(!W)return null;
    sx|=0;sy|=0;tx|=0;ty|=0;
    if(!W.inb(sx,sy)||!W.inb(tx,ty))return null;
    if(W.solid(tx,ty)){const f=W.freeSpot(tx,ty);if(!f)return null;tx=f.x|0;ty=f.y|0;}
    if(W.solid(sx,sy)){const f=W.freeSpot(sx,sy);if(f){sx=f.x|0;sy=f.y|0;}}
    const WW=W.W,WH=W.H,N=WW*WH;
    const prev=new Int32Array(N).fill(-1);
    const q=new Int32Array(N);let qh=0,qt=0;
    const si=sy*WW+sx, ti=ty*WW+tx;
    if(si===ti)return [[sx+0.5,sy+0.5],[tx+0.5,ty+0.5]];
    prev[si]=si;q[qt++]=si;
    let found=false;
    while(qh<qt){
      const cur=q[qh++];
      if(cur===ti){found=true;break;}
      const x=cur%WW,y=(cur/WW)|0;
      for(let d=0;d<4;d++){
        const nx=x+(d===0?1:d===1?-1:0), ny=y+(d===2?1:d===3?-1:0);
        if(nx<0||ny<0||nx>=WW||ny>=WH)continue;
        const ni=ny*WW+nx;
        if(prev[ni]!==-1||W.blk[ni])continue;
        prev[ni]=cur;q[qt++]=ni;
      }
    }
    if(!found)return null;
    const pts=[];let cur=ti;
    while(cur!==si){pts.push([cur%WW+0.5,((cur/WW)|0)+0.5]);cur=prev[cur];if(pts.length>8000)return null;}
    pts.push([sx+0.5,sy+0.5]);
    pts.reverse();
    return pts;
  }
  function routeLen(pts){let L=0;for(let i=1;i<pts.length;i++)L+=IB.dist(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1]);return L;}
  function ensureRoute(){
    const G=IB.G,PL=IB.PL,W=IB.WORLD;
    const way=G.flags&&G.flags.way;
    if(!way||!PL||!W)return null;
    const now=Date.now();
    if(G.route&&G.route.tx===way.x&&G.route.ty===way.y&&now-G.route.t<2500&&G.route.layer===IB.layer)return G.route;
    const pts=computeRoute(PL.x,PL.y,way.x,way.y);
    G.route={pts,tx:way.x,ty:way.y,t:now,layer:IB.layer,len:pts?routeLen(pts):IB.dist(PL.x,PL.y,way.x,way.y)};
    return G.route;
  }
  function drawRoutePath(g,P,maxPts){
    const G=IB.G;
    const r=ensureRoute();
    if(!r||!r.pts||r.pts.length<2)return false;
    g.strokeStyle=WAYC;g.lineWidth=1.4;
    const st=Math.max(1,Math.floor(r.pts.length/(maxPts||140)));
    g.beginPath();
    let first=true;
    for(let i=0;i<r.pts.length;i+=st){const[a,b]=P(r.pts[i][0],r.pts[i][1]);if(first){g.moveTo(a,b);first=false;}else g.lineTo(a,b);}
    const le=r.pts[r.pts.length-1];const[lx,ly]=P(le[0],le[1]);
    g.lineTo(lx,ly);g.stroke();g.lineWidth=1;
    return true;
  }
  function drawMinimapHUD(g){
    const W=IB.WORLD,PL=IB.PL,G=IB.G;
    if(!W||!PL)return;
    g.imageSmoothingEnabled=false;
    const SZ=120,PLAN=G.mmMode==='plan',NOW=Date.now();
    g.fillStyle='#07080d';g.fillRect(0,0,SZ,SZ);
    function dot(x,y,c,r){g.fillStyle=c;g.fillRect(x-r,y-r,r*2,r*2);}
    function tri(x,y,c){g.fillStyle=c;g.beginPath();g.moveTo(x,y-4);g.lineTo(x+4,y+3);g.lineTo(x-4,y+3);g.closePath();g.fill();}
    const way=G.flags.way;
    if(PLAN){
      /* ПЛАН МІСТА: вся карта 320x384 у мінікарті + усі позначки + GPS-лінія */
      const sc=SZ/W.H,mw=W.W*sc,ox=(SZ-mw)/2;
      g.drawImage(W.mm,0,0,W.W,W.H,ox,0,mw,SZ);
      const P=(wx,wy)=>[ox+wx*sc,wy*sc];
      for(const s of W.safes){const[a,b]=P(s.x,s.y);dot(a,b,'#4ee06a',1.5);}
      if(W.base){const[a,b]=P(W.base.x,W.base.y);tri(a,b,'#38d8b0');}
      for(const st of W.stations){const[a,b]=P(st.x,st.y);dot(a,b,NOW%700<350?'#cc4438':'#8a2820',1.5);}
      for(const t of W.towers){const[a,b]=P(t.x,t.y);dot(a,b,'#38b8d8',1.5);}
      for(const l of W.lms){if(l.key==='radio_tower'||l.key==='mm13')continue;const[a,b]=P(l.x+l.wT/2,l.y+l.dT/2);dot(a,b,'#f0d050',1);}
      for(const gs of W.gas||[]){const[a,b]=P(gs.x,gs.y);dot(a,b,'#e08a30',1.5);}   /* батч 15: АЗС */
      /* КВЕСТ «НЕДОСТАВЛЕНІ»: конверти на плані міста */
      for(const lt of W.letters||[]){const[a,b]=P(lt.x,lt.y);dot(a,b,NOW%600<300?'#f0d050':'#9a7a20',2);}
      /* БАТЧ 15: озеро, гори, села + ПОЗНАЧКИ гравця */
      if(W.lake){const[a,b]=P(W.lake.x,W.lake.y);g.strokeStyle='#5aa0e0';g.strokeRect(a-2,b-1.5,4,3);}
      if(W.mtn){const[a,b]=P(W.mtn.x,W.mtn.y);tri(a,b,'#c8c8c8');}
      for(const v of W.villages||[]){const[a,b]=P(v.x,v.y);dot(a,b,'#8ae08a',1.5);}
      for(const pn of G.flags.pins||[]){const[a,b]=P(pn.x,pn.y);g.save();g.translate(a,b);g.rotate(IB.M.PI/4);g.fillStyle='#f0d050';g.fillRect(-2,-2,4,4);g.restore();}
      const m=IB.MISSIONS[G.mi];
      if(m&&!G.ending&&IB.layer!=='metro'){const[a,b]=P(m.x,m.y);tri(a,b,NOW%400<200?'#f0d050':'#c8a020');}
      if(G.flags.drop){const[a,b]=P(G.flags.drop.x,G.flags.drop.y);dot(a,b,'#e04a3a',2);}
      const SH=IB.G.shah;
      if(SH&&SH.phase&&IB.layer!=='metro')for(const tg of SH.targets){const[a,b]=P(tg.x,tg.y);tri(a,b,NOW%260<130?'#e04a3a':'#8a2a20');}
      const[px2,py2]=P(PL.x,PL.y);
      dot(px2,py2,NOW%300<150?'#ffffff':'#d6dae6',2);
      /* рамка поточного локального виду */
      const SP=52,sx=IB.clamp(PL.x-SP/2,0,W.W-SP),sy=IB.clamp(PL.y-SP/2,0,W.H-SP);
      g.strokeStyle='#ffffff88';g.strokeRect(ox+sx*sc,sy*sc,SP*sc,SP*sc);
      /* БАТЧ 15: GPS — ЧЕРВОНА ЛІНІЯ НАВІГСАЦІЇ по тайлах + точка */
      if(way){
        const[wx2,wy2]=P(way.x,way.y);
        drawRoutePath(g,P,90);
        g.fillStyle=WAYC;g.fillRect(wx2-2,wy2-4,4,4);g.fillRect(wx2-1,wy2-6,2,2);
        const r=G.route;
        if(r&&r.pts&&r.pts.length<2){g.strokeStyle=WAYC;g.setLineDash([3,3]);g.beginPath();g.moveTo(px2,py2);g.lineTo(wx2,wy2);g.stroke();g.setLineDash([]);}
      }
      g.font='6px monospace';g.textAlign='left';
      g.fillStyle='#f0d050';g.fillText('ПЛАН',3,8);
      g.fillStyle='#8a92a8';g.textAlign='right';g.fillText('P — ЛОКАЛЬНО',SZ-3,8);
    } else {
      /* ЛОКАЛЬНИЙ РЕЖИМ: зона навколо героя */
      const SP=52;
      const sx=IB.clamp(PL.x-SP/2,0,W.W-SP),sy=IB.clamp(PL.y-SP/2,0,W.H-SP);
      g.drawImage(W.mm,sx,sy,SP,SP,0,0,SZ,SZ);
      const P=(wx,wy)=>[(wx-sx)*SZ/SP,(wy-sy)*SZ/SP];
      function mark(wx2,wy2,col,o){
        o=o||{};const[x,y]=P(wx2,wy2);
        if(x<2||x>SZ-2||y<2||y>SZ-2)return;
        if(o.tri)tri(x,y,col);else dot(x,y,col,o.r||2);
      }
      const m=IB.MISSIONS[G.mi];
      if(m&&!G.ending&&IB.layer!=='metro'){
        const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
        mark(tx+0.5,ty+0.5,NOW%400<200?'#f0d050':'#c8a020',{tri:true});
      }
      if(IB.layer!=='metro')for(const s of W.safes)mark(s.x,s.y,'#4ee06a');
      if(W.base)mark(W.base.x,W.base.y,'#38d8b0',{tri:true});
      for(const st of W.stations)mark(st.x,st.y,NOW%700<350?'#cc4438':'#8a2820',{r:2.5});
      if(IB.layer!=='metro'){
        for(const tw of W.towers)if(IB.dist(PL.x,PL.y,tw.x,tw.y)<40)mark(tw.x,tw.y,NOW%400<200?'#38b8d8':'#1a5a70');
        /* КВЕСТ «НЕДОСТАВЛЕНІ»: конверти поблизу */
        for(const lt of W.letters||[])mark(lt.x,lt.y,NOW%600<300?'#f0d050':'#9a7a20',{r:2});
        for(const l of W.lms){if(l.key==='radio_tower'||l.key==='mm13')continue;if(IB.dist(PL.x,PL.y,l.x,l.y)<40)mark(l.x+l.wT/2,l.y+l.dT/2,'#f0d050',{r:1.5});}
        for(const np of IB.ENTS.npcs||[])if(np.state!=='follow'&&IB.dist(PL.x,PL.y,np.x,np.y)<40)mark(np.x,np.y,'#e08a30',{r:1.5});
      }
      if(G.flags.drop)mark(G.flags.drop.x,G.flags.drop.y,'#e04a3a',{r:2.5});
      const SH=IB.G.shah;
      if(SH&&SH.phase&&IB.layer!=='metro')for(const tg of SH.targets)mark(tg.x,tg.y,NOW%260<130?'#e04a3a':'#8a2a20',{tri:true});
      for(const sv of IB.ENTS.survivors){if(sv.state==='help')mark(sv.x,sv.y,NOW%400<200?'#f0d050':'#c8a020');}
      /* ТОЧКА МАРШРУТУ + GPS: пунктир або стрілка на краю + відстань */
      if(way){
        const[wx2,wy2]=P(way.x,way.y),[px2,py2]=P(PL.x,PL.y);
        const inside=wx2>4&&wx2<SZ-4&&wy2>4&&wy2<SZ-4;
        const dd=IB.dist(PL.x,PL.y,way.x,way.y);
        drawRoutePath(g,P,110);   /* батч 15: червона лінія навігатора */
        if(inside){
          g.fillStyle=WAYC;g.fillRect(wx2-2,wy2-4,4,4);g.fillRect(wx2-1,wy2-6,2,2);  /* прапорець */
        }else{
          let dx2=wx2-px2,dy2=wy2-py2;const L=IB.M.hypot(dx2,dy2)||1;dx2/=L;dy2/=L;
          let t=1e9;
          if(dx2>0)t=IB.M.min(t,(SZ-7-px2)/dx2);if(dx2<0)t=IB.M.min(t,(7-px2)/dx2);
          if(dy2>0)t=IB.M.min(t,(SZ-11-py2)/dy2);if(dy2<0)t=IB.M.min(t,(7-py2)/dy2);
          const ex=px2+dx2*t,ey=py2+dy2*t;
          g.fillStyle=WAYC;
          g.save();g.translate(ex,ey);g.rotate(IB.M.atan2(dy2,dx2));
          g.beginPath();g.moveTo(5,0);g.lineTo(-3,-4);g.lineTo(-3,4);g.closePath();g.fill();g.restore();
        }
        g.font='6px monospace';g.textAlign='center';
        g.fillStyle='#0b0d14cc';g.fillRect(SZ/2-21,SZ-10,42,8);
        g.fillStyle=WAYC;g.fillText(distTxt(dd),SZ/2,SZ-4);
      }
      const pxx=(PL.x-sx)*SZ/SP,pyy=(PL.y-sy)*SZ/SP;
      dot(pxx,pyy,NOW%300<150?'#ffffff':'#d6dae6',2);
      g.strokeStyle='#ffffff';g.beginPath();g.moveTo(pxx,pyy);g.lineTo(pxx+PL.fx*7,pyy+PL.fy*7);g.stroke();
    }
    g.strokeStyle='#3c4356';g.strokeRect(0.5,0.5,SZ-1,SZ-1);
  }

  /* ---------- HUD: компас ---------- */
  function drawCompass(g){
    const PL=IB.PL,G=IB.G,W=IB.WORLD;
    g.clearRect(0,0,176,18);
    g.fillStyle='#0b0d14cc';g.fillRect(0,0,176,18);
    if(!PL||!W)return;
    const center=IB.M.atan2(PL.fx,-PL.fy);
    function rel(b){let r=b-center;while(r>IB.M.PI)r-=2*IB.M.PI;while(r<-IB.M.PI)r+=2*IB.M.PI;return r;}
    g.font='7px monospace';g.textAlign='center';
    for(const[lt,b]of[['N',0],['E',IB.M.PI/2],['S',IB.M.PI],['W',-IB.M.PI/2]]){
      const x=88+rel(b)*52;
      if(x>6&&x<170){g.fillStyle=lt==='N'?'#e04a3a':'#8a92a8';g.fillText(lt,x,9);}
    }
    function mk(b,col,shape){
      const x=88+rel(b)*52;
      if(x<6||x>170)return;
      g.fillStyle=col;
      if(shape==='d'){g.beginPath();g.moveTo(x,11);g.lineTo(x+3,14);g.lineTo(x,17);g.lineTo(x-3,14);g.closePath();g.fill();}
      else g.fillRect(x-2,12,4,4);
    }
    const m=IB.MISSIONS[G.mi];
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      mk(IB.M.atan2(tx+0.5-PL.x,-(ty+0.5-PL.y)),'#f0d050','d');
    }
    let ns=null,nsd=1e9;
    for(const s of W.safes){const d=IB.dist(PL.x,PL.y,s.x,s.y);if(d<nsd){nsd=d;ns=s;}}
    if(ns)mk(IB.M.atan2(ns.x-PL.x,-(ns.y-PL.y)),'#4ee06a');
    for(const tw of W.towers){
      if(IB.dist(PL.x,PL.y,tw.x,tw.y)<26)mk(IB.M.atan2(tw.x-PL.x,-(tw.y-PL.y)),IB.M.floor(Date.now()/400)%2?'#38b8d8':'#1a5a70');
    }
    if(G.flags.drop)mk(IB.M.atan2(G.flags.drop.x-PL.x,-(G.flags.drop.y-PL.y)),'#e04a3a');
    const SH3=IB.G.shah;
    if(SH3&&SH3.phase){for(const tg of SH3.targets)mk(IB.M.atan2(tg.x-PL.x,-(tg.y-PL.y)),IB.M.floor(Date.now()/260)%2?'#e04a3a':'#8a2a20');}
    if(W.base)mk(IB.M.atan2(W.base.x-PL.x,-(W.base.y-PL.y)),'#38d8b0','d');
    /* КВЕСТ «НЕДОСТАВЛЕНІ»: найближчий конверт — золота позначка на компасі */
    {let nlt=null,nld=1e9;
      for(const lt of W.letters||[]){const d=IB.dist(PL.x,PL.y,lt.x,lt.y);if(d<nld){nld=d;nlt=lt;}}
      if(nlt&&nld<80)mk(IB.M.atan2(nlt.x-PL.x,-(nlt.y-PL.y)),IB.M.floor(Date.now()/500)%2?'#f0d050':'#9a7a20');
    }
    /* БАТЧ 12: точка маршруту — рожевий ромб-компас */
    if(G.flags.way)mk(IB.M.atan2(G.flags.way.x-PL.x,-(G.flags.way.y-PL.y)),WAYC,'d');
    g.strokeStyle='#3c4356';g.strokeRect(0.5,0.5,175,17);
  }

  /* ---------- БАТЧ 12: ВЕЛИКА КАРТА-ПЛАН (720x580) — райони, усі позначки з назвами,
     точка маршруту кліком, GPS-лінія, права панель-список об'єктів (DOM у main.js) ---------- */
  /* БАТЧ 16: якорі районів зсунуті (+60,+80 — мапа виросла), + 6 нових районів області */
  /* БАТЧ 17: усі якорі зсунуті на +240 (карта виросла на захід), + 8 нових районів */
  const ANCH=[[336,116],[395,175],[390,220],[420,230],[442,232],[440,255],[447,256],[451,279],[496,150],[455,208],[496,265],[370,285],[452,170],[362,410],[496,106],
    [516,160],[640,150],[710,126],[672,224],[578,168],[694,296],[552,550],
    [270,196],[326,36],[592,52],[270,432],[764,226],[365,628],
    [278,258],[196,252],[88,248],[383,338],[383,400],[378,470],[302,506],[296,368]];
  const LMN={sophia_cath:'СОФІЙСЬКИЙ СОБОР',sophia_bell:'ДЗВІНИЦЯ СОФІЇ',golden_gate:'ЗОЛОТІ ВОРОТА',
    maidan_col:'МОНУМЕНТ НЕЗАЛЕЖНОСТІ',lachida:'ЛАЧІДА-ВОРОТА',lavra_cath:'УСПЕНСЬКИЙ СОБОР',
    lavra_bell:'ЛАВРСЬКА ДЗВІНИЦЯ',lavra_refect:'ТРАПЕЗНА ЛАВРИ',caves_chapel:'ПЕЧЕРИ ЛАВРИ',
    st_andrew:'АНДРІЇВСЬКА ЦЕРКВА',motherland:'БАТЬКІВЩИНА-МАТИ',museum:'МУЗЕЙ ІСТОРІЇ',
    gostyny:'ГОСТИННИЙ ДВІР',samson:'ФОНТАН САМСОН',chapel:'КАПЛИЦЯ СЕЛИЩА ІРПІНЬ',
    chapel2:'ЦЕРКВКА ПУХІВКИ',chapel3:'ЦЕРКОВКА НОВИХ ПЕТРІВЦІВ'};
  /* короткі назви ДЛЯ ПОЛОТНА (у списку справа — повні) */
  const DSC=['ОБОЛОНЬ','ПОДІЛ','СТАРЕ МІСТО','ХРЕЩАТИК','МАЙДАН','ПЕЧЕРСЬК','ЛАВРА','БАТЬКІВЩИНА','ЛІВИЙ БЕРЕГ','ГІДРОПАРК','ПРОМЗОНА','ВОКАЗАЛ','ДНІПРО','ІРПІНЬ','ТРОЄЩИНА',
    'ВИГУРІВЩИНА','ДЕСНА','БРОВАР. ЛІС','ПУХІВКА','ХАРКІВСЬКИЙ','РОЖНИ','ТРИПІЛЬСЬКА Г.',
    'МОЩУН','ВИШГОРОД','ПЕТРІВЦІ','БУЧА','БРОВАРИ','ТРИПІЛЛЯ',
    'ШУЛЯВКА','СВЯТОШИН','АКАДЕМ.','ЛИБІДСЬКА','ДЕМІЇВСЬКА','ІПОДРОМ','ВИШНЕВЕ','ГОЛОСІЇВ'];
  const LMNS={sophia_cath:'СОФІЯ',sophia_bell:'СОФІЯ-ДЗВ',golden_gate:'ЗОЛОТІ ВОРОТА',maidan_col:'МОНУМЕНТ',
    lachida:'ЛАЧІДА',lavra_cath:'УСПЕНСЬКИЙ',lavra_bell:'ЛАВРА-ДЗВ',lavra_refect:'ТРАПЕЗНА',caves_chapel:'ПЕЧЕРИ',
    st_andrew:'АНДРІЇВСЬКА',motherland:'Б.-МАТИ',museum:'МУЗЕЙ',gostyny:'ГОСТИННИЙ',samson:'САМСОН',chapel:'КАПЛИЦЯ'};
  const STS=n=>n==='МАЙДАН НЕЗАЛЕЖНОСТІ'?'МАЙДАН':n==='КОНТРАКТОВА ПЛОЩА'?'КОНТРАКТОВА':n;
  const MV={mx:0,my:0,s:1,mw:0,mh:0};
  function mapView(){return{mx:MV.mx,my:MV.my,s:MV.s,mw:MV.mw,mh:MV.mh};}
  function poiList(){
    const W=IB.WORLD,G=IB.G,out={metro:IB.layer==='metro',dist:[],st:[],safe:[],lm:[],tw:[],base:null,rooms:[],blds:[],gas:[],fn:[],stad:[],geo:[],pins:[]};
    if(!W)return out;
    if(out.metro){
      for(const st of W.stations)out.st.push({x:st.x,y:st.y,n:st.n});
      for(const r of IB.MROOMS||[])out.rooms.push({x:r.x,y:r.y,n:r.n});
      return out;
    }
    for(let z=0;z<IB.ZONES.length;z++){const a=ANCH[z]||[10,10];out.dist.push({x:a[0],y:a[1],n:IB.ZONES[z].n,v:!!G.visited[z]});}
    for(const st of W.stations)out.st.push({x:st.x,y:st.y,n:st.n});
    for(const s of W.safes)out.safe.push({x:s.x,y:s.y,n:s.n||'СХОВАНКА'});
    for(const l of W.lms){
      if(l.key==='radio_tower'||l.key==='mm13')continue;
      out.lm.push({x:l.x+l.wT/2,y:l.y+l.dT/2,n:LMN[l.key]||l.key.toUpperCase()});
    }
    for(const t of W.towers)out.tw.push({x:t.x,y:t.y,n:t.n});
    if(W.base)out.base={x:W.base.x,y:W.base.y,n:'БАЗА ВВ13 • КПІ'};
    /* БАТЧ 14: АЗС, FN<, СТАДІОНИ */
    for(const gs of W.gas||[])out.gas.push({x:gs.x,y:gs.y,n:gs.n});
    for(const l of W.lms){
      if(l.key==='stadium'||l.key==='stadium2')out.stad.push({x:l.x+l.wT/2,y:l.y+l.dT/2,n:l.key==='stadium'?'СТАДІОН ІМ. ЛОБАНОВСЬКОГО':'СТАДІОН ТРОЄЩИНИ'});
    }
    /* БАТЧ 15: озеро, гори, села за Десною, мости-чекпоїнти */
    if(W.lake)out.geo.push({x:W.lake.x,y:W.lake.y,n:W.lake.n});
    if(W.mtn)out.geo.push({x:W.mtn.x,y:W.mtn.y,n:W.mtn.n});
    for(const v of W.villages||[])out.geo.push({x:v.x,y:v.y,n:v.n});
    for(const bn of W.bridges||[]){out.geo.push({x:bn[2]||228,y:bn[0],n:bn[1]});}
    for(const pn of G.flags.pins||[])out.pins.push({x:pn.x,y:pn.y,n:pn.n,i:pn.i});
    if(IB.CWORLD&&IB.CWORLD.blds){
      for(let i=0;i<IB.CWORLD.blds.length;i++){
        const b=IB.CWORLD.blds[i];
        if(b.cat==='fnmarket')out.fn.push({x:b.door?b.door.x:b.x+b.wT/2,y:b.door?b.door.y:b.y+b.dT,n:'FN< • '+(IB.ZONES[b.zone]?IB.ZONES[b.zone].n:'')});
      }
    }
    /* БАТЧ 13: будівлі зі статусом (заражені/звільнені) — найближчі 12 */
    const CW2=IB.CWORLD;
    if(CW2&&CW2.blds){
      const arr=[];
      for(let i=0;i<CW2.blds.length;i++){
        const b=CW2.blds[i];
        if(!b.door)continue;
        const st=IB.bldState(i);
        arr.push({x:b.door.x,y:b.door.y,n:'БУДИНОК '+(i+1)+' • '+(IB.ZONES[b.zone]?IB.ZONES[b.zone].n:'')+' • П'+(b.floors||2)+(st.cleared?' ✓':''),i,st:!!st.cleared});
      }
      arr.sort((a,b)=>IB.dist(IB.PL.x,IB.PL.y,a.x,a.y)-IB.dist(IB.PL.x,IB.PL.y,b.x,b.y));
      out.blds=arr.slice(0,12);
    }
    return out;
  }
  /* ---- БАТЧ 13: оверлей РАЙОНІВ (кольорові зони + межі) — будується один раз на місто ---- */
  const ZCOL=['#39506b','#54406e','#6b5632','#6e6a3a','#75602f','#6b423a','#554868','#6e3f42','#465046','#406050','#4f4f3c','#404050','#26435e','#33523c','#5c4a8a','#8a5a3a','#1e3e68','#1e4a28','#3e6848','#4a5868','#6e5a30','#5a5040',
    '#2e4a32','#4a4238','#3e5242','#544430','#3c4a5c','#504434',
    '#5a5468','#4e6258','#445866','#6e5a4a','#64503e','#5e6a44','#6a5638','#2e5a30'];
  let _zov=null,_zovW=null;
  function zoneOv(){
    const W=IB.CWORLD;
    if(!W)return null;
    if(_zov&&_zovW===W)return _zov;
    const c=IB.mk(W.W,W.H),g2=c.g;
    for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++){
      const z=W.zone[W.ridx(x,y)];
      if(!z)continue;
      g2.fillStyle=ZCOL[z%ZCOL.length];
      g2.fillRect(x,y,1,1);
    }
    /* межі районів — світлі пікселі по контуру */
    for(let y=0;y<W.H;y++)for(let x=0;x<W.W;x++){
      const z=W.zone[W.ridx(x,y)];
      if(!z)continue;
      const r=W.inb(x+1,y)?W.zone[W.ridx(x+1,y)]:0,d=W.inb(x,y+1)?W.zone[W.ridx(x,y+1)]:0;
      if(r!==z||d!==z){g2.fillStyle='rgba(240,228,190,0.5)';g2.fillRect(x,y,1,1);}
    }
    _zov=c;_zovW=W;
    return c;
  }
  /* ---- зум карти (кнопки + колесо) і панорамування (перетягування) ---- */
  MV.z=1;MV.px=0;MV.py=0;
  function mapZoom(d){
    if(d===0){MV.z=1;MV.px=0;MV.py=0;}
    else MV.z=IB.clamp((MV.z||1)*(d>0?1.4:1/1.4),1,3.6);
  }
  function mapPan(dx,dy){MV.px=(MV.px||0)+dx;MV.py=(MV.py||0)+dy;}
  function drawBigMap(g){
    const W=IB.WORLD,PL=IB.PL,G=IB.G,CW=720,CH=580;
    g.imageSmoothingEnabled=false;
    g.fillStyle='#07080d';g.fillRect(0,0,CW,CH);
    if(!W)return;
    const metroL=IB.layer==='metro',NOW=Date.now();
    /* --- геометрія: вікно карти ліворуч, права панель (DOM) 210px; зум + панорама --- */
    const availW=CW-16-210-14, availH=CH-36-44;
    const baseS=IB.M.min(availW/W.W,availH/W.H);
    const z=MV.z||1, s=baseS*z;
    const mw=W.W*s, mh=W.H*s;
    let px=MV.px||0, py=MV.py||0;
    px=mw<=availW?0:IB.clamp(px,availW-mw,0);
    py=mh<=availH?0:IB.clamp(py,availH-mh,0);
    MV.px=px;MV.py=py;
    const mx=16+(mw<availW?(availW-mw)/2:px);
    const my=36+(mh<availH?(availH-mh)/2:py);
    MV.mx=mx;MV.my=my;MV.s=s;MV.mw=mw;MV.mh=mh;
    /* --- заголовок + індикатор зуму --- */
    g.font='bold 13px monospace';g.textAlign='left';
    g.fillStyle='#f0d050';
    g.fillText(metroL?'МЕТРО • СХЕМА ТУНЕЛІВ — 2-ГА МАПА':'ПЛАН МІСТА КИЇВ — РАЙОНИ • БУДИНКИ • GPS',16,24);
    let vz=0;for(const k in G.visited)if(G.visited[k])vz++;
    g.font='9px monospace';g.textAlign='right';g.fillStyle='#cfd4e2';
    g.fillText((metroL?'СТАНЦІЇ: ':'РАЙОНИ: ')+(metroL?W.stations.length:vz+'/'+IB.ZONES.length)+' • ЗУМ ×'+(IB.M.round(z*10)/10)+' • КЛІК — ТОЧКА МАРШРУТУ',CW-232,24);
    /* --- вікно перегляду (кліп) --- */
    g.save();g.beginPath();g.rect(15,35,availW+2,availH+2);g.clip();
    g.drawImage(W.mm,mx,my,mw,mh);
    /* ---- КОЛЬОРОВІ РАЙОНИ (місто) ---- */
    if(!metroL){const zo=zoneOv();if(zo)g.drawImage(zo,mx,my,mw,mh);}
    /* сітка плану */
    g.strokeStyle='rgba(28,34,48,0.7)';g.lineWidth=1;
    for(let gx=32;gx<W.W;gx+=32){const sx=mx+gx*s;if(sx<15||sx>15+availW)continue;g.beginPath();g.moveTo(sx,my);g.lineTo(sx,my+mh);g.stroke();}
    for(let gy=32;gy<W.H;gy+=32){const sy=my+gy*s;if(sy<35||sy>35+availH)continue;g.beginPath();g.moveTo(mx,sy);g.lineTo(mx+mw,sy);g.stroke();}
    const P=(wx,wy)=>[mx+wx*s,my+wy*s];
    function label(nm,x,y,c,f){
      g.font=(f||(7+IB.M.min(3,z-1)*1.2))+'px monospace';g.textAlign='left';g.fillStyle=c;
      g.fillText(nm,IB.clamp(x,mx+2,mx+mw-4),IB.clamp(y,my+10,my+mh-2));
    }
    const fs=7+IB.M.min(3,(z-1)*1.2);
    if(!metroL){
      /* ---- РАЙОНИ: назви з плашками ---- */
      for(let zi=0;zi<IB.ZONES.length&&zi<ANCH.length;zi++){
        const a=ANCH[zi],[x,y]=P(a[0],a[1]);
        const nm=(DSC[zi]||IB.ZONES[zi].n)+(G.visited[zi]?'':' ?');
        g.font='bold '+fs+'px monospace';
        const tw2=g.measureText(nm).width;
        g.fillStyle='rgba(8,10,16,0.62)';g.fillRect(x-3,y-fs+1,tw2+7,fs+4);
        g.fillStyle=G.visited[zi]?'#f0d050':'#b8bcc8';
        g.fillText(nm,x,y+1);
      }
      /* ---- БУДИНОК: червоні (заражені) / зелені (звільнені) ---- */
      const CW2=IB.CWORLD;
      if(CW2&&CW2.blds){
        for(let bi=0;bi<CW2.blds.length;bi++){
          const b=CW2.blds[bi];
          if(!b.door)continue;
          const[x,y]=P(b.door.x,b.door.y);
          if(x<mx-6||x>mx+mw+6||y<my-6||y>my+mh+6)continue;
          const cl=IB.bldState(bi).cleared;
          const big=z>=1.8;
          if(big){
            g.fillStyle=cl?'#3a6e48':'#5e3a30';g.fillRect(x-3,y-4,6,4);
            g.fillStyle=cl?'#5ecc82':'#e06a50';g.beginPath();g.moveTo(x-4,y-4);g.lineTo(x,y-8);g.lineTo(x+4,y-4);g.closePath();g.fill();
            if(cl){g.fillStyle='#c8ffd8';g.fillRect(x-1,y-3,2,2);}
          } else {
            g.fillStyle=cl?'#5ecc82':NOW%1600<800?'#e06a50':'#8a4030';
            g.fillRect(x-1.5,y-1.5,3,3);
          }
        }
      }
    }
    /* --- СТАНЦІЇ МЕТРО: червона М + назва --- */
    for(const st of W.stations){
      const[x,y]=P(st.x,st.y);
      if(x<mx-12||x>mx+mw+12||y<my-12||y>my+mh+12)continue;
      g.fillStyle=NOW%700<350?'#cc4438':'#8a2820';g.fillRect(x-5,y-5,10,10);
      g.fillStyle='#f4f4f8';g.font='bold 8px monospace';g.textAlign='center';g.fillText('M',x,y+3);
      label(STS(st.n),x+8,y+3,IB.dist(PL.x,PL.y,st.x,st.y)<9?'#f0d050':'#9aa0ae');
    }
    if(metroL){
      /* ---- СПЕЦКІМНАТИ метро: С серверна / В майстерня / К котельня / Н насосна / Ц цех (батч 15) ---- */
      const RC={srv:['#38b8d8','С'],wrk:['#e08a30','В'],boil:['#d84a38','К'],pump:['#4e7ec8','Н'],hall:['#d8b040','Ц']};
      for(const r of IB.MROOMS||[]){
        const[x,y]=P(r.x,r.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        const cc=RC[r.ty]||RC.wrk;
        g.fillStyle=cc[0];
        g.fillRect(x-4,y-4,8,8);
        g.fillStyle='#0b0d14';g.font='bold 6px monospace';g.textAlign='center';
        g.fillText(r.letter||cc[1],x,y+2);
        if(z>=1.6)label(r.n,x+6,y+2,cc[0]);
      }
    } else {
      /* --- СХОВАНКИ (зелені ⌂) --- */
      for(const sf of W.safes){
        const[x,y]=P(sf.x,sf.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.fillStyle='#4ee06a';g.fillRect(x-4,y-3,8,6);g.beginPath();g.moveTo(x-5,y-3);g.lineTo(x,y-7);g.lineTo(x+5,y-3);g.closePath();g.fill();
        label(sf.n,x+7,y+2,'#6ad88a');
      }
      /* --- ЛОКАЦІЇ-ДОМІНАНТИ (золоті ◆) --- */
      for(const l of W.lms){
        if(l.key==='radio_tower'||l.key==='mm13')continue;
        const[x,y]=P(l.x+l.wT/2,l.y+l.dT/2);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.save();g.translate(x,y);g.rotate(IB.M.PI/4);g.fillStyle='#f0d050';g.fillRect(-3.5,-3.5,7,7);g.restore();
        g.strokeStyle='#0b0d14';g.strokeRect(x-3.5,y-3.5,7,7);
        label(LMNS[l.key]||LMN[l.key]||l.key,x+7,y+3,'#d8c060');
      }
      /* --- РАДІОВЕЖІ --- */
      for(const tw of W.towers){
        const[x,y]=P(tw.x,tw.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.fillStyle=NOW%400<200?'#38b8d8':'#1a5a70';g.beginPath();g.moveTo(x,y-7);g.lineTo(x+5,y+4);g.lineTo(x-5,y+4);g.closePath();g.fill();
      }
      /* --- БАЗА ВВ13 --- */
      if(W.base){
        const[x,y]=P(W.base.x,W.base.y);
        g.fillStyle='#38d8b0';g.fillRect(x-5,y-5,10,10);g.fillStyle='#0b0d14';g.font='bold 7px monospace';g.textAlign='center';g.fillText('B',x,y+3);
        label('ВВ13 • КПІ',x+8,y+3,'#38d8b0');
      }
      /* --- БАТЧ 14: АЗС (оранжеві Ф) --- */
      for(const gs of W.gas||[]){
        const[x,y]=P(gs.x,gs.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.fillStyle=NOW%900<450?'#e08a30':'#a85a18';g.fillRect(x-4,y-4,8,8);
        g.fillStyle='#0b0d14';g.font='bold 7px monospace';g.textAlign='center';g.fillText('Ф',x,y+3);
        label('АЗС',x+7,y+3,'#e8a860');
      }
      /* --- БАТЧ 14: СУПЕРМАРКЕТИ FN< (червоні) --- */
      {
        const CW3=IB.CWORLD;
        if(CW3&&CW3.blds)for(const b of CW3.blds){
          if(b.cat!=='fnmarket')continue;
          const[x,y]=P(b.x+b.wT/2,b.y+b.dT);
          if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
          g.fillStyle='#c8342c';g.fillRect(x-6,y-4,12,8);
          g.fillStyle='#f4f4f8';g.font='bold 6px monospace';g.textAlign='center';g.fillText('FN<',x,y+2);
          label('FN< МАРКЕТ',x+9,y+3,'#e87870');
        }
      }
      /* --- БАТЧ 15: СТАДІОНИ (зелені овалі) --- */
      for(const l of W.lms){
        if(l.key!=='stadium'&&l.key!=='stadium2')continue;
        const[x,y]=P(l.x+l.wT/2,l.y+l.dT/2);
        if(x<mx-12||x>mx+mw+12||y<my-12||y>my+mh+12)continue;
        g.strokeStyle='#5ecc82';g.lineWidth=1.6;g.beginPath();g.ellipse(x,y,7,4.5,0,0,7);g.stroke();g.lineWidth=1;
        g.fillStyle='#3e7a3a';g.fillRect(x-2,y-1.5,4,3);
        label(l.key==='stadium'?'СТАДІОН':'СТАДІОН ТР.',x+9,y+3,'#8ae0a8');
      }
      /* --- БАТЧ 15: ОЗЕРО / ГОРИ / СЕЛА / МОСТИ-ЧЕКПОЇНТИ --- */
      /* КВЕСТ «НЕДОСТАВЛЕНІ»: конверти листів */
      for(const lt of W.letters||[]){
        const[x,y]=P(lt.x,lt.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        const pul=NOW%800<400;
        if(pul){g.fillStyle='rgba(240,208,80,0.30)';g.beginPath();g.arc(x,y-3,7.5,0,7);g.fill();}
        g.fillStyle='#e8e2c8';g.fillRect(x-4,y-6,8,6);
        g.strokeStyle='#c8a020';g.lineWidth=1;g.beginPath();g.moveTo(x-4,y-6);g.lineTo(x,y-2);g.lineTo(x+4,y-6);g.stroke();
        if(z>=1.4)label('ЛИСТ',x+7,y-2,'#e8d890');
      }
      if(W.lake){
        const[x,y]=P(W.lake.x,W.lake.y);
        if(x>mx-12&&x<mx+mw+12&&y>my-12&&y<my+mh+12){
          g.strokeStyle='#5aa0e0';g.lineWidth=1.4;g.beginPath();g.ellipse(x,y,7,5,0,0,7);g.stroke();g.lineWidth=1;
          g.fillStyle='#1c3860';g.beginPath();g.ellipse(x,y,5.5,3.6,0,0,7);g.fill();
          label('ОЗЕРО ПУХІВСЬКЕ • ЧОВНИ',x+9,y+3,'#7ab8f0');
        }
      }
      if(W.mtn){
        const[x,y]=P(W.mtn.x,W.mtn.y);
        if(x>mx-12&&x<mx+mw+12&&y>my-12&&y<my+mh+12){
          g.fillStyle='#9aa0ae';g.beginPath();g.moveTo(x,y-7);g.lineTo(x+7,y+4);g.lineTo(x-7,y+4);g.closePath();g.fill();
          g.fillStyle='#e8ecf4';g.beginPath();g.moveTo(x-1,y-4);g.lineTo(x+2.5,y-0.5);g.lineTo(x-3,y-0.5);g.closePath();g.fill();
          label('ТРИПІЛЬСЬКА ГОРА • ТАБІР',x+9,y+3,'#c8ccd8');
        }
      }
      for(const v of W.villages||[]){
        const[x,y]=P(v.x,v.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.fillStyle='#4ee06a';g.fillRect(x-4,y-3,8,5);g.beginPath();g.moveTo(x-5,y-3);g.lineTo(x,y-7);g.lineTo(x+5,y-3);g.closePath();g.fill();
        label(v.n,x+7,y+2,'#6ad88a');
      }
      for(const bn of W.bridges||[]){
        const bx2=bn[2]||228;   /* батч 16: x міст зберігається в даних [y,назва,x] */
        const[x,y]=P(bx2,bn[0]);
        if(x<mx-16||x>mx+mw+16||y<my-12||y>my+mh+12)continue;
        g.strokeStyle='#e0b050';g.lineWidth=2;g.beginPath();g.moveTo(x-6,y);g.lineTo(x+6,y);g.stroke();g.lineWidth=1;
        if(z>=1.5)label(bn[1],x+8,y-4,'#e8c878');
      }
      /* --- БАТЧ 15: ПОЗНАЧКИ гравця (SHIFT+клік на карті) --- */
      for(const pn of G.flags.pins||[]){
        const[x,y]=P(pn.x,pn.y);
        if(x<mx-10||x>mx+mw+10||y<my-10||y>my+mh+10)continue;
        g.save();g.translate(x,y);g.rotate(IB.M.PI/4);g.fillStyle='#f0d050';g.fillRect(-4,-4,8,8);g.restore();
        g.strokeStyle='#0b0d14';g.lineWidth=1;g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y+5);g.stroke();
        label(pn.n,x+8,y+6,'#f0d050');
      }
      /* ціль місії + точка падіння шахеда */
      const m=IB.MISSIONS[G.mi];
      if(m&&!G.ending){
        const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x,ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
        const[x,y]=P(tx+0.5,ty+0.5);
        g.fillStyle=NOW%400<200?'#f0d050':'#c8a020';g.beginPath();g.moveTo(x,y-8);g.lineTo(x+6,y+5);g.lineTo(x-6,y+5);g.closePath();g.fill();
      }
      if(G.flags.drop){
        const[x,y]=P(G.flags.drop.x,G.flags.drop.y);
        g.strokeStyle='#e04a3a';g.lineWidth=2;g.beginPath();g.moveTo(x-5,y-5);g.lineTo(x+5,y+5);g.moveTo(x+5,y-5);g.lineTo(x-5,y+5);g.stroke();g.lineWidth=1;
      }
    }
    /* ШАХЕДИ: цілі падіння */
    const SH=IB.G.shah;
    if(SH&&SH.phase&&IB.layer==='city')for(const tg of SH.targets){
      const[x,y]=P(tg.x,tg.y);
      g.strokeStyle=NOW%260<130?'#e04a3a':'#8a2a20';g.lineWidth=1.5;
      g.beginPath();g.moveTo(x-5,y-5);g.lineTo(x+5,y+5);g.moveTo(x+5,y-5);g.lineTo(x-5,y+5);g.stroke();g.lineWidth=1;
    }
    /* ТОЧКА МАРШРУТУ + ЧЕРВОНА ЛІНІЯ НАВІГСАЦЇЇ (батч 15: BFS-маршрут) */
    const way=G.flags.way;
    if(PL){
      const[px2,py2]=P(PL.x,PL.y);
      if(way){
        const[wx2,wy2]=P(way.x,way.y);
        const drawn=drawRoutePath(g,P,170);
        if(!drawn){g.strokeStyle=WAYC;g.setLineDash([5,4]);g.lineWidth=1.5;g.beginPath();g.moveTo(px2,py2);g.lineTo(wx2,wy2);g.stroke();g.setLineDash([]);g.lineWidth=1;}
        g.fillStyle=WAYC;g.fillRect(wx2-1,wy2-12,2,12);g.beginPath();g.moveTo(wx2+1,wy2-12);g.lineTo(wx2+10,wy2-9);g.lineTo(wx2+1,wy2-5);g.closePath();g.fill();
        label('МАРШРУТ',wx2+12,wy2-4,WAYC);
        const r=G.route;
        const dd=r&&r.pts&&r.pts.length>1?r.len:IB.dist(PL.x,PL.y,way.x,way.y);
        g.font='8px monospace';g.textAlign='center';g.fillStyle='#0b0d14cc';
        const[cmx,cmy]=[(px2+wx2)/2,(py2+wy2)/2];
        g.fillRect(cmx-30,cmy-5,60,10);
        g.fillStyle='#ff8a78';g.fillText(distTxt(dd),cmx,cmy+3);
      }
      g.fillStyle=NOW%300<150?'#ffffff':'#d6dae6';g.fillRect(px2-3,py2-3,6,6);
      g.strokeStyle='#fff';g.beginPath();g.moveTo(px2,py2);g.lineTo(px2+PL.fx*11,py2+PL.fy*11);g.stroke();
    }
    g.restore();
    g.lineWidth=1;g.strokeStyle='#3c4356';g.strokeRect(15.5,35.5,availW+1,availH+1);
    /* --- легенда --- */
    g.font='7px monospace';g.textAlign='left';g.fillStyle='#cfd4e2';
    g.fillText(metroL
      ?'M СТАНЦІЯ • С СЕРВЕРНА • В МАЙСТЕРНЯ • К КОТЕЛЬНЯ • Н НАСОСНА • Ц ЦЕХ • ▼ ТИ • КОЛЕСО/+− ЗУМ • ТЯГ — ЗСУВ • КЛІК — МАРШРУТ'
      :'БУДИНОК: ЧЕРВОНИЙ = ЗАРАЖЕНИЙ / ЗЕЛЕНИЙ = ЗВІЛЬНЕНИЙ • ⌂ СХОВАНКА • ◆ ЛОКАЦІЯ • ✉ ЛИСТ (КВЕСТ «НЕДОСТАВЛЕНІ») • M МЕТРО • B БАЗА • Ф АЗС • FN< МАРКЕТ • ОВАЛ СТАДІОН • ОВАЛ СИНІЙ ОЗЕРО • ▲ ГОРА • МОСТИ ЖОВТІ • КОЛЕСО/+− ЗУМ • КЛІК — МАРШРУТ • SHIFT+КЛІК — ПОЗНАЧКА',16,CH-16);
    g.fillStyle='#8a92a8';
    g.fillText('СПИСОК ОБ\'ЄКТІВ СПРАВА — КЛІК ПО РЯДКУ СТАВИТЬ ТОЧКУ. КЛІК ПО БУДИНКУ = МАРШРУТ ДО НЬОГО. P — МІНІКАРТА «ПЛАН МІСТА».',16,CH-5);
  }

  /* ---------- логотип титулів ---------- */
  function drawLogo(g){
    g.clearRect(0,0,320,150);
    g.fillStyle='#050609';g.fillRect(0,0,320,150);
    g.fillStyle='#10131c';
    g.beginPath();g.moveTo(0,150);
    for(const[bx,by]of[[0,120],[18,120],[18,100],[26,100],[26,88],[34,88],[34,120],[52,120],[52,92],[60,84],[68,92],[68,120],[92,120],[92,104],[104,96],[116,104],[116,120],[140,120],[140,94],[150,86],[160,94],[160,120],[184,120],[184,98],[196,90],[208,98],[208,120],[232,120],[232,80],[238,72],[244,80],[244,120],[268,120],[268,100],[280,100],[280,108],[292,108],[292,120],[320,120]])g.lineTo(bx,by);
    g.lineTo(320,150);g.closePath();g.fill();
    IB.O(g,258,34,16,16,'#1a1f30');IB.O(g,252,30,14,14,'#d6dae6');
    IB.O(g,248,26,3,3,'#b8bcc8');IB.O(g,256,36,2,2,'#b8bcc8');
    function dome2(x,y,r){IB.O(g,x,y,r,r*0.8,P.y2);g.fillStyle=P.y3;g.beginPath();g.ellipse(x,y-r*0.25,r*0.8,r*0.6,0,0,7);g.fill();IB.P(g,x-1,y-r-5,2,5,P.y2);}
    dome2(150,84,5);dome2(160,88,4);dome2(238,70,6);
    g.font='bold 34px monospace';g.textAlign='center';
    g.fillStyle='#7a5a10';g.fillText('IBONARIUM',162,66);
    g.fillStyle='#f0d050';g.fillText('IBONARIUM',160,64);
    g.font='bold 15px monospace';
    g.fillStyle='#0e0f16';g.fillText('K Y I V',161,88);
    g.fillStyle='#e8e8f0';g.fillText('K Y I V',160,87);
    g.font='8px monospace';g.fillStyle='#e04a3a';
    g.fillText('— THE LAST SIGNAL —',160,106);
    g.font='7px monospace';g.fillStyle='#8a92a8';
    g.fillText('OPEN WORLD SURVIVAL • 16-BIT',160,118);
    const tx=160,ty=126;
    g.fillStyle='#f0d050';
    g.fillRect(tx-6,ty,3,12);g.fillRect(tx+4,ty,3,12);g.fillRect(tx-1,ty-3,3,15);g.fillRect(tx-4,ty+10,9,3);
  }

  return {drawGround,drawScene,drawMinimapHUD,drawCompass,drawBigMap,drawLogo,mapView,poiList,mapZoom,mapPan};
})();
