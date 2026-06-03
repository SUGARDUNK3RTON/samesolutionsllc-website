/* Firestore ISOLATION TEST — the gate for ADR 0001.
 *
 * Proves the per-owner rules in firestore.rules actually isolate:
 *   - user A can read/write A's own docs
 *   - user A is DENIED reading AND writing user B's docs (permission-denied)
 *   - admin can read/write both
 *
 * Runs against the Firestore EMULATOR (never a live project). Invoke via:
 *   npm run test:rules         (wraps: firebase emulators:exec --project demo-same-solutions ...)
 * Uses a demo- project id so it is impossible to touch real data.
 *
 * Exit code 0 = all assertions passed (foundation is GO). Non-zero = isolation FAILED (do NOT ship).
 */
const fs = require('fs');
const path = require('path');
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require('@firebase/rules-unit-testing');
const { doc, getDoc, setDoc, updateDoc, deleteDoc } = require('firebase/firestore');

const PROJECT_ID = 'demo-same-solutions';
const RULES = fs.readFileSync(path.join(__dirname, '..', 'firestore.rules'), 'utf8');

const UID_A = 'user-a';
const UID_B = 'user-b';
const UID_ADMIN = 'user-sam';

let passed = 0;
let failed = 0;
const results = [];

async function check(name, promise) {
  try {
    await promise;
    passed++;
    results.push(`  PASS  ${name}`);
  } catch (e) {
    failed++;
    results.push(`  FAIL  ${name}  -> ${e.message}`);
  }
}

(async () => {
  const testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: RULES },
  });

  // --- seed docs bypassing rules (simulate admin-provisioned data) ---
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'userData/docA'), { owner: UID_A, text: 'A private' });
    await setDoc(doc(db, 'userData/docB'), { owner: UID_B, text: 'B private' });
    await setDoc(doc(db, 'customers/custB'), { owner: UID_B, name: 'Customer B' });
    await setDoc(doc(db, 'businesses/same-solutions'), { data: { secret: 'all business data' } });
    await setDoc(doc(db, 'partyItems/itemB'), { owner: UID_B, item: 'B brought chips' });
  });

  const aDb = testEnv.authenticatedContext(UID_A, { email: 'a@example.com' }).firestore();
  const bDb = testEnv.authenticatedContext(UID_B, { email: 'b@example.com' }).firestore();
  // Admin via custom claim (the production path). Different uid; no special email needed.
  const adminDb = testEnv.authenticatedContext(UID_ADMIN, { admin: true }).firestore();
  const anonDb = testEnv.unauthenticatedContext().firestore();

  // 1) A can read + write its OWN docs
  await check('A reads own userData/docA', assertSucceeds(getDoc(doc(aDb, 'userData/docA'))));
  await check('A updates own userData/docA', assertSucceeds(updateDoc(doc(aDb, 'userData/docA'), { text: 'A edit' })));
  await check('A creates own userData/docA2 (owner=A)', assertSucceeds(setDoc(doc(aDb, 'userData/docA2'), { owner: UID_A, text: 'new' })));

  // 2) A is DENIED reading B's docs
  await check('A CANNOT read userData/docB (owner=B)', assertFails(getDoc(doc(aDb, 'userData/docB'))));
  await check('A CANNOT read customers/custB (owner=B)', assertFails(getDoc(doc(aDb, 'customers/custB'))));

  // 3) A is DENIED writing B's docs (update, delete, and ownership-hijack create)
  await check('A CANNOT update userData/docB', assertFails(updateDoc(doc(aDb, 'userData/docB'), { text: 'hijack' })));
  await check('A CANNOT delete userData/docB', assertFails(deleteDoc(doc(aDb, 'userData/docB'))));
  await check('A CANNOT create a doc owned by B (owner=B)', assertFails(setDoc(doc(aDb, 'userData/forged'), { owner: UID_B, text: 'forged' })));
  await check('A CANNOT steal B doc by setting owner=A on update', assertFails(updateDoc(doc(aDb, 'userData/docB'), { owner: UID_A })));

  // 4) A is DENIED reading the whole business blob
  await check('A CANNOT read businesses/same-solutions (blob)', assertFails(getDoc(doc(aDb, 'businesses/same-solutions'))));

  // 5) symmetry — B cannot read A's doc
  await check('B CANNOT read userData/docA (owner=A)', assertFails(getDoc(doc(bDb, 'userData/docA'))));

  // 6) anonymous is denied everything
  await check('anon CANNOT read userData/docA', assertFails(getDoc(doc(anonDb, 'userData/docA'))));
  await check('anon CANNOT read businesses blob', assertFails(getDoc(doc(anonDb, 'businesses/same-solutions'))));

  // 7) ADMIN can read + write BOTH users' docs and the business blob
  await check('admin reads userData/docA', assertSucceeds(getDoc(doc(adminDb, 'userData/docA'))));
  await check('admin reads userData/docB', assertSucceeds(getDoc(doc(adminDb, 'userData/docB'))));
  await check('admin updates userData/docB', assertSucceeds(updateDoc(doc(adminDb, 'userData/docB'), { text: 'admin edit' })));
  await check('admin reads businesses blob', assertSucceeds(getDoc(doc(adminDb, 'businesses/same-solutions'))));
  await check('admin writes businesses blob', assertSucceeds(setDoc(doc(adminDb, 'businesses/same-solutions'), { data: { secret: 'updated by admin' } })));

  // 8) feature-collection spot checks (party items: shared read, owner-only edit)
  await check('A (signed in) can READ shared partyItems/itemB', assertSucceeds(getDoc(doc(aDb, 'partyItems/itemB'))));
  await check('A CANNOT edit B-owned partyItems/itemB', assertFails(updateDoc(doc(aDb, 'partyItems/itemB'), { item: 'hijack' })));
  await check('A can create own partyItems (owner=A)', assertSucceeds(setDoc(doc(aDb, 'partyItems/itemA'), { owner: UID_A, item: 'A brought soda' })));

  await testEnv.cleanup();

  console.log('\n================ ISOLATION TEST RESULTS ================');
  console.log(results.join('\n'));
  console.log('-------------------------------------------------------');
  console.log(`  TOTAL: ${passed + failed}   PASSED: ${passed}   FAILED: ${failed}`);
  console.log(`  RESULT: ${failed === 0 ? 'PASS — isolation verified (GO)' : 'FAIL — isolation broken (DO NOT SHIP)'}`);
  console.log('=======================================================\n');

  process.exit(failed === 0 ? 0 : 1);
})().catch((e) => {
  console.error('Test harness error:', e);
  process.exit(2);
});
