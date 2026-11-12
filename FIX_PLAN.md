# FIX_PLAN.md — "The Yug Line" Experience Overhaul

## 1. Analysis: What is Wrong with Current Metro/Loading Scene & Why
- **Small & Cramped**: The current metro was confined inside a narrow inline card rather than an immersive transit environment.
- **Generic Loading Feel**: The progress bar and tunnel light strips felt like an artificial website loading stall rather than a physical train arrival.
- **Flat & Lifeless Assets**: Missing station context—no tiled platform wall, no architectural pillars, no yellow tactile safety edge, and no layered parallax depth.
- **Lack of Agency**: Passengers were subjected to automatic transitions instead of being greeted by opened doors and choosing when to "Board the metro →".
- **Interior Lack of Reward**: Open doors did not reveal warm interior lighting, grab poles, or passenger silhouettes.
- **Audio Disconnect**: No approach rumble, no directional panning from left to right, no brake squeal, and no authentic two-tone ding-dong door chimes.

---

## 2. Identified Clutter, Spacing, Labelling & Usability Issues
- **Concourse Overload**: Concourse combined an oversized interactive SVG map, station selector, ticket puncher, and ride animation in one congested layout.
- **Confusing Transit Jargon**: Terminology like "Day Pass — skip the booking", "Issue ticket", "PNR Record", and "Boarding Pass [DRAG]" confused first-time visitors.
- **Missing Audio Consent**: Audio was muted by default without an obvious onboarding prompt, causing visitors to miss the Web Audio experience.
- **Multiple Competing Actions**: Screens lacked a single dominant primary button ("One screen, one decision").
- **Tight Mobile Targets**: Buttons and interactive chips hovered near 40–44px instead of roomy 56–64px touch targets.
- **Dense Typography**: Text columns exceeded 75 characters; station cards had excessive micro-chips and duplicate codes.
- **Navigation Dead Ends**: After reaching a station, navigation back to other stops or express mode was inconsistent.

---

## 3. Implementation Plan by Phase

### Phase F1: Foundation, Tokens, Labels & Header
- Add relaxed spacing, button height tokens (56px / 64px), and 72px destination rows to `tokens.css` and `base.css`.
- Update all buttons to plain-language labels (`Skip the metro · see everything`, `Get my ticket`, `Go to the gate →`, `Scan ticket`, `Board the metro →`, `Next: X →`, `Back to start`, `All stops`).
- Build streamlined 4-item header with mobile full-screen modal menu.

### Phase F2: Simplified Journey Flow (Steps 0, 1, 2 & All Stops)
- Build full-screen **Welcome Screen** (Step 0) with explicit audio permission prompt (`Enter with sound`, `Enter without sound`, `Skip the metro · see everything`).
- Build **Choose a Stop** (Step 1): 40% passenger bio + 60% 7 roomy destination buttons (Achievements, Ghumify, All projects, Experience, Skills & tools, Education, Contact).
- Build **Your Ticket** (Step 2): Calm single ticket display with `Go to the gate →` and `Choose another stop`.
- Build **All Stops Sheet**: Clean slide-over/modal showing "Stops visited: X of 7" with Tap & Go quick jump.
- Remove redundant concourse map, separate platform screen, and interior ride view.

### Phase F3: Accessible Gate with Swipe Rail
- Redesign Fare Gate (Step 3) with a horizontal track rail.
- Implement smooth card swipe (>80% rail width validates gate) and prominent `Scan ticket` button for 1-click & keyboard access.

### Phase F4: Full-Screen Cinematic Metro Scene
- Build 100dvh fixed overlay with 4 distinct layers:
  1. Far wall with tile grid & subtle station signs.
  2. Architectural pillars & ceiling light strips.
  3. Platform floor with yellow tactile safety line & amber LED ticker.
  4. 4-car custom SVG metro train standing on tracks.
- Orchestrate entrance (0.3–2.3s, deceleration ease, pitch settle), door slide (warm #FFD98A interior), waiting state with centred `Board the metro →` button, door closing sequence, and rightward departure reveal (~0.9s).
- Provide instant `Skip animation` button and static reduced-motion card variant.

### Phase F5: Web Audio Synthesizer & Spatial Sound Engine
- Create `src/scripts/sound/metroSound.ts` with stereo panner (left -> centre -> right) and dynamics compressor.
- Synthesize low-frequency approach rumble, wheel clatter, brake squeal (2.6kHz -> 900Hz), pneumatic hiss, ding-dong chime (880Hz / 660Hz), door beeps (1kHz), and motor acceleration whine.
- Support local audio assets in `public/audio/` if present.

### Phase F6: Stop Screen, Bottom Bar, Polish & Verification
- Add slim station top bar ("You are at: Projects · Stop 3 of 7") and fixed bottom bar (`Next: X →`, `Back to start`, `All stops`).
- Polish Express Mode (long page) with clear hierarchy and sticky stops navigation.
- Run Lighthouse audits, contrast checks, keyboard navigation verification, and automated build tests.

