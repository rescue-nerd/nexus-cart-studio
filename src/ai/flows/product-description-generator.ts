// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Generates product descriptions from basic product details.
 *
 * - generateProductDescription - A function that generates a product description.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productCategory: z.string().optional().describe('The category of the product (e.g., Electronics, Clothing).'),
  keyFeatures: z.string().optional().describe('A comma-separated list of key features of the product.'),
  targetAudience: z.string().optional().describe('The target audience for the product (e.g., Men, Women, Children).'),
  stylePreferences: z.string().optional().describe('Style and design preferences.'),
  material: z.string().optional().describe('Product material.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  description: z.string().describe('A compelling product description.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateProductDescriptionInput
): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'productDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating engaging product descriptions for e-commerce stores.

  Generate a compelling, concise, and marketable product description based on the following details. If a detail is not provided, use your expertise to create a suitable description based on the product name alone.

  Product Name: {{{productName}}}
  {{#if productCategory}}Product Category: {{{productCategory}}}{{/if}}
  {{#if keyFeatures}}Key Features: {{{keyFeatures}}}{{/if}}
  {{#if targetAudience}}Target Audience: {{{targetAudience}}}{{/if}}
  {{#if stylePreferences}}Style Preferences: {{{stylePreferences}}}{{/if}}
  {{#if material}}Material: {{{material}}}{{/if}}

  Write only the description text.
  Description:`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
