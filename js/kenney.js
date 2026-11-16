/* IBONARIUM KYIV — kenney.js: застосовує рендери Kenney City Kits (CC0) до спрайтів рушія.
   Викликається після завантаження ассетів; при помилках лишається процедурний фолбек. */
IB.KENNEY = (function(){
  function img2cv(im){
    if(!im || !im.width) return null;
    const c = IB.mk(im.width, im.height);
    c.g.drawImage(im, 0, 0);
    return c;
  }
  function apply(){
    const I = IB.ASSETS.IMG, S = IB.SPR;
    /* ---------- дороги (16 масок + широка внутрішність) ---------- */
    let roadOk = 0;
    for(let m = 0; m < 16; m++){
      const im = I['road_' + m];
      if(im && im.width === 32){ S.road[m] = img2cv(im); roadOk++; }
    }
    if(I['road_wide']) S.road[16] = img2cv(I['road_wide']);
    /* ---------- будівлі з варіантами: cats['khrus_0']… ---------- */
    let bldOk = 0;
    for(const cat in IB.ASSETS.POOLS){
      for(let i = 0; i < IB.ASSETS.POOLS[cat]; i++){
        const im = I['bld_' + cat + '_' + i];
        if(im && im.width){
          S.cats[cat + '_' + i] = im;
          if(i === 0) S.cats[cat] = im;   /* фолбек без варіанта */
          bldOk++;
        }
      }
    }
    /* ---------- пропси (якорі: низ-центр) ---------- */
    const propsMap = {
      tree_o: [32, 58], tree_o2: [32, 56], pine: [32, 58],
      dumpster: [32, 56], traff: [32, 56], lamp: [32, 56], lamp_b: [32, 56],
      barr: [32, 56], cone: [32, 56], chimney: [32, 56], tank: [32, 56],
      fence: [32, 56], bush: [32, 56], antenna: [32, 56],
    };
    let propOk = 0;
    for(const key in propsMap){
      const im = I['prop_' + key];
      if(im && im.width){
        S.props[key] = {c: im, ax: im.width / 2, ay: im.height};
        propOk++;
      }
    }
    /* ---- БАТЧ 15: пропси нових кітів (човни, фабрика, аркади, барикади, скелі) — якір низ-центр ---- */
    const NPROPS15 = ['boat_row','boat_row2','boat_fish','boat_speed','boat_tug','ship_cargo','buoy','container_r',
      'fmachine','fmachine2','fboiler','fpiston','fcog','frobot','fscreen','fconveyor',
      'fpipe_h','fpipe_valve','fpipe_bend','fpipe_glass','fbox','fdoor',
      'arcade1','arcade_pin','arcade_claw','arcade_dance','arcade_vend','arcade_gam','arcade_air','arcade_bb','arcade_wheel','arcade_cash',
      'barric_win','barric_win2','barric_door','bpipe','bcolumn',
      'pallet_r','planks_r','awning_r','barr_s','light_d','bench_r','mtn_rock','mtn_rock2','mtn_rock3'];
    for(const key of NPROPS15){
      const im = I['prop_' + key];
      if(im && im.width){
        S.props[key] = {c: im, ax: im.width / 2, ay: im.height};
        propOk++;
      }
    }
    /* ящики: 3 кольорові контейнери — випадковий на спрайт */
    const crates = ['crate', 'crate2', 'crate3'].map(k=>I['prop_' + k]).filter(Boolean);
    if(crates.length){
      S.props.crate = {c: crates[0], ax: crates[0].width / 2, ay: crates[0].height};
      S.cratePool = crates;
    }
    /* ---------- БАТЧ 13: авто з Kenney Car Kit — 4 напрямки + пошкоджені ---------- */
    let carOk = 0;
    for(const mid of ['vaz','vaz_a','vaz_b','lanos','lanos_a','lanos_b','skoda','skoda_a','skoda_b',
                      'taxi','suv','truck','police','ambulance','van','delivery','wreck1','wreck2']){
      const dirs = ['se','sw','nw','ne'];
      const set = {};
      let ok = 0;
      for(const d of dirs){
        const im = I['car_' + mid + '_' + d];
        if(im && im.width){ set[d] = img2cv(im); ok++; }
        const dm = I['car_' + mid + '_' + d + '_d'];
        if(dm && dm.width) set[d + '_d'] = img2cv(dm);
      }
      if(ok === 4){ S.cars[mid] = set; carOk++; }
    }
    S.carVariants = {vaz:['vaz','vaz_a','vaz_b'], lanos:['lanos','lanos_a','lanos_b'], skoda:['skoda','skoda_a','skoda_b']};
    if(S.cars.wreck1){
      S.props.wreck1 = {c: S.cars.wreck1.se, ax: S.cars.wreck1.se.width / 2, ay: S.CAR_ANCH || 46};
      if(S.cars.wreck2) S.props.wreck2 = {c: S.cars.wreck2.se, ax: S.cars.wreck2.se.width / 2, ay: S.CAR_ANCH || 46};
    }
    /* ---------- БАТЧ 13: вагони метро (train-kit subway) ---------- */
    let wagonOk = 0;
    for(const w of ['wagon_a','wagon_b','wagon_c','loco_a']){
      const im = I[w];
      if(im && im.width){ S.props[w] = {c: im, ax: im.width / 2, ay: im.height - 6}; wagonOk++; }
    }
    if(S.props.wagon_a){ S.props.wagon = S.props.wagon_a; }
    /* ---------- БАТЧ 13: меблі (furniture-kit) — якір низ-центр ---------- */
    let furnOk = 0;
    for(const key in I){
      if(key.indexOf('furn_') !== 0) continue;
      const im = I[key];
      if(im && im.width){
        S.props[key.slice(5)] = {c: im, ax: im.width / 2, ay: im.height - 2};
        furnOk++;
      }
    }
    return {roadOk, bldOk, propOk, carOk, wagonOk, furnOk};
  }
  return {apply};
})();
