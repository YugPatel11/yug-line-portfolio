# AUDIT.md — Initial Project Audit for "The Yug Line"

Audited on: 2026-11-12
Specification: One Who Codes 2026 Portfolio Challenge

---

## 1. Compliance Audit Against Non-Negotiable Rules

| Area | Status | Findings |
| :--- | :--- | :--- |
| **No Blurs / Glassmorphism** | ⚠️ Fix Required | `src/pages/index.astro` line 22 used `bg-paper/90 backdrop-blur-md`. Needs replacement with solid `bg-paper` and `border-b-2 border-ink`. |
| **No Gradients / Glows** | ⚠️ Cleaned | Ensure all backgrounds are 100% flat tokens without opacity layering that simulates translucent glass. |
| **sample.html Reference File** | ⚠️ Action Required | `sample.html` is in the working tree. Must be removed from git tracking and ignored in `.gitignore` to avoid build overhead. |
| **Heading Hierarchy** | ⚠️ Fix Required | Station headers currently jump levels in some components. Must follow strict `h1` (passenger name) -> `h2` (station names) -> `h3` (subsections). |
| **Landmarks & ARIA** | ⚠️ Improvement Needed | Need explicit `<main id="main-content">`, `<header role="banner">`, `<nav aria-label="...">`, and `<section aria-labelledby="...">` landmarks. |
| **Reduced Motion** | ⚠️ Action Required | Needs full `prefers-reduced-motion` media queries and an in-page motion toggle switch. |
| **Bottom-Right Corner Free** | ✅ Pass | Viewport bottom-right has no fixed buttons/widgets; clear for hosting badge. |
| **Contrast Ratios (WCAG AA)** | ✅ Pass | All ink/paper pairs exceed 15:1; secondary text exceeds 7.5:1. |
| **No Trackers / Secrets** | ✅ Pass | Zero external tracking scripts, zero secrets, zero analytics. |
| **Dependencies & Licences** | ✅ Pass | Only Astro, Tailwind, GSAP, and Fontsource (all free/open-source). |

---

## 2. Immediate Fix Plan (Phase P0)
1. **Fix (e)**: Remove `sample.html` from git tracking and add to `.gitignore`. Commit separately.
2. **Fix (a) & (b)**: Remove `backdrop-blur-md` and opacity from `<header>`. Use solid `bg-paper border-b-2 border-ink`. Commit separately.
3. **Fix (c)**: Restructure headings (`h1` -> `h2` -> `h3`), assign proper ARIA landmarks across all stations. Commit separately.
4. **Fix (d)**: Clean up any unused styles or redundant classes. Commit separately.
5. **Verify**: Run `npm run build` to confirm a clean build output.
