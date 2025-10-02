import { ProcessedAsset } from './asset.type';

export type ProcessingResult = {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  processedAssets: ProcessedAsset[];
  mmsIdList: string[];
  processingTime: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
