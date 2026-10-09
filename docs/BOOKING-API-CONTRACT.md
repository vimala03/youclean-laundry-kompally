# Website → CRM Booking API: Implementation Contract (v1)

_Written 2026-10-09 · **DESIGN ONLY. Nothing is built, connected or deployed.** It replaces the draft in `AUDIT-REPORT.md` §M2 and follows decisions D1, D2, D4, D7 and B1 (`DECISIONS.md`)._

**Flow:**
```
Website /book ─(browser POST)─▶ Website Server Action (public, abuse-protected)
     ─(server-to-server, HTTPS)─▶ CRM POST /api/website/bookings (private, write-only)
     ─▶ WebsiteBooking queue (WB-0001) ─▶ staff review / confirm ─▶ Customer + Order ─▶ WhatsApp confirmation
```

**Prerequisites:**
- **Done locally:** SEC-001 to SEC-005 and the database guard (commits `5abcee1` to `bff469b`).
- **Still needed:**
  - the isolated TEST environment (`TOMORROW-EXECUTION-CHECKLIST.md`)
  - the rate limiter (SEC-006)
  - race-safe IDs and the phone-uniqueness work (SEC-014, plan §16 step 6a)

---

## 1. Endpoint

| | |
|---|---|
| Method / path | `POST {CRM_BASE_URL}/api/website/bookings` (`CRM_BASE_URL` is a config value until the production URL is confirmed, D8) |
| Caller | **Only** the website server (Server Action). Never the browser; the CRM URL and secrets never reach the client (D7) |
| Scope | **Write-only:** creates or replays a booking. It can't read, list or update customers or orders |
| Runtime | Node.js route handler in the CRM. `proxy.ts` lists `/api/website` as self-authenticating, like `/api/whatsapp` |

## 2. Authentication (server to server)

| Header | Rule |
|---|---|
| `Authorization: Bearer <WEBSITE_CRM_API_SECRET>` | Its own secret, separate from `WHATSAPP_INTERNAL_API_SECRET`, with separate Preview and Production values. Compared timing-safely (reusing the `lib/whatsappApiAuth.ts` pattern, generalised into `lib/integrationAuth.ts`) |
| `X-YC-Timestamp: <unix seconds>` | Must be within **±300 s** of CRM time |
| `X-YC-Signature: sha256=<hex>` | HMAC-SHA256 of `"<timestamp>.<raw body>"` with `WEBSITE_CRM_HMAC_SECRET`. Verified on the **raw** body before parsing |
| `Idempotency-Key: <uuid v4>` | Required. Must equal `body.idempotencyKey` |
| `Content-Type: application/json` | Required. The body must be **≤ 16 KB** |

Failing any check returns 401 with no detail about which check failed. Failures are counted per source for rate limiting.

## 3. Request body (`schemaVersion: 1`)

| Field | Type / limit | Required | Validation |
|---|---|---|---|
| `schemaVersion` | `1` | ✔ | Exactly 1 |
| `idempotencyKey` | uuid v4 | ✔ | = header |
| `createdAt` | ISO 8601 with offset | ✔ | Not in the future (+5 min tolerance); not older than 7 days |
| `customer.name` | string 2–80 | ✔ | Trimmed; control characters stripped |
| `customer.phone` | string | ✔ | Indian mobile: 10 digits starting 6–9 after normalisation (`+91`/`0` prefixes removed) |
| `address.line` | string 5–300 | ✔ | |
| `address.landmark` | string ≤ 120 | — | |
| `address.area` | enum of known area slugs \| `"other"` | ✔ | |
| `address.areaName` | string ≤ 60 | when `area = other` | |
| `address.areaConfirmed` | boolean | ✔ | `false` for `other`; never rejected for that alone |
| `service` | `wash-and-fold \| wash-and-iron \| dry-cleaning \| steam-ironing \| saree-care \| shoe-cleaning \| curtain-cleaning` | ✔ | Mapped to the CRM `LaundryType` (table in §4) |
| `isExpress` | boolean | ✔ | Accepted only when express is a confirmed business fact (input B); otherwise forced to `false` and noted |
| `items[]` | ≤ 30 × `{ priceId ≤ 40, item ≤ 80, qty 1–99 }` | — | Informational only; never priced by the CRM API |
| `pickup.preferredDate` | `YYYY-MM-DD` | ✔ | Today to +30 days (Asia/Kolkata) |
| `pickup.preferredTime` | string ≤ 40 | — | Free text until pickup windows are confirmed (input I) |
| `pickup.slotId` | string ≤ 40 | — | |
| `notes` | string ≤ 500 | — | |
| `estimate` | `{ amountInr ≥ 0, complete: boolean }` | — | **Stored for staff only. Never becomes `totalAmount`.** |
| `referralCode` | string ≤ 20 | — | Stored only. Eligibility and the ₹100 discount are decided **at conversion** by `resolveOrderDiscount` (D5); the website promises nothing until the referral is published |
| `consent.whatsappUpdates` | boolean | ✔ | |
| `consent.privacyPolicyVersion` | string ≤ 20 | ✔ | Must match a published version |
| `consent.consentedAt` | ISO 8601 | ✔ | |
| `attribution.firstTouch` / `lastTouch` | `{source, medium, campaign, term, content ≤ 100 each, at}` | — | |
| `attribution.landingPage` | path ≤ 200 | — | Starts with `/` |
| `attribution.ctaLocation` | string ≤ 40 | — | |
| `deviceClass` | `mobile \| tablet \| desktop` | — | |

Unknown fields are **rejected** (strict schema). The `ref` isn't sent: the CRM assigns it.

## 4. Service mapping (website slug → CRM `LaundryType`)

| Website | CRM |
|---|---|
| `wash-and-fold` | Wash & Fold |
| `wash-and-iron` | Wash & Iron |
| `dry-cleaning` | Dry Clean |
| `steam-ironing` | Iron Only |
| `saree-care` | Sarees |
| `shoe-cleaning` | Shoe Cleaning |
| `curtain-cleaning` | Curtains |

`express` isn't a service; it's sent as `isExpress`.

## 5. Responses

Responses **never** include customer data or say whether the phone number is already known.

| HTTP | Body | Website behaviour |
|---|---|---|
| 201 | `{ success: true, bookingId, ref: "WB-0001", status: "received", duplicate: false }` | Confirmation page shows the reference |
| 200 | Same, with `duplicate: true` (same key, same body hash) | Same as 201 |
| 400 | `{ success: false, error: { code: "INVALID_REQUEST", field } }` | Log it; show a generic error; offer WhatsApp and phone |
| 401 | `{ success: false, error: { code: "UNAUTHORIZED" } }` | Alert (configuration problem); fallback (§8) |
| 409 | `IDEMPOTENCY_CONFLICT` (same key, different body) | Log it; generate a new key on the next user submit |
| 413 | `PAYLOAD_TOO_LARGE` | Fallback |
| 429 | `RATE_LIMITED`, with `Retry-After` | Fallback |
| 5xx / timeout over 5 s | — | Fallback, then replay |

## 6. Idempotency
- `website_bookings.idempotency_key` is **unique**, and a SHA-256 of the canonical body is stored with it.
- **Same key and same hash** returns the stored booking (200, `duplicate: true`). **Same key, different hash** returns 409.
- Website replays always reuse the original key, so a replay can never create a second booking.

## 7. Anti-spam and rate limiting
- **On the website (the public surface):**
  - honeypot field
  - minimum time-to-submit (4 s)
  - per-IP limit (5 per 10 minutes) and per-phone limit (3 per day), stored server-side
  - Vercel BotID only if spam appears
