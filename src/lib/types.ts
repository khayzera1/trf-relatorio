
export interface ClientData {
  id: string;
  clientName: string;
}

export interface ClientDataInput extends Omit<ClientData, 'id'> {};

export interface KpiCardData {
  title: string;
  value: string;
  description?: string;
}

export interface CategoryReportData {
  categoryName: string;
  totalInvestment: string;
  kpiCards: KpiCardData[];
}

export interface ReportData {
  reportTitle: string;
  reportPeriod: string;
  categories: CategoryReportData[];
}

    