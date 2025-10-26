
// elements
const locBtn = document.getElementById('locBtn');
const searchBtn = document.getElementById('searchBtn');
const queryEl = document.getElementById('query');
const soundBtn = document.getElementById('soundBtn');
const themeBtn = document.getElementById('themeBtn');
const unitBtn = document.getElementById('unitBtn');

const statusMsg = document.getElementById('statusMsg');
const locName = document.getElementById('locName');
const tempEl = document.getElementById('temp');
const metaEl = document.getElementById('meta');
const descEl = document.getElementById('desc');
const windEl = document.getElementById('wind');
const pressEl = document.getElementById('press');
const humEl = document.getElementById('hum');
const forecastEl = document.getElementById('forecast');
const iconWrap = document.getElementById('iconWrap');
const bg = document.getElementById('bg');

let unit = localStorage.getItem('weather_unit') || 'C';
unitBtn.textContent = unit === 'C' ? '°C' : '°F';
unitBtn.addEventListener('click', () => {
  unit = (unit === 'C') ? 'F' : 'C';
  localStorage.setItem('weather_unit', unit);
  unitBtn.textContent = unit === 'C' ? '°C' : '°F';
  if (lastWeather) renderWeather(lastWeather);
});

// TEMA
const savedTheme = localStorage.getItem('weather_theme') || 'dark';
if(savedTheme === 'light') document.body.classList.add('light');
themeBtn.addEventListener('click', ()=>{
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('weather_theme', isLight ? 'light' : 'dark');
});

// SES 
let audioCtx = null;
let noiseSource = null;
let noiseGain = null;
let rainPlaying = false;

function createNoiseBuffer(ctx, duration=2){
  const sampleRate = ctx.sampleRate;
  const length = duration * sampleRate;
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<length;i++){
    data[i] = (Math.random() * 2 - 1) * 0.4; // white noise
  }
  return buffer;
}

function startRainSound(){
  if(rainPlaying) return;
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  // ses loop
  noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(audioCtx, 2);
  noiseSource.loop = true;
  // yağmur seviye geçişi
  const hp = audioCtx.createBiquadFilter();
  hp.type = 'highpass'; hp.frequency.value = 400;
  const lp = audioCtx.createBiquadFilter();
  lp.type = 'lowpass'; lp.frequency.value = 6000;
  noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0.12;
  const lfo = audioCtx.createOscillator();
  lfo.type = 'sine'; lfo.frequency.value = 0.3;
  const lfoGain = audioCtx.createGain(); lfoGain.gain.value = 0.06;
  lfo.connect(lfoGain); lfoGain.connect(noiseGain.gain);
  noiseSource.connect(hp); hp.connect(lp); lp.connect(noiseGain); noiseGain.connect(audioCtx.destination);
  noiseSource.start();
  lfo.start();
  rainPlaying = true;
  soundBtn.textContent = 'Sound: On';
}

function stopRainSound(){
  if(!rainPlaying) return;
  try{
    noiseSource.stop();
    audioCtx.close();
  }catch(e){ console.warn(e); }
  audioCtx = null; noiseSource = null; noiseGain = null; rainPlaying = false;
  soundBtn.textContent = 'Sound: Off';
}

soundBtn.addEventListener('click', ()=>{
  if(!rainPlaying) startRainSound(); else stopRainSound();
});

const weatherCodes = {
  0: "Açık gökyüzü",1:"Çoğunlukla açık",2:"Kısmen bulutlu",3:"Bulutlu",
  45:"Sis",48:"Donmuş sis",51:"Hafif yağmur - çiseleme",53:"Orta yağmur - çiseleme",
  55:"Yoğun yağmur - çiseleme",56:"Hafif donan yağmur",57:"Yoğun donan yağmur",
  61:"Yağmur",63:"Daha yoğun yağmur",65:"Yoğun yağmur",66:"Hafif donan yağmur",
  67:"Yoğun donan yağmur",71:"Kar çiseleme",73:"Kar",75:"Yoğun kar",77:"Buz parçacıkları",
  80:"Yağmur sağanakları",81:"Şiddetli yağmur sağanakları",82:"Çok şiddetli sağanaklar",
  85:"Kısa süreli kar",86:"Yoğun kısa süreli kar",95:"Gök gürültülü sağanak",
  96:"Hafif dolu ile gök gürültülü sağanak",99:"Yoğun dolu ile gök gürültülü sağanak"
};

