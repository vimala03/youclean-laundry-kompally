# YouClean: Changelog

_Factual record of changes made, newest first. Each entry gives the repo, branch, commit, decision ID and whether it was pushed or deployed. Plans and proposals don't belong here; see `IMPLEMENTATION-PLAN.md`._

## 2026-10-09: INC-001 containment (CRM branch, local only, NOT pushed or deployed)

| Commit | Fix |
|---|---|
| `ad0aa0a` | ENV-009: `export.mjs` keeps explicit environment variables |
| `945d33d` | ENV-010: guard checked before the Prisma client is created |
| `bcb1188` | REF-001: whole-rupee promo rounding |
| `57c54a5` | REF-002: deletion refused for orders with referral or wallet history |
| `f9d02ad` | REF-003: ledger-safe import and restore; unused ledger-bypassing helpers removed |

**Checks:** offline vitest 211/211 (excluding `prismaGuard.test.ts`), tsc clean, eslint 0 errors. `next build` was not run. No database, Prisma command or script was executed.

**Rollback:** revert newest-first; each commit is a focused fix.

## 2026-10-09: release-gate review (no code changes)

- **Incident INC-001** (`SECURITY.md`): a review probe of `scripts/export.mjs` reached the real database from `.env.local`. Read-only queries ran; nothing was printed, written to disk or written to the database. All script execution stopped afterwards.
- **Findings recorded:** ENV-009 to ENV-013, REF-001 to REF-008, SEC-017, SEC-018, MIG-001 to MIG-003.
- **Docs corrected:** `TOMORROW-EXECUTION-CHECKLIST.md` (release-gate blockers, P2/P5 corrections); `CRM-TEST-ENVIRONMENT.md` §9; `ARCHITECTURE.md`.
- **CRM branch:** unchanged at `a13fca8`. Re-run: vitest 174/174, tsc clean, eslint 0 errors, offline build passes.

## 2026-10-09 (overnight, local only)

All on CRM branch `security/staff-allowlist`, which now has **7 commits** (`5abcee1` plus the 6 below). Status for all of them: **COMPLETED LOCALLY · NOT PUSHED · NOT DEPLOYED · no database contacted, no migration applied.**

**Verified at `a13fca8`:**
- vitest 174/174, tsc clean, eslint 0 errors (43 pre-existing warnings), offline `next build` passes.
- An offline structural check (`prisma migrate diff --from-empty`) shows the schema and migrations agree on all 13 tables and columns. The only difference is a pre-existing index-name issue (DB-001).

**Rollback:**
- The branch is unmerged, so `main` and production are untouched.
- To undo part of the work, revert **newest-first**. `bff469b` and `9e82fe9` also revert cleanly on their own. `0b02cf4` reverts without git conflicts, but the seed code needs it to build, so revert `6e04c28` first. The others depend on earlier commits.

| Commit | Purpose | IDs | Rollback notes |
|---|---|---|---|
| `9e82fe9` fix: preserve existing CRM user roles | An omitted role keeps the existing role; last-admin guard in POST, PATCH and `create-admin` | SEC-004, SEC-005 | Revert (independent) |
| `b2728c9` fix: block non-production environments from production database | `lib/dbEnvironment.ts` + a Prisma query hook + guards in all database scripts. Fails closed without `PRODUCTION_DATABASE_HOST`; no override flag | ENV-001, ENV-005, C-2 | Revert after `a13fca8`. **Effect:** local and Preview database use needs `PRODUCTION_DATABASE_HOST`; production is unaffected |
| `0b02cf4` feat: add CRM test environment marker | `EnvironmentMarker` model + migration `20261009000001` (an empty table; CHECK allows only `'test'`); `scripts/mark-test-database.ts` | C-1, P-01 | Revert after the seed commit; the migration is unapplied |
| `6e04c28` test: add guarded synthetic CRM seed | Deterministic synthetic dataset; `db:seed` → `seed-test`; real-data `scripts/seed.ts` retired; `db:migrate` / `db:reset` behind `assert-test-database` | E4, DATA-001 (partial), C-3 | Revert after `bff469b` |
| `bff469b` feat: enforce approved referral and wallet rules | Server pricing; ₹100 friend discount; ₹100 reward exactly once when Delivered + fully paid; wallet ledger; 20% cap; migration `20261009000002` | D5, R1–R6, SEC-008, SEC-009 | Revert (independent); the migration is unapplied |
| `a13fca8` chore: guard Prisma CLI database commands | `db:deploy-test` and `db:studio` check the guard first | ENV-001 | Revert (independent) |

**Docs (website repo, `main`, uncommitted):** `BOOKING-API-CONTRACT.md` and `TOMORROW-EXECUTION-CHECKLIST.md` added; `SECURITY`, `DATA-MODEL`, `ARCHITECTURE`, `IMPLEMENTATION-PLAN`, `CRM-TEST-ENVIRONMENT` and this file updated.

**REQUIRES EXTERNAL ACTION (not done):** everything in `TOMORROW-EXECUTION-CHECKLIST.md`.

## 2026-10-09

**Docs (website repo, `main`, uncommitted)**
- Added `docs/SECURITY.md` (findings register: SEC, ENV and DATA IDs), `docs/DECISIONS.md`, `docs/CHANGELOG.md`, `docs/ARCHITECTURE.md` and `docs/DATA-MODEL.md`.
- Added the review corrections to `docs/CRM-TEST-ENVIRONMENT.md` (§7).
- Updated `docs/IMPLEMENTATION-PLAN.md` (current status and links).

**Docs (website repo, `main`, uncommitted)**
- Added `docs/CRM-TEST-ENVIRONMENT.md`, the Step 0a procedure (nothing created).

**CRM: `5abcee1` `fix: secure CRM staff authorization`**
- **Where:** CRM repo, branch `security/staff-allowlist`.
- **Decisions:** A1, E3. **Fixes:** SEC-001, SEC-002, SEC-003.
- **What changed:** the `users` table is the only allowlist; there's no default role; the `jwt` callback throws for revoked or unknown users; roles are re-checked every 5 minutes; sessions last 12 hours; `proxy.ts`; the admin users API; `create-admin` Google-only mode with a database-host confirmation; audit logging for logins.
- **Migration:** the additive migration `20261008000001_staff_allowlist` was written but **not applied**.
- **Tests:** vitest, 29 tests.
- **Status:** **local only**: not pushed, not deployed, no database touched.
- **Rollback:** `git switch main` (the branch is unmerged). After a future deploy, roll back through Vercel Instant Rollback; the migration is additive and backward compatible.

## 2026-10-08

**Docs (website repo, `main`, uncommitted)**
- `AUDIT-REPORT.md` revised with the CRM findings (§H, §M, §N).
- `docs/IMPLEMENTATION-PLAN.md` gained §10 (rewritten) and §16 (the CRM work plan).

**Website: Phase 0 hotfixes (W-04) (`main`, uncommitted, not deployed)**
- `index.html`: removed the fake referral stats; corrected the review card heading.
- `.vercelignore`: an allowlist so only the public site files deploy.

**Read-only investigations (no changes)**
- Reviewed the CRM code.
- Ran Vercel environment, deployment and project inspection with the CLI and API.
- Checked git history for customer data.
