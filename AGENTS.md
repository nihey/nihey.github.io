# nihey.github.io

Personal homepage served at https://nihey.github.io. An HTML5 "presentation":
the bio, the page's own JavaScript and its CSS are typed out character by
character in three panes above a pixel-art landscape.

**Not the usual stack.** This is a static site built with webpack 4, Babel,
Less and jQuery, with no backend, framework or GraphQL. Any global conventions
for NestJS, Next.js, shadcn and so on do not apply here.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Page shell and **all SEO head tags** (title, description, canonical, OG/Twitter, JSON-LD) |
| `assets/texts/text.txt` | The bio: HTML plus animation markup. **All outbound links live here** |
| `assets/texts/javascript.txt`, `css.txt` | Code typed into the side panes and `eval`'d / applied live |
| `scripts/index.js` | Entry point: loads sprites, registers highlight.js languages, starts the animations |
| `scripts/animate.js` | Typing engine (markup: `**` progress, `++tag`/`--tag` semaphores, `§` delay, trailing `\` joins lines) |
| `plugins/html-plugin.js` | Builds `index.html`: rewrites `!path` assets to md5 names, fills `data-include` elements, minifies |
| `plugins/static-plugin.js` | Copies `static/*` unchanged to the root of `dist/` |
| `static/` | Files that need stable URLs: `robots.txt`, `sitemap.xml`, `og-image.png` |
| `dist/` | Build output (git-ignored), deployed to `master` |

## Commands

- `npm run build`: production build into `dist/` (minified).
- `npm test`: ESLint plus a **development** webpack build. It overwrites
  `dist/` with an unminified build, so always run `npm run build` again before
  deploying. Two `no-eval` warnings are expected (the presentation `eval`s its
  own code).
- `npm start`: dev server on port 9000.
- There is no `lint:fix` script or unit test suite.
- Works on current Node (tested on 26) thanks to
  `NODE_OPTIONS=--openssl-legacy-provider` in the scripts.

## Branches and deploying

- `development` is the default branch and where all source changes go.
- `master` holds **only built files** and is what GitHub Pages serves (legacy
  Pages build from `master` /). Never edit it by hand; replace its contents
  with a fresh `dist/`. Deploy commits are titled `Update <development sha>`.
  The exact commands are in README.md → Deploying.
- After pushing `master`, the "pages build and deployment" Actions run takes
  about a minute and the CDN may serve the old page for a little longer.
  Confirm with `curl -s "https://nihey.github.io/?cb=$RANDOM"` rather than
  trusting the run status.

## SEO rules

These are deliberate. Keep them when editing.

1. **Links are dofollow.** Bio links use `rel="noopener"` only: never
   `nofollow` (it would stop passing SEO value to the linked projects) and
   never `noreferrer` (the linked sites would no longer see the referral
   traffic).
2. **Links must be in the static HTML.** The typed bio only exists after
   JavaScript runs for a while, so crawlers that snapshot early saw no links.
   `index.html` has
   `<main id="about" class="visually-hidden" data-include="assets/texts/text.txt">`,
   which `html-plugin.js` fills at build time with `text.txt` minus the
   animation markup. Edit `text.txt` only; the static copy follows. Don't
   remove this element or the `.visually-hidden` class in
   `styles/index.less`.
3. **When projects or the bio change, update `index.html` too:** the
   `description`, `og:description` and `twitter:description` (all the same
   text, about 150 characters, naming the current projects) and the JSON-LD
   `Person` (`knowsAbout`, `sameAs`) if the tech stack or profiles changed.
4. **Canonical is `https://nihey.github.io/`.** Use `https://` in every
   absolute URL (og:url, og:image, sitemap, robots).
5. **`static/og-image.png` must stay 1200x630.** Retake it when the page
   changes visibly: serve `dist/`, open `/#!/skip` in headless Chromium with
   window size 1200x717 (the viewport comes out at 1200x630), wait about 8 s,
   scroll every `.text-container pre` back to the top, then take the
   screenshot. The terrain width comes from `window.outerWidth`, so only
   resizing the viewport leaves a gap on the right.
6. **Keep `script.js` lean.** Only the `javascript` and `css` highlight.js
   languages are registered (`scripts/index.js`), and the code panes declare
   their language with `class="javascript"` / `class="css"`. Importing
   `highlight.js` itself pulls in every language (+750 KB). The GitHub icon is
   an inline SVG; don't bring back Font Awesome (77 KB font for one icon).
7. **`robots.txt` and `sitemap.xml` live in `static/`.** The sitemap has a
   single URL; add entries if pages are ever added.

## Gotchas

- Hash routes need the `#!/` prefix (`location.hash.substr(3)`), e.g.
  `/#!/skip`, `/#!/html-only`, `/#!/css-main`.
- Analytics is the `rbt.nexusapis.dev` script in `index.html`. The old Google
  Analytics (UA) snippet was removed; UA was shut down in 2024.
- "Enforce HTTPS" could not be turned on through the API ("The certificate
  does not exist yet"), so `http://` still serves 200 without redirecting. The
  canonical tag covers search engines; try the checkbox under Settings → Pages.
- The `font-awesome` package is still listed in `package.json` but no longer
  imported.

## Baseline (live site, 2026-11-11)

Lighthouse (mobile): Performance 94, Accessibility 95, Best Practices 96,
SEO 100. LCP 1.3 s, total transfer 120 KB. The remaining flags come from the
design (slow Speed Index from the typing animation, small low-contrast code
panes) or are outside this repo (GitHub Pages cache TTL, the uncompressed
`rbt` script).
