# The Yug Line — Upgrade Plan (Phases U1–U5)

## 0. Current State & Gap Analysis
- **Current Flow:** Welcome modal → Choose a stop (Step 1) → Your ticket (Step 2) → Fare gate swipe (Step 3) → Full-screen cinematic metro arrival/boarding (Step 4) → Station content (Step 5) + Express Mode vertical scroll.
- **Identified Gaps against Prompt:**
  1. *Loader:* No entrance loading screen. The site loads directly into Welcome modal without the atmospheric "Station Entrance" tunnel animation, headlights, split-flap "Welcome to The Yug Line" blade sign, and door split reveal.
  2. *Background System:* Background is currently plain `--paper` (#F4F1EA / #0F1115). Missing the full station set tokens (`--wall`, `--wall-frontend`, `--wall-backend`, `--wall-ai`, `--wall-hardware`, `--floor`, `--tunnel`), subway tile pattern (4–6% contrast), and platform floor strip with yellow safety line + tactile dots at the bottom of stations.
  3. *Unique Elements:* Missing hanging blade signs on section headers, 48px circular line badges, framed station posters with corner tape and 16:10 aspect ratio, "Mind the gap" divider strips between stops in Express view, and live analog SVG station clock on the concourse.
  4. *3D Metro (Welcome Screen):* Welcome modal currently has no 3D WebGL element. Requires a progressive enhancement 3D train with toon materials, blob shadow, interactive drag yaw (±40°), and instant 2D fallback poster.
  5. *Credits & Documentation:* `CREDITS.md` needs creation with full asset origins, licences, and technical documentation.

---

## 1. Technical Strategy & Rules
- **Free Only (CC0 / Open Source):** All fonts (Fontsource), libraries (Astro, Tailwind, Three.js MIT), and assets are CC0 or MIT.
- **Zero Third-Party Network Calls / Trackers:** Everything self-contained and works offline.
- **No Gradients, Blur, or Glassmorphism:** Pure flat colour, 2px/3px ink borders, hard offset shadows, and hand-built SVG.
- **Progressive Enhancement:** Fully accessible without JavaScript via `<noscript>`, deep-links (`#ghumify`, etc.) jump directly with shortened loader (0.6s), reduced-motion toggle & media query supported.
- **Performance Budget:** Loader inline CSS under 6KB; Three.js loaded lazily (only when WebGL supported and Welcome screen active, disposed on exit).

---

## 2. Implementation Phases

### Phase U1: Loading Screen — “Station Entrance”
- **File:** `src/components/StationEntranceLoader.astro` included directly in `src/pages/index.astro`.
- **Tunnel & Headlights:** Fixed `inset-0` stage in `--tunnel` (#0F1115), 4 receding arch outlines scaling up, approaching headlight circles (#FFE9A8).
- **Hanging Blade Sign:** "Welcome to The Yug Line" with 4 line-colour top stripe and CSS 3D split-flap word flips.
- **Real Progress Engine:** Listens to `document.fonts.ready`, critical assets, and window load; smoothed progression; max timeout 3.5s (returning: 0.8–1.0s, deep-link: 0.6s, skip button after 0.5s).
- **Split Doors Reveal:** 2 center-seam door panels sliding apart (`translateX(±100%)`) over 0.7s to reveal the Welcome screen or target stop. Focus transferred to heading.

### Phase U2: Background System — “The Station as a Set”
- **Tokens in `tokens.css`:** Add `--wall`, `--wall-frontend`, `--wall-backend`, `--wall-ai`, `--wall-hardware`, `--floor`, `--tunnel` for Day and Night modes with AA contrast checks.
- **Subway Tile Pattern:** Inline SVG pattern (48×24px bricks with 1px rule at 5% opacity).
- **Per-Stop Wall Tints:** Apply line wall tints to Station sections (`#station-01` through `#station-07`).
- **Platform Floor Strip:** Add bottom platform strip (`--floor`) with yellow safety line (`--line-hardware`) and tactile dots SVG pattern.

### Phase U3: Unique Station Elements
- **Blade Signs:** Hanging blade signs with suspension rods for Station Headers.
- **Line Badges:** 48px circular badges with stop numbers for destination buttons and tickets.
- **Station Posters:** 16:10 framed wall posters for projects with 2px ink border, hard offset shadow, corner tape stickers, and designed SVG fallbacks.
- **"Mind the Gap" Strips:** 56px yellow tactile divider strips between stops in Express view.
- **Station Clock:** Flat analog SVG clock on Concourse updating smoothly once per second with user's local time.

### Phase U4: 3D Metro on Welcome Screen
- **Component:** `src/components/Welcome3DMetro.astro`.
- **Implementation:** Procedural / CC0 Three.js WebGL scene with toon-style materials (matching paper/surface, ink, and transit line colours), outline inverted hull, blob shadow, interactive drag rotate (±40°), and instant 2D SVG poster fallback.
- **Lazy Loading & Cleanup:** Loaded dynamically only when WebGL supported, memory >= 4GB, viewport >= 360px, and not reduced motion. Fully disposed on leave.

### Phase U5: Overall Design Polish & QA
- **Typography & Rhythm:** Archivo 900 headings, 12-column grid alignment, 65ch line measure, consistent 2px ink borders.
- **Day/Night Contrast Audit:** Verify contrast ratios for all text combinations across Day and Night.
- **Docs:** Update `CREDITS.md`, `README.md`, and `TODO-USER.md`.
- **Build & Verification:** Run `npm run build` and `npm test` after each phase.
