export type AssetData = {
  mmsId: string;
  remoteUrl?: string;
  fileTitle?: string;
  fileDescription?: string;
  fileType?: string;
};

export type ProcessedAsset = AssetData & {
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  processingTime?: number;
};

export type AssetValidation = {
  mmsId: string;
  exists: boolean;
  accessible: boolean;
  errorMessage?: string;
};
