// The small bit of server code behind the site. Cloudflare serves all the normal pages and pictures by itself;
// this only answers /api/lastfm, which asks Last.fm for your listening data using the private API key
// saved in Cloudflare (so the key never appears on the website or on GitHub).

const ALLOWED = ["user.gettopartists", "user.gettopalbums", "user.getrecenttracks", "artist.gettoptags", "album.getinfo"];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== "/api/lastfm") return env.ASSETS.fetch(request);

    const params = new URLSearchParams(url.search);
    if (!ALLOWED.includes(params.get("method"))) return Response.json({ error: 1, message: "Not allowed" }, { status: 400 });
    if (!env.LASTFM_API_KEY) return Response.json({ error: 1, message: "The Last.fm key isn't set up in Cloudflare yet" }, { status: 500 });

    params.set("api_key", env.LASTFM_API_KEY);
    params.set("format", "json");
    // Cloudflare keeps each answer for 10 minutes, so Last.fm isn't asked again on every visit
    const answer = await fetch("https://ws.audioscrobbler.com/2.0/?" + params, { cf: { cacheTtl: 600, cacheEverything: true } });
    return new Response(answer.body, {
      status: answer.status,
      headers: { "content-type": "application/json", "cache-control": "public, max-age=600" },
    });
  },
};
