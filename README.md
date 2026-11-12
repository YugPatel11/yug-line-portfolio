# The Yug Line — Personal Portfolio for One Who Codes 2026

Personal portfolio for **Yug Rojivadiya** built for the One Who Codes 2026 Portfolio Challenge.

## Concept: "The Yug Line"
The site reimagines Yug's portfolio as an authentic, art-directed transit network. A route line connects eight stations representing his trajectory from backend logic to smooth UIs:
- **Station 00 — Central Departure (Origin & Hero)**: Overview map, departure ticket, key stats.
- **Station 01 — Departures Board (Milestones)**: Smart India Hackathon 2026 win, Indux 5.0, Website building competition, Edverb LOR.
- **Station 02 — Interchange: Ghumify (Flagship)**: The 4-line convergence station detailing the AI travel companion.
- **Station 03 — Line Stops (Curated Projects)**: GeoBus, Grantpilot, EcoSortX, DataMorphix, Cricktraker, Clinic, EMS.
- **Station 04 — Crew & Service Record (Experience)**: Edverb Frontend Intern, VP EBC Club, Freelance Developer.
- **Station 05 — Line Legend (Tech Arsenal)**: Pure tech stack stops across 5 transit tracks with AI disclosure.
- **Station 06 — Academic Junction (Education)**: B.Tech CSE (AI/ML), P P Savani University, CGPA records.
- **Station 07 — Terminus (Dispatch & Contact)**: Connectivity hub, link buttons, clean bottom-right corner for ONEWHO badge.

---

## Free & Open-Source Dependencies & Licences (Section A6)
All libraries used are strictly free and open-source:
| Dependency | Version | Licence | Purpose |
| :--- | :--- | :--- | :--- |
| `astro` | `5.8.1` | MIT | Static site generator & build engine |
| `@astrojs/tailwind` | `6.0.2` | MIT | Zero-runtime CSS processing integration |
| `tailwindcss` | `3.4.17` | MIT | Design token-driven utility styling |
| `gsap` | `3.12.7` | Standard GreenSock Free Licence | Micro-animations and scroll transitions |
| `@fontsource-variable/archivo` | `5.1.1` | OFL-1.1 | Self-hosted display typography |
| `@fontsource/manrope` | `5.1.1` | OFL-1.1 | Self-hosted body typography |
| `@fontsource/ibm-plex-mono` | `5.1.1` | OFL-1.1 | Self-hosted transit mono typography |
| `qrcode` | `1.5.4` | MIT | Client-side dynamic QR code generation for tickets |

*Zero paid fonts, zero tracking scripts, zero paid services.*

---

## Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build static production distribution
npm run build

# 4. Run automated integrity audit
npm test

