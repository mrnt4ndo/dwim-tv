/* ============ DWIM TV — App Logic ============ */

let CATALOG = { channels: [], videos: [] };
let activeChannel = 'ch-all';
let searchQuery = '';

/* ---------- Helpers ---------- */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function ytId(url) {
  const m = String(url).match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function directSrc(video) {
  // direct mp4 / m3u8 link → native player
  return `
    <video controls autoplay playsinline>
      <source src="${esc(video.source)}" type="video/mp4">
      Your browser does not support the video tag.
    </video>`;
}

function youtubeSrc(video) {
  const id = ytId(video.source);
  if (!id) return `<div style="display:grid;place-items:center;height:100%;color:#9a9aa8;font-weight:700;">⚠️ Invalid YouTube link</div>`;
  const t = video.t ? `&start=${Math.floor(video.t)}` : '';
  return `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${t}"
      title="${esc(video.title)}"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}

function embedSrc(video) {
  // generic iframe embed (e.g., Vimeo, Dailymotion, Twitch)
  return `
    <iframe
      src="${esc(video.source)}"
      title="${esc(video.title)}"
      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
      allowfullscreen></iframe>`;
}

/* ---------- Load catalog ---------- */
async function loadCatalog() {
  try {
    const res = await fetch('/api/catalog');
    CATALOG = await res.json();
    if (!CATALOG.videos) CATALOG.videos = [];
    if (!CATALOG.channels) CATALOG.channels = [];
    render();
  } catch (err) {
    document.getElementById('main').innerHTML =
      `<div class="empty">⚠️ Couldn't load the channel catalog.<br>Check that <b>data/videos.json</b> is valid.</div>`;
  }
}

/* ---------- Render ---------- */
function render() {
  renderChannels();
  renderMain();
}

function renderChannels() {
  const wrap = document.getElementById('channels');
  const chips = CATALOG.channels.map(ch => `
    <button class="chip ${ch.id === activeChannel ? 'active' : ''}" onclick="setChannel('${esc(ch.id)}')">
      <span>${esc(ch.icon || '📺')}</span> ${esc(ch.name)}
    </button>`).join('');
  wrap.innerHTML = chips;
}

function filtered() {
  let list = CATALOG.videos;
  if (activeChannel !== 'ch-all') list = list.filter(v => v.channel === activeChannel);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(v =>
      (v.title || '').toLowerCase().includes(q) ||
      (v.desc || '').toLowerCase().includes(q) ||
      (v.category || '').toLowerCase().includes(q)
    );
  }
  return list;
}

function renderMain() {
  const main = document.getElementById('main');
  const list = filtered();

  if (!list.length) {
    main.innerHTML = `<div class="empty">🕳️ Nothing on this channel right now.<br>Add videos in <b>data/videos.json</b> to fill it up.</div>`;
    return;
  }

  const hero = list[0];
  const rest = list.slice(1);

  const heroHTML = `
    <div class="hero" onclick="playVideo('${esc(hero.id)}')">
      <img class="hero-img" src="${esc(hero.thumb)}" alt="${esc(hero.title)}"
           onerror="this.style.display='none'">
      <div class="hero-body">
        <span class="hero-cat">${esc(hero.category || 'VIDEO')}</span>
        <h1 class="hero-title">${esc(hero.title)}</h1>
        <p class="hero-desc">${esc(hero.desc || '')}</p>
        <div class="hero-meta">
          <span class="btn-play">▶ Play Now</span>
          <span>${esc(hero.duration || '')}</span>
          <span>${esc(hero.views || '')} views</span>
        </div>
      </div>
    </div>`;

  const gridHTML = `
    <section class="section">
      <div class="section-title">
        <h2>${searchQuery ? 'Search Results' : 'On Demand'}</h2>
        <span class="count">${list.length} videos</span>
      </div>
      <div class="grid">
        ${rest.map(cardHTML).join('')}
      </div>
    </section>`;

  main.innerHTML = heroHTML + gridHTML;
}

function cardHTML(v) {
  return `
    <article class="card" onclick="playVideo('${esc(v.id)}')">
      <div class="thumbwrap">
        <img src="${esc(v.thumb)}" alt="${esc(v.title)}" loading="lazy"
             onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 320 180%22><rect fill=%22%23161622%22 width=%22320%22 height=%22180%22/><text x=%22160%22 y=%2295%22 fill=%22%235c5c6e%22 font-size=%2216%22 text-anchor=%22middle%22 font-family=%22sans-serif%22>NO PREVIEW</text></svg>'">
        <span class="duration">${esc(v.duration || '')}</span>
        <div class="play-overlay"><span class="circle">▶</span></div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${esc(v.title)}</h3>
        <div class="card-meta">
          <span class="cat">${esc(v.category || 'VIDEO')}</span>
          <span>•</span>
          <span>${esc(v.views || '')} views</span>
        </div>
      </div>
    </article>`;
}

/* ---------- Interactions ---------- */
function setChannel(id) {
  activeChannel = id;
  render();
}

function goHome(e) {
  if (e) e.preventDefault();
  activeChannel = 'ch-all';
  searchQuery = '';
  document.getElementById('search').value = '';
  render();
  window.scrollTo({ top: 0 });
}

document.getElementById('search').addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  renderMain();
});

/* ---------- Player ---------- */
function playVideo(id) {
  const v = CATALOG.videos.find(x => x.id === id);
  if (!v) return;

  document.getElementById('playerTitle').textContent = v.title || 'Now Playing';
  document.getElementById('playerCat').textContent = v.category || 'VIDEO';
  document.getElementById('playerDur').textContent = v.duration || '—';
  document.getElementById('playerViews').textContent = (v.views || '—') + ' views';
  document.getElementById('playerDesc').textContent = v.desc || '';

  const frame = document.getElementById('playerFrame');
  if (v.type === 'youtube') frame.innerHTML = youtubeSrc(v);
  else if (v.type === 'direct') frame.innerHTML = directSrc(v);
  else frame.innerHTML = embedSrc(v);

  document.getElementById('playerModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  document.getElementById('playerModal').classList.remove('open');
  document.getElementById('playerFrame').innerHTML = '';
  document.body.style.overflow = '';
}

document.getElementById('playerModal').addEventListener('click', (e) => {
  if (e.target.id === 'playerModal') closePlayer();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePlayer();
});

/* ---------- Boot ---------- */
loadCatalog();
