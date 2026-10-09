# CRM Isolated Test Environment: Requirements and Setup Procedure

_Step 0a of `IMPLEMENTATION-PLAN.md` §16 · Written 2026-10-09 · **Status: PROCEDURE ONLY.** Nothing in this document has been created, connected to, migrated or changed._

**Goal:** give the CRM (`vimala03/v0-laundry-crm-design`) a test database and a Preview environment that **cannot read or write production data**, so CRM branches can be pushed and tested safely.

**Today (verified 2026-10-08):**
- **The database is shared.** `DATABASE_URL` is one Vercel variable covering both Preview and Production.
- **Every pushed branch is deployed.** GitHub auto-deploys every branch, so pushing any branch today creates a preview connected to production data.
- **No test database exists.**

---

## 1. Which Neon test database is required

**Recommendation: a separate Neon *project*** (e.g. `youclean-crm-test`). Not a branch of the production project.

| Option | Isolation | Problem |
|---|---|---|
| **Separate Neon project** ✅ | Separate host, roles, passwords and storage. Preview credentials can't sign in to production even if misused | None. It starts empty, and the migrations build the schema |
| Branch of the production project | A separate compute endpoint, but the same project. Branches inherit the parent's roles, and in practice their passwords too | A normal branch **copies all production data**. A schema-only branch copies the schema but leaves `_prisma_migrations` empty, so `prisma migrate deploy` then fails on tables that already exist |
| Separate database in the production project | Same project, roles and endpoint | Too close to production |

**Specification:**
- **Project:** `youclean-crm-test`, on a free or low tier.
- **Postgres version:** the same major version as production. Check it in the Neon console → production project → Settings.
- **Region:** any. It holds no personal data. Choosing the same region as production keeps behaviour comparable.
- **Database:** `youclean_test`.
- **Roles:**
  - `crm_test_app`: used by Preview deployments and local development.
  - Optionally `crm_test_migrator`, to keep migrations separate. One role is acceptable for a test environment.
- **Connection string format:** the same style as production (pooled or direct, with `sslmode=require`). The CRM schema uses a single `url` and no `directUrl`.
- **Schema:** created **only** with `prisma migrate deploy` from the CRM repo. That's the 6 migrations from `20260711152751_init` to `20261008000001_staff_allowlist`. The subscriptions migration also inserts the 4 subscription plans; they aren't personal data.
- **Environment marker:** a one-row table, `environment_marker(value text)` = `'test'`, created by the setup script. It's used for verification (§5) and by a guard in the code (§3).

---

## 2. Environment variables that need separate Preview values

Only `VERCEL_ENV` tells environments apart today; every app variable is shared. Target state:

| Variable | Production | Preview (new, separate value) | Development (local `.env`) |
|---|---|---|---|
| `DATABASE_URL` | Production Neon (**Production only**) | **Test project** `crm_test_app` URL | **Test project** URL. The production URL is removed from local files |
| `NEXTAUTH_SECRET` | Unchanged; rotate at the Step 1 deploy | **New** random value, so preview cookies are never valid in production | New random value |
| `NEXTAUTH_URL` | Production URL | **Not set.** On Vercel, NextAuth v4 uses the request host (`utils/detect-origin.js`: uses the forwarded host when `VERCEL` is set) | `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Production OAuth client | **A separate test OAuth client** (§6, step E). If it isn't set, Google sign-in is simply off on Preview | Not set, or the test client |
| `WHATSAPP_INTERNAL_API_SECRET` | Unchanged | **New** random value (its current Preview value may equal Production) | New random value |
| `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Removed in §16, step 2 | **Removed from Preview now.** Today a preview could read the legacy Sheet, which holds real customer data | Removed |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Removed in §16, step 3 | **Removed from Preview now** | — |
| `RBAC_ADMIN_EMAILS` | **Keep until the Step 1 deploy**; the current production code still reads it | Removed. Step 1 code doesn't use it | — |
| `PRODUCTION_DATABASE_HOST` (new, not secret: host only) | — | Production DB host (e.g. `ep-xxxx…neon.tech`) | Same |
| WhatsApp Meta tokens (`WHATSAPP_ACCESS_TOKEN`, etc.) | Not in Vercel today | **Never** in Preview, so test data can't trigger real messages | Never |

Future variables (website integration) get separate Preview values from the start: `WEBSITE_CRM_API_SECRET` and the HMAC key.

---

## 3. How Preview deployments are kept away from Production

Five independent layers. Any one of them on its own should stop access.

1. **Scoped variable.** The production `DATABASE_URL` is set for the **Production** environment only. Previews receive the test project's URL.
2. **Separate credentials.** The test project has its own host, roles and passwords, so a Preview connection string can't authenticate to production.
3. **Rotate the production database password** after the split (§6, step I). Every copy of the production URL that already exists becomes useless: in local `.env` files, the pulled `.env.local.vercel`, and any deployment built while the variable was shared. Only the Production variable gets the new password.
4. **Fail-closed code guard** (a small CRM change for later approval, in `lib/prisma.ts`). If `VERCEL_ENV !== "production"` and the `DATABASE_URL` host equals `PRODUCTION_DATABASE_HOST`, the app refuses to start its database client. The same guard goes into every script that writes data (`create-admin`, seed scripts), so a misconfiguration fails loudly instead of touching production.
5. **No previews until the split is done.** Before pushing any branch, set Vercel → CRM project → Settings → Git → **Ignored Build Step** to:
   ```bash
   if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi
   ```
   Exit code 0 skips the build, so previews don't build. Production builds still run. Remove this only after §5 passes.

Also keep: **Vercel Authentication** stays on for all deployment URLs, so previews aren't public. It's already `all_except_custom_domains`.

---

## 4. Fake test data required

**Rules:**
- **No real data. Never copy** production, `prisma/dev.db`, `backups/`, `exports/` or `lib/data.ts` into the test database.
- `lib/data.ts` and `npm run db:seed` contain **18 real customers** (all 18 names and phone numbers match real records; see `AUDIT-REPORT.md` M3 #14), so they **must not be used.**
- Test data comes from a new, deterministic script, `scripts/seed-test.ts` (a CRM change for later approval). It refuses to run unless `environment_marker = 'test'` and the host isn't `PRODUCTION_DATABASE_HOST`.

**Fake-data conventions:**
- **Names:** obviously synthetic, such as "Test Customer 01".
- **Phone numbers:** `90000000NN`.
- **Addresses:** e.g. "Test Lane, Test Area".
- **Emails:** `@example.com`.
- No messaging credentials exist in Preview, so nothing can be sent to these numbers.

| Entity | Records | Covers |
|---|---|---|
| `users` | Active admin (password); manager (password); staff (password); **inactive** user; a **Google-only** allowlisted test account; plus one real Google test account deliberately **not** in the table | Step 1: allow, deny, deactivate, role change, last-admin protection |
| `customers` | About 25: new, regular, premium, past; one with a referral code (`YCTEST01`); **two sharing the same phone** (6a dedupe report); IDs up to `C998` so the next ones cross `C999 → C1000` | Lists, search, ID-generation and dedupe tests |
| `orders` | About 60 across all 14 statuses, every pickup and payment status, express and normal. Amounts **₹298, ₹299 and ₹350** with and without referral codes, delivered and unpaid as well as delivered and paid | Workflow, analytics, delayed flag, Step 7 referral rules |
| `payments` | Partial and full payments on some orders | Payment status, the referral "paid" trigger |
| `subscriptions` / `subscription_orders` | 2 active, 1 expired, 1 near its limit | Subscription screens and usage |
| `whatsapp_sessions` | 1 intent, 1 payment-pending | WhatsApp queue |
| `audit_logs` | Generated during tests | Login and denial logging |
| `environment_marker` | `'test'` | Verification and the code guard |

Later steps add `website_bookings` (step 6) and the wallet ledger (step 7) to the seed.

---

## 5. How we verify that the test environment can't reach production data

Run all of these after setup. Every check must pass before the Ignored Build Step is removed.

| # | Check | Pass condition |
|---|---|---|
| V1 | Vercel → Settings → Environment Variables (or `vercel env ls`) | `DATABASE_URL` appears **twice**: one row **Production only**, one **Preview only**. No row covers both. Same for `NEXTAUTH_SECRET` and `WHATSAPP_INTERNAL_API_SECRET`. No Sheets or Supabase variables on Preview |
| V2 | Neon console: compare the connection host of the test project and the production project | Different project IDs and endpoint hosts |
| V3 | Credential cross-check (you, with the test URL): connect to the **production host** using the test role and password | Authentication **fails** |
| V4 | Old-password check after rotation (§3.3): connect using the production URL from the old local `.env` | Authentication **fails** |
| V5 | Deploy one preview of a test branch, sign in as the test admin, open `/api/admin/health` | Reports the test marker and test host (needs the small health-route addition, which returns no secrets) |
| V6 | During the V5 preview session, check the **production** project's Neon console (Monitoring / active connections) | No connections from the preview test window |
| V7 | Query the test database | Only seed counts; every customer phone matches `90000000NN`; no `@` addresses other than `example.com` |
| V8 | Locally, search for the production host in local env files | No local `.env*` file contains the production host |
| V9 | Code guard: start the app locally with `DATABASE_URL` set to the production host and `VERCEL_ENV` unset | Fails at startup with a clear error, before any query |
| V10 | On the preview, sign in with the real Google account that's **not** allowlisted | Denied (`AccessDenied`), and the denial is in the test database's `audit_logs` |

---

## 6. Setup steps you perform manually

Do them in this order. The ⚠ steps affect Production.

**A. Freeze previews (before anything is pushed)**
1. In Vercel → `v0-laundry-crm-design` → Settings → Git → **Ignored Build Step**, enter the command from §3.5. Save.

**B. Create the Neon test project**
1. Neon console → **New project** → name `youclean-crm-test`, the same Postgres major version as production, any region.
2. Create database `youclean_test` and role `crm_test_app`.
3. Copy the connection string in the same format (pooled or direct) as production's. Store it in your password manager as **"YouClean CRM – TEST DB"**.
4. Note the **production** endpoint host (host only, no password) for `PRODUCTION_DATABASE_HOST`.

**C. Build the schema and seed (after approval, by you or by me with the test URL)**
1. `DATABASE_URL="<TEST URL>" npx prisma migrate deploy`. Expect the 6 migrations to apply on the empty database.
2. Create the marker: `environment_marker = 'test'`.
3. Run `scripts/seed-test.ts`. It has to be written first (a CRM change, later approval).

**D. Split the Vercel variables**
1. Vercel → Settings → Environment Variables → `DATABASE_URL` → **Edit** → untick **Preview** → Save. It's now Production-only. Production isn't affected.
2. **Add** `DATABASE_URL` = TEST URL, Environment: **Preview** only. Mark it **Sensitive**.
3. `NEXTAUTH_SECRET`: edit to Production only (plus Development if wanted), then add a Preview-only value from `openssl rand -base64 32`.
4. `WHATSAPP_INTERNAL_API_SECRET` (Preview row): replace it with a new value from `openssl rand -base64 48`.
5. `NEXTAUTH_URL`: untick Preview.
6. Untick Preview on `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `RBAC_ADMIN_EMAILS`. Leave Production as it is for now.
7. Add `PRODUCTION_DATABASE_HOST` = production host, for Preview and Development.

Changes to Production-scoped variables take effect only after a production redeploy. Step D changes no Production values.

**E. Google OAuth test client (optional but recommended, to test the Step 1 denial path)**
1. Google Cloud Console → APIs & Services → Credentials → **Create OAuth client ID** (Web) → name "YouClean CRM – test".
2. Authorised redirect URI: the **branch alias** of the test branch, e.g. `https://v0-laundry-crm-design-git-<branch>-vimalamdes13-9974s-projects.vercel.app/api/auth/callback/google`. Branch aliases stay stable across pushes.
3. Add its ID and secret to Vercel as **Preview-only** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. Untick Preview on the production client's rows.
4. Prepare two Google test accounts: one to allowlist in the test `users` table, and one not.

**F. Local development**
1. Replace `DATABASE_URL` in the CRM's `.env` and `.env.local` with the TEST URL.
2. Delete `.env.local.vercel`. It's a stale pull of Production variables.
3. Keep the production URL only in Vercel and your password manager.

**G. Code guard and seed (CRM changes, for separate approval)**
- `lib/prisma.ts` guard (§3.4), the guard in data-writing scripts, `scripts/seed-test.ts`, and the `environment_marker` check in `/api/admin/health`.

**H. Verify (§5, V1–V3, V7–V10)** before removing the freeze.

**I. ⚠ Rotate the production database password (with the Step 1 production deploy window)**
1. Neon console → production project → Roles → reset the app role's password.
2. Update the **Production** `DATABASE_URL` in Vercel → **redeploy production** straight away. The CRM is unavailable between the reset and the redeploy, so do it at a quiet time.
3. Run V4.

**J. Lift the freeze**
1. After V1–V10 pass, remove the Ignored Build Step, or narrow it to skip only branches you don't want built.

---

## What this procedure does not do
- It doesn't migrate, seed or touch the production database.
- It doesn't apply the Step 1 migration to production; that follows the Step 1 deploy order in §16.
- It doesn't copy any real customer data anywhere.

---

## 7. Review corrections (2026-10-09)

The architecture (Production Neon ⇄ Production Vercel; a separate TEST Neon project ⇄ Preview Vercel; no shared credentials) is **consistent with the current CRM**:
- It uses a single Prisma `url` with no `directUrl`.
- NextAuth v4 works on Preview without `NEXTAUTH_URL`.
- No CRM code reads `VERCEL_ENV` today.
- Nothing in the CRM needs a production-only service to start.

The corrections below **replace** the matching parts of §1–§6. The earlier text is kept for history.

| # | Area | Correction | Why |
|---|---|---|---|
| C-1 | `environment_marker` (§1, §3.4, §4) | Create it as a **Prisma model plus migration**: an empty table in every database. Only the TEST setup inserts `'test'`. Production keeps it empty, so seeding refuses there (decision P-01) | An unmanaged table causes Prisma drift: `prisma migrate dev` against TEST would offer to **reset the database** to remove it |
| C-2 | Host guard (§3.4) | Compare a **normalised** host (lowercase, strip `-pooler`, ignore the port). If `PRODUCTION_DATABASE_HOST` is missing in a non-production environment, **fail closed** | Neon pooled and direct hosts differ (`ep-x-pooler…` vs `ep-x…`). A missing variable mustn't disable the guard |
| C-3 | Seed guard (§4) | `seed-test.ts` refuses unless **all** of these hold: `VERCEL_ENV !== "production"`; the host isn't the production host; `environment_marker = 'test'`; the database has **no non-synthetic customers** (any customer outside the synthetic phone/email pattern blocks it); and the operator types the printed host to confirm | Defence against every known misconfiguration |
| C-4 | Password rotation (§3.3, §6 I) | Do it in its **own** maintenance window, **not** combined with the Step 1 deploy (decision P-02) | A Vercel deployment keeps the variables it was built with. After rotation, **Instant Rollback to any earlier deployment fails** (old password). Separate windows keep Step 1 rollback-safe |
| C-5 | Rotation rollback (new) | Rollback after rotation = fix the Production `DATABASE_URL` and **redeploy**, never Instant Rollback. Keep the new password in the password manager **before** resetting. Neon has no "undo" for a password reset | Recovery has to be planned in advance |
| C-6 | Google OAuth on Preview (§6 E) | Use a **short, long-lived branch** (`staging`) for OAuth testing. Copy the redirect URI from that branch's actual alias in Vercel after the first deploy. Don't predict it | The branch-alias label is limited to 63 characters, and long names (e.g. `security-staff-allowlist`) get truncated or hashed, so a predicted URI may be wrong |
| C-7 | Variables to remove from **Development** too (§2) | The Sheets service-account key, Sheets ID and `RBAC_ADMIN_EMAILS` are also scoped to **Development**. `vercel env pull` therefore writes them to local files. Untick Development as well (in §16 step 2) | ENV-008 |
| C-8 | `.env.example` (plan §16 step 3) | `.env.example` is **ignored and untracked** (matches `.env*`), so editing it changes nothing in git. Add the exception `!.env.example` to `.gitignore` and commit a scrubbed example, as a separate commit | Repository fact, 2026-10-09 |
| C-9 | Synthetic phones (§4) | India has **no reserved fictional range**, so `90000000NN` could belong to a real person. Proposal P-03: `60000NNNNN`, still format-valid. The real safeguard stays: **no messaging credentials** in TEST | Honest risk statement |
| C-10 | Allowlisted Google test user (§4) | The seed uses `@example.com` placeholders only. The **real** Google test account email is added by you through `create-admin` against TEST, and is **never committed** | Test data has to be 100% synthetic in git (E4) |
| C-11 | Migration apply (§1) | The 6 migrations passed a static check (Postgres syntax; 11 `CREATE TABLE` for 11 models). That they apply cleanly to an empty database is **unverified** until TEST step 5. If it fails: drop and recreate the TEST database, fix through a new migration in a focused commit, and never edit an applied production migration | Recovery path |
| C-12 | Recovery if the TEST setup fails (new) | Every TEST step is disposable: delete the TEST project and start again. **Never** "fix" Preview by re-ticking Preview on the production `DATABASE_URL`; the freeze (§3.5) stays on until §5 passes | Fail safe, not fail open |
| C-13 | Rollback of the variable split (new) | Before changing anything, record each variable's current scope (a names-only `vercel env ls` output). Untick and add operations are reversible in the dashboard; values come from the password manager. Production values aren't edited in §6 D, so Production can't break from the split | Reversibility |
| C-14 | Freeze side effect (§3.5) | With the Ignored Build Step, **v0** pushes (it has its own `v0/*` branch) won't build previews either. That's intended | Avoid surprise |
| C-15 | Cost (new) | See `IMPLEMENTATION-PLAN.md` §16 cost table. A Neon free-tier project is expected to be enough for TEST; **confirm** the account's current free-tier project limits before creating one | Cost control |

---

## 8. Implemented tooling (2026-10-09 overnight: COMPLETED LOCALLY · NOT PUSHED · NOT DEPLOYED)

These replace the "CRM change for later approval" items in §3.4, §4 and §6 G. They're committed on CRM branch `security/staff-allowlist` (`b2728c9`, `0b02cf4`, `6e04c28`, `bff469b`, `a13fca8`). **None of them has been run against a database.**

| Need | Implementation |
|---|---|
| Production-host guard (§3.4, C-2) | `lib/dbEnvironment.ts`, a Prisma query hook in `lib/prisma.ts`, and guards in every database script. Environment = `VERCEL_ENV`, else `APP_ENV` (`development` or `test` only), else `NODE_ENV=test`, else `development`. Outside production, `PRODUCTION_DATABASE_HOST` is **required** (fail closed). Pooled and direct Neon hosts compare equal. **There's no override flag** |
| Marker (C-1) | `EnvironmentMarker` model + migration `20261009000001_environment_marker` (an empty table; CHECKs allow only one `'test'` row). Written only by `npm run db:mark-test`, which refuses unless `APP_ENV=test`, the database isn't the production host, the database is unmarked, every business table is empty, and the host is typed back |
| Synthetic seed (§4, C-3, C-9, C-10) | `npm run db:seed` → `scripts/seed-test.ts` + `scripts/synthetic-data.ts`. It refuses unless `APP_ENV=test`, the guard passes, the marker is `'test'`, every existing customer is synthetic, and the host is typed back. Passwords come from `SEED_TEST_PASSWORD` (12+ characters, never committed). It's idempotent |
| Old real-data seed | `scripts/seed.ts` exits immediately (DATA-001); `lib/data.ts` itself is unchanged |
| Prisma CLI | `npm run db:deploy-test` (guard, then `prisma migrate deploy`); `db:migrate` / `db:reset` need a marked TEST database; `db:studio` runs the guard first |

**Variables needed for TEST** (in addition to §2):

| Variable | Preview (Vercel) | Local TEST shell |
|---|---|---|
| `PRODUCTION_DATABASE_HOST` | Production host only (not secret) | Same |
| `APP_ENV` | Not needed (`VERCEL_ENV=preview` is set by Vercel) | `test` |
| `SEED_TEST_PASSWORD` | Never | Only while seeding; from the password manager |

**Exact TEST setup order** (it replaces §6 C; each step needs approval, see `TOMORROW-EXECUTION-CHECKLIST.md`):
1. `APP_ENV=test DATABASE_URL=<TEST URL> PRODUCTION_DATABASE_HOST=<prod host> npm run db:deploy-test`, which applies 8 migrations to the empty TEST database
2. `… npm run db:mark-test`, which writes the `'test'` marker
3. `… SEED_TEST_PASSWORD=<from password manager> npm run db:seed`, which loads the synthetic data
4. `… npm run db:assert-test`, which should print "is a marked TEST database"

**Behaviour change to know about:** once these commits are deployed or run locally, **any** local tool or Preview deployment without `PRODUCTION_DATABASE_HOST` refuses to use a database. Production (`VERCEL_ENV=production`) is unaffected. Local backup and export of production data are no longer possible from a laptop by design; use the admin `/api/backup` in the deployed CRM.

**Expected warning:** `prisma migrate dev` against TEST will propose renaming the `sub_orders_*` indexes (DB-001, pre-existing). Don't accept it as part of other work; it's a separate migration.


---

## 9. Release-gate corrections to §8 (2026-10-09)
- **"Guards in every database script" needs a caveat:** `scripts/export.mjs` overwrites shell variables with `.env.local` values (ENV-009), so it can swap a TEST URL for the production one. Don't run it until it's fixed.
- **The guard runs before every query, not before every connection:** an interactive `prisma.$transaction` connects and opens a transaction before the guard can throw (ENV-010).
- **Direct `npx prisma` CLI calls bypass the guard** (ENV-012). A manually set `VERCEL_ENV=production` disables it (ENV-011).
- **Migration compatibility with real data is unproven** until steps 4–6 of the checklist run on TEST (MIG-001, MIG-003).
