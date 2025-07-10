// This file is intended for use in Edge Functions like Middleware.
// It uses Firebase Admin SDK which is designed for server-side environments.

import { adminDb } from './firebase-admin';

export async function getStoreByDomain(domain: string): Promise<{ id: string } | null> {
    if (!adminDb) {
        console.warn('Firebase Admin SDK is not configured. Cannot query stores.');
        return null;
    }

    try {
        const storesCollection = adminDb.collection('stores');
        const querySnapshot = await storesCollection.where('domain', '==', domain).limit(1).get();
        if (querySnapshot.empty) {
            return null;
        }
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        if (!data) {
            throw new Error('Document data is empty');
        }
        return { id: doc.id };
    } catch (error: unknown) {
        let errorMessage = 'Error querying store by domain';
        if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
            errorMessage = (error as { message: string }).message;
        }
        console.error('Error querying store by domain:', error);
        return null;
    }
}