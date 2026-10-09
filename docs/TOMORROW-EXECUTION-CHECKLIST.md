# Tomorrow: Execution Checklist (CRM security, TEST environment, production)

_Prepared 2026-10-09 overnight._

**Starting state:**
- CRM branch `security/staff-allowlist` at **`a13fca8`**: 7 local commits, **NOT pushed, NOT deployed, no migration applied, no database contacted.**
- Website repo docs are uncommitted.

**Legend:**
- 🔒 **STOP / APPROVAL:** don't continue until you've explicitly approved this exact step.
- ⚠ **Production-affecting.**
- Keep secrets in your password manager. Never paste them into chat, docs or commits.

---

## ⛔ Release-gate blockers (added by the 2026-10-09 review): fix before step 3

Each fix is a focused local commit with tests, and needs your approval first (`SECURITY.md`, release-gate section):
1. **ENV-009:** make `scripts/export.mjs` keep variables that are already set. **Until then, don't run `export.mjs` or `import-orders-csv.mjs` at all.**
2. **REF-001:** round promo discounts to whole rupees on the server.
3. **REF-002 / REF-003:** stop `deleteOrder` and the restore/import paths from bypassing the ledger and the exactly-once rule.
4. **MIG-001:** wrap the three new migrations in an explicit transaction.
5. **Recommended:** ENV-010 (eager guard), SEC-018 (`example.com` addresses).

**Use only the npm wrappers** (`db:deploy-test`, `db:mark-test`, `db:seed`, `db:assert-test`, `db:studio`). Direct `npx prisma …` commands aren't guarded (ENV-012).

## 1. Review the overnight commits (local, read-only)

```bash
cd "~/Documents/Youclean CRM/v0-laundry-crm-design"
```
```bash
git log --oneline main..security/staff-allowlist
```
```bash
git show --stat 9e82fe9 b2728c9 0b02cf4 6e04c28 bff469b a13fca8
```
- Read the commit messages and `docs/CHANGELOG.md` (overnight entry).
- **Pass:** 7 commits from `5abcee1` to `a13fca8`, all of them yours to approve.

## 2. Review git status (local, read-only)

```bash
git status
```
```bash
npm test
```
```bash
npx tsc --noEmit
```
- **Pass:** clean working tree; 174/174 tests; no type errors.
- 🔒 **Approve the overnight commits as the baseline for TEST.**

## 3. Create the isolated Neon TEST project 🔒 (external, free tier expected)
- **Before you start:**
  - Confirm the Neon free-plan project limit for your account (cost rule).
  - Set Vercel → CRM → Settings → Git → **Ignored Build Step** to `if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi`, so pushes can't create previews on production data.
- **Create it:** follow `CRM-TEST-ENVIRONMENT.md` §6 B, with the §7 corrections: a separate project `youclean-crm-test`, database `youclean_test`, role `crm_test_app`.
- **Record (password manager):** the TEST URL, and the **production** host name only (no password) for `PRODUCTION_DATABASE_HOST`.
- **Verify the region of the production project** in the Neon console while you're there (ENV-006, for the privacy policy).

## 4. Apply migrations to TEST only 🔒
In a terminal where **only TEST values** are exported:
```bash
export APP_ENV=test DATABASE_URL='<TEST URL>' PRODUCTION_DATABASE_HOST='<production host>'
```
```bash
npm run db:deploy-test
```
- **Pass:** the guard prints "…is not the production host (environment: test)", then 8 migrations apply.
- **If it fails:** delete and recreate the TEST database (C-11, C-12). Never edit an applied migration.

## 5. Add and verify the TEST marker 🔒
```bash
npm run db:mark-test
```
```bash
npm run db:assert-test
```
- **Pass:** "Marked … as a TEST database", then "… is a marked TEST database".

## 6. Run the synthetic seed 🔒
```bash
SEED_TEST_PASSWORD='<12+ chars from your password manager>' npm run db:seed
```
- **Pass:** 26 customers · 35 orders · payments · 2 referrals · 2 wallet rows · 3 subscriptions · 2 WhatsApp sessions · 5 users.
- **Optional:** add your **real** Google test account to TEST only, with `npm run create-admin` (Google-only, role staff). It is never committed (C-10).

## 7. Verify there's no real data in TEST (read-only)
In the Neon SQL editor of the **TEST** project:
```sql
SELECT count(*) FROM customers WHERE phone !~ '^60000[0-9]{5}$' OR email NOT LIKE '%@example.com' OR name NOT LIKE 'Test %';
```
```sql
SELECT count(*) FROM users WHERE email NOT LIKE '%@example.com';
```
- **Pass:** the first query returns `0`. The second returns `0`, or `1` if you added your Google test account.

## 8. Configure Preview with TEST credentials 🔒 (Vercel project settings; Production values untouched)
Follow `CRM-TEST-ENVIRONMENT.md` §6 D:
- **Split shared variables:**
  - `DATABASE_URL`: Production-only, plus a new Preview-only value set to TEST.
  - New Preview `NEXTAUTH_SECRET`.
  - New Preview `WHATSAPP_INTERNAL_API_SECRET`.
- **Add:** `PRODUCTION_DATABASE_HOST` for Preview and Development.
- **Untick Preview** on `NEXTAUTH_URL`, the Sheets and service-account variables, the Supabase variables and `RBAC_ADMIN_EMAILS`.
- **Before changing anything:** save a names-only `vercel env ls` output (C-13).

## 9. Verify Preview isolation 🔒 (first push of a CRM branch)
- 🔒 **Approve pushing** `security/staff-allowlist`. It builds a Preview only if you narrow the freeze to allow this branch. Don't merge to `main`.
- **Run checks V1–V10** from `CRM-TEST-ENVIRONMENT.md` §5. The key ones:
  - `DATABASE_URL` shows two rows with no overlap.
  - The preview's `/api/admin/health` reports TEST counts.
  - The production Neon project shows no connections from the preview.
  - The guard rejects production-host misconfiguration (V9). The guard compares hostnames only (ENV-013), so separate credentials remain the real control.

## 10. Test authentication (on the Preview)
- **Allowed:** the test admin, manager and staff log in with passwords.
- **Denied:**
  - the inactive user
  - a Google account that isn't allowlisted (AccessDenied, and `login-denied` in the TEST `audit_logs`)
- **Admin users API:**
  - a POST without `role` keeps the role (SEC-004)
  - removing the last admin is refused
- **Revocation:** deactivating a user ends their session within 5 minutes.

## 11. Test the referral system (on the Preview, against TEST data)
- **Create orders for:**
  - a new friend with subtotal ₹298: rejected with 422
  - ₹299: ₹100 off
  - ₹350: ₹100 off
  - an existing customer using a code: rejected
  - a self-referral: rejected
  - two different codes: rejected
- **Rewards:**
  1. Move C964/C965 orders to Delivered + fully paid: the referrer gets +₹100 **once**, with a matching ledger row.
  2. Unpaid or partial orders: no reward until a payment completes them.
  3. A bulk Delivered change triggers rewards.
  4. Repeating the actions (or `POST /api/referral/process` as admin) credits nothing extra.
- **Wallet:** an order with `applyWallet: true` is capped at 20%; cancelling it returns the credit once.

---

## ⚠ Production deploy of the CRM security work: own window, own approval

_This is required because SEC-001 (any Google account becomes staff) is **live in production now**._

**P0. Read-only pre-checks** in the Neon SQL editor, **production** project. They change nothing:
```sql
SELECT referee_id, count(*) FROM referrals GROUP BY 1 HAVING count(*) > 1;
```
```sql
SELECT order_id, count(*) FROM referrals GROUP BY 1 HAVING count(*) > 1;
```
```sql
SELECT count(*) FROM customers WHERE wallet_balance < 0;
```
```sql
SELECT email, role FROM users ORDER BY email;
```
- **Pass:** the first three return 0 rows / 0. The last lists every staff account that should keep access.
- 🔒 **Decide the list of Google-only staff** who must keep access.

**P1.** 🔒⚠ **Decision A1-b (new): add Google-only staff to the production `users` table.**
- **Why this needs a decision:** local `create-admin` can no longer reach production by design (the guard). Your approved recovery path, A1 (create-admin only), now needs a production-side alternative.
- **Proposal:** run one `INSERT INTO users (id, email, password_hash, name, role, active, created_at) VALUES (gen_random_uuid(), '<email>', '', '<name>', 'staff', true, now());` per person, in the Neon SQL editor (production). Do this **after** P2, because the `active` column comes from the migration.
- **Same mechanism for lock-out recovery,** recorded as A1-b, so there's still no app-level bypass.

