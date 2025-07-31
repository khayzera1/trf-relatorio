
export interface ClientData {
  id: string;
  clientName: string;
}

export interface KpiCardData {
  title: string;
  value: string;
  description?: string;
}

export interface CampaignReportData {
  campaignName: string;
  kpiCards: KpiCardData[];
}

export interface ReportData {
  reportTitle: string;
  reportPeriod: string;
  campaigns: CampaignReportData[];
}
