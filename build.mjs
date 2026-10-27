// Builds the site into dist/ (runs automatically on `npx wrangler deploy` and `npx wrangler dev`).
// It puts style.css straight inside every page so the browser needs one less download,
// and squeezes out comments and spaces. You keep editing the normal files; never edit dist/.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";

const out = "dist";
rmSync(out, { recursive: true, force: true });
mkdirSync(out);

const tiny = readFileSync("images/header-tiny.webp").toString("base64");
const css = readFileSync("style.css", "utf8")
  .replace(/\/\*[\s\S]*?\*\//g, "")          // comments
  .replace(/\s+/g, " ")                      // runs of spaces and newlines
  .replace(/\s*([{}:;,>])\s*/g, "$1")        // spaces around punctuation
  .replace(/;}/g, "}")
  .trim()
  // blurry preview of the header photo, shown instantly until the real one arrives
  + `.banner{background-image:url(data:image/webp;base64,${tiny});background-size:cover;background-position:center}`;

const pages = ["."].concat(["posts"]).flatMap((dir) =>
  readdirSync(dir).filter((f) => f.endsWith(".html")).map((f) => join(dir, f)));

for (const page of pages) {
  const html = readFileSync(page, "utf8")
    .replace(/<link rel="stylesheet" href="[^"]*style\.css">/, `<style>${css}</style>`)
    .replace(/<!--[\s\S]*?-->/g, "")         // comments
    .replace(/\n\s*\n/g, "\n")               // blank lines
    .replace(/^\s+/gm, "");                  // indentation
  mkdirSync(join(out, dirname(page)), { recursive: true });
  writeFileSync(join(out, page), html);
}

cpSync("images", join(out, "images"), { recursive: true });
cpSync("style.css", join(out, "style.css"));
cpSync("_headers", join(out, "_headers"));
console.log(`Built ${pages.length} pages into ${out}/ (CSS inlined: ${css.length} bytes)`);
