
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getT } from '@/lib/translation-server';
import crypto from 'crypto';
import { randomUUID } from 'crypto';

import { addOrder, getStore, updateOrder, getOrderByTransactionUUID } from '@/lib/firebase-service';
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
  
  revalidatePath('/store');
  revalidatePath('/orders');
  
  return { success: true, paymentMethod, orderId: newOrder.id };
}


export async function initiateKhaltiPayment(
    values: CheckoutFormValues,
    cartItems: CartItem[]
): Promise<KhaltiInitiateResult> {
    const headersList = headers();
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
            console.error("Khalti initiation failed:", data);
            await updateOrder(newOrder.id, { status: 'Failed' });
            return { success: false, messageKey: 'checkout.khaltiError' };
        }

    } catch (error) {
        console.error("Error initiating Khalti payment:", error);
        await updateOrder(newOrder.id, { status: 'Failed' });
        return { success: false, messageKey: 'checkout.khaltiError' };
    }
}


export async function initiateESewaPayment(
    values: CheckoutFormValues,
    cartItems: CartItem[]
): Promise<ESewaInitiateResult> {
  const headersList = headers();
  const storeId = headersList.get('x-store-id');
  const domain = headersList.get('host') || 'localhost:9002';
  const protocol = domain.startsWith('localhost') ? 'http' : 'https';

  if (!storeId) {
    return { success: false, messageKey: 'error.storeNotFound' };
  }

  const store = await getStore(storeId);
  if (!store?.paymentSettings?.eSewaMerchantCode || !store?.paymentSettings?.eSewaSecretKey) {
    return { success: false, messageKey: 'checkout.eSewaNotConfigured' };
  }
  
  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const transaction_uuid = randomUUID();
  
  // Create preliminary order
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
    total: cartTotal,
    items: orderItems,
    paymentDetails: { transaction_uuid }
  };
  
  await addOrder(preliminaryOrderData);

  // Generate eSewa signature
  const signed_field_names = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${cartTotal},transaction_uuid=${transaction_uuid},product_code=${store.paymentSettings.eSewaMerchantCode}`;
  
  const signature = crypto
    .createHmac('sha256', store.paymentSettings.eSewaSecretKey)
    .update(message)
    .digest('base64');
  
  const formData: ESewaFormData = {
    amount: cartTotal.toString(),
    tax_amount: "0",
    total_amount: cartTotal.toString(),
    transaction_uuid,
    product_code: store.paymentSettings.eSewaMerchantCode,
    product_service_charge: "0",
    product_delivery_charge: "0",
    success_url: `${protocol}://${domain}/store/checkout/esewa/callback`,
    failure_url: `${protocol}://${domain}/store/checkout/esewa/callback`,
    signed_field_names,
    signature,
  };

  return { success: true, formData };
}
