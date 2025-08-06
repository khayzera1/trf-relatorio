
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
  try {
    const result = await generateReportSummaryFlow(input);
    // Ensure the output conforms to ReportData, providing defaults if necessary
    return {
      reportTitle: result.reportTitle || "Relatório de Métricas",
      reportPeriod: result.reportPeriod || "Período não informado",
      categories: result.categories || [],
    };
  } catch (error) {
    console.error("Error in generateReportSummary:", error);
    // Return a default empty structure on error
    return {
      reportTitle: "Erro ao Gerar Relatório",
      reportPeriod: "Período não encontrado",
      categories: []
    };
  }
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
    2.  **Create a Report Title:** Generate a single, professional title for the overall report.
    3.  **Extract the Reporting Period:** Find the start and end dates in the CSV and format them as "De DD/MM/AAAA a DD/MM/AAAA". If you cannot determine the dates, return "Período não encontrado".
    4.  **Group Campaigns into Categories:** You MUST group all campaigns from the CSV into one of three main categories based on their objectives. The categories are: "Reconhecimento & Engajamento", "Contato", and "Vendas".

        **Grouping Rules:**
        *   **Reconhecimento & Engajamento:** Group campaigns whose objective is 'alcance' (reach), 'visualizações de vídeo' (video views / ThruPlay), 'seguidores' (followers), or 'engajamento' (engagement).
        *   **Contato:** Group campaigns whose objective is 'geração de cadastros' (lead generation), 'formulários', 'mensagens', 'conversas' (conversations), or 'tráfego' (traffic) for lead capture purposes.
        *   **Vendas:** Group campaigns whose objective is 'compras' (purchases), 'adições ao carrinho' (add to cart), or 'finalizações de compra' (checkouts).

    5.  **For each category, you MUST:**
        *   **Calculate Total Investment:** Sum the 'Valor gasto (R$)' for ALL campaigns within that category and present it in the 'totalInvestment' field, formatted correctly (e.g., "R$ 1.500,00").
        *   **Aggregate KPIs:** Create a list of 'kpiCards' that summarizes the performance of ALL campaigns in that category. Consolidate the metrics. For example, sum all 'Impressões' from all campaigns in the category into a single "Impressões" KPI card.
        *   **KPI Formatting Rules:**
            -   Use a comma (,) for decimal separators (e.g., R$6,23).
            -   Use a period (.) for thousands separators in whole numbers (e.g., 35.671).
            -   Round all decimal numbers to a maximum of two decimal places.
            -   Include 'R$' for currency values.
            -   For "Custo por Resultado", specify what the result is in the 'description' field (e.g., "Custo por Compra", "Custo por Lead").
        *   **Relevant Metrics per Category:**
            -   **Reconhecimento & Engajamento:** Focus on 'Alcance', 'Impressões', 'CPM (Custo por mil impressões)', 'Custo por ThruPlay', 'Engajamentos'.
            -   **Contato:** Focus on 'Resultados' (e.g., Leads, Conversas), 'Custo por Resultado' (CPL, Custo por Conversa), 'Cliques no link', 'CTR (taxa de cliques no link)'.
            -   **Vendas:** Focus on 'Resultados' (e.g., Compras), 'Valor de conversão de compras', 'ROAS (retorno do investimento em anúncios)', 'Custo por Resultado' (CPA).
    
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
      return {
        reportTitle: "Relatório de Campanha",
        reportPeriod: "Período não encontrado",
        categories: []
      };
    }
    
    return output;
  }
);

    