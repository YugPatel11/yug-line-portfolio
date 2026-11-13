# THE YUG LINE — INITIAL DESIGN REVIEW & SCREEN AUDIT

Audit conducted: Friday, 13 Nov 2026
Auditor: Creative Director, Creative Developer & QA Lead
Target Event: One Who Codes 2026 Portfolio Challenge
Deadline: Sun 15 Nov 2026, 11:59 PM IST | Feature Freeze: Sat 14 Nov 2026, 23:00 IST
Testing Viewports: 390×844 (Mobile), 768×1024 (Tablet), 1440×900 (Desktop)
Testing Themes: Day Mode (#F4F1EA paper) & Night Mode (#0F1115 dark paper)

---

## 1. Executive Summary & Root Cause Analysis

### Why the Site Still Feels "Too Simple"
1. **Identical Structural Layout Across Stops**: Stations 01 through 07 use the identical layout pattern: station header box + full-width dark container box + 2–3 nested rectangular cards. There is no architectural identity distinguishing Achievements from Experience or Skills.
2. **Missing Set Pieces & Signature Interactions**: The brief mandates unique set pieces (split-flap board, Ghumify interchange hub, lanyard ID badges, interactive skill metro map, pinned noticeboard, and terminus extruded ticket), but current screens display standard text boxes.
3. **Absence of Ticket Counter Clerk**: Station 00 currently shows a flat 7-button list instead of the physical ticket booth with the friendly clerk, dialogue speech bubble, 2.5D layered ticket window, and ticket stamping animation.
4. **Lack of Graphic Print Texture**: Missing halftone dot shading patterns for shadows, riso-style hard offset text shadows in line colours on display numerals, and depth layers.
5. **No Living Background Motion**: The background lacks ambient life (passing tunnel trains, animated station clock ticks, live status tickers).

---

## 2. Screen-by-Screen Baseline Audit & Scores

Scoring Dimensions (1–10):
- **CRF**: Craft & Polish
- **CRE**: Creativity & Concept
- **CNT**: Content & Information Quality
- **CLA**: Clarity for a Beginner
- **WOW**: Wow Factor & Emotional Impact

| Screen / State | CRF | CRE | CNT | CLA | WOW | Overall | Honest Critique & Why It Feels Simple |
|---|:---:|:---:|:---:|:---:|:---:|:---:|---|
| **0. Station Loader** | 7 | 8 | 8 | 8 | 7 | **7.6** | Solid foundation with shutter doors, but lacks route progress bar and headlight sweep. |
| **1. Welcome Screen** | 7 | 7 | 8 | 9 | 6 | **7.4** | SVG train rolls in, but lacks 3D depth and dramatic riso poster typography. |
| **2. Ticket Counter (ST-00)** | 5 | 5 | 8 | 7 | 4 | **5.8** | Critical gap: Flat 7-item button list. No clerk, no dialogue, no physical ticket counter. |
| **3. Gate Screen** | 7 | 7 | 7 | 8 | 6 | **7.0** | Functional turnstile swipe, but turnstile art is basic flat SVG; lacks RFID sensor indicator. |
| **4. Metro Ride & Boarding** | 8 | 8 | 8 | 9 | 8 | **8.2** | Beveled subway tiles, steel rails, and board button refined. Needs passing tunnel windows. |
| **5. ST-01 Achievements** | 6 | 6 | 8 | 8 | 5 | **6.6** | Regular HTML table with amber badges instead of a dynamic split-flap mechanical board. |
| **6. ST-02 Ghumify Interchange** | 6 | 7 | 8 | 8 | 5 | **6.8** | Text-heavy interchange card; missing phone mockup with SVG route animation. |
| **7. ST-03 All Projects** | 7 | 7 | 9 | 8 | 6 | **7.4** | Plaques with rivets improved, but uniform card grid lacks varied poster wall sizing and modal detail viewer. |
| **8. ST-04 Experience / Crew** | 5 | 5 | 8 | 8 | 4 | **6.0** | Three plain cards; missing staff ID badges on lanyards connected by route-line timeline. |
| **9. ST-05 Skills & Tools** | 5 | 6 | 8 | 8 | 4 | **6.2** | Three plain text lists; missing interactive transit line map connecting skills to projects. |
| **10. ST-06 Education** | 6 | 5 | 8 | 8 | 5 | **6.4** | Generic card with GPA; missing platform noticeboard with pinned cards and university crest. |
| **11. ST-07 Terminus & Contact** | 6 | 6 | 8 | 8 | 5 | **6.6** | Simple contact box; missing the final extruded commemorative journey ticket and door-open finale. |
| **12. All Stops Sheet (Modal)** | 8 | 8 | 8 | 9 | 7 | **8.0** | Well-isolated dark modal backdrop with visited progress indicators. |

**Current Average Score: 6.9 / 10**
**Target Benchmark: 8.5+ / 10 on all screens prior to freeze**

---

## 3. Transformation Plan & Implementation Phases

### Phase 1: Ticket Counter with Clerk (Hours 0–6)
- Build 2.5D layered Ticket Counter in `src/components/TicketCounter.astro`.
- Back Layer: Subway tile wall, illuminated "TICKETS" blade sign, timetable poster, analog ticking station clock.
- Mid Layer: 2D animated SVG clerk (with blinking, nodding, typing, and ticket sliding animations) + WebGL 3D character hook.
- Front Layer: Wood counter slab, mechanical ticket printer with extrusion slot, rubber stamp & pad, brass bell, ticket collection tray.
- Interactive Flow: Clerk speech bubble ("Namaste! Where to today?"), destination selection triggers clerk response, printer extrudes ticket, clerk stamps and slides ticket into tray, visitor taps "Take my ticket →".

### Phase 2: Set Piece Unification (Hours 6–14)
- **ST-01 Achievements**: Split-flap departures board with sequential CSS/WAAPI flipping letters and numbers (150+, 165, 1st) with clickable ticket stubs.
- **ST-02 Ghumify**: Illustrated 4-line transit junction with interactive tech chips lighting their respective track lines, paired with CSS/SVG mobile device mockup tracing travel routes.
- **ST-03 Projects**: Varied poster wall display with masonry-style plaque frames, live line-filtering, and focus-trapped inspection modal.
- **ST-04 Crew**: Physical staff ID access badges with lanyard clips and metallic eyelets, connected via subway timeline route. Badges flip on click to reveal duties.
- **ST-05 Skills**: Interactive schematic transit line map where skills are metro interchange nodes; tapping a node illuminates corresponding projects.
- **ST-06 Education**: Cork/platform noticeboard with pinned grade sheets, university seals, and semester milestones.
- **ST-07 Terminus**: Animated arrival concourse with extruded commemorative "Journey Complete" travel voucher and direct contact links.

### Phase 3: Visual Textures & Background Life (Hours 14–18)
- Subtle paper grain (3%) across day/night surfaces.
- Halftone dot SVG patterns for shadows and train shading.
- Hard 4px offset text-shadows in line colours on large Archivo numbers.
- Background tunnel windows with flat transit train silhouettes passing every 22 seconds (respecting reduced motion).
- Sound FX polish for counter bell, printer chatter, and stamp thunk.

### Phase 4: Browser Verification, Accessibility & Lighthouse (Hours 18–24)
- Full screenshot verification at 390px, 768px, and 1440px in Day & Night.
- Axe accessibility audit & Lighthouse performance (targets: Perf ≥90, A11y ≥95, Best Practices ≥95, SEO ≥95).
- Git milestone tags (`stable-1`, `stable-2`, `stable-3`).
- Final documentation updates (`README.md`, `CREDITS.md`, `TODO-USER.md`).

