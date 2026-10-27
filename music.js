// Draws the Music tab from the albums in music-data.js. You shouldn't need to edit this file.
// The address decides what's shown: /music (all artists), /music#/artist, /music#/artist/album

const box = document.getElementById("music");
const sidebar = document.getElementById("music-sidebar");

// "Kind of Blue" -> "kind-of-blue", used in the address bar
const slug = (text) => text.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
// makes text safe to put on the page
const esc = (text) => String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const average = (albums) => albums.reduce((sum, a) => sum + a.rating, 0) / albums.length;
const niceDate = (date) => new Date(date + "T12:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
const score = (rating) => `<span class="score" title="${rating} out of 10">${rating}<small>/10</small></span>`;

// every album, with its artist and genre filled in
const albums = ARTISTS.flatMap((artist) => artist.albums.map((album) => ({
  ...album,
  artist,
  genre: album.genre || artist.genre,
  link: `#/${slug(artist.name)}/${slug(album.title)}`,
})));
const artistLink = (artist) => `#/${slug(artist.name)}`;

// ---------- The genre shape ----------
// Each album gives its genre as many points as its rating, so genres you
// listen to a lot and rate highly pull the shape furthest out.
function genreShape() {
  const points = GENRES.map((genre) => albums.filter((a) => a.genre === genre).reduce((sum, a) => sum + a.rating, 0));
  const most = Math.max(...points, 1);
  const size = 340, middle = size / 2, radius = 110;
  const corner = (i, share) => {
    const angle = (Math.PI * 2 * i) / GENRES.length - Math.PI / 2;
    return [middle + Math.cos(angle) * radius * share, middle + Math.sin(angle) * radius * share];
  };
  const outline = (share) => GENRES.map((_, i) => corner(i, share).join(",")).join(" ");

  const rings = [0.25, 0.5, 0.75, 1].map((s) => `<polygon class="ring" points="${outline(s)}"/>`).join("");
  const spokes = GENRES.map((_, i) => `<line class="ring" x1="${middle}" y1="${middle}" x2="${corner(i, 1)[0]}" y2="${corner(i, 1)[1]}"/>`).join("");
  const shape = GENRES.map((_, i) => corner(i, points[i] / most).join(",")).join(" ");
  const dots = GENRES.map((_, i) => { const [x, y] = corner(i, points[i] / most); return `<circle cx="${x}" cy="${y}" r="3.5"/>`; }).join("");
  const labels = GENRES.map((genre, i) => {
    const [x, y] = corner(i, 1.22);
    const align = Math.abs(x - middle) < 5 ? "middle" : x > middle ? "start" : "end";
    return `<text x="${x}" y="${y}" text-anchor="${align}" dominant-baseline="middle">${esc(genre)}</text>`;
  }).join("");

  const top = GENRES[points.indexOf(Math.max(...points))];
  return `
    <figure class="genre-shape">
      <svg viewBox="-50 0 ${size + 100} ${size}" role="img" aria-label="Genre shape. Leaning most towards ${esc(top)}.">
        ${rings}${spokes}<polygon class="shape" points="${shape}"/>${dots}${labels}
      </svg>
      <figcaption>Leaning towards <strong>${esc(top)}</strong>. Each album adds its rating to its genre, so the shape stretches towards what you listen to most and rate highest.</figcaption>
    </figure>`;
}

// ---------- The three views ----------
function allArtists() {
  const sorted = [...ARTISTS].sort((a, b) => a.name.localeCompare(b.name));
  return `
    <h1>Music</h1>
    <p>Albums I've listened to, with a rating out of 10 and a few thoughts on each.</p>
    ${genreShape()}
    <h2>Artists</h2>
    <ul class="posts">
      ${sorted.map((artist) => `
        <li>
          <span class="date">${esc(artist.genre)} &middot; ${artist.albums.length} album${artist.albums.length === 1 ? "" : "s"}</span>
          <a href="${artistLink(artist)}">${esc(artist.name)}</a>
          <p>Average rating ${average(artist.albums).toFixed(1)}/10</p>
        </li>`).join("")}
    </ul>`;
}

function oneArtist(artist) {
  const best = albums.filter((a) => a.artist === artist).sort((a, b) => b.rating - a.rating || b.year - a.year);
  return `
    <p class="crumbs"><a href="#/">Music</a> &rsaquo;</p>
    <h1>${esc(artist.name)}</h1>
    <ul class="posts">
      ${best.map((album) => `
        <li class="album-row">
          ${score(album.rating)}
          <span class="date">${album.year} &middot; ${esc(album.genre)}</span>
          <a href="${album.link}">${esc(album.title)}</a>
        </li>`).join("")}
    </ul>`;
}

function oneAlbum(album) {
  const paragraphs = album.review.trim().split(/\n\s*\n/).map((p) => `<p>${esc(p)}</p>`).join("");
  return `
    <p class="crumbs"><a href="#/">Music</a> &rsaquo; <a href="${artistLink(album.artist)}">${esc(album.artist.name)}</a> &rsaquo;</p>
    <div class="album-head">
      <div>
        <h1>${esc(album.title)}</h1>
        <span class="date">${esc(album.artist.name)} &middot; ${album.year} &middot; ${esc(album.genre)} &middot; listened ${niceDate(album.listened)}</span>
      </div>
      ${score(album.rating)}
    </div>
    ${paragraphs}`;
}

// ---------- Sidebar: top rated and recently listened ----------
function sideLists() {
  const list = (items) => items.map((a) => `<li><a href="${a.link}">${esc(a.title)}</a> &middot; ${a.rating}/10</li>`).join("");
  const top = [...albums].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const recent = [...albums].sort((a, b) => b.listened.localeCompare(a.listened)).slice(0, 5);
  return `
    <section><h3>Top rated</h3><ol>${list(top)}</ol></section>
    <section><h3>Recently listened</h3><ul>${list(recent)}</ul></section>`;
}

function show() {
  const [artistSlug, albumSlug] = location.hash.replace(/^#\/?/, "").split("/");
  const artist = ARTISTS.find((a) => slug(a.name) === artistSlug);
  const album = artist && albums.find((a) => a.artist === artist && slug(a.title) === albumSlug);
  box.innerHTML = album ? oneAlbum(album) : artist ? oneArtist(artist) : allArtists();
  document.title = `${album ? album.title + " | " : artist ? artist.name + " | " : ""}Music | Ivan's Website`;
  if (location.hash) window.scrollTo(0, 0);
}

sidebar.innerHTML = sideLists();
show();
addEventListener("hashchange", show);
