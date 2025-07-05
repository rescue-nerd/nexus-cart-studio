'use server';

import { sendWhatsAppNotification } from '@/ai/flows/whatsapp-notification';
import { Order, products, storeConfig } from '@/lib/placeholder-data';

// This is a placeholder for a function that would fetch product details for an order.
// In a real app, this would query a database.
function getOrderProducts(orderId: string): { name: string; quantity: number }[] {
    // Dummy implementation: returns 1-2 random products for any order
    if (orderId.endsWith('1')) return [{ name: products[1].name, quantity: 1 }];
    if (orderId.endsWith('2')) return [{ name: products[0].name, quantity: 1 }];
    if (orderId.endsWith('3')) return [{ name: products[2].name, quantity: 2 }];
    if (orderId.endsWith('4')) return [{ name: products[3].name, quantity: 1 }];
    return [{ name: products[4].name, quantity: 1 }];
}

/**
 * Formats a message for the buyer about their order update.
 */
function formatBuyerMessage(order: Order): string {
    const productDetails = getOrderProducts(order.id)
        .map(p => `${p.name} (Qty: ${p.quantity})`)
        .join(', ');

    return `Dear ${order.customerName},

Your order #${order.id} from ${storeConfig.name} has been updated.

Status: *${order.status}*
Total: Rs ${order.total.toFixed(2)}
Items: ${productDetails}

Thank you for your purchase!`;
}

/**
 * Formats a message for the seller about a new order or update.
 */
function formatSellerMessage(order: Order): string {
    const productDetails = getOrderProducts(order.id)
        .map(p => `${p.name} (Qty: ${p.quantity})`)
        .join(', ');

    return `New Order Update for ${storeConfig.name}!

Order #${order.id}
Customer: ${order.customerName}
Status: *${order.status}*
Total: Rs ${order.total.toFixed(2)}
Items: ${productDetails}

Contact: ${order.customerEmail} / ${order.customerPhone}`;
}

/**
 * Sends WhatsApp notifications for an order update to both buyer and seller.
 * @param order The order object that has been updated.
 */
export async function sendOrderUpdateNotifications(order: Order) {
  try {
    // Notify the buyer
    if (order.customerPhone) {
      const buyerMessage = formatBuyerMessage(order);
      await sendWhatsAppNotification({ to: order.customerPhone, message: buyerMessage });
    } else {
      console.log(`No phone number for customer ${order.customerName}, skipping buyer notification.`);
    }

    // Notify the seller
    const sellerMessage = formatSellerMessage(order);
    await sendWhatsAppNotification({ to: storeConfig.sellerWhatsAppNumber, message: sellerMessage });

    console.log(`Successfully queued notifications for order ${order.id}.`);
    return { success: true, message: `Notifications sent for order ${order.id}.` };

  } catch (error) {
    console.error(`Failed to send notifications for order ${order.id}:`, error);
    return { success: false, message: 'Failed to send notifications.' };
  }
}
