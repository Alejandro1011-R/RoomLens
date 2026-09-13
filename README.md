# RoomLens

The RoomLens landing page — the brand handoff (`landing.html` v1.1) rebuilt as a
structured [Astro](https://astro.build) site and deployed to GitHub Pages.

**Live:** https://alejandro1011-r.github.io/RoomLens/

---

## Why Astro

The page is content first with two interactive WebGL panels. Astro ships the
whole page as static HTML with zero framework runtime, and sends JavaScript only
for the parts that need it — here, the two Three.js scenes and the theme toggle.
A React or Next app would hydrate the entire page to animate two canvases.

## Structure

```
src/
  layouts/Base.astro        document shell, fonts, pre-paint theme restore
  pages/index.astro         section composition + the single client entry point
  components/               one file per section: markup + its own scoped CSS
    Nav · Hero · RealityGap · HowItWorks · Modes · Market · Team · Closer · Footer
  data/team.ts              the roster — edit here, the cards follow
  scripts/
    theme.ts                light / dark / OS, broadcast as an event
    scenes.ts               both Three.js scenes, one dirty-flagged render loop
  styles/
    tokens.css              design tokens, verbatim from the brand handoff
    global.css              token aliases, reset, type, buttons, section rhythm
public/
  logo/ team/ brandbook.html
```

Section CSS lives inside the component it styles. Only what is genuinely shared
sits in `global.css`, and every colour resolves to a token — no literal hex in
component CSS.

## Develop

```bash
npm install
npm run dev
```

`npm run build` writes `dist/`, `npm run preview` serves it, `npm run check`
type-checks every `.astro` and `.ts` file.

Because the site is served from `/RoomLens`, the dev and preview URLs carry that
prefix too: http://localhost:4321/RoomLens.

## Editing the team

`src/data/team.ts` is the single source of truth. Drop a photo into
`public/team/`, add its file name to that member's `photo` field, and the card
picks it up. A member with no `photo` renders the pending placeholder instead —
same 4:3 box, their initials, and a `photo pending` tag.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`: build, upload, deploy
to GitHub Pages. `astro.config.mjs` sets `site` and `base` — change both if the
repository is ever renamed or moved to a custom domain, and keep asset URLs
going through `import.meta.env.BASE_URL`.

## The design rules that drive this page

From the brand book, and worth keeping if you improvise something new:

1. **Hairlines over shadows, air over boxes.** Structure comes from 1 px rules
   and whitespace. Static cards get no shadow. Radius stays at 2–3 px.
2. **One accent colour.** Aperture Orange is the only loud thing on the page.
   Depth Teal is not a second accent — it means "verified", nothing else.
3. **Weight is restraint.** Display type never exceeds 600.

The primary button is dark ink on orange, never white — white on `#E8511C`
reaches only 3.7 : 1 and fails AA at button size. Use the `--on-accent` token.

`public/brandbook.html` carries the full kit: palette, type, voice, components
and the definition of done.