- **On the CRM:**
  - per-secret limit (60 per minute)
  - repeated authentication failures from one source get a 429
  - Implementation: a Postgres-backed fixed-window limiter (`rate_limits` table, SEC-006, free). No new vendor.
- **Spam can only reach the queue.** It can't create customers or orders; staff can mark a booking as `spam`.

## 8. Failure behaviour (B1)
- If the CRM returns 2xx, the website shows **"Booking request received · Ref WB-0001 · We'll confirm your pickup."**
- If the CRM call fails for any reason, the website shows **"Request received. YouClean will confirm your pickup on WhatsApp."** with **no reference number** (never invented). It then:
  1. sends an **alert email** to YouClean with the full payload and the idempotency key (data minimised: name, phone, area, date)
  2. optionally writes a fallback Sheet row (D2: fallback only)
  3. queues a replay with the same key; when that succeeds, the CRM assigns the real `WB-` number, which staff include in the WhatsApp confirmation
- The website never retries in a tight loop: backoff 1 min, 5 min, 30 min, then manual.

## 9. CRM persistence (all planned; none of it is in the schema yet)
- **`WebsiteBooking` model:**
  - **Keys:** `id` (cuid), `ref` (unique, `WB-` + 4+ digits from the Postgres sequence `website_booking_ref_seq`), `idempotencyKey` (unique), `bodyHash`, `schemaVersion`
  - **Status:** `received | contacted | scheduled | converted | cancelled | spam`
  - **Links:** `customerId?` (matched by normalised phone; read-only link), `orderId?` (set on conversion)
  - **Booking content:** every §3 field (consent and attribution as columns or JSON)
  - **Staff fields:** `handledBy`, `handledAt`, `createdAt`, `updatedAt`
  - **Indexes:** on `status`, `phone` and `createdAt`
- **New columns:** `Customer.source` (`website | whatsapp | walk-in | staff | import`), `Customer.area`, `Customer.whatsappConsent`, `whatsappConsentAt`; `Order.source`, `Order.websiteBookingId`.
- **Conversion to an order** (staff, `POST /api/bookings/[id]/convert`, `requireRole(staff)`), in one transaction:
  - create the Customer if new (`source: "website"`), or link the existing one **without overwriting** name or address
  - create the Order with the real amount or "to be weighed at pickup", `source: "website"`, and `referralCode` from the booking, passed through `resolveOrderDiscount`
  - set `status = converted` and `orderId`
  - write an audit entry
- **Staff queue:** `app/bookings` page, plus `GET /api/bookings` and `PATCH /api/bookings/[id]` (status), all staff-only.

## 10. Audit logging
- **Every booking** (create or replay) gets `audit_logs` (`action: "create"`, `entity: "website_booking"`, `actorEmail: "website"`). The audit body holds the booking ID and ref only, no copies of personal data.
- **Every staff transition** is audited with the actor.
- **Authentication failures and 429s** are logged as counts, never with request bodies.

## 11. Tests required before any deploy
- **Contract:** valid, missing and oversize fields; unknown fields rejected; phone normalisation.
- **Auth:** bad secret, bad signature, skewed timestamp, replayed signature.
- **Idempotency:** same body returns 200; a different body returns 409.
- **Persistence:** the reference sequence under concurrency; no customer or order created by the endpoint.
- **Limits and failures:** rate limits; the website fallback with no reference; replay success.
- **Conversion:** creates exactly one customer and one order, and never overwrites an existing customer.
- **End to end:** on the isolated TEST environment only.

## 12. Environment variables (each with separate Preview and Production values)

| Where | Variable |
|---|---|
| CRM | `WEBSITE_CRM_API_SECRET`, `WEBSITE_CRM_HMAC_SECRET` |
| Website (server only) | `CRM_BASE_URL`, `WEBSITE_CRM_API_SECRET`, `WEBSITE_CRM_HMAC_SECRET`, `BOOKING_ALERT_EMAIL_TO`, email provider variables |
