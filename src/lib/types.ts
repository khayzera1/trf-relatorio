

export interface ClientData {
  id: string;
  clientName: string;
  campaign: string;
  status: 'Ativa' | 'Pausada' | 'Concluída';
}

export interface KpiCardData {
  title: string;
  value: string;
  description?: string;
}

export interface ReportData {
  reportTitle: string;
  kpiCards: KpiCardData[];
}
