'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { orders as allOrders, storeConfig } from '@/lib/placeholder-data';
import type { CartItem } from '@/hooks/use-cart';
import { sendOrderUpdateNotifications } from '@/lib/order-service';

export const checkoutFormSchema = z.object({
  customerName: z.string().min(2, 'Full name is required.'),
  customerEmail: z.string().email('A valid email is required.'),
  customerPhone: z.string().min(10, 'A valid phone number is required.'),
  address: z.string().min(5, 'A valid address is required.'),
  city: z.string().min(2, 'City is required.'),
  paymentMethod: z.enum(['whatsapp', 'cod', 'esewa'], {
    required_error: 'You need to select a payment method.',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

type PlaceOrderResult = {
  success: boolean;
  message?: string;
  orderId?: string;
  whatsappUrl?: string;
  paymentMethod?: CheckoutFormValues['paymentMethod'];
};

export async function placeOrder(
  values: CheckoutFormValues,
  cartItems: CartItem[]
): Promise<PlaceOrderResult> {
  const validatedFields = checkoutFormSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Invalid form data.',
    };
  }

  if (cartItems.length === 0) {
    return { success: false, message: 'Your cart is empty.' };
  }

  const { customerName, customerEmail, customerPhone, address, city, paymentMethod } = validatedFields.data;

  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

  // --- Handle WhatsApp Orders ---
  if (paymentMethod === 'whatsapp') {
    const sellerPhone = storeConfig.sellerWhatsAppNumber.replace(/\D/g, '');
    let message = `Hello! I would like to place an order from ${customerName} (${customerPhone}).\n\n`;
    cartItems.forEach(item => {
      message += `- ${item.product.name} (Qty: ${item.quantity}) - Rs ${(item.product.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: Rs ${cartTotal.toFixed(2)}*\n\n`;
    message += `Shipping Address: ${address}, ${city}.\n\n`;
    message += `Please confirm my order.`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${sellerPhone}?text=${encodedMessage}`;
    
    // We don't create an order record for WhatsApp orders, as they are finalized in chat.
    return { success: true, paymentMethod: 'whatsapp', whatsappUrl };
  }
  
  // --- Handle Normal Orders (COD, eSewa) ---
  const orderId = `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  // This is a placeholder for getting the storeId. In a real app, this might come from the session or domain.
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

  // In a real app, you would save this to a database.
  allOrders.unshift(newOrder);

  // In a real eSewa integration, you'd call their API here and redirect the user.
  // We'll just simulate success.
  
  // Send notifications
  await sendOrderUpdateNotifications(newOrder);

  revalidatePath('/store');
  revalidatePath('/orders');
  
  // We don't redirect here. The client will redirect based on the response.
  return { success: true, paymentMethod, orderId };
}
