'use server';

/**
 * @fileOverview This file defines the AI chat assistant flow for the Nepali Bazaar Builder application.
 *
 * It allows customers to ask questions and receive product recommendations.
 * The file exports:
 * - `aiChatAssistant`: The main function to initiate the chat assistant flow.
 * - `AIChatAssistantInput`: The input type for the aiChatAssistant function.
 * - `AIChatAssistantOutput`: The output type for the aiChatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatAssistantInputSchema = z.object({
  query: z.string().describe('The customer query or question.'),
  customerId: z.string().optional().describe('The ID of the customer, if logged in.'),
});
export type AIChatAssistantInput = z.infer<typeof AIChatAssistantInputSchema>;

const AIChatAssistantOutputSchema = z.object({
  response: z.string().describe('The AI chat assistant response to the customer query.'),
  recommendedProducts: z.array(z.string()).optional().describe('A list of recommended product IDs, if any.'),
});
export type AIChatAssistantOutput = z.infer<typeof AIChatAssistantOutputSchema>;

export async function aiChatAssistant(input: AIChatAssistantInput): Promise<AIChatAssistantOutput> {
  return aiChatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatAssistantPrompt',
  input: {schema: AIChatAssistantInputSchema},
  output: {schema: AIChatAssistantOutputSchema},
  prompt: `You are a helpful AI chat assistant for an e-commerce store specializing in Nepali products.
  Your goal is to answer customer questions and provide product recommendations.

  If the customer is asking a question, answer it clearly and concisely.
  If the customer is asking for a product recommendation, suggest products based on their query and customer history (if available).

  Customer Query: {{{query}}}
  {{#if customerId}}
  Customer ID: {{{customerId}}}
  {{/if}}

  Format your response as a JSON object with the following keys:
  - response: The AI chat assistant response to the customer query.
  - recommendedProducts: A list of recommended product IDs, if any.
  `,
});

const aiChatAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatAssistantFlow',
    inputSchema: AIChatAssistantInputSchema,
    outputSchema: AIChatAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
