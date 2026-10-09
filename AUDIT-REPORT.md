# YouClean Website Audit

_Audit date: 2026-10-08 · Repo commit: `d3bde4d` (main)_
_Revised 2026-10-08: section 0, section H, question 1 and the new section M were rewritten after a read-only review of the CRM repository (`vimala03/v0-laundry-crm-design`, private, commit `ee72715`)._
_Revised again 2026-10-08: decisions D1–D6 were approved (section N), and §M2, §M2.5 and the questions were updated to match. The CRM work plan is in `docs/IMPLEMENTATION-PLAN.md` §16._

This audit is read-only: no files were changed. It covers every source file, the specs, CLAUDE.md and the git history, plus checks of the live site at www.youcleanlaundry.in. Lighthouse and real-device tests were not run, so the performance and mobile findings come from reading the code, not from field data.

The CRM review covered its code, Prisma schema, migrations, environment variable *names* and git history. No CRM code was run, its production database and deployment were not contacted, and no CRM file was changed.

**Tags:** **MUST FIX** · **SHOULD IMPROVE** · **FUTURE OPPORTUNITY**

---

## 0. What actually exists

| | Live site (repo root) | `redesign/` folder |
|---|---|---|
| Stack | Static HTML/CSS/vanilla JS on Vercel | Next.js 14.2.5, Tailwind, GSAP, Lenis, Framer Motion |
| Pages | `index.html` (one-page with anchor links), `prices.html` | One page, every component `"use client"` |
| Status | **In production** (live HTML is byte-identical to `index.html`) | Never installed, built or deployed |
| Design | Follows `tokens.css` and `specs/` (light teal/mint, Fraunces + Manrope) | Ignores both: dark "luxury" theme, Cormorant + DM Sans, hardcoded hex values |

**Other things found:**
- **A second copy of the repo** is at `~/Documents/Youclean Website`, sitting at the older commit `b86dbc9`.
- **The token audit checks the wrong folder.** `scripts/token-audit.js:5` hardcodes the path to that second copy, so it has never checked this repo. Pointed at this repo, it finds **91 errors** (45 in `styles.css`, 46 in `redesign/app/globals.css`). The CLAUDE.md "zero errors" rule is not currently met.
- **No CRM code, API routes, backend, database or env config exists in this repo.** ~~The CRM could not be found locally.~~ **Corrected:** the CRM is a separate repo at `~/Documents/Youclean CRM/v0-laundry-crm-design`. It is a Next.js 16 app on Vercel with a PostgreSQL database (Neon, through Prisma). Section H is now based on its actual code; section M lists the earlier assumptions that turned out to be wrong.

---

## A. What already works
- WhatsApp-first booking with a prefilled message. This matches how local customers prefer to book.
- The price catalog has 240 dry-cleaning and 285 steam-iron items across 7 categories. It renders from data rather than hand-written HTML.
- Real trust assets: a Google Business Profile link, one genuine Google review, a YouTube customer video, Instagram, and a Maps embed.
- A token system (two layers, `ds` and `alias`) with component specs. It's a good base to build on.
- The site is light: no framework, text-based LCP, and lazy-loaded images and map. Speed is probably fine today.
- HTTPS, HSTS and the Vercel CDN in Mumbai (bom1).
- Basic accessibility is in place: `lang`, labelled form fields, `aria-expanded` on the menu, `:focus-visible` styles and a reduced-motion rule.

## B. What should be preserved
- **The business number** (+91 8297779966), the email, the GBP link and `@youcleankompally`.
- **Price data**: `data/*.csv` is the only source of item-level prices.
- **Brand look**: the `tokens.css` palette (brand `#003648`, accent `#00d17c`), the logo and the specs folder.
- **Kompally positioning** and the service-area list.
- **The WhatsApp handoff**, kept as the final confirmation step rather than as the only record of a booking.
- **Existing URLs**: `/` and `/prices.html` may already be indexed and linked from GBP and Instagram, so they need 301 redirects if they move.

## C. Critical problems

| # | Issue | Evidence | Tag |
|---|---|---|---|
| C1 | **Fake referral stats shown to every visitor**: "Total earned: ₹300 • Pending: ₹100 • Referrals: 3" | `index.html:437` | **MUST FIX** |
| C2 | **The referral offer contradicts itself.** It says "₹100 OFF" in one place and "10% off" in another. Everyone gets the same code, `YOUCLEAN100`, so you can't tell who referred whom. The `?ref=` parameter is never read. | `index.html:421, 457, 468, 471`; `script.js:446-447` | **MUST FIX** |
| C3 | **The review card is misleading.** Its headline quote ("Fast pickup, neatly folded…") is labelled as a Google review but isn't the review's actual text. The real review says "within an hour", which conflicts with the 12–48h promise. | `index.html:353-358` | **MUST FIX** |
| C4 | **Delivery time differs across the site.** It says 12–48h in the hero and steps, but 24–48h in the FAQ, on the price page and in the meta description. The redesign adds "24h typical". | `index.html:7, 334`; `prices.html:91` | **MUST FIX** |
| C5 | **Price claims don't match the data.** "Dry clean from Rs 79" doesn't match the catalog (items start at ₹19, a shirt is ₹95). The per-kg prices (₹90 and ₹120) don't appear in any data file. Five items are silently hidden because their YouClean price is blank. 47 items have a "YouClean price" higher than the "Price" column. Steam-iron trousers are ₹29 against ₹55 for a shirt, which needs checking. | `data/drycleaning.csv`, `prices.js:60-68` | **MUST FIX** (confirm the true prices) |
| C6 | **The homepage measures nothing.** Vercel Analytics was removed from `index.html` in commit `491d3e0` and only remains on `prices.html`. No conversion events fire anywhere; the `data-whatsapp-cta` attributes are never read. You currently can't measure any business outcome. | `git show 491d3e0` | **MUST FIX** |
| C7 | **No booking is ever recorded.** A booking only exists if the customer presses Send inside WhatsApp, so abandoned bookings are lost with no lead record. | `script.js:315-351` | **MUST FIX** (in the rebuild) |
| C8 | **Broken HTML.** The `#gallery` section is never closed, so `#services` sits inside the gallery's container. The footer's container `<div>` is also never closed. | `index.html:136-157, 543-566` | **MUST FIX** |
| C9 | **The whole repo is publicly served.** `CLAUDE.md`, `specs/`, `scripts/`, `redesign/SETUP.md`, `data/*.csv` and `index.html.save` all return 200. `index.html.save` is a duplicate homepage that Google can index. | Checked with curl on the live site | **MUST FIX** |
| C10 | **The `redesign/` folder isn't safe to ship.** It uses a placeholder phone number (`919876543210`, which may belong to a real person). It shows invented stats ("500+ orders", "4.9★", "24h"). It lists different service areas. Its assets folder is a symlink to an absolute path on this Mac (`/Users/vimala/...`), which breaks on any other machine or on Vercel. | `lib/utils.ts:15`; `TrustSection.tsx:6-9`; `public/assets` | **MUST FIX** before it is reused |

## D. UX and conversion problems
- **MUST FIX:** The booking modal redirects to WhatsApp automatically after 1.6 seconds (`script.js:22`). That's too fast to read the preview, and it feels like a hijack.
- **MUST FIX:** The "Express Delivery ⚡" button sends the generic booking message, not an express request. Its tracking label is a typo ("Hero Whpp NowatsA").
- **SHOULD IMPROVE:**
  - "Preferred time" is free text, and nothing checks whether the customer is in a serviceable area.
  - There's no minimum order value, no payment info (UPI or cash), and no damage or lost-item policy. These are the biggest objections for premium garments.
  - The desktop nav has 7 links plus the CTA, and "Trust" and "Why us" overlap.
  - The chat widget is a keyword bot. Customers will expect a person to answer.
  - The trust section has no team photos, real facility or process photos, or real numbers. All the photos look like stock.
  - The FAQ has only 3 questions.
- **FUTURE OPPORTUNITY:** A price estimator with a basket, reordering, booking a recurring pickup slot, and membership upsell after booking.

## E. SEO problems
- **MUST FIX:**
  - `robots.txt` and `sitemap.xml` both return 404.
  - There is no canonical tag, no Open Graph or Twitter tags, and no `LocalBusiness`/`DryCleaningOrLaundry` structured data (no address, geo, opening hours, phone or rating data).
  - `youcleanlaundry.in` redirects to `www` with a **307 (temporary)** instead of a 308 or 301.
  - The real street address isn't on the site anywhere; it only says "Kompally, Hyderabad". Name, address and phone need to match the GBP listing exactly.
- **SHOULD IMPROVE:**
  - The whole site is one page with anchor links, so services and areas can't rank on their own. You need dedicated pages such as "dry cleaning in Kompally", "saree dry cleaning Hyderabad" and "laundry in Suchitra".
  - The price catalog is rendered by JavaScript from an 84 KB file, so its content is weak for crawlers.
  - There's no FAQ structured data.
  - The `.html` extensions should become clean URLs.
- **FUTURE OPPORTUNITY:** Area landing pages with unique content, a fabric-care guide or blog, and syncing reviews from GBP.

## F. Technical problems
- **MUST FIX:**
  - Three overlapping implementations: the live site, `redesign/`, and the second repo copy.
  - The token audit is broken (see section 0).
  - The prices exist twice: once in `data/*.csv` and again in `prices-data.js`. They're in sync today, but this will drift. Each CSV row also carries about 22 empty columns.
- **SHOULD IMPROVE:**
  - Unlayered CSS at the end of `styles.css` (lines 1363-1552) overrides the token system with raw px values. One line is invalid CSS: `rgba(0,0,0,0,6)` at `:1432`.
  - There's an inline `onclick` at `index.html:432` and a `<style>` attribute on an image.
  - The scroll handler isn't throttled (`script.js:438`).
  - All `.reveal` content stays invisible if JavaScript fails.
  - The image `instagram.svg` is missing (404).
  - `package-lock.json` at the repo root is an empty stub.
- **Problems in `redesign/` if it is kept:**
  - Next.js 14.2.5 is old and has known security advisories.
  - Every component is `"use client"`.
  - `useLenis` starts a `requestAnimationFrame` loop that never stops.
  - A resize listener is never removed.
  - `cursor: none !important` hides the cursor everywhere.
  - A grain overlay four times the viewport size animates forever above everything (`z-index: 9999`).
  - There's no reduced-motion handling and no image optimisation (`unoptimized: true`).
- **Performance risks:**
  - `curtains.jpg` is 816 KB at 1600×2844 but is shown as a small card.
  - `instagram-preview.jpg` is actually a 588 KB PNG.
  - `refer-qr.png` is 2000×2000 but is shown at 96 px.
  - Most images have no width or height, so the layout shifts as they load.
  - The Google Fonts stylesheet blocks rendering and loads 8 font weights.

## G. Mobile problems
- **SHOULD IMPROVE:**
  - Unlayered overrides shrink the H1 to 22 px and paragraphs to 14 px on phones of 480 px or narrower, and set a 12 px gutter (`styles.css:1363-1395`).
  - On screens of 640 px or narrower, the full-width chat launcher fixed to the bottom of the screen covers content. It says "Chat", not "Book".
  - The instant booking form sits below long hero copy on mobile.
  - The map iframe is wrapped in a link, which breaks touch interaction (`index.html:493`).
- **MUST FIX for the redesign direction:** a hidden custom cursor, a pinned horizontal-scroll section driven by GSAP, and Lenis smooth scrolling are all risky on low-end Android phones on Indian mobile networks, which are likely your core customers.

## H. CRM and integration opportunities

_Rewritten from the CRM code. File references starting with `crm:` are relative to `~/Documents/Youclean CRM/v0-laundry-crm-design`._

### H1. What the CRM actually is

| | Finding | Evidence |
|---|---|---|
| Stack | Next.js 16.1.6, React 19, Prisma 5, deployed to Vercel (project `v0-laundry-crm-design`). | `crm:package.json`, `crm:.vercel/project.json` |
| Database | **PostgreSQL on Neon, through Prisma.** This is the operational source of truth. | `crm:prisma/schema.prisma:6-9`, `crm:.env.example` |
| Google Sheets | **Legacy only.** It's used by the one-off admin import (`/api/admin/migrate`) and two scripts. No live read or write path uses Sheets. | `crm:app/api/admin/migrate/route.ts:1-18`, `crm:scripts/import-sheet.ts` |
| Supabase | Abandoned. A `supabase/` folder and `NEXT_PUBLIC_SUPABASE_*` variables are still around, but no code uses them. | `crm:supabase/`, `crm:lib/db.ts` |
| Staff UI data | It polls `/api/data` every **30 s** (not 5 s) and loads every customer and order in one response. | `crm:lib/store.tsx:114`, `crm:app/api/data/route.ts` |
| Models | `Customer`, `Order`, `OrderStatusEvent`, `Payment`, `Referral`, `AuditLog`, `User`, `SubscriptionPlan`, `Subscription`, `SubscriptionOrder`, `WhatsappSession` | `crm:prisma/schema.prisma` |
| Volume (local snapshot, July) | 338 customers, 363 orders | `crm:prisma/dev.db` |

### H2. Authentication

There are three separate auth mechanisms:

1. **Staff sessions (NextAuth, JWT).** Staff log in with email and password (bcrypt hash in `users`) or with Google OAuth. Every route under `/api/customers`, `/api/orders`, `/api/payments`, `/api/subscriptions`, `/api/analytics`, `/api/admin/*` and `/api/data` calls `getServerSession()` and checks the role (`crm:lib/auth.ts`). There is no `middleware.ts`/`proxy.ts`, so each route guards itself. Two routes have no guard, but both are harmless deprecated stubs: `/api/admin/fix-customers` returns 410 and `/api/referral/setup` returns a static message.
2. **Server-to-server Bearer token for `/api/whatsapp/*`** (AiSensy). It checks `WHATSAPP_INTERNAL_API_SECRET` with a timing-safe compare (`crm:lib/whatsappApiAuth.ts`). **This shows a secure server-to-server integration is possible, and the pattern already exists.**
3. **Meta webhook** (`/api/webhooks/whatsapp`). It verifies requests with an HMAC-SHA256 `X-Hub-Signature-256` signature. It's Phase 1: the webhook acknowledges messages but doesn't act on them.

**MUST FIX (CRM security, before any website integration):** **any Google account can sign in as `staff`.** `getRoleForEmail()` returns `"staff"` for any email that isn't on an allowlist, and there's no `signIn` callback that rejects unknown accounts (`crm:lib/auth.ts:32-37, 91-109`). A staff session can read every customer's name, phone and address through `/api/data`, and can create customers and orders. `GOOGLE_CLIENT_ID` is in the env file pulled from Vercel, so Google login is probably enabled in at least one deployed environment. I did not test this against production.

### H3. How customers and orders are created today

- **Customers** are created by `createCustomer()` (`crm:lib/services/customerService.ts`). It's called from four places: the staff UI (`POST /api/customers`), on the fly from `POST /api/orders` (`newCustomer: {name, phone}`), `POST /api/whatsapp/customer`, and the import scripts.
  - **Deduplication:** `findCustomerByPhone()` reduces the number to its last 10 digits and then does `findFirst({ phone: contains })`. The database has **no unique constraint on phone**, so two requests at the same moment can create duplicates.
  - **IDs** are `C###`, calculated as "highest of the last 50 IDs, plus 1" with a **string** sort. Two requests at the same moment can get the same ID. The scheme also breaks after C999, because "C999" sorts above "C1000".
  - **Referral codes:** each new customer automatically gets a personal code, `YC` plus 6 letters (`crm:lib/referral.ts`).
  - **Phone validation:** `normPhone()` doesn't actually enforce 10 digits; `"123"` passes (`crm:lib/sheetUtils.ts`).
- **Orders** are created by `createOrder()` (`crm:lib/services/orderService.ts`). It's only reachable by staff, through `POST /api/orders`.
  - **IDs** are `YC-0001`: the highest of the last 100 plus 1, with the same race risk as customers.
  - **Defaults:** status `Pending`, pickup status `Pending`, and a `deliveryDate` of order date + 3 days if none is given. Once that date passes, the order is flagged **delayed**.
  - **Status history:** creating an order also writes an `OrderStatusEvent` in the same transaction. After that, status changes go through a transition table (`crm:lib/services/orderWorkflowService.ts`, 14 statuses).
- **Referral rewards** happen when an order moves to `Delivered`, has a `referralCode` and a total of at least ₹299. The code's owner then gets **₹100 wallet credit** (`crm:lib/referral.ts`). The friend's discount is **5%** (`crm:app/api/coupons/validate/route.ts:62-74`). Four static promo codes are hardcoded (`WELCOME10`, `FLAT50`, `YOUCLEAN20`, `NEWUSER15`). **`YOUCLEAN100`, the code the website advertises, doesn't exist in the CRM.**
- **The WhatsApp subscription flow** never creates a `Subscription` directly. It records an *intent* in `whatsapp_sessions`, and staff activate the subscription after verifying the UPI payment (`crm:docs/aisensy-integration.md`). **That "intake record first, staff converts it" pattern is the right model for website bookings too.**
- **Audit:** staff routes write to `audit_logs`; the `/api/whatsapp/*` routes don't.

### H4. Fields available vs fields a website booking needs

| Booking field | Where it fits in the CRM today | Gap |
|---|---|---|
| name, phone | `Customer.name`, `Customer.phone` (10 digits) | No unique phone index |
| address, landmark | `Customer.address` (one free-text field) | No landmark field |
| area | — (the WhatsApp flow puts it in front of the address: `"Area – address"`) | **Needs a field** |
| service | `Order.serviceType` / `services` JSON, a closed list of 14 `LaundryType`s | Website slugs need an explicit mapping (contract §M2) |
| items + qty | `Order.services` `[{name, qty, price}]` | Item-level price IDs don't exist in the CRM |
| express | `Order.isExpress` | — |
| preferred date / time | `Order.pickupDate`, `Order.pickupTime` (strings) | — |
| notes | `Order.notes`, `Order.deliveryInstructions` | — |
| estimate | — | Must **not** go into `totalAmount` (it would count as revenue) |
| referral code | `Order.referralCode` | Validated against customer codes |
| source / channel | — | **Needs a field** (on the booking, customer and order) |
| UTM, landing page, CTA location | — | **Needs fields** |
| WhatsApp consent, privacy version | — | **Needs fields** (DPDP) |
| booking reference, idempotency key | — | **Needs fields, unique** |
| booking status before an order exists | — | **Needs a model** (see H5) |

