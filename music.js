// Draws the Music tab from your Last.fm listening (settings are in music-data.js). You shouldn't need to edit this file.
// The address decides what's shown: /music (top artists), /music#/Artist, /music#/Artist/Album

const box = document.getElementById("music");
const sidebar = document.getElementById("music-sidebar");
const PROFILE = `https://www.last.fm/user/${encodeURIComponent(LASTFM_USER)}`;
const PERIOD_NAMES = { overall: "of all time", "12month": "in the last year", "6month": "in the last 6 months", "3month": "in the last 3 months", "1month": "in the last month", "7day": "in the last week" };

// makes text safe to put on the page
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const plays = (n) => `${Number(n).toLocaleString("en-GB")} play${Number(n) === 1 ? "" : "s"}`;
const link = (...parts) => "#/" + parts.map(encodeURIComponent).join("/");
const asList = (x) => (Array.isArray(x) ? x : x ? [x] : []);   // Last.fm sends a single item without the [ ]

// Last.fm's album art, or a plain square when there isn't any
function cover(images, size = "extralarge") {
  const url = (asList(images).find((i) => i.size === size) || {})["#text"];
  return url && !url.includes("2a96cbd8b46e442fc41c2b86b821562f")   // Last.fm's grey "no picture" star
    ? `<img class="cover" src="${esc(url)}" alt="" loading="lazy">`
    : `<span class="cover cover-empty" aria-hidden="true">&#9835;</span>`;
}

// ---------- Talking to Last.fm (answers are kept for 10 minutes so clicking around is instant) ----------
// Requests go through /api/lastfm (worker.js), which adds the private API key on Cloudflare's side.
const memory = {};
async function lastfm(method, params = {}) {
  const query = new URLSearchParams({ method, ...params });
  const key = "lastfm:" + query;
  if (memory[key]) return memory[key];
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && Date.now() - saved.time < 10 * 60 * 1000) return (memory[key] = saved.data);
  } catch {}
  const answer = await fetch("/api/lastfm?" + query).then((r) => r.json());
  if (answer.error) throw new Error(answer.message);
  try { sessionStorage.setItem(key, JSON.stringify({ time: Date.now(), data: answer })); } catch {}
  return (memory[key] = answer);
}
const topArtists = () => lastfm("user.gettopartists", { user: LASTFM_USER, period: PERIOD, limit: 30 }).then((r) => asList(r.topartists.artist));
const topAlbums = () => lastfm("user.gettopalbums", { user: LASTFM_USER, period: PERIOD, limit: 500 }).then((r) => asList(r.topalbums.album));
const artistTags = (name) => lastfm("artist.gettoptags", { artist: name, autocorrect: 1 }).then((r) => asList(r.toptags && r.toptags.tag)).catch(() => []);

// ---------- The genre shape ----------
// Each of your top artists adds their play count to every genre their Last.fm tags match,
// so the shape stretches towards what you actually listen to most.
async function genreShape(artists) {
  const names = Object.keys(GENRES);
  const points = names.map(() => 0);
  const tagLists = await Promise.all(artists.map((a) => artistTags(a.name)));
  artists.forEach((artist, n) => {
    const tags = tagLists[n].slice(0, 6).map((t) => t.name.toLowerCase());
    names.forEach((genre, i) => {
      if (tags.some((tag) => GENRES[genre].some((word) => tag.includes(word)))) points[i] += Number(artist.playcount);
    });
  });
  const most = Math.max(...points, 1);
  const size = 340, middle = size / 2, radius = 110;
  const corner = (i, share) => {
    const angle = (Math.PI * 2 * i) / names.length - Math.PI / 2;
    return [middle + Math.cos(angle) * radius * share, middle + Math.sin(angle) * radius * share];
  };
  const outline = (share) => names.map((_, i) => corner(i, share).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1].map((s) => `<polygon class="ring" points="${outline(s)}"/>`).join("");
  const spokes = names.map((_, i) => `<line class="ring" x1="${middle}" y1="${middle}" x2="${corner(i, 1)[0]}" y2="${corner(i, 1)[1]}"/>`).join("");
  const shape = names.map((_, i) => corner(i, points[i] / most).join(",")).join(" ");
  const dots = names.map((_, i) => { const [x, y] = corner(i, points[i] / most); return `<circle cx="${x}" cy="${y}" r="3.5"/>`; }).join("");
  const labels = names.map((genre, i) => {
    const [x, y] = corner(i, 1.22);
    const align = Math.abs(x - middle) < 5 ? "middle" : x > middle ? "start" : "end";
    return `<text x="${x}" y="${y}" text-anchor="${align}" dominant-baseline="middle">${esc(genre)}</text>`;
  }).join("");

  const top = names[points.indexOf(Math.max(...points))];
  return `
    <figure class="genre-shape">
      <svg viewBox="-50 0 ${size + 100} ${size}" role="img" aria-label="Genre shape. Leaning most towards ${esc(top)}.">
        ${rings}${spokes}<polygon class="shape" points="${shape}"/>${dots}${labels}
      </svg>
      <figcaption>Leaning towards <strong>${esc(top)}</strong>. Each of my top artists adds their plays to the genres they're tagged with on Last.fm.</figcaption>
    </figure>`;
}

