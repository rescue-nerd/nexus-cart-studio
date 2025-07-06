
'use server';

import { getOrder, getStore, updateOrder } from "@/lib/firebase-service";

type VerificationResult = {
    success: boolean;
    orderId?: string;
    messageKey: 'verificationSuccess' | 'verificationFailed' | 'verificationPending' | 'verificationUserCancelled' | 'verificationExpired' | 'verificationNotFound' | 'verificationError';
}

export async function verifyKhaltiPayment(pidx: string): Promise<VerificationResult> {
    const order = await getOrder(pidx, true);
    if (!order) {
        return { success: false, messageKey: 'verificationNotFound' };
    }
    
    const store = await getStore(order.storeId);
    if (!store || !store.paymentSettings?.khaltiSecretKey) {
        await updateOrder(order.id, { status: 'Failed' });
        return { success: false, orderId: order.id, messageKey: 'verificationError' };
    }
    
    const khaltiApiUrl = store.paymentSettings.khaltiTestMode 
        ? 'https://dev.khalti.com/api/v2/epayment/lookup/' 
        : 'https://khalti.com/api/v2/epayment/lookup/';

    try {
        const response = await fetch(khaltiApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${store.paymentSettings.khaltiSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pidx }),
        });

        const data = await response.json();

        if (response.ok) {
            await updateOrder(order.id, { 
                status: data.status === 'Completed' ? 'Processing' : data.status === 'User canceled' ? 'Cancelled' : 'Failed',
                paymentDetails: { pidx, transactionId: data.transaction_id }
            });

            switch (data.status) {
                case 'Completed':
                    return { success: true, orderId: order.id, messageKey: 'verificationSuccess' };
                case 'Pending':
                    return { success: false, orderId: order.id, messageKey: 'verificationPending' };
                case 'User canceled':
                    return { success: false, orderId: order.id, messageKey: 'verificationUserCancelled' };
                case 'Expired':
                    return { success: false, orderId: order.id, messageKey: 'verificationExpired' };
                default:
                    return { success: false, orderId: order.id, messageKey: 'verificationFailed' };
            }
        } else {
             await updateOrder(order.id, { status: 'Failed' });
            return { success: false, orderId: order.id, messageKey: 'verificationError' };
        }

    } catch (error) {
        console.error("Khalti verification failed:", error);
        await updateOrder(order.id, { status: 'Failed' });
        return { success: false, orderId: order.id, messageKey: 'verificationError' };
    }
}
