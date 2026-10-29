# website

My personal website and blog, built with plain HTML and CSS (no coding tools needed).

## Edit it in VS Code

1. Install [VS Code](https://code.visualstudio.com/) and [Git](https://git-scm.com/downloads).
2. In VS Code, press `Ctrl+Shift+P` (`Cmd+Shift+P` on Mac), type **Git: Clone**, and paste
   `https://github.com/shimvanHotdog/website`. Pick a folder to save it in and open it.
3. Open `index.html` or a file in `posts/`, change the text, and save.
4. To preview, right-click `index.html` and open it in your browser
   (or install the **Live Server** extension and click **Go Live**).
5. To publish your changes, open the **Source Control** tab on the left, type a short message,
   click **Commit**, then **Sync Changes**.

## Add a new post

1. Copy `posts/hello-world.html` and rename it, e.g. `posts/my-trip.html`.
2. Change the title, date and text inside it.
3. Add a link to it in the post list in `index.html` and `archive.html`
   (and, if you like, under "Recent posts" in the sidebar).

## The Music tab

The Music page fills itself in from your Last.fm listening: top artists, top albums, what you're
playing now, and the genre shape. Settings are in `music-data.js`: your Last.fm username, the time
period to show, the genre names, and optional notes about albums.

Your Last.fm API key is private, so it's saved in Cloudflare, not in these files. To set it (once),
run this in the site folder and paste the key when asked:

    npx wrangler secret put LASTFM_API_KEY

`worker.js` uses that key to fetch your data from Last.fm. To preview the Music page on your own
computer, put `LASTFM_API_KEY=your-key` in a file called `.dev.vars` (it's never uploaded to GitHub)
and run `npx wrangler dev`.

## Change the look

- **Header picture:** drag your own photo (a wide landscape works best, e.g. `my-photo.jpg`) into the
  `images` folder. Then in each page, find `images/header.jpg` near the top and change it to
  `images/my-photo.jpg`. Tip: VS Code's **Edit → Replace in Files** does all the pages at once.

- Colours are at the top of `style.css`. Change a colour code there and the whole site updates.
- The tab bar is the `<nav class="tabs">` block at the top of each page. To add a tab,
  copy one `<li>` line in every page. `class="active"` marks the tab of the page you're on.

## Put it online (GitHub Pages)

On GitHub, go to **Settings → Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`,
and save. Your site will be at `https://shimvanhotdog.github.io/website/`.
