
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
      'A string containing the entire CSV data from a marketing campaign report. The CSV must contain columns for a metric name and its corresponding value.'
    ),
});
export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;


const KpiCardDataSchema = z.object({
    title: z.string().describe("The name of the Key Performance Indicator (KPI). E.g., 'Impressões', 'Cliques', 'Custo por Resultado'."),
    value: z.string().describe("The main value for the KPI. E.g., '35.671', 'R$5,88'."),
    description: z.string().optional().describe("A brief, optional description providing context for the KPI. For 'Custo por Resultado', this should specify what the result is (e.g., 'Conversa no WhatsApp', 'Contato no site'). For other KPIs, this is usually not needed."),
});

const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the report in Brazilian Portuguese, based on the data provided. Example: 'Relatório de Desempenho de Campanhas Digitais'."),
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
    1.  **Analyze the CSV Data:** Carefully review the provided CSV data. Identify the key performance indicators (KPIs) and their current values.
    2.  **Create a Report Title:** Generate a professional and engaging title for the report in Brazilian Portuguese.
    3.  **Extract KPI Cards:** For each key metric found in the CSV, create a JSON object.
        -   **title:** The name of the metric (e.g., "Impressões", "Cliques", "Custo por Resultado").
        -   **value:** The primary, current value of the metric. Format it appropriately for Brazilian Portuguese standards (e.g., use ',' for decimals and '.' for thousands, include 'R$' for currency).
        -   **description:** If the metric is "Custo por Resultado", look for the specific type of result in the data (e.g., "Conversa", "Contato no site", "Lead") and add it here. For other metrics, this field should be omitted.
    4.  **Do not include** any data from previous periods, percentage changes, or any text like "no período atual". Only the title, the value, and the optional description.

    **CSV Data:**
    \`\`\`csv
    {{{csvData}}}
    \`\`\`

    **Example Output Structure:**
    \`\`\`json
    {
      "reportTitle": "Análise de Desempenho de Campanhas Digitais",
      "kpiCards": [
        {
          "title": "Impressões",
          "value": "35.671"
        },
        {
          "title": "Custo por Resultado",
          "value": "R$5,88",
          "description": "Conversa no WhatsApp"
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
