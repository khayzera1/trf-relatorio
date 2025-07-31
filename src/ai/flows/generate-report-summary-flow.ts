
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes marketing campaign data
 * from a CSV and extracts key performance indicators (KPIs) for a dashboard-style report.
 *
 * - generateReportSummary - Analyzes CSV data and returns structured KPI data.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function, conforming to the ReportData interface.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ReportData } from '@/lib/types';


const GenerateReportSummaryInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'A string containing the entire CSV data from a marketing campaign report. The CSV must contain at least columns for a metric name, its current value, its previous value, and the percentage change.'
    ),
});
export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;


const KpiCardDataSchema = z.object({
    title: z.string().describe("The name of the Key Performance Indicator (KPI). E.g., 'Impressões', 'Cliques', 'Custo'."),
    value: z.string().describe("The main value for the KPI. E.g., '210.081', 'R$70.180,79'."),
    change: z.string().describe("The percentage change from the previous period, including the signal. E.g., '+24,32%', '-12,09%'."),
    previousValue: z.string().describe("The value from the previous period, with context. E.g., '168.984 no período anterior'."),
});

const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the report in Brazilian Portuguese, based on the data provided. Example: 'Métricas do Google Ads: os KPIs mais importantes'."),
  kpiCards: z.array(KpiCardDataSchema).describe("An array of KPI card objects, each representing a key metric from the report."),
});

export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;


export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<ReportData> {
  const result = await generateReportSummaryFlow(input);
  // Ensure the output conforms to ReportData, providing defaults if necessary
  return {
    reportTitle: result.reportTitle || "Relatório de Métricas",
    kpiCards: result.kpiCards || [],
  };
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `
    You are a marketing data analyst expert for a digital marketing agency.
    Your task is to analyze the provided marketing campaign data in CSV format and transform it into a structured JSON object for a dashboard report.
    The entire analysis and output must be in **Brazilian Portuguese (pt-BR)**.
    The report should only use information that is present in the CSV.

    **Instructions:**
    1.  **Analyze the CSV Data:** Carefully review the provided CSV data. Identify the key performance indicators (KPIs), their current values, their values from the previous period, and the percentage change.
    2.  **Create a Report Title:** Generate a professional and engaging title for the report in Brazilian Portuguese.
    3.  **Extract KPI Cards:** For each key metric found in the CSV, create a JSON object that follows the specified format.
        -   **title:** The name of the metric (e.g., "Impressões", "Cliques", "Custo por Conversão").
        -   **value:** The primary, current value of the metric. Format it appropriately (e.g., with currency symbols, separators).
        -   **change:** The percentage change. It MUST include the '+' or '-' sign.
        -   **previousValue:** A descriptive string showing the value in the previous period, like "12.345 no período anterior".

    **CSV Data:**
    \`\`\`csv
    {{{csvData}}}
    \`\`\`

    **Example Output Structure:**
    \`\`\`json
    {
      "reportTitle": "Métricas do Google Ads: os KPIs mais importantes",
      "kpiCards": [
        {
          "title": "Impressões",
          "value": "210.081",
          "change": "+24,32%",
          "previousValue": "188.984 no período anterior"
        },
        {
          "title": "Custo",
          "value": "R$70.180,79",
          "change": "+17,68%",
          "previousValue": "R$59.631,40 no período anterior"
        }
      ]
    }
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
    
    if (!output) {
      // Return a default empty structure if the AI fails to generate a valid output
      return {
        reportTitle: "Relatório de Campanha",
        kpiCards: []
      };
    }
    
    return output;
  }
);
