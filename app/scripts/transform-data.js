const fs = require('fs');
const path = require('path');

function parsePrice(priceStr, fallback) {
  if (!priceStr && fallback != null) return fallback;
  if (typeof priceStr === 'number') return priceStr;
  const m = (priceStr || '').toString().replace(/[^0-9.]/g, '');
  return m ? Math.round(Number(m)) : (fallback != null ? fallback : null);
}

function parseMileageFromBadges(badges){
  if(!Array.isArray(badges)) return null;
  for(const b of badges){
    if(!b) continue;
    // badge may be an object with type/displayText or a simple string
    if(typeof b === 'string'){
      const m = b.replace(/[^0-9]/g,'');
      if(m) return parseInt(m,10);
      continue;
    }
    if(!b.type && !b.displayText && !b.name) continue;
    const text = b.displayText || b.name || '';
    if(b.type === 'MILEAGE' && text){
      const m = text.replace(/[^0-9]/g,'');
      return m ? parseInt(m,10) : null;
    }
    // fallback: try to extract mileage from any display text
    const m2 = text.replace(/[^0-9]/g,'');
    if(m2 && m2.length >= 3) return parseInt(m2,10);
  }
  return null;
}

function parseYearFromBadges(badges){
  if(!Array.isArray(badges)) return null;
  for(const b of badges){
    if(!b || !b.type) continue;
    if(b.type === 'REGISTERED_YEAR' && b.displayText){
      const m = b.displayText.match(/(19|20)\d{2}/);
      if(m) return parseInt(m[0],10);
    }
  }
  return null;
}

function parseDoorsFromSubtitle(sub){
  if(!sub) return null;
  const m = sub.match(/(\d)dr/i);
  if(m) return parseInt(m[1],10);
  return null;
}

function normalizeImage(url){
  if(!url) return url;
  // Ensure images use the {resize} token so callers can request sizes as needed
  if(url.indexOf('{resize}') !== -1) return url;
  // Replace the size segment after /media/ (e.g. /media/1200x/) with {resize}
  return url.replace(/(\/media\/)[^/]+\//, '$1{resize}/');
}

function deriveFeatures(subTitle, badges){
  const features = [];
  if(subTitle){
    // split by commas / parentheses / spaces but keep chunks like "1.6"
    const parts = subTitle.split(/[,()]+/).map(s=>s.trim()).filter(Boolean);
    for(const p of parts){
      if(p.length && !features.includes(p)) features.push(p);
    }
  }
  if(Array.isArray(badges)){
    for(const b of badges){
      if(b && b.displayText && !features.includes(b.displayText)) features.push(b.displayText);
    }
  }
  return features.slice(0,8);
}

function detectFuelAndTrans(texts){
  // texts: array of strings to search
  const joined = (Array.isArray(texts) ? texts.join(' | ') : (texts||'')).toLowerCase();
  const fuel = (function(){
    if(/diesel|tdi|dci|tci/.test(joined)) return 'Diesel';
    if(/petrol|gasoline|petrol\b/.test(joined)) return 'Petrol';
    if(/electric|ev|battery|tesla/.test(joined)) return 'Electric';
    if(/hybrid|phev|plug-in hybrid|plug in hybrid/.test(joined)) return 'Hybrid';
    return '';
  })();
  const trans = (function(){
    if(/automatic|auto|g-tronic|dsg|cv(t)?\b|multitronic/.test(joined)) return 'Automatic';
    if(/manual|manual\b|mt\b/.test(joined)) return 'Manual';
    return '';
  })();
  return { fuel, trans };
}

function mapEntry(item){
  const advert = item || {};
  // Prefer the newer consolidated payload shape but fall back to older fields
  const payload = advert.payload || advert;
  const advCtx = (payload.advertTrackingData && payload.advertTrackingData.advertContext) || (advert.trackingContext && advert.trackingContext.advertContext) || {};
  const vehicleCtx = (payload.advertTrackingData && payload.advertTrackingData.vehicleContext) || {};

  // price: prefer heading.priceBreakdown.price.price, then advert.price, then advCtx.price
  const headingPrice = payload.heading && payload.heading.priceBreakdown && payload.heading.priceBreakdown.price && payload.heading.priceBreakdown.price.price;
  const priceNumeric = parsePrice(headingPrice || advert.price || advCtx.price, advCtx.price);

  // badges could be in payload.heading.headingPills, payload.badges or advert.badges
  const badges = (payload.heading && (payload.heading.headingPills || payload.heading.badges)) || payload.badges || advert.badges || [];

  // mileage/year/doors: try advertContext, keySpecification arrays, or badges/subTitle
  const mileage = advCtx.mileage || parseMileageFromBadges(badges) || null;
  const year = advCtx.year || parseYearFromBadges(badges) || null;

  // doors might be in vehicleCtx, key specs, or subtitle
  let doors = null;
  if(vehicleCtx && vehicleCtx.numberOfDoors) doors = parseInt(vehicleCtx.numberOfDoors,10);
  if(!doors && payload.keySpecification && Array.isArray(payload.keySpecification)){
    const d = payload.keySpecification.find(k=>/door/i.test(k.name||k.key||k.label||'') || /door/i.test(k.displayName||''));
    if(d && d.value) doors = parseInt((d.value||'').toString().replace(/[^0-9]/g,''),10);
  }
  if(!doors) doors = parseDoorsFromSubtitle(payload.heading && payload.heading.subtitle || advert.subTitle) || null;

  // owners: try keySpecification array or advert/vehicle context
  let owners = null;
  if(payload.keySpecification && Array.isArray(payload.keySpecification)){
    const o = payload.keySpecification.find(k=>/owner/i.test((k.label||k.key||k.name||'').toString()));
    if(o && o.value) owners = (o.value||'').toString().trim();
  }
  if(!owners && advCtx && advCtx.owners) owners = advCtx.owners;
  if(!owners && vehicleCtx && vehicleCtx.owners) owners = vehicleCtx.owners;

  // body type: prefer vehicle context, then keySpecification
  let bodyType = vehicleCtx.bodyType || advCtx.bodyType || null;
  if(!bodyType && payload.keySpecification && Array.isArray(payload.keySpecification)){
    const b = payload.keySpecification.find(k=>/body/i.test((k.label||k.key||k.name||'').toString()));
    if(b && b.value) bodyType = (b.value||'').toString().trim();
  }

  // engine capacity / size in litres: try vehicleCtx.standardEngineSizeLitres or keySpecification
  let engineCapacity = null;
  if(vehicleCtx && vehicleCtx.standardEngineSizeLitres) engineCapacity = vehicleCtx.standardEngineSizeLitres;
  if(!engineCapacity && advCtx && advCtx.standardEngineSizeLitres) engineCapacity = advCtx.standardEngineSizeLitres;
  if(!engineCapacity && payload.keySpecification && Array.isArray(payload.keySpecification)){
    const e = payload.keySpecification.find(k=>/engine/i.test((k.label||k.key||k.name||'').toString()));
    if(e && e.value) engineCapacity = (e.value||'').toString().trim();
  }

  // Normalize owners to integer when possible
  if(owners && typeof owners === 'string'){
    const on = owners.replace(/[^0-9]/g,'');
    if(on) owners = parseInt(on,10);
  }
  if(owners && typeof owners === 'number' && Number.isNaN(owners)) owners = null;

  // Normalize bodyType to title case (e.g., 'hatchback' -> 'Hatchback')
  function toTitleCase(str){ if(!str) return str; return str.toString().toLowerCase().split(/\s+/).map(s=>s.charAt(0).toUpperCase()+s.slice(1)).join(' '); }
  if(bodyType) bodyType = toTitleCase(bodyType);

  // Normalize engine capacity into litres numeric and a canonical string
  let engineCapacityLitres = null;
  if(engineCapacity != null){
    // if it's numeric already
    if(typeof engineCapacity === 'number') engineCapacityLitres = engineCapacity;
    else {
      const s = (engineCapacity||'').toString();
      // look for cc (e.g. 1596cc) or litres (e.g. 1.6L)
      const mCc = s.match(/([0-9]{3,5})\s*cc/i);
      const mL = s.match(/([0-9]+(?:\.[0-9]+)?)\s*l/i);
      const mNum = s.match(/([0-9]+(?:\.[0-9]+)?)/);
      if(mL) engineCapacityLitres = parseFloat(mL[1]);
      else if(mCc) engineCapacityLitres = Math.round(parseInt(mCc[1],10)/10)/100; // 1596 -> 1.6
      else if(mNum){
        const n = parseFloat(mNum[1]);
        // if number looks like cc (>=1000) convert to litres
        if(n >= 1000) engineCapacityLitres = Math.round((n/1000)*10)/10;
        else engineCapacityLitres = Math.round(n*10)/10;
      }
    }
  }
  // canonical engineCapacity string (e.g. '1.6L')
  let engineCapacityNorm = null;
  if(engineCapacityLitres != null && !Number.isNaN(engineCapacityLitres)) engineCapacityNorm = (Math.round(engineCapacityLitres*10)/10) + 'L';
  else if(engineCapacity) engineCapacityNorm = engineCapacity.toString();

  // images: prefer payload.gallery.images[].url, then advert.images
  let images = [];
  if(payload.gallery && Array.isArray(payload.gallery.images)){
    images = payload.gallery.images.map(i => (i && (i.url || i.file || i.path)) || i).filter(Boolean).map(normalizeImage);
  } else if(Array.isArray(advert.images)){
    images = advert.images.map(normalizeImage);
  }

  // description: join payload.description.text (array) or use advert.description
  let description = null;
  if(payload.description){
    if(Array.isArray(payload.description.text)) description = payload.description.text.join(' ');
    else if(typeof payload.description.text === 'string') description = payload.description.text;
  }
  if(!description) description = advert.description || advert.attentionGrabber || null;

  // make/model/title
  const make = advCtx.make || (payload.advertTrackingData && payload.advertTrackingData.advertContext && payload.advertTrackingData.advertContext.make) || null;
  const model = advCtx.model || (payload.advertTrackingData && payload.advertTrackingData.advertContext && payload.advertTrackingData.advertContext.model) || null;
  const title = (payload.heading && payload.heading.title) || advert.title || null;
  const finalMake = make || (title ? title.split(' ')[0] : null) || null;
  const finalModel = model || (title ? title.split(' ').slice(1).join(' ') : null) || null;

  // color, fuel, transmission
  const color = vehicleCtx.colour || advCtx.colour || null;
  let fuel = vehicleCtx.fuelType || advCtx.fuel || '';
  let trans = vehicleCtx.transmission || advCtx.transmission || '';
  // if missing, attempt heuristic detection
  if(!fuel || !trans){
    try{
      const searchTexts = [payload.heading && payload.heading.subtitle || advert.subTitle || '', title || '', (badges||[]).map(b=> (b.displayText||b.name||b||'')).join(' | ')];
      const detected = detectFuelAndTrans(searchTexts);
      if(!fuel && detected.fuel) fuel = detected.fuel;
      if(!trans && detected.trans) trans = detected.trans;
    }catch(e){ }
  }
  // features: prefer payload.featuresWithDisclaimer.features -> fallback to derived features
  let featuresList = [];
  if(payload && payload.featuresWithDisclaimer && Array.isArray(payload.featuresWithDisclaimer.features) && payload.featuresWithDisclaimer.features.length){
    featuresList = payload.featuresWithDisclaimer.features.map(f=>{
      if(!f) return null;
      if(typeof f === 'string') return f;
      return f.feature || f.label || f.text || f.name || f.title || null;
    }).filter(Boolean);
  } else {
    featuresList = deriveFeatures(payload.heading && payload.heading.subtitle || advert.subTitle, badges);
  }

  const mapped = {
    reg: advert.registration || advert.advertId || (payload && payload.id) || null,
    source_page: advert.source_page || null,
    make: finalMake,
    model: finalModel,
    year: year,
    price: priceNumeric,
    mileage: mileage,
    trans: trans || '',
    fuel: fuel || '',
    image: images.length ? images[0] : null,
    images: images,
    description: description,
    features: featuresList,
    // include subtitle from payload.keyInformation when present (falls back to heading.subtitle / advert.subTitle)
    subTitle: (payload && payload.keyInformation && payload.keyInformation.subTitle) || (payload.heading && payload.heading.subtitle) || advert.subTitle || null,
    // include structured specs and finance objects from payload (may be null)
    specs: payload && payload.specs ? payload.specs : null,
    finance: payload && payload.finance ? payload.finance : null,
    color: color,
    doors: doors,
    owners: owners,
    bodyType: bodyType,
    engineCapacity: engineCapacityNorm || engineCapacity,
    engineCapacityLitres: engineCapacityLitres,
    contact: payload.contactDetails || payload.seller || advert.contact || null,
    // keep only a tiny reference to the original source to avoid large payloads in inventory
    meta: {
      originalId: advert.advertId || (payload && payload.id) || null
    }
  };
  return mapped;
}

(function main(){
  const dataPath = path.join(__dirname, '..', 'data', 'data.json');
  const outPath = path.join(__dirname, '..', 'data', 'inventory.json');
  console.log('Reading', dataPath);
  const raw = fs.readFileSync(dataPath, 'utf8');
  const arr = JSON.parse(raw);
  const mapped = arr.map(mapEntry);
  fs.writeFileSync(outPath, JSON.stringify(mapped, null, 2), 'utf8');
  console.log('Wrote', outPath, 'with', mapped.length, 'items');
})();
