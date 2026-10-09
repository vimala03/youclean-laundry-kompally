# YouClean: Architecture

_Created 2026-10-09. Describes **what exists today** (verified) and the **approved target**. Planned items are marked as planned._

## Systems

| System | Repo | Stack | Hosting | Status |
|---|---|---|---|---|
| Public website | this repo (`You redesign`) | Static HTML/CSS/JS today. Target: Next.js App Router (W-01) | Vercel, `www.youcleanlaundry.in` | Live (static) |
| `redesign/` | this repo | Next.js 14 prototype | Never deployed | Legacy; not continued (W-01) |
| CRM | `vimala03/v0-laundry-crm-design` (private) | Next.js 16.1.6, React 19, Prisma 5.22, NextAuth 4.24.14 | Vercel project `v0-laundry-crm-design`; public alias `youcleanlaundry-crm.vercel.app` | Live |
| CRM database | — | PostgreSQL on Neon (region unverified, ENV-006) | Neon | Live |
| WhatsApp layer | — | AiSensy Flow Builder → CRM `/api/whatsapp/*`; Meta webhook (Phase 1 only, and its secrets aren't configured in Vercel) | AiSensy, Meta | Partly live |
| Google Sheets | — | Legacy import source only | Google | Legacy; to be removed (D6) |
| Supabase | — | Unused | — | To be removed (D6) |

## CRM: environments today (verified 2026-10-08, read-only)

```
GitHub push (any branch) ──auto-deploy──▶ Vercel Preview ─┐
GitHub push (main) ────────────────────▶ Vercel Production ─┼──▶ ONE DATABASE_URL ──▶ Production Neon (real customers)
Local dev (.env, treated as production) ────────────────────┘
```
- **Every app variable is shared** across Preview and Production (ENV-001, ENV-004). `NEXTAUTH_SECRET`, the Google OAuth client, the Sheets service-account key and the Supabase keys are all shared.
- **Preview deployment URLs** are behind Vercel Authentication. The production alias is public.

## CRM: target environments (approved direction; procedure in `CRM-TEST-ENVIRONMENT.md`)

```
PRODUCTION                         PREVIEW / TEST                       LOCAL DEV
Vercel Production                  Vercel Preview (branch builds)       next dev
   │ DATABASE_URL (Production only)    │ DATABASE_URL (Preview only)        │ .env → TEST
   ▼                                   ▼                                    ▼
Neon PRODUCTION project            Neon TEST project (separate) ◀───────────┘
real data                          synthetic data only, environment_marker = 'test'
```
- **No shared credentials.** Preview has its own `NEXTAUTH_SECRET`, OAuth client and integration secrets. Preview gets no Sheets, Supabase or Meta credentials.
- **Planned code guard:** non-production environments refuse to connect to `PRODUCTION_DATABASE_HOST`.

## CRM: authentication and authorization (branch `security/staff-allowlist`, `5abcee1`, not deployed)

```
Browser ──▶ proxy.ts (no valid session token → /login or 401; public: /login, /api/auth, /api/whatsapp, /api/webhooks)
        ──▶ route: getServerSession()
                 └─ jwt callback: users-table check (active + valid role), re-checked every 5 minutes;
                    unknown, inactive or revoked → throws → session null → 401
        ──▶ role check (getSessionRole; missing role → 403; canWrite / canDelete / admin-only)
```
- **Integrations** authenticate separately: AiSensy with a Bearer secret (`lib/whatsappApiAuth.ts`), Meta with an HMAC signature.

## CRM: database environment guard (branch, `b2728c9` + `a13fca8`, not deployed)

```
any query via lib/prisma.ts ──▶ $allOperations hook ──▶ checkDatabaseAccess(env)
CRM scripts (seed, create-admin, backup/export/restore, mark, assert) ──▶ assertDatabaseAccess() before connecting
  (caveats: export.mjs env override ENV-009; $transaction connects before the hook ENV-010; direct prisma CLI ENV-012)
npm db:deploy-test / db:migrate / db:reset / db:studio ──▶ assert-safe-database / assert-test-database first

environment = VERCEL_ENV | APP_ENV (development|test only) | NODE_ENV=test | development
production  → allowed
otherwise   → PRODUCTION_DATABASE_HOST required (fail closed) and must differ from the DATABASE_URL host (-pooler normalised)
```
There's no override flag, and only Vercel can declare `production`.

**Test-only tooling:** `db:deploy-test` → `db:mark-test` → `db:seed`, all requiring `APP_ENV=test`. The seed also needs the `'test'` marker and only synthetic customers.

## CRM: referral and wallet flow (branch `bff469b`, not deployed)

```
POST /api/orders ─▶ resolveOrderDiscount (server; one code; new-customer + ≥ ₹299 subtotal) ─▶ computeOrderPricing (wallet ≤ 20%, no stacking)
                ─▶ createOrder tx { order + wallet debit + ledger }
status change / bulk status / payment ─▶ runOrderSideEffects ─▶ reverseWalletRedemption (if Cancelled) + processReferralReward
processReferralReward ─▶ evaluateReward (Delivered + fully paid + new + ≥ ₹299) ─▶ tx { claim pending→credited, Referral, wallet +100, ledger }
```

## Website → CRM booking (approved design; NOT built: D1, D2, D4, B1, D7; contract in `BOOKING-API-CONTRACT.md`)

```
Browser /book ──▶ Website server action (validation, honeypot, rate limit) ── server-to-server ──▶
   CRM POST /api/website/bookings (own secret + HMAC + Idempotency-Key; write-only; returns no customer data)
   ──▶ WebsiteBooking queue (WB-0001) ──▶ staff confirm ──▶ Customer + Order ──▶ WhatsApp confirmation
CRM unreachable ──▶ "Request received" (no number) + email alert ──▶ replay with the same idempotency key
```

## Boundaries (D7)
- The website never connects to the CRM database and never reads CRM customer data.
- No CRM or Google credentials ever reach the browser.
