/* backup-blob.js — DRAFT helper. Run only in Sam's own terminal during the live activation.
 *
 * Dumps the live Firestore data to a local JSON file BEFORE the migration (Step 6/7).
 * This single-app data model is small (one businesses/same-solutions blob + a few collections),
 * so a local JSON dump is a simple, restorable backup. (The managed `firebase firestore:export`
 * to a GCS bucket is the alternative — see ACTIVATION-LOCAL-RUN.md.)
 *
 * ── REQUIRES A SERVICE-ACCOUNT KEY (a SECRET — never commit it) ──────────────────────────────
 *   npm i --no-save firebase-admin
 *   $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json"
 *   node scripts/backup-blob.js "C:\Users\smf13\firebase-backups\pre-migration-2026-06-XX.json"
 *
 * Writes a JSON file containing the blob + the listed collections, with a per-collection doc count
 * you can compare against after migration (the no-data-loss check).
 */
'use strict';

const admin = require('firebase-admin');
const fs = require('fs');

// Collections to back up (add any others you see in the console). The big one is the blob.
const COLLECTIONS = ['businesses', 'customerUsers', 'users', 'customers'];

async function main() {
  const out = process.argv[2];
  if (!out) {
    console.error('Usage: node scripts/backup-blob.js <output.json>  (path OUTSIDE the repo)');
    process.exit(1);
  }
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
  const db = admin.firestore();

  const dump = { _exportedAt: new Date().toISOString(), _project: process.env.GCLOUD_PROJECT || 'same-solutions-app', collections: {} };
  const counts = {};

  for (const col of COLLECTIONS) {
    const snap = await db.collection(col).get();
    dump.collections[col] = {};
    snap.forEach(doc => { dump.collections[col][doc.id] = doc.data(); });
    counts[col] = snap.size;
  }
  dump._counts = counts;

  fs.writeFileSync(out, JSON.stringify(dump, null, 2));
  console.log('Backup written to:', out);
  console.log('Doc counts (compare these AFTER migration — they must not drop):', JSON.stringify(counts));
  const blob = dump.collections.businesses && dump.collections.businesses['same-solutions'];
  console.log('businesses/same-solutions present:', !!blob, blob ? ('(keys: ' + Object.keys(blob).join(', ') + ')') : '(MISSING — investigate before migrating)');
}

main().catch(e => { console.error('ERROR:', e.message); process.exit(2); });
