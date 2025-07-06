// This file is intended for use in Edge Functions like Middleware.
// It uses Firebase Admin SDK which is designed for server-side environments.

import { adminDb } from './firebase-admin';

export async function getStoreByDomain(domain: string): Promise<{id: string} | null> {
    if (!adminDb) {
        console.warn('Firebase Admin SDK is not configured. Cannot query stores.');
        return null;
    }

    try {
        const storesCollection = adminDb.collection('stores');
        const querySnapshot = await storesCollection.where("domain", "==", domain).limit(1).get();
        
        if (querySnapshot.empty) {
            return null;
        }
        
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as {id: string};
    } catch (error) {
        console.error('Error querying store by domain:', error);
        return null;
    }
}