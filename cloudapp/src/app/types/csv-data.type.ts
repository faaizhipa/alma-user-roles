export type CSVData = {
  headers: string[];
  data: any[];
  rowCount: number;
  fileName: string;
};

export type ColumnMapping = {
  csvHeader: string;
  sampleValue: string;
  mappedField: 'mmsId' | 'remoteUrl' | 'fileTitle' | 'fileDescription' | 'fileType' | 'ignore';
  confidence: number;
};