**P2.** 🔒⚠ **Apply the 3 pending migrations to production.** They're additive and backward compatible with the currently deployed code:
- `20261008000001_staff_allowlist`
- `20261009000001_environment_marker` (an empty table)
- `20261009000002_referral_wallet`: it aborts by itself if the P0 duplicates exist.
- **How:** from a machine with the production `DATABASE_URL`. Running `prisma migrate deploy` outside the guard is a deliberate production action; document who ran it and when.
- **Rollback:** the migrations are additive, and the old code ignores the new columns and tables.

**P3.** 🔒⚠ **Insert the Google staff rows (P1).**

**P4.** 🔒⚠ **Merge `security/staff-allowlist` → `main`.** A push to `main` triggers a **production** deploy. The production environment needs **no new variables**: the guard allows `VERCEL_ENV=production`.

**P4a. Read-only ledger reconciliation (REF-004)**, run immediately after P4:
```sql
SELECT c.id, c.wallet_balance, COALESCE(SUM(w.amount),0) AS ledger FROM customers c LEFT JOIN wallet_transactions w ON w.customer_id = c.id GROUP BY c.id, c.wallet_balance HAVING c.wallet_balance <> COALESCE(SUM(w.amount),0);
```
**Pass:** 0 rows. If any rows come back, stop and add `adjustment` ledger rows (needs approval).

**P5. Verify Production:**
- Google login works for allowlisted staff and is refused for others.
- Password logins work.
- Creating an order works.
- `/api/auth/providers` is unchanged.
- **Rollback:** Vercel Instant Rollback to the previous deployment. That works because the database credentials haven't changed yet.

**P6.** 🔒⚠ **Rotate `NEXTAUTH_SECRET`** (Production), then redeploy. Everyone signs in again, and old sessions, including any from unauthorised Google accounts, are invalidated.

**P7. Read-only audit-log review:**
```sql
SELECT DISTINCT actor_email FROM audit_logs ORDER BY 1;
```
Compare the result with the allowlist and report any unknown emails.

---

## 12. Review the production credential rotation (no action)
- Re-read `CRM-TEST-ENVIRONMENT.md` §7 C-4 and C-5.
- **Rotate in its own window, after P5 is stable.** After rotation, Instant Rollback to older deployments **fails** (they hold the old password), so recovery means fixing the variable and redeploying.

## 13. Rotate the production database credentials 🔒⚠ (explicit approval, quiet hour)
1. Put the new password in the password manager first.
2. Neon → production project → Roles → reset the app role's password.
3. Update **Production** `DATABASE_URL` in Vercel → **redeploy production immediately**. Expect downtime between the reset and the redeploy.
4. Run V4: the old local `.env` URL must fail.

## 14. Verify Production 🔒
Repeat P5, and check the dashboard, orders, payments and WhatsApp `/api/whatsapp/plans` (with the AiSensy token).

## 15. Lift the Preview freeze 🔒
Only after V1–V10 pass: remove the Ignored Build Step, or narrow it to the branches you want to build.

## 16. Only then: build the website → CRM booking integration
Follow `BOOKING-API-CONTRACT.md`. It's its own branch and commit series, tested only against TEST.

**Prerequisites:**
- the rate limiter (SEC-006)
- race-safe IDs and the phone dedupe (SEC-014)
- the `WebsiteBooking` queue

## 17. Only after the CRM booking API is proven: continue the website redesign
Per `IMPLEMENTATION-PLAN.md` phases 1–3. The website docs need committing first (website repo, separate commit).

---

### Not covered by the overnight work (still OPEN)

| Item | Where it's tracked |
|---|---|
| SEC-006 rate limiting; SEC-007 raw error messages; SEC-010 `debug/sheet`; SEC-014 ID races and phone uniqueness | `SECURITY.md` |
| SEC-015 `RewardStatus` type, SEC-016 wallet UI, DATA-009 `deleteOrder` drops referral rows, DB-001 index names | `SECURITY.md` |
| DATA-001 removing real data from `lib/data.ts` (the seed is already retired) and DATA-002/003 history purge (H1: final commands still to be reviewed); DATA-004 the real phone in a comment; DATA-005 encrypting backups | `SECURITY.md`, plan §16 step 5 |
| Revoking the Google service-account key (D6) and removing Sheets, Supabase and the deprecated stubs | plan §16 steps 2–3 |
| ENV-007 Vercel plan (Hobby is for non-commercial use) | `SECURITY.md` |
