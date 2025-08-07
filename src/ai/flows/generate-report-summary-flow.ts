
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes marketing campaign data
 * from a CSV containing one or more campaigns and extracts key performance indicators (KPIs)
 * for a consolidated dashboard-style report, grouped by individual campaigns.
 *
 * - generateReportSummary - Analyzes CSV data and returns structured KPI data.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportsummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import type { ReportData } from '@/lib/types';


const GenerateReportSummaryInputSchema = z.object({
  csvData: z
    .string()
    .describe(
      'A string containing the entire CSV data from a marketing campaign report. The CSV can contain data for one or more distinct campaigns.'
    ),
});
export type GenerateReportSummaryInput = z.infer<typeof GenerateReportSummaryInputSchema>;


const KpiCardDataSchema = z.object({
    title: z.string().describe("The name of the Key Performance Indicator (KPI). E.g., 'Impressões', 'Cliques', 'Custo por Resultado'."),
    value: z.string().describe("The main value for the KPI. E.g., '35.671', 'R$5,88'."),
    description: z.string().optional().describe("A brief, optional description providing context for the KPI. For 'Custo por Resultado', this should specify what the result is (e.g., 'Conversa no WhatsApp', 'Contato no site'). For other KPIs, this is usually not needed."),
});

const CampaignReportSchema = z.object({
  campaignName: z.string().describe("The generic name of the campaign, following the pattern 'Campanha X', where X is the sequential number of the campaign found in the CSV. E.g., 'Campanha 1', 'Campanha 2'."),
  totalInvestment: z.string().describe("The total amount invested in this specific campaign, formatted as Brazilian currency (R$). This is the value from the 'Valor gasto (R$)' column for this campaign."),
  kpiCards: z.array(KpiCardDataSchema).describe("An array of all relevant KPI card objects for this specific campaign."),
});


const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the consolidated report in Brazilian Portuguese, based on the data provided. Example: 'Relatório de Desempenho de Campanhas'."),
  reportPeriod: z.string().describe("The reporting period, extracted from the CSV data. Format it in Brazilian Portuguese like 'De DD/MM/AAAA a DD/MM/AAAA'."),
  campaigns: z.array(CampaignReportSchema).describe("An array of report objects, one for each distinct campaign found in the CSV data."),
});

export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;


export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<ReportData> {
  // This function primarily acts as a clean, type-safe wrapper around the Genkit flow.
  const result = await generateReportSummaryFlow(input);
  
  // The flow itself handles cases where 'output' might be null.
  // We can trust the flow's output schema here.
  return result;
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `
    You are a marketing data analyst expert for a digital marketing agency.
    Your task is to analyze the provided marketing campaign data in CSV format and transform it into a structured JSON object for a dashboard report.
    The entire analysis and output must be in **Brazilian Portuguese (pt-br)**.
    The report must only use information that is present in the CSV. Do not invent or mix data between campaigns. The CSV is the single source of truth.

    **Instructions:**
    1.  **Analyze the CSV Data:** Carefully review the provided CSV data. Each row represents a different campaign and must be processed independently.
    2.  **Create a Report Title:** Generate a single, professional title for the overall report. Example: 'Relatório de Desempenho de Campanhas'.
    3.  **Extract the Reporting Period:** Find the start and end dates in the CSV and format them as "De DD/MM/AAAA a DD/MM/AAAA". If you cannot determine the dates, return "Período não encontrado".
    4.  **Process Each Campaign Individually:** You MUST create a separate report object for each campaign (each row) in the CSV. Do not mix information between rows.
    
    5.  **For EACH campaign row, you MUST perform the following checks and actions:**
        *   **Assign a Generic Name:** Name each campaign sequentially as "Campanha 1", "Campanha 2", "Campanha 3", and so on, based on its order in the CSV file. Do NOT use the real campaign name from the data.
        *   **Extract Total Investment:** Get the 'Valor gasto (R$)' for that specific campaign row and present it in the 'totalInvestment' field, formatted correctly (e.g., "R$ 500,00").
        *   **Create KPI Cards:** Create a list of 'kpiCards' by extracting metrics from ALL relevant columns for that single campaign row. The column headers in the CSV are the source of truth for the KPI titles.
        *   **KPI Formatting Rules:**
            -   Use a comma (,) for decimal separators (e.g., R$6,23).
            -   Use a period (.) for thousands separators in whole numbers (e.g., 35.671).
            -   Round all decimal numbers to a maximum of two decimal places.
            -   Include 'R$' for currency values.
            -   **Specific Metric Handling (Crucial Verification Step):**
                -   For any column starting with "Resultados:" (e.g., 'Resultados: Compras no site', 'Resultados: Contatos no site'), the 'title' of the KPI card MUST BE the name of the result itself (e.g., 'Compras no site', 'Contatos no site'). The 'description' field is not needed in this case. VERIFY THIS.
                -   For a column named 'Resultados: profile_visit_view', the 'title' of the KPI card MUST BE 'Visitas ao perfil'. The 'description' field is not needed. VERIFY THIS.
                -   For any column starting with "Custo por Resultado:", the 'title' of the KPI card MUST BE specific to the result type (e.g., 'Custo por Compra no site', 'Custo por Contato no site'). You MUST use the same result name identified from the "Resultados:" column for that same campaign row. The 'description' field is not needed. DOUBLE-CHECK THIS ASSOCIATION.
                -   For a column named 'Custo por Resultado: profile_visit_view', the 'title' of the KPI card MUST BE 'Custo por visita ao perfil'. The 'description' field is not needed. DOUBLE-CHECK THIS ASSOCIATION.

    6.  **Final Output:** Create an object containing the report title, period, and an array of these individual campaign report objects. If the CSV is empty or has no campaign data, the 'campaigns' array should be empty.

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
    stream: false, 
    cache: false,
  },
  async input => {
    const {output} = await prompt(input);
    
    if (!output) {
      // Return a default empty structure if the AI fails to generate a valid output
      console.error("AI failed to generate a valid report summary. Returning default structure.");
      return {
        reportTitle: "Relatório de Campanha",
        reportPeriod: "Período não encontrado",
        campaigns: []
      };
    }
    
    return output;
  }
);
