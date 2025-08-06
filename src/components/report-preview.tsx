
"use client";

import type { ReportData, KpiCardData, CategoryReportData } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, X, Tag, Calendar, User, BarChart2, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { generatePdf } from "@/lib/pdf-utils";

interface ReportPreviewProps {
  data: ReportData;
  onCancel: () => void;
  clientName?: string | null;
}

const KpiCard = ({ card }: { card: KpiCardData }) => {
    return (
        <div className="bg-card p-4 rounded-lg shadow-sm border border-border flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-primary/50">
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

const CategorySection = ({ categoryData }: { categoryData: CategoryReportData }) => {
    return (
        <div className="mb-10 last-of-type:mb-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-foreground break-words">{categoryData.categoryName}</h3>
                </div>
                <div className="flex items-center gap-2 text-md font-bold text-foreground bg-muted/70 px-3 py-1.5 rounded-md">
                   <DollarSign className="h-4 w-4 text-muted-foreground"/>
                   <span>Investimento Total:</span>
                   <span className="text-primary">{categoryData.totalInvestment}</span>
                </div>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryData.kpiCards.map((card, index) => (
                    <KpiCard key={index} card={card} />
                ))}
            </div>
        </div>
    );
};

export function ReportPreview({ data, onCancel, clientName }: ReportPreviewProps) {
  
  const handleGeneratePdf = () => {
    if (data) {
        generatePdf(data, clientName);
    }
  };

  const hasCategories = data.categories && data.categories.length > 0;

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
                    Revise os dados extraídos e agrupados pela IA. Se tudo estiver correto, clique em "Gerar PDF".
                </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancelar">
                <X className="h-5 w-5" />
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="my-4" />
        <div className="p-4 sm:p-6 lg:p-8 bg-muted/30 rounded-lg border" id="pdf-content">
            <div className="bg-primary text-primary-foreground p-4 sm:p-6 rounded-t-lg shadow-md">
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
              {hasCategories ? (
                  data.categories.map((category, index) => (
                     <CategorySection key={index} categoryData={category} />
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
        <Button onClick={handleGeneratePdf} disabled={!hasCategories} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Gerar PDF
        </Button>
      </CardFooter>
    </Card>
  );
}