**Price data:** `crm:lib/services-config.ts` holds one default price per service (Dry Clean ₹79, Wash & Fold ₹90/kg, Wash & Iron ₹120/kg, etc.). Its header says these values were *"sourced from youcleanlaundry.in/prices.html"*. The CRM copied the website, so **it doesn't independently confirm the C5 prices**, and it has no item-level price list. The CRM can't be the price master today.

**Subscription plans:** four plans are seeded in the database (`PLAN-WF15` ₹1,099, `PLAN-WF30` ₹2,199, `PLAN-WI15` ₹1,499, `PLAN-WI30` ₹2,799; `crm:prisma/migrations/20260902000001_add_subscriptions/migration.sql:89-95`). This means a membership product **exists in the CRM**. Whether it's actively sold, and at these prices, still needs business confirmation.

### H5. Recommended website → CRM booking architecture

```
Browser  /book form (no secrets, no CRM URL)
   │  POST (Server Action)
   ▼
Website server — the ONLY public surface
   zod validation · honeypot · min time-to-submit · per-IP rate limit · (BotID if spam)
   assigns ref + idempotencyKey
   │
   ├─▶ [primary] CRM  POST /api/website/bookings            (server-to-server, private)
   │      Authorization: Bearer <WEBSITE_CRM_API_SECRET>      (NOT the WhatsApp secret)
   │      Idempotency-Key: <idempotencyKey>
   │      X-YC-Timestamp + X-YC-Signature (HMAC-SHA256 of the body; recommended)
   │      timeout 5 s
   │   CRM: validate → upsert WebsiteBooking by idempotencyKey
   │        → link an existing customer by phone (read-only, never edits it)
   │        → audit_log (actor "website") → 201 { bookingId, ref, status }
   │
   └─▶ [fallback, only if the CRM call fails or times out]
          email with the full payload (+ optional backup sheet row)
          booking is marked "pending CRM sync" and replayed with the same idempotencyKey
   │
   ▼
/book/confirmed  "Request received · Ref WB-…"  →  optional "Confirm on WhatsApp"

CRM staff:  "Website bookings" queue → call/WhatsApp the customer → Convert to order
            (creates the Customer if new + the Order with pickupDate/time, source "website")
```

**Why the website shouldn't create `Order` or `Customer` rows directly:**
- An order needs `totalAmount`, and there's no confirmed amount at booking time. A zero-amount order would distort revenue and average order value in analytics.
- The default `deliveryDate` of +3 days would mark unconfirmed requests as **delayed**.
- Spam or prank submissions would turn into real customers who get referral codes. Someone could also attach a booking to another person's phone number.
- The WhatsApp flow already follows "intake record, then staff conversion", so the website would match it.

**Can the CRM stay the operational source of truth? Yes.**
- Customers, orders, statuses, payments, referrals and subscriptions all stay in the CRM's Postgres.
- The website only owns capture, attribution and the confirmation screen.
- The Google Sheet that the plan approved as an interim sink is no longer needed as the primary store. It can become an optional backup, or be dropped (decision D2).

### H6. What a public website lead endpoint requires

The public endpoint is the **website's own Server Action**, not a CRM route. The CRM endpoint is only ever called from the website's server.

- **On the website (public surface):**
  - strict zod schema with length caps on every string
  - normalise the Indian mobile number (10 digits, starting 6–9)
  - honeypot field, minimum time-to-submit, per-IP and per-phone rate limits
  - a body size limit
  - no CRM data ever returned to the browser
  - a generic success message, so nobody can test whether a phone number is already a customer
- **New CRM route `POST /api/website/bookings`:**
  - a separate secret, `WEBSITE_CRM_API_SECRET`, using the same timing-safe check as `whatsappApiAuth.ts`
  - **write-only** scope: it can only create or replay a booking, never read customers
  - HMAC signature + timestamp, rejecting anything older than 5 minutes (replay protection)
  - `Idempotency-Key` actually enforced through a unique column. The AiSensy doc promises this header, but the code doesn't implement it.
  - an audit log entry, and a response that contains no customer fields
- **CRM schema** (details in §M2): a new `WebsiteBooking` model, plus `source`, `area` and consent fields on `Customer`, and `source` and `websiteBookingId` on `Order`.
- **CRM UI:** a "Website bookings" queue with Convert, Mark contacted, Cancel and Spam actions.

### H7. Security implications

| Risk | Mitigation | Tag |
|---|---|---|
| The CRM secret leaks through the browser | Only the server calls the CRM; the secret lives in website server env only (never `NEXT_PUBLIC_`) | **MUST** |
| One shared secret for all integrations | Use a separate `WEBSITE_CRM_API_SECRET`; a leak can then only create bookings; rotate it on a schedule | **MUST** |
| Replay or tampering | HMAC + timestamp window + idempotency key | **SHOULD** |
| Spam creates real customers or orders | Spam only reaches the booking queue; staff conversion is the gate | **MUST** |
| Finding out who is a customer by testing phone numbers | The website never reveals whether a phone number exists | **MUST** |
| Overwriting an existing customer's name or address | Intake only *links* by phone; changes need staff | **MUST** |
| Any Google account becomes CRM staff | Add a `signIn` callback that only accepts allowlisted emails or users in the `users` table | **MUST** (CRM) |
| Duplicate customer or order IDs when two writes collide | Use DB sequences or a unique-retry loop; add a unique normalised-phone index after deduplication | **MUST** (CRM) |
| Personal data in git: `prisma/dev.db` (204 phone numbers) is committed to the private CRM repo | Remove it from the repo and decide whether to purge history | **SHOULD** (CRM) |
| A Google service-account private key sits in plaintext in local `.env`/`.env.local` and in Vercel env, but only serves the legacy Sheets import | Revoke the key and delete the variables once the import is no longer needed (it was never committed to git) | **SHOULD** (CRM) |
| DPDP Act | Record consent, a privacy policy version, retention period, and the purpose of WhatsApp messages | **MUST** |

