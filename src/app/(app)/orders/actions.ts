
'use server';

import { revalidatePath } from 'next/cache';
import { updateOrder, getOrder } from '@/lib/firebase-service';
import type { Order } from "@/lib/types";
import { sendOrderUpdateNotifications } from '@/lib/order-service';

export type UpdateOrderStatusResult = {
    success: boolean;
    messageKey: 'orderUpdateSuccess' | 'orderNotFound' | 'orderUpdateFailed' | 'orderCancelSuccess';
    status?: Order['status'];
};

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  lang: 'en' | 'ne' = 'en'
): Promise<UpdateOrderStatusResult> {
  try {
    const order = await getOrder(orderId);

    if (!order) {
      return { success: false, messageKey: 'orderNotFound' };
    }

    await updateOrder(orderId, { status });
    const updatedOrder = { ...order, status };

    await sendOrderUpdateNotifications(updatedOrder, lang);

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);

    const messageKey = status === 'Cancelled' ? 'orderCancelSuccess' : 'orderUpdateSuccess';
    return { success: true, messageKey, status };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, messageKey: 'orderUpdateFailed' };
  }
}
