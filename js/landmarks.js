/* IBONARIUM KYIV — landmark silhouettes (впізнавані будівлі Києва) */
IB.LM = (function(){
  const P=IB.PAL;
  const BIG={};
  function LM(name,wT,dT,hpx,extraTop,fn,ground){
    const W=(wT+dT)*16+4,H=(wT+dT)*8+hpx+8+extraTop;
    const c=IB.mk(W,H);
    const N=[2+dT*16,8+extraTop],E=[2+(wT+dT)*16,8+wT*8+extraTop],S=[2+wT*16,8+(wT+dT)*8+extraTop],Wc=[2,8+dT*8+extraTop];
    fn(c.g,{N,E,S,Wc,wT,dT,hpx,baseY:8+extraTop});
    /* якір землі: ay = верх канваса → лінія землі (низ стін). Для "стінових"
       будівель стіни опускаються на hpx від ромба footprint; для статуй/башт
       ground=0 — статуя стоїть просто на footprint */
    BIG[name]={c,wT,dT,hpx,ay:8+extraTop+(ground===undefined?hpx:ground)};
  }
  function shell(g,f,ct,cl,cr){
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],cl);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],cr);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],ct);
  }
  /* gold onion dome with cross */
  function dome(g,x,y,r,c1,c2,c3){
    IB.O(g,x,y,r,r*0.78,c1);
    g.fillStyle=c2;g.beginPath();g.ellipse(x,y-r*0.25,r*0.82,r*0.62,0,0,7);g.fill();
    g.fillStyle=c3;g.beginPath();g.ellipse(x-r*0.3,y-r*0.35,r*0.5,r*0.45,0,0,7);g.fill();
    IB.P(g,x-1,y-r*0.85-7,2,8,c1);
    g.strokeStyle=c1;g.lineWidth=1.5;g.beginPath();g.moveTo(x-3,y-r*0.85-5);g.lineTo(x+3,y-r*0.85-5);g.stroke();
    IB.O(g,x,y-r*0.85-9,1.6,1.6,c2);
  }
  /* ================= 1. БАТЬКІВЩИНА-МАТИ ================= */
  LM('motherland',3,3,96,56,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2, topY=f.N[1]+8;
    // granite pedestal (центрований під статуєю)
    const pcx=(f.Wc[0]+f.E[0])/2;
    IB.isoBox(g,pcx-(f.wT*16+12)/2,f.N[1]-4,f.wT*16+12,f.dT*16+6,18,P.gr2,P.gr1,P.a3);
    IB.isoBox(g,pcx-(f.wT*16+4)/2,f.N[1],f.wT*16+4,f.dT*16+2,14,P.gr3,P.gr2,P.a2);
    // statue: titanium with green tint
    const st=P.m3, stL=P.m4, stD=P.m1, stG='#8ea0a4';
    const by=topY-4; // hips baseline (feet on pedestal top)
    // legs
    IB.PA(g,[[cx-6,by],[cx-2,by],[cx-1,by-16],[cx-5,by-16]],stD);
    IB.PA(g,[[cx+2,by],[cx+6,by],[cx+5,by-16],[cx+1,by-16]],st);
    // torso
    IB.PA(g,[[cx-7,by-16],[cx+7,by-16],[cx+5,by-30],[cx-5,by-30]],st);
    IB.PA(g,[[cx-5,by-30],[cx-2,by-30],[cx-2,by-16],[cx-5,by-16]],stL);
    IB.P(g,cx-2,by-26,5,2,stD);
    // head
    IB.O(g,cx,by-33,3,4,stG);
    IB.P(g,cx-1,by-38,2,3,stG);
    // right arm: raised sword
    IB.PA(g,[[cx+4,by-29],[cx+7,by-28],[cx+13,by-40],[cx+10,by-42]],st);
    g.strokeStyle=P.m4;g.lineWidth=2.5;g.beginPath();g.moveTo(cx+12,by-40);g.lineTo(cx+18,by-52);g.stroke();
    g.strokeStyle=stG;g.lineWidth=1;g.beginPath();g.moveTo(cx+17,by-52);g.lineTo(cx+21,by-56);g.stroke();
    IB.P(g,cx+10,by-41,4,2,stD);
    // left arm + SHIELD with trident (front-facing)
    IB.PA(g,[[cx-4,by-29],[cx-7,by-28],[cx-12,by-34],[cx-10,by-36]],st);
    // shield
    IB.PA(g,[[cx-16,by-36],[cx-7,by-38],[cx-6,by-22],[cx-10,by-16],[cx-15,by-24]],stL);
    IB.PA(g,[[cx-14,by-34],[cx-9,by-35],[cx-8,by-24],[cx-11,by-20],[cx-13,by-26]],stG);
    // trident on shield
    const tx=cx-11,ty=by-30;
    IB.P(g,tx-2,ty-2,2,6,st);IB.P(g,tx+3,ty-2,2,6,st);IB.P(g,tx,ty-4,2,8,st);
    IB.P(g,tx-1,ty+2,4,2,st);
    IB.speck(g,cx-18,by-40,38,42,P.blk,10,5);
  },0);
  /* музей під монументом */
  LM('museum',5,3,30,10,(g,f)=>{
    shell(g,f,P.c4,P.c3,P.c2);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],P.c4);
    IB.PA(g,[[f.N[0],f.N[1]+2],[f.E[0],f.E[1]+2],[f.S[0],f.S[1]+2],[f.Wc[0],f.Wc[1]+2]],P.gr3);
    for(let i=0;i<6;i++){
      const u=(i+0.2)/6, x1=IB.lerp(f.Wc[0],f.S[0],u),y1=IB.lerp(f.Wc[1],f.S[1],u);
      IB.PA(g,[[x1,y1+4],[IB.lerp(f.Wc[0],f.S[0],u+0.09),IB.lerp(f.Wc[1],f.S[1],u+0.09)+4],[x1+0,y1+12],[x1,y1+12]],P.d02);
    }
    IB.P(g,f.S[0]-8,f.S[1]+14,10,4,P.d01);
    IB.P(g,f.S[0]-6,f.S[1]+16,6,2,P.y3);
  });
  /* ================= 2. ЛАВРА ================= */
  LM('lavra_cath',5,4,34,44,(g,f)=>{
    shell(g,f,P.c4,P.wht,P.c3);
    // central big gold dome
    const cx=(f.N[0]+f.S[0])/2, cy=f.N[1]-6;
    IB.isoBox(g,cx-10,cy+4,20,12,10,P.c4,P.wht,P.c3);
    dome(g,cx,cy-2,9,P.y2,P.y3,P.y4);
    dome(g,cx-16,cy+6,6,P.y1,P.y2,P.y3);
    dome(g,cx+16,cy+6,6,P.y1,P.y2,P.y3);
    dome(g,cx-24,cy+12,5,P.y1,P.y2,P.y3);
    dome(g,cx+24,cy+12,5,P.y1,P.y2,P.y3);
    IB.P(g,f.S[0]-4,f.S[1]+16,8,12,P.d02);
  });
  LM('lavra_refect',4,3,24,22,(g,f)=>{
    shell(g,f,P.c4,P.wht,P.c3);
    dome(g,(f.N[0]+f.S[0])/2,f.N[1]-4,7,P.y2,P.y3,P.y4);
    IB.P(g,f.S[0]-2,f.S[1]+10,6,9,P.d02);
  });
  LM('lavra_bell',2,2,62,36,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2;
    // tier 1
    IB.PA(g,[f.Wc,f.S,f.E,f.N],P.c4);
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+30],[f.Wc[0],f.Wc[1]+30]],P.wht);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+30],[f.S[0],f.S[1]+30]],P.c3);
    IB.PA(g,[[f.N[0]-2,f.N[1]-2],[f.E[0]+2,f.E[1]+4],[f.S[0],f.S[1]+8],[f.Wc[0]-2,f.Wc[1]+2]],P.c4);
    // arch openings
    IB.P(g,cx-3,f.S[1]+6,3,8,P.d02);IB.P(g,cx+2,f.S[1]+6,3,8,P.d02);
    // tier 2
    IB.P(g,cx-7,f.N[1]-4,15,20,P.c4);IB.P(g,cx-7,f.N[1]-4,3,20,P.wht);IB.P(g,cx+5,f.N[1]-4,3,20,P.c3);
    IB.P(g,cx-5,f.N[1]-2,4,9,P.d02);IB.P(g,cx+2,f.N[1]-2,4,9,P.d02);
    // tier 3
    IB.P(g,cx-6,f.N[1]-24,13,14,P.wht);IB.P(g,cx-6,f.N[1]-24,3,14,P.c4);IB.P(g,cx-6,f.N[1]-22,13,1,P.y3);
    // gold top
    IB.P(g,cx-8,f.N[1]-11,17,3,P.c3);
    dome(g,cx,f.N[1]-28,7,P.y2,P.y3,P.y4);
  },30);
  LM('caves_chapel',2,2,16,16,(g,f)=>{
    shell(g,f,P.c4,P.wht,P.c3);
    dome(g,(f.N[0]+f.S[0])/2,f.N[1]-3,6,P.y2,P.y3,P.y4);
    IB.P(g,f.S[0]-3,f.S[1]+8,7,10,P.d01);
    IB.P(g,f.S[0]-3,f.S[1]+14,7,4,P.gr3);
  });
  /* ================= 3. СОФІЯ ================= */
  LM('sophia_cath',5,4,30,40,(g,f)=>{
    shell(g,f,P.wht,P.c4,P.c3);
    // вікна-сліти на обох фасадах, щоб стіна не була «кубом»
    for(let i=0;i<6;i++){
      const u=(i+0.25)/6, x1=IB.lerp(f.Wc[0]+3,f.S[0]-3,u), y1=IB.lerp(f.Wc[1]+3,f.S[1]+3,u);
      IB.P(g,x1,y1,2,10,P.gr2);IB.P(g,x1,y1,2,2,P.d02);
      const x2=IB.lerp(f.S[0]+3,f.E[0]-3,u), y2=IB.lerp(f.S[1]+3,f.E[1]+3,u);
      IB.P(g,x2,y2,2,10,P.gr2);IB.P(g,x2+1,y2,1,10,P.d02);
    }
    // baroque gables
    const cx=(f.N[0]+f.S[0])/2,cy=f.N[1]-2;
    IB.P(g,cx-22,cy+2,44,10,P.wht);
    IB.PA(g,[[cx-22,cy+2],[cx-18,cy-6],[cx-14,cy+2]],P.c4);
    IB.PA(g,[[cx+14,cy+2],[cx+18,cy-6],[cx+22,cy+2]],P.c4);
    IB.PA(g,[[cx-8,cy-2],[cx,cy-12],[cx+8,cy-2]],P.wht);
    dome(g,cx,cy-8,8,P.g2,P.y2,P.y3); // central gold-green
    dome(g,cx-16,cy-2,6,P.g1,P.g2,P.g3);
    dome(g,cx+16,cy-2,6,P.g1,P.g2,P.g3);
    dome(g,cx-24,cy+6,5,P.g1,P.g2,P.g3);
    dome(g,cx+24,cy+6,5,P.g1,P.g2,P.g3);
    IB.P(g,f.S[0]-4,f.S[1]+14,8,10,P.d02);
  });
  LM('sophia_bell',2,2,54,30,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2;
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+34],[f.Wc[0],f.Wc[1]+34]],P.wht);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+34],[f.S[0],f.S[1]+34]],P.c3);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],P.c4);
    IB.P(g,cx-3,f.S[1]+8,3,9,P.d02);IB.P(g,cx+2,f.S[1]+8,3,9,P.d02);
    IB.P(g,cx-6,f.N[1]-6,13,16,P.wht);IB.P(g,cx-6,f.N[1]-6,3,16,P.c4);IB.P(g,cx-6,f.N[1]-4,13,2,P.y3);
    IB.P(g,cx-7,f.N[1]-10,15,3,P.c4);
    dome(g,cx,f.N[1]-14,7,P.y2,P.y3,P.y4);
  },34);
  /* ================= 4. ЗОЛОТІ ВОРОТА ================= */
  LM('golden_gate',3,2,30,30,(g,f)=>{
    // brick wall body
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],P.r2);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],P.r1);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],P.r3);
    // crenellations
    const y0=f.N[1]-2;
    for(let i=0;i<7;i++)IB.P(g,f.Wc[0]-6+i*5,y0-4,3,5,P.r2);
    // gateway arch on right face
    const gx=f.S[0]-14,gy=f.S[1]+6;
    IB.PA(g,[[gx,gy+16],[gx,gy+4],[gx+3,gy],[gx+7,gy],[gx+10,gy+4],[gx+10,gy+16]],P.d01);
    IB.P(g,gx+2,gy+8,6,8,P.b2); // wooden gate
    IB.P(g,gx+4,gy+10,2,1,P.y3);
    // church on top
    IB.P(g,f.N[0]-6,f.N[1]-14,20,12,P.c4);IB.P(g,f.N[0]-6,f.N[1]-14,3,12,P.wht);
    IB.PA(g,[[f.N[0]-6,f.N[1]-14],[f.N[0]+14,f.N[1]-6],[f.N[0]+4,f.N[1]-1],[f.N[0]-6,f.N[1]-6]],P.c3);
    dome(g,f.N[0]+4,f.N[1]-16,6,P.y2,P.y3,P.y4);
    IB.speck(g,f.Wc[0]-4,f.N[1]-2,40,f.hpx+6,P.r1,16,3);
  });
  /* ================= 5. МАЙДАН: КОЛОНА ================= */
  LM('maidan_col',1,1,84,100,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2, top=f.N[1]-4;
    // plinth
    IB.PA(g,[[cx-12,top+8],[cx+12,top+8],[cx+8,top+14],[cx-8,top+14]],P.c3);
    IB.PA(g,[[cx-8,top+6],[cx+8,top+6],[cx+6,top+9],[cx-6,top+9]],P.c4);
    IB.P(g,cx-5,top+2,10,4,P.gr2);
    // column
    IB.P(g,cx-4,top-72,8,74,P.c4);
    IB.P(g,cx-4,top-72,3,74,P.wht);IB.P(g,cx+1,top-72,3,74,P.c3);
    for(let i=0;i<6;i++)IB.P(g,cx-4,top-66+i*11,8,1,P.c3);
    IB.P(g,cx-6,top-76,12,4,P.wht);IB.P(g,cx-6,top-80,12,3,P.c3);
    // Berehynia (gold)
    const gy=top-96;
    IB.P(g,cx-1,gy+6,3,14,P.y3); // body
    IB.O(g,cx,gy+4,3,3,P.y4); // head
    IB.P(g,cx-2,gy-2,5,2,P.y4); // wreath arms up
    IB.P(g,cx-3,gy-4,2,3,P.y3);IB.P(g,cx+2,gy-4,2,3,P.y3);
    IB.P(g,cx-4,gy+8,3,6,P.y2); // kalyna branch
    IB.O(g,cx-5,gy+6,2,2,P.rd3);
    IB.P(g,cx-3,gy-6,7,2,P.y2);
  },0);
  /* Лачідських воріт (Майдан, південь) */
  LM('lachida',6,2,26,8,(g,f)=>{
    shell(g,f,P.c4,P.c3,P.c2);
    IB.P(g,f.Wc[0],f.N[1]+1,f.wT*16+8,3,P.y3);
    // central arch
    const gx=(f.N[0]+f.S[0])/2-7;
    IB.PA(g,[[gx,f.S[1]+18],[gx,f.S[1]+4],[gx+3,f.S[1]],[gx+11,f.S[1]],[gx+14,f.S[1]+4],[gx+14,f.S[1]+18]],P.d01);
    IB.P(g,gx-2,f.N[1]-4,20,4,P.c4);IB.P(g,gx-2,f.N[1]-4,20,1,P.y3);
    IB.P(g,gx+4,f.N[1]-9,8,5,P.c4);IB.P(g,gx+4,f.N[1]-9,8,1,P.y3);
  });
  /* ================= 6. АНДРІЇВСЬКА ЦЕРКВА ================= */
  LM('st_andrew',4,3,40,34,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2;
    // green hill pedestal
    IB.PA(g,[[f.Wc[0]-6,f.Wc[1]+2],[f.E[0]+6,f.E[1]+2],[f.S[0],f.S[1]+12],[f.Wc[0]-6,f.Wc[1]+2]],P.g3);
    IB.PA(g,[[f.Wc[0]-2,f.Wc[1]-2],[f.E[0]+2,f.E[1]-2],[f.S[0],f.S[1]+8],[f.Wc[0]-2,f.Wc[1]-2]],P.g4);
    shell(g,f,P.c4,P.gr3,P.gr2);
    /* фасадні колони і тінь під дахом, щоб стіна не була «кубом» */
    IB.P(g,f.N[0]-2,f.N[1]-6,f.wT*16+4,6,P.wht);
    for(let i=0;i<5;i++){
      const u=(i+0.3)/5, x1=IB.lerp(f.Wc[0]+4,f.S[0]-4,u), y1=IB.lerp(f.Wc[1]+4,f.S[1]+4,u);
      IB.P(g,x1,y1,3,f.hpx-10,P.wht);
      IB.P(g,x1,y1,1,f.hpx-10,P.gr2);
    }
    IB.PA(g,[[f.N[0]-2,f.N[1]-6],[f.N[0]+f.wT*8,f.N[1]-14],[f.N[0]+f.wT*16+2,f.N[1]-6]],P.wht);
    // front tower with big green dome
    dome(g,cx,f.N[1]-18,10,P.g1,P.g2,P.g3);
    IB.P(g,cx-8,f.N[1]-4,17,10,P.c4);IB.P(g,cx-8,f.N[1]-4,3,10,P.wht);
    dome(g,cx-20,f.N[1]+2,5,P.g1,P.g2,P.g3);
    dome(g,cx+20,f.N[1]+2,5,P.g1,P.g2,P.g3);
    IB.P(g,f.S[0]-4,f.S[1]+22,8,12,P.d02);
  });
  /* ГОСТИННИЙ ДВІР (Контрактова площа) */
  LM('gostyny',6,2,30,10,(g,f)=>{
    shell(g,f,P.b4,P.sa3,P.b3);
    IB.PA(g,[[f.N[0],f.N[1]-3],[f.E[0],f.E[1]+1],[f.S[0],f.S[1]+3],[f.Wc[0],f.Wc[1]-1]],P.wht);
    for(let i=0;i<7;i++){
      const u=(i+0.15)/7, x1=IB.lerp(f.Wc[0],f.S[0],u),y1=IB.lerp(f.Wc[1],f.S[1],u);
      IB.PA(g,[[x1,y1+5],[IB.lerp(f.Wc[0],f.S[0],u+0.1),IB.lerp(f.Wc[1],f.S[1],u+0.1)+5],[x1,y1+13],[x1,y1+13]],P.d02);
      const x2=IB.lerp(f.S[0],f.E[0],u),y2=IB.lerp(f.S[1],f.E[1],u);
      IB.PA(g,[[x2,y2+5],[IB.lerp(f.S[0],f.E[0],u+0.1),IB.lerp(f.S[1],f.E[1],u+0.1)+5],[x2,y2+13],[x2,y2+13]],P.d01);
    }
    IB.P(g,f.S[0]-6,f.S[1]+14,12,12,P.d02);IB.P(g,f.S[0]-4,f.S[1]+16,8,3,P.y3);
  });
  /* Фонтан Самсона */
  LM('samson',1,1,14,18,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2;
    IB.PA(g,[[cx-9,f.N[1]+4],[cx+9,f.N[1]+4],[cx+13,f.N[1]+8],[cx+9,f.N[1]+12],[cx-9,f.N[1]+12],[cx-13,f.N[1]+8]],P.c3);
    IB.O(g,cx,f.N[1]+8,9,5,P.w3);
    IB.P(g,cx-3,f.N[1]-8,6,16,P.c4);IB.P(g,cx-3,f.N[1]-8,2,16,P.wht);
    IB.P(g,cx-4,f.N[1]-12,8,4,P.c4);
    dome(g,cx,f.N[1]-13,5,P.y2,P.y3,P.y4);
  },0);
  /* Вишгородська/промислова вежа (радіосигнал) */
  LM('radio_tower',1,1,10,66,(g,f)=>{
    const cx=(f.N[0]+f.S[0])/2, top=f.N[1]-62;
    IB.PA(g,[[f.N[0]-3,f.N[1]+4],[f.N[0]+3,f.N[1]+4],[cx+5,top+6],[cx-5,top+6]],P.m2);
    g.strokeStyle=P.m3;g.lineWidth=1;
    for(let i=0;i<6;i++){
      const y1=top+6+i*10, w1=5-i*0.5, y2=y1+10, w2=5-(i+1)*0.5;
      g.beginPath();g.moveTo(cx-w1,y1);g.lineTo(cx+w2,y2);g.lineTo(cx+w1,y1);g.lineTo(cx-w2,y2);g.closePath();g.stroke();
    }
    IB.P(g,cx-1,top-4,2,10,P.rd3);
    IB.O(g,cx,top-6,2,2,P.rd3);
  },0);
  /* ================= БАЗА ВВ13 • КПІ ================= */
  LM('mm13',4,3,36,20,(g,f)=>{
    // головний корпус: бетон, укріплений мішками, вікна забиті дошками
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],P.c3);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],P.c2);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],P.c4);
    IB.P(g,f.Wc[0],f.N[1]-2,f.wT*16+6,4,P.gr3);           // карниз
    // вікна-сліти з фанерою
    for(let i=0;i<5;i++){
      const u=(i+0.18)/5, x1=IB.lerp(f.Wc[0]+4,f.S[0]-6,u), y1=IB.lerp(f.Wc[1]+5,f.S[1]+5,u);
      IB.P(g,x1,y1,5,9,P.d02);IB.PA(g,[[x1-1,y1+2],[x1+6,y1],[x1+6,y1+6],[x1-1,y1+8]],P.b3);IB.P(g,x1+1,y1+4,3,1,P.b2);
      const x2=IB.lerp(f.S[0]+4,f.E[0]-6,u), y2=IB.lerp(f.S[1]+5,f.E[1]+5,u);
      IB.P(g,x2,y2,4,9,P.d02);IB.PA(g,[[x2-1,y2+3],[x2+5,y2+1],[x2+5,y2+7],[x2-1,y2+9]],P.b2);
    }
    // вхід: дві стулки + навіс
    const dx=f.S[0]-16,dy=f.S[1]+f.hpx-18;
    IB.P(g,dx,dy,12,14,P.d01);IB.P(g,dx+1,dy+1,5,12,P.b3);IB.P(g,dx+7,dy+1,4,12,P.b2);
    IB.P(g,dx-3,dy-4,18,4,P.gr2);
    // напис ВВ13 над входом (білі літери на табличці)
    IB.P(g,dx+14,dy-3,30,12,P.d02);IB.P(g,dx+15,dy-2,28,10,P.u2);
    const M={'В':[[0,0],[0,1],[0,2],[0,3],[1,0],[2,0],[2,1],[1,1],[1,2],[2,2],[2,3],[1,3]],'М':[[0,0],[0,1],[0,2],[0,3],[1,1],[2,0],[2,1],[2,2],[2,3]],'1':[[0,1],[1,0],[1,1],[1,2],[1,3],[2,3]],'3':[[0,0],[1,0],[2,1],[1,2],[0,2],[1,3],[2,3]]};
    let mx=dx+17;
    for(const ch of 'ВВ13'){for(const p of (M[ch]||[]))IB.P(g,mx+p[0],dy+p[1],1,1,P.wht);mx+=5;}
    // дах: парапет + антена + водонапірний бак
    IB.P(g,f.N[0]-4,f.N[1]-6,f.wT*16+10,6,P.gr2);
    IB.P(g,f.N[0]+18,f.N[1]-16,2,12,P.m3);IB.O(g,f.N[0]+19,f.N[1]-18,2,2,P.rd3);
    IB.P(g,f.E[0]-10,f.E[1]+4,10,7,P.gr3);IB.P(g,f.E[0]-9,f.E[1]+5,8,1,P.gr4);
    // ПРАПОР над базою (синьо-жовтий)
    const fx=f.N[0]+2,fy=f.N[1]-26;
    IB.P(g,fx,fy,2,22,P.m3);
    IB.PA(g,[[fx+2,fy],[fx+20,fy+3],[fx+2,fy+7]],P.u2);
    IB.PA(g,[[fx+2,fy+7],[fx+20,fy+9],[fx+2,fy+14]],P.y4);
    // мішки по фронту + генератор
    for(let i=0;i<4;i++){
      const u=(i+0.15)/4, x1=IB.lerp(f.Wc[0]-2,f.S[0]-2,u), y1=IB.lerp(f.Wc[1]+f.hpx-4,f.S[1]+f.hpx-4,u);
      IB.O(g,x1+4,y1,7,3,P.sa2);IB.O(g,x1+4,y1-2,6,2,P.sa3);
    }
    IB.isoBox(g,f.S[0]+2,f.S[1]+f.hpx+2,14,8,8,P.gr3,P.gr2,P.a3);
    IB.P(g,f.S[0]+4,f.S[1]+f.hpx+4,4,2,P.y3);
    IB.speck(g,f.Wc[0],f.N[1]-2,f.wT*16+4,f.hpx+10,P.ash1,18,9);
  });
  /* ================= СТАДІОН (батч 14): поле + трибуни-чаша + прожектори ================= */
  function stadiumLM(name,wT,dT,seatA,seatB){
    LM(name,wT,dT,30,24,(g,f)=>{
      const up=(p,dy)=>[p[0],p[1]-dy];
      const N=f.N,E=f.E,S=f.S,Wc=f.Wc;
      const C=[(N[0]+S[0])/2,(N[1]+S[1])/2];
      const k=0.30;
      const q=p=>[C[0]+(p[0]-C[0])*k,C[1]+(p[1]-C[1])*k];
      const fq={N:q(N),E:q(E),S:q(S),Wc:q(Wc)};
      /* зовнішня стіна чаші (SW світліша, SE тінь) + парапет */
      IB.PA(g,[up(Wc,30),up(S,30),S,Wc],'#3a3e46');
      IB.PA(g,[up(S,30),up(E,30),E,S],'#30343c');
      IB.PA(g,[up(N,30),up(E,30),up(S,30),up(Wc,30)],'#4c505a');
      /* схили трибун */
      IB.PA(g,[up(Wc,30),up(S,30),fq.S,fq.Wc],seatA);
      IB.PA(g,[up(S,30),up(E,30),fq.E,fq.S],IB.shade(seatA,-0.18));
      /* ряди-сходинки */
      g.strokeStyle='rgba(10,12,18,0.55)';g.lineWidth=1;
      const mx=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
      for(let i=1;i<6;i++){
        const t=i/6;
        let a1=mx(up(Wc,30),fq.Wc,t),b1=mx(up(S,30),fq.S,t);
        g.beginPath();g.moveTo(a1[0],a1[1]);g.lineTo(b1[0],b1[1]);g.stroke();
        let a2=mx(up(S,30),fq.S,t),b2=mx(up(E,30),fq.E,t);
        g.beginPath();g.moveTo(a2[0],a2[1]);g.lineTo(b2[0],b2[1]);g.stroke();
      }
      /* смуги сидінь */
      paraSeats(g,up(Wc,30),up(S,30),fq.Wc,fq.S,seatB);
      paraSeats(g,up(S,30),up(E,30),fq.S,fq.E,IB.shade(seatB,0.15));
      /* поле + розмітка */
      IB.PA(g,[fq.N,fq.E,fq.S,fq.Wc],'#3e7a3a');
      g.strokeStyle='#d8e4d0';g.lineWidth=1;
      g.beginPath();g.ellipse(C[0],C[1],(E[0]-N[0])*k*0.30,(S[1]-N[1])*k*0.30,0,0,7);g.stroke();
      g.beginPath();g.moveTo(fq.Wc[0],fq.Wc[1]);g.lineTo(fq.E[0],fq.E[1]);g.stroke();
      /* прожектори по видимих кутах */
      for(const[px,py]of[[Wc[0]-1,Wc[1]-1],[E[0]-1,E[1]-1]]){
        IB.P(g,px,py-52,3,52,P.m2);
        IB.P(g,px-4,py-58,11,6,P.gr3);
        IB.P(g,px-3,py-57,9,3,P.y4);
      }
    },0);
  }
  function paraSeats(g,a,b,c,d,col){   /* смуги сидінь на схилі трибуни */
    for(let i=0;i<5;i++){
      const t0=0.08+i*0.18,t1=t0+0.09;
      const p1=[a[0]+(c[0]-a[0])*t0,a[1]+(c[1]-a[1])*t0],p2=[b[0]+(d[0]-b[0])*t0,b[1]+(d[1]-b[1])*t0];
      const p3=[b[0]+(d[0]-b[0])*t1,b[1]+(d[1]-b[1])*t1],p4=[a[0]+(c[0]-a[0])*t1,a[1]+(c[1]-a[1])*t1];
      IB.PA(g,[p1,p2,p3,p4],col);
    }
  }
  stadiumLM('stadium',8,6,'#4e6ea8','#e0b040');     /* ім. Лобановського — біля мосту Патона */
  stadiumLM('stadium2',7,5,'#4e8ea8','#d86830');    /* стадіон Троєщини */
  /* ================= КАПЛИЦЯ СЕЛИЩА ІРПІНЬ (батч 14) ================= */
  LM('chapel',2,2,20,22,(g,f)=>{
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],P.wht);
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],P.gr4);
    IB.PA(g,[f.N,f.E,f.S,f.Wc],'#c8b070');
    IB.P(g,f.Wc[0],f.Wc[1],1,f.hpx,P.gr3);IB.P(g,f.S[0]-1,f.S[1],1,f.hpx,P.gr3);
    dome(g,(f.N[0]+f.S[0])/2,f.N[1]-2,7,P.y2,P.y3,P.y4);
    IB.P(g,f.S[0]-4,f.S[1]+f.hpx-10,8,10,P.d02);
    IB.speck(g,f.Wc[0],f.Wc[1],f.wT*16+8,f.hpx+4,P.ash2,6,13);
  });
  /* БАТЧ 15: дерев'яна церквка села Пухівка (темне дерево, зелений дах, малий хрест) */
  LM('chapel2',2,2,18,18,(g,f)=>{
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],'#6a4e34');
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],'#57402a');
    IB.PA(g,[f.N,f.E,f.S,f.Wc],'#3e6e48');
    IB.P(g,f.Wc[0],f.Wc[1],1,f.hpx,'#4a3626');IB.P(g,f.S[0]-1,f.S[1],1,f.hpx,'#4a3626');
    IB.PA(g,[[f.N[0]+f.wT*8,f.N[1]-8],[f.N[0]+f.wT*8+2,f.N[1]-8],[f.N[0]+f.wT*8+1,f.N[1]-14]],'#c8b070');
    IB.P(g,f.S[0]-3,f.S[1]+f.hpx-8,6,8,'#26221e');
    IB.speck(g,f.Wc[0],f.Wc[1],f.wT*16+8,f.hpx+4,P.ash2,6,17);
  });
  /* БАТЧ 16: церковка Нових Петрівців (село за Троєщиною) — синій дах */
  LM('chapel3',2,2,18,18,(g,f)=>{
    IB.PA(g,[f.Wc,f.S,[f.S[0],f.S[1]+f.hpx],[f.Wc[0],f.Wc[1]+f.hpx]],'#7a5e40');
    IB.PA(g,[f.S,f.E,[f.E[0],f.E[1]+f.hpx],[f.S[0],f.S[1]+f.hpx]],'#644c32');
    IB.PA(g,[f.N,f.E,f.S,f.Wc],'#3e5a8a');
    IB.P(g,f.Wc[0],f.Wc[1],1,f.hpx,'#55402a');IB.P(g,f.S[0]-1,f.S[1],1,f.hpx,'#55402a');
    IB.PA(g,[[f.N[0]+f.wT*8,f.N[1]-8],[f.N[0]+f.wT*8+2,f.N[1]-8],[f.N[0]+f.wT*8+1,f.N[1]-14]],'#c8b070');
    IB.P(g,f.S[0]-3,f.S[1]+f.hpx-8,6,8,'#26221e');
    IB.speck(g,f.Wc[0],f.Wc[1],f.wT*16+8,f.hpx+4,P.ash2,6,27);
  });
  /* МУРАЛ: тримай та КИЇВ (як на скріншоті) */
  (function(){
    const c=IB.mk(64,52),g=c.g;
    IB.P(g,4,4,54,42,P.c3);
    IB.P(g,4,4,54,3,P.c4);IB.P(g,4,43,54,3,P.c2);
    IB.P(g,8,8,46,34,P.u2);
    IB.P(g,8,30,46,12,P.y4);
    // trident
    const tx=30,ty=14;
    IB.P(g,tx-5,ty,3,14,P.y4);IB.P(g,tx+3,ty,3,14,P.y4);IB.P(g,tx-1,ty-3,3,18,P.y4);
    IB.P(g,tx-4,ty+12,9,3,P.y4);
    // КИЇВ letters 3x5
    const L={'К':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,1],[2,3]],'И':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,2],[2,0],[2,1],[2,2],[2,3],[2,4]],'Ї':[[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],'В':[[0,0],[0,1],[0,2],[0,3],[0,4],[1,0],[2,1],[1,2],[2,3],[1,4]]};
    const word='КИЇВ';let ox=14;
    for(const ch of word){const pts=L[ch]||[];for(const p of pts)IB.P(g,ox+p[0],20+p[1],1,1,P.wht);ox+=4;}
    IB.speck(g,4,4,54,42,P.gr1,12,4);
    SPR_TEMP={c,ax:32,ay:50};
  })();
  function SPR_TEMP(){}
  return BIG;
})();