### H8. Opportunities (re-tagged)
- **MUST (website rebuild):** the booking intake described above (H5–H6) replaces the old `POST /api/leads` idea.
- **SHOULD IMPROVE:**
  - Show the **referral** as the CRM actually runs it, once the business confirms it: the referrer gets ₹100 wallet credit and the friend 5% (contract §M2.5). Capture `?ref=` into `referralCode`.
  - **Membership:** the four CRM subscription plans exist. A `/membership` page could read them server-to-server (a read-only plans endpoint like `/api/whatsapp/plans`) once the business confirms they're on sale.
  - A **customer-facing order status** through the existing Meta WhatsApp infrastructure.
- **FUTURE OPPORTUNITY:**
  - An item-level price list in the CRM, synced to the website.
  - `/track` using the CRM's 14-status workflow, and OTP accounts.
  - Online payment.
  - A B2B portal.
  - Review requests after `Delivered`.

## I. Recommended information architecture
```
/                      Home: proof, services, price anchors, areas, book
/book                  Multi-step pickup form → lead API → WhatsApp confirm
/services              Hub
  /wash-and-fold  /wash-and-iron  /dry-cleaning  /steam-ironing
  /saree-care  /shoe-cleaning  /curtain-cleaning  /express
/pricing               Crawlable, server-rendered tables (replaces /prices.html, 301)
/areas                 Hub → /areas/kompally, /suchitra, /bowenpally … (only areas you serve)
/membership            Plans (once defined)
/refer                 How it works + personal code lookup
/business              B2B enquiry: PGs, hostels, salons, gyms, Airbnbs, restaurants
/reviews  /faq  /about  /contact
/policies/{terms,privacy,garment-care-and-liability,refunds}
/track  /account       (Future: OTP login, order status, history, reorder)
```
The privacy policy is a **MUST FIX** once phone numbers and addresses are collected, because India's DPDP Act applies.

## J. Recommended redesign priorities
1. **Truth and trust (MUST):** fix false or conflicting claims and the price inconsistencies (C1–C5).
2. **Measurement (MUST):** analytics plus conversion events on every CTA.
3. **Lead capture (MUST):** booking recorded on our side before the WhatsApp handoff.
4. **Local SEO foundation (MUST):** structured data, sitemap, robots, canonical tags, 301 redirects, exact name/address/phone.
5. **One codebase (MUST):** pick a single implementation and delete the rest.
6. **Service and area pages, mobile-first booking UX (SHOULD).**
7. **CRM sync, referral, membership, B2B (SHOULD / FUTURE).**
8. **Visual polish last.** The brand look matters, but it isn't what currently loses customers.

## K. What should NOT be changed unnecessarily
- The phone/WhatsApp number, domain, GBP and Instagram links.
- WhatsApp as the confirmation channel.
- The brand palette, logo and token naming, and the `specs/` structure. Extend them rather than replace them.
- Existing price values. Change only what the business confirms.
- Service names customers already know ("Wash & Fold", "Wash & Iron").
- Vercel hosting.
- The tone: plain, local, practical. Don't swap it for abstract "luxury" copy.

## L. Phased implementation plan
- **Phase 0, hotfixes on the live static site (about 1–2 days):**
  - Fix C1–C4, C8 and C9 (a `vercel.json` that blocks internal files; delete `index.html.save`).
  - Restore analytics and add CTA events.
  - Add robots.txt, sitemap, canonical, Open Graph and LocalBusiness structured data, and a 308 redirect from the apex domain.
  - Fix the token-audit path and slow the modal redirect.
- **Phase 1, decisions and foundations:**
  - Write a single "truth sheet": turnaround times, prices, areas, offers and policies.
  - Get the CRM API details.
  - Choose one codebase: the recommendation is a fresh Next.js App Router build that is mostly statically generated, using `tokens.css` rather than the current `redesign/` code.
  - Archive the duplicate folders, design a single price data model, and write the measurement plan.
- **Phase 2, core rebuild:** the IA above, the `/book` flow with the lead API, server-rendered pricing, service and area pages, a sticky "Book pickup" bar on mobile, accessibility to WCAG 2.1 AA, optimised images, and redirects from the old URLs.
- **Phase 3, CRM integration:**
  - **First, the CRM prerequisites:** fix the Google sign-in allowlist, the ID generation race, the phone uniqueness constraint, and add the `WebsiteBooking` schema and route.
  - **Then:** the website booking push (H5), using the referral codes the CRM already generates, membership pages that read the CRM plans, B2B enquiry routing, and WhatsApp notifications through the existing Meta setup.
  - **Price sync** waits until the CRM has an item-level price list.
- **Phase 4, customer layer (future):** OTP accounts, order tracking, reorder, online payment, review prompts.

## M. CRM findings: corrections and the booking data contract

### M1. Earlier assumptions now shown to be wrong

