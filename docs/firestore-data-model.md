# Firestore data model — per-owner isolation (design + migration plan)

Implements **ADR 0001** (substrate `docs/adr/0001-per-user-data-isolation.md`). Rules:
`firestore.rules`. Verified on the emulator by `test/isolation.rules.test.js` (21/21 pass).

> **Nothing in here is deployed or migrated yet.** This is the design + plan. Live rules deploy,
> live data migration, disabling console signup, and flipping features live are **Sam-authorized
> follow-ups** (listed at the bottom).

## 1. The problem being replaced

Today all app data lives in **one** document, `businesses/same-solutions`, and every authenticated
user reads/writes it (`syncToCloud()` / `syncFromCloud()`). Isolation is **client-side only**
(`determineUserRole()` + `customerScope` slice the in-memory blob). Anyone authenticated can fetch
the whole blob directly. That is the audit's core finding.

## 2. Target collection structure (per-owner)

Every user-data document carries an **`owner`** field == the owning `uid`. Rule of the system:
**read/write only what you own; admin reads/writes all; deny by default.**

| Collection | Doc shape | Who can read | Who can write |
|---|---|---|---|
| `users/{uid}` | allowlist record: `{ email, role, scope, active, invitedBy }` | self + admin | **admin only** (invite-only) |
| `customerUsers/{uid}` | `{ customerId }` routing map | self + admin | admin only |
| `businesses/{bizId}` | the business blob `{ data, ... }` | **admin only** | admin only |
| `customers/{customerId}` | customer-facing subset `{ owner, ... }` | owner + admin | admin creates; owner/admin update |
| `userData/{docId}` | generic owner-tagged doc `{ owner, ... }` | owner + admin | owner (create owns; no owner-transfer) + admin |
| `polls/{pollId}` | poll definition | any signed-in | admin |
| `polls/{pollId}/votes/{voterUid}` | `{ owner, choice }`, docId == uid | self + admin | self only |
| `partyItems/{itemId}` | `{ owner, item }` | any signed-in (shared list) | owner create/edit; admin override |

Key rule mechanics (see `firestore.rules`):
- `ownsExisting()` = `resource.data.owner == request.auth.uid` (gates read/update/delete of stored docs).
- `ownsIncoming()` = `request.resource.data.owner == request.auth.uid` (forces create owner == caller; blocks owner-transfer on update).
- `isAdmin()` = custom claim `admin == true` **or** the verified admin email (bootstrap).
- Update requires **both** `ownsExisting()` and `ownsIncoming()` → a user cannot hand a doc to themselves or to a third party.

## 3. Admin identity

Production path: a **custom claim** `admin: true` on Sam's uid, set once via the Admin SDK:

```js
// run once, locally, with a service-account key (NOT committed):
admin.auth().setCustomUserClaims(SAM_UID, { admin: true });
```

Until the claim is set, the rule also accepts the **verified** admin email
(`samuel.m.foran@gmail.com`) as a documented bootstrap. Remove the email branch once the claim is in
place.

## 4. Invite-only (no public self-signup)

- **Client (done this session):** `signupWithEmail()` no longer calls
  `createUserWithEmailAndPassword`; it shows an "invite-only" message. `showSignupForm()` is a no-op
  that keeps the login form. Email/Google **sign-in** for existing/allowlisted accounts is untouched
  (Sam signs in via Google as admin).
- **Provisioning (already exists):** the admin "🔑 Invite to Portal" button →
  `generateSelfRegisterInvite()` → substrate `/api/generate-invite`. The allowlist docs
  (`users/{uid}`, `customerUsers/{uid}`) are **admin-write-only** in the rules, so even an
  authenticated stranger cannot grant themselves a role/scope.
- **Console (Sam's action):** disable Email/Password sign-up in Firebase Auth settings for defense
  in depth. Optionally restrict new Google sign-ups; not required because authorization is
  allowlist-gated and rules deny non-owners any data.

## 5. Migration plan — blob → per-owner (DESIGN ONLY, do not execute)

The current blob is **Sam's business data** (customers, quotes, invoices, jobs, equipment). It does
not need to fan out to many owners to be *safe* — the first and most important fix is simply that
**only admin can read/write `businesses/same-solutions`** (the new rules already enforce that).
Customers stop getting data from the blob and get it from per-owner `customers/{customerId}` docs.

Phased, reversible migration (each step Sam-approved, run against a backup first):

1. **Backup.** Export `businesses/same-solutions` (console export or a one-off admin read to JSON).
2. **Deploy rules** (separately authorized). After this, only admin touches the blob — customer
   portals that previously read the blob must already be reading their per-owner docs (step 3) or
   they lose data; so do step 3 first in a parallel collection before cutting over.
3. **Derive per-customer docs.** A one-off admin script reads the blob and writes, for each customer,
   a `customers/{customerId}` doc `{ owner: <that customer's uid>, ...their subset }` (their
   property, their invoices/quotes references). Requires each customer's uid (from `customerUsers`).
4. **Repoint the customer portal** read path from the blob slice to `customers/{customerId}`.
5. **Keep the blob as admin-only** business store for the `/manage` app (Sam). No need to shard Sam's
   own data; it is already single-owner (admin).
6. **Verify** with the isolation test + a manual customer login (sees only their doc) before
   removing any legacy read path.

Rollback: rules can be reverted; the blob is untouched by steps 3-4 (they only *add* per-customer
docs). Nothing is deleted until step 6 verifies.

## 6. Wire-up points for the scaffolded features (Task 4 — document, do NOT flip live)

After the foundation + passing isolation test, lighting these up is a small wire-up, not a rebuild:

- **Fireworks shirt poll** (`/our/commerce-lake-fireworks-2026/`, `data/fireworks-shirt-poll.json`):
  on vote, write `polls/fireworks-shirt-2026/votes/{uid}` = `{ owner: uid, choice }` (one doc per
  voter → one-vote-per-person for free). Render counts from an admin/aggregation read. Flip
  `voting_open: true` and wire the already-commented `castVote()` stub to this write. Rules: ready.
- **Party-items list:** `partyItems/{itemId}` = `{ owner: uid, item }`. Submitter == uid (rule
  enforces). "One-open-item" = a client/Function check that the user has no existing open item before
  create; "notify-on-add" = a Cloud Function on create. Shared read for the invited list; owner-only
  edit. Rules: ready.
- **Neighbor hub shells** (`/aimee/`, `/abbey/`, `/mike/`, `/jon/`): each hub's private data =
  owner-scoped docs (`userData/{docId}` with `owner == that person's uid`, or per-hub subcollections
  following the same pattern). Add the person's role to their hub gate + create their `users/{uid}` +
  `customerUsers/{uid}` allowlist docs (admin action). Rules: ready.

## 7. Sam-authorized follow-ups (NOT done this session)

1. Deploy `firestore.rules` to the live project (`firebase deploy --only firestore:rules`) — after reviewing this + the passing test.
2. Disable Email/Password public sign-up in the Firebase console.
3. Set the `admin: true` custom claim on Sam's uid (Admin SDK, one-off).
4. Execute the blob → per-owner migration (section 5), against a backup.
5. Flip the scaffolded features live (section 6).

Run the isolation test anytime: `npm run test:rules` (needs Java + the local firebase-tools; uses the
`demo-same-solutions` emulator project — never touches live).
