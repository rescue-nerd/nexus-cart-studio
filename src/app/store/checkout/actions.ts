'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getT } from '@/lib/translation-server';

import { orders as allOrders, storeConfig } from '@/lib/placeholder-data';
import type { CartItem } from '@/hooks/use-cart';
import { sendOrderUpdateNotifications } from '@/lib/order-service';

// The Zod schema is now defined in the client component to access translations
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
  messageKey?: 'checkout.invalidForm' | 'checkout.emptyCart';
  orderId?: string;
  whatsappUrl?: string;
  paymentMethod?: CheckoutFormValues['paymentMethod'];
};

export async function placeOrder(
  values: CheckoutFormValues,
  cartItems: CartItem[],
  lang: 'en' | 'ne' = 'en'
): Promise<PlaceOrderResult> {
  // Since validation is now on the client, we trust the incoming values.
  // In a real app, you would re-validate here without relying on translated messages.
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
    
    // We don't create an order record for WhatsApp orders, as they are finalized in chat.
    return { success: true, paymentMethod: 'whatsapp', whatsappUrl };
  }
  
  // --- Handle Normal Orders (COD, eSewa) ---
  const orderId = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const storeId = 'store_001'; 

  const newOrder = {
    id: orderId,
    storeId: storeId,
    customerName,
    customerEmail,
    customerPhone,
    address,
    city,
    paymentMethod: paymentMethod === 'cod' ? 'COD' : 'eSewa',
    date: new Date().toISOString(),
    status: 'Pending' as const,
    total: cartTotal,
  };

  allOrders.unshift(newOrder);
  
  await sendOrderUpdateNotifications(newOrder, lang);

  revalidatePath('/store');
  revalidatePath('/orders');
  
  return { success: true, paymentMethod, orderId };
}
