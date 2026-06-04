/* backup-blob.js - KEYLESS local backup. Run in Sam's own terminal during the live activation.
 *
 * Dumps live Firestore (the businesses/same-solutions blob + key collections) to a local JSON file
 * with per-collection doc COUNTS, so a post-migration no-data-loss comparison is possible.
 *
 * KEYLESS: uses the public web client config + signs in as Sam (admin) -- NO service-account key.
 * Reads pass the security rules because Sam's email is the admin in the rules.
 *
 *   npm install firebase                          # the WEB SDK (no key). One-time.
 *   $env:FB_EMAIL = "samuel.m.foran@gmail.com"    # optional (this is the default)
 *   $env:FB_PW    = "<sam's /manage password>"    # required for this keyless path
 *   node scripts/backup-blob.js "C:\Users\smf13\firebase-backups\pre-migration-2026-06-04.json"
 *   Remove-Item Env:FB_PW                          # clear it from the session afterward
 *
 * *** CAVEAT: email/password sign-in only works if the /manage account has an email+password
 *     credential. If Sam signs into /manage with GOOGLE only (no password), this fails -> use the
 *     Blaze `firebase firestore:export` keyless path (ACTIVATION-LOCAL-RUN.md Step 6) or the
 *     service-account-key fallback (firebase-admin). ***
 */
'use strict';

const fs = require('fs');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: 'AIzaSyAf-qff-m86FOpnbAB1Kgo9srOLKO9b9nk', // public (already shipped in manage/index.html)
  authDomain: 'same-solutions-app.firebaseapp.com',
  projectId: 'same-solutions-app',
  storageBucket: 'same-solutions-app.firebasestorage.app',
  messagingSenderId: '547179600790',
  appId: '1:547179600790:web:6f69f925efb5a657931bb7',
};

const COLLECTIONS = ['businesses', 'customerUsers', 'users', 'customers', 'polls', 'partyItems'];

async function main() {
  const out = process.argv[2];
  if (!out) { console.error('Usage: node scripts/backup-blob.js <output.json>  (path OUTSIDE the repo)'); process.exit(1); }
  const email = process.env.FB_EMAIL || 'samuel.m.foran@gmail.com';
  const pw = process.env.FB_PW;
  if (!pw) { console.error('Set $env:FB_PW to your /manage password first (keyless sign-in). See the header.'); process.exit(1); }

  const app = initializeApp(firebaseConfig);
  await signInWithEmailAndPassword(getAuth(app), email, pw).catch((e) => {
    console.error('Sign-in FAILED (' + (e.code || e.message) + '). If your /manage account is Google-only, use the Blaze firestore:export path or the service-account-key fallback (ACTIVATION-LOCAL-RUN.md Step 6).');
    process.exit(2);
  });
  console.log('Signed in as', email);

  const db = getFirestore(app);
  const dump = { _exportedAt: new Date().toISOString(), _project: firebaseConfig.projectId, collections: {} };
  const counts = {};
  for (const col of COLLECTIONS) {
    try {
      const snap = await getDocs(collection(db, col));
      dump.collections[col] = {};
      snap.forEach((d) => { dump.collections[col][d.id] = d.data(); });
      counts[col] = snap.size;
    } catch (e) { counts[col] = 'ERR:' + (e.code || e.message); }
  }
  dump._counts = counts;
  fs.writeFileSync(out, JSON.stringify(dump, null, 2));

  const blob = dump.collections.businesses && dump.collections.businesses['same-solutions'];
  console.log('Backup written to:', out);
  console.log('Doc counts (compare AFTER migration - must not drop):', JSON.stringify(counts));
  console.log('businesses/same-solutions present:', !!blob, blob ? ('(top-level keys: ' + Object.keys(blob).join(', ') + ')') : '(MISSING - investigate before migrating)');
  process.exit(0);
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(3); });
