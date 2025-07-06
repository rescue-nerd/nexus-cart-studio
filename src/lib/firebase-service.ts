
import 'server-only';

import { app } from '@/lib/firebase';
import { 
    getFirestore,
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    limit,
    orderBy,
    writeBatch,
    increment,
    serverTimestamp
} from 'firebase/firestore';
import type { Store, Product, Order, OrderItem, Plan, Category } from './types';
import { plans, categories } from './config';

if (!app) {
    throw new Error('Firebase has not been initialized. Please check your configuration.');
}

const db = getFirestore(app);

const storesCollection = collection(db, 'stores');
const productsCollection = collection(db, 'products');
const ordersCollection = collection(db, 'orders');

// Helper to convert Firestore doc to a typed object with ID
const docToType = <T>(doc: FirebaseFirestore.DocumentSnapshot): T => {
    const data = doc.data();
    if (!data) {
        // This case should ideally not happen if doc.exists() is checked before calling
        throw new Error("Document data is empty");
    }
    // Convert Timestamps to ISO strings
    for (const key in data) {
        if (data[key]?.toDate) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return { id: doc.id, ...data } as T;
};

// --- Store Functions ---

export async function getStore(storeId: string): Promise<Store | null> {
    const docRef = doc(db, 'stores', storeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Store>(docSnap) : null;
}

export async function getStoreByDomain(domain: string): Promise<Store | null> {
    const q = query(storesCollection, where("domain", "==", domain), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return docToType<Store>(querySnapshot.docs[0]);
}

export async function getAllStores(): Promise<Store[]> {
    const querySnapshot = await getDocs(storesCollection);
    return querySnapshot.docs.map(doc => docToType<Store>(doc));
}

export async function addStore(storeData: Omit<Store, 'id' | 'productCount' | 'orderCount' | 'createdAt'>): Promise<Store> {
    const newStoreData = {
        ...storeData,
        productCount: 0,
        orderCount: 0,
        createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(storesCollection, newStoreData);
    
    // We can't return the exact Store object with the server timestamp immediately
    // without another read, so we'll return a client-side approximation.
    return { id: docRef.id, ...storeData, productCount: 0, orderCount: 0 };
}

export async function updateStore(storeId: string, data: Partial<Store>): Promise<void> {
    const docRef = doc(db, 'stores', storeId);
    await updateDoc(docRef, data);
}

// --- Product Functions ---

export async function getProduct(productId: string): Promise<Product | null> {
    const docRef = doc(db, 'products', productId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Product>(docSnap) : null;
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
    const q = query(productsCollection, where("storeId", "==", storeId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Product>(doc));
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const batch = writeBatch(db);
    
    const productRef = doc(collection(db, 'products'));
    batch.set(productRef, {...productData, createdAt: serverTimestamp()});

    const storeRef = doc(db, 'stores', productData.storeId);
    batch.update(storeRef, { productCount: increment(1) });
    
    await batch.commit();
    return { id: productRef.id, ...productData, createdAt: new Date().toISOString() };
}

export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
    const docRef = doc(db, 'products', productId);
    await updateDoc(docRef, data);
}

export async function deleteProduct(productId: string, storeId: string): Promise<void> {
    const batch = writeBatch(db);
    
    const productRef = doc(db, 'products', productId);
    batch.delete(productRef);

    const storeRef = doc(db, 'stores', storeId);
    batch.update(storeRef, { productCount: increment(-1) });

    await batch.commit();
}


// --- Order Functions ---

export async function getOrder(orderId: string, isPidx: boolean = false): Promise<Order | null> {
    if (isPidx) {
        const q = query(ordersCollection, where("paymentDetails.pidx", "==", orderId), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return null;
        }
        return docToType<Order>(querySnapshot.docs[0]);
    }
    const docRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docToType<Order>(docSnap) : null;
}

export async function getOrderByTransactionUUID(uuid: string): Promise<Order | null> {
    const q = query(ordersCollection, where("paymentDetails.transaction_uuid", "==", uuid), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    return docToType<Order>(querySnapshot.docs[0]);
}

export async function getOrdersByStore(storeId: string): Promise<Order[]> {
    const q = query(ordersCollection, where("storeId", "==", storeId), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

export async function getRecentOrders(storeId: string, count: number = 5): Promise<Order[]> {
    const q = query(ordersCollection, where("storeId", "==", storeId), orderBy("date", "desc"), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => docToType<Order>(doc));
}

export async function addOrder(orderData: Omit<Order, 'id'>): Promise<Order> {
    const batch = writeBatch(db);

    const orderRef = doc(collection(db, 'orders'));
    batch.set(orderRef, orderData);

    // Only decrement stock for non-failed/cancelled initial orders
    if (orderData.status === 'Pending' || orderData.status === 'Processing') {
        for (const item of orderData.items) {
            const productRef = doc(db, 'products', item.productId);
            batch.update(productRef, { stock: increment(-item.quantity) });
        }
        const storeRef = doc(db, 'stores', orderData.storeId);
        batch.update(storeRef, { orderCount: increment(1) });
    }
    
    await batch.commit();

    return { id: orderRef.id, ...orderData };
}

export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, data);
}

// --- Static Data Functions ---
export async function getPlans(): Promise<Plan[]> {
    return Promise.resolve(plans);
}

export async function getAllCategories(): Promise<Category[]> {
    return Promise.resolve(categories);
}


// --- Analytics Functions ---

export async function getStoreAnalytics(storeId: string) {
    const storeOrders = await getOrdersByStore(storeId);
    const storeProducts = await getProductsByStore(storeId);

    const totalSales = storeOrders.reduce((sum, order) => {
        return order.status !== 'Cancelled' && order.status !== 'Failed' && order.status !== 'Refunded' ? sum + order.total : sum;
    }, 0);

    const totalOrders = storeOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Failed').length;
    
    const salesData: { name: string; total: number }[] = [];
    const months: { [key: string]: number } = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 };
    
    storeOrders.forEach(order => {
        if (order.status !== 'Cancelled' && order.status !== 'Failed' && order.status !== 'Refunded') {
            const month = new Date(order.date).toLocaleString('default', { month: 'short' });
            if (months.hasOwnProperty(month)) {
                months[month] += order.total;
            }
        }
    });

    for (const monthName in months) {
        salesData.push({ name: monthName, total: months[monthName] });
    }
    
    return {
        totalSales,
        totalOrders,
        totalProducts: storeProducts.length,
        salesData,
    };
}
