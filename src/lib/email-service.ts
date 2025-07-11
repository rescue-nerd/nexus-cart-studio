import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';

// Email template types
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export interface OrderConfirmationData {
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
  orderDate: string;
}

export interface PasswordResetData {
  resetToken: string;
  userEmail: string;
  userName: string;
  resetUrl: string;
  expiryHours: number;
}

export interface AdminAlertData {
  alertType: 'new_order' | 'low_stock' | 'payment_failed' | 'user_signup';
  storeId?: string;
  storeName?: string;
  orderId?: string;
  customerEmail?: string;
  productName?: string;
  currentStock?: number;
  threshold?: number;
  adminEmail: string;
}

export interface UserSignupData {
  userName: string;
  userEmail: string;
  storeName?: string;
  storeDomain?: string;
  welcomeUrl: string;
}

export interface EmailConfig {
  fromEmail: string;
  fromName: string;
  replyTo?: string;
  sendGridApiKey?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
}

class EmailService {
  private config: EmailConfig;
  private isInitialized = false;

  constructor(config: EmailConfig) {
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    try {
      if (this.config.sendGridApiKey) {
        sgMail.setApiKey(this.config.sendGridApiKey);
        this.isInitialized = true;
      } else if (this.config.smtpConfig) {
        // SMTP will be initialized per request
        this.isInitialized = true;
      } else {
        console.warn('Email service: No email provider configured');
      }
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  private async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Email service not initialized');
    }

    const msg = {
      to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName,
      },
      replyTo: this.config.replyTo,
      subject: template.subject,
      html: template.html,
      text: template.text,
    };

    try {
      if (this.config.sendGridApiKey) {
        await sgMail.send(msg);
      } else if (this.config.smtpConfig) {
        const transporter = nodemailer.createTransporter(this.config.smtpConfig);
        await transporter.sendMail({
          from: `"${this.config.fromName}" <${this.config.fromEmail}>`,
          to,
          subject: template.subject,
          html: template.html,
          text: template.text,
        });
      } else {
        throw new Error('No email provider configured');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  // Order Confirmation Email
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const template = this.createOrderConfirmationTemplate(data);
    await this.sendEmail(data.customerEmail, template);
  }

  private createOrderConfirmationTemplate(data: OrderConfirmationData): EmailTemplate {
    const itemsHtml = data.orderItems
      .map(item => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">Rs ${item.price.toLocaleString()}</td>
        </tr>
      `)
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Order Confirmation</h1>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for your order from <strong>${data.storeName}</strong>!</p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin-top: 0;">Order Details</h2>
              <p><strong>Order ID:</strong> ${data.orderId}</p>
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Total Amount:</strong> Rs ${data.orderTotal.toLocaleString()}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f1f5f9;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0;">Item</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0;">Quantity</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="text-align: center; margin: 30px 0;">
              <p>We'll notify you when your order ships!</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #64748b;">
              If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Order Confirmation

Dear ${data.customerName},

Thank you for your order from ${data.storeName}!

Order Details:
- Order ID: ${data.orderId}
- Order Date: ${data.orderDate}
- Total Amount: Rs ${data.orderTotal.toLocaleString()}

Items:
${data.orderItems.map(item => `- ${item.name} (${item.quantity}x) - Rs ${item.price.toLocaleString()}`).join('\n')}

We'll notify you when your order ships!

If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
    `;

    return {
      subject: `Order Confirmation - ${data.storeName}`,
      html,
      text,
    };
  }

  // Password Reset Email
  async sendPasswordReset(data: PasswordResetData): Promise<void> {
    const template = this.createPasswordResetTemplate(data);
    await this.sendEmail(data.userEmail, template);
  }

  private createPasswordResetTemplate(data: PasswordResetData): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">Password Reset Request</h1>
            <p>Dear ${data.userName},</p>
            <p>We received a request to reset your password.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.resetUrl}" 
                 style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in ${data.expiryHours} hours</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #64748b;">
              If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Password Reset Request

Dear ${data.userName},

We received a request to reset your password.

Click the link below to reset your password:
${data.resetUrl}

Important:
- This link will expire in ${data.expiryHours} hours
- If you didn't request this, please ignore this email
- For security, this link can only be used once

If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
    `;

    return {
      subject: 'Password Reset Request',
      html,
      text,
    };
  }

  // Admin Alert Email
  async sendAdminAlert(data: AdminAlertData): Promise<void> {
    const template = this.createAdminAlertTemplate(data);
    await this.sendEmail(data.adminEmail, template);
  }

  private createAdminAlertTemplate(data: AdminAlertData): EmailTemplate {
    let alertContent = '';
    let subject = '';

    switch (data.alertType) {
      case 'new_order':
        alertContent = `
          <p><strong>New Order Received</strong></p>
          <p>Store: ${data.storeName}</p>
          <p>Order ID: ${data.orderId}</p>
          <p>Customer: ${data.customerEmail}</p>
        `;
        subject = `New Order - ${data.storeName}`;
        break;
      case 'low_stock':
        alertContent = `
          <p><strong>Low Stock Alert</strong></p>
          <p>Store: ${data.storeName}</p>
          <p>Product: ${data.productName}</p>
          <p>Current Stock: ${data.currentStock}</p>
          <p>Threshold: ${data.threshold}</p>
        `;
        subject = `Low Stock Alert - ${data.storeName}`;
        break;
      case 'payment_failed':
        alertContent = `
          <p><strong>Payment Failed</strong></p>
          <p>Store: ${data.storeName}</p>
          <p>Order ID: ${data.orderId}</p>
          <p>Customer: ${data.customerEmail}</p>
        `;
        subject = `Payment Failed - ${data.storeName}`;
        break;
      case 'user_signup':
        alertContent = `
          <p><strong>New User Signup</strong></p>
          <p>Store: ${data.storeName}</p>
          <p>Customer: ${data.customerEmail}</p>
        `;
        subject = `New User Signup - ${data.storeName}`;
        break;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Alert</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">Admin Alert</h1>
            ${alertContent}
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #64748b;">
              This is an automated alert from your NexusCart system.
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `Admin Alert\n\n${alertContent.replace(/<[^>]*>/g, '')}`;

    return {
      subject,
      html,
      text,
    };
  }

  // User Signup Welcome Email
  async sendWelcomeEmail(data: UserSignupData): Promise<void> {
    const template = this.createWelcomeTemplate(data);
    await this.sendEmail(data.userEmail, template);
  }

  private createWelcomeTemplate(data: UserSignupData): EmailTemplate {
    const storeInfo = data.storeName && data.storeDomain 
      ? `<p>Your store is now live at: <a href="https://${data.storeDomain}">${data.storeDomain}</a></p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to NexusCart</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb;">Welcome to NexusCart!</h1>
            <p>Dear ${data.userName},</p>
            <p>Welcome to NexusCart! We're excited to have you on board.</p>
            
            ${storeInfo}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.welcomeUrl}" 
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Get Started
              </a>
            </div>

            <p>Here's what you can do next:</p>
            <ul>
              <li>Add your first products</li>
              <li>Customize your store settings</li>
              <li>Set up payment methods</li>
              <li>Configure your store theme</li>
            </ul>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #64748b;">
              If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
            </p>
          </div>
        </body>
      </html>
    `;

    const text = `
Welcome to NexusCart!

Dear ${data.userName},

Welcome to NexusCart! We're excited to have you on board.

${data.storeName ? `Your store is now live at: ${data.storeDomain}` : ''}

Get started here: ${data.welcomeUrl}

Here's what you can do next:
- Add your first products
- Customize your store settings
- Set up payment methods
- Configure your store theme

If you have any questions, please contact us at ${this.config.replyTo || this.config.fromEmail}
    `;

    return {
      subject: 'Welcome to NexusCart!',
      html,
      text,
    };
  }

  // Test email method
  async sendTestEmail(to: string): Promise<void> {
    const template: EmailTemplate = {
      subject: 'Test Email - NexusCart',
      html: `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Test Email</h1>
            <p>This is a test email from NexusCart email service.</p>
            <p>If you received this, your email configuration is working correctly!</p>
          </body>
        </html>
      `,
      text: 'Test Email\n\nThis is a test email from NexusCart email service.\n\nIf you received this, your email configuration is working correctly!',
    };
    await this.sendEmail(to, template);
  }
}

// Export singleton instance
let emailService: EmailService | null = null;

export function initializeEmailService(config: EmailConfig): EmailService {
  if (!emailService) {
    emailService = new EmailService(config);
  }
  return emailService;
}

export function getEmailService(): EmailService {
  if (!emailService) {
    throw new Error('Email service not initialized. Call initializeEmailService() first.');
  }
  return emailService;
}

export type { EmailService }; 