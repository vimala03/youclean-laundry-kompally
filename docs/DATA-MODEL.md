# YouClean CRM: Data Model

_Created 2026-10-09 from `crm:prisma/schema.prisma`. **Updated overnight 2026-10-09 to branch tip `a13fca8`.** The new tables and columns below are **implemented locally only; their migrations are NOT applied** to any database._

**Planned changes are listed separately and are not in the schema yet.**

**Personal-data classes:**
- **P1**: direct identifiers (name, phone, email, address).
- **P2**: linked personal activity (orders, payments, wallet).
- **S**: secrets (password hashes).
- **—**: no personal data.

## Tables on the branch (13: 11 existing + 2 new, unapplied)

| Model → table | Key fields | Class | Notes |
|---|---|---|---|
| `Customer` → `customers` | `id` (`C###`), name, phone, email, address, type, joinedDate, referralCode (`YC`+6), walletBalance | P1 | Phone **not unique** (SEC-014). IDs are max+1 |
| `Order` → `orders` | `id` (`YC-####`), customerId, customerName, dates, serviceType, `services` (JSON), pieces, totalAmount / paidAmount / balanceAmount, orderStatus (14), paymentStatus, pickupStatus, pickup date and time, isExpress, referralCode, rewardStatus, notes | P2 (+ P1 via customerName) | `totalAmount` is stored **after** the discount |
| `OrderStatusEvent` → `order_status_events` | orderId, from / to status, actorEmail, role | P2 | Workflow history |
| `Payment` → `payments` | orderId, customerId, amount, date, method (Cash / UPI / Card) | P2 | |
| `Referral` → `referrals` | referrerId, refereeId, orderId, status, rewardGiven | P2 | No unique constraints yet |
| `AuditLog` → `audit_logs` | timestamp, actorEmail, role, action, entity, entityId, before / after (JSON text) | P1 / P2 (can embed records) | Includes `login` and `login-denied` (from `5abcee1`) |
| `User` → `users` | email (unique), passwordHash (`""` = Google-only), name, role, **active**, **lastLoginAt** | P1, S | Staff allowlist (A1). `active` and `lastLoginAt` come from the **unapplied** migration `20261008000001` |
| `SubscriptionPlan` → `subscription_plans` | id (`PLAN-…`), serviceType, kgAllowance, price, pickupCount, isActive | — | 4 plans seeded by migration. Not a public offer (D8) |
| `Subscription` → `subscriptions` | customerId, planId, status, dates, kg and pickup allowance / used, payment fields | P2 | |
| `SubscriptionOrder` → `subscription_orders` | subscriptionId, orderId, orderType, kgConsumed | P2 | |
| `WhatsappSession` → `whatsapp_sessions` | waPhone (unique), state, customerId, selected plan, paymentPending | P1 | Used as the WhatsApp intent record |
| **`EnvironmentMarker` → `environment_marker`** (new, `0b02cf4`) | id = 1 (CHECK), value = 'test' (CHECK), createdAt | — | Empty in production; one `'test'` row in TEST only |
| **`WalletTransaction` → `wallet_transactions`** (new, `bff469b`) | customerId, amount (± INR), type (`opening_balance` / `referral_reward` / `redemption` / `redemption_reversal` / `adjustment`), orderId?, referralId?, balanceAfter, actorEmail, note | P2 | Ledger; unique (orderId, type); opening balances inserted by the migration |
| **`Order` new columns** (`bff469b`) | subtotalAmount (before discount; legacy backfill = total), discountAmount, discountCode, discountType (`referral` / `promo` / ``), walletApplied, rewardNote | P2 | `rewardStatus` may now be `ineligible` (SEC-015) |
| **`Referral` constraints** (`bff469b`) | unique refereeId, unique orderId (replace the plain indexes) | — | The migration aborts if duplicates exist |
| **`User` columns** (`5abcee1`) | active, lastLoginAt; passwordHash default `""` | S | From migration `20261008000001` |

**Migrations (8):**
- `20260711152751_init`
- `20260711172743_add_indexes`
- `20260802000001_add_order_fields`
- `20260902000001_add_subscriptions` (inserts the 4 plans)
- `20260903000001_add_whatsapp_sessions`
- `20261008000001_staff_allowlist` (**not applied anywhere**)
- `20261009000001_environment_marker` (**not applied anywhere**)
- `20261009000002_referral_wallet` (**not applied anywhere**; read-only pre-checks in its header)

Static check: the migrations use Postgres-only syntax and their `CREATE TABLE`s cover all 11 models. They haven't yet been applied to an empty database; that's verified in TEST step 5.

## Where real personal data lives (see `SECURITY.md`)

| Location | Content | Git |
|---|---|---|
| Production Neon | All live data | — |
| `crm:lib/data.ts` | 18 real names and phones, plus 21 orders (DATA-001) | Tracked, and in history since `4ae0524` |
| `crm:prisma/dev.db`, `crm:prisma/prisma/dev.db` | July snapshot: 338 customers / 363 orders | Tracked, in history (DATA-002) |
| `crm:backups/` | `.db`, `.json` snapshots | Ignored; two older `.db` files are in history (DATA-003) |
| `crm:exports/` | `.json`, `.csv`, `.xlsx` | Ignored, never committed |
| `crm:lib/sheetUtils.ts` comment | 1 real name and phone (DATA-004) | Tracked, in history |

## Planned schema changes (not implemented)

| Change | Plan step | Decision |
|---|---|---|
| ~~`environment_marker` table~~ **implemented locally** (`0b02cf4`) | Test env | P-01 |
| Sequences for `C###`, `YC-####`, `WB-####`; unique normalised-phone index after dedupe | §16 step 6a | D3 |
| `WebsiteBooking` model; `Customer.source` / `area` / consent fields; `Order.source` / `websiteBookingId` | §16 step 6b | D1, D4 |
| ~~Order pricing fields; unique Referral constraints; `WalletTransaction` ledger; referral config~~ **implemented locally** (`bff469b`) | §16 step 7 | D5, R1–R6 |
