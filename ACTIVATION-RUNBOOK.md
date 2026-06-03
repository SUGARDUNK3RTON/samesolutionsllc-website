# Firebase activation runbook — the focused, watched live session

**Status: STAGED, not executed.** This is the exact ordered checklist for the one live session that
activates the data foundation (ADR 0001). Project: **same-solutions-app**. Admin email of record:
**samuel.m.foran@gmail.com** (Sam-confirmed; the rules' verified-email path = the lockout safety net).

> **Golden rules:** verify after EVERY step before the next. Order is non-negotiable. BACKUP before
> migrating, and verify the backup restores. STOP and report on ANY anomaly — do not push through.
> Re-run the isolation test against the deployed rules.

Prereqs already in place (this prep session): `.firebaserc` pins `same-solutions-app`;
`firestore.rules` is the isolation-tested version (21/21 pass, re-confirmed on the emulator);
`scripts/set-admin-claim.js` drafted; client signup lockdown already shipped; `.gitignore` blocks any
service-account key.

---

## Step 0 — Pre-flight (confirm, then go)
- [x] Project = `same-solutions-app` (app `projectId`).
- [x] Admin email = `samuel.m.foran@gmail.com` (Sam confirmed). Rules admit this email as admin -> no lockout.
- [x] `firestore.rules` = tested version (21/21). 
- [ ] You are at the keyboard, watching. (This is not fire-and-forget.)

## Step 1 — Authenticate the CLI
```
! firebase login
```
(Interactive Google OAuth — must be Sam's action; CC cannot do OAuth in the sandbox.)
Verify: `firebase projects:list` shows `same-solutions-app`.

## Step 2 — Set / confirm the admin claim
The email path already makes Sam admin. To also set the durable custom claim:
```
# generate a service-account key (Console -> Project settings -> Service accounts), saved OUTSIDE the repo
npm i --no-save firebase-admin
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json"
node scripts/set-admin-claim.js samuel.m.foran@gmail.com
```
Verify: script prints `Custom claims now: {"admin":true}`. Then have Sam **sign out/in** so the new
token carries the claim. (If you skip the claim, the email path still covers admin — acceptable.)

## Step 3 — Deploy the security rules
```
firebase deploy --only firestore:rules
```
Verify: deploy succeeds; Console -> Firestore -> Rules shows the new ruleset.

## Step 4 — Re-run the isolation test against LIVE rules
```
# point the rules-unit-test at the DEPLOYED ruleset (or emulator loaded with the just-deployed rules)
npm run test:rules
```
Verify: **21/21 PASS** (A cannot read/write B; admin can; anon denied). PASTE the result.
**Also: confirm Sam (signed in) can still read his data.** If admin read is broken -> STOP.

## Step 5 — Verify admin access
- Open `/manage` signed in as samuel.m.foran@gmail.com -> confirm the business data loads.
- If it does NOT load, STOP (do not disable signup or migrate) — diagnose rules/claim first.

## Step 6 — Disable Email/Password public signup (Sam's manual click)
Firebase Console -> Authentication -> Sign-in method -> Email/Password -> **disable new sign-ups**
(or enforce allowlist). The client path is already removed; this closes the server side.
Verify: attempting `createUserWithEmailAndPassword` from a console/test is rejected.

## Step 7 — BACKUP live data (before ANY migration)
```
# Option A — managed export to a GCS bucket (recommended; needs a bucket on the project):
firebase firestore:export gs://same-solutions-app-backups/pre-migration-2026-06-XX --project same-solutions-app
# Option B — local JSON dump of the single blob (small + simple for this app):
#   read businesses/same-solutions via a tiny admin-SDK script, write to a local .json OUTSIDE the repo.
```
Verify: open/inspect the export; spot-check it contains the expected customers/jobs/invoices counts.
**Record the backup location here:** ____________________  (SAM-FILL at run time)
*** Do NOT proceed to Step 8 until the backup is verified restorable. ***

## Step 8 — Migrate blob -> per-owner docs (per docs/firestore-data-model.md section 5)
Phased, reversible (steps only ADD per-owner docs; the blob is untouched until verified):
1. Keep `businesses/same-solutions` as the admin-only business store (rules already enforce admin-only).
2. For each customer with a uid (`customerUsers/{uid}`), derive `customers/{customerId}` =
   `{ owner: <that uid>, ...their subset }` via an admin-SDK script.
3. Repoint the customer portal read path from the blob slice to `customers/{customerId}`.
Verify after each: admin reads everything; per-owner docs have the right `owner`; **counts match the
backup** (no loss). If ANY mismatch/loss -> STOP; restore from the Step-7 backup.

## Step 9 — Flip features ONE AT A TIME (only after 1-8 verify clean)
For each: enable, then verify, then move on. STOP on misbehavior.
1. **Shirt poll** — wire `castVote()` (in /personal/fireworks-organizer-2026/ + the read path) to write
   `polls/fireworks-shirt-2026/votes/{uid}`; set `voting_open:true` in data/fireworks-shirt-poll.json.
   Verify: authed user can vote; anon denied; one-vote-per-uid holds.
2. **Party items / RSVP** — `partyItems/{itemId}` owner=uid, one-open-item rule, notify-on-add.
   Verify: a test item submits + is owner-scoped; non-owner can't edit it.
3. **Aimee's hub** — provision her account (`users/{uid}` + `customerUsers/{uid}`), add her role to the
   /aimee/ gate, grant her party/fireworks access. Verify: she sees only what she's granted.
4. **Financials page** — replace the partial client Gate on /personal/fireworks-organizer-2026/ with
   real rules-enforced admin-only access. Verify: non-admin is denied server-side.

## After: ADR + backlog
- Append `docs/adr/0002` (or update 0001) recording: claim set, rules deployed, signup disabled, data
  migrated (+ backup location), features flipped.
- Update substrate `awareness-backlog.md`: foundation ACTIVATED; what's live; backup location.
