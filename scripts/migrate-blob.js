/* migrate-blob.js - KEYLESS migration: businesses/same-solutions blob -> per-owner customers/{id} docs.
 * Per docs/firestore-data-model.md section 5. Run in Sam's own terminal during the live activation.
 *
 * SAFETY:
 *   - DRY-RUN by DEFAULT. It reads + reports what it WOULD write, writes NOTHING. Add --commit to write.
 *   - It only ADDS customers/{customerId} docs. It does NOT touch or delete the businesses/same-solutions
 *     blob (the blob stays as the admin-only business store - rules already enforce admin-only).
 *   - Shape-adaptive: handles the documented blob shape (data.customers{}, data.invoices[], etc.).
 *     If the dry-run shows unexpected shape / 0 to migrate, PASTE the backup JSON and the script is adjusted.
 *
 * KEYLESS: web SDK, signed in as Sam (admin) - NO service-account key (same caveat as backup-blob.js:
 *   needs an email+password credential; Google-only accounts use the key fallback).
 *
 *   npm install firebase
 *   $env:FB_PW = "<sam's /manage password>"
 *   node scripts/migrate-blob.js            # DRY RUN (writes nothing) - paste the result back
 *   node scripts/migrate-blob.js --commit   # REAL run (only after dry-run verified + backup done)
 *   Remove-Item Env:FB_PW
 */
'use strict';

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, getDoc, collection, getDocs, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAf-qff-m86FOpnbAB1Kgo9srOLKO9b9nk',
  authDomain: 'same-solutions-app.firebaseapp.com',
  projectId: 'same-solutions-app',
  storageBucket: 'same-solutions-app.firebasestorage.app',
  messagingSenderId: '547179600790',
  appId: '1:547179600790:web:6f69f925efb5a657931bb7',
};

const COMMIT = process.argv.includes('--commit');

function arrFor(data, keys) { for (const k of keys) { if (Array.isArray(data[k])) return { key: k, arr: data[k] }; } return null; }
function matchesCustomer(rec, cid) {
  if (!rec || typeof rec !== 'object') return false;
  return rec.customerId === cid || rec.customer === cid || rec.customerID === cid || rec.contactId === cid;
}

async function main() {
  const email = process.env.FB_EMAIL || 'samuel.m.foran@gmail.com';
  const pw = process.env.FB_PW;
  if (!pw) { console.error('Set $env:FB_PW first (keyless sign-in).'); process.exit(1); }

  const app = initializeApp(firebaseConfig);
  await signInWithEmailAndPassword(getAuth(app), email, pw).catch((e) => {
    console.error('Sign-in FAILED (' + (e.code || e.message) + '). Google-only account -> use the service-account-key fallback.');
    process.exit(2);
  });
  const db = getFirestore(app);
  console.log((COMMIT ? '*** COMMIT MODE - will WRITE ***' : '--- DRY RUN - writes nothing ---'), 'signed in as', email, '\n');

  // 1) read the blob
  const blobSnap = await getDoc(doc(db, 'businesses', 'same-solutions'));
  if (!blobSnap.exists()) { console.error('businesses/same-solutions NOT FOUND. Aborting.'); process.exit(3); }
  const root = blobSnap.data() || {};
  const data = root.data || root; // app stores under .data; fall back to root
  const customers = data.customers || {};
  const custIds = Object.keys(customers);
  console.log('Blob found. data.customers entries:', custIds.length, custIds.length ? '(' + custIds.slice(0, 10).join(', ') + (custIds.length > 10 ? ', ...' : '') + ')' : '');

  // 2) read uid -> customerId map
  const cuSnap = await getDocs(collection(db, 'customerUsers'));
  const uidByCustomer = {};
  cuSnap.forEach((d) => { const v = d.data() || {}; if (v.customerId) uidByCustomer[v.customerId] = d.id; });
  console.log('customerUsers mappings:', cuSnap.size, '\n');

  if (!custIds.length) {
    console.log('SHAPE NOTE: no data.customers{} found in the blob. Paste the backup JSON top-level keys so the script can be adjusted to the real shape. Nothing migrated.');
    process.exit(0);
  }

  const invoices = arrFor(data, ['invoices']);
  const quotes = arrFor(data, ['quotes']);
  const jobs = arrFor(data, ['jobs', 'handymanJobs']);

  let planned = 0, written = 0;
  for (const cid of custIds) {
    const owner = uidByCustomer[cid] || null; // null = no account yet (admin-owned until provisioned)
    const subset = {
      owner: owner || 'ADMIN-UNPROVISIONED',
      ownerResolved: !!owner,
      customerId: cid,
      customer: customers[cid],
      invoices: invoices ? invoices.arr.filter((r) => matchesCustomer(r, cid)) : [],
      quotes: quotes ? quotes.arr.filter((r) => matchesCustomer(r, cid)) : [],
      jobs: jobs ? jobs.arr.filter((r) => matchesCustomer(r, cid)) : [],
      _migratedAt: new Date().toISOString(),
      _migratedFrom: 'businesses/same-solutions',
    };
    planned++;
    console.log('  ' + (owner ? '[uid ' + owner.slice(0, 8) + '...]' : '[NO uid - admin-owned]') + ' customers/' + cid +
      '  inv=' + subset.invoices.length + ' quo=' + subset.quotes.length + ' job=' + subset.jobs.length);
    if (COMMIT) {
      // create only if absent (idempotent-ish; never overwrites an existing per-owner doc blindly)
      const existing = await getDoc(doc(db, 'customers', cid));
      if (existing.exists()) { console.log('    -> exists already, SKIP (manual review)'); continue; }
      await setDoc(doc(db, 'customers', cid), subset);
      written++;
    }
  }

  console.log('\n' + (COMMIT ? 'WROTE ' + written + ' customers/* docs (planned ' + planned + ').' : 'WOULD write ' + planned + ' customers/* docs (dry run).'));
  console.log('Blob left intact (not deleted). Verify: customers/* count vs backup; admin still reads businesses/same-solutions.');
  console.log(COMMIT ? 'NEXT: re-run backup-blob.js (or check the console) and compare counts; confirm no data loss before flipping features.'
    : 'NEXT: paste this dry-run output back. If the counts look right, re-run with --commit (after a verified backup).');
  process.exit(0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(4); });
