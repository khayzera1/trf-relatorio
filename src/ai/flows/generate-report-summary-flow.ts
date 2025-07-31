
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
  campaignName: z.string().describe("The name of the campaign, extracted directly from the CSV data."),
  kpiCards: z.array(KpiCardDataSchema).describe("An array of KPI card objects for this specific campaign."),
});

const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the consolidated report in Brazilian Portuguese, based on the data provided. Example: 'Relatório de Desempenho de Campanhas'."),
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
      campaigns: result.campaigns || [],
    };
  } catch (error) {
    console.error("Error in generateReportSummary:", error);
    // Return a default empty structure on error
    return {
      reportTitle: "Erro ao Gerar Relatório",
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
    2.  **Identify All Campaigns:** The CSV may contain multiple campaigns. Identify each distinct campaign and its associated metrics.
    3.  **Create a Report Title:** Generate a single, professional title for the overall report in Brazilian Portuguese.
    4.  **Group KPIs by Campaign:** For each campaign you identify, create a campaign object.
        -   **campaignName:** The name of the campaign.
        -   **kpiCards:** An array of relevant KPI objects belonging *only* to that campaign. Extract as many relevant KPIs as you can find, such as "Impressões", "Cliques", "Custo Total", "CTR", "CPC", "Custo por Resultado", and the main "Resultado".
            -   **title:** The name of the metric (e.g., "Impressões", "Cliques", "Custo por Resultado").
            -   **value:** The primary, current value of the metric. Format it appropriately for Brazilian Portuguese standards (e.g., use ',' for decimals and '.' for thousands, include 'R$' for currency).
            -   **description:** If the metric is "Custo por Resultado", look for the specific type of result in the data (e.g., "Conversa", "Contato no site", "Lead") and add it here. For other metrics, this field should be omitted.
    5.  **Do not include** any data from previous periods, percentage changes, or any text like "no período atual". Only the title, the value, and the optional description.

    **CSV Data:**
    \`\`\`csv
    {{{csvData}}}
    \`\`\`

    **Example Output Structure for Multiple Campaigns:**
    \`\`\`json
    {
      "reportTitle": "Análise de Desempenho das Campanhas",
      "campaigns": [
        {
          "campaignName": "Google Ads - Pesquisa Local",
          "kpiCards": [
            { "title": "Impressões", "value": "35.671" },
            { "title": "Cliques", "value": "1.234" },
            { "title": "Custo por Resultado", "value": "R$5,88", "description": "Conversa no WhatsApp" },
            { "title": "CPC", "value": "R$1,20" }
          ]
        },
        {
            "campaignName": "Meta Ads - Tráfego Site",
            "kpiCards": [
              { "title": "Cliques", "value": "1.250" },
              { "title": "Custo por Clique", "value": "R$1,44" },
              { "title": "Impressões", "value": "150.987" }
            ]
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
        campaigns: []
      };
    }
    
    return output;
  }
);
