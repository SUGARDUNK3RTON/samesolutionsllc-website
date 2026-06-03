/* set-admin-claim.js — DRAFT. DO NOT RUN outside the live activation session.
 *
 * Sets the custom claim { admin: true } on Sam's Firebase Auth user so the deployed
 * firestore.rules grant him full read/write. NOTE: the rules ALSO admit the verified email
 * samuel.m.foran@gmail.com as admin (the safety-net path), so Sam is already admin via email even
 * before this runs — this claim is the cleaner/long-term mechanism, not a lockout risk.
 *
 * ── REQUIRES A SERVICE-ACCOUNT KEY (a SECRET — never commit it) ──────────────────────────────
 *   1. Firebase Console -> Project settings -> Service accounts -> "Generate new private key".
 *   2. Save it OUTSIDE the repo, e.g.  C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json
 *      (the repo .gitignore blocks *serviceAccount*.json / *-firebase-adminsdk-*.json / scripts/secrets/
 *      as belt-and-suspenders, but prefer keeping the key entirely outside the repo tree).
 *   3. Install the Admin SDK once (local, not committed):  npm i --no-save firebase-admin
 *   4. Run during the live session:
 *        $env:GOOGLE_APPLICATION_CREDENTIALS = "C:\Users\smf13\firebase-keys\same-solutions-adminsdk.json"
 *        node scripts/set-admin-claim.js sam@example.com        (pass Sam's /manage sign-in EMAIL)
 *      or pass a UID:  node scripts/set-admin-claim.js --uid <UID>
 *
 * Project: same-solutions-app. Admin email of record: samuel.m.foran@gmail.com.
 */
'use strict';

const admin = require('firebase-admin'); // installed locally during the live session (not committed)

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node set-admin-claim.js <email>   |   node set-admin-claim.js --uid <UID>');
    process.exit(1);
  }

  // Uses GOOGLE_APPLICATION_CREDENTIALS env var pointing at the service-account key.
  admin.initializeApp({ credential: admin.credential.applicationDefault() });

  let uid;
  if (arg === '--uid') {
    uid = process.argv[3];
    if (!uid) { console.error('Provide a UID after --uid'); process.exit(1); }
  } else {
    const user = await admin.auth().getUserByEmail(arg);
    uid = user.uid;
    console.log('Resolved', arg, '-> uid', uid);
  }

  await admin.auth().setCustomUserClaims(uid, { admin: true });

  // VERIFY: read the claim back.
  const after = await admin.auth().getUser(uid);
  console.log('Custom claims now:', JSON.stringify(after.customClaims || {}));
  if (after.customClaims && after.customClaims.admin === true) {
    console.log('OK — admin claim set on', uid, '(have Sam sign out/in once so the new token carries it).');
  } else {
    console.error('FAIL — admin claim not present after set. Do NOT proceed with rules deploy until resolved.');
    process.exit(2);
  }
}

main().catch((e) => { console.error('ERROR:', e.message); process.exit(3); });
