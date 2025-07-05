'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting relevant meta keywords based on a product catalog.
 *
 * - `suggestSeoKeywords` - A function that takes a product catalog description and returns SEO keyword suggestions.
 * - `SeoKeywordsInput` - The input type for the `suggestSeoKeywords` function.
 * - `SeoKeywordsOutput` - The return type for the `suggestSeoKeywords` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SeoKeywordsInputSchema = z.object({
  productCatalogDescription: z
    .string()
    .describe('A detailed description of the product catalog.'),
});
export type SeoKeywordsInput = z.infer<typeof SeoKeywordsInputSchema>;

const SeoKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string())
    .describe('An array of relevant SEO keywords for the product catalog.'),
});
export type SeoKeywordsOutput = z.infer<typeof SeoKeywordsOutputSchema>;

export async function suggestSeoKeywords(input: SeoKeywordsInput): Promise<SeoKeywordsOutput> {
  return suggestSeoKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'seoKeywordSuggestionPrompt',
  input: {schema: SeoKeywordsInputSchema},
  output: {schema: SeoKeywordsOutputSchema},
  prompt: `You are an SEO expert. Given the following product catalog description, suggest relevant meta keywords to improve the store's search engine optimization.

Product catalog description: {{{productCatalogDescription}}}

Keywords:`,
});

const suggestSeoKeywordsFlow = ai.defineFlow(
  {
    name: 'suggestSeoKeywordsFlow',
    inputSchema: SeoKeywordsInputSchema,
    outputSchema: SeoKeywordsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
