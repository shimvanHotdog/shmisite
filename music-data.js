// ======================= YOUR MUSIC =======================
// This is the only file you need to edit for the Music tab.
//
// GENRES: the corners of the shape on the Music page.
// You can rename, add or remove genres here (3 to 8 works best).
//
// ARTISTS: one { ... } block per artist.
//   - genre: the artist's usual genre (must match a name in GENRES)
//   - albums: one { ... } block per album you've rated
//       title, year, rating (1 to 10), listened (the date, as "YYYY-MM-DD")
//       review: your thoughts, between the ` backticks. Leave an empty line to start a new paragraph.
//       genre (optional): only if this album is a different genre from the artist's usual one
//
// To add an album: copy one album block (from { to },) and change the words.
// To add an artist: copy a whole artist block and change it.
// The order doesn't matter: the site sorts everything for you.
//
// The entries below are EXAMPLES so you can see how it looks. Replace them with your own.

const GENRES = ["Rock", "Pop", "Jazz", "Hip-hop", "Electronic", "Classical"];

const ARTISTS = [
  {
    name: "Miles Davis",
    genre: "Jazz",
    albums: [
      {
        title: "Kind of Blue",
        year: 1959,
        rating: 10,
        listened: "2026-10-20",
        review: `Example review. Write what you thought of the album here.

Leave an empty line like the one above to start a new paragraph.`,
      },
      {
        title: "Bitches Brew",
        year: 1970,
        rating: 8,
        listened: "2026-10-22",
        review: `Example review. Replace this with your own.`,
      },
    ],
  },
  {
    name: "Radiohead",
    genre: "Rock",
    albums: [
      {
        title: "OK Computer",
        year: 1997,
        rating: 9,
        listened: "2026-10-12",
        review: `Example review. Replace this with your own.`,
      },
      {
        title: "Kid A",
        year: 2000,
        rating: 8,
        listened: "2026-10-15",
        genre: "Electronic",
        review: `Example review. This album has its own genre line, so it counts towards Electronic instead of Rock.`,
      },
    ],
  },
  {
    name: "Daft Punk",
    genre: "Electronic",
    albums: [
      {
        title: "Discovery",
        year: 2001,
        rating: 7,
        listened: "2026-10-05",
        review: `Example review. Replace this with your own.`,
      },
    ],
  },
  {
    name: "Kendrick Lamar",
    genre: "Hip-hop",
    albums: [
      {
        title: "To Pimp a Butterfly",
        year: 2015,
        rating: 9,
        listened: "2026-10-18",
        review: `Example review. Replace this with your own.`,
      },
    ],
  },
  {
    name: "ABBA",
    genre: "Pop",
    albums: [
      {
        title: "Arrival",
        year: 1976,
        rating: 6,
        listened: "2026-10-02",
        review: `Example review. Replace this with your own.`,
      },
    ],
  },
];
