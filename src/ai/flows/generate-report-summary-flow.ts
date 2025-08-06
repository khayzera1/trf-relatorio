
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes marketing campaign data
 * from a CSV containing one or more campaigns and extracts key performance indicators (KPIs)
 * for a consolidated dashboard-style report.
 *
 * - generateReportSummary - Analyzes CSV data and returns structured KPI data for multiple campaigns.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
  campaignName: z.string().describe("A summarized, clean name for the campaign based on its objective."),
  kpiCards: z.array(KpiCardDataSchema).describe("An array of KPI card objects for this specific campaign."),
});

const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the consolidated report in Brazilian Portuguese, based on the data provided. Example: 'Relatório de Desempenho de Campanhas'."),
  reportPeriod: z.string().describe("The reporting period, extracted from the CSV data. Format it in Brazilian Portuguese like 'De DD/MM/AAAA a DD/MM/AAAA'."),
  campaigns: z.array(CampaignReportSchema).describe("An array of report objects, one for each campaign found in the CSV."),
});

export type GenerateReportSummaryOutput = z.infer<typeof GenerateReportSummaryOutputSchema>;


export async function generateReportSummary(
  input: GenerateReportSummaryInput
): Promise<ReportData> {
  try {
    const result = await generateReportSummaryFlow(input);
    // Ensure the output conforms to ReportData, providing defaults if necessary
    return {
      reportTitle: result.reportTitle || "Relatório de Métricas",
      reportPeriod: result.reportPeriod || "Período não informado",
      campaigns: result.campaigns || [],
    };
  } catch (error) {
    console.error("Error in generateReportSummary:", error);
    // Return a default empty structure on error
    return {
      reportTitle: "Erro ao Gerar Relatório",
      reportPeriod: "Período não encontrado",
      campaigns: []
    };
  }
}

const prompt = ai.definePrompt({
  name: 'generateReportSummaryPrompt',
  input: {schema: GenerateReportSummaryInputSchema},
  output: {schema: GenerateReportSummaryOutputSchema},
  prompt: `
    You are a marketing data analyst expert for a digital marketing agency.
    Your task is to analyze the provided marketing campaign data in CSV format and transform it into a structured JSON object for a dashboard report. The CSV can contain data for MULTIPLE campaigns.
    The entire analysis and output must be in **Brazilian Portuguese (pt-BR)**.
    The report should only use information that is present in the CSV.

    **Instructions:**
    1.  **Analyze the CSV Data:** Carefully review the provided CSV data.
    2.  **Create a Report Title:** Generate a single, professional title for the overall report in Brazilian Portuguese.
    3.  **Extract the Reporting Period:** Find the start and end dates in the CSV and format them as a string in Brazilian Portuguese like "De DD/MM/AAAA a DD/MM/AAAA". This will be the value for 'reportPeriod'. If you cannot determine the dates, return "Período não encontrado".
    4.  **Identify All Campaigns and Summarize Their Names:**
        - Identify each distinct campaign and its associated metrics.
        - **Summarize the campaign name based on its objective.** Instead of using the full, technical name from the CSV, create a summarized, user-friendly name. Follow these rules:
          - If the objective is "contato no site", "lead no site", "lead no meta", or "conversas no whatsapp", use the name **"Campanha de Contato"**.
          - If the objective is "visita no insta" or involves profile views, use the name **"Campanha para Ver o Perfil"**.
          - If the objective is "vendas", "compras", or "add to cart", use the name **"Campanha de Vendas"**.
          - If the objective is "reconhecimento" or "alcance" (reach), use the name **"Campanha de Reconhecimento"**.
          - If none of the above apply, create a concise, logical name based on the available data.
    5.  **Group KPIs by Campaign:** For each campaign you identify, create a campaign object.
        -   **campaignName:** The summarized name you created in the previous step.
        -   **kpiCards:** An array of relevant KPI objects belonging *only* to that campaign. Extract as many relevant KPIs as you can find, such as "Impressões", "Cliques", "Custo Total", "CTR", "CPC", "Custo por Resultado", and the main "Resultado".
            -   **title:** The name of the metric (e.g., "Impressões", "Cliques", "Custo por Resultado").
            -   **value:** The primary, current value of the metric. Format it appropriately for Brazilian Portuguese standards. **IMPORTANT:**
                - Use a comma (,) for decimal separators (e.g., R$6,23).
                - Use a period (.) for thousands separators in whole numbers (e.g., 35.671).
                - Round all decimal numbers (like currencies or percentages) to a maximum of two decimal places. For example, R$6,23426966 becomes R$6,23 and 1,3159513% becomes 1,32%.
                - Include 'R$' for currency values.
            -   **description:** If the metric is "Custo por Resultado", look for the specific type of result in the data (e.g., "Conversa", "Contato no site", "Lead") and add it here. For other metrics, this field should be omitted.
    6.  **Do not include** any data from previous periods, percentage changes, or any text like "no período atual". Only the title, the value, and the optional description.

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
    
    if (!output) {
      // Return a default empty structure if the AI fails to generate a valid output
      return {
        reportTitle: "Relatório de Campanha",
        reportPeriod: "Período não encontrado",
        campaigns: []
      };
    }
    
    return output;
  }
);
