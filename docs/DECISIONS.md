# YouClean: Decision Log

_Created 2026-10-09 from the decisions recorded in chat on 2026-10-08 and 2026-10-09._

**How this log works:**
- **Append only.** A decision is never edited to mean something new. If it changes, add a new ID and mark the old one `SUPERSEDED by <ID>`.
- **Status values:** `APPROVED` · `APPROVED-NOT-EXECUTED` · `SUPERSEDED` · `PROPOSED`.
- **Cross-references:** `SECURITY.md` (finding IDs), `IMPLEMENTATION-PLAN.md` (§ references).

## Website direction (approved before the CRM review)

| ID | Date | Decision | Status |
|---|---|---|---|
| W-01 | 2026-10-08 | The website is a clean Next.js App Router build. `redesign/` is legacy and isn't continued | APPROVED |
| W-02 | 2026-10-08 | Keep the existing light YouClean brand (`tokens.css`, logo, specs); no dark "luxury" style | APPROVED |
| W-03 | 2026-10-08 | Nothing invented: unconfirmed business facts render as "BUSINESS INPUT REQUIRED" fallbacks | APPROVED |
| W-04 | 2026-10-08 | Phase 0 static-site hotfixes (fake referral stats, misleading review heading, `.vercelignore` allowlist), done locally and not deployed | APPROVED |
| W-05 | 2026-10-08 | Interim lead destination: a Google Sheet plus email (plan §0 "J") | **SUPERSEDED by D2** |

## CRM integration and security

| ID | Date | Decision | Status |
|---|---|---|---|
| D1 | 2026-10-08 | Website bookings go into a dedicated CRM booking queue (`WebsiteBooking`). The website never creates customers or real orders. Flow: booking → intent → `WB-` reference → CRM queue → staff confirm → CRM creates or updates the customer and order → WhatsApp confirmation → operations | APPROVED |
| D2 | 2026-10-08 | Once the endpoint exists, the CRM is the primary store for website bookings. The Sheet and email are only a fallback or alert; Sheets is never primary | APPROVED |
| D3 | 2026-10-08 | CRM security comes before integration and before the visual redesign. Order: allowlist → revoke the service-account key → config cleanup → untrack `dev.db` → history review (report only) → booking endpoint → integration → end-to-end test | APPROVED |
| D4 | 2026-10-08 | Booking reference prefix `WB-` (`WB-0001`), assigned by the CRM, distinct from `YC-0001` order IDs | APPROVED |
| D5 | 2026-10-08 | Referral target: the friend gets ₹100 off the first qualifying paid order (₹299 or more); the referrer gets ₹100 wallet credit after delivery. The CRM is changed and tested first. The current 5% offer is never advertised, and no referral page goes up before it works | APPROVED |
| D6 | 2026-10-08 | Cleanup: untrack and gitignore `prisma/dev.db`; revoke the obsolete Google service-account key; remove Supabase config if it's genuinely unused. **No history rewrite** without separate approval, and none for the key (never committed) | APPROVED (not executed) |
| D7 | 2026-10-08 | Security rules: no public endpoint exposes customer data; no CRM or service-account credentials in the website frontend; the website never connects to the CRM database | APPROVED |
| D8 | 2026-10-08 | The CRM URL stays a config value (`CRM_BASE_URL`) until confirmed. The Neon region must be verified, not guessed. Membership is an operational CRM capability, **not** a public offer, until confirmed | APPROVED |
| A1 | 2026-10-08 | Staff recovery is through `npm run create-admin` only, with no env-variable bypass. The `users` table is the source of truth for staff authorization | APPROVED (implemented locally in `5abcee1`) |
| H1 | 2026-10-08 | The history purge is approved in principle. **Before execution:** verify branches, identify unique work, create a named backup, confirm the exact commits and files, confirm collaborators and clones, and show the final destructive commands for approval. Merged branches are cleaned up only after the purge is verified | APPROVED-NOT-EXECUTED |
| R1 | 2026-10-08 | The ₹299 minimum is measured **before** the referral discount | APPROVED |
| R2 | 2026-10-08 | "Paid" means fully paid | APPROVED |
| R3 | 2026-10-08 | The referred customer must be genuinely new to YouClean | APPROVED |
| R4 | 2026-10-08 | Wallet: usable on future eligible orders, maximum redemption 20% of order value, never cash, kept in a ledger, never negative. The rules are configurable | APPROVED |
| R5 | 2026-10-08 | No reward cap initially. Full referral and wallet audit records; prevent duplicate rewards, self-referral and repeat rewards for the same order; basic abuse protection | APPROVED |
| R6 | 2026-10-08 | Referral discounts don't stack with promos. The server alone decides the discount. The hardcoded promo codes are BUSINESS INPUT REQUIRED until confirmed | APPROVED |
| B1 | 2026-10-08 | If the CRM is down, the page shows "Request received, YouClean will confirm your pickup" **without** a booking number. Never invent a reference; the real `WB-` number is created when the CRM accepts the booking | APPROVED |
| E1 | 2026-10-09 | Local `backups/` and `exports/` are kept temporarily, treated as sensitive, never committed or shared, and must be encrypted or restricted. They're not deleted until the history cleanup and recovery plan are complete | APPROVED |
| E2 | 2026-10-09 | The local `prisma/dev.db` files may be deleted once confirmed unnecessary and holding no unique data. That was confirmed on 2026-10-08 (byte-identical to `backups/safe/youclean-working.db`). They're deleted together with untracking (§16 step 4) | APPROVED (not executed) |
| E3 | 2026-10-09 | Step 1 (staff allowlist) is approved as a **local-only** commit: no push, PR, deploy, migration or `create-admin` run | APPROVED (done: `5abcee1`) |
| E4 | 2026-10-09 | Test data must be 100% synthetic. `lib/data.ts`, `dev.db`, backups and exports must never be used as test data (DATA-001) | APPROVED |
| E5 | 2026-10-09 | Change control: plan → implement → test → review the diff → update docs → commit → verify git status → only then consider a push or deploy. One purpose per commit; never mix security, data cleanup, infrastructure, booking API, website redesign or referral logic | APPROVED |

## Proposed (awaiting approval)

| ID | Decision | Notes |
|---|---|---|
| P-01 | Store `environment_marker` as a Prisma-managed table (empty in production, `'test'` in TEST), instead of an unmanaged table | Avoids Prisma drift; see `CRM-TEST-ENVIRONMENT.md` §7 |
| P-02 | Rotate the production database password in its **own** maintenance window, not combined with the Step 1 deploy | Keeps Step 1's instant rollback usable |
| P-03 | Synthetic phone convention: `60000NNNNN` (format-valid, documented as fake; no messaging credentials in TEST) | India has no reserved fictional range |
| P-04 | CRM-specific docs (`SECURITY`, `DATA-MODEL`, `CRM-TEST-ENVIRONMENT`) move into the CRM repo, committed there | They live in the website repo for now, uncommitted |
| P-05 (A1-b) | Production staff rows (Google-only staff before the Step 1 deploy, and lock-out recovery) are added through the Neon SQL editor as an approved, logged production action. Local `create-admin` can't reach production any more (guard `b2728c9`), and no bypass flag is added | Needed before production deploy step P1 (`TOMORROW-EXECUTION-CHECKLIST.md`) |
