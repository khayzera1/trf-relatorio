
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileSpreadsheet, FileText, Lightbulb, Loader2 } from "lucide-react";
import { exportToCsv, exportToExcel } from "@/lib/export-utils";
import { suggestExportFormats, type SuggestExportFormatsOutput } from "@/ai/flows/suggest-export-formats";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ClientData } from "@/lib/types";

interface ExportDialogProps {
  data: ClientData[];
  onExport: (format: "excel" | "csv") => void;
  exportCount: number;
  usageStatistics: string;
}

const SUGGESTION_THRESHOLD = 3;

export function ExportDialog({ data, onExport, exportCount, usageStatistics }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"excel" | "csv">("excel");
  const [suggestions, setSuggestions] = useState<SuggestExportFormatsOutput | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  useEffect(() => {
    if (open && exportCount >= SUGGESTION_THRESHOLD && !suggestions && !isLoadingSuggestions) {
      const fetchSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
          const result = await suggestExportFormats({ usageStatistics });
          setSuggestions(result);
        } catch (error) {
          console.error("Error fetching suggestions:", error);
        } finally {
          setIsLoadingSuggestions(false);
        }
      };
      fetchSuggestions();
    }
  }, [open, exportCount, usageStatistics, suggestions, isLoadingSuggestions]);

  const handleDownload = () => {
    const filename = `relatorio-clientes-${new Date().toISOString().split('T')[0]}`;
    if (format === "excel") {
      exportToExcel(data, `${filename}.xlsx`);
    } else {
      exportToCsv(data, `${filename}.csv`);
    }
    onExport(format);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] transition-all duration-300">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl">Exportar Relatório</DialogTitle>
          <DialogDescription>
            Escolha o formato do arquivo para fazer o download dos dados.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <RadioGroup defaultValue="excel" value={format} onValueChange={(value: "excel" | "csv") => setFormat(value)}>
            <Label htmlFor="excel" className="flex items-center space-x-4 p-4 rounded-md border has-[:checked]:bg-accent has-[:checked]:border-primary transition-all cursor-pointer">
                <RadioGroupItem value="excel" id="excel" />
                <div className="flex-1 flex items-center gap-3 text-base">
                    <FileSpreadsheet className="h-6 w-6 text-foreground" />
                    <div>
                        <p className="font-semibold">Excel (.xlsx)</p>
                        <p className="text-sm text-muted-foreground">Ideal para análises detalhadas e planilhas.</p>
                    </div>
                </div>
            </Label>
            <Label htmlFor="csv" className="flex items-center space-x-4 p-4 rounded-md border has-[:checked]:bg-accent has-[:checked]:border-primary transition-all cursor-pointer">
                <RadioGroupItem value="csv" id="csv" />
                <div className="flex-1 flex items-center gap-3 text-base">
                    <FileText className="h-6 w-6 text-foreground" />
                    <div>
                        <p className="font-semibold">CSV (.csv)</p>
                        <p className="text-sm text-muted-foreground">Compatível com diversas ferramentas de dados.</p>
                    </div>
                </div>
            </Label>
          </RadioGroup>
        </div>

        {(isLoadingSuggestions || suggestions) && (
          <Alert className="bg-accent/50 border-accent animate-in fade-in-50 duration-500">
            <Lightbulb className="h-4 w-4 text-primary" />
            <AlertTitle className="font-semibold">Sugestão Inteligente</AlertTitle>
            <AlertDescription>
              {isLoadingSuggestions && (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analisando seu uso para sugerir novos formatos...</span>
                </div>
              )}
              {suggestions && (
                <>
                  <p>{suggestions.reasoning}</p>
                  <p className="mt-2">Experimente também: <span className="font-semibold">{suggestions.suggestedFormats.join(', ')}</span></p>
                </>
              )}
            </AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Fazer Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
