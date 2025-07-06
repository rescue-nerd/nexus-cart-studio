import admin from 'firebase-admin';

// Reconstruct the service account object from individual environment variables.
// This is more robust than parsing a single JSON string.
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

const isConfigured = serviceAccount.projectId && serviceAccount.privateKey && serviceAccount.clientEmail;

if (!admin.apps.length) {
  if (!isConfigured) {
    console.warn(`
----------------------------------------------------------------
NOTICE: Firebase Admin SDK is not configured. 
Server-side features like session management and route protection will not work.
To enable it, set the FIREBASE_ADMIN_* environment variables with your service account key details.
See HANDOFF.md for instructions.
----------------------------------------------------------------
`);
  } else {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin SDK initialized.");
    } catch(e) {
        console.error("Failed to initialize Firebase Admin SDK. Check your FIREBASE_ADMIN_* environment variables.", e);
    }
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
