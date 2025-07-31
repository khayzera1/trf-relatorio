
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes marketing campaign data
 * from a CSV and generates a concise, insightful summary for a PDF report.
 *
 * - generateReportSummary - Analyzes CSV data and returns a structured report summary.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportSummaryInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'A string containing the entire CSV data from a marketing campaign report.'
    ),
});
export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;

const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the report, based on the data provided."),
  executiveSummary: z
    .string()
    .describe(
      'A 2-3 paragraph executive summary of the campaign results, highlighting key metrics, trends, and insights. This summary should be written in a professional and clear tone, suitable for a client report.'
    ),
});
export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;

export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<GenerateReportSummaryOutput> {
  return generateReportSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `
    You are a marketing data analyst expert for a digital marketing agency.
    Your task is to analyze the provided marketing campaign data in CSV format and generate a professional, insightful summary for a client report.

    **Instructions:**
    1.  **Analyze the Data:** Carefully review the following CSV data to understand the campaign's performance. Identify key metrics (like Clicks, Impressions, CTR, Cost, Conversions), trends over time, and any significant patterns.
    2.  **Create a Report Title:** Generate a clear and professional title for the report, such as "Relatório de Desempenho da Campanha".
    3.  **Write an Executive Summary:** Based on your analysis, write a 2-3 paragraph executive summary. This summary should:
        - Start with a brief overview of the campaign's objective (if inferable).
        - Highlight the most important results and key performance indicators (KPIs).
        - Point out any significant trends (e.g., "Houve um aumento de 25% nos cliques em comparação com o mês anterior").
        - Provide a concluding thought or insight.
        - The tone must be professional, clear, and direct.

    **CSV Data:**
    \`\`\`csv
    {{{csvData}}}
    \`\`\`
  `,
});

const generateReportSummaryFlow = ai.defineFlow(
  {
    name: 'generateReportSummaryFlow',
    inputSchema: GenerateReportSummaryInputSchema,
    outputSchema: GenerateReportSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
