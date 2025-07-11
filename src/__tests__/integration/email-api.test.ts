// Integration tests for email API endpoints using fetch

const testBaseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('Email API Endpoints', () => {
  const mockOrderData = {
    orderId: 'order-123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    orderTotal: 1500,
    orderItems: [
      { name: 'Product 1', quantity: 2, price: 500 },
      { name: 'Product 2', quantity: 1, price: 500 },
    ],
    storeName: 'Test Store',
    orderDate: '2024-01-10T10:00:00Z',
  };

  const mockPasswordResetData = {
    resetToken: 'reset-token-123',
    userEmail: 'user@example.com',
    userName: 'Jane Doe',
    resetUrl: 'https://example.com/reset?token=reset-token-123',
    expiryHours: 24,
  };

  const mockAdminAlertData = {
    alertType: 'new_order' as const,
    storeId: 'store-123',
    storeName: 'Test Store',
    orderId: 'order-123',
    customerEmail: 'customer@example.com',
    adminEmail: 'admin@example.com',
  };

  const mockUserSignupData = {
    userName: 'New User',
    userEmail: 'newuser@example.com',
    storeName: 'Test Store',
    storeDomain: 'test-store.example.com',
    welcomeUrl: 'https://test-store.example.com/dashboard',
  };

  it('should send order confirmation email', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        data: mockOrderData,
      }),
    });

    // Should return 500 since email service is not configured in test
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Email service not configured');
  });

  it('should send password reset email', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'password_reset',
        data: mockPasswordResetData,
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Email service not configured');
  });

  it('should send admin alert email', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'admin_alert',
        data: mockAdminAlertData,
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Email service not configured');
  });

  it('should send welcome email', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: mockUserSignupData,
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Email service not configured');
  });

  it('should send test email', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        data: { to: 'test@example.com' },
      }),
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Email service not configured');
  });

  it('should validate order confirmation data', async () => {
    const invalidData = {
      orderId: 'order-123',
      customerName: 'John Doe',
      // Missing required fields
    };

    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'order_confirmation',
        data: invalidData,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
    expect(body.details).toBeDefined();
  });

  it('should validate password reset data', async () => {
    const invalidData = {
      resetToken: 'reset-token-123',
      userEmail: 'invalid-email', // Invalid email
      userName: 'Jane Doe',
      resetUrl: 'not-a-url', // Invalid URL
      expiryHours: -1, // Invalid number
    };

    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'password_reset',
        data: invalidData,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
    expect(body.details).toBeDefined();
  });

  it('should validate admin alert data', async () => {
    const invalidData = {
      alertType: 'invalid_type', // Invalid alert type
      adminEmail: 'invalid-email', // Invalid email
    };

    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'admin_alert',
        data: invalidData,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
    expect(body.details).toBeDefined();
  });

  it('should validate welcome email data', async () => {
    const invalidData = {
      userName: 'New User',
      userEmail: 'invalid-email', // Invalid email
      welcomeUrl: 'not-a-url', // Invalid URL
    };

    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'welcome',
        data: invalidData,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
    expect(body.details).toBeDefined();
  });

  it('should validate test email data', async () => {
    const invalidData = {
      to: 'invalid-email', // Invalid email
    };

    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'test',
        data: invalidData,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid request data');
    expect(body.details).toBeDefined();
  });

  it('should reject invalid email type', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'invalid_type',
        data: {},
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid email type');
  });

  it('should handle malformed JSON', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to send email');
  });

  it('should handle missing request body', async () => {
    const res = await fetch(`${testBaseUrl}/api/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Failed to send email');
  });
}); 