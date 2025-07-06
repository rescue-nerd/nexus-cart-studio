import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!admin.apps.length) {
  if (!serviceAccount) {
    console.warn(`
----------------------------------------------------------------
NOTICE: Firebase Admin SDK is not configured. 
Server-side features like session management and route protection will not work.
To enable it, set the FIREBASE_ADMIN_SDK_JSON environment variable with your service account key.
See HANDOFF.md for instructions.
----------------------------------------------------------------
`);
  } else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount))
        });
        console.log("Firebase Admin SDK initialized.");
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK. Check that FIREBASE_ADMIN_SDK_JSON is a valid, single-line JSON string.", e);
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
