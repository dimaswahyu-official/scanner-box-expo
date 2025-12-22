export interface User {

  id: string;
  name: string;
  phone: string;
}

export interface ScanItem {
  code: string;
  scannedAt: string;
}

export interface Batch {
  id: string;
  name: string;
  userId: string;
  userRequestFrom: string;
  createdAt: string;
  scans: ScanItem[];
}