
"use client";

import type { ReportData, KpiCardData, CampaignReportData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, BarChart2, DollarSign, Calendar, User, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { generatePdf } from "@/lib/pdf-utils";

interface ReportPreviewProps {
  data: ReportData;
  onCancel: () => void;
  onSaveAndGeneratePdf: () => Promise<void>;
  clientName?: string | null;
}

const KpiCard = ({ card }: { card: KpiCardData }) => {
    return (
        <div className="bg-card p-4 rounded-lg shadow-sm border flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-primary/20">
            <div>
                <p className="text-sm text-muted-foreground break-words">{card.title}</p>
                <p className="text-2xl font-bold text-foreground my-2 break-words">{card.value}</p>
                {card.description && (
                    <p className="text-xs font-semibold text-primary break-words">{card.description}</p>
                )}
            </div>
        </div>
    );
};

const CampaignSection = ({ campaignData }: { campaignData: CampaignReportData }) => {
    return (
        <div className="mb-10 last-of-type:mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-foreground break-words">{campaignData.campaignName}</h3>
                </div>
                <div className="flex items-center gap-2 text-md font-bold text-foreground bg-muted px-3 py-1.5 rounded-md">
                   <DollarSign className="h-4 w-4 text-muted-foreground"/>
                   <span>Investimento:</span>
                   <span className="text-primary">{campaignData.totalInvestment}</span>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignData.kpiCards.map((card, index) => (
                    <KpiCard key={index} card={card} />
                ))}
            </div>
        </div>
    );
};

export function ReportPreview({ data, onCancel, onSaveAndGeneratePdf, clientName }: ReportPreviewProps) {
  
  const handleGeneratePdf = async () => {
    if (!data) return;
    // First, save the report to the database
    await onSaveAndGeneratePdf();
    // Then, generate the PDF for download
    generatePdf(data, clientName);
  };

  const hasCampaigns = data.campaigns && data.campaigns.length > 0;

  return (
    <Card className="shadow-lg animate-fade-in w-full">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-primary flex-shrink-0"/>
                    <CardTitle className="text-2xl font-headline break-words">Pré-visualização do Relatório</CardTitle>
                </div>
                <CardDescription className="break-words">
                    Revise os dados e, se estiver tudo correto, salve ou gere o PDF.
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancelar">
                <X className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="p-4 sm:p-6 lg:p-8 bg-muted/50 rounded-lg border" id="pdf-content">
            <div className="bg-primary text-primary-foreground p-6 rounded-t-lg shadow-md">
                {clientName && (
                  <div className="flex items-center gap-2 mb-3 text-primary-foreground/90">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <p className="font-semibold text-lg break-words">{clientName}</p>
                  </div>
                )}
                <h2 className="text-2xl font-bold break-words">{data.reportTitle}</h2>
                <div className="flex items-center gap-2 mt-2 text-primary-foreground/90">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <p className="font-medium break-words">{data.reportPeriod}</p>
                </div>
            </div>
            
            <div className="bg-card p-6 rounded-b-lg">
              {hasCampaigns ? (
                  data.campaigns.map((campaign, index) => (
                     <CampaignSection key={index} campaignData={campaign} />
                  ))
              ) : (
                  <div className="text-center py-8">
                    <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Nenhuma campanha encontrada ou a IA não conseguiu processar os dados.</p>
                  </div>
              )}
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-4">
        <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">Cancelar</Button>
        <Button onClick={handleGeneratePdf} disabled={!hasCampaigns} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Salvar e Gerar PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
