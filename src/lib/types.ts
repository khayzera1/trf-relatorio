
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

// Types for Kanban Board
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'link' | 'file';
  createdAt: string;
  storagePath?: string; // Path for files stored in Firebase Storage
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  labelIds?: string[];
  dueDate?: string;
  checklist?: ChecklistItem[];
  attachments?: Attachment[];
}

export interface Column {
  id: string;
  title: string;
  taskIds: string[];
}
