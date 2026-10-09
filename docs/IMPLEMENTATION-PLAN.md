# YouClean Website: Implementation Plan

_Status: **APPROVED** (architecture and direction) · Last updated: 2026-10-08 (CRM revision)_
_CRM revision: the CRM code has been reviewed (`AUDIT-REPORT.md` §H and §M), and decisions D1–D6 were approved on 2026-10-08 (`AUDIT-REPORT.md` §N). The CRM work plan is in §16. **CRM security work comes before website integration and before the visual redesign.**_
_Companion documents: [`../AUDIT-REPORT.md`](../AUDIT-REPORT.md)_

YouClean Laundry & Dry Cleaning is a real, operating local business. This plan builds the digital customer and business experience around it:

```
DISCOVER → CHOOSE → BOOK → PICKUP → CLEANING → QUALITY CHECK → DELIVERY → REORDER
WEBSITE  → BOOKING → CRM → OPERATIONS → CUSTOMER → RETENTION → REVENUE
```

**Order of priorities:** truth, then conversion, then SEO, then technical foundations, then visual polish.

---

## 0. Decisions on record

| Topic | Decision |
|---|---|
| Codebase | A **clean Next.js App Router** build. `redesign/` is legacy and is **not** continued. There is one production codebase in the end. |
| Brand | The existing **light** YouClean brand (`#003648` deep teal, `#00D17C` accent), with the existing tokens, logo and specs, executed with much more polish. No dark luxury styling. |
| Business truth | Nothing is invented. Unresolved values are config placeholders marked **BUSINESS INPUT REQUIRED** and are never shown as confirmed. |
| Phone / WhatsApp | **+91 8297779966** (preserved) |
| Lead destination (J → D2) | **Approved (D2):** once the CRM booking endpoint exists, the **CRM is the primary store** for website bookings. The Google Sheet and email notification are only a fallback or alert, behind the `LeadSink` abstraction. The Sheet is never the primary store. Until the endpoint is live, `/book` doesn't launch with the Sheet as its primary store. |
| Vercel plan (L) | Assume **Hobby**. No `.vercel/` project config exists in the repo to suggest otherwise. The plan doesn't change the architecture; see §9. |
| Booking intake (D1) | **Approved:** website bookings go into a CRM booking queue (`WebsiteBooking`). The website never creates customers or real orders; staff confirm and convert. |
| Reference (D4) | **Approved:** `WB-` prefix, numbered `WB-0001`, assigned by the CRM. Distinct from CRM order IDs (`YC-0001`). |
| CRM work order (D3, D6) | **Approved:** see §16. Security first. No git history rewrite without a separate approval. |
| CRM | The existing custom YouClean CRM is kept, with no replacement. **Corrected:** it runs on **PostgreSQL (Neon) through Prisma**, not Google Sheets (Sheets was only used for a one-off legacy import), and Supabase is unused. Integration still only happens against a confirmed contract, now proposed in `AUDIT-REPORT.md` §M2. |
| Membership / B2B | Future opportunities. Neither is presented as an existing product. _**Decided:** the CRM's four subscription plans are an operational capability, **not** a public website offer, until you confirm they're active (input N)._ |
| Referral (D5) | **Approved target:** the friend gets ₹100 off the first qualifying paid order (₹299 or more); the referrer gets ₹100 wallet credit after that order is delivered. The CRM's current logic (friend 5%) is **changed first and tested** (§16, step 7). The 5% offer is never advertised. `/refer` and any referral claims stay unpublished until it works. |

---

## 1. Phase 0: live static-site hotfixes (DONE locally, not yet deployed)

| Fix | Change |
|---|---|
| Fake referral stats | Removed the `.referral-stats` block ("Total earned: ₹300 • Pending: ₹100 • Referrals: 3") from `index.html`. |
| Misleading review | Removed the invented headline quote. The card title now reads "What a customer said on Google". The genuine review text is unchanged. |
| Exposed internal files | Added an **allowlist `.vercelignore`**, so only `index.html`, `prices.html`, `styles.css`, `tokens.css`, `script.js`, `prices.js`, `prices-data.js` and `assets/` are deployed. |

**Verify after the next production deploy:** these should return 404: `/CLAUDE.md`, `/specs/foundations/color.md`, `/scripts/token-audit.js`, `/redesign/SETUP.md`, `/data/drycleaning.csv`, `/index.html.save`, `/AUDIT-REPORT.md` and `/docs/IMPLEMENTATION-PLAN.md`. These should return 200: `/`, `/prices.html` and the assets.

**Known issues left on the live static site until cutover:**
- The referral section still contradicts itself (₹100 off vs 10% off).
- 12–48h vs 24–48h is still inconsistent.
- The "Rs 79+" claim and the per-kg prices are unconfirmed.

These were outside the approved Phase 0 scope. The new site replaces them.

---

## 2. Final project structure

```
/                                   (repo root = the Next.js app after cutover)
├─ app/
│  ├─ layout.tsx                    html/body, next/font (Fraunces + Manrope), Header, Footer,
│  │                                StickyBookBar, Analytics, site-wide JSON-LD
│  ├─ page.tsx                      Home
│  ├─ not-found.tsx  error.tsx
│  ├─ sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx
│  ├─ book/
│  │  ├─ page.tsx                   server shell + <BookingForm/> (the only significant client island)
│  │  ├─ actions.ts                 'use server': validate → submitBooking()
│  │  └─ confirmed/page.tsx         "Request received", reference, optional WhatsApp confirmation
│  ├─ services/
│  │  ├─ page.tsx                   services hub
│  │  └─ [slug]/page.tsx            generateStaticParams from content/services.ts (published only)
│  ├─ pricing/page.tsx              server-rendered price tables from content/pricing/*.csv
│  ├─ areas/
│  │  ├─ page.tsx                   areas hub (every known area listed)
│  │  └─ [slug]/page.tsx            only areas with publishPage: true and unique content
│  ├─ reviews/  faq/  about/  contact/
│  ├─ refer/                        built, but NOT published until the referral is confirmed (§6)
│  ├─ business/                     enquiry form only (Phase 3)
│  └─ policies/[slug]/page.tsx      privacy (Phase 2), terms / garment-care-and-liability / refunds
├─ components/
│  ├─ ui/        Button, LinkButton, Field, Select, Textarea, Checkbox, RadioCards,
│  │             Card, Chip, Tabs, Dialog, Accordion, PriceTable, VisuallyHidden
│  ├─ layout/    Header, MobileNav, Footer, StickyBookBar, Breadcrumbs, Container, Section
│  ├─ sections/  Hero, ServiceGrid, HowItWorks, TrustBlock, ReviewCard, VideoReview,
│  │             AreaList, MapEmbed, FAQ, CTABand
│  ├─ booking/   BookingForm, steps/*, BookingSummary, StepIndicator
│  └─ seo/       JsonLd
├─ content/                         ← the single source of business truth
│  ├─ business.ts                   NAP, hours, links, turnaround, express, min order, payments
│  ├─ services.ts  areas.ts  faqs.ts  reviews.ts  referral.ts  navigation.ts
│  ├─ pricing/
│  │  ├─ dry-cleaning.csv  steam-iron.csv  per-kg.csv
│  │  └─ README.md                  column definitions and the editing workflow
│  └─ policies/*.md
├─ lib/
│  ├─ facts.ts                      Fact<T>, isConfirmed(), listOpenInputs()
│  ├─ content/                      loaders + zod schemas (pricing.ts, services.ts, ...)
│  ├─ booking/
│  │  ├─ schema.ts                  BookingRequest (zod), the v1 contract
│  │  ├─ idempotency.ts             idempotency key (uuid); the WB-#### reference comes from the CRM (D4)
│  │  ├─ submit.ts                  orchestrates sinks, returns the result
│  │  └─ sinks/
│  │     ├─ types.ts                interface LeadSink
│  │     ├─ google-sheet.ts         interim (approved J)
│  │     ├─ email.ts                interim notification (approved J)
│  │     └─ crm.ts                  NOT implemented until contract §M2 is approved and the CRM route exists
│  ├─ analytics/                    track() facade + provider adapter (§9)
│  ├─ attribution.ts                UTM / ref / landing-page capture
│  ├─ whatsapp.ts                   prefilled message builders (single number from business.ts)
│  └─ seo.ts                        buildMetadata(), JSON-LD builders
├─ styles/
│  ├─ tokens.css                    moved unchanged from the root, then extended (§11)
│  ├─ base.css                      reset, typography, focus, reduced motion
│  └─ utilities.css                 container, visually-hidden, stack/cluster layout helpers
├─ public/
│  ├─ images/                       resized and re-encoded versions of the useful current assets
│  └─ logo.svg  favicon / icons
├─ scripts/
│  ├─ token-audit.mjs               fixed: repo-relative, scans styles/ + **/*.module.css
│  ├─ content-check.mjs             prints every BUSINESS INPUT REQUIRED item
│  └─ migrate-prices.mjs            one-off: legacy CSV → cleaned CSV (kept for traceability)
├─ specs/                           existing specs + new component specs (§11)
├─ docs/
│  ├─ IMPLEMENTATION-PLAN.md        this file
│  ├─ business-inputs.md            live tracker of items A–M
│  ├─ measurement-plan.md
│  ├─ crm-contract.md               booking payload v1 + questions for the CRM project
│  ├─ lead-sink-setup.md            Google Sheet + service account + email setup steps
│  └─ photography-brief.md
├─ legacy/static-site/              current static site, moved with git mv (never served)
├─ AUDIT-REPORT.md  CLAUDE.md  README.md
├─ next.config.ts  tsconfig.json  package.json  .gitignore  .env.example
```

**Stack:**
- Next.js 16.x (current stable 16.4), React 19, TypeScript (strict), Node 24
- CSS Modules plus global token CSS, with **no Tailwind**, so "tokens only" stays auditable
- `zod` for validation
- `@vercel/analytics` and `@vercel/speed-insights`
- **Not used:** animation libraries, smooth scrolling, UI kits, custom cursors, `unoptimized` images.

---

## 3. Migration strategy

1. **Phase 0** is on `main` (done locally; it deploys when pushed).
2. **All new work happens on the `next-site` branch.** Vercel gives a preview URL for every push. Production stays on the static site.
3. Early on that branch: `git mv` the static site into `legacy/static-site/` and `data/*.csv` into `legacy/data/`, then scaffold Next.js at the root.
4. Prices are migrated by `scripts/migrate-prices.mjs`, which produces the cleaned CSVs. Every row whose meaning is ambiguous comes out as `needs-confirmation`.
5. **Cutover PR** (`next-site` → `main`):
   - Set the Vercel Framework Preset to Next.js.
   - Remove the Phase 0 `.vercelignore` allowlist. Next.js only serves `public/` and routes, so it's no longer needed.
   - Add redirects (§8).
   - Delete `redesign/`, `index.html.save`, the root `package-lock.json` stub and the `.DS_Store` files.
6. **After launch:** monitor Search Console and analytics for 2–4 weeks, then delete `legacy/`. Git history keeps everything.
7. **Rollback:** Vercel Instant Rollback to the last static deployment.

`~/Documents/Youclean Website` (outside the repo) is left untouched. That's the user's decision.

---

## 4. Preserved vs archived

**Preserved:**
- **Contact and links:** phone/WhatsApp, `youclean.kompally@gmail.com`, the GBP link, `@youcleankompally`, the YouTube customer video and the Maps embed.
- **Brand:** `tokens.css` names and values, the logo and `specs/`.
- **Data and content:** price data (cleaned, never re-guessed), the six known areas, the service list, and the genuine Google review text (verbatim).
- **URLs and behaviour:** `/` (unchanged URL), `/prices.html` (308 to `/pricing`), and WhatsApp as the confirmation channel.

**Archived, then deleted:** the static site files, `prices-data.js` (a duplicate of the CSVs), the original CSVs, `index.html.save` and `redesign/`.

**Retired features:** the keyword chat widget, which is replaced by clear booking plus WhatsApp and phone, and the 1.6-second auto-redirect modal.

---

## 5. Routes and phasing

| Route | Phase | Publish condition |
|---|---|---|
| `/` | 2 | Always |
| `/book`, `/book/confirmed` | 2 | CRM booking endpoint live and the end-to-end test passed (§16, steps 6–8); privacy policy live |
| `/pricing` | 2 | Shows only `confirmed` rows; other rows show "Price on request" |
| `/services` | 2 | Always (hub) |
| `/services/[slug]` (8) | 3 | `published: true` and unique content written; `express` stays unpublished until input B |
| `/areas` | 2 (hub) | Lists the known areas |
| `/areas/[slug]` | 3 | `served` confirmed **and** `publishPage: true` with unique content (input D) |
| `/reviews`, `/faq`, `/about`, `/contact` | 2–3 | Contact shows the street address only after input C |
| `/policies/privacy` | 2 | Required before `/book` goes live (DPDP Act) |
| `/policies/terms`, `/refunds` | 3 | Content confirmed by the business |
| `/policies/garment-care-and-liability` | 3 | Input H |
| `/business` | 3 | Enquiry form only; no pricing or service claims |
| `/refer` | Held | Published only after the D5 referral model is implemented and tested in the CRM (§16, step 7) **and** you confirm it |
| `/membership` | Held | Not built, linked or in the sitemap until you confirm the CRM plans are active and publicly offered (input N) |
| `/track`, `/account` | 5 | Needs CRM order data |

Unpublished routes return 404, are excluded from the sitemap and are never linked.

---

## 6. Data models

### 6.1 Facts (the business-truth guard)
```ts
type Fact<T> =
  | { status: "confirmed"; value: T; source: string; confirmedOn: string }
  | { status: "needs-confirmation"; value: null; inputId: string; note: string };
```
- Components can only read a value through `isConfirmed()`. An unconfirmed fact renders a neutral fallback, such as "Ask us on WhatsApp", or nothing at all. It never renders a guessed value.
- JSON-LD builders leave out any unconfirmed fields.
- `npm run content:check` lists every open item as **BUSINESS INPUT REQUIRED** with its `inputId`. `next build` prints the same list as a warning.
- **Launch gate:** the cutover PR checklist requires reviewing this output.

### 6.2 `content/business.ts`
- **Confirmed:** name ("YouClean Laundry & Dry Cleaning"), phone, WhatsApp, email, GBP/Instagram/YouTube URLs, locality ("Kompally, Hyderabad").
- **`Fact`s:**
  - `streetAddress` (C), `geo` (C)
  - `openingHours` (I: the old site says 09:00–21:00, but that is unconfirmed)
  - `standardTurnaround` (A), `express` (B: turnaround and price rule)
  - `minimumOrder` (F), `paymentMethods` (G), `pickupWindows` (I)

### 6.3 `content/services.ts`
```ts
{ slug, name, summary, body, pricingModel: "per-kg" | "per-item" | "quote",
  priceListId?, includes[], excludes[], careNotes[], faqs[], image?, published }
```
The eight services are `wash-and-fold`, `wash-and-iron`, `dry-cleaning`, `steam-ironing`, `saree-care`, `shoe-cleaning`, `curtain-cleaning` and `express`.

### 6.4 `content/areas.ts`
```ts
{ slug, name, served: Fact<boolean>, publishPage: boolean, notes?: { landmarks, communities, pickupNotes } }
```
It is seeded with Kompally, Suchitra, Petbasheerabad, Bowenpally, Quthbullapur and Jeedimetla, each with `served: needs-confirmation` (input D).

### 6.5 Pricing (single source of truth)
```
id, service, category, item, price_inr, unit, status, legacy_price, notes
```
- **`status`:** `confirmed` or `needs-confirmation`.
- **`legacy_price`:** the unexplained "Price" column, kept for traceability but **never rendered** (input E).
- **Imported data:** the current "YouClean price" values come in as `needs-confirmation` until the business confirms the list. They can be bulk-confirmed in one step.
- **Hidden items:** the 5 items with a blank YouClean price stay `needs-confirmation` with `price_inr` empty.
- **Per-kg claims:** ₹90/kg and ₹120/kg go into `per-kg.csv` as `needs-confirmation`.
- **"Starting from" prices are always computed from confirmed rows.** No price appears hand-written in copy.
- **Build-time validation:** zod parses the CSVs at build time, and any invalid row fails the build.

**Data flow:**
```
content/pricing/*.csv → /pricing → service pages → booking estimates → (Phase 4) CRM sync
```
CSV opens in Google Sheets, so prices can be edited there and exported, and it's the natural format for a later CRM sync.

### 6.6 `content/reviews.ts`
Genuine items only, each with `source`, `url`, verbatim `text`, `author` (as shown publicly) and `rating: Fact<number>`. Stars are shown only once the rating is confirmed from the GBP listing.

### 6.7 `content/referral.ts`
```ts
{ operational: Fact<boolean>, friendReward: Fact<string>, referrerReward: Fact<string> }
```
Target model: ₹100 off for the friend and ₹100 wallet credit for the referrer. Nothing is rendered publicly until `operational` is confirmed.

---

## 7. Booking architecture

**Principles:**
- The booking exists in **our** lead store before WhatsApp is ever mentioned.
- No auto-redirects.
- It works without JavaScript.
- It is mobile-first.

**Form (`/book`):**
- It is one `<form>` posting to a **Server Action**, so it submits with JS disabled.
- With JS, it becomes a stepper:
  1. **Service:** radio cards. `express` appears only once input B is confirmed.
  2. **Items / quantity:** only for per-item services, picking from confirmed price rows. "Not sure, we'll count at pickup" is always allowed.
  3. **Name and mobile:** Indian mobile numbers, normalised to E.164.
  4. **Pickup address:** free text plus a landmark.
  5. **Area:** chosen from known areas, or "Other" (accepted and flagged `areaConfirmed: false`, never rejected).
  6. **Pickup slot:**
     - **While input I is unresolved:** a preferred date plus a free-text "preferred time" plus "We'll call/WhatsApp to confirm the exact time".
     - **When windows are confirmed:** selectable windows generated from `business.pickupWindows`, with no code change.
  7. **Estimate:** only when every selected item has a confirmed price. Otherwise "Final price is confirmed at pickup". Per-kg services always say "billed by weight at pickup".
  8. **Review:** a summary, the privacy notice and an optional checkbox for WhatsApp updates.
  9. **Submit.**
  10. **`/book/confirmed`:**
      - **Message:** "Booking request received · Ref WB-0001 · We'll confirm your pickup."
      - _`WB-` approved (D4). The CRM assigns the number from a Postgres sequence and returns it. If the CRM is unreachable, the page says "Request received, we'll confirm on WhatsApp" with no number; the CRM assigns it when the booking is replayed (decision B1)._
      - **Optional:** a **"Confirm on WhatsApp"** button with the reference prefilled, plus a call button.
- **Draft persistence:** `sessionStorage` (wrapped in try/catch).
- **Referral codes:** there's an optional field that is captured and attributed, with **no** promised discount until input K is confirmed.

**Server pipeline (`lib/booking/submit.ts`):**
1. **Validate:** zod `BookingRequest` v1.
2. **Protect against abuse:** a honeypot field, minimum time-to-submit, and a per-IP rate limit (best effort). Vercel BotID can be added if spam appears.
3. **Assign a reference:** a reference plus an idempotency key (a hidden field), so duplicates are ignored.
4. **Write to the primary sink.** Success means the booking is stored.
   - **Primary (D2):** the CRM's `POST /api/website/bookings`, with a 5 s timeout.
   - **Fallback or alert only:** the email (and optionally a Sheet row), with failed bookings replayed using the same idempotency key.
   - `/book` doesn't go live until the CRM endpoint is live and tested (§16, step 8).
5. **Notify:** the email notification is sent through `after()` so it doesn't slow the response.
6. **If the primary sink fails:**
   - the email is still attempted, with the full payload, as a backup record
   - the error is logged
   - the customer still gets a reference and a clear "please also confirm on WhatsApp" message, and the booking data is never lost silently

**`LeadSink` interface:**
```ts
interface LeadSink {
  name: string;
  submit(booking: BookingRecord): Promise<{ ok: true; externalId?: string } | { ok: false; error: string }>;
}
```
- **Sinks are configured in one place** (`lib/booking/sinks/index.ts`).
- **Replacing the Sheet and email with the CRM** later means adding `crm.ts` and changing configuration, with **no change** to the form, the action or the confirmation page.
- **The sheet's columns mirror the v1 payload**, so the CRM can read it directly or migrate it mechanically.

**Setup:** documented in `docs/lead-sink-setup.md`; all environment variables are server-only.

| Variable | Purpose |
|---|---|
| `GOOGLE_SHEETS_SPREADSHEET_ID` | The "Website Bookings" sheet |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_KEY` | The service account (the sheet is shared with this email as editor) |
| `BOOKING_NOTIFY_TO` | The YouClean business email |
| `EMAIL_PROVIDER_*` | **TECH INPUT REQUIRED:** Resend (needs DNS verification of `youcleanlaundry.in`) or Gmail SMTP with an app password |

---

## 8. SEO architecture

- **Base URL:** `metadataBase` is `https://www.youcleanlaundry.in`, and `buildMetadata()` gives every route a title, description, canonical, Open Graph and Twitter tags.
- **Crawler files:**
  - `app/sitemap.ts` is generated from content and includes only published routes.
  - `app/robots.ts` allows everything except `/book/confirmed` and `/api`, and links the sitemap.
- **JSON-LD:**
  - **Site-wide:** `DryCleaningOrLaundry` (a `LocalBusiness` subtype) with name, phone, URL, `areaServed` (confirmed areas only) and `sameAs` (GBP, Instagram, YouTube). `address`, `geo` and `openingHours` are added only once confirmed.
  - **Never** `aggregateRating`, `Review` or invented values.
  - **Per page:** `Service` on service pages, `BreadcrumbList`, and `FAQPage` where there's a real FAQ.
- **Rendering:** every marketing route is statically generated, and price tables are real HTML.
- **Redirects** (308, `next.config.ts`):
  - `/prices.html` → `/pricing`
  - `/index.html` → `/`
  - The bare domain → www: **change the Vercel domain redirect from 307 to 308** in the dashboard
  - Anchor links (`/#pricing`) can't be redirected server-side; they keep working on the home page
- **Content rules:**
  - semantic headings with one `h1`
  - descriptive alt text
  - internal links services ↔ pricing ↔ areas ↔ book
  - no keyword stuffing
  - no thin pages
- **Images:** `next/image` with explicit sizes and AVIF/WebP; the LCP image gets `priority`.
- **GBP (manual step):** set the website link to `https://www.youcleanlaundry.in/?utm_source=google&utm_medium=organic&utm_campaign=gbp`.
- **Post-launch:** submit the sitemap in Google Search Console.

---

## 9. Analytics architecture (Hobby-safe)

- **Facade:** a single `track(event, props)` in `lib/analytics/`. Components never import a vendor SDK directly. Switching providers changes one adapter file.
- **Now (Hobby):** Vercel Web Analytics for page views, referrers and UTM sources (cookie-less), plus Speed Insights for Core Web Vitals. On Hobby, custom events are not recorded, so the adapter can stay a no-op for events.
- **Conversion source of truth:**
  - The **booking record** stores `source`, first-touch and last-touch UTM, `landingPage`, `referralCode` and the CTA location that led to `/book` (passed as `?from=`).
  - That data comes from bookings, not from the analytics plan.
- **Later (no architecture change):** turn on custom events either by upgrading to Pro or by swapping the adapter to Plausible or Umami.
- **Attribution:** `lib/attribution.ts` stores `utm_*`, `ref` and the landing page in `localStorage`, with no cookies and no personal data.
- **Events defined now:** fully listed in `docs/measurement-plan.md`.

| Event | Fires when |
|---|---|
| `book_cta_click {location}` | Any "Book a pickup" button |
| `booking_started` | The booking form is first used |
| `booking_step {step}` | Each step of the stepper is completed |
| `booking_submitted` / `booking_failed {reason}` | The booking is sent / sending fails |
| `whatsapp_click {location}` / `phone_click {location}` | WhatsApp or phone links |
| `pricing_tab {service, category}` | Pricing page interactions |
| `service_view {slug}` / `area_view {slug}` | Service and area pages |
| `refer_share` / `refer_copy` | Referral actions (once `/refer` is live) |
| `b2b_enquiry_submitted` | A business enquiry is sent |

- **Abandonment:** `booking_started` minus `booking_submitted`, by the last `booking_step`. This needs an event-capable provider; until then the gap is documented.
- **Privacy:** events never contain names, phone numbers or addresses.

---

## 10. CRM integration boundary

_Revised from the CRM code. Full findings are in `AUDIT-REPORT.md` §H and the proposed contract in §M2._

| Website owns | CRM owns |
|---|---|
| Capture, validation, abuse protection, attribution, reference, customer confirmation, WhatsApp handoff | Customers, orders, operations, statuses, payments, referral codes and rewards, subscription plans, the booking queue and its conversion |

**Integration model (D1, approved):**
- The website server calls a **new** CRM route, `POST /api/website/bookings`. It's a server-to-server call with its own Bearer secret, an `Idempotency-Key`, and an optional HMAC signature.
- The CRM stores a **`WebsiteBooking`** intake record.
- Staff convert that record into a Customer and an Order. This mirrors how the CRM already handles WhatsApp subscription intents.
- The website **never** creates CRM customers or orders directly, and never reads CRM data.

**Booking payload v1:**
- The full schema is in `AUDIT-REPORT.md` §M2, and moves to `docs/crm-contract.md` in Phase 1. The Google Sheet columns mirror it.
- **Changes from the earlier draft:**
  - `ref` uses the `WB-` prefix.
  - `phone` is sent as 10 digits, which is how the CRM stores it.
  - `customer`, `address`, `pickup`, `consent` and `attribution` are nested objects.
  - Express is sent as `isExpress`, not as a service.
  - There's an explicit slug → CRM `LaundryType` mapping.

**Answers to the earlier CRM questions:**

| # | Question | Answer from the code |
|---|---|---|
| 1 | HTTP call or sheet ingest? | HTTP is feasible. The CRM already exposes authenticated server-to-server routes (`/api/whatsapp/*`), but **there's no website route yet**. Ingesting from a sheet isn't needed |
| 2 | Auth method | The existing pattern is a Bearer secret with a timing-safe compare. Use a separate `WEBSITE_CRM_API_SECRET`; HMAC + timestamp is recommended on top |
| 3 | Customer identity and deduplication | By phone, last 10 digits (`normPhone`). IDs are `C###` for customers and `YC-####` for orders. **There's no unique phone constraint and ID generation is race-prone**, so the CRM needs fixing first |
| 4 | Status values | Order: 14 statuses (`Pending` → … → `Delivered` / `Cancelled`) with enforced transitions. Pickup: `Pending / Scheduled / Picked Up / Rescheduled / Cancelled`. Payment: `Unpaid / Partial / Paid` |
| 5 | Is the CRM the price master? | **No.** It only has one default per service, copied from the website. The website CSVs stay the price source until the CRM has an item list |
| 6 | Referral codes and wallet | The CRM generates `YC` + 6 letters per customer and validates codes (staff only). The referrer gets ₹100 wallet credit on delivery of an order of ₹299 or more, and the friend 5%. `walletBalance` is a single number; there's no ledger beyond `referrals` rows |
| 7 | Rate limits, retries, errors | There's no rate limiting in the CRM today. The WhatsApp routes return `{success:false, error:{code,message}}`. The `Idempotency-Key` header is documented but **not implemented**, so the new route must enforce it with a unique column |

**CRM-side prerequisites (CRM repo, not this one; owner TBD, D3):**
1. **MUST:** Restrict Google sign-in. Today any Google account becomes `staff`, because `crm:lib/auth.ts` has no `signIn` callback.
2. **MUST:** Make customer and order ID generation race-safe, deduplicate phones, and add a unique normalised-phone index.
3. **MUST:** Add the `WebsiteBooking` model, the `source`/`area`/consent fields, the `POST /api/website/bookings` route and the "Website bookings" staff queue.
4. **SHOULD:** Remove `prisma/dev.db` (customer phone numbers) from git. Revoke the legacy Google service-account key and remove the Supabase leftovers.

**`crm.ts` isn't written until §16 steps 1–6 are deployed to the CRM.** The detailed order and file-level changes are in §16.

---

## 11. Design system architecture

- **Tokens:**
  - `styles/tokens.css` is moved unchanged and stays the single source, with its two layers (`ds`, `alias`) and current names.
  - **Additions only:**
    - an editorial type scale (display, h1–h4, body-lg, body, small) with mobile and desktop values
    - focus-ring tokens
    - `--size-touch-min: 44px`
    - form-state colours (error, success, disabled), each contrast-checked to WCAG AA
    - a narrow content width for readable text
    - neutral hairline border tokens
  - The odd sizes (`--space-14/18/22/26`) are kept and documented.
- **Token audit:**
  - `scripts/token-audit.mjs` is rewritten to be repo-relative and to scan `styles/` and every `*.module.css`.
  - It runs in `npm run lint` and in CI, so CLAUDE.md's **zero errors** rule becomes a gate.
  - Today's 45 legacy `styles.css` errors leave with `legacy/`, which is excluded from the scan.
- **Specs:** every new component gets a spec in `specs/components/` **before** it is built, as CLAUDE.md requires. New specs: form-field, radio-card, booking-step, sticky-book-bar, service-card, price-table, review-card, faq-accordion, breadcrumbs, dialog.
- **Visual direction:**
  - Deep teal for authority and structure; green only for primary actions and success, used sparingly.
  - Fraunces for display type, Manrope for body text, generous whitespace.
  - Restrained radius, hairline borders instead of heavy shadows, no gradients.
  - Real photography (see below).
  - Motion: CSS transitions of 200ms or less, only on interaction, and switched off under `prefers-reduced-motion`.
  - No scroll-triggered hiding: content is visible without JavaScript.
- **Mobile:**
  - Designed for 360px first, body text 16px or larger, tap targets 44px or larger.
  - A sticky "Book a pickup" bar that doesn't cover content, with WhatsApp as a secondary icon.
  - No floating chat.
- **Accessibility:**
  - Target WCAG 2.2 AA: semantic landmarks, a skip link, visible focus.
  - An accessible dialog and tabs, labelled fields with inline errors linked via `aria-describedby`.
  - Checked with axe and a manual keyboard pass for each phase.
- **Photography:**
  - `docs/photography-brief.md` lists the required real photos: storefront, team at work, tagging, quality check, packing, delivery, and real garments.
  - The current images are interim and are never captioned as YouClean's own facility (input M).

---

## 12. Deployment strategy

- Same Vercel project and domain, with previews for every branch push.
- **Environment variables:** server-only (`.env.example` lists them, `.env*` is git-ignored), set with `vercel env`.
- **Security headers** in `next.config.ts`:
  - `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`
  - a CSP allowing Google Maps, YouTube and Vercel analytics
  - HSTS is already on
- **Launch checklist (cutover PR):**
  - build passes; token audit at 0 errors; `content:check` reviewed
  - Lighthouse mobile on `/`, `/book`, `/pricing`; axe on every page type; a keyboard pass
  - a test booking reaches the sheet and the email arrives
  - redirects verified; sitemap and robots verified
  - internal paths return 404
  - Framework Preset set to Next.js
  - after launch: sitemap submitted, GBP link updated
- **Rollback:** Vercel Instant Rollback.

---

## 13. Phased delivery

| Phase | Scope | Exit criteria |
|---|---|---|
| **0** | Live hotfixes | Done locally; verify the 404s after the push |
| **1: Foundations** | Branch, `legacy/` move, Next.js scaffold, tokens and base styles, fixed token audit, `Fact` system plus `content/*`, price migration, zod schemas, layout shell (Header, Footer, StickyBookBar), SEO helpers, sitemap/robots/JSON-LD, analytics facade plus attribution, booking schema plus the `LeadSink` interface with Sheet/email adapters, docs (business-inputs, measurement plan, CRM contract, lead-sink setup, photography brief), new specs | The preview builds; audit at 0 errors; Lighthouse ≥ 95 for performance, accessibility and SEO on the shell; `content:check` lists the open inputs |
| **2: Core conversion** | `/`, `/book` (+ confirmed), `/pricing`, `/services` hub, `/areas` hub, `/policies/privacy`, `/contact` | A test booking lands in the sheet and email; no unconfirmed fact is rendered; mobile UX reviewed |
| **3: SEO content** | Service pages, genuine area pages, FAQ, reviews, about, the remaining policies, `/business` enquiry, `/refer` (if K is confirmed) | Unique content per page; schema validates; internal linking done |
| **Cutover** | Merge to `main`, redirects, delete legacy implementations | Launch checklist passes |
| **CRM-first (now, before Phases 1–3)** | §16 steps 1–5 in the CRM repo: staff allowlist, revoke the key, cleanup, untrack the DB, history report | Allowlist verified on a preview; secret rotated; report approved |
| **4: CRM** | CRM prerequisites (§10, items 1–3, in the CRM repo), then the `crm.ts` sink against contract v1; the Sheet/email become the fallback. Price sync is deferred until the CRM has item-level prices | D1–D3 approved; a test booking appears in the CRM queue; a replay with the same idempotency key creates no duplicate; spam can't create Customers or Orders |
| **5: Customer layer** | OTP accounts, `/track`, reorder, payments, membership, referral wallet, review requests | CRM order and status data available |

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Many facts unconfirmed at launch, making copy thin | `Fact` fallbacks; launch with confirmed facts only; `content:check` gate |
| SEO dip at cutover | `/` unchanged, 308s, Search Console monitoring, nothing removed without a redirect |
| Google Sheets API failure or limits | Email backup record, error logging, WhatsApp fallback shown with the reference |
| Spam bookings | Honeypot, timing check, rate limit, BotID if needed |
| No custom events on Hobby | Conversions recorded in booking data; the analytics facade lets the provider change later without code churn |
| Writing unique service and area content takes effort | Phase 3 scoped for it; nothing thin is published |
| No real photography | Brief now; interim images never captioned as our facility |
| Framework switch at cutover | Previewed on the branch; Instant Rollback |
| DPDP compliance | Privacy policy before `/book`, a consent checkbox, minimal data, retention stated |
| CRM integration is blocked on work in another repo | The `LeadSink` abstraction lets `/book` launch on the Sheet/email sinks; `crm.ts` is added later with no form changes |
| CRM staff access is open to any Google account (pre-existing) | Reported as a MUST fix in the CRM (§10, item 1); the website never sends data to the CRM until it's fixed |
| `.vercelignore` behaviour on Git deploys | Verified with curl right after the Phase 0 deploy; it becomes unnecessary after cutover |

---

## 15. BUSINESS INPUT REQUIRED (tracker → `docs/business-inputs.md`)

| ID | Needed | Rendered until resolved |
|---|---|---|
| A | Standard turnaround (12–48h vs 24–48h; per service?) | "We'll confirm your delivery time when we pick up" |
| B | Express: turnaround, price rule, eligible services | Express hidden from services and booking |
| C | Exact GBP street address + Place link + geo | Locality only ("Kompally, Hyderabad"); no `address` in schema |
| D | Confirmed served areas + which merit their own pages | Hub lists the known areas as "we serve Kompally and nearby; send your landmark to confirm"; no area pages |
| E | Confirmed prices; meaning of the "Price" column; 5 blank items; per-kg rates; check steam-iron trousers at ₹29 | "Price on request" for unconfirmed rows; no "from ₹X" claims |
| F | Minimum order value | Not mentioned |
| G | Payment methods and timing | Not mentioned |
| H | Garment damage/loss policy | Policy page not published; no liability claims |
| I | Pickup windows and operating days and hours | Preferred date + free-text time + "we'll confirm" |
| K | Is the referral operational today? | `/refer` not published; code field captured, no promise |
| M | Real photography | Interim images, not captioned as our facility |
| — | Review star rating confirmed from GBP | Review text shown, no stars in the new site |
| N | Are the CRM subscription plans (₹1,099–₹2,799/month) active and publicly offered? | No `/membership` page; no plan prices on the site |
| R1–R6 | **Decided** (§16, step 7). Still open: which of `WELCOME10`, `FLAT50`, `YOUCLEAN20` and `NEWUSER15` are real offers (BUSINESS INPUT REQUIRED) | No referral or promo claims |
| A1 / B1 | **Decided**: `create-admin` only; no invented reference when the CRM is down | — |
| H1 | **Approved in principle**; final commands pending your review (§16, step 5) | No rewrite |
| ENV | Approve the test database and the separate Preview variables (§16, step 0) | No CRM branch pushed |
| CRM | Stable CRM production URL (kept as the `CRM_BASE_URL` config value until confirmed); Neon data region, **verified in the Neon console**, not guessed (local evidence points to AWS us-east-1, which is unverified) | `crm.ts` not enabled; privacy policy not published |
| TECH | Email provider for notifications (Resend + DNS, or Gmail SMTP app password); Google Cloud service account for the sheet | `/book` not launched until configured |

---

## 16. CRM security and integration work plan

_Repo: `vimala03/v0-laundry-crm-design` (private). **Status: PROPOSED. Nothing has been executed.** Paths are relative to the CRM repo._

**Ground rules:**
- Each step gets its own branch and PR in the CRM repo, and is merged only with your approval.
- Nothing is deployed, and no Vercel or Google setting is changed, without a separate yes.
- No git history rewrite without approving step 5.
- NextAuth v4 callback details get checked against the v4 docs when the step is implemented.

### Step 0. Pre-checks: **DONE 2026-10-08** (read-only)

**Findings:**
1. **Which database do previews use?** **Production.** `DATABASE_URL` is one variable shared by Preview and Production, and Development has none.
2. **Can previews write to production?** **Yes.** GitHub auto-deployments are on, so any pushed branch builds a preview with the production `DATABASE_URL`. Old previews are behind Vercel Authentication, but they'd still run against production.
3. **Is there a safe test database?** **No.** There's no Neon integration, no separate database, and no staging environment.
4. **What tells environments apart?** Only `VERCEL_ENV`. Every app variable, including `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, is shared, so preview and production session cookies work interchangeably.
5. **Also confirmed:** production (`youcleanlaundry-crm.vercel.app`, public) offers Google sign-in, so the open-Google issue is live. The local `.env` database couldn't be checked (the read was blocked by a permission policy) and is treated as production.

**Step 0a procedure:** documented in [`CRM-TEST-ENVIRONMENT.md`](CRM-TEST-ENVIRONMENT.md) (2026-10-09). Nothing has been created yet.

**Required before any CRM branch is pushed** (your approval for each):
- **(a) Test database.** Create a test database with **no real customer data**: a Neon schema-only branch, or a separate Neon database, migrated with `prisma migrate deploy` and seeded with fake data.
- **(b) Separate Preview variables.** Split the shared variables so that Preview gets its own `DATABASE_URL` (pointing at the test database), `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
- **(c) Until then, don't push CRM branches**, or temporarily turn off automatic Git deployments for the CRM project.

**Original pre-check list (kept for reference):**
1. **Preview database:** in Vercel → CRM project → Settings → Environment Variables, check which `DATABASE_URL` the **Preview** environment uses. If it's the production database, create a Neon *branch* for Preview before any PR below is tested. Otherwise every preview test writes to production data.
2. **Neon region:** check it in the Neon console (Project → Settings). The local `.env` points to AWS `us-east-1`, but the production value couldn't be read. The privacy policy waits for this.
3. **Other clones:** confirm whether any other machines or tools hold a clone (needed for step 5).

### Step 1. Staff allowlist (CRITICAL): **COMMITTED LOCALLY as `5abcee1` on `security/staff-allowlist` (2026-10-09); not pushed, not deployed, migration not applied.** Open follow-ups: SEC-004 and SEC-005 (`SECURITY.md`)

**Verified:**
- `vitest`: 29 tests pass. They mock Prisma and never touch a database.
- `tsc --noEmit`: clean.
- `eslint`: 0 errors (the same 43 warnings as before).
- `next build`, run with `DATABASE_URL` pointing to an unreachable address: compiles, and `proxy.ts` is registered.

**Not yet verified:** a real sign-in in a running app. That needs the Step 0 test database.

**Change from the original design:** instead of rewriting all 34 guarded routes, the `jwt` callback **throws** for an unauthorised, inactive or revoked user. NextAuth (checked in v4.24.14 source) then clears the cookie, and `getServerSession()` returns `null`. Every existing `if (!session)` guard therefore denies access. The 14 `role || "staff"` fallbacks in 12 files were replaced with a strict `getSessionRole()`, which returns 403 when there's no role.

**Deploy order (each step needs your approval):**
1. Apply the additive migration `20261008000001_staff_allowlist` to production. It's backward compatible with the current code.
2. Make sure every Google-only staff member has a `users` row (`npm run create-admin`, Google-only mode), **before** deploying. Otherwise they're locked out.
3. Deploy.
4. Rotate `NEXTAUTH_SECRET`. This is recommended; legacy tokens are already re-checked immediately.
5. Review the audit log.

**Original design (kept for reference):**
**Design:**
- The `users` table becomes the **single allowlist** for both login methods.
- Google sign-in succeeds only for a **verified** Google email that matches an **active** `users` row. The RBAC env lists stop granting access.
- Roles come from the database and are re-checked every 5 minutes, so deactivating someone revokes their access within minutes.
- Sessions last 12 hours instead of NextAuth's 30-day default.

| File | Change |
|---|---|
| `prisma/schema.prisma` + new migration `…_user_allowlist` | `User`: add `active Boolean @default(true)`, `lastLoginAt DateTime?`; `passwordHash` gets `@default("")` so Google-only users can exist |
| `scripts/bootstrap-staff-allowlist.ts` (new, run once with approval) | Inserts `users` rows (no password, `active: true`) for the emails currently in `RBAC_ADMIN_EMAILS` / `RBAC_MANAGER_EMAILS`, with those roles. Reports any other Google staff you want to keep |
| `lib/auth.ts` | **`signIn` callback:** Google requires `profile.email_verified` and an active `users` row, otherwise `false` (AccessDenied). **`authorize`:** rejects inactive users and empty hashes. **`jwt`:** the role comes from the DB at sign-in, `uid` and `roleCheckedAt` are stored, the role is re-checked after 5 min, and a missing or inactive user sets `revoked`. **`session`:** no default role; revoked means no role. `session.maxAge = 12h`. `getRoleForEmail()`'s "everyone else is staff" default is removed. Login success and denial are audit-logged |
| `lib/auth.ts`: new `requireRole(min)` / `requirePageRole(min)` helpers | Return the session, or 401/403 (API) / redirect (pages). Missing role means unauthorized, never "staff" |
| 34 route and page files that call `getServerSession` (13 of them use `role \|\| "staff"`) | Switch to `requireRole`. The behaviour stays the same for allowed users |
| `proxy.ts` (new, Next 16) | Defence in depth: unauthenticated page requests → `/login`; `/api/*` → 401, except `/api/auth/*`, `/api/whatsapp/*`, `/api/webhooks/*` (and `/api/website/*` from step 6), which do their own auth |
| `app/api/admin/users/route.ts` | Create Google-only staff (no password); new `PATCH` to change role and active status; hashes are never returned; every change is audit-logged |
| `components/login-card.tsx` | AccessDenied message: "This Google account isn't authorised for YouClean CRM. Ask an admin." |
| `types/next-auth.d.ts` | `uid`, `roleCheckedAt` and `revoked` on the JWT |
| `lib/audit.ts` | New `"login-denied"` action |
| `package.json` | Adds `vitest` (dev) and an `npm test` script, with tests for: allowed, unknown, unverified, inactive, and revoked mid-session |

**After deploy (each needs your yes):**
- **Rotate `NEXTAUTH_SECRET`** in Vercel. This invalidates every existing session, including any obtained by unauthorised Google accounts.
- Run a **read-only query** for the distinct `audit_logs.actor_email` values and compare them with the allowlist. This shows whether any unknown account *changed* data. Reads by unknown accounts can't be detected, because logins weren't logged before this step.

**Decision A1 (approved):** recovery is through `npm run create-admin` only, with no env bypass. The script now prints the target database host and asks for confirmation before writing.

### Step 2. Revoke the Google service-account credential (you, plus Vercel env with approval)
1. **Google Cloud Console** → IAM & Admin → Service Accounts → the CRM account → Keys → **delete the key**. Optionally disable the account, and remove its access to the legacy Sheet. Only you can do this.
2. **Vercel:** remove `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` and `GOOGLE_SHEETS_ID` from every environment.
3. **Local:** delete those lines from `.env`, `.env.local` and `.env.local.vercel`.

No production code path uses the key (only the admin import does), so revoking it first is safe. No history rewrite is needed for it: the real key was never committed.

### Step 3. Remove obsolete code and configuration
| Action | Items |
|---|---|
| Delete (Sheets) | `lib/google-sheets.ts`, `app/api/admin/migrate/route.ts`, `scripts/import-sheet.ts`, `scripts/import-orders-csv.mjs` |
| Delete (deprecated stubs) | `app/api/admin/fix-customers/route.ts`, `app/api/referral/setup/route.ts` |
| Delete (Supabase, confirmed unused: no imports, no package) | `supabase/` (tracked: `config.toml`, `migrations/20260508120102_init_schema.sql`, `schema.sql`, `supabaseClient.ts`, `.gitignore`; untracked: `.temp/`) |
| `package.json` / lockfile | Remove the `googleapis` dependency and the `import:csv` and `import-sheet` scripts |
| `.env.example` | Remove the Google Sheets section |
| `lib/sheetUtils.ts` | Replace the **real customer name and phone** in the doc comment with an obviously fake one (`9000000000`) |
| Comments in `lib/services/*`, `lib/db.ts`, `lib/referral.ts`, `app/api/data/route.ts` | Correct "SQLite" / "Supabase" to "PostgreSQL via Prisma" (comments only) |
| Vercel env (approval) | Remove `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **Kept** | `/api/admin/import` (file import, admin only), `/api/backup`, the backup/restore/export scripts |

**Outside the repo (you):** the old Supabase *project* may still hold customer data from before the migration. Check it in the Supabase dashboard, export anything you need, then pause or delete the project.

### Step 4. Untrack the local SQLite database
- `git rm --cached prisma/dev.db prisma/prisma/dev.db`. The local files stay on disk.
- `.gitignore`: add `*.db`, `*.db-journal`, `*.sqlite`.
- **Local copies:** both files are stale SQLite snapshots (the project now uses Postgres) with customer data. I recommend moving them to encrypted storage, or deleting them once you've confirmed the Neon backups. That's your call.
- This stops tracking from now on; the history still contains the files (step 5).

### Sensitive local data: interim handling rule (decided 2026-10-09)
The CRM's local `backups/` and `exports/` folders hold unencrypted customer data (`.db`, `.json`, `.csv` and `.xlsx` copies).
- **Keep them for now.** They're part of the recovery plan.
- **Don't delete them** until the history cleanup (step 5) and a recovery plan are complete.
- **Treat them as sensitive.** They must never be committed (both folders are gitignored, and that was confirmed on 2026-10-09). Don't copy, upload, attach or share them, and don't move them to any other unencrypted location.
- **Required:** move them into encrypted storage (for example an encrypted APFS disk image) or otherwise restrict access to them, as part of the recovery plan.

### Step 5. Git history: findings and recommendation (no rewrite performed)
| Question | Finding |
|---|---|
| Is customer data in history? | **Yes.** `prisma/dev.db` and `prisma/prisma/dev.db` are in 7 commits (2026-06-27 → 2026-07-11; the latest has 204 customers with phone numbers, names and 18 addresses). `backups/2026-06-26/youclean-2026-06-26-2120.db` (204 phones) and `backups/pre-import/youclean-2026-06-27-022932.db` (18) were added in `7770e23` / `53f1e77` and deleted in `23b9ee2`, but are still in history. One real phone number and first name also sit in a code comment |
| Service-account key? | Not in history. Only a placeholder string was committed. **No rewrite needed** |
| Shared? | Private repo, 0 forks, only `vimala03` listed as a collaborator, **0 pull requests**, so GitHub holds no `refs/pull/*` pinning old commits. 14 remote branches (13 `feature/*` + `v0/vimalamdes13-…`) all carry the history |
| Third-party access | **Vercel** (clones for builds), **v0** (linked project with its own branch, so it has repo access), possibly Kiro (README clone link). Installed apps and webhooks couldn't be listed with the current GitHub token |
| Other clones | One on this Mac; others unknown (step 0.3) |

**Is a rewrite necessary?** It isn't strictly required (the repo is private, has one owner and no forks), but **I recommend it**. It's cheap right now (no PRs, no forks, one developer). Without it, every future collaborator, contractor, v0 sync or accidental change to public visibility would expose 204 customers' contact details. Deleting the files from the current branch doesn't remove them from history.

**Safe procedure** (runs only after a separate approval, and after steps 1–4 are merged):
1. **Freeze:** no pushes, and no v0 sessions open. Merge or delete stale `feature/*` branches first (your decision), since fewer refs means less to rewrite.
2. **Backup:** `git clone --mirror` to **encrypted** offline storage. This backup contains customer data; delete it after an agreed period (e.g. 30 days).
3. **Rewrite a fresh mirror clone** with `git filter-repo --invert-paths --path prisma/dev.db --path prisma/prisma/dev.db --path-glob 'backups/*.db'`, plus `--replace-text` to remove the real phone number from old versions of the comment.
4. **Verify:**
   - `git log --all -- <paths>` returns nothing, and a blob scan finds no `.db` objects.
   - `HEAD`'s tree matches the pre-rewrite `HEAD`, apart from the removed files.
   - `npm ci && npm run build` passes.
5. **Push:**
   - Temporarily allow force-push on `main` if branch protection blocks it.
   - `git push --force --all` and `git push --force --tags`.
   - Delete the remote branches that are no longer wanted.
6. **Re-clone every copy (don't pull):** this Mac, any other machine, and re-link v0 if needed. Any old clone that pushes again restores the data.
7. **Optional:** ask GitHub Support to purge cached objects and run garbage collection. That's low value for a private repo with no forks, but it's the documented complete step.

**Side effects:**
- Every commit SHA changes, so Vercel deployment → commit links and v0's link to the repo may break.
- Old Vercel deployments keep their built output. Delete old preview deployments if you want them gone.

**Decision H1 (approved, not executed).** Before execution:
1. Verify all local and remote branches.
2. Identify branches with unique work.
3. Create a clearly named backup or reference.
4. Confirm the exact commits and files to remove.
5. Confirm collaborators and clones.
6. Show you the final destructive commands for approval.

Merged branches aren't deleted until after the purge is verified.

### Step 6. Data integrity, then the website booking endpoint
**6a. Integrity (prerequisite):**
- Postgres **sequences** for customer IDs (`C###`), order IDs (`YC-####`) and booking references (`WB-0001`), each initialised from the current maximum. This removes the race on concurrent creates and the string-sort bug after C999.
- `validIndianMobile()`: exactly 10 digits, starting 6–9, used by every create path.
- A **read-only duplicate-phone report** against production. Staff decide on merges (a data change, needs approval). After that, a unique partial index on `phone`.

**6b. Endpoint** (contract in `AUDIT-REPORT.md` §M2; the CRM assigns `WB-####`):

| File | Change |
|---|---|
| `prisma/schema.prisma` + migration | `WebsiteBooking` model (§M2); `Customer.source`, `area`, `whatsappConsent`, `whatsappConsentAt`; `Order.source`, `websiteBookingId` |
| `lib/integrationAuth.ts` (new; `whatsappApiAuth.ts` reuses it) | Bearer check per integration secret (`WEBSITE_CRM_API_SECRET`, separate from WhatsApp), plus HMAC-SHA256 over `timestamp.body` with a ±5 min window, all timing-safe |
| `app/api/website/bookings/route.ts` (new, POST only) | 16 KB body limit → zod → idempotency (unique key; same body → 200 duplicate, different body → 409) → link an existing customer by phone, **read-only** → create the booking → audit (actor `website`) → `{ bookingId, ref, status }`. **Never returns customer data.** Per-key rate limit |
| `lib/services/websiteBookingService.ts` (new) | create, list, update status, `convertToOrder()` (creates the Customer if new + the Order with pickup date and time, referral code and `source: "website"`, in one transaction) |
| `app/api/bookings/*` (new, staff only via `requireRole`) | `GET` the list, `PATCH` the status (contacted, scheduled, cancelled, spam), `POST /[id]/convert` |
| `app/bookings/page.tsx` + `components/bookings/*` (new) | "Website bookings" queue with filters, detail view and Convert. Sidebar link |
| Tests | Contract, idempotency, auth, HMAC, rate-limit and conversion tests |

### Step 7. Referral model (D5), in parallel with step 6 once step 1 is done
**Changes:**
- **Schema:**
  - `Order`: add `subtotalAmount`, `discountAmount`, `discountCode`, `discountType`.
  - `Referral`: unique `refereeId` (one reward per friend) and unique `orderId`.
  - New `WalletTransaction` ledger (`customerId`, ± amount, reason, `orderId?`, `referralId?`, actor). `walletBalance` stays as a cached total, updated in the same transaction. Existing balances are migrated as opening entries.
- **`app/api/coupons/validate/route.ts`:**
  - Referral code → **flat ₹100**, valid only for a customer with **no prior non-cancelled orders**, and not their own code.
  - Returns `minOrder: 299`.
- **`app/api/orders/route.ts`:**
  - The server **recomputes** the discount and ignores the client's `couponDiscount`.
  - Enforces the minimum order and one discount per order, and stores the subtotal and discount.
- **`lib/referral.ts`:** reward on the friend's first qualifying order once it's **Delivered and Paid**. A conditional `updateMany(rewardStatus: "pending")`, the `Referral` row and the `WalletTransaction` all go in **one transaction**, so it's idempotent.
- **Reward triggers:**
  - the status route and order PATCH (already there)
  - **bulk-status** (missing today)
  - **payments POST**, for an order that becomes Paid after delivery
- **`/api/referral/process`:** GET → POST, admin only.
- **Wallet redemption** (new; without it the credit has no value): staff apply wallet credit on an order, capped at the balance and the order amount, which writes a debit entry.
- **`create-order-dialog.tsx`:** shows ₹100 off, the minimum-order message and "apply wallet credit".
- **Tests:** unit tests for eligibility and rewards, plus scenarios on the Neon test branch:
  - a new friend's ₹299 order → reward
  - a ₹298 order → no reward
  - an existing customer using a code → rejected
  - a self-referral → rejected
  - delivered but unpaid → no reward until it's paid
  - double delivery or concurrent updates → only one credit
  - a bulk-status change to Delivered → reward

**Referral decisions (approved 2026-10-08):**
- **R1:** the ₹299 minimum is measured before the discount.
- **R2:** the order must be fully paid.
- **R3:** the friend must be genuinely new.
- **R4:** wallet credit applies to future eligible orders, capped at **20% of order value**. It's never paid out as cash, it's kept in a ledger, and it can't go negative. All of these rules live in **one config module** (`lib/referral-config.ts`), not scattered through the code.
- **R5:** no reward cap. Instead: full audit records, duplicate, self-referral and same-order protection, plus basic abuse checks (e.g. the same phone or address used for several "new" customers is flagged for staff).
- **R6:** no stacking with other promos, and the server alone calculates the discount. The four hardcoded promo codes are marked **BUSINESS INPUT REQUIRED** until confirmed.

**Original options table (kept for reference):**

| ID | Question | Recommendation |
|---|---|---|
| R1 | Is ₹299 measured before or after the ₹100 discount? | Before (the subtotal) |
| R2 | "Paid" means fully paid? | Yes; the reward fires when the order is both delivered and paid, whichever happens last |
| R3 | Is the friend new customers only? | Yes (no prior non-cancelled orders) |
| R4 | Wallet redemption rules: any order, a cap per order, expiry? | Any order, up to the order amount, no expiry at first |
| R5 | A cap on rewards per referrer? | None at first; monitor |
| R6 | The static promos (`WELCOME10`, `FLAT50`, `YOUCLEAN20`, `NEWUSER15`): keep them, and can they stack? | Confirm which are real; no stacking |

`/refer` stays unpublished until these tests pass and you confirm.

### Step 8. Website integration (website repo)
- **`lib/booking/sinks/crm.ts`:** the primary sink (D2).
  - **Config:** `CRM_BASE_URL` stays a config value until the production URL is confirmed; the secret and HMAC key are server-only env.
  - **Calls:** server only, never from the browser; 5 s timeout.
- **Fallback:** email alert (plus an optional Sheet row) with the idempotency key; a replay job resends to the CRM.
- The website never connects to the CRM database and never reads CRM data.

### Step 9. End-to-end test before any production deploy
Run on a CRM preview + a website preview, both pointed at a **Neon test branch** without real customer data:
- a booking with JS on and off
- a duplicate submit
- the CRM down (fallback, then replay)
- a bad secret or signature (401)
- an expired timestamp
- rate limiting
- spam with the honeypot filled
- staff conversion creates exactly one customer and one order
- no customer data in any response
- an unauthorised Google account is denied
- the referral scenarios from step 7

Production deploys follow the step order, each with your approval.

---

## 17. Change control, cost review and execution sequence (2026-10-09)

**Companion documents:**
- [`DECISIONS.md`](DECISIONS.md): append-only decision log
- [`CHANGELOG.md`](CHANGELOG.md): what changed
- [`SECURITY.md`](SECURITY.md): findings register with SEC, ENV and DATA IDs
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`DATA-MODEL.md`](DATA-MODEL.md)
- [`CRM-TEST-ENVIRONMENT.md`](CRM-TEST-ENVIRONMENT.md), including the §7 corrections

### 17.1 Change-control rule (E5)
**PLAN → IMPLEMENT → TEST → REVIEW DIFF → UPDATE DOCS → COMMIT → VERIFY GIT STATUS → only then consider a push or deploy, with explicit approval.**

Every meaningful change gets:
- one purpose
- a decision or finding ID
- one focused commit
- tests
- rollback notes in `CHANGELOG.md`

Never mix these in one commit: security, data cleanup, infrastructure, booking API, website redesign, referral logic.

### 17.2 Cost review
| Item | Required? | Free tier enough? | Expected monthly cost | Alternative | Why preferred |
|---|---|---|---|---|---|
| Neon TEST project | Yes (ENV-001/003) | Expected yes (tiny synthetic database); **confirm the account's current free-plan project limits** | ₹0 expected | A Neon branch (rejected: copies data or breaks migrations); local Docker Postgres (no Preview support) | Strongest isolation at no cost |
| Vercel Preview variable split, Ignored Build Step | Yes | Yes (available on every plan) | ₹0 | — | Built-in |
| Vercel plan for the CRM | **Verify** (ENV-007) | Hobby is for non-commercial use under Vercel's terms | Pro is about US$20 per member per month, **only if** you decide it's needed | — | Compliance question; no purchase without approval |
| Google OAuth test client | Optional | Yes | ₹0 | Test password logins only | Tests the SEC-001 fix end to end |
| Rate limiting (SEC-006) | Yes, before the booking endpoint | Yes (a Postgres table) | ₹0 | Upstash (free tier), Vercel Firewall rules | No new vendor |
| Encrypted storage for backups/exports (E1) | Yes | Yes (macOS encrypted disk image) | ₹0 | — | No new vendor |
| Password manager entries | Yes | Use your existing one | ₹0 | — | — |
| `vitest` | Yes | Open source | ₹0 | — | Already added in `5abcee1` |
| Paid monitoring, auth, analytics or databases | **No** | — | — | — | Not needed (cost-control rule) |

### 17.3 Proposed commit sequence (each one focused; none pushed without approval)

**CRM repo** (status 2026-10-09 overnight: ✅ = **committed locally on `security/staff-allowlist`, NOT pushed, NOT deployed**):
1. ✅ `5abcee1` fix: secure CRM staff authorization
2. ✅ `9e82fe9` fix: preserve existing CRM user roles (SEC-004, SEC-005)
3. ✅ `b2728c9` fix: block non-production environments from production database, and ✅ `0b02cf4` feat: add CRM test environment marker (committed separately; P-01, C-1, C-2)
4. ✅ `6e04c28` test: add guarded synthetic CRM seed (E4, C-3)
   - ✅ `bff469b` feat: enforce approved referral and wallet rules (D5, R1–R6, SEC-008, SEC-009). Pulled forward from item 10; its own series
   - ✅ `a13fca8` chore: guard Prisma CLI database commands
5. chore(data): remove the real-data arrays from `lib/data.ts` (keep types and constants); remove the legacy `scripts/seed.ts` (DATA-001), separate from 4
6. chore(security): remove the Sheets code, Supabase folder, deprecated stubs and `debug/sheet`; scrub the real phone from the `sheetUtils` comment (D6, SEC-010, DATA-004)
7. chore(repo): untrack `prisma/*.db`, gitignore `*.db`; track a scrubbed `.env.example` (D6, E2, C-8)
8. fix(api): generic error responses (SEC-007); fix(ui): no role fallback in the sidebar (SEC-011)
9. feat(security): Postgres rate limiter for login and integrations (SEC-006)
10. (later, per §16) integrity sequences and phone dedupe (SEC-014), booking queue (`BOOKING-API-CONTRACT.md`): each its own series. Referral model: done (`bff469b`)

**Website repo:**
- docs: commit `AUDIT-REPORT.md` and `docs/*` (they're currently **untracked**, so a lost working copy loses them)
- Phase 0 hotfixes (`index.html`, `.vercelignore`) as their own commit

### 17.4 Execution sequence (none executed)
| Step | What | Touches production? | Approval |
|---|---|---|---|
| 0 | Documentation and change-control verification | No | Review these docs |
| 1 | Finalise the security branch (commit 2 above) | No | Approve commit 2 |
| 2 | Synthetic seed system (commits 4–5) | No | Approve the data plan (§17.5) |
| 3 | Environment safety guard (commit 3) | No | Approve P-01 |
| 4 | Create the Neon TEST project | No (new project) | **Explicit** |
| 5 | `prisma migrate deploy` to TEST only | No | **Explicit** |
| 6 | Seed synthetic data into TEST only | No | **Explicit** |
| 7 | Configure Vercel Preview with TEST credentials (+ freeze first) | Project settings: yes. Production values: no | **Explicit** |
| 8 | Verify Preview can't reach Production (V1–V10) | Read-only | **Explicit** (first push of a test branch) |
| 9 | Security and referral test suite on Preview | No | **Explicit** |
| 10 | Review the production credential rotation plan (C-4, C-5) | No | Review |
| 11 | Rotate the production database password in its own window | **Yes** | **Explicit** |
| 12 | Verify Production | Read-only | — |
| 13 | Lift the Preview freeze | Project settings | **Explicit** |
| 14 | Build the website booking → CRM queue (§16 step 6) | No (until deploy) | **Explicit** |
| 15 | Continue the website redesign | No | **Explicit** |

**Where the Step 1 production deploy fits:** after step 9 (tested on Preview), in its own window, before step 11. It needs: the migration applied to production, the Google staff rows created, and `NEXTAUTH_SECRET` rotated. Each of those is explicitly approved.

### 17.4a Next action
See [`TOMORROW-EXECUTION-CHECKLIST.md`](TOMORROW-EXECUTION-CHECKLIST.md). Every remaining step needs external infrastructure or approval.

### 17.5 Synthetic data plan
The proposed data set, its guards and conventions are in `CRM-TEST-ENVIRONMENT.md` §4, with corrections C-3, C-9 and C-10. Referral and wallet scenarios that need step 7 schema fields (subtotal, ledger) are seeded **after** that migration exists: seed v1 covers the current schema, seed v2 extends it.
