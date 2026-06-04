# Firebase activation — LOCAL RUN (copy-paste kit for Sam's own terminal)

CC **cannot** run this — the sandbox has no interactive browser for `firebase login` ("Cannot run
login in non-interactive mode") and no service-account key. **You run these in your own PowerShell**,
in order, pasting each **GATE** result back to the planning chat before continuing.

- **Project:** `same-solutions-app`  ·  **Admin email:** `samuel.m.foran@gmail.com`
- **Repo:** `C:\Users\smf13\Documents\SameSolutionsLLC\samesolutionsllc-website` (run everything from here)
- **Golden rules:** verify each step before the next; **backup before migrating**; STOP + paste back on any anomaly.
- `cd "C:\Users\smf13\Documents\SameSolutionsLLC\samesolutionsllc-website"` first.

---

## Step 0 — Prereqs + authenticate
```powershell
firebase --version            # if "not recognized": npm install -g firebase-tools
firebase login                # real browser opens — sign in as samuel.m.foran@gmail.com
firebase projects:list        # confirm  same-solutions-app  is listed
firebase use same-solutions-app
```
**GATE 0 — paste:** the `firebase projects:list` line showing `same-solutions-app` + which account `firebase login` signed in as.

---

## Step 1 — Admin claim  (OPTIONAL — the email rule already makes you admin)
The deployed rules grant admin to `token.email == samuel.m.foran@gmail.com` **OR** the custom claim
`admin:true`. **Simplest path: SKIP this step** and rely on the verified-email admin (you're covered).
Do this only if you want the durable claim too.

If doing it:
1. **Get a service-account key:** Firebase Console -> Project settings (gear) -> **Service accounts**
   -> **Generate new private key** -> save it **OUTSIDE the repo**, e.g. `C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json`.
2. **Find your UID:** Console -> **Authentication** -> **Users** -> your `samuel.m.foran@gmail.com`
   row -> copy the **User UID**.
3. Run:
```powershell
npm i --no-save firebase-admin
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json"
node scripts/set-admin-claim.js samuel.m.foran@gmail.com
# (or, if email lookup fails:  node scripts/set-admin-claim.js --uid <YOUR_UID> )
```
Then **sign out/in of /manage** so the new token carries the claim.
**GATE 1 — paste:** the script's `Custom claims now: {"admin":true}` line  — OR say "skipping, using email-admin".

> The repo `.gitignore` blocks `*serviceAccount*.json` / `*-firebase-adminsdk-*.json` / `scripts/secrets/`,
> so the key is safe even if it lands in the repo dir. **Never paste the key into chat.**

---

## Step 2 — Deploy the security rules
```powershell
firebase deploy --only firestore:rules
```
Then confirm in Console -> **Firestore Database** -> **Rules** that the new ruleset is live.
**GATE 2 — paste:** the `firebase deploy` success output (the "Deploy complete!" lines).

---

## Step 3 — Isolation test against the deployed rules  (MUST be 21/21)
The test loads the **same `firestore.rules` file you just deployed** into the emulator and verifies it.
Needs a Java runtime; you already have a portable one from a prior session:
```powershell
$env:JAVA_HOME = "C:\Users\smf13\jdk-portable\jdk-21.0.11+10-jre"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
npm run test:rules
```
(If `JAVA_HOME` path is gone: install any JRE 17+ and point `JAVA_HOME` at it.)
**GATE 3 — paste:** the `TOTAL: 21  PASSED: 21  FAILED: 0  RESULT: PASS` block. **Do not continue unless 21/21.**

---

## Step 4 — Verify YOUR admin read still works
Open `https://samesolutionsllc.com/manage`, signed in as `samuel.m.foran@gmail.com`. Confirm your
business data still loads (customers / quotes / invoices visible).
**GATE 4 — confirm:** "data loads" — or "BROKEN" (if broken, STOP; do not disable signup or migrate).

---

## Step 5 — Disable public Email/Password signup  (your console click)
Firebase Console -> **Authentication** -> **Sign-in method** -> **Email/Password** -> turn **OFF**
"Allow new users to sign up" (Identity Platform: enforce allowlist / disable self-signup). Leave
sign-IN on (so existing accounts + Google login still work).
**GATE 5 — confirm:** "public signup disabled."

---

## Step 6 — BACKUP live data  (REQUIRED before any migration — pick by your plan tier)
> Check your tier: Firebase Console -> top-left gear / "Usage and billing" -> **Spark** (free) or **Blaze** (pay-as-you-go).

**IF BLAZE — managed export (KEYLESS, uses your `firebase login`; simplest, no install):**
```powershell
firebase firestore:export gs://same-solutions-app.firebasestorage.app/backups/pre-migration-2026-06-04 --project same-solutions-app
```
(That's the project's real default bucket. Verify in Console -> Firestore -> Import/Export that it completed.)

**IF SPARK — keyless local JSON dump (no managed export on free tier; no service-account key):**
```powershell
npm install firebase                          # web SDK, one-time, no key
$env:FB_PW = "<your /manage password>"        # keyless sign-in as admin (samuel.m.foran@gmail.com)
node scripts/backup-blob.js "C:\Users\smf13\firebase-backups\pre-migration-2026-06-04.json"
Remove-Item Env:FB_PW
```
It prints per-collection **doc counts** (write them down = the no-loss check) + confirms the blob is present.
> **If sign-in fails because your /manage account is GOOGLE-only** (no password): either set a password
> for it (Console -> Authentication -> your user -> reset/add password) and retry, OR use the
> service-account-key fallback (`$env:GOOGLE_APPLICATION_CREDENTIALS=...key.json` + `npm i firebase-admin`,
> then ask CC for the admin-SDK backup variant). The key is git-ignored.

**GATE 6 — paste:** the backup path (or GCS path) + the printed doc counts + "blob present: true".
**Do NOT migrate without a verified backup.**

---

## Step 7 — Migrate blob -> per-owner docs  (DRY-RUN first; per docs/firestore-data-model.md section 5)
The migration script is written + shape-adaptive (`scripts/migrate-blob.js`). It only **ADDS**
`customers/{customerId}` docs (owner=uid from `customerUsers`); it **does NOT touch/delete** the blob.

**7a — DRY RUN (writes NOTHING — paste the result back):**
```powershell
npm install firebase            # if not already (Step 6 Spark path installs it)
$env:FB_PW = "<your /manage password>"
node scripts/migrate-blob.js
```
It lists each `customers/<id>` it WOULD create with inv/quo/job counts. **Paste this output to the
planning chat.** If it says "no data.customers{} / unexpected shape," paste the GATE-6 backup JSON's
top-level keys and CC adjusts the script before you commit.

**7b — REAL run (only after the dry-run looks right AND GATE 6 backup is verified):**
```powershell
node scripts/migrate-blob.js --commit
Remove-Item Env:FB_PW
```
Then compare the new `customers/*` count against the backup counts (no loss). The blob stays intact.
**GATE 7 — paste:** dry-run output, then the --commit result + the count comparison (no data loss).
**Do NOT flip features until this verifies.**

---

## Step 8 — Flip features ONE AT A TIME (each with a verify)
Only after Steps 1-7 verify clean. Wire-up points are in `docs/firestore-data-model.md` section 6.
1. **Shirt poll** — set `voting_open:true` in `data/fireworks-shirt-poll.json` (substrate) + wire the
   `castVote()` stub to write `polls/fireworks-shirt-2026/votes/{uid}`. Verify: authed vote works; anon denied.
2. **Party items / RSVP** — `partyItems/{itemId}` owner=uid (+ one-open-item rule, notify-on-add).
   Verify: a test item submits + is owner-scoped; non-owner can't edit.
3. **Aimee's hub** — provision `users/{uid}` + `customerUsers/{uid}`; add her role to the `/aimee/` gate.
   Verify: she sees only what she's granted.
4. **Financials page** — replace the partial client Gate on `/personal/fireworks-organizer-2026/` with
   real rules-enforced admin-only access. Verify: non-admin denied server-side.
**GATE 8 — paste:** each feature's verify result.

---

## After
CC writes `docs/adr/0002` (activation record: claim, rules, signup, backup location, migration, features)
and updates `awareness-backlog.md` (foundation ACTIVATED + what's live). Paste the gate results back and
CC handles the write-ups.
