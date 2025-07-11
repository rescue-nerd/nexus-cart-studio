import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEmailService } from '@/lib/email-service';

// Validation schemas
const orderConfirmationSchema = z.object({
  type: z.literal('order_confirmation'),
  data: z.object({
    orderId: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    orderTotal: z.number().positive(),
    orderItems: z.array(z.object({
      name: z.string(),
      quantity: z.number().positive(),
      price: z.number().positive(),
    })),
    storeName: z.string(),
    orderDate: z.string(),
  }),
});

const passwordResetSchema = z.object({
  type: z.literal('password_reset'),
  data: z.object({
    resetToken: z.string(),
    userEmail: z.string().email(),
    userName: z.string(),
    resetUrl: z.string().url(),
    expiryHours: z.number().positive(),
  }),
});

const adminAlertSchema = z.object({
  type: z.literal('admin_alert'),
  data: z.object({
    alertType: z.enum(['new_order', 'low_stock', 'payment_failed', 'user_signup']),
    storeId: z.string().optional(),
    storeName: z.string().optional(),
    orderId: z.string().optional(),
    customerEmail: z.string().email().optional(),
    productName: z.string().optional(),
    currentStock: z.number().optional(),
    threshold: z.number().optional(),
    adminEmail: z.string().email(),
  }),
});

const welcomeEmailSchema = z.object({
  type: z.literal('welcome'),
  data: z.object({
    userName: z.string(),
    userEmail: z.string().email(),
    storeName: z.string().optional(),
    storeDomain: z.string().optional(),
    welcomeUrl: z.string().url(),
  }),
});

const testEmailSchema = z.object({
  type: z.literal('test'),
  data: z.object({
    to: z.string().email(),
  }),
});

const emailRequestSchema = z.discriminatedUnion('type', [
  orderConfirmationSchema,
  passwordResetSchema,
  adminAlertSchema,
  welcomeEmailSchema,
  testEmailSchema,
]);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = emailRequestSchema.parse(body);
    
    const emailService = getEmailService();
    
    switch (validatedData.type) {
      case 'order_confirmation':
        await emailService.sendOrderConfirmation(validatedData.data);
        break;
        
      case 'password_reset':
        await emailService.sendPasswordReset(validatedData.data);
        break;
        
      case 'admin_alert':
        await emailService.sendAdminAlert(validatedData.data);
        break;
        
      case 'welcome':
        await emailService.sendWelcomeEmail(validatedData.data);
        break;
        
      case 'test':
        await emailService.sendTestEmail(validatedData.data.to);
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(
      { success: true, message: 'Email sent successfully' },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Email API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('Email service not initialized')) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 