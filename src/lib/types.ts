
import type { Timestamp } from 'firebase/firestore';

export interface ClientData {
  id: string;
  clientName: string;
  createdAt?: Timestamp;
}

export interface ClientDataInput extends Omit<ClientData, 'id'> {};

export interface KpiCardData {
  title: string;
  value: string;
  description?: string;
}

export interface CampaignReportData {
  campaignName: string;
  totalInvestment: string;
  kpiCards: KpiCardData[];
}

export interface ReportData {
  reportTitle: string;
  reportPeriod: string;
  campaigns: CampaignReportData[];
}

export interface SavedReportData extends ReportData {
    id: string;
    createdAt: Timestamp;
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
  url: string; // For links, it's a regular URL. For files, it's a Base64 Data URI.
  type: 'link' | 'file';
  createdAt: string;
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

export interface BoardData {
    id: string;
    name: string;
    columns: Record<string, Column>;
    tasks: Record<string, Task>;
    columnOrder: string[];
    labels: Record<string, Label>;
    userId?: string; // To associate the board with a user
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}


