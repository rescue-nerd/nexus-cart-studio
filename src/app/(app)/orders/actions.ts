'use server';

import { revalidatePath } from 'next/cache';
import { orders as allOrders, type Order } from '@/lib/placeholder-data';
import { sendOrderUpdateNotifications } from '@/lib/order-service';

export type UpdateOrderStatusResult = {
    success: boolean;
    messageKey: 'orderUpdateSuccess' | 'orderNotFound' | 'orderUpdateFailed';
    status?: Order['status'];
};

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<UpdateOrderStatusResult> {
  try {
    const order = allOrders.find((o) => o.id === orderId);

    if (!order) {
      return { success: false, messageKey: 'orderNotFound' };
    }

    // In a real app, this would update the database.
    order.status = status;

    // Send notification on status change
    await sendOrderUpdateNotifications(order);

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, messageKey: 'orderUpdateSuccess', status };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, messageKey: 'orderUpdateFailed' };
  }
}
