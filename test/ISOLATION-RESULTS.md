# Isolation test results — ADR 0001 gate

**Date:** 2026-06-03
**Command:** `npm run test:rules`
(= `firebase emulators:exec --project demo-same-solutions --only firestore "node test/isolation.rules.test.js"`)
**Environment:** Firestore emulator v1.21.0 (cloud-firestore-emulator), demo project `demo-same-solutions`
(never touches live), portable Temurin JRE 21. Rules under test: `firestore.rules`.

## RESULT: PASS — 21/21, exit code 0

```
================ ISOLATION TEST RESULTS ================
  PASS  A reads own userData/docA
  PASS  A updates own userData/docA
  PASS  A creates own userData/docA2 (owner=A)
  PASS  A CANNOT read userData/docB (owner=B)
  PASS  A CANNOT read customers/custB (owner=B)
  PASS  A CANNOT update userData/docB
  PASS  A CANNOT delete userData/docB
  PASS  A CANNOT create a doc owned by B (owner=B)
  PASS  A CANNOT steal B doc by setting owner=A on update
  PASS  A CANNOT read businesses/same-solutions (blob)
  PASS  B CANNOT read userData/docA (owner=A)
  PASS  anon CANNOT read userData/docA
  PASS  anon CANNOT read businesses blob
  PASS  admin reads userData/docA
  PASS  admin reads userData/docB
  PASS  admin updates userData/docB
  PASS  admin reads businesses blob
  PASS  admin writes businesses blob
  PASS  A (signed in) can READ shared partyItems/itemB
  PASS  A CANNOT edit B-owned partyItems/itemB
  PASS  A can create own partyItems (owner=A)
-------------------------------------------------------
  TOTAL: 21   PASSED: 21   FAILED: 0
  RESULT: PASS — isolation verified (GO)
=======================================================
+  Script exited successfully (code 0)
```

## What this proves

- **User A cannot read or write user B's documents** (userData, customers, partyItems) — every
  cross-owner read/write returns `permission-denied`.
- **A cannot exfiltrate** the business blob, nor forge a doc owned by B, nor hijack B's doc by
  rewriting `owner`.
- **Anonymous** is denied everything.
- **Admin** (custom claim `admin: true`) can read/write both users' docs and the business blob.
- Shared-but-owned pattern (party items): signed-in users can read the shared list, but only the
  **owner** can edit their item.

## Reproduce

Requires Java (any JRE 17+) + the local `firebase-tools` (installed in `node_modules`). Then:

```
npm run test:rules
```

Exit 0 = isolation holds. Non-zero = DO NOT deploy the rules.