| # | Earlier assumption | Where it was stated | What the CRM code shows |
|---|---|---|---|
| 1 | "No CRM code exists anywhere"; the CRM section is "based on assumptions" | Audit §0, §H | The CRM is a separate private repo: `vimala03/v0-laundry-crm-design` |
| 2 | The CRM uses **Google Sheets** as its backend | Plan §0 ("CRM" row); my notes on the CRM | It runs on **PostgreSQL (Neon) through Prisma**. Sheets is only used for the legacy one-off import |
| 3 | "No Supabase" | Plan §0 | Correct for the code. Supabase leftovers (a folder and Vercel env vars) still exist and should be cleaned up |
| 4 | The CRM's API is unknown, so a CRM sink can't be designed | Plan §10 | A server-to-server API pattern exists (`/api/whatsapp/*`, Bearer + timing-safe compare) and documentation exists (`crm:docs/aisensy-integration.md`) |
| 5 | Only Google sign-in for staff | My notes on the CRM | Email/password (bcrypt) **and** optional Google. Roles: admin / manager / staff |
| 6 | The staff UI polls every 5 s | My notes on the CRM | Every 30 s |
| 7 | Order statuses are Pending → InProgress → Ready → Delivered | My notes on the CRM | There are 14 statuses with an enforced transition table, plus separate pickup and payment statuses |
| 8 | Referral: "₹100 OFF" / "10% off" / `YOUCLEAN100` | Website copy (C2) | The CRM has personal `YC??????` codes; the referrer gets ₹100 wallet credit on a delivered order of ₹299 or more; the friend gets **5%**. `YOUCLEAN100` isn't a valid CRM code |
| 9 | Membership / B2B "may not exist yet" | Audit Q6; Plan §0 | Four monthly subscription plans exist in the CRM, with staff tooling. B2B doesn't exist |
| 10 | The CRM could be the price master | Audit §H (old) | The CRM only has one default per service, **copied from the website**. It has no item list, so it can't be the price master yet |
| 11 | The booking reference format `YC-YYMMDD-XXXX` | Plan §7, §10 | It collides visually with CRM order IDs (`YC-0001`). Use a distinct prefix such as `WB-` |
| 12 | The interim Google Sheet is needed because no CRM API exists | Plan §0 (J), §7 | A CRM endpoint is feasible now. The sheet is optional (decision D2) |

### M2. Website → CRM booking contract (proposed v1, not implemented)

**Endpoint:** `POST {CRM_BASE_URL}/api/website/bookings`, called only from the website server. The full text is to be moved into `docs/crm-contract.md` when Phase 1 starts.

**Headers:**
```
Authorization:   Bearer <WEBSITE_CRM_API_SECRET>
Content-Type:    application/json
Idempotency-Key: <uuid v4, same as body.idempotencyKey>
X-YC-Timestamp:  <unix seconds>                     (recommended)
X-YC-Signature:  sha256=<hex HMAC of "timestamp.body">  (recommended)
```

**Body (`schemaVersion: 1`):**
```jsonc
{
  "schemaVersion": 1,
  // no "ref": the CRM assigns the WB-#### reference (D4) and returns it
  "idempotencyKey": "uuid",
  "createdAt": "2026-10-08T14:05:00+05:30",
  "customer": {
    "name": "string ≤ 80",
    "phone": "10 digits, starts 6–9"      // CRM stores the last 10 digits (normPhone)
  },
  "address": {
    "line": "string ≤ 300",
    "landmark": "string ≤ 120 | null",
    "area": "kompally | suchitra | … | other",
    "areaName": "string ≤ 60",            // free text when area = other
    "areaConfirmed": true
  },
  "service": "wash-and-fold",             // mapped below
  "isExpress": false,
  "items": [{ "priceId": "dc-shirt", "item": "Shirt", "qty": 2 }],   // may be []
  "pickup": {
    "preferredDate": "YYYY-MM-DD",
    "preferredTime": "string ≤ 40 | null",
    "slotId": "string | null"
  },
  "notes": "string ≤ 500 | null",
  "estimate": { "amountInr": 190, "complete": true },  // informational, NEVER totalAmount
  "referralCode": "YCABCDEF | null",
  "consent": {
    "whatsappUpdates": true,
    "privacyPolicyVersion": "2026-10-01",
    "consentedAt": "ISO 8601"
  },
  "attribution": {
    "firstTouch": { "source": "", "medium": "", "campaign": "", "term": "", "content": "", "at": "" },
    "lastTouch":  { "source": "", "medium": "", "campaign": "", "term": "", "content": "", "at": "" },
    "landingPage": "/services/dry-cleaning",
    "ctaLocation": "hero"
  },
  "deviceClass": "mobile | tablet | desktop"
}
```

**Service mapping to the CRM `LaundryType`** (a closed list in `crm:lib/validators.ts`):

| Website slug | CRM value |
|---|---|
| `wash-and-fold` | `Wash & Fold` |
| `wash-and-iron` | `Wash & Iron` |
| `dry-cleaning` | `Dry Clean` |
| `steam-ironing` | `Iron Only` |
| `saree-care` | `Sarees` |
| `shoe-cleaning` | `Shoe Cleaning` |
| `curtain-cleaning` | `Curtains` |
| `express` | not a service: `isExpress: true` + the base service |

**Responses:**

| HTTP | Body | Website behaviour |
|---|---|---|
| 201 | `{ success: true, bookingId, ref: "WB-0001", status: "received", duplicate: false }` | Confirmation page with the reference |
| 200 | Same, with `duplicate: true` (same key, same body) | Confirmation page |
| 400 | `INVALID_REQUEST` + field | Log it; show a generic error and offer WhatsApp |
| 401 | `UNAUTHORIZED` | Alert (configuration problem); fallback sink |
| 409 | `IDEMPOTENCY_CONFLICT` (same key, different body) | Log it; new key on the next user submit |
| 413 / 429 | `PAYLOAD_TOO_LARGE` / `RATE_LIMITED` | Fallback sink |
| 5xx / timeout > 5 s | — | Fallback sink + replay later |

Responses **never** include the customer's name, ID, history or whether the phone number is already known.

**Required CRM schema additions** (these are CRM changes, not part of this repo):

- **New `WebsiteBooking` model:**
  - **Keys:** `id`, `ref` (unique, `WB-0001` from a Postgres sequence), `idempotencyKey` (unique), `schemaVersion`
  - **Status:** `received | contacted | scheduled | converted | cancelled | spam`
  - **Links:** `customerId?` (matched by phone, read-only link) and `orderId?` (set on conversion)
  - **Customer and address:** `name`, `phone`, `addressLine`, `landmark`, `area`, `areaName`, `areaConfirmed`
  - **Booking details:** `service`, `isExpress`, `items` (JSON), `preferredDate`, `preferredTime`, `slotId`, `notes`, `estimateAmount`, `estimateComplete`, `referralCode`
  - **Consent:** `consentWhatsApp`, `privacyPolicyVersion`, `consentedAt`
  - **Attribution:** `attribution` (JSON), `landingPage`, `ctaLocation`, `deviceClass`
  - **Housekeeping:** `handledBy`, `createdAt`, `updatedAt`
  - **Indexes:** on `status`, `phone` and `createdAt`
