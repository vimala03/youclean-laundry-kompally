# YouClean: Security and Data-Safety Register

_Created 2026-10-09. Covers the CRM (`vimala03/v0-laundry-crm-design`) and the website (this repo)._

**What this is:**
- A register of findings, each with a **stable ID**. IDs are never reused or renumbered.
- **Status values:** `OPEN` · `FIXED-LOCAL` (committed on the local CRM branch `security/staff-allowlist`; **NOT pushed, NOT deployed**) · `MITIGATED-LOCAL` · `FIXED` (deployed and verified; nothing is in this state yet) · `ACCEPTED` (risk accepted by decision).

_Updated 2026-10-09 (overnight): SEC-004, SEC-005, SEC-008, SEC-009 fixed locally; database guard added; DB-001, DATA-009 and SEC-015 added._
- **Cross-references:** `AUDIT-REPORT.md` (website C1–C10, CRM §H, §M3 #1–14), `DECISIONS.md`, `IMPLEMENTATION-PLAN.md` §16.
- **Evidence** comes from reading the repo or from read-only CLI checks. "Unverified" means I couldn't check it without access I wasn't granted.

## Severity scale
- **Critical:** exploitable now, or real personal data exposed.
- **High:** likely to lead to exposure or production damage.
- **Medium:** needs a specific condition or insider misuse.
- **Low / Info:** hardening.

---

## Authentication and authorization (SEC)

| ID | Sev | Finding | Evidence | Status | Fix / next action |
|---|---|---|---|---|---|
| SEC-001 | Critical | Any Google account could sign in and get the `staff` role (all customer data, write access to orders). **Live in production**: `/api/auth/providers` lists `google` on the public `youcleanlaundry-crm.vercel.app` | `crm:lib/auth.ts` at `main` (`getRoleForEmail` default plus no `signIn` callback); provider check 2026-10-08 | FIXED-LOCAL (`5abcee1`) | Deploy per §16 step 1 order, after the test environment exists |
| SEC-002 | High | 14 `session.user?.role \|\| "staff"` fallbacks in 12 API files | `main` | FIXED-LOCAL (`5abcee1`) | Replaced with `getSessionRole()` → 403 |
| SEC-003 | Medium | Logins and denied logins weren't audit-logged | `main` | FIXED-LOCAL (`5abcee1`) | `login` / `login-denied` events |
| SEC-004 | Medium | `POST /api/admin/users`, when updating an **existing** user without `role`, sets the role to `staff`. That silently demotes admins and **bypasses the last-admin guard**, which only exists in `PATCH`. The old code had the same default, and `5abcee1` kept it | `crm:app/api/admin/users/route.ts:81-87` | FIXED-LOCAL (`9e82fe9`) | Keep the existing role on update unless `role` is given; apply the last-admin guard in POST too; add tests |
| SEC-005 | Low | `scripts/create-admin.ts`: a blank role prompt defaults to `staff`, and on update that **demotes** an existing admin (e.g. when resetting a password). `5abcee1` changed the default from `admin` to `staff` | `crm:scripts/create-admin.ts` | FIXED-LOCAL (`9e82fe9`) | On update, keep the existing role unless one is entered; show the current role in the confirmation |
| SEC-006 | Medium | No rate limiting or lockout anywhere: password login (brute force), `/api/whatsapp/*`, and later the booking endpoint | grep finds no limiter | OPEN | A Postgres-backed limiter (free) for login and integrations, before the booking endpoint (§16 step 6) |
| SEC-007 | Low | 22 API route files return raw error text (`String(error)` / `err.message`) to the client, which can leak Prisma or schema detail | grep `app/api` | OPEN | A generic client message, with detail in server logs only |
| SEC-008 | Low | `GET /api/referral/process` has side effects (processes rewards) and any staff role can trigger it | `crm:app/api/referral/process/route.ts` | FIXED-LOCAL (`bff469b`): POST, admin-only | POST plus admin-only (§16 step 7) |
| SEC-009 | Medium | `POST /api/orders` trusts the client-supplied `couponDiscount` amount | `crm:app/api/orders/route.ts` | FIXED-LOCAL (`bff469b`): server-side pricing | Server-side discount calculation (D5/R6, §16 step 7) |
| SEC-010 | Low | `GET /api/debug/sheet` returns 5 sample customers and orders (personal data) to any session when `NODE_ENV !== "production"`, e.g. a local dev server | `crm:app/api/debug/sheet/route.ts` | OPEN | Delete it in the §16 step 3 cleanup |
| SEC-011 | Info | The sidebar shows staff navigation using `role ?? "staff"`. **UI only, not authorization**: with `5abcee1` a session without a role is discarded server-side | `crm:components/app-sidebar.tsx:36` | OPEN | Render no role-specific nav when the role is missing |
| SEC-012 | Info | `proxy.ts` skips paths ending in a file extension. Every API route still checks its own session, so there's no bypass | `crm:proxy.ts:32` | ACCEPTED (defence in depth only) | — |
| SEC-013 | Info | Re-validating the role every 5 minutes refreshes the cookie through `/api/auth/session` (client polling). Server-only requests can't rewrite the cookie, so after 5 minutes those requests may each do one indexed `users` lookup | NextAuth v4.24.14 `core/routes/session.js` | ACCEPTED (cost negligible at this scale) | Revisit if traffic grows |
| SEC-014 | Medium | Customer and order IDs are calculated as max+1 (they can collide when two are created at once; C999→C1000 sorts wrongly), and there's no unique phone constraint | `crm:lib/services/customerService.ts`, `orderService.ts` | OPEN | §16 step 6a |

**Re-checked across all API routes (2026-10-09):**
- Every route outside `/api/auth`, `/api/whatsapp` and `/api/webhooks` calls `getServerSession`. The deprecated `admin/fix-customers` and `referral/setup` stubs don't, but they return static responses, and `proxy.ts` now blocks them too.
- No route reads a role from the request body, except the admin users route (admin-only, validated).
- This is a single-tenant CRM: all staff see all customers by design, so no IDOR risk was found.
- Analytics is admin/manager only. Backup, export, import, health and audit-logs are admin only.

| SEC-015 | Info | `RewardStatus` in `lib/data.ts` has no `"ineligible"` member, but `bff469b` stores it. The API may return a value outside that TypeScript union (UI doesn't display it) | `crm:lib/data.ts`, `lib/referralRules.ts` `RewardState` | OPEN | Fix when the DATA-001 commit splits types out of `lib/data.ts` |
| SEC-016 | Info | No staff UI for wallet redemption yet; only the API (`applyWallet: true`) | `bff469b` | OPEN | Add to `create-order-dialog` with a test |

## Environment and infrastructure (ENV)

| ID | Sev | Finding | Evidence | Status | Fix / next action |
|---|---|---|---|---|---|
| ENV-001 | Critical | Preview deployments use the **production** database: `DATABASE_URL` is a single variable for Preview + Production | `vercel env ls`, 2026-10-08 | OPEN (infrastructure). Defence-in-depth guard FIXED-LOCAL (`b2728c9`, `a13fca8`) | `CRM-TEST-ENVIRONMENT.md` |
| ENV-002 | High | GitHub auto-deploys **every pushed branch**, so a push means a preview on production data | Vercel API `gitProviderOptions.createDeployments: enabled` | OPEN | Ignored Build Step freeze (needs approval) |
| ENV-003 | High | There's no test database or staging environment | Vercel/Neon review | OPEN | Separate Neon TEST project |
| ENV-004 | High | Every app variable is shared across environments, including `NEXTAUTH_SECRET` (a preview session cookie is valid in production), the Google OAuth client, Sheets credentials and Supabase keys | `vercel env ls` | OPEN | Separate Preview values (`CRM-TEST-ENVIRONMENT.md` §2) |
| ENV-005 | High | The local CRM `.env` / `.env.local` `DATABASE_URL` may be production. A read-only check was blocked by policy, so it's treated as production. Local `create-admin`, seed and migrate could write to live data | 2026-10-08 | MITIGATED-LOCAL (`b2728c9`): local tools refuse any DB unless PRODUCTION_DATABASE_HOST is set and differs | Point local env at TEST |
| ENV-006 | Medium | Neon region unverified. The local env points to AWS `us-east-1`; the production value can't be read | 2026-10-08 | OPEN | Check in the Neon console before writing the privacy policy |
| ENV-007 | Medium | The Vercel plan for the CRM team is unverified. Vercel's Hobby plan is for **non-commercial** use, and YouClean is a commercial business | not checked | OPEN (unverified) | You check the plan; no purchase without approval |
| ENV-008 | High | The Google service-account private key is stored in Vercel (all three environments) and in plaintext in local `.env`, `.env.local` and `.env.local.vercel`. It's only used by the legacy Sheets import | `vercel env ls`; local env names | OPEN | §16 step 2: revoke in Google Cloud, then remove everywhere |

| DB-001 | Low | Pre-existing index and foreign-key name drift: migration `20260902000001_add_subscriptions` named `sub_orders_*`, the schema expects `subscription_orders_*`. `prisma migrate dev` against TEST will propose renames | Offline `prisma migrate diff`, 2026-10-09 | OPEN | A separate rename migration; harmless meanwhile |

## Data exposure (DATA)

| ID | Sev | Finding | Evidence | Status | Fix / next action |
|---|---|---|---|---|---|
| DATA-001 | **Critical** | **`crm:lib/data.ts` contains the real names and phone numbers of 18 customers, plus 21 orders under those names**, as "seed" data. Detail below | Commit `4ae0524` says it added "real customer and order data from PDF"; 13/18 seed phones also appear on customers imported independently from the business's Google Sheet, and 19 of those 25 rows have the identical full name | OPEN: real-data seed retired (`6e04c28`); file unchanged by decision | See the DATA-001 detail |
| DATA-002 | High | `prisma/dev.db` and `prisma/prisma/dev.db` (byte-identical, 338 customers / 363 orders) are **tracked** in git and in 7 commits | `git ls-files`, `git log` | OPEN | §16 step 4 (untrack), step 5 (history) |
| DATA-003 | High | `backups/2026-06-26/…2120.db` (204 phone numbers) and `backups/pre-import/…022932.db` (18) are **in git history**, deleted in `23b9ee2` | `git log --all` | OPEN | §16 step 5 |
| DATA-004 | Medium | A real customer's first name and phone number appear as an example in a code comment | `crm:lib/sheetUtils.ts` (`buildWriteRow` doc comment) | OPEN | Replace in step 3; history in step 5 |
| DATA-005 | Medium | Local `backups/` (1.2 MB) and `exports/` (552 KB) hold unencrypted customer data (`.db`, `.json`, `.csv`, `.xlsx`). They're gitignored and untracked | `git check-ignore`, `du` | OPEN: **keep** (decision 2026-10-09) | Encrypt or restrict; delete only after step 5 and a recovery plan |
| DATA-006 | Medium | `crm:.env.local.vercel` is a local pull of **Production** variables (sensitive ones blank, others with values). It's gitignored | file header | OPEN | Delete in test-environment step F (needs approval) |
| DATA-008 | Medium | Customer IDs C001–C018 mix seed identities with real imported orders: 30 imported `YC-*` orders sit on these IDs, but the order-level names match the seed name for only 1 of 18. The customer pages for these IDs may be wrong. Unverified against production | July snapshot, counts only | OPEN | Read-only production comparison (needs approval), then a staff-reviewed correction |
| DATA-007 | Medium | The old Supabase **project** (outside the repo) may still hold customer data imported before the move to SQLite and Neon | migration history | OPEN (unverified) | You check the Supabase dashboard |

| DATA-009 | Low | `deleteOrder()` hard-deletes the order's `referrals` rows (pre-existing), erasing referral history. The wallet ledger keeps its row (`order_id` becomes NULL) | `crm:lib/services/orderService.ts` | OPEN | Soft-delete or keep referral rows; separate change |

### DATA-001 detail: real customer data in `lib/data.ts`
- **File:** `crm:lib/data.ts` (700 lines). Real data is in two internal arrays, `_rawCustomers` and `_rawOrders`, exported as `customers` (line 435) and `orders` (line 679).
- **What it contains:**
  - **18 customer records** with **real names and phone numbers**, plus ID, type, wallet balance and referral code. Their emails (`<name>@email.com`) and addresses (just "Hyderabad") are **placeholders**.
  - **21 order records** under those customer names: date, amount, pieces, service, status, notes (3 non-empty), referral code. Per `scripts/delete-seed-orders.ts`, these 21 were deleted from the live database on 2026-07-11, but they're still in this file.
  - **How it was checked (no values printed):**
    - Commit `4ae0524` (v0, 2026-03-06) is titled "update dashboard with real customer and order data … from PDF", and `8a3b595` is titled "added real data".
    - 13 of the 18 seed phone numbers also appear on 25 customer rows **imported independently from the business's Google Sheet** (other IDs), and 19 of those 25 rows carry the **identical full name**.
    - A plain match against the July database alone would **not** have been proof, because the seed had been run into that database (C001–C018).
- **Who imports it:**
  - **Only `scripts/seed.ts`** (`npm run db:seed`, and `npm run db:reset`, which runs it) imports the `customers` / `orders` arrays.
  - About 35 other files import **types and constants only** from the same file (`Customer`, `Order`, `LaundryType`, `laundryTypeCategories`, `allLaundryTypes`, …).
- **Is production code using the data?** **No.** No API route, page, component or service imports the arrays. The file is still **required** for its types and constants, so it can't simply be deleted.
- **Why it can't be used for testing:** loading it into any test, preview, local or demo database puts real people's names and phone numbers into a less-protected environment. They'd be visible to anyone with preview or local access, could be screenshotted, and could be messaged if messaging credentials were ever present. That breaks the "100% synthetic test data" rule.
- **Why it's dangerous now:**
  - `npm run db:seed` / `db:reset` writes it into **whatever `DATABASE_URL` points at** (possibly production, ENV-005).
  - The seed's `upsert` with `update: {}` creates these rows wherever they're missing.
  - It's bundled into every clone.
  - It's in every branch's history.
- **Can it be replaced safely?** Yes, in a focused commit:
  1. Delete the two raw arrays and the `customers` / `orders` exports, keeping every type and constant.
  2. Retire `scripts/seed.ts` and point `db:seed` / `db:reset` at the guarded synthetic seed.
  3. Confirm with `tsc` and the build that nothing else depended on them.
- **Before replacing it:**
  - The synthetic seed (§16 step 2) must exist, so `db:seed` never silently loses its purpose.
  - Confirm production doesn't rely on re-seeding.
  - Add the file to the step 5 history-purge scope.
- **Git history:** all 18 phone numbers first appear in commit `4ae0524` (2026-03-06). That commit is reachable from **30 local and remote branch refs**. Removing the file from the current branch doesn't remove it from history; that needs the separately approved purge (H1).
- **Related data:** the same people are also in `prisma/dev.db`, the `backups/*.db` and `exports/` files, and the production database.
- **Data-quality side finding:** C001–C018 in the live database were created by the seed, then **real imported orders for other people were attached to those IDs** (only 1 of 18 order-name sets matches the seed name). Customer records C001–C018 may show the wrong name or phone for real orders. That needs a staff review in production, which is a separate, approved data task (DATA-008).


---

## Release-gate review findings (2026-10-09, branch `a13fca8`, not deployed)

**Status meanings:** VERIFIED = confirmed from code, source or offline tests · FAILED = a defect was confirmed · REQUIRES TEST DATABASE = can't be confirmed without the isolated TEST database.

| ID | Sev | Finding | Evidence | Status |
|---|---|---|---|---|
| INC-001 | **High (incident)** | During this review, a guard probe ran `node scripts/export.mjs` with a fake `DATABASE_URL` and a fake `PRODUCTION_DATABASE_HOST`. `export.mjs` overwrote the fake URL with the **real** one from `.env.local` (treated as production), and the guard compared it with the fake production host, so it allowed the run. Read-only `findMany` queries reached that database: `orders` failed (missing column), and `customers` / `payments` / `referrals` may have returned rows into process memory. **Nothing was printed, written to disk or written to the database.** It breaks the "do not connect to any database" instruction | Error text came from a live server; `exports/` unchanged | Reported; no further script runs |
| ENV-009 | Medium | `scripts/export.mjs` (and `import-orders-csv.mjs`, which only talks to Sheets) **overwrites** variables already set in the shell with `.env.local` values. An operator's explicit TEST `DATABASE_URL` can be silently replaced, and protection then depends entirely on `PRODUCTION_DATABASE_HOST` being correct | `scripts/export.mjs:58-85` | FAILED: fix (keep existing vars) before any TEST use |
| ENV-010 | Low | `prisma.$transaction(async …)` starts the database transaction (connects, BEGIN) **before** the query hook runs, so a misconfigured non-production app can open a connection to production before the guard throws and rolls back. No statement runs | Prisma 5.22 `library.js` `_transactionWithCallback` | FAILED (defence-in-depth gap). Fix with an eager guard at client creation (skipped during build); verify on TEST |
| ENV-011 | Medium | `VERCEL_ENV` is trusted. Setting `VERCEL_ENV=production` locally (it's in the pulled `.env.local.vercel`) disables the guard. It's not a designed flag, but it works like one | `lib/dbEnvironment.ts` (offline check) | VERIFIED (residual risk); delete `.env.local.vercel` (DATA-006); credential separation is the real control |
| ENV-012 | Medium | Direct Prisma CLI (`npx prisma migrate deploy\|reset\|db push\|db execute\|studio`) isn't guarded; only the npm wrappers are | `package.json` | VERIFIED (residual); document it, and separate credentials |
| ENV-013 | Low | The guard compares hostnames only. A wrong or stale `PRODUCTION_DATABASE_HOST`, a DNS alias, an IP address or a Neon endpoint option pointing at production would pass | Design review | VERIFIED (residual); credential separation and password rotation |
| REF-001 | Medium | Rounding mismatch: the server rounds percent promos to the paisa (10% of ₹355 = ₹35.50), the order screen to the rupee (₹36). The screen collects ₹319, the server totals ₹319.50, and the order is saved **Partial** with ₹0.50 due. Introduced by `bff469b` | `lib/referralRules.ts evaluatePromo` vs `create-order-dialog calcDiscount` (offline function check) | FAILED: round promo discounts to whole rupees server-side |
| REF-002 | Medium | `deleteOrder()` deletes the order's Referral rows and doesn't reverse wallet redemption or reward. Deleting a credited friend order frees the unique `referee_id` slot, so a later order can reward the referrer **again**, and redeemed wallet credit is lost | `lib/services/orderService.ts deleteOrder` | FAILED: block deletion of orders with wallet/referral activity, or reverse it and keep the history |
| REF-003 | Medium | Ledger bypass: `POST /api/backup` (restore) overwrites existing customers' `walletBalance`; admin import, `restore.mjs`, `import-sheet.ts` and the legacy migrate route set balances or reward status with no ledger row. `creditWallet()` / `markOrderRewarded()` are unused but still exported | grep | FAILED: route through the ledger or forbid wallet fields; remove the dead helpers |
| REF-004 | Medium | Migration-to-deploy window: if `20261009000002` is applied while the **old** code is still live, old reward code changes balances without ledger rows, so the ledger diverges from the opening snapshot | Checklist order P2 → P4 | Needs a reconciliation query after deploy (checklist corrected) |
| REF-005 | Low | Two simultaneous first orders for the same new friend can both receive the ₹100 discount (the eligibility check isn't atomic). The reward is still credited once | `resolveOrderDiscount` | VERIFIED by reading; REQUIRES TEST DATABASE to reproduce |
| REF-006 | Low | Editing an order's amount after creation doesn't re-check the 20% wallet cap or the referral minimum (the reward check still uses the subtotal). Staff can set `paidAmount` through PATCH without a Payment row, which satisfies "fully paid" without a recorded payment (pre-existing) | `updateOrder`, PATCH route | VERIFIED by reading |
| REF-007 | Low | Some synthetic seed orders hold states the new creation rules would reject (a discount on the ₹298, existing-customer and self-referral orders). They're legacy-style fixtures for reward tests and should be labelled as such | `scripts/synthetic-data.ts` | VERIFIED |
| REF-008 | Info | Behaviour change for **legacy** pending referral orders: they now need full payment and a genuinely new friend, and their subtotal is backfilled from the post-discount total. Some referrers who previously would have been credited won't be | migration backfill + `evaluateReward` | Needs business approval |
| SEC-017 | Low | The last-admin guard isn't atomic: two concurrent PATCH requests deactivating the last two admins can both pass | `app/api/admin/users/route.ts` | VERIFIED by reading; REQUIRES TEST DATABASE |
| SEC-018 | Low | Tests and a code comment use placeholder addresses at the real `gmail.com` domain instead of `example.com` | `tests/auth.test.ts`, `scripts/create-admin.ts` | VERIFIED; switch to `example.com` |
| MIG-001 | Medium | The new migrations aren't wrapped in `BEGIN; … COMMIT;`. The referral migration's DO block aborts before any change, but a later failure would leave a partly applied migration for `prisma migrate resolve` | migration files | NOT VERIFIED whether Prisma wraps them; add an explicit transaction and test on TEST |
| MIG-002 | Low | The wallet ledger's foreign key to customers is `ON DELETE RESTRICT`: deleting a customer who has ledger rows now fails with a raw 500 | migration `20261009000002` | VERIFIED by reading |
| MIG-003 | Info | Whether Prisma's drift check ignores the marker's CHECK constraints | — | REQUIRES TEST DATABASE |


### Containment update (2026-10-09, CRM branch `f9d02ad`, local only, NOT pushed or deployed)

| ID | New status | Commit / note |
|---|---|---|
| INC-001 | **OPEN (incident).** Root cause fixed locally; the incident isn't closed. What was read into memory can't be confirmed, no production access review has been done, and the credential rotation is still pending | `ad0aa0a` |
| ENV-009 | FIXED-LOCAL | `ad0aa0a`. **Correction:** `import-orders-csv.mjs` *does* keep existing variables (`if (!process.env[key])`); only `export.mjs` overwrote them |
| ENV-010 | FIXED-LOCAL | `945d33d`: eager guard before `new PrismaClient()` (skipped only during `next build`); verified with `@prisma/client` mocked |
| ENV-011, ENV-012, ENV-013 | OPEN (residual) | No change. ENV-011 is tied to recovery decision A1-b |
| REF-001 | FIXED-LOCAL | `bcb1188`: promo discounts rounded to whole rupees, matching the order screen |
| REF-002 | FIXED-LOCAL (**behaviour change, needs approval**) | `57c54a5`: orders with referral or wallet history can't be deleted (409); cancel instead |
| REF-003 | FIXED-LOCAL for restore, admin import and `restore.mjs`; **OPEN** for the legacy `import-sheet.ts` and `/api/admin/migrate` | `f9d02ad` |
| MIG-001, MIG-003, REF-004 to REF-008, SEC-017, SEC-018, MIG-002 | OPEN | Unchanged |

**Test note:** `tests/prismaGuard.test.ts` loads a real client and is **excluded** from runs under the containment rules. `next build` wasn't run, because it constructs a real client.
