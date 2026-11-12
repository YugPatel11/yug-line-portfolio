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

### 1. Dual-Mode Progressive Enhancement
- **Express Mode (Default/No-JS)**: Semantic, fully accessible single-page layout where all 8 stations are laid out along a vertical transit line. If JavaScript is disabled, 100% of portfolio content, links, and documents remain directly readable.
- **Journey Mode (Interactive)**: Activated via typed state machine (`src/scripts/journey/machine.ts`). The visitor purchases a station boarding pass at the concourse window, validates it at the turnstile gate, boards a 3-car metro train, and arrives at the station with decision controls to navigate forward or return to base.
- **Day Pass Skip**: Available on every screen (top navigation and scene overlays), allowing immediate switching back to Express Mode.

### 2. Zero-File Web Audio Synthesizer
- Built without any external audio asset files or network requests (`src/scripts/sound.ts`).
- Synthesizes realistic transit mechanical feedback:
  - Dot-matrix ticket printer noise bursts
  - High-frequency validation beeps
  - Gate solenoid thumps & pleasant two-tone chimes
  - Train motor hums and arrival door-open chimes
- Default state: **Muted/OFF** (user opt-in via header button or pressing `S`).

### 3. Keyboard Navigation Shortcuts
- `D`: Toggle Day Pass (Journey Mode / Express Mode)
- `M`: Toggle Reduced Motion
- `S`: Toggle Transit Sound Effects
- `T`: Open Travel Card Passport modal
- `1` - `8`: Quick-board to Stations 00 through 07
- `Escape`: Close modals and overlays

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
