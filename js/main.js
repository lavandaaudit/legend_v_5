/* IBONARIUM KYIV — main.js: цикл, керування, HUD, меню, звук, збереження */
IB.Input=(function(){
  const keys={},pressed={};
  const MAP={KeyW:'w',ArrowUp:'up',KeyS:'s',ArrowDown:'down',KeyA:'a',ArrowLeft:'left',KeyD:'d',ArrowRight:'right',
    ShiftLeft:'shift',ShiftRight:'shift',KeyE:'e',Space:'space',KeyQ:'q',KeyM:'m',Tab:'tab',Escape:'esc',
    Enter:'enter',KeyF:'f',KeyG:'g',KeyH:'h',KeyX:'x',Digit1:'1',Digit2:'2',Digit3:'3',Digit4:'4',KeyI:'i',KeyV:'fs',KeyP:'p'};
  window.addEventListener('keydown',ev=>{
    const k=MAP[ev.code];
    if(k){if(!keys[k])pressed[k]=true;keys[k]=true;
      if(['space','tab','esc','enter','q','e','m','i','f','g','h','x','fs','p','1','2','3','4','up','down','left','right'].indexOf(k)>=0)ev.preventDefault();}
    IB.AUDIO.init();
  },{passive:false});
  window.addEventListener('keyup',ev=>{const k=MAP[ev.code];if(k)keys[k]=false;});
  window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
  /* сенсорне керування (віртуальний джойстик + кнопки) */
  const touch={x:0,y:0,active:false};
  function bindTouch(){
    const pad=document.getElementById('dpad');if(!pad)return;
    const knob=document.getElementById('dpad-knob');
    const btns={a:'e',b:'space',c:'tab',d:'m',e:'f',h:'shift',k:'x'};
    document.querySelectorAll('[data-tk]').forEach(el=>{
      const k=btns[el.dataset.tk];
      const toggleMode=k==='shift';   /* RUN — перемикач (мобільно зручніше) */
      const on=ev=>{ev.preventDefault();
        if(toggleMode){keys[k]=!keys[k];el.classList.toggle('on',keys[k]);if(keys[k])pressed[k]=true;return;}
        if(!keys[k])pressed[k]=true;keys[k]=true;el.classList.add('on');};
      const off=ev=>{ev.preventDefault();
        if(toggleMode)return;
        keys[k]=false;el.classList.remove('on');};
      el.addEventListener('touchstart',on,{passive:false});
      el.addEventListener('touchend',off,{passive:false});
      el.addEventListener('touchcancel',off,{passive:false});
      el.addEventListener('mousedown',on);
      el.addEventListener('mouseup',off);
      el.addEventListener('mouseleave',off);
    });
    let cx=0,cy=0,pid=null;
    const setKnob=(dx,dy)=>{if(knob)knob.style.transform='translate('+(dx*26)+'px,'+(dy*26)+'px)';};
    const start=ev=>{ev.preventDefault();const t=ev.changedTouches?ev.changedTouches[0]:ev;const r=pad.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;touch.active=true;if(t.identifier!==undefined)pid=t.identifier;pad.classList.add('on');};
    const move=ev=>{
      if(!touch.active)return;ev.preventDefault();
      let t=null;
      if(ev.changedTouches){for(const tt of ev.changedTouches)if(tt.identifier===pid)t=tt;if(!t)return;}
      else t=ev;
      let dx=(t.clientX-cx)/40,dy=(t.clientY-cy)/40;
      const l=Math.hypot(dx,dy);if(l>1){dx/=l;dy/=l;}
      touch.x=dx;touch.y=dy;
      keys.w=dy<-0.3;keys.up=keys.w;keys.s=dy>0.3;keys.down=keys.s;
      keys.a=dx<-0.3;keys.left=keys.a;keys.d=dx>0.3;keys.right=keys.d;
      setKnob(dx,dy);
    };
    const end=ev=>{ev.preventDefault();touch.active=false;touch.x=touch.y=0;pid=null;keys.w=keys.s=keys.a=keys.d=keys.up=keys.down=keys.left=keys.right=false;setKnob(0,0);pad.classList.remove('on');};
    pad.addEventListener('touchstart',start,{passive:false});
    pad.addEventListener('touchmove',move,{passive:false});
    pad.addEventListener('touchend',end,{passive:false});
    pad.addEventListener('touchcancel',end,{passive:false});
    /* десктоп-тест джойстика мишкою */
    pad.addEventListener('mousedown',start);
    window.addEventListener('mousemove',ev=>{if(touch.active&&pid===null)move(ev);});
    window.addEventListener('mouseup',ev=>{if(touch.active&&pid===null)end(ev);});
  }
  return {keys,pressed,bindTouch,moveVec(){
    let x=0,y=0;
    if(keys.a||keys.left)x-=1;if(keys.d||keys.right)x+=1;
    if(keys.w||keys.up)y-=1;if(keys.s||keys.down)y+=1;
    if(touch.active){x+=touch.x;y+=touch.y;}
    return {x,y};
  },consume(k){if(pressed[k]){pressed[k]=false;return true;}return false;},clear(){for(const k in pressed)pressed[k]=false;}};
})();

