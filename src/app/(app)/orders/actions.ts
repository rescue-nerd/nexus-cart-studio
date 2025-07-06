'use server';

import { revalidatePath } from 'next/cache';
import { orders as allOrders, type Order } from '@/lib/placeholder-data';
import { sendOrderUpdateNotifications } from '@/lib/order-service';

export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ success: boolean; message?: string }> {
  try {
    const order = allOrders.find((o) => o.id === orderId);

    if (!order) {
      return { success: false, message: 'Order not found.' };
    }

    // In a real app, this would update the database.
    order.status = status;

    // Send notification on status change
    await sendOrderUpdateNotifications(order);

    revalidatePath('/orders');
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: `Order ${orderId} marked as ${status}.` };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message };
  }
}
