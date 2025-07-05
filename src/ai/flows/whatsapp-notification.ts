'use server';

/**
 * @fileOverview A Genkit flow for sending WhatsApp notifications using Twilio.
 *
 * - sendWhatsAppNotification - A function that sends a message via WhatsApp.
 * - WhatsAppNotificationInput - The input type for the sendWhatsAppNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import twilio from 'twilio';

export const WhatsAppNotificationInputSchema = z.object({
  to: z.string().describe('The recipient\'s phone number in E.164 format (e.g., +97798XXXXXXXX).'),
  message: z.string().describe('The content of the message to be sent.'),
});
export type WhatsAppNotificationInput = z.infer<typeof WhatsAppNotificationInputSchema>;

export async function sendWhatsAppNotification(input: WhatsAppNotificationInput): Promise<void> {
  return sendWhatsAppNotificationFlow(input);
}

const sendWhatsAppNotificationFlow = ai.defineFlow(
  {
    name: 'sendWhatsAppNotificationFlow',
    inputSchema: WhatsAppNotificationInputSchema,
    outputSchema: z.void(),
  },
  async ({ to, message }) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM_NUMBER;

    // If Twilio credentials are not configured, log to console instead of sending.
    if (!accountSid || !authToken || !fromNumber || accountSid === 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx') {
        console.warn('Twilio credentials are not set in .env file. Logging notification to console instead.');
        console.log(`--- WhatsApp Notification (Simulated) ---`);
        console.log(`To: whatsapp:${to}`);
        console.log(`From: whatsapp:${fromNumber || 'NOT_CONFIGURED'}`);
        console.log(`Message: ${message}`);
        console.log(`-----------------------------------------`);
        // To avoid throwing an error in dev environments, we can just return here.
        // In a production environment, you might want to throw an error if credentials are missing.
        return; 
    }

    const client = twilio(accountSid, authToken);

    try {
      await client.messages.create({
        from: `whatsapp:${fromNumber}`,
        to: `whatsapp:${to}`,
        body: message,
      });
      console.log(`Successfully sent WhatsApp message to ${to}`);
    } catch (error) {
      console.error('Failed to send WhatsApp message via Twilio:', error);
      // Re-throwing the error so the calling function can handle it (e.g., show a toast).
      throw new Error('Failed to send WhatsApp message.');
    }
  }
);