- **`Customer`:** add `source` (`walk-in | whatsapp | website | import | staff`), `area`, `whatsappConsent`, `whatsappConsentAt`. Add a unique index on the normalised phone after deduplicating existing rows.
- **`Order`:** add `source` and `websiteBookingId` (nullable foreign key).
- **Conversion to an order:** a staff action creates the Customer (if new) and the Order. Staff enter the real amount or leave it to be weighed at pickup. The order gets `pickupDate`/`pickupTime` from the booking, `referralCode` from the booking, and `source: "website"`.

### M2.5. Referral: the CRM today vs the approved target (D5)

**Approved target model:** the friend gets ₹100 off their first qualifying paid order (₹299 or more); the referrer gets ₹100 wallet credit once that order is delivered. **This is not advertised on the website until the CRM implements it and it has been tested.**

**What the CRM does today:**
- **Codes:** every CRM customer has a personal code, `YC` plus 6 letters.
- **Friend:** gets **5% off** when staff apply the code.
- **Referrer:** gets **₹100 wallet credit** when the friend's order is **delivered** and is **₹299 or more**. Self-referral is blocked.
- **Static promos:** `WELCOME10`, `FLAT50`, `YOUCLEAN20` and `NEWUSER15` are hardcoded in the CRM.
- **Website copy:** the website's "₹100 OFF / 10% off / YOUCLEAN100" matches none of this (C2).

**Gaps between today's CRM and the target** (found in the code):

| Gap | Evidence |
|---|---|
| The friend gets 5%, not a flat ₹100 | `crm:app/api/coupons/validate/route.ts:62-74` |
| No "first order only" check: any customer can use any referral code on any order | `crm:app/api/orders/route.ts`, `crm:lib/referral.ts` |
| The ₹299 threshold is checked against the total *after* the discount, so a ₹350 order with ₹100 off (₹250) wouldn't qualify | `crm:lib/referral.ts:55`, `crm:app/api/orders/route.ts` |
| No "paid" check: the reward fires on `Delivered` whether or not the order was paid | `crm:lib/referral.ts` |
| **The wallet balance can't be spent.** No code ever subtracts from `walletBalance`, so "₹100 wallet credit" currently has no value to the customer | grep of `walletBalance` across the code |
| The order API trusts a discount amount sent by the client (`couponDiscount`). It's staff-only, but it should be calculated on the server | `crm:app/api/orders/route.ts` |
| Bulk status changes to `Delivered` never trigger referral rewards | `crm:app/api/orders/bulk-status/route.ts` |
| The reward check runs outside the transaction, so two status updates at the same moment can credit twice | `crm:lib/referral.ts:41-80` |
| `/api/referral/process` is a GET request with side effects that any staff member can trigger | `crm:app/api/referral/process/route.ts` |

### M3. Additional findings (second CRM pass)

| # | Finding | Tag |
|---|---|---|
| 1 | 13 route files treat a missing role as `"staff"` (`session.user?.role \|\| "staff"`). An allowlist fix has to remove that fallback, otherwise a session without a role still gets staff access | **MUST** (CRM) |
| 2 | Logins aren't audit-logged, so you can't tell from the app whether unknown Google accounts ever signed in. Only writes carry `actorEmail` | **MUST** (CRM) |
| 3 | A code comment in `crm:lib/sheetUtils.ts` uses a **real customer's first name and phone number** as an example. It's in the current code and in history | **MUST** (CRM) |
| 4 | Customer data has been in git history in four files: `prisma/dev.db`, `prisma/prisma/dev.db` (7 commits, up to 204 phone numbers), `backups/2026-06-26/…db` (204) and `backups/pre-import/…db` (18). The two `backups/` files were later deleted from the branch, but they're still in history | **SHOULD** (decision on purging history; see plan §16 step 5) |
| 5 | The CRM has no automated tests (no test runner in `package.json`) | **MUST** before the referral and endpoint work |
| 6 | **Not verified:** whether Vercel *Preview* deployments of the CRM use the production database. If they do, testing any CRM PR on a preview writes to production data | **MUST** check before step 1 testing |
| 7 | The old Supabase *project* (outside the repo) may still hold the customer data imported before the move to SQLite and Neon | **SHOULD** (check in the Supabase dashboard) |
| 8 | `lib/google-sheets.ts` prints the service-account email to the console on every use | Removed with the Sheets code |
| 9 | **Step 0 (verified with the Vercel CLI and API, read-only): Preview deployments use the production database.** `DATABASE_URL` is one variable shared by Preview and Production; Development has none. GitHub is connected with automatic deployments on, so **pushing any branch creates a preview connected to production data.** No Neon integration is installed (no per-preview database branches). There's **no safe test database or staging environment** | **MUST** fix before any CRM branch is pushed |
| 10 | Every other variable (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_*`, `RBAC_ADMIN_EMAILS`, the Sheets and Supabase keys) is also shared across environments. `NEXTAUTH_SECRET` being shared means a preview's session cookie is valid in production, and vice versa. Only `VERCEL_ENV` tells environments apart; there's no staging | **SHOULD** |
| 11 | **Confirmed live:** the production CRM (`youcleanlaundry-crm.vercel.app`, public) offers Google sign-in (`/api/auth/providers` lists `google`), so the "any Google account becomes staff" issue is **exploitable in production today**. The `*.vercel.app` deployment URLs are behind Vercel Authentication; the production alias is not | **MUST** (Step 1) |
| 12 | Whether the local `.env` `DATABASE_URL` is the production database couldn't be checked: a read-only count query was blocked by a permission policy. **Treat it as production.** Running `create-admin`, `db:seed`, `db:reset` or `prisma migrate dev` locally may write to live data | **MUST** be careful |
| 14 | **[DATA-001, see `docs/SECURITY.md`]** **`crm:lib/data.ts` holds 18 real customers** (real names and phones; placeholder emails and addresses) (all 18 names and phone numbers match real records) as "seed" data. That's customer data committed in source code and in git history, and `npm run db:seed` would load it into any database. Replace it with synthetic data and add it to the step 5 history review | **MUST** (CRM) |
| 13 | The local `prisma/dev.db` and `prisma/prisma/dev.db` are byte-identical (same SHA) to `backups/safe/youclean-working.db` and the pre-migration backup database (338 customers, 363 orders, last order 2026-07-05). Nothing uses them (the schema is Postgres-only), so they hold **no unique data**. The `backups/` and `exports/` folders hold further unencrypted copies of customer data on this Mac | Delete `dev.db` in Step 4; decide on `backups/` and `exports/` |

---

## N. Decisions on record (approved 2026-10-08)

| ID | Decision |
|---|---|
| D1 | Website bookings go into a dedicated **booking queue in the CRM** (`WebsiteBooking`). The website never creates customers or real orders. Flow: website booking → booking intent → `WB-` reference → CRM queue → staff review and confirm → CRM creates or updates the customer and order → WhatsApp confirmation → operations |
| D2 | Once the endpoint exists, the **CRM is the primary store** for website bookings. The Google Sheet and email are only a fallback or alert. Sheets is never the primary store |
| D3 | **CRM security before integration**, in this order: (1) staff allowlist, (2) revoke the service-account key, (3) clean up obsolete config, (4) untrack the SQLite database and gitignore it, (5) review git history and *report*, without rewriting it, (6) booking endpoint, (7) website integration, (8) end-to-end test before production. CRM security outranks the visual redesign |
| D4 | Booking reference prefix **`WB-`** (e.g. `WB-0001`), distinct from CRM order IDs (`YC-0001`) |
| D5 | **Referral target:** the friend gets ₹100 off the first qualifying paid order (₹299 or more); the referrer gets ₹100 wallet credit after that order is delivered. Implement and test it in the CRM first. The 5% offer is **never** advertised, and no referral page goes up before it works |
| D6 | **Cleanup approved:** untrack and gitignore `prisma/dev.db`, revoke the obsolete Google service-account key, and remove Supabase configuration if it's genuinely unused. **No git history rewrite** without a separate approval, and no rewrite at all for the key, which was never committed |
| — | Security rules: no public endpoint exposes customer data; no CRM or service-account credentials in the website frontend; the website never connects to the CRM database directly |
| — | CRM URL stays a config value; the Neon region must be verified, not guessed; membership is not a public offer until confirmed |
| A1 | Staff recovery uses the `create-admin` script **only**. No emergency admin bypass in env vars; the `users` table is the source of truth for staff authorization |
| H1 | The history purge is **approved in principle but not executed**. First: verify every branch, find unique work, create a named backup, list the exact commits and files, confirm collaborators and clones, then show the final destructive commands for approval. Merged branches are only cleaned up after the purge is verified |
| R1–R6 | Referral: the ₹299 minimum is measured **before** the discount; the order must be **fully paid**; the friend must be **genuinely new**; wallet credit is usable on future eligible orders up to **20% of order value** (configurable), never cash, kept in a ledger, never negative; **no reward cap** at first, but full audit records, duplicate, self-referral and same-order protection, plus basic abuse checks; **no stacking** with other promos, and the server alone decides the discount; the hardcoded promo codes are **BUSINESS INPUT REQUIRED** until confirmed |
| B1 | If the CRM is down, the page shows a "Request received, YouClean will confirm your pickup" message **without** a booking number. No reference is invented; the real `WB-` number is created when the CRM accepts the replayed booking |
| — | The local `dev.db` files are deleted once they're confirmed unnecessary and hold no unique data. No customer data is copied to another unencrypted location |

---

## Questions to answer before Phase 1
1. **CRM:** ~~which system is it, and does it have an API (and docs)?~~ **Answered from code:**
   - **What it is:** the custom YouClean CRM (Next.js 16 + Prisma + Neon Postgres on Vercel). It has a documented server-to-server API pattern for WhatsApp (`/api/whatsapp/*`, Bearer secret) but **no website booking endpoint yet**.
   - **Still open:**
     - (a) Approve the booking-queue model (D1).
     - (b) Is the CRM production URL stable? Should the website call a custom domain, such as `crm.youcleanlaundry.in`, rather than a `*.vercel.app` URL?
     - (c) Who builds and deploys the CRM changes in §M2? They're in a different repo.
     - (d) The order of the CRM security fixes (H2, H7).
     - (e) Which Neon region holds the data (DPDP disclosure)? **Not verified.** The local CRM `.env`/`.env.local` connection strings point to an AWS `us-east-1` (USA) Neon host. The production `DATABASE_URL` is encrypted in Vercel (blank in the pulled file), so it couldn't be checked. Confirm in the Neon console before writing the privacy policy.
   - **Decided:** the CRM URL stays a configuration value (`CRM_BASE_URL`) until the stable production URL is confirmed.
2. **Turnaround:** 12–48h or 24–48h? What exactly does express cost and include?
3. **Referral:** ₹100 off or 10% off? Who issues codes, and who tracks payouts? _Partly answered: the CRM issues personal codes and tracks the referrer's ₹100 wallet credit; the friend gets 5% (§M2.5). Still open: is that the offer the business wants to advertise?_
4. **Prices:** what is the "Price" column in the CSVs (competitor, MRP or old price)? Are ₹90/kg, ₹120/kg and "from ₹79" still correct? _The CRM uses the same numbers as defaults, but it copied them from the website, so this isn't independent confirmation._
5. **Areas and address:** the exact list of areas served, and the full street address as it appears on GBP.
6. **Offers:** do membership plans or B2B pricing exist yet? _Partly answered: four subscription plans exist in the CRM (₹1,099 to ₹2,799 a month). **Decided:** membership is an operational CRM capability, **not** a public website offer, until you confirm the plans are active. B2B pricing doesn't exist._
7. **Visual direction:** keep the current light brand from the specs, or move to the dark direction in `redesign/`? The recommendation is to keep the light brand.

---

_No implementation will start until this audit is explicitly approved._
