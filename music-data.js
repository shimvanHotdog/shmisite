// ======================= YOUR MUSIC SETTINGS =======================
// The Music tab shows what you listen to on Last.fm, so it updates by itself
// every time you scrobble. This is the only file you need to edit for it.

// 1. Your Last.fm username, between the quotes
const LASTFM_USER = "Shmivan";

// Your Last.fm API key is NOT kept here, because everything in this folder is public on GitHub.
// It's stored privately in Cloudflare instead (see "The Music tab" in README.md).

// 2. Which stretch of time to show: "overall", "12month", "6month", "3month", "1month" or "7day"
const PERIOD = "overall";

// 3. The corners of the genre shape. Each artist's Last.fm tags are matched against
//    these words: an artist tagged "post-rock" counts towards Rock, "synthpop" towards both Pop and Electronic, and so on.
//    You can rename, add or remove genres (3 to 8 works best) and their words.
const GENRES = {
  "Rock": ["rock", "metal", "punk", "grunge", "indie", "alternative", "shoegaze"],
  "Pop": ["pop", "dance", "r&b", "rnb", "soul"],
  "Jazz": ["jazz", "swing", "bebop", "fusion", "blues"],
  "Hip-hop": ["hip hop", "hip-hop", "hiphop", "rap", "trap", "grime"],
  "Electronic": ["electronic", "electronica", "techno", "house", "ambient", "edm", "idm", "synth", "dubstep", "drum and bass", "trance"],
  "Classical": ["classical", "orchestral", "piano", "baroque", "opera", "soundtrack", "composer"],
};

// 4. Optional: your own thoughts on an album. They show on that album's page.
//    Write "Artist / Album" exactly as Last.fm spells it, then your text between the ` backticks.
//    Leave an empty line to start a new paragraph. Delete the example or add more lines like it.
const NOTES = {
  "Radiohead / OK Computer": `Example note. Replace this with your own thoughts, or delete this line.`,
};
