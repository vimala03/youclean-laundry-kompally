# YouClean Premium Redesign — Setup

## Quick start

```bash
cd redesign
npm install
npm run dev
```

Open http://localhost:3000

## Before launching

1. **WhatsApp number** — update in `lib/utils.ts`:
   ```ts
   const phone = "91XXXXXXXXXX"; // your actual number
   ```

2. **Phone number** — update in `components/sections/CTASection.tsx` and `components/Footer.tsx`:
   ```html
   href="tel:+91XXXXXXXXXX"
   ```

3. **Images** — already symlinked from `../assets/` via `public/assets/`

## Tech stack

| What | Library |
|------|---------|
| Framework | Next.js 14 App Router |
| Styles | Tailwind CSS 3 |
| Scroll | Lenis 1.x (smooth scroll) |
| Animations | GSAP 3 + ScrollTrigger |
| Motion | Framer Motion 11 (component level) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts via next/font) |

## Architecture

```
app/
  layout.tsx      — fonts, metadata
  page.tsx        — renders SiteWrapper
  globals.css     — design tokens + CSS utilities

components/
  SiteWrapper     — Lenis init, GSAP init, composes page
  CustomCursor    — custom cursor (dot + ring, morphs on hover)
  Navigation      — sticky nav, hide-on-scroll, mobile menu
  Footer          — links, WhatsApp CTA

  sections/
    HeroSection       — staggered headline, floating garment, stats
    ServicesSection   — 6 service cards with 3D tilt hover
    GallerySection    — editorial photo grid with parallax
    ProcessSection    — GSAP horizontal scroll (pinned journey)
    PricingSection    — tab toggle, animated price numbers
    TrustSection      — stat strip + 4 pillar cards
    CTASection        — full-screen CTA with pulse rings

  ui/
    MagneticButton    — magnetic hover effect, fill animation
    ServiceCard       — 3D tilt, reveal-on-hover detail
    GarmentSVG        — animated SVG shirt (draw, float, steam, sparkles)

hooks/
  useLenis        — Lenis smooth scroll setup
  useCursor       — (reserved for global cursor state)
```

## Design tokens

| Token | Value |
|-------|-------|
| Ink (bg dark) | `#0A0908` |
| Parchment (light) | `#F4EFE6` |
| Mist/accent | `#00C97A` |
| Sage deep | `#0D2B1F` |
| Sage mid | `#1A4B35` |
| Stone | `#6B6B65` |
| Display font | Cormorant Garamond 300/400/600/italic |
| Body font | DM Sans 300/400/500 |

## Animation system

### Entry animations
- All sections: `gsap.fromTo` with ScrollTrigger `start: "top 80%"`, `once: true`
- Stagger: 0.1–0.15s between siblings
- Easing: `power3.out`

### Scroll animations
- Process section: GSAP pin + horizontal scrub
- Gallery images: parallax `yPercent: -15` scrub

### Cursor
- Default: 8px dot + 40px ring (1px border, rgba white 50%)
- Hover: dot turns mist green, ring expands to 56px
- CTA hover: ring expands to 80px, border turns mist, shows label

### Lenis config
- Duration: 1.2s
- Easing: expo out (`1 - 2^(-10t)`)
- Wheel multiplier: 0.9