IB.MAIN=(function(){
  let cv,g,hud={},last=0,acc=0,mode='boot';
  let menuIdx=0,menuItems=[],menuCtx='';
  let dlg={name:'',text:'',opts:[],idx:0};
  let sel=0,invSel=0;
  let bootT=0,titleT=0,loadT=0,fadeT=0,fadeCb=null;
  let uiTick=0;
  const MAIN={attackAnim:0,shootAnim:0,muzzleT:0};
  window.MAIN=MAIN;   /* зовнішній доступ для діагностики/консолі (батч 15) */

  /* ---------- FULLSCREEN: на все вікно, з мобільним фолбеком ---------- */
  function isFs(){return !!(document.fullscreenElement||document.webkitFullscreenElement||document.body.classList.contains('fakefs'));}
  function toggleFullscreen(){
    const crt=$('crt');
    if(isFs()&&!document.body.classList.contains('fakefs')){
      (document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document);
      return;
    }
    if(document.body.classList.contains('fakefs')){document.body.classList.remove('fakefs');return;}
    const el=crt||document.documentElement;
    const rq=el.requestFullscreen||el.webkitRequestFullscreen||el.webkitRequestFullScreen;
    if(rq){
      try{const p=rq.call(el);if(p&&p.catch)p.catch(()=>fakeFs());}catch(e){fakeFs();}
      setTimeout(()=>{if(!document.fullscreenElement&&!document.webkitFullscreenElement)fakeFs();},350);
    } else fakeFs();
  }
  function fakeFs(){
    document.body.classList.add('fakefs');
    IB.toast&&IB.toast('ПОВНИЙ ЕКРАН: РЕЖИМ БЕЗ API — ESC ДЛЯ ВИХОДУ','gold');
  }
  document.addEventListener('fullscreenchange',()=>{document.body.classList.toggle('fs',!!document.fullscreenElement);});
  document.addEventListener('webkitfullscreenchange',()=>{document.body.classList.toggle('fs',!!document.webkitFullscreenElement);});
  MAIN.toggleFullscreen=toggleFullscreen;
  MAIN.isFs=isFs;

  /* ---------- утиліти DOM ---------- */
  function $(id){return document.getElementById(id);}
  function show(id,on){const el=$(id);if(el)el.classList.toggle('hidden',!on);}

  /* ---- БАТЧ 12: точка маршруту (GPS) + бічна панель об'єктів великої карти ---- */
  MAIN.setWaypoint=function(wx,wy,n){
    const G=IB.G,W=IB.WORLD;
    if(!W||!IB.PL)return;
    if(G.flags.way&&IB.dist(wx,wy,G.flags.way.x,G.flags.way.y)<7){
      delete G.flags.way;
      IB.toast('GPS: ТОЧКУ МАРШРУТУ ЗНЯТО');IB.AUDIO.sfx('ui');
      buildMapPanel();return;
    }
    const x=IB.clamp(wx,1,W.W-2),y=IB.clamp(wy,1,W.H-2);
    G.flags.way={x,y,n:n||'ТОЧКА МАРШРУТУ'};
    const d=IB.M.round(IB.dist(IB.PL.x,IB.PL.y,x,y)*8);
    IB.toast('НАВІГТОР: КРАСНА ЛІНІЯ ВЕДО ДО «'+G.flags.way.n+'» — ≈'+d+' М','gold');
    IB.AUDIO.sfx('sel');
    buildMapPanel();
  };
  /* ---- БАТЧ 15: ПОЗНАЧКИ гравця на карті (SHIFT+клік) ---- */
  MAIN.addPin=function(wx,wy){
    const G=IB.G,W=IB.WORLD;
    if(!W||!IB.PL)return;
    G.flags.pins=G.flags.pins||[];
    const x=IB.clamp(wx,1,W.W-2),y=IB.clamp(wy,1,W.H-2);
    /* клік по наявній позначці — видалити */
    const hi=G.flags.pins.findIndex(p=>IB.dist(p.x,p.y,x,y)<6);
    if(hi>=0){
      const rm=G.flags.pins.splice(hi,1)[0];
      IB.toast('ПОЗНАЧКУ «'+rm.n+'» ВИДАЛЕНО');IB.AUDIO.sfx('ui');
      buildMapPanel();return;
    }
    if(G.flags.pins.length>=8){G.flags.pins.shift();}
    const zn=W.zoneAt?W.zoneName(W.zoneAt(x,y)):'КИЇВ';
    const pn={x,y,n:'ПОЗНАЧКА • '+zn,i:Date.now()%100000};
    G.flags.pins.push(pn);
    IB.toast('ПОЗНАЧКУ СТАВЛЕНО: «'+pn.n+'» (SHIFT+КЛІК ПО НІЙ — ВИДАЛИТИ)','gold');
    IB.AUDIO.sfx('sel');
    buildMapPanel();
  };
  function buildMapPanel(){
    const side=$('map-side');if(!side)return;
    const P=IB.GFX?IB.GFX.poiList():null,G=IB.G;
    if(!P){side.innerHTML='';return;}
    let h='';
    if(P.metro){
      h+='<div class="ms-h">МЕТРО • СТАНЦІЇ — '+P.st.length+'</div>';
      for(const o of P.st)h+=rowHTML(o,'m');
      if(P.rooms&&P.rooms.length){
        h+='<div class="ms-h">СПЕЦКІМНАТИ — '+P.rooms.length+'</div>';
        for(const o of P.rooms)h+=rowHTML(o,'r');
      }
    }else{
      let vz=0;for(const z of P.dist)if(z.v)vz++;
      h+='<div class="ms-h">РАЙОНИ — '+vz+'/'+P.dist.length+'</div>';
      for(const z of P.dist)h+=rowHTML(z,z.v?'v':'');
      h+='<div class="ms-h">МЕТРО — '+P.st.length+' СТАНЦІЙ</div>';
      for(const o of P.st)h+=rowHTML(o,'m');
      h+='<div class="ms-h">СХОВАНКИ — '+P.safe.length+'</div>';
      for(const o of P.safe)h+=rowHTML(o,'s');
      /* КВЕСТ «НЕДОСТАВЛЕНІ»: журнал листів (клік по зібраному — перечитати, по незібраному — маршрут) */
      if(IB.MAIL){
        const J=IB.MAIL.journal(),PR=IB.MAIL.progress();
        h+='<div class="ms-h">ЛИСТИ • '+PR.read+'/'+PR.total+(PR.fin?' • В ЕФІРІ':'')+' • КВЕСТ «НЕДОСТАВЛЕНІ»</div>';
        for(const o of J)h+='<div class="ms-r '+(o.done?'ml':'mu')+'" data-x="'+o.x+'" data-y="'+o.y+'" data-i="'+o.i+'" data-n="ЛИСТ • '+o.zn+'"><span class="ms-n">'+(o.done?'\u2709 ':'\u2610 ')+o.zn+'</span><span class="ms-d">'+(o.done?o.t:'не знайдено')+'</span></div>';
      }
      /* БАТЧ 14: АЗС / FN< / СТАДІОНИ */
      if(P.gas&&P.gas.length){
        h+='<div class="ms-h">АЗС — '+P.gas.length+'</div>';
        for(const o of P.gas)h+=rowHTML(o,'t');
      }
      if(P.fn&&P.fn.length){
        h+='<div class="ms-h">СУПЕРМАРКЕТИ FN<</div>';
        for(const o of P.fn)h+=rowHTML(o,'x');
      }
      if(P.stad&&P.stad.length){
        h+='<div class="ms-h">СТАДІОНИ — '+P.stad.length+'</div>';
        for(const o of P.stad)h+=rowHTML(o,'l');
      }
      /* БАТЧ 15: села/озеро/гори/мости */
      if(P.geo&&P.geo.length){
        h+='<div class="ms-h">ЗА МІСТОМ — СЕЛА, ОЗЕРО, ГОРИ, МОСТИ</div>';
        for(const o of P.geo)h+=rowHTML(o,'g');
      }
      /* БАТЧ 15: позначки гравця */
      if(P.pins&&P.pins.length){
        h+='<div class="ms-h">ПОЗНАЧКИ — '+P.pins.length+' (SHIFT+КЛІК СТАВИТЬ/ВИДАЛЯЄ)</div>';
        for(const o of P.pins)h+=rowHTML(o,'p');
      }
      h+='<div class="ms-h">ЛОКАЦІЇ — '+P.lm.length+'</div>';
      for(const o of P.lm)h+=rowHTML(o,'l');
      h+='<div class="ms-h">РАДІОВЕЖІ — '+P.tw.length+'</div>';
      for(const o of P.tw)h+=rowHTML(o,'t');
      if(P.base)h+=rowHTML(P.base,'b');
      /* БАТЧ 13: будівлі зі статусом зачистки */
      if(P.blds&&P.blds.length){
        let cb=0,tb=0;
        const CW2=IB.CWORLD;
        if(CW2)for(let i=0;i<CW2.blds.length;i++){if(CW2.blds[i].door){tb++;if(IB.bldState(i).cleared)cb++;}}
        h+='<div class="ms-h">БУДИНКИ — ЗЧИЩЕНО '+cb+'/'+tb+'</div>';
        for(const o of P.blds)h+=rowHTML(o,o.st?'v':'x');
      }
    }
    h+='<div class="ms-h">● МАРШРУТ: '+(G.flags.way?G.flags.way.n:'НЕ ЗАДАНО')+'</div>';
    h+='<div class="ms-tip">КЛІК ПО КАРТІ/РЯДКУ — КРАСНА ЛІНІЯ НАВІГСАЦЇЇ (BFS-ШЛЯХ ПОВЕРХ УЛИЦЬ). SHIFT+КЛІК ПО КАРТІ — СВОЯ ПОЗНАЧКА. КОЛЕСО/± — ЗУМ. P — ПЛАН МІСТА.</div>';
    side.innerHTML=h;
    side.querySelectorAll('.ms-r').forEach(el=>{
      el.addEventListener('click',()=>{
        if(el.dataset.i!==undefined&&el.classList.contains('ml')){IB.MAIL.reread(+el.dataset.i);return;}   /* перечитати зібраний лист */
        MAIN.setWaypoint(parseFloat(el.dataset.x),parseFloat(el.dataset.y),el.dataset.n);});
    });
  }
  function rowHTML(o,cls){
    const d=IB.PL?IB.M.round(IB.dist(IB.PL.x,IB.PL.y,o.x,o.y)*8):0;
    return '<div class="ms-r '+cls+'" data-x="'+o.x+'" data-y="'+o.y+'" data-n="'+String(o.n).replace(/"/g,'')+'">'+
      '<span class="ms-n">'+o.n+'</span><span class="ms-d">≈'+d+' м'+(o.v?' <i class="ok">✓</i>':'')+'</span></div>';
  }
  IB.toast=function(msg,cls){
    const log=$('log');if(!log)return;
    const div=document.createElement('div');
    div.className='log-line'+(cls?' '+cls:'');
    div.textContent=msg;
    log.appendChild(div);
    while(log.children.length>4)log.removeChild(log.firstChild);
    setTimeout(()=>{if(div.parentNode)div.parentNode.removeChild(div);},4000);
  };
  IB.banner=function(txt){
    const b=$('banner');if(!b)return;
    b.textContent=txt;b.classList.remove('hidden');
    b.style.animation='none';void b.offsetWidth;b.style.animation='';
    clearTimeout(b._t);b._t=setTimeout(()=>b.classList.add('hidden'),2700);
  };
  IB.dialog=function(name,text,opts){
    mode='dialog';dlg={name,text:text.replace(/\\n/g,'\n'),opts:opts||[],idx:0};
    renderDialog();
    IB.AUDIO.sfx('ui');
  };
  function renderDialog(){
    $('dlg-name').textContent=dlg.name;
    $('dlg-text').textContent=dlg.text;
    const box=$('dlg-opts');box.innerHTML='';
    dlg.opts.forEach((o,i)=>{
      const d=document.createElement('div');
      d.className='dopt'+(i===dlg.idx?' sel':'');
      d.textContent=o.t;
      d.onclick=()=>{dlg.idx=i;closeDialog();o.f&&o.f();};
      box.appendChild(d);
    });
    show('dialog',true);
  }
  function closeDialog(){show('dialog',false);mode='game';}

  /* ---------- загрузка/HUD ---------- */
  const SECTORS=IB.ZONES.map(z=>z.n);
  function setLoading(secN,tip){
    $('load-sector').textContent=secN;
    $('load-tip').textContent=tip||'';
  }
  function syncHUD(){
    const p=IB.PL;if(!p)return;
    const G=IB.G,W=IB.WORLD;
    $('bar-hp').style.width=Math.round(IB.clamp(p.hp,0,100))+'%';
    $('bar-st').style.width=Math.round(IB.clamp(p.st,0,100))+'%';
    $('bar-hu').style.width=Math.round(IB.clamp(p.hu,0,100))+'%';
    $('bar-wa').style.width=Math.round(IB.clamp(p.wa,0,100))+'%';
    const z=W.zoneAt(p.x,p.y);
    const zn=W.zoneName(z);
    if(hud.loc!==zn){hud.loc=zn;$('hud-loc').textContent=zn;}
    const day='ДЕНЬ '+G.day;
    if(hud.day!==day){hud.day=day;$('hud-day').childNodes[0].nodeValue=day+' ';}
    const ck=IB.clockStr();
    if(hud.ck!==ck){hud.ck=ck;$('hud-clock').textContent=ck;}
    const wxl=IB.WX.label();
    /* (погода перенесена нижче — підтримка шару метро) */
    const m=IB.MISSIONS[G.mi];
    const mt=G.ending?'ВИЖИВАЙ — КИЇВ ЖИВЕ':(m?('«'+m.t+'»'):'—');
    if(hud.mt!==mt){hud.mt=mt;$('hud-mtitle').textContent=mt;}
    /* відстань до цілі */
    if(m&&!G.ending){
      const tx=(m.two&&G.flags['m6a']&&m.x2!==undefined)?m.x2:m.x;
      const ty=(m.two&&G.flags['m6a']&&m.y2!==undefined)?m.y2:m.y;
      const d=IB.dist(p.x,p.y,tx+0.5,ty+0.5)|0;
      const ob2='ЦІЛЬ: '+d+' м • '+W.zoneName(W.zoneAt(tx,ty));
      if(hud.ob!==ob2){hud.ob=ob2;$('hud-mob').textContent=ob2;}
    } else {if(hud.ob!==''){hud.ob='';$('hud-mob').textContent='';}}
    /* радіо поблизу + тривога */
    let radioNear=false;
    for(const tw of W.towers)if(IB.dist(p.x,p.y,tw.x,tw.y)<26){radioNear=true;break;}
    const SH=IB.G.shah,raid=SH&&SH.phase;
    $('hud-warn').textContent=(radioNear?'((·))':'')+(raid?' ✈ТРИВОГА':'');
    /* БАТЧ 11: індикатор ТРИВОГИ — режим завжди видно: відлік до сирени, атака,
       статус укриття, пауза в метро і чіткий ВІДБІЙ з таймером */
    {
      let at='',cls='';
      const prot=IB.SYS.protectedFrom();
      if(SH&&SH.phase==='raid'){
        const n=IB.M.max(0,(SH.count||0)-(SH.spawnN||0))+IB.ENTS.shaheds.length;
        if(IB.layer==='metro'){at='ТРИВОГА В МІСТІ • ТИ В ПІДЗЕМЦІ — ШАХЕДИ НЕ ДІЮТЬ';cls='al-ok';}
        else if(prot){at='ТРИВОГА • АТАКА ТРИВАЄ • ТИ В УКРИТТІ • В ПОВІТРІ: '+n;cls='al-ok';}
        else{at='ПОВІТРЯНА ТРИВОГА • ШАХЕДІВ У ПОВІТРІ: '+n+' • УКРИЙСЯ (МЕТРО/БУДИНОК)!';cls='al-red';}
      } else if(SH&&SH.t<=60){
        if(IB.layer==='interior'){at='ТРИВОГА — ТИ В БУДІВЛІ • УКРИТО ВІД ШАХЕДІВ';cls='al-ok';}
        else if(IB.layer!=='metro'){at='ТРИВОГА — СИРЕНА • ШАХЕДИ НА ПІДЛЬОТІ ЧЕРЕЗ '+IB.M.max(1,IB.M.ceil(SH.t))+'с';cls=SH.t<=28?'al-red':'al-warn';}
      } else if(SH&&SH.offT>0){
        at='ВІДБІЙ ТРИВОГИ • АТАК ПЕРЕЖИТО: '+IB.G.stats.att;cls='al-ok';
      }
      if(hud.al!==at){hud.al=at;const el=$('hud-alert');if(el){el.textContent=at;el.className=at?cls:'hidden';}}
    }
    /* хотбар: МЕЧ / ВИНТОВКА / ГРАНАТА / АПТЕЧКА */
    if(uiTick%10===0){
      const slots=[{ic:'machete',n:'SPACE'},{ic:'rifle',n:'X • '+(p.inv.ammo||0)},{ic:'grenade',n:'G • '+(p.inv.grenade||0)},{ic:'medkit',n:'H • '+(p.inv.medkit||0)}];
      document.querySelectorAll('#hotbar .slot').forEach((el,i)=>{
        const c=el.querySelector('canvas'),cg=c.getContext('2d');
        cg.clearRect(0,0,26,22);
        const ic=IB.SPR.icons[slots[i].ic];
        if(ic)cg.drawImage(ic,0,0,26,22);
        el.querySelector('span').textContent=slots[i].n;
      });
    }
    /* статики: ☠ зомбі вбито • ✈ атак пережито • ♥ людей врятовано */
    if(uiTick%10===0){
      const st=IB.G.stats||{att:0,saved:0,bld:0};
      const kt='☠ '+(p.kills||0),at='✈ '+(st.att||0),sv='♥ '+(st.saved||0),bl='⌂ '+(st.bld||0);
      if(hud.kt!==kt){hud.kt=kt;const e=$('st-kills');if(e)e.textContent=kt;}
      if(hud.at!==at){hud.at=at;const e=$('st-att');if(e)e.textContent=at;}
      if(hud.sv!==sv){hud.sv=sv;const e=$('st-sav');if(e)e.textContent=sv;}
      if(hud.bl!==bl){hud.bl=bl;const e=$('st-bld');if(e)e.textContent=bl;}
    }
    /* промпт */
    let pr='';
    if(IB.HIDE)pr='E — ВИЙТИ НА ВУЛИЦЮ • СХОВАНО, ЗОМБІ НЕ БАЧАТЬ';
    else if(IB.G.search)pr='ОГЛЯД... '+Math.round((1-IB.G.search.t/0.9)*100)+'%';
    else{
      const list=IB.SYS.interactables().filter(it=>it.kind!=='survf');
      if(!p.car&&list.length&&mode==='game')pr=list[0].label;
      else if(p.car)pr='E — ВИЙТИ З АВТО • SPACE — СИГНАЛ';
    }
    if(hud.pr!==pr){hud.pr=pr;const el=$('prompt');el.textContent=pr.replace(/^E — /,'');el.classList.toggle('hidden',!pr);
      if(pr.indexOf('E — ')===0)el.innerHTML='<b>E</b> — '+pr.slice(4);}
    /* toolbelt: ліхтар / авто / СХОВАНО */
    $('tb-light').classList.toggle('hidden',!p.flash);
    $('tb-car').classList.toggle('hidden',!p.car);
    const tbH=$('tb-radio');
    if(tbH){tbH.textContent='СХОВАНО';tbH.classList.toggle('hidden',!IB.HIDE);}
    /* погода/шар */
    const wxEl=$('hud-wx');
    if(wxEl){
      const wTxt=IB.layer==='metro'?'ПІДЗЕМКА':(IB.layer==='interior'?'БУДИНОК':IB.WX.label());
      if(hud.wx!==wTxt){hud.wx=wTxt;wxEl.textContent=wTxt;wxEl.className=wTxt==='ДОЩ'?'wxr':(wTxt==='ВІТЕР'?'wxw':'wxs');}
    }
    /* hurt */
    $('hurt').style.opacity=p.hurtT>0?Math.min(0.9,p.hurtT):0;
    p.hurtT=Math.max(0,p.hurtT-0.02);
  }

  /* ---------- меню ---------- */
  function setMenu(items,ctx){
    menuItems=items;menuCtx=ctx||'';menuIdx=0;
    const box=$(ctx==='pause'?'pause-menu':'menu');
    box.innerHTML='';
    items.forEach((it,i)=>{
      const d=document.createElement('div');
      d.className='mi'+(i===menuIdx?' sel':'');
      d.textContent=it.t;
      d.onclick=()=>{menuIdx=i;IB.AUDIO.sfx('sel');it.f();};
      box.appendChild(d);
    });
  }
  function menuMove(d){
    menuIdx=(menuIdx+d+menuItems.length)%menuItems.length;
    const box=$(menuCtx==='pause'?'pause-menu':'menu');
    [...box.children].forEach((el,i)=>el.classList.toggle('sel',i===menuIdx));
    IB.AUDIO.sfx('ui');
  }
  function menuSel(){const it=menuItems[menuIdx];if(it){IB.AUDIO.sfx('sel');it.f();}}

  function titleMenu(){
    mode='title';
    show('title',true);show('loading',false);show('hud',false);show('pause',false);show('dead',false);show('end',false);show('bigmap',false);show('inv',false);show('controls',false);show('about',false);
    try{IB.GFX.drawLogo($('logo').getContext('2d'));}catch(e){}
    const items=[{t:'НОВА ГРА',f:()=>startNewGame()}];
    if(IB.SYS.hasSave())items.push({t:'ПРОДОВЖИТИ',f:()=>loadGame()});
    items.push({t:'КЕРУВАННЯ',f:()=>{mode='controls';show('title',false);show('controls',true);}});
    items.push({t:'ПРО ГРУ ТА АСЕТИ',f:()=>{mode='about';show('title',false);show('about',true);}});
    setMenu(items,'title');
    IB.AUDIO.jingle();
  }
  function startNewGame(){
    show('title',false);show('loading',true);mode='loading';
    loadT=0;
  }
  function loadGame(){
    show('title',false);show('loading',true);mode='loading';
    loadT=0;
    IB._loadPending=true;
  }
  function beginPlay(){
    show('loading',false);show('hud',true);show('title',false);
    mode='game';
    IB.Input.clear();
  }
  MAIN.showEnd=function(){
    mode='end';
    const G=IB.G,p=IB.PL;
    const disc=Math.round(Object.keys(G.visited).filter(k=>G.visited[k]).length/IB.ZONES.length*100);
    const st=G.stats||{att:0,saved:0};
    $('end-stats').innerHTML=
      '<b>ДНІВ ПРОЖИТО:</b> '+G.day+'<br>'+
      '<b>ЗАРАЖЕНИХ ЗНИЩЕНО:</b> '+p.kills+'<br>'+
      '<b>ПОВІТРЯНИХ АТАК ПЕРЕЖИТО:</b> '+st.att+'<br>'+
      '<b>ЛЮДЕЙ ВРЯТОВАНО НА ВВ13:</b> '+st.saved+'<br>'+
      '<b>МІСТО ДОСЛІДЖЕНО:</b> '+disc+'%<br>'+
      '<b>СМЕРТЕЙ:</b> '+G.deaths+'<br>'+
      (IB.MAIL?'<b>ЛИСТИ «НЕДОСТАВЛЕНІ»:</b> '+IB.MAIL.progress().read+'/'+IB.MAIL.TOTAL+(IB.G.flags.mailFin?' • В ЕФІРІ НА 103.1':'')+'<br>':'')+
      '<b>СИГНАЛ:</b> ПЕРЕДАНО З ПАГОРБА БАТЬКІВЩИНИ-МАТИ';
    show('hud',false);show('end',true);
    IB.AUDIO.sfx('mission');
  };
  function pauseMenu(){
    mode='pause';show('pause',true);
    setMenu([{t:'ПРОДОВЖИТИ',f:()=>{show('pause',false);mode='game';}},
      {t:'ЗБЕРЕГТИ ГРУ',f:()=>{IB.SYS.save();IB.banner('ГРУ ЗБЕРЕЖЕНО');}},
      {t:'КЕРУВАННЯ',f:()=>{mode='controls';show('controls',true);}},
      {t:'ГОЛОВНЕ МЕНЮ',f:()=>{IB.SYS.save();show('pause',false);titleMenu();}}],'pause');
  }
  function invMenu(){
    mode='inv';
    renderInv();
    show('inv',true);
  }
  MAIN.openInv=invMenu;   /* верстак бази ВВ13 відкриває рюкзак+крафт */
  /* БАТЧ 17: велика карта з інтер'єру (стіл-план міста на базі ВВ13) */
  MAIN.openMap=function(){
    if(mode!=='game'||IB.layer!=='interior')return;
    mode='map';show('bigmap',true);
    const mt=$('map-title');
    let vz=0;for(const k in IB.G.visited)if(IB.G.visited[k])vz++;
    if(mt)mt.innerHTML='ПЛАН МІСТА З БАЗИ ВВ13 — <span id="map-disc">'+IB.M.round(vz/IB.ZONES.length*100)+'%</span> ДОСЛІДЖЕНО • КЛІК = ТОЧКА МАРШРУТУ';
    buildMapPanel();
    IB.AUDIO.sfx('ui');
  };
  function renderInv(){
    const p=IB.PL,G=IB.G;
    const list=$('inv-list');list.innerHTML='';
    const ids=Object.keys(p.inv);
    if(!ids.length)list.innerHTML='<div class="inv-row"><span class="nm">РЮКЗАК ПОРОЖНІЙ</span></div>';
    ids.forEach(id=>{
      const it=IB.SPR.itemsDB[id]||{n:id,d:''};
      const row=document.createElement('div');
      row.className='inv-row usable';
      row.innerHTML='<span class="q">×'+p.inv[id]+'</span><span class="nm">'+it.n+'</span><span class="ds">'+it.d+'</span>';
      row.onclick=()=>{IB.SYS.useItem(id);renderInv();};
      list.appendChild(row);
    });
    const cl=$('craft-list');cl.innerHTML='';
    IB.RECIPES.forEach(r=>{
      const baseOk=!r.base||G.atBase;
      const can=baseOk&&Object.keys(r.req).every(k=>(p.inv[k]||0)>=r.req[k]);
      const req=Object.keys(r.req).map(k=>((IB.SPR.itemsDB[k]||{}).n||k)+'×'+r.req[k]).join(' + ');
      const tag=r.base?' [ВЕРСТАК ВВ13]':'';
      const row=document.createElement('div');
      row.className='inv-row'+(can?' usable':' cant');
      row.innerHTML='<span class="q">→</span><span class="nm">'+r.n+tag+'</span><span class="ds">'+req+'</span><span class="'+(can?'ok':'no')+'">'+(can?'КРАФТ':(baseOk?'МАЛО':'ВВ13'))+'</span>';
      if(can)row.onclick=()=>{IB.SYS.craft(r.id);renderInv();};
      cl.appendChild(row);
    });
  }

  /* ---------- дії гравця ----------
     2 КНОПКИ: SPACE — МЕЧ (розмах по дузі: відкидає і оглушує, 2 удари вбивають),
     X — ВИНТОВКА (стріляє). Відбивайся: удар у момент замаху зараженого = ПАРУВАННЯ.
     G — граната, H — аптечка. */
  function doSword(){
    const p=IB.PL;
    if(p.atkCd>0)return;
    p.atkCd=0.42;MAIN.attackAnim=0.22;IB.AUDIO.sfx('melee');
    IB.NOISE.push({x:p.x,y:p.y,r:2.5,t:'melee'});
    /* випад вперед — тиск у бій */
    IB.moveEnt(p,p.fx*0.22,p.fy*0.22,0.26,true);
    let hits=0;
    for(const z of IB.ENTS.zombies.slice()){
      const d=IB.dist(p.x,p.y,z.x,z.y);
      if(d<1.5){
        const dot=((z.x-p.x)*p.fx+(z.y-p.y)*p.fy)/Math.max(0.01,d);
        if(dot>0.22){IB.hurtZombie(z,p.sword2?62:44,p.fx,p.fy,2);hits++;IB.AUDIO.sfx('hit');}   /* МЕЧ «ЛЕГЕНДА» — нагорода квесту «НЕДОСТАВЛЕНІ» */
      }
    }
    if(hits>=3)IB.toast('ОДНИМ РОЗМАХОМ — '+hits+'!','gold');
  }
  /* ВИНТОВКА (X): довга дистанція, сильна куля — патрони 5.45; крафт — на верстаку ВВ13 */
  function doRifle(){
    const p=IB.PL;
    if(p.shootCd>0)return;
    if((p.inv.ammo||0)<=0){IB.AUDIO.sfx('dry');IB.toast('НЕМА ПАТРОНІВ — ЗБИРАЙ ЗАПЧАСТИНИ, КРАФТ НА БАЗІ ВВ13','red');return;}
    IB.takeItem('ammo',1);
    p.shootCd=0.34;MAIN.shootAnim=0.18;MAIN.muzzleT=0.09;
    IB.cam.shake=Math.max(IB.cam.shake,0.12);
    IB.fireBullet(p.x,p.y,p.fx,p.fy,64,{spd:22,ttl:0.85});
    if((p.inv.ammo||0)<=4&&p.lowAmmoT<=0){p.lowAmmoT=12;IB.toast('ПАТРОНИ ЗАКІНЧУЮТЬСЯ ('+p.inv.ammo+') — ЗБИРАЙ ДЕТАЛІ','red');}
  }

  /* ---------- головний цикл ---------- */
  function updateGame(dt){
    const p=IB.PL,G=IB.G;
    IB.SYS.update(dt);
    IB.updateEnts(dt);
    IB.cam.shake=Math.max(0,IB.cam.shake-dt*2);
    MAIN.attackAnim=Math.max(0,MAIN.attackAnim-dt);
    MAIN.shootAnim=Math.max(0,MAIN.shootAnim-dt);
    MAIN.muzzleT=Math.max(0,MAIN.muzzleT-dt);
    /* вхід */
    if(IB.Input.consume('tab')){
      if(IB.layer==='interior'&&!(IB.INT&&IB.INT.base)){IB.toast('КАРТА НЕДАВНА ВСЕРЕДИНІ • E НА ДВЕРЯХ — ВИЙТИ','red');return;}
      if(mode==='game'){mode='map';show('bigmap',true);
        const mt=$('map-title');
        let vz=0;for(const k in IB.G.visited)if(IB.G.visited[k])vz++;
        if(mt)mt.innerHTML=IB.layer==='metro'?'МЕТРО • СХЕМА ТУНЕЛІВ • 2-ГА МАПА МІСТА':'КАРТА КИЄВА — <span id="map-disc">'+IB.M.round(vz/IB.ZONES.length*100)+'%</span> ДОСЛІДЖЕНО • КЛІК = ТОЧКА МАРШРУТУ';
        buildMapPanel();
        IB.AUDIO.sfx('ui');}
      else if(mode==='map'){mode='game';show('bigmap',false);}
      return;
    }
    if(mode==='map'&&IB.Input.consume('esc')){mode='game';show('bigmap',false);return;}
    if((mode==='game'||mode==='map')&&IB.Input.consume('p')){
      IB.G.mmMode=IB.G.mmMode==='plan'?'local':'plan';
      IB.toast(IB.G.mmMode==='plan'?'МІНІКАРТА: ПЛАН УСЬОГО МІСТА (GPS УВІМК.)':'МІНІКАРТА: ЛОКАЛЬНА ЗОНА');
      IB.AUDIO.sfx('ui');
      if(mode==='map')return;
    }
    if(mode!=='game')return;
    /* СХОВАНО в будинку: тільки E (вийти) працює; бій/гранати блоковано */
    if(IB.HIDE){
      if(IB.Input.consume('e')){IB.SYS.unhide();return;}
      IB.Input.consume('space');IB.Input.consume('x');IB.Input.consume('g');IB.Input.consume('h');
      return;
    }
    if(IB.Input.consume('esc')){pauseMenu();return;}
    if(IB.Input.consume('m')||IB.Input.consume('i')){invMenu();return;}
    if(IB.Input.consume('f')){
      p.flash=!p.flash;
      if(p.flash&&p.batt<=0){p.flash=false;IB.toast('БАТАРЕЙКА СКАСУВАЛАСЬ — ЗНАЙДИ БАТАРЕЙКИ','red');}
      else IB.toast(p.flash?'ЛІХТАР УВІМКНЕНО':'ЛІХТАР ВИМКНЕНО');
    }
    if(IB.Input.consume('q')){IB.AUDIO.sfx('ui');}
    if(IB.Input.consume('space')&&!p.car){doSword();}
    if(IB.Input.consume('x')&&!p.car){doRifle();}
    if(IB.Input.consume('h')){IB.SYS.useItem('medkit');}
    if(p.car&&IB.Input.consume('space')){IB.AUDIO.sfx('crash');IB.NOISE.push({x:p.car.x,y:p.car.y,r:14,t:'horn'});IB.toast('БІП-БІП! ШУМ ПРИТЯГУЄ ЗАРАЖЕНИХ','red');}
    if(IB.Input.consume('e')){
      if(p.car){IB.exitCar();}
      else{
        const list=IB.SYS.interactables();
        if(list.length)list[0].act();
      }
    }
    if(IB.Input.consume('g')&&(p.inv.grenade||0)>0){IB.takeItem('grenade',1);IB.throwObj('grenade');}
  }
  function updateDialog(dt){
    const n=dlg.opts.length;
    if(IB.Input.consume('down')){dlg.idx=(dlg.idx+1)%Math.max(1,n);renderDialog();IB.AUDIO.sfx('ui');}
    if(IB.Input.consume('up')){dlg.idx=(dlg.idx-1+n)%Math.max(1,n);renderDialog();IB.AUDIO.sfx('ui');}
    if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
      const o=dlg.opts[dlg.idx];
      closeDialog();if(o&&o.f)o.f();
    }
    if(IB.Input.consume('esc'))closeDialog();
  }
  function updateMenus(){
    if(IB.Input.consume('down'))menuMove(1);
    if(IB.Input.consume('up'))menuMove(-1);
    if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space'))menuSel();
    if(IB.Input.consume('esc')||IB.Input.consume('tab')){
      if(mode==='controls'||mode==='about'){show('controls',false);show('about',false);titleMenu();}
      else if(mode==='pause'){show('pause',false);mode='game';}
    }
  }
  function updateInv(){
    if(IB.Input.consume('esc')||IB.Input.consume('m')||IB.Input.consume('i')){show('inv',false);mode='game';}
    if(IB.Input.consume('down')){invSel++;renderInv();}
  }

  function frame(ts){
    requestAnimationFrame(frame);
    document.body.classList.toggle('playing', mode==='game'||mode==='map'||mode==='dialog'||mode==='inv'||mode==='dead'||mode==='end');
    const dt=Math.min(0.05,(ts-last)/1000||0.016);last=ts;
    uiTick++;
    IB.G.mode=mode;
    /* --- режимний стан --- */
    if(mode==='boot'){
      bootT+=dt;
      if(bootT>3.4){show('boot',false);titleMenu();}
    } else if(mode==='title'){titleT+=dt;}
    else if(mode==='loading'){
      loadT+=dt;
      const total=SECTORS.length;
      const sec=Math.min(total-1,Math.floor(loadT/0.22));
      setLoading((IB._loadPending?'ВІДНОВЛЕННЯ • ':'СЕКТОР ')+sec+' — '+SECTORS[sec],TIPS[sec%TIPS.length]);
      $('load-bar').firstElementChild.style.width=Math.min(100,loadT/0.22/total*100)+'%';
      if(loadT>0.24*total){
        if(!IB.WORLD){IB.buildWorld();IB.buildMetro();IB.CWORLD=IB.WORLD;}   /* місто + ПІДЗЕМКА (батч 10) */
        if(IB._loadPending){IB._loadPending=false;if(!IB.SYS.load()){IB.SYS.newGame();}}
        else if(!IB._gameInited){IB.SYS.newGame();}
        IB._gameInited=true;
        beginPlay();
      }
    }
    else if(mode==='game'||mode==='map'){updateGame(dt);}
    else if(mode==='dialog'){updateDialog(dt);}
    else if(mode==='pause'||mode==='title'||mode==='controls'||mode==='about'){updateMenus();}
    else if(mode==='inv'){updateInv();}
    else if(mode==='dead'){
      if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
        show('dead',false);show('hud',true);mode='game';
        IB.SYS.respawn();
      }
    }
    else if(mode==='end'){
      if(IB.Input.consume('enter')||IB.Input.consume('e')||IB.Input.consume('space')){
        show('end',false);show('hud',true);mode='game';
        IB.G.mi=IB.MISSIONS.length;IB.G.ending=false;
        IB.banner('ВІЛЬНЕ ВИЖИВАННЯ • КИЇВ ТВІЙ');
      }
    }
    /* --- рендер --- */
    if(mode==='boot'){
      /* анімація загрузки */
    } else {
      if(IB.PL){
        if(mode==='game'||mode==='map'||mode==='dialog'||mode==='inv'||mode==='dead'||mode==='end'){
          const p=IB.PL;
          const tx=p.car?p.car.x:p.x, ty=p.car?p.car.y:p.y;
          IB.cam.x+=(tx-IB.cam.x)*Math.min(1,dt*6);
          IB.cam.y+=(ty-IB.cam.y)*Math.min(1,dt*6);
          g.fillStyle='#0a0c12';g.fillRect(0,0,IB.CAMW,IB.CAMH);
          IB.GFX.drawGround(g);
          IB.GFX.drawScene(g);
          if(IB.HIDE){   /* вигляд з-за шторки: темна кімната + текст */
            g.fillStyle='rgba(4,6,12,0.72)';g.fillRect(0,0,IB.CAMW,IB.CAMH);
            g.textAlign='center';g.font='bold 12px monospace';
            g.fillStyle='#f0d050';g.fillText('ТИ В БУДИНКУ — СХОВАНО',IB.CAMW/2,IB.CAMH/2-8);
            g.font='8px monospace';g.fillStyle='#9aa0ae';
            g.fillText('ЗОМБІ ВТРАТИЛИ СЛІД • ВІДПОЧИВАЄШ • E — ВИЙТИ НАЗОВНІ',IB.CAMW/2,IB.CAMH/2+12);
            if(IB.HIDE.t>6){g.fillStyle='#4ee06a';g.fillText('ВОНИ РОЗІЙШЛИСЯ',IB.CAMW/2,IB.CAMH/2+28);}
          }
          IB.GFX.drawMinimapHUD(hud.mm.getContext('2d'));
          IB.GFX.drawCompass(hud.cp.getContext('2d'));
          if(mode==='map'){IB.GFX.drawBigMap($('mapc').getContext('2d'));
            const md=$('map-disc');
            if(md){const disc=Math.round(Object.keys(IB.G.visited).filter(k=>IB.G.visited[k]).length/IB.ZONES.length*100);
              md.textContent=disc+'%';}}
          syncHUD();
        }
      }
    }
    /* fade */
    if(fadeT>0){
      fadeT-=dt;
      g.fillStyle='rgba(0,0,0,'+IB.clamp(fadeT/0.3,0,1)+')';g.fillRect(0,0,IB.CAMW,IB.CAMH);
      if(fadeCb&&fadeT<=0.15){const cb=fadeCb;fadeCb=null;cb();}
    }
    /* dead screen */
    if(IB.PL&&!IB.PL.alive&&mode==='game'){
      mode='dead';show('dead',true);
      $('dead-txt').textContent='Ти загинув на вулицях Києва. Але місто ще чекає. Схованка зберігає твої речі — повернись.';
      IB.AUDIO.sfx('zdie');
    }
  }
  const TIPS=['НЕ БІГЛИ ВНОЧІ — ШУМ ПРИТЯГУЄ ОРДУ','СИРЕНА? СХОВАЙСЯ — ШАХЕДИ Б’ЮТЬ ПО РАЙОНУ','ВЕДИ ВЦІЛІЛИХ НА БАЗУ ВВ13 — ВОНИ КРИЧАТЬ «HELP»','ПАТРОНИ КРАФТИ З ЗАПЧАСТИН НА ВЕРСТАКУ ВВ13','МЕТРО: СПУСТИВСЯ НА ОБЛОНОЙ — ВИЙШОВ НА ПЕЧЕРСЬКУ • АТАК У ТУНЕНЯХ НЕМАЄ','СХОВАВСЯ В БУДИНКУ (E НА ДВЕРЯХ) — ЗОМБІ РОЗХОДЯТЬСЯ','АВТО — ШВИДКІСТЬ, АЛЕ І ШУМ','РУБАЙ У МОМЕНТ УДАРУ — ВІДБИЄШ БЕЗ ШКОДИ','ДНІПРО НЕПРОХОДИЙ — ЙДИ МОСТАМИ','ПАГОРБИ ПЕЧЕРСЬКА — НАЙКРАЩИЙ ОГЛЯД','У ПІДЗЕМКЕ ТЕМНО — ЛІХТАР (F) І БАТАРЕЙКИ З ПОЛИЦЬ'];

  MAIN.fadeTo=function(cb){fadeT=0.6;fadeCb=cb;};
  MAIN.backToTitle=function(){show('controls',false);show('about',false);titleMenu();};

  /* ---------- boot + init ---------- */
  function bootAnim(){
    const boot=$('boot');
    const lines=[
      ['IBONARIUM BIOS v2.7','dim'],
      ['16-BIT HOME SYSTEM — MODEL IK-1601','dim'],
      [''],
      ['ПЕРЕВІРКА ПАМ’ЯТІ........ 64K OK',''],
      ['ВІДЕОПРОЦЕСОР........... OK',''],
      ['ЗВУКОВИЙ ЧІП............ OK',''],
      ['ЗАВАНТАЖЕННЯ КАРТРИДЖА: KYIV — THE LAST SIGNAL','gold'],
      [''],
      ['КИЇВ ЧЕКАЄ. НАТИСНІТЬ ЩО-НЕБУДЬ…','blink'],
    ];
    let i=0;
    const tm=setInterval(()=>{
      if(i>=lines.length||mode!=='boot'){clearInterval(tm);return;}
      const d=document.createElement('div');
      d.className='bline'+(lines[i][1]?' '+lines[i][1]:'');
      d.textContent=lines[i][0]||'\u00A0';
      boot.appendChild(d);
      i++;
      IB.AUDIO.sfx('ui');
    },260);
  }
  function bindShell(){
    $('btn-power').onclick=()=>{location.reload();};
    $('btn-reset').onclick=()=>{location.reload();};
    $('btn-scan').onclick=()=>{const s=$('scanlines');s.classList.toggle('hidden');$('btn-scan').classList.toggle('active',!s.classList.contains('hidden'));};
    $('btn-fs').onclick=()=>toggleFullscreen();
    const fsBtn=$('btn-fs-crt');
    if(fsBtn)fsBtn.onclick=()=>toggleFullscreen();
    if($('crt')){$('crt').addEventListener('dblclick',()=>toggleFullscreen());}
    $('vol').oninput=e=>IB.AUDIO.setVol(e.target.value/100);
    const skip=()=>{if(mode==='boot'){bootT=99;}};
    window.addEventListener('keydown',skip);
    $('crt').addEventListener('mousedown',skip);
    /* глобальна гаряча клавіша V — повний екран */
    window.addEventListener('keydown',ev=>{if(ev.code==='KeyV'){toggleFullscreen();}});
    /* у фейковому фулскріні ESC виходить */
    window.addEventListener('keydown',ev=>{if(ev.code==='Escape'&&document.body.classList.contains('fakefs'))document.body.classList.remove('fakefs');});
    /* ROM slot — EmulatorJS (на мобільних вбудований віртуальний геймпад) */
    const romInput=$('romfile');
    if(romInput)$('rom-start').onclick=()=>{
      const f=romInput.files&&romInput.files[0];
      if(!f){IB.toast('ВИБЕРІТЬ ФАЙЛ ROM ПЕРШ','red');return;}
      const wrap=$('ejs-wrap');
      wrap.classList.remove('hidden');
      $('crt').style.display='none';
      window.EJS_player='#ejs-game';
      window.EJS_core='segaMD';
      window.EJS_pathtodata='https://cdn.emulatorjs.org/stable/data/';
      window.EJS_gameUrl=URL.createObjectURL(f);
      window.EJS_gameName='IBONARIUM ROM';
      window.EJS_startOnLoaded=true;
      const s=document.createElement('script');
      s.src='https://cdn.emulatorjs.org/stable/data/loader.js';
      document.body.appendChild(s);
      IB.toast('EMUJS: ЗАВАНТАЖЕННЯ ЯДРА GENESIS PLUS GX…','gold');
    };
  }

  MAIN.init=function(){
    cv=$('game');g=cv.getContext('2d');
    g.imageSmoothingEnabled=false;
    hud.mm=$('minimap');hud.cp=$('compass');
    /* БАТЧ 12+13: клік — точка маршруту; ТЯГ — панорамування; КОЛЕСО/+− — зум */
    const mapc=$('mapc');
    if(mapc){
      let dragging=false,moved=false,lx=0,ly=0;
      mapc.addEventListener('pointerdown',ev=>{
        if(mode!=='map'||!IB.WORLD)return;
        dragging=true;moved=false;lx=ev.clientX;ly=ev.clientY;
        mapc.setPointerCapture&&mapc.setPointerCapture(ev.pointerId);
      });
      mapc.addEventListener('pointermove',ev=>{
        if(!dragging)return;
        const dx=ev.clientX-lx,dy=ev.clientY-ly;
        if(Math.abs(dx)+Math.abs(dy)>5)moved=true;
        if(moved){
          const r=mapc.getBoundingClientRect();
          IB.GFX.mapPan(dx*mapc.width/r.width,dy*mapc.height/r.height);
        }
        lx=ev.clientX;ly=ev.clientY;
      });
      const up=ev=>{
        if(!dragging)return;
        dragging=false;
        if(moved||mode!=='map'||!IB.WORLD)return;
        const r=mapc.getBoundingClientRect();
        const cx=(ev.clientX-r.left)*mapc.width/r.width,cy=(ev.clientY-r.top)*mapc.height/r.height;
        const v=IB.GFX.mapView();
        if(ev.shiftKey){MAIN.addPin((cx-v.mx)/v.s,(cy-v.my)/v.s);return;}   /* батч 15: позначка */
        MAIN.setWaypoint((cx-v.mx)/v.s,(cy-v.my)/v.s,null);
      };
      mapc.addEventListener('pointerup',up);
      mapc.addEventListener('pointercancel',()=>{dragging=false;});
      mapc.addEventListener('wheel',ev=>{
        if(mode!=='map')return;
        ev.preventDefault();
        IB.GFX.mapZoom(ev.deltaY<0?1:-1);
      },{passive:false});
    }
    /* кнопки зуму на карті */
    const zin=$('map-zin'),zout=$('map-zout'),zfit=$('map-zfit');
    if(zin)zin.onclick=()=>{IB.GFX.mapZoom(1);IB.AUDIO.sfx('ui');};
    if(zout)zout.onclick=()=>{IB.GFX.mapZoom(-1);IB.AUDIO.sfx('ui');};
    if(zfit)zfit.onclick=()=>{IB.GFX.mapZoom(0);IB.AUDIO.sfx('ui');};
    /* портрет Марка */
    const fc=$('face');
    if(fc){const fg=fc.getContext('2d');fg.imageSmoothingEnabled=false;fg.drawImage(IB.SPR.face,0,0);}
    IB.Input.bindTouch();
    if(/[?&]touch=1/.test(location.search))document.body.classList.add('touchtest');
    bindShell();
    bootAnim();
    /* розмір екрана */
    function fit(){
      const crt=$('crt');
      cv.style.width='100%';
      cv.style.aspectRatio='10/7';
    }
    fit();
    last=performance.now();
    requestAnimationFrame(frame);
    /* Kenney City Kit assets (CC0) — м’який фолбек на процедурні спрайти */
    if(IB.ASSETS&&IB.ASSETS.load){
      IB.ASSETS.load().then(()=>{
        try{
          const r=IB.KENNEY.apply();
          if(r.bldOk>0)IB.toast('МІСЬКІ АССЕТИ ПІДКЛЮЧЕНО','gold');
        }catch(e){/* процедурний стиль лишається */}
      }).catch(()=>{});
    }
  };
  return MAIN;
})();

window.addEventListener('DOMContentLoaded',()=>{IB.MAIN.init();});
