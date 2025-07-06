
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getT } from '@/lib/translation-server';

import { addOrder } from '@/lib/firebase-service';
import type { CartItem } from '@/hooks/use-cart';
import { sendOrderUpdateNotifications } from '@/lib/order-service';
import type { OrderItem, Order } from '@/lib/types';


export type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'qr' | 'bank';
};

type PlaceOrderResult = {
  success: boolean;
  messageKey?: 'checkout.invalidForm' | 'checkout.emptyCart' | 'error.storeNotFound';
  orderId?: string;
  paymentMethod?: CheckoutFormValues['paymentMethod'];
};

export async function placeOrder(
  values: CheckoutFormValues,
  cartItems: CartItem[],
  lang: 'en' | 'ne' = 'en'
): Promise<PlaceOrderResult> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, messageKey: "error.storeNotFound" };
  }

  if (cartItems.length === 0) {
    return { success: false, messageKey: 'checkout.emptyCart' };
  }

  const { customerName, customerEmail, customerPhone, address, city, paymentMethod } = values;

  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  
  const orderItems: OrderItem[] = cartItems.map(item => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
  }));
  
  let orderStatus: Order['status'] = 'Pending';
  let paymentMethodFormatted: Order['paymentMethod'] = 'COD';

  if (paymentMethod === 'qr') {
      orderStatus = 'Processing';
      paymentMethodFormatted = 'QR';
  } else if (paymentMethod === 'bank') {
      orderStatus = 'Processing';
      paymentMethodFormatted = 'Bank Transfer';
  }
  
  const newOrderData = {
    storeId: storeId,
    customerName,
    customerEmail,
    customerPhone,
    address,
    city,
    paymentMethod: paymentMethodFormatted,
    date: new Date().toISOString(),
    status: orderStatus,
    total: cartTotal,
    items: orderItems,
  };

  const newOrder = await addOrder(newOrderData);
  
  await sendOrderUpdateNotifications(newOrder, lang);

  revalidatePath('/store');
  revalidatePath('/orders');
  
  return { success: true, paymentMethod, orderId: newOrder.id };
}
