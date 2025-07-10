'use client';

import { app } from '@/lib/firebase';
import { 
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
    limit,
    orderBy,
} from 'firebase/firestore';
import type { Store, Product, Order, Category, Plan } from './types';
import { plans, categories } from './config';
import type { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';

// Initialize Firestore
const db = app ? getFirestore(app) : null;

// Helper to convert Firestore doc to a typed object with ID
const docToType = <T>(doc: QueryDocumentSnapshot<DocumentData>): T => {
    const data = doc.data();
    if (!data) {
        throw new Error("Document data is empty");
    }
    // Convert Timestamps to ISO strings
    const processedData: Record<string, unknown> = { ...data };
    for (const key in processedData) {
        if (processedData[key] && typeof (processedData[key] as { toDate?: () => Date }).toDate === 'function') {
            processedData[key] = (processedData[key] as { toDate: () => Date }).toDate().toISOString();
        }
    }
    return { id: doc.id, ...processedData } as T;
};

// --- Store Functions ---
export async function getStore(storeId: string): Promise<Store | null> {
    if (!db) return null;
    
    const docRef = doc(db, 'stores', storeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Store>(docSnap) : null;
}

export async function getStoreByDomain(domain: string): Promise<Store | null> {
    if (!db) return null;
    
    const storesCollection = collection(db, 'stores');
    const q = query(storesCollection, where("domain", "==", domain), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return docToType<Store>(querySnapshot.docs[0]);
}

export async function getAllStores(): Promise<Store[]> {
    if (!db) return [];
    const storesCollection = collection(db, 'stores');
    const querySnapshot = await getDocs(storesCollection);
    return querySnapshot.docs.map(doc => docToType<Store>(doc));
}

// --- Product Functions ---
export async function getProduct(productId: string): Promise<Product | null> {
    if (!db) return null;
    
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Product>(docSnap) : null;
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
    if (!db) return [];
    
    const productsCollection = collection(db, 'products');
    const q = query(productsCollection, where("storeId", "==", storeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Product>(doc));
}

// --- Order Functions ---
export async function getOrder(orderId: string): Promise<Order | null> {
    if (!db) return null;
    
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Order>(docSnap) : null;
}

export async function getOrdersByStore(storeId: string): Promise<Order[]> {
    if (!db) return [];
    
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where("storeId", "==", storeId), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

export async function getRecentOrders(storeId: string, count: number = 5): Promise<Order[]> {
    if (!db) return [];
    
    const ordersCollection = collection(db, 'orders');
    const q = query(ordersCollection, where("storeId", "==", storeId), orderBy("date", "desc"), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

// --- Static Data Functions ---
export async function getPlans(): Promise<Plan[]> {
    return Promise.resolve(plans);
}

export async function getAllCategories(): Promise<Category[]> {
    return Promise.resolve(categories);
}