'use server';

import { headers } from 'next/headers';
import type { CartItem } from '@/hooks/use-cart';
import { orders, stores, type Order } from '@/lib/placeholder-data';

export type CheckoutData = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export async function placeOrder(
  checkoutData: CheckoutData,
  cartItems: CartItem[],
  cartTotal: number,
): Promise<{ success: boolean, message: string, orderId?: string }> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId || !stores.find(s => s.id === storeId)) {
    return { success: false, message: 'Invalid store. Could not place order.' };
  }

  if (cartItems.length === 0) {
    return { success: false, message: 'Your cart is empty. Cannot place order.' };
  }

  const { name, email, phone } = checkoutData;

  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    storeId,
    customerName: name,
    customerEmail: email,
    customerPhone: phone,
    date: new Date().toISOString(),
    status: 'Pending',
    total: cartTotal,
  };
  
  // In a real app, you would save this to a database.
  // For this prototype, we'll just push it to our in-memory array.
  orders.unshift(newOrder);

  console.log(`New order placed: ${newOrder.id} for store ${storeId}`);

  return { success: true, message: 'Order placed!', orderId: newOrder.id };
}
