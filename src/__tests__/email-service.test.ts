import { EmailService, initializeEmailService, getEmailService } from '@/lib/email-service';
import type { EmailConfig, OrderConfirmationData, PasswordResetData, AdminAlertData, UserSignupData } from '@/lib/email-service';

// Mock SendGrid
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn(),
  })),
}));

import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

describe('EmailService', () => {
  const mockSendGridConfig: EmailConfig = {
    fromEmail: 'test@example.com',
    fromName: 'Test Store',
    sendGridApiKey: 'test-api-key',
  };

  const mockSmtpConfig: EmailConfig = {
    fromEmail: 'test@example.com',
    fromName: 'Test Store',
    smtpConfig: {
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'test@example.com',
        pass: 'test-password',
      },
    },
  };

  const mockOrderData: OrderConfirmationData = {
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

  const mockPasswordResetData: PasswordResetData = {
    resetToken: 'reset-token-123',
    userEmail: 'user@example.com',
    userName: 'Jane Doe',
    resetUrl: 'https://example.com/reset?token=reset-token-123',
    expiryHours: 24,
  };

  const mockAdminAlertData: AdminAlertData = {
    alertType: 'new_order',
    storeId: 'store-123',
    storeName: 'Test Store',
    orderId: 'order-123',
    customerEmail: 'customer@example.com',
    adminEmail: 'admin@example.com',
  };

  const mockUserSignupData: UserSignupData = {
    userName: 'New User',
    userEmail: 'newuser@example.com',
    storeName: 'Test Store',
    storeDomain: 'test-store.example.com',
    welcomeUrl: 'https://test-store.example.com/dashboard',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with SendGrid API key', () => {
      const emailService = new EmailService(mockSendGridConfig);
      expect(sgMail.setApiKey).toHaveBeenCalledWith('test-api-key');
    });

    it('should initialize with SMTP config', () => {
      const emailService = new EmailService(mockSmtpConfig);
      expect(emailService).toBeDefined();
    });

    it('should handle missing email provider gracefully', () => {
      const config: EmailConfig = {
        fromEmail: 'test@example.com',
        fromName: 'Test Store',
      };
      const emailService = new EmailService(config);
      expect(emailService).toBeDefined();
    });
  });

  describe('SendGrid Integration', () => {
    let emailService: EmailService;

    beforeEach(() => {
      emailService = new EmailService(mockSendGridConfig);
      (sgMail.send as jest.Mock).mockResolvedValue([{ statusCode: 202 }]);
    });

    it('should send order confirmation email via SendGrid', async () => {
      await emailService.sendOrderConfirmation(mockOrderData);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'john@example.com',
        from: {
          email: 'test@example.com',
          name: 'Test Store',
        },
        replyTo: undefined,
        subject: 'Order Confirmation - Test Store',
        html: expect.stringContaining('Order Confirmation'),
        text: expect.stringContaining('Order Confirmation'),
      });
    });

    it('should send password reset email via SendGrid', async () => {
      await emailService.sendPasswordReset(mockPasswordResetData);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user@example.com',
        from: {
          email: 'test@example.com',
          name: 'Test Store',
        },
        replyTo: undefined,
        subject: 'Password Reset Request',
        html: expect.stringContaining('Password Reset'),
        text: expect.stringContaining('Password Reset'),
      });
    });

    it('should send admin alert email via SendGrid', async () => {
      await emailService.sendAdminAlert(mockAdminAlertData);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'admin@example.com',
        from: {
          email: 'test@example.com',
          name: 'Test Store',
        },
        replyTo: undefined,
        subject: 'New Order - Test Store',
        html: expect.stringContaining('Admin Alert'),
        text: expect.stringContaining('Admin Alert'),
      });
    });

    it('should send welcome email via SendGrid', async () => {
      await emailService.sendWelcomeEmail(mockUserSignupData);

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'newuser@example.com',
        from: {
          email: 'test@example.com',
          name: 'Test Store',
        },
        replyTo: undefined,
        subject: 'Welcome to NexusCart!',
        html: expect.stringContaining('Welcome to NexusCart'),
        text: expect.stringContaining('Welcome to NexusCart'),
      });
    });

    it('should send test email via SendGrid', async () => {
      await emailService.sendTestEmail('test@example.com');

      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'test@example.com',
        from: {
          email: 'test@example.com',
          name: 'Test Store',
        },
        replyTo: undefined,
        subject: 'Test Email - NexusCart',
        html: expect.stringContaining('Test Email'),
        text: expect.stringContaining('Test Email'),
      });
    });

    it('should handle SendGrid errors gracefully', async () => {
      (sgMail.send as jest.Mock).mockRejectedValue(new Error('SendGrid error'));

      await expect(emailService.sendTestEmail('test@example.com')).rejects.toThrow('Failed to send email');
    });
  });

  describe('SMTP Integration', () => {
    let emailService: EmailService;
    let mockTransporter: any;

    beforeEach(() => {
      emailService = new EmailService(mockSmtpConfig);
      mockTransporter = {
        sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      };
      (nodemailer.createTransporter as jest.Mock).mockReturnValue(mockTransporter);
    });

    it('should send email via SMTP', async () => {
      await emailService.sendTestEmail('test@example.com');

      expect(nodemailer.createTransporter).toHaveBeenCalledWith(mockSmtpConfig.smtpConfig);
      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: '"Test Store" <test@example.com>',
        to: 'test@example.com',
        subject: 'Test Email - NexusCart',
        html: expect.stringContaining('Test Email'),
        text: expect.stringContaining('Test Email'),
      });
    });

    it('should handle SMTP errors gracefully', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(emailService.sendTestEmail('test@example.com')).rejects.toThrow('Failed to send email');
    });
  });

  describe('Template Generation', () => {
    let emailService: EmailService;

    beforeEach(() => {
      emailService = new EmailService(mockSendGridConfig);
    });

    it('should generate order confirmation template with correct data', () => {
      const template = (emailService as any).createOrderConfirmationTemplate(mockOrderData);

      expect(template.subject).toBe('Order Confirmation - Test Store');
      expect(template.html).toContain('John Doe');
      expect(template.html).toContain('Rs 1,500');
      expect(template.html).toContain('Product 1');
      expect(template.html).toContain('Product 2');
      expect(template.text).toContain('John Doe');
      expect(template.text).toContain('Rs 1,500');
    });

    it('should generate password reset template with correct data', () => {
      const template = (emailService as any).createPasswordResetTemplate(mockPasswordResetData);

      expect(template.subject).toBe('Password Reset Request');
      expect(template.html).toContain('Jane Doe');
      expect(template.html).toContain('reset-token-123');
      expect(template.text).toContain('Jane Doe');
      expect(template.text).toContain('reset-token-123');
    });

    it('should generate admin alert template for new order', () => {
      const template = (emailService as any).createAdminAlertTemplate(mockAdminAlertData);

      expect(template.subject).toBe('New Order - Test Store');
      expect(template.html).toContain('New Order Received');
      expect(template.html).toContain('order-123');
      expect(template.html).toContain('customer@example.com');
    });

    it('should generate admin alert template for low stock', () => {
      const lowStockData: AdminAlertData = {
        alertType: 'low_stock',
        storeName: 'Test Store',
        productName: 'Test Product',
        currentStock: 5,
        threshold: 10,
        adminEmail: 'admin@example.com',
      };

      const template = (emailService as any).createAdminAlertTemplate(lowStockData);

      expect(template.subject).toBe('Low Stock Alert - Test Store');
      expect(template.html).toContain('Low Stock Alert');
      expect(template.html).toContain('Test Product');
      expect(template.html).toContain('5');
      expect(template.html).toContain('10');
    });

    it('should generate welcome template with store info', () => {
      const template = (emailService as any).createWelcomeTemplate(mockUserSignupData);

      expect(template.subject).toBe('Welcome to NexusCart!');
      expect(template.html).toContain('New User');
      expect(template.html).toContain('test-store.example.com');
      expect(template.text).toContain('New User');
      expect(template.text).toContain('test-store.example.com');
    });
  });

  describe('Singleton Pattern', () => {
    it('should initialize email service singleton', () => {
      const emailService = initializeEmailService(mockSendGridConfig);
      expect(emailService).toBeInstanceOf(EmailService);
    });

    it('should get email service singleton', () => {
      initializeEmailService(mockSendGridConfig);
      const emailService = getEmailService();
      expect(emailService).toBeInstanceOf(EmailService);
    });

    it('should throw error when getting uninitialized service', () => {
      // Reset the singleton
      (global as any).emailService = null;
      
      expect(() => getEmailService()).toThrow('Email service not initialized');
    });
  });

  describe('Error Handling', () => {
    it('should handle uninitialized service', async () => {
      const config: EmailConfig = {
        fromEmail: 'test@example.com',
        fromName: 'Test Store',
      };
      const emailService = new EmailService(config);

      await expect(emailService.sendTestEmail('test@example.com')).rejects.toThrow('Email service not initialized');
    });

    it('should handle missing email provider', async () => {
      const config: EmailConfig = {
        fromEmail: 'test@example.com',
        fromName: 'Test Store',
      };
      const emailService = new EmailService(config);

      await expect(emailService.sendTestEmail('test@example.com')).rejects.toThrow('No email provider configured');
    });
  });
}); 