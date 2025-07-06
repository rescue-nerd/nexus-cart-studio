
// This file is intended for use in Edge Functions like Middleware.
// It avoids using the main 'firebase/app' which can cause issues in the Edge runtime.

import {initializeApp, getApp, getApps, FirebaseOptions} from 'firebase/app';
import { getFirestore, collection, query, where, limit, getDocs } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const docToType = <T>(doc: any): T => {
    const data = doc.data();
    return { id: doc.id, ...data } as T;
};

export async function getStoreByDomain(domain: string): Promise<{id: string} | null> {
    const storesCollection = collection(db, 'stores');
    const q = query(storesCollection, where("domain", "==", domain), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return docToType<{id: string}>(querySnapshot.docs[0]);
}
