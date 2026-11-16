/* IBONARIUM KYIV — palette + pixel-bake helpers (Mega Drive 9-bit feel) */
window.IB = {};
IB.M = Math;
IB.rnd = (a,b)=>a+IB.M.random()*(b-a);
IB.ri  = (a,b)=>IB.M.floor(a+IB.M.random()*(b-a+1));
IB.clamp=(v,a,b)=>v<a?a:(v>b?b:v);
IB.lerp=(a,b,t)=>a+(b-a)*t;
IB.dist=(ax,ay,bx,by)=>IB.M.hypot(bx-ax,by-ay);
/* БАТЧ 14 ФІКС: >>>16 (беззнаковий зсув) — раніше знаковий >>16 після XOR ЗАВЖДИ гасив
   старший біт: hsh ніколи не перевищував 0.5, через що всі пороги >0.5 спрацьовували неправильно
   (dacha3 не генерувалась, гойдалки у дворах не спавнились, авто завжди справні, муралі/лихтарі
   надто густі). Тепер розподіл рівномірний [0,1). */
IB.hsh=(x,y,s=0)=>{let h=(x*374761393+y*668265263+s*1274126177)|0;h=((h^(h>>13))*1274126177)|0;h=(h^(h>>>16))>>>0;return h/4294967296;};

IB.mk = (w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;c.g=g;return c;};

/* Kenney City Kit palette — ПОСТАПОКАЛІПТИЧНА редакція: пил, бруд, вигорілі тони */
IB.PAL = {
  blk:'#000000', d01:'#0e0e12', d02:'#1a1a20', d03:'#282830',
  gr1:'#5e6472', gr2:'#82889a', gr3:'#9aa0ae', gr4:'#b8bcc6', gr5:'#d4d8de', wht:'#eceef0',
  sk1:'#f0a482', sk2:'#d88c66', sk3:'#b87050',
  /* трава — суха, оливково-пилова */
  g1:'#2a3420', g2:'#3a4628', g3:'#485630', g4:'#586a3a', g5:'#6a7c46', g6:'#7e8e54',
  ol1:'#4c5632', ol2:'#66723e',
  /* асфальт — вивітрілий сіро-бурий */
  a1:'#2c2e36', a2:'#44464e', a3:'#54565e', a4:'#7c7e88',
  /* бетон/тротуар — запилений */
  c1:'#50525a', c2:'#8e9096', c3:'#72747c', c4:'#a4a6ac',
  r1:'#7a4028', r2:'#a05a3c', r3:'#b87058', r4:'#cc8a70',
  b1:'#3e3220', b2:'#6e5636', b3:'#8a6c44', b4:'#a68754',
  y1:'#7a5e18', y2:'#b08624', y3:'#d8a834', y4:'#f0bc42',
  u1:'#2a3e5c', u2:'#5c78a4', u3:'#708cb8',
  s1:'#2a3e5c', s2:'#3c5a84', s3:'#5c78a4',
  /* Дніпро — каламутний, оліго-зелений */
  w1:'#1c2e2e', w2:'#28403c', w3:'#325048', w4:'#426458',
  rd1:'#7c2820', rd2:'#b84840', rd3:'#cc6252',
  zd:'#5cb878', zd2:'#489a60', zd3:'#7ccc8e',
  t1:'#4c4e56', t2:'#5e6068', t3:'#8a8c94',
  m1:'#44484f', m2:'#5c6068', m3:'#848892', m4:'#b4b8c0',
  ru1:'#9c5234', ru2:'#b46848',
  n1:'#12121e', n2:'#1a1c30', n3:'#262844',
  /* пісок/пил землі */
  sa1:'#9e8c62', sa2:'#b4a074', sa3:'#c8b888',
  mn1:'#8a8c94', mn2:'#9a9ca4',   /* Майдан — запилена бруківка */
  or1:'#e07038',
  /* нові постапокаліптичні тони */
  ash1:'#6a6456', ash2:'#54503f', dust1:'#8a8068', rust1:'#8a4a28',
};

/* --- drawing helpers --- */
IB.P = (g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w|0,h|0);};
IB.PA = (g,pts,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();g.fill();};
IB.O = (g,x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.fill();};
/* deterministic noise dot scatter inside box */
IB.speck=(g,x,y,w,h,c,n,seed=0)=>{for(let i=0;i<n;i++){const px=x+IB.hsh(i,seed,1)*w,py=y+IB.hsh(i,seed,2)*h;g.fillStyle=c;g.fillRect(px|0,py|0,1,1);}};
IB.shade=(hex,f)=>{ // f>0 lighten, f<0 darken
  const n=parseInt(hex.slice(1),16),r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  const t=f>0?255:0,p=IB.M.abs(f);
  const m=v=>IB.M.round(IB.lerp(v,t,p));
  return '#'+((IB.clamp(m(r),0,255)<<16)|(IB.clamp(m(g),0,255)<<8)|IB.clamp(m(b),0,255)).toString(16).padStart(6,'0');
};
/* iso rhombus ground tile 32x16 */
IB.rhomb=(g,x,y,w,h,c)=>{IB.PA(g,[[x,y+h/2],[x+w/2,y],[x+w,y+h/2],[x+w/2,y+h]],c);};
/* iso box: top rhombus + left & right faces; returns nothing. w,d in px footprint, hh height px */
IB.isoBox=(g,x,y,w,d,hh,ct,cl,cr)=>{
  IB.PA(g,[[x,y+d/2],[x+w/2,y],[x+w,y+d/2],[x+w/2,y+d]],ct);            // top
  IB.PA(g,[[x,y+d/2],[x+w/2,y+d],[x+w/2,y+d+hh],[x,y+d/2+hh]],cl);      // left
  IB.PA(g,[[x+w/2,y+d],[x+w,y+d/2],[x+w,y+d/2+hh],[x+w/2,y+d+hh]],cr);  // right
};
IB.windowGrid=(g,x,y,w,h,cols,rows,dark,lit,colsSkip)=>{
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    if(colsSkip&&IB.hsh(c,r,colsSkip)<0.22)continue;
    const wx=x+2+((w-4)/cols)*c, wy=y+2+((h-4)/rows)*r;
    const on=IB.hsh(c,r,7)<0.16;
    IB.P(g,wx,wy,(w-4)/cols-1,(h-4)/rows-1,on?lit:dark);
    if(on)IB.P(g,wx,wy,(w-4)/cols-1,(h-4)/rows-1,IB.shade(lit,-0.25));
  }
};
