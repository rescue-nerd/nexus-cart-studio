
'use server';

import { sendWhatsAppNotification } from '@/ai/flows/whatsapp-notification';
import type { Order } from './types';
import { storeConfig } from './config';
import { getT } from '@/lib/translation-server';
import { getStore } from '@/lib/firebase-service';

/**
 * Formats a message for the buyer about their order update.
 */
async function formatBuyerMessage(order: Order, lang: 'en' | 'ne', storeName: string): Promise<string> {
    const t = await getT(lang);
    const productDetails = order.items
        .map(p => `${p.productName} (${t('print.qty')}: ${p.quantity})`)
        .join(', ');

    return `${t('notifications.dear')} ${order.customerName},\n\n${t('notifications.orderUpdate', { storeName })}\n\n${t('notifications.status')}: *${t(`orders.status.${order.status.toLowerCase()}`)}*\n${t('notifications.paymentMethod')}: ${order.paymentMethod}\n${t('notifications.total')}: ${t('print.currencySymbol')} ${order.total.toFixed(2)}\n${t('notifications.items')}: ${productDetails}\n${t('notifications.shippingAddress')}: ${order.address}, ${order.city}\n\n${t('notifications.thankYou')}`;
}

/**
 * Formats a message for the seller about a new order or update.
 */
async function formatSellerMessage(order: Order, storeName: string): Promise<string> {
    // Seller notifications are always in English for consistency.
    const t = await getT('en'); 
    const productDetails = order.items
        .map(p => `${p.productName} (${t('print.qty')}: ${p.quantity})`)
        .join(', ');

    return `${t('notifications.seller.title', { storeName })}\n\n${t('notifications.seller.orderId')} #${order.id}\n${t('notifications.seller.customer')}: ${order.customerName}\n${t('notifications.status')}: *${t(`orders.status.${order.status.toLowerCase()}`)}*\n${t('notifications.paymentMethod')}: ${order.paymentMethod}\n${t('notifications.total')}: ${t('print.currencySymbol')} ${order.total.toFixed(2)}\n${t('notifications.items')}: ${productDetails}\n${t('notifications.seller.shippingTo')}: ${order.address}, ${order.city}\n\n${t('notifications.seller.contact')}: ${order.customerEmail} / ${order.customerPhone}`;
}

/**
 * Sends WhatsApp notifications for an order update to both buyer and seller.
 */
export async function sendOrderUpdateNotifications(order: Order, lang: 'en' | 'ne' = 'en') {
  try {
    const store = await getStore(order.storeId);
    if (!store) {
      console.error(`Store not found for order ${order.id}, cannot send notifications.`);
      return { success: false, message: 'Store not found.' };
    }

    // Notify the buyer
    if (order.customerPhone) {
      const buyerMessage = await formatBuyerMessage(order, lang, store.name);
      await sendWhatsAppNotification({ to: order.customerPhone, message: buyerMessage });
    } else {
      console.log(`No phone number for customer ${order.customerName}, skipping buyer notification.`);
    }

    // Notify the seller, using store-specific number if available
    const sellerWhatsAppNumber = store.whatsappNumber || storeConfig.sellerWhatsAppNumber;
    if (sellerWhatsAppNumber) {
        const sellerMessage = await formatSellerMessage(order, store.name);
        await sendWhatsAppNotification({ to: sellerWhatsAppNumber, message: sellerMessage });
    }

    console.log(`Successfully queued notifications for order ${order.id}.`);
    return { success: true, message: `Notifications sent for order ${order.id}.` };

  } catch (error) {
    console.error(`Failed to send notifications for order ${order.id}:`, error);
    return { success: false, message: 'Failed to send notifications.' };
  }
}
