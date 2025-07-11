
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

import { addOrder, getStore, updateOrder } from '@/lib/firebase-service';
import { sendNewOrderNotifications } from '@/lib/email-utils';
import type { CartItem } from '@/hooks/use-cart';
import type { OrderItem, Order } from '@/lib/types';


export type CheckoutFormValues = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  paymentMethod: 'cod' | 'qr' | 'bank' | 'khalti' | 'esewa';
};

type ManualPlaceOrderResult = {
  success: boolean;
  messageKey?: 'checkout.invalidForm' | 'checkout.emptyCart' | 'error.storeNotFound';
  orderId?: string;
  paymentMethod?: CheckoutFormValues['paymentMethod'];
};

type KhaltiInitiateResult = {
    success: boolean;
    messageKey?: string;
    paymentUrl?: string;
};

export type ESewaFormData = {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
};

type ESewaInitiateResult = {
    success: boolean;
    messageKey?: 'checkout.eSewaNotConfigured' | 'checkout.eSewaError' | 'error.storeNotFound';
    formData?: ESewaFormData;
};

export async function placeManualOrder(
  values: CheckoutFormValues,
  cartItems: CartItem[],
  lang: 'en' | 'ne' = 'en'
): Promise<ManualPlaceOrderResult> {
  const headersList = await headers();
  const storeId = headersList.get('x-store-id');

  if (!storeId) {
    return { success: false, messageKey: "error.storeNotFound" };
  }

  const store = await getStore(storeId);
  if (!store) {
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
  
  // Send email notifications
  try {
    await sendNewOrderNotifications({
      orderId: newOrder.id,
      customerName,
      customerEmail,
      orderTotal: cartTotal,
      orderItems: orderItems.map(item => ({
        name: item.productName,
        quantity: item.quantity,
        price: item.price,
      })),
      storeName: store.name,
      storeId,
      adminEmail: store.ownerEmail,
    });
  } catch (error) {
    console.error('Failed to send order notifications:', error);
    // Don't fail the order if email fails
  }
  
  revalidatePath('/store');
  revalidatePath('/orders');
  
  return { success: true, paymentMethod, orderId: newOrder.id };
}


export async function initiateKhaltiPayment(
    values: CheckoutFormValues,
    cartItems: CartItem[]
): Promise<KhaltiInitiateResult> {
    const headersList = await headers();
    const storeId = headersList.get('x-store-id');
    const domain = headersList.get('host') || 'localhost:9002';

    if (!storeId) {
        return { success: false, messageKey: "error.storeNotFound" };
    }
    
    const store = await getStore(storeId);
    if (!store?.paymentSettings?.khaltiSecretKey) {
        return { success: false, messageKey: 'checkout.khaltiNotConfigured' };
    }

    const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);

     const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
    }));
    
    const preliminaryOrderData = {
        storeId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        address: values.address,
        city: values.city,
        paymentMethod: 'Khalti' as const,
        date: new Date().toISOString(),
        status: 'Pending' as const,
        total: cartTotal,
        items: orderItems,
    };
    
    const newOrder = await addOrder(preliminaryOrderData);

    const khaltiApiUrl = store.paymentSettings.khaltiTestMode 
        ? 'https://dev.khalti.com/api/v2/epayment/initiate/' 
        : 'https://khalti.com/api/v2/epayment/initiate/';

    const protocol = domain.startsWith('localhost') ? 'http' : 'https';

    const payload = {
        return_url: `${protocol}://${domain}/store/checkout/khalti/callback`,
        website_url: `${protocol}://${domain}/store`,
        amount: cartTotal * 100, // Convert to paisa
        purchase_order_id: newOrder.id,
        purchase_order_name: `Order from ${store.name}`,
        customer_info: {
            name: values.customerName,
            email: values.customerEmail,
            phone: values.customerPhone,
        },
        product_details: cartItems.map(item => ({
            identity: item.product.id,
            name: item.product.name,
            total_price: item.product.price * item.quantity * 100,
            quantity: item.quantity,
            unit_price: item.product.price * 100,
        }))
    };

    try {
        const response = await fetch(khaltiApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${store.paymentSettings.khaltiSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.pidx) {
            await updateOrder(newOrder.id, { paymentDetails: { pidx: data.pidx } });
            return { success: true, paymentUrl: data.payment_url };
        } else {
            return { success: false, messageKey: 'checkout.khaltiError' };
        }
    } catch (error) {
        console.error('Khalti payment initiation error:', error);
        return { success: false, messageKey: 'checkout.khaltiError' };
    }
}

export async function initiateESewaPayment(
    values: CheckoutFormValues,
    cartItems: CartItem[]
): Promise<ESewaInitiateResult> {
    const headersList = await headers();
    const storeId = headersList.get('x-store-id');
    const domain = headersList.get('host') || 'localhost:9002';

    if (!storeId) {
        return { success: false, messageKey: "error.storeNotFound" };
    }
    
    const store = await getStore(storeId);
    if (!store?.paymentSettings?.eSewaMerchantCode || !store?.paymentSettings?.eSewaSecretKey) {
        return { success: false, messageKey: 'checkout.eSewaNotConfigured' };
    }

    const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
    const taxAmount = Math.round(cartTotal * 0.13); // 13% tax
    const totalAmount = cartTotal + taxAmount;

    const orderItems: OrderItem[] = cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
    }));
    
    const preliminaryOrderData = {
        storeId,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        address: values.address,
        city: values.city,
        paymentMethod: 'eSewa' as const,
        date: new Date().toISOString(),
        status: 'Pending' as const,
        total: totalAmount,
        items: orderItems,
    };
    
    const newOrder = await addOrder(preliminaryOrderData);

    const eSewaApiUrl = store.paymentSettings.eSewaTestMode 
        ? 'https://esewa.com.np/epay/main' 
        : 'https://esewa.com.np/epay/main';

    const protocol = domain.startsWith('localhost') ? 'http' : 'https';
    const transactionUUID = crypto.randomUUID();

    const formData: ESewaFormData = {
        amount: cartTotal.toString(),
        tax_amount: taxAmount.toString(),
        total_amount: totalAmount.toString(),
        transaction_uuid: transactionUUID,
        product_code: 'EPAYTEST',
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${protocol}://${domain}/store/checkout/esewa/callback`,
        failure_url: `${protocol}://${domain}/store/checkout/esewa/callback`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature: '', // This would be calculated with the secret key
    };

    // In a real implementation, you would calculate the signature
    // For now, we'll use a placeholder
    formData.signature = 'placeholder_signature';

    await updateOrder(newOrder.id, { 
        paymentDetails: { 
            transaction_uuid: transactionUUID,
            ref_id: newOrder.id 
        } 
    });

    return { success: true, formData };
}
