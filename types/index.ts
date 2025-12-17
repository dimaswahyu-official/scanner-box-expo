export interface User {

    id: string;
  name: string;
  phone: string;
  date: string;
  requestFrom?: string;
}

export interface ScanItem {
  code: string;
  scannedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  scans: ScanItem[];
}