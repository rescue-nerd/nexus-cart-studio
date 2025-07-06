
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getT } from '@/lib/translation-server';

import { addOrder } from '@/lib/firebase-service';
import { storeConfig } from '@/lib/config';
import type { CartItem } from '@/hooks/use-cart';
import { sendOrderUpdateNotifications } from '@/lib/order-service';
import type { OrderItem } from '@/lib/types';


export type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'whatsapp' | 'cod' | 'esewa';
};

type PlaceOrderResult = {
  success: boolean;
  messageKey?: 'checkout.invalidForm' | 'checkout.emptyCart' | 'error.storeNotFound';
  orderId?: string;
  whatsappUrl?: string;
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

  // --- Handle WhatsApp Orders ---
  if (paymentMethod === 'whatsapp') {
    const t = await getT(lang);
    const sellerPhone = storeConfig.sellerWhatsAppNumber.replace(/\D/g, '');
    let message = `${t('notifications.whatsapp.greeting')} ${customerName} (${customerPhone}).\n\n`;
    cartItems.forEach(item => {
      message += `- ${item.product.name} (${t('print.qty')}: ${item.quantity}) - ${t('print.currencySymbol')} ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*${t('print.total')}: ${t('print.currencySymbol')} ${cartTotal.toFixed(2)}*\n\n`;
    message += `${t('notifications.shippingAddress')}: ${address}, ${city}.\n\n`;
    message += `${t('notifications.whatsapp.confirm')}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodedMessage}`;
    
    return { success: true, paymentMethod: 'whatsapp', whatsappUrl };
  }
  
  // --- Handle Normal Orders (COD, eSewa) ---
  const orderItems: OrderItem[] = cartItems.map(item => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
  }));
  
  const newOrderData = {
    storeId: storeId,
    customerName,
    customerEmail,
    customerPhone,
    address,
    city,
    paymentMethod: paymentMethod === 'cod' ? 'COD' as const : 'eSewa' as const,
    date: new Date().toISOString(),
    status: 'Pending' as const,
    total: cartTotal,
    items: orderItems,
  };

  const newOrder = await addOrder(newOrderData);
  
  await sendOrderUpdateNotifications(newOrder, lang);

  revalidatePath('/store');
  revalidatePath('/orders');
  
  return { success: true, paymentMethod, orderId: newOrder.id };
}
