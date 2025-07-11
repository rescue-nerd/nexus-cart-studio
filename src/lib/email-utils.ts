import type {
  OrderConfirmationData,
  PasswordResetData,
  AdminAlertData,
  UserSignupData,
} from './email-service';

// Email utility functions for easy integration

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<void> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send order confirmation email');
    }
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    throw error;
  }
}

export async function sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'password_reset',
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send password reset email');
    }
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
}

export async function sendAdminAlertEmail(data: AdminAlertData): Promise<void> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'admin_alert',
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send admin alert email');
    }
  } catch (error) {
    console.error('Failed to send admin alert email:', error);
    throw error;
  }
}

export async function sendWelcomeEmail(data: UserSignupData): Promise<void> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send welcome email');
    }
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
}

export async function sendTestEmail(to: string): Promise<void> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        data: { to },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send test email');
    }
  } catch (error) {
    console.error('Failed to send test email:', error);
    throw error;
  }
}

// Helper functions for common email scenarios

export async function sendNewOrderNotifications(
  orderData: {
    orderId: string;
    customerName: string;
    customerEmail: string;
    orderTotal: number;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    storeName: string;
    storeId: string;
    adminEmail?: string;
  }
): Promise<void> {
  try {
    // Send order confirmation to customer
    await sendOrderConfirmationEmail({
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      customerEmail: orderData.customerEmail,
      orderTotal: orderData.orderTotal,
      orderItems: orderData.orderItems,
      storeName: orderData.storeName,
      orderDate: new Date().toISOString(),
    });

    // Send admin alert if admin email is provided
    if (orderData.adminEmail) {
      await sendAdminAlertEmail({
        alertType: 'new_order',
        storeId: orderData.storeId,
        storeName: orderData.storeName,
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        adminEmail: orderData.adminEmail,
      });
    }
  } catch (error) {
    console.error('Failed to send new order notifications:', error);
    // Don't throw - email failures shouldn't break the order process
  }
}

export async function sendLowStockAlert(
  productData: {
    productName: string;
    currentStock: number;
    threshold: number;
    storeName: string;
    adminEmail: string;
  }
): Promise<void> {
  try {
    await sendAdminAlertEmail({
      alertType: 'low_stock',
      productName: productData.productName,
      currentStock: productData.currentStock,
      threshold: productData.threshold,
      storeName: productData.storeName,
      adminEmail: productData.adminEmail,
    });
  } catch (error) {
    console.error('Failed to send low stock alert:', error);
  }
}

export async function sendPaymentFailedAlert(
  paymentData: {
    orderId: string;
    customerEmail: string;
    storeName: string;
    adminEmail: string;
  }
): Promise<void> {
  try {
    await sendAdminAlertEmail({
      alertType: 'payment_failed',
      orderId: paymentData.orderId,
      customerEmail: paymentData.customerEmail,
      storeName: paymentData.storeName,
      adminEmail: paymentData.adminEmail,
    });
  } catch (error) {
    console.error('Failed to send payment failed alert:', error);
  }
}

export async function sendUserSignupNotifications(
  userData: {
    userName: string;
    userEmail: string;
    storeName?: string;
    storeDomain?: string;
    adminEmail?: string;
  }
): Promise<void> {
  try {
    // Send welcome email to user
    await sendWelcomeEmail({
      userName: userData.userName,
      userEmail: userData.userEmail,
      storeName: userData.storeName,
      storeDomain: userData.storeDomain,
      welcomeUrl: userData.storeDomain 
        ? `https://${userData.storeDomain}/dashboard`
        : '/dashboard',
    });

    // Send admin alert if admin email is provided
    if (userData.adminEmail) {
      await sendAdminAlertEmail({
        alertType: 'user_signup',
        storeName: userData.storeName,
        customerEmail: userData.userEmail,
        adminEmail: userData.adminEmail,
      });
    }
  } catch (error) {
    console.error('Failed to send user signup notifications:', error);
  }
}

// Email template preview utilities (for admin UI)

export function generateOrderConfirmationPreview(data: OrderConfirmationData): {
  subject: string;
  html: string;
  text: string;
} {
  // This would use the same template generation logic as the email service
  // For now, return a simplified preview
  return {
    subject: `Order Confirmation - ${data.storeName}`,
    html: `<h1>Order Confirmation</h1><p>Dear ${data.customerName},</p><p>Thank you for your order!</p>`,
    text: `Order Confirmation\n\nDear ${data.customerName},\n\nThank you for your order!`,
  };
}

export function generatePasswordResetPreview(data: PasswordResetData): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: 'Password Reset Request',
    html: `<h1>Password Reset</h1><p>Dear ${data.userName},</p><p>Click the link to reset your password.</p>`,
    text: `Password Reset\n\nDear ${data.userName},\n\nClick the link to reset your password.`,
  };
} 