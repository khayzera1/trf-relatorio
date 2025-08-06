
'use server';

/**
 * @fileOverview This file defines a Genkit flow that analyzes marketing campaign data
 * from a CSV containing one or more campaigns and extracts key performance indicators (KPIs)
 * for a consolidated dashboard-style report, grouped by strategic categories.
 *
 * - generateReportSummary - Analyzes CSV data and returns structured KPI data.
 * - GenerateReportSummaryInput - The input type for the generateReportSummary function.
 * - GenerateReportSummaryOutput - The return type for the generateReportSummary function.
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

const CategoryReportSchema = z.object({
  categoryName: z.string().describe("The name of the category: 'Reconhecimento & Engajamento', 'Contato', or 'Vendas'."),
  totalInvestment: z.string().describe("The total amount invested in this category, formatted as Brazilian currency (R$). Sum of 'Valor gasto (R$)' for all campaigns in the category."),
  kpiCards: z.array(KpiCardDataSchema).describe("An array of all relevant KPI card objects for this category, summarizing all campaigns within it."),
});


const GenerateReportSummaryOutputSchema = z.object({
  reportTitle: z.string().describe("A concise and descriptive title for the consolidated report in Brazilian Portuguese, based on the data provided. Example: 'Relatório de Desempenho de Campanhas'."),
  reportPeriod: z.string().describe("The reporting period, extracted from the CSV data. Format it in Brazilian Portuguese like 'De DD/MM/AAAA a DD/MM/AAAA'."),
  categories: z.array(CategoryReportSchema).describe("An array of report objects, one for each of the three main categories."),
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
    The entire analysis and output must be in **Brazilian Portuguese (pt-BR)**.
    The report should only use information that is present in the CSV.

    **Instructions:**
    1.  **Analyze the CSV Data:** Carefully review the provided CSV data.
    2.  **Create a Report Title:** Generate a single, professional title for the overall report. Example: 'Relatório de Desempenho de Campanhas'
    3.  **Extract the Reporting Period:** Find the start and end dates in the CSV and format them as "De DD/MM/AAAA a DD/MM/AAAA". If you cannot determine the dates, return "Período não encontrado".
    4.  **Group Campaigns into Categories:** You MUST group all campaigns from the CSV into one of three main categories based on their objectives. The categories are: "Reconhecimento & Engajamento", "Contato", and "Vendas".

        **Grouping Rules:**
        *   **Reconhecimento & Engajamento:** Group campaigns whose objective is 'alcance' (reach), 'visualizações de vídeo' (video views / ThruPlay), 'seguidores' (followers), 'visitas ao perfil' (profile visits), 'curtidas' (likes), 'engajamento' (engagement), or any other activity that does not generate a direct contact.
        *   **Contato:** Group campaigns whose objective is strictly 'geração de cadastros' (lead generation), 'formulários' (forms), 'mensagens', 'conversas no WhatsApp' (WhatsApp conversations), 'leads no site', 'leads no Meta', or any other direct contact generation. Do NOT include 'tráfego' (traffic) unless it's explicitly for a lead capture page.
        *   **Vendas:** Group campaigns whose objective is 'compras' (purchases), 'adições ao carrinho' (add to cart), or 'finalizações de compra' (checkouts).

    5.  **For each category, you MUST:**
        *   **Calculate Total Investment:** Sum the 'Valor gasto (R$)' for ALL campaigns within that category and present it in the 'totalInvestment' field, formatted correctly (e.g., "R$ 1.500,00").
        *   **Aggregate KPIs:** Create a list of 'kpiCards' that summarizes the performance of ALL campaigns in that category. Consolidate the metrics. For example, sum all 'Impressões' from all campaigns in the category into a single "Impressões" KPI card.
        *   **KPI Formatting Rules:**
            -   Use a comma (,) for decimal separators (e.g., R$6,23).
            -   Use a period (.) for thousands separators in whole numbers (e.g., 35.671).
            -   Round all decimal numbers to a maximum of two decimal places.
            -   Include 'R$' for currency values.
            -   For "Custo por Resultado", the 'title' should be specific (e.g., "Custo por Compra", "Custo por Lead"). The 'description' field is not needed in this case.
        *   **Relevant Metrics per Category:**
            -   **Reconhecimento & Engajamento:** Focus on 'Alcance', 'Impressões', 'CPM (Custo por mil impressões)'. Also, you MUST create specific KPI cards for any results found in the 'Resultados' column for these campaigns, such as 'Custo por ThruPlay', 'ThruPlays', 'Engajamentos com a publicação', and 'Visitas ao Perfil'. The title of the card should be the name of the result.
            -   **Contato:** Focus on 'Cliques no link', 'CTR (taxa de cliques no link)'. You MUST create specific KPI cards for any results found in the 'Resultados' column (e.g., 'Leads', 'Conversas iniciadas') and their corresponding costs ('Custo por Resultado').
            -   **Vendas:** Focus on 'Valor de conversão de compras', 'ROAS (retorno do investimento em anúncios)'. You MUST create specific KPI cards for any results found in the 'Resultados' column (e.g., 'Compras') and their corresponding costs ('Custo por Resultado').
    
    6.  **Final Output:** Create an object containing the report title, period, and an array of these category objects. Only include categories that have campaigns. If a category has no campaigns, do not include it in the final array.

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
      console.error("AI failed to generate a valid report summary. Returning default structure.");
      return {
        reportTitle: "Relatório de Campanha",
        reportPeriod: "Período não encontrado",
        categories: []
      };
    }
    
    return output;
  }
);