# 5. Preview production build locally
npm run preview
```

---

## Technical Architecture & Highlights

### 1. Dual-Mode Progressive Enhancement & Simplified Journey
- **Express Mode (No-JS / Skip View)**: Semantic, accessible single-page layout where all 8 stations are laid out along a vertical transit line with generous spacing and sticky station links. If JavaScript is disabled or "Skip the metro · see everything" is chosen, 100% of portfolio content, links, and documents remain directly readable.
- **Simplified Journey Flow**:
  - **Step 0 · Welcome (Full Screen)**: Explicit sound choice (`Enter with sound` or `Enter without sound`), unlocks Web Audio context on user gesture.
  - **Step 1 · Choose a Stop**: Replaces crowded concourse; 40% passenger bio + 60% 7 roomy destination buttons (Achievements, Ghumify, All projects, Experience, Skills & tools, Education, Contact).
  - **Step 2 · Your Ticket**: Calm boarding pass showing FROM, TO, DATE, FARE (Free), PNR, and small QR code.
  - **Step 3 · Scan Your Ticket**: Visible horizontal swipe rail (drag >80% to validate) plus prominent `Scan ticket` button.
  - **Step 4 · Full-Screen Cinematic Metro**: 100dvh 4-layer stage (far wall tiles, pillars, tactile platform edge, 4-car SVG train with warm interior, centred `Board the metro →` button, departure reveal).
  - **Step 5 · The Stop**: Slim top bar ("You are at: Projects · Stop 3 of 7") and fixed bottom bar (`Next: X →`, `Back to start`, `All stops`).
- **All Stops Sheet**: Roomy slide-over panel showing "Stops visited: X of 7" with instant Tap & Go jumps.

### 2. Spatial Web Audio Transit Synthesizer (`src/scripts/sound/metroSound.ts`)
- Pure zero-file synthesizer with stereo panning and dynamic compressor limiting:
  - Approach: low rumble (brown noise through 180–400Hz filter panned left to centre) and rail clatter ticks.
  - Braking: brake squeal (bandpass noise 2.6kHz → 900Hz) and pneumatic air hiss.
  - Stopped: door slide whoosh and two-tone ding-dong chime (880Hz then 660Hz sine decay).
  - Waiting: quiet 60Hz station hum loop.
  - Boarding: three 1kHz door-closing beeps (90ms each) and door thump.
  - Departure: rising motor inverter whine (sawtooth lowpass rising pitch) and accelerating wheel clatter ticks panned centre to right.
- Optional audio file fallback: If `public/audio/metro-arrive.mp3`, `metro-doors.mp3`, or `metro-depart.mp3` are placed in `public/audio/`, the engine seamlessly plays them; otherwise it synthesizes everything offline.

### 3. Keyboard Navigation Shortcuts
- `D`: Toggle "Skip the metro · see everything" (Journey Mode / Express Mode)
- `M`: Toggle Reduced Motion
- `S`: Toggle Transit Sound Effects
- `T`: Open "All stops" sheet
- `1` - `8`: Quick-board to Stops 00 through 07
- `Escape`: Close open modals and overlays

---

## Deployment Instructions

### Cloudflare Pages
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Environment variables**: Node.js `20.x` or higher
- Caching and security headers are automatically loaded from `public/_headers`.

### Vercel / Netlify / GitHub Pages
- **Static deploy**: Deploy the contents of the `dist/` directory directly to any static web host. Zero server-side runtime is required.

---

## Contrast Check Ratios (WCAG AA Compliance)
- **Day Mode**:
  - Ink (`#111111`) on Paper (`#F4F1EA`): **16.8:1** (Passes AAA)
  - Ink (`#111111`) on Surface (`#FBF9F4`): **18.4:1** (Passes AAA)
  - Ink-soft (`#4A4741`) on Paper (`#F4F1EA`): **7.5:1** (Passes AAA)
- **Night Mode**:
  - Ink (`#F1EEE6`) on Paper (`#0F1115`): **16.6:1** (Passes AAA)
  - Ink (`#F1EEE6`) on Surface (`#171A20`): **15.2:1** (Passes AAA)
  - Ink-soft (`#B5B1A6`) on Paper (`#0F1115`): **9.3:1** (Passes AAA)

---

## AI Assistance Disclosure
In full accordance with competition rules, this project was developed with assistance from Google DeepMind's Antigravity agent, utilizing structured specifications and assets from Yug Rojivadiya's previous portfolio. All architecture, logic, and content are authentic to Yug's work.

---

## TODO-USER Action Items
The following items require real user files, links, or media:
1. `public/images/ghumify/`: Add 3 high-resolution production screenshots for Ghumify.
2. `public/images/projects/`: Add screenshots for GeoBus, Grantpilot, EcoSortX, DataMorphix, Cricktraker, Clinic, and EMS.
3. `Ghumify Video`: Add embed/demo link for the Ghumify system walk-through.
4. `Ghumify Repo & Demo`: Add public GitHub repository URL and live production URL.
5. `Ghumify Metric`: Provide one measured user count, pilot feedback metric, or deployment statistic.
6. `Resume File`: Place the official PDF at `public/resume/YUG-ROJIVADIYA-final-cv.pdf`.
7. `Favicon`: Replace `public/favicon.svg` with your personal transit brand mark if desired.
