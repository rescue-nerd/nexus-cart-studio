
'use server';

import { revalidatePath } from 'next/cache';
import { updateOrder, getOrder, getStore } from '@/lib/firebase-service';
import type { Order } from "@/lib/types";
import { getT } from '@/lib/translation-server';
import { requireRole, requireStoreOwnership } from '@/lib/rbac';
import { getAuthUserFromServerAction } from '@/lib/auth-utils';
import { logActivity } from '@/lib/activity-log';

export type UpdateOrderStatusResult = {
    success: boolean;
    messageKey: 'orderUpdateSuccess' | 'orderNotFound' | 'orderUpdateFailed' | 'orderCancelSuccess';
    status?: Order['status'];
};

export type RefundResult = {
    success: boolean;
    messageKey: 'refundSuccess' | 'refundFailed' | 'refundError' | 'orderNotFound' | 'invalidForRefund' | 'khaltiNotConfigured';
}

export async function updateOrderStatus(orderId: string, status: Order['status'], lang: 'en' | 'ne' = 'en'): Promise<UpdateOrderStatusResult> {
  const user = await getAuthUserFromServerAction();
  requireRole(user, 'super_admin', 'store_owner');
  const order = await getOrder(orderId);
  if (!order) {
    return { success: false, messageKey: 'orderNotFound' };
  }
  requireStoreOwnership(user, order.storeId);
  const t = await getT(lang);
  try {
    await updateOrder(orderId, { status });
    await logActivity(user, 'update_order_status', orderId, { status });
    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);
    const messageKey = status === 'Cancelled' ? 'orderCancelSuccess' : 'orderUpdateSuccess';
    return { success: true, messageKey, status };
  } catch (error) {
    await logActivity(user, 'update_order_status_failed', orderId, { error: error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error) });
    console.error('Failed to update order status:', error);
    return { success: false, messageKey: 'orderUpdateFailed' };
  }
}

export async function refundKhaltiOrder(orderId: string): Promise<RefundResult> {
    const user = await getAuthUserFromServerAction();
    const order = await getOrder(orderId);
    if (!order) {
        return { success: false, messageKey: 'orderNotFound' };
    }

    if (order.paymentMethod !== 'Khalti' || !order.paymentDetails?.transactionId) {
        return { success: false, messageKey: 'invalidForRefund' };
    }

    const store = await getStore(order.storeId);
    if (!store?.paymentSettings?.khaltiSecretKey) {
        return { success: false, messageKey: 'khaltiNotConfigured' };
    }

    // Use a different endpoint for sandbox vs production refunds
    const khaltiApiUrl = store.paymentSettings.khaltiTestMode
        ? `https://dev.khalti.com/api/merchant-transaction/${order.paymentDetails.transactionId}/refund/`
        : `https://khalti.com/api/merchant-transaction/${order.paymentDetails.transactionId}/refund/`;

    try {
        const response = await fetch(khaltiApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${store.paymentSettings.khaltiSecretKey}`,
                'Content-Type': 'application/json',
            },
        });
        
        const data = await response.json();

        if (response.ok && data.detail === "Transaction refund successful.") {
            await updateOrder(orderId, { status: 'Refunded' });
            await logActivity(user, 'refund_order', orderId, { order });
            revalidatePath('/orders');
            revalidatePath(`/orders/${orderId}`);
            return { success: true, messageKey: 'refundSuccess' };
        } else {
            await logActivity(user, 'refund_order_failed', orderId, { error: data });
            console.error('Khalti refund failed:', data);
            return { success: false, messageKey: 'refundFailed' };
        }
    } catch (error) {
        await logActivity(user, 'refund_order_failed', orderId, { error: error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error) });
        console.error('Error processing Khalti refund:', error);
        return { success: false, messageKey: 'refundError' };
    }
}
