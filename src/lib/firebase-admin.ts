import admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_JSON;

if (!admin.apps.length) {
  if (!serviceAccount) {
    console.warn(`
----------------------------------------------------------------
NOTICE: Firebase Admin SDK is not configured. 
Server-side session management will not work.
To enable it, set FIREBASE_ADMIN_SDK_JSON in your .env file.
----------------------------------------------------------------
`);
  } else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(JSON.parse(serviceAccount))
        });
        console.log("Firebase Admin SDK initialized.");
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK", e);
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