// derece formülleri
function cToF(c){ return (c * 9/5) + 32; }
function formatTemp(c){ return unit === 'C' ? `${Math.round(c)}°C` : `${Math.round(cToF(c))}°F`; }

let lastWeather = null;

function getIconSVG(code, size=72){
  const sun = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,0)"><circle cx="12" cy="12" r="4" fill="#ffd166"/><g stroke="#ffd166" stroke-width="1.2" stroke-linecap="round"><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></g></g>
    <style>.icon-sun{animation: spinS 16s linear infinite}@keyframes spinS{from{transform:rotate(0)}to{transform:rotate(360deg)}}</style>
  </svg>`;
  const cloud = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g><path d="M17.5 18H6.5C4.57 18 3 16.43 3 14.5 3 12.57 4.57 11 6.5 11c0-.55.45-1 1-1 0-1.93 1.57-3.5 3.5-3.5 1.24 0 2.33.66 2.94 1.62.39-.22.83-.34 1.29-.34 1.38 0 2.5 1.12 2.5 2.5 0 .11 0 .22-.01.33C18.44 12.12 20 13.97 20 16.25 20 17.5 18.99 18 17.5 18z" fill="#cbd5e1" opacity="0.95"/></g></svg>`;
  const rain = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g>${cloud}</g><g><path d="M8 19c0 1-1 2-1 2s-1-1-1-2 1-2 1-2 1 1 1 2z" fill="#60a5fa"/><path d="M13 19c0 1-1 2-1 2s-1-1-1-2 1-2 1-2 1 1 1 2z" fill="#60a5fa"/><path d="M18 19c0 1-1 2-1 2s-1-1-1-2 1-2 1-2 1 1 1 2z" fill="#60a5fa"/></g></svg>`;
  const snow = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g>${cloud}</g><g fill="#e2e8f0"><circle cx="8" cy="20" r="1.6"/><circle cx="12" cy="20" r="1.6"/><circle cx="16" cy="20" r="1.6"/></g></svg>`;
  const storm = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g>${cloud}</g><path d="M13 11l-2 4h3l-2 5" fill="#f97316"/></svg>`;
  const fog = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g>${cloud}</g><rect x="3" y="18" width="18" height="1.2" rx="0.6" fill="#94a3b8" opacity="0.8"/></svg>`;

  if(code === 0) return sun;
  if([1,2].includes(code)) return sun;
  if(code === 3) return cloud;
  if([45,48].includes(code)) return fog;
  if([51,53,55,61,63,65,80,81,82,56,57,66,67].includes(code)) return rain;
  if([71,73,75,85,86].includes(code)) return snow;
  if([95,96,99].includes(code)) return storm;
  return cloud;
}

// arkaplan yönetme
function clearBg(){ bg.innerHTML=''; document.body.classList.remove('bg-clear','bg-cloud','bg-rain','bg-snow','bg-storm','bg-fog'); }
function setBackgroundForCode(code){
  clearBg();
  if(code===0 || [1,2].includes(code)){ document.body.classList.add('bg-clear'); addSunRays(); }
  else if(code===3){ document.body.classList.add('bg-cloud'); addClouds(3); }
  else if([45,48].includes(code)){ document.body.classList.add('bg-fog'); addFog(); }
  else if([51,53,55,61,63,65,80,81,82,56,57,66,67].includes(code)){ document.body.classList.add('bg-rain'); addClouds(2); addRain(80); }
  else if([71,73,75,85,86].includes(code)){ document.body.classList.add('bg-snow'); addClouds(1); addSnow(40); }
  else if([95,96,99].includes(code)){ document.body.classList.add('bg-storm'); addClouds(2); addRain(60); addStormFlash(); }
  else { document.body.classList.add('bg-cloud'); addClouds(2); }
}

function addClouds(count=2){
  const cloudsWrap = document.createElement('div'); cloudsWrap.className='clouds';
  for(let i=0;i<count;i++){
    const c=document.createElement('div'); c.className='cloud';
    const size=120+Math.random()*260; c.style.width=size+'px'; c.style.height=(size*0.62)+'px';
    c.style.top=(8+Math.random()*40)+'%'; c.style.left=(-30+Math.random()*40)+'vw';
    c.style.opacity=0.35+Math.random()*0.5; c.style.animationDuration=(30+Math.random()*40)+'s';
    cloudsWrap.appendChild(c);
  }
  bg.appendChild(cloudsWrap);
}
function addRain(count=60){
  const wrap=document.createElement('div'); wrap.className='rain-container';
  for(let i=0;i<count;i++){
    const d=document.createElement('div'); d.className='raindrop';
    const left=Math.random()*100; d.style.left=left+'%';
    const dur=0.8+Math.random()*1.4; d.style.setProperty('--dur',dur+'s');
    d.style.opacity=0.2+Math.random()*0.8; d.style.top = (-10-Math.random()*20)+'%';
    d.style.height = (12 + Math.random()*28) + 'px';
    d.style.width = (1 + Math.random()*2) + 'px';
    wrap.appendChild(d);
  }
  bg.appendChild(wrap);
}
function addSnow(count=30){
  const wrap=document.createElement('div'); wrap.className='snow-container';
  for(let i=0;i<count;i++){
    const s=document.createElement('div'); s.className='flake'; s.textContent='❄';
    const left=Math.random()*100; s.style.left=left+'%';
    const size=9+Math.random()*18; s.style.fontSize=size+'px';
    const dur=6+Math.random()*10; s.style.setProperty('--s',dur+'s');
    s.style.opacity=0.4+Math.random()*0.6; s.style.top = (-5-Math.random()*15)+'%';
    wrap.appendChild(s);
  }
  bg.appendChild(wrap);
}
function addFog(){ const f=document.createElement('div'); f.className='fog'; bg.appendChild(f); }
function addSunRays(){ const rays=document.createElement('div'); rays.className='sun-rays'; for(let i=0;i<12;i++){ const r=document.createElement('div'); r.className='ray'; r.style.left=(50+Math.cos(i/12*Math.PI*2)*40)+'%'; r.style.top=(30+Math.sin(i/12*Math.PI*2)*10)+'%'; r.style.height=120+Math.random()*60+'px'; r.style.transform=`rotate(${i*(360/12)}deg)`; rays.appendChild(r); } bg.appendChild(rays);}
function addStormFlash(){ const flash=document.createElement('div'); flash.className='storm-flash flash'; bg.appendChild(flash); }

async function geocode(query){
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=tr`;
  const res = await fetch(url); if(!res.ok) throw new Error('Geocoding hatası'); const data = await res.json(); return data.results || [];
}
async function fetchWeather(lat, lon){
  const params = new URLSearchParams({
    latitude: lat, longitude: lon,
    current_weather: 'true', timezone: 'auto',
    daily: 'temperature_2m_max,temperature_2m_min,weathercode'
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url); if(!res.ok) throw new Error('Weather API hatası'); return await res.json();
}

function renderWeather(data){
  lastWeather = data;
  const locLabel = data?.timezone || `${(data.latitude||'').toString().slice(0,6)}, ${(data.longitude||'').toString().slice(0,6)}`;
  locName.textContent = locLabel;
  const cw = data.current_weather; if(!cw){ statusMsg.textContent='Hava verisi alınamadı.'; return; }


  const pcode = Array.isArray(data.daily?.weathercode) && data.daily.weathercode.length ? data.daily.weathercode[0] : cw.weathercode;
  setBackgroundForCode(pcode);
  iconWrap.innerHTML = getIconSVG(cw.weathercode,72);
  tempEl.textContent = formatTemp(cw.temperature);
  metaEl.textContent = `Saat: ${cw.time} • Rüzgâr: ${cw.windspeed} km/h • Yön: ${cw.winddirection}°`;
  descEl.textContent = weatherCodes[cw.weathercode] || '—';
  windEl.textContent = `${cw.windspeed} km/h`;
  pressEl.textContent = '—';
  humEl.textContent = '—';
  statusMsg.textContent = 'Güncel hava verisi gösteriliyor.';

  forecastEl.innerHTML = '';
  if(data.daily && data.daily.time){
    const times = data.daily.time; const tmax = data.daily.temperature_2m_max; const tmin = data.daily.temperature_2m_min; const wcodes = data.daily.weathercode || [];
    for(let i=0;i<times.length && i<5;i++){
      const d=document.createElement('div'); d.className='day';
      const dayLabel = new Date(times[i]).toLocaleDateString('tr-TR',{weekday:'short',day:'numeric',month:'short'});
      const code = wcodes[i] ?? cw.weathercode; const iconSmall = getIconSVG(code,36);
      d.innerHTML = `<div style="font-weight:600">${dayLabel}</div><div class="dicon">${iconSmall}</div><div style="margin-top:.2rem">${Math.round(tmax[i])}/${Math.round(tmin[i])}°</div>`;
      forecastEl.appendChild(d);
    }
    forecastEl.setAttribute('aria-hidden','false');
  }
}

// konum ve arama
async function useMyLocation(){
  statusMsg.textContent='Konum alınıyor — tarayıcı izin isteyebilir...';
  try{
    const pos = await new Promise((resolve,reject)=>{
      if(!navigator.geolocation) return reject(new Error('Tarayıcı konum desteği yok.'));
      navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy:true, timeout:15000});
    });
    const lat=pos.coords.latitude, lon=pos.coords.longitude; statusMsg.textContent=`Konum bulundu: ${lat.toFixed(4)}, ${lon.toFixed(4)} — hava getiriliyor...`;
    const data = await fetchWeather(lat, lon); data.latitude = lat; data.longitude = lon; renderWeather(data);
  }catch(err){ console.error(err); statusMsg.textContent=`Konum alınamadı: ${err.message}`; }
}
async function searchQuery(q){
  if(!q||!q.trim()){ statusMsg.textContent='Lütfen arama alanına bir konum yazın.'; return; }
  statusMsg.textContent='Arama yapılıyor...';
  try{
    const results = await geocode(q); if(!results.length){ statusMsg.textContent='Konum bulunamadı.'; return; }
    const pick = results[0]; statusMsg.textContent=`Bulundu: ${pick.name}, ${pick.country} — hava getiriliyor...`;
    const data = await fetchWeather(pick.latitude, pick.longitude);
    data.timezone = `${pick.name}${pick.admin1? ', '+pick.admin1 : ''} • ${pick.country}`; data.latitude = pick.latitude; data.longitude = pick.longitude;
    renderWeather(data);
  }catch(err){ console.error(err); statusMsg.textContent=`Arama hatası: ${err.message}`; }
}

// events
locBtn.addEventListener('click', useMyLocation);
searchBtn.addEventListener('click', ()=> searchQuery(queryEl.value));
queryEl.addEventListener('keydown', (e)=>{ if(e.key==='Enter') searchQuery(queryEl.value); });


window.addEventListener('load', ()=>{
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      try{
        const lat=pos.coords.latitude, lon=pos.coords.longitude;
        statusMsg.textContent='Konum bulundu — hava verisi getiriliyor';
        const data = await fetchWeather(lat, lon); data.latitude=lat; data.longitude=lon; renderWeather(data);
      }catch(e){ console.warn('Auto geolocation failed', e); }
    }, (err)=>{ statusMsg.textContent='Konum gerekli değil — arama veya "Konumuma Göre" kullanabilirsiniz.'; }, {timeout:5000});
  } else { statusMsg.textContent='Tarayıcınız konumu desteklemiyor — arama yapabilirsiniz.'; }
});