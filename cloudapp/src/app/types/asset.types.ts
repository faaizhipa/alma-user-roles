export interface FileType {
  code: string;
  description: string;
}

export interface ProcessedAsset {
  mmsId: string;
  remoteUrl?: string;
  fileTitle?: string;
  fileDescription?: string;
  fileType?: string;
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  viewerUrl?: string;
}

export interface ColumnMapping {
  csvHeader: string;
  sampleValue: string;
  mappedField: string;
  confidence: number;
}

export interface CSVData {
  headers: string[];
  data: any[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ProcessingProgress {
  current: number;
  total: number;
  percentage: number;
  currentAsset?: string;
}

export interface ProcessingResult {
  successful: ProcessedAsset[];
  failed: ProcessedAsset[];
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}