// ---------- The three views ----------
async function allArtists() {
  const artists = await topArtists();
  return `
    <h1>Music</h1>
    <p>What I listen to most ${PERIOD_NAMES[PERIOD] || ""}, straight from <a href="${PROFILE}">my Last.fm</a>.</p>
    ${await genreShape(artists)}
    <h2>Top artists</h2>
    <ul class="posts">
      ${artists.map((artist, n) => `
        <li>
          <span class="date">#${n + 1} &middot; ${plays(artist.playcount)}</span>
          <a href="${link(artist.name)}">${esc(artist.name)}</a>
        </li>`).join("")}
    </ul>`;
}

async function oneArtist(name) {
  const [albums, tags] = await Promise.all([topAlbums(), artistTags(name)]);
  const theirs = albums.filter((a) => a.artist.name.toLowerCase() === name.toLowerCase());
  const tagLine = tags.slice(0, 4).map((t) => esc(t.name)).join(" &middot; ");
  return `
    <p class="crumbs"><a href="#/">Music</a> &rsaquo;</p>
    <h1>${esc(name)}</h1>
    ${tagLine ? `<span class="date">${tagLine}</span>` : ""}
    ${theirs.length ? `
      <ul class="albums">
        ${theirs.map((album) => `
          <li>
            <a href="${link(name, album.name)}">${cover(album.image)}<span class="album-name">${esc(album.name)}</span></a>
            <span class="date">${plays(album.playcount)}</span>
          </li>`).join("")}
      </ul>` : `<p>No albums by ${esc(name)} in my top albums yet. <a href="https://www.last.fm/music/${encodeURIComponent(name)}">See them on Last.fm</a>.</p>`}`;
}

async function oneAlbum(artist, title) {
  const info = (await lastfm("album.getinfo", { artist, album: title, username: LASTFM_USER, autocorrect: 1 })).album;
  const tracks = asList(info.tracks && info.tracks.track);
  const about = info.wiki && info.wiki.summary.replace(/<[^>]*>/g, "").replace(/Read more on Last\.fm\.?/, "").trim();
  const note = NOTES[`${info.artist} / ${info.name}`] || NOTES[`${artist} / ${title}`];
  const paragraphs = (text) => text.trim().split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("");
  return `
    <p class="crumbs"><a href="#/">Music</a> &rsaquo; <a href="${link(artist)}">${esc(artist)}</a> &rsaquo;</p>
    <div class="album-head">
      ${cover(info.image)}
      <div>
        <h1>${esc(info.name)}</h1>
        <span class="date">${esc(info.artist)}</span>
        ${info.userplaycount !== undefined ? `<span class="badge">${plays(info.userplaycount)}</span>` : ""}
      </div>
    </div>
    ${note ? `<h2>My thoughts</h2>${paragraphs(note)}` : ""}
    ${about ? `<h2>About this album</h2><p>${esc(about)}</p>` : ""}
    ${tracks.length ? `<h2>Tracks</h2><ol class="tracks">${tracks.map((t) => `<li>${esc(t.name)}</li>`).join("")}</ol>` : ""}
    <p><a href="${esc(info.url)}">Open on Last.fm</a></p>`;
}

// ---------- Sidebar: what's playing and top albums ----------
async function sideLists() {
  const [recent, albums] = await Promise.all([
    lastfm("user.getrecenttracks", { user: LASTFM_USER, limit: 5 }).then((r) => asList(r.recenttracks.track).slice(0, 5)),
    topAlbums(),
  ]);
  const nowPlaying = recent[0] && recent[0]["@attr"] && recent[0]["@attr"].nowplaying;
  return `
    <section><h3>${nowPlaying ? "Listening right now" : "Recently played"}</h3><ul>
      ${recent.map((t) => `<li>${esc(t.name)} <span class="muted">by ${esc(t.artist["#text"])}</span></li>`).join("")}
    </ul></section>
    <section><h3>Top albums</h3><ol>
      ${albums.slice(0, 5).map((a) => `<li><a href="${link(a.artist.name, a.name)}">${esc(a.name)}</a> <span class="muted">by ${esc(a.artist.name)}</span></li>`).join("")}
    </ol></section>`;
}

async function show() {
  const [artist, album] = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(decodeURIComponent);
  document.title = `${album ? album + " | " : artist ? artist + " | " : ""}Music | Ivan's Website`;
  if (location.hash) window.scrollTo(0, 0);
  box.classList.add("loading");
  try {
    box.innerHTML = album ? await oneAlbum(artist, album) : artist ? await oneArtist(artist) : await allArtists();
  } catch (problem) {
    box.innerHTML = `<h1>Music</h1><p>Couldn't load my music from Last.fm right now (${esc(problem.message)}). Try again in a minute.</p>`;
  }
  box.classList.remove("loading");
}

show();
addEventListener("hashchange", show);
sideLists().then((html) => (sidebar.innerHTML = html)).catch(() => {});
