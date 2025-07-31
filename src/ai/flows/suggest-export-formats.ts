
// src/ai/flows/suggest-export-formats.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow that suggests additional export formats
 *  (e.g., PDF, HTML) based on user usage patterns.
 *
 * - suggestExportFormats - A function that suggests export formats.
 * - SuggestExportFormatsInput - The input type for the suggestExportFormats function.
 * - SuggestExportFormatsOutput - The return type for the suggestExportFormats function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExportFormatsInputSchema = z.object({
  usageStatistics: z
    .string()
    .describe(
      'A JSON string containing usage statistics for different export formats.'
    ),
});
export type SuggestExportFormatsInput = z.infer<typeof SuggestExportFormatsInputSchema>;

const SuggestExportFormatsOutputSchema = z.object({
  suggestedFormats: z
    .array(z.string())
    .describe(
      'An array of suggested export formats based on the usage statistics.'
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of why these formats were suggested, based on the provided usage statistics.'
    ),
});
export type SuggestExportFormatsOutput = z.infer<typeof SuggestExportFormatsOutputSchema>;

export async function suggestExportFormats(
  input: SuggestExportFormatsInput
): Promise<SuggestExportFormatsOutput> {
  return suggestExportFormatsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExportFormatsPrompt',
  input: {schema: SuggestExportFormatsInputSchema},
  output: {schema: SuggestExportFormatsOutputSchema},
  prompt: `You are an expert at suggesting export formats for a data reporting application.

  Based on the following usage statistics (as a JSON string), suggest additional export formats that the user might find useful.
  Explain your reasoning for each suggestion.
  Return the suggestions as an array of strings.

  Usage Statistics: {{{usageStatistics}}}

  Consider formats like PDF, HTML, etc. that are suitable for data presentation and archiving.
  Do not suggest formats already in wide use.
  Be concise.
  `,
});

const suggestExportFormatsFlow = ai.defineFlow(
  {
    name: 'suggestExportFormatsFlow',
    inputSchema: SuggestExportFormatsInputSchema,
    outputSchema: SuggestExportFormatsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
