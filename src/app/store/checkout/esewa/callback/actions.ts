
'use server';

import crypto from 'crypto';
import { getOrderByTransactionUUID, getStore, updateOrder } from "@/lib/firebase-service";

type VerificationResult = {
    success: boolean;
    orderId?: string;
    messageKey: 'verificationSuccess' | 'eSewaVerificationFailed' | 'eSewaOrderNotFound' | 'eSewaInvalidSignature' | 'eSewaStatusNotComplete' | 'eSewaError' | 'eSewaInvalidCallback';
}

export async function verifyESewaPayment(base64Data: string): Promise<VerificationResult> {
    try {
        const decodedData = JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));

        const { transaction_uuid, total_amount, product_code, status, signature: receivedSignature, signed_field_names, transaction_code } = decodedData;

        if (!transaction_uuid) {
            return { success: false, messageKey: 'eSewaInvalidCallback' };
        }

        const order = await getOrderByTransactionUUID(transaction_uuid);
        if (!order) {
            return { success: false, messageKey: 'eSewaOrderNotFound' };
        }

        const store = await getStore(order.storeId);
        if (!store || !store.paymentSettings?.eSewaSecretKey || !store.paymentSettings.eSewaMerchantCode) {
            await updateOrder(order.id, { status: 'Failed' });
            return { success: false, orderId: order.id, messageKey: 'eSewaError' };
        }

        // --- Step 1: Verify the signature from the callback ---
        const message = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;

        const expectedSignature = crypto
            .createHmac('sha256', store.paymentSettings.eSewaSecretKey)
            .update(message)
            .digest('base64');
        
        if (expectedSignature !== receivedSignature) {
            await updateOrder(order.id, { status: 'Failed' });
            return { success: false, orderId: order.id, messageKey: 'eSewaInvalidSignature' };
        }

        // --- Step 2: Use the server-to-server Status Check API for final confirmation ---
        const verificationUrl = store.paymentSettings.eSewaTestMode
            ? `https://rc.esewa.com.np/api/epay/transaction/status/`
            : `https://epay.esewa.com.np/api/epay/transaction/status/`;

        const params = new URLSearchParams({
            product_code: store.paymentSettings.eSewaMerchantCode,
            total_amount: order.total.toString(),
            transaction_uuid: transaction_uuid
        });

        const response = await fetch(`${verificationUrl}?${params.toString()}`);
        const verificationData = await response.json();

        if (response.ok && verificationData.status === 'COMPLETE') {
             await updateOrder(order.id, { 
                status: 'Processing',
                paymentDetails: { ...order.paymentDetails, ref_id: verificationData.ref_id }
            });
            return { success: true, orderId: order.id, messageKey: 'verificationSuccess' };
        } else {
             await updateOrder(order.id, { status: 'Failed' });
             console.error("eSewa verification failed or status not complete:", verificationData);
             return { success: false, orderId: order.id, messageKey: 'eSewaStatusNotComplete' };
        }

    } catch (error) {
        console.error("eSewa verification process failed:", error);
        return { success: false, messageKey: 'eSewaError' };
    }
}
