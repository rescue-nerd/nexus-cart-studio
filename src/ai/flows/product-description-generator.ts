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
  productCategory: z.string().describe('The category of the product (e.g., Electronics, Clothing).'),
  keyFeatures: z.string().describe('A comma-separated list of key features of the product.'),
  targetAudience: z.string().describe('The target audience for the product (e.g., Men, Women, Children).'),
  stylePreferences: z.string().describe('Style and design preferences.'),
  material: z.string().describe('Product material.'),
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
  prompt: `You are an expert copywriter specializing in creating engaging product descriptions.

  Generate a compelling product description based on the following details:

  Product Name: {{{productName}}}
  Product Category: {{{productCategory}}}
  Key Features: {{{keyFeatures}}}
  Target Audience: {{{targetAudience}}}
  Style Preferences: {{{stylePreferences}}}
  Material: {{{material}}}

  Description:`, // Ensure "Description:" is the final line for clear output.
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
