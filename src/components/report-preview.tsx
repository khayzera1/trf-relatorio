
"use client";

import type { ReportData, KpiCardData, CampaignReportData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, Tag } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ReportPreviewProps {
  data: ReportData;
  onGeneratePdf: () => void;
  onCancel: () => void;
}

const KpiCard = ({ card }: { card: KpiCardData }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
            <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <p className="text-3xl font-bold text-foreground my-2">{card.value}</p>
                {card.description && (
                    <p className="text-sm font-semibold text-primary">{card.description}</p>
                )}
            </div>
        </div>
    );
};

const CampaignSection = ({ campaignData }: { campaignData: CampaignReportData }) => {
    return (
        <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
                <Tag className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-foreground">{campaignData.campaignName}</h3>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {campaignData.kpiCards.map((card, index) => (
                    <KpiCard key={index} card={card} />
                ))}
            </div>
        </div>
    );
};

export function ReportPreview({ data, onGeneratePdf, onCancel }: ReportPreviewProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <FileText className="h-6 w-6 text-primary"/>
                    <CardTitle className="text-2xl font-headline">Pré-visualização do Relatório</CardTitle>
                </div>
                <CardDescription>
                    Revise os dados extraídos pela IA. Se tudo estiver correto, clique em "Gerar PDF".
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="p-8 bg-gray-50 rounded-lg border mt-6">
            {/* Header Azul */}
            <div className="bg-primary text-primary-foreground p-6 rounded-t-lg -m-8 mb-8">
                <h2 className="text-2xl font-bold">{data.reportTitle}</h2>
            </div>
            
            {data.campaigns.length > 0 ? (
                data.campaigns.map((campaign, index) => (
                   <CampaignSection key={index} campaignData={campaign} />
                ))
            ) : (
                <p className="text-muted-foreground text-center py-8">Nenhuma campanha encontrada nos dados fornecidos ou a IA não conseguiu processar o arquivo.</p>
            )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onGeneratePdf} disabled={data.campaigns.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Gerar PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
