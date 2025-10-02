import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CSVParserService } from '../../services/csv-parser.service';
import { ColumnMappingService } from '../../services/column-mapping.service';
import { FileProcessingService } from '../../services/file-processing.service';
import { CSVData, ColumnMapping } from '../../types/csv-data.type';
import { AssetData, ProcessedAsset } from '../../types/asset.type';
import { FileType } from '../../types/file-metadata.type';

@Component({
  selector: 'app-csv-processor',
  templateUrl: './csv-processor.component.html',
  styleUrls: ['./csv-processor.component.scss']
})
export class CSVProcessorComponent implements OnDestroy {
  @Input() fileTypes: FileType[] = [];
  @Output() batchProcessed = new EventEmitter<ProcessedAsset[]>();
  @Output() downloadReady = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

  // Component state
  csvData: CSVData | null = null;
  columnMappingData: ColumnMapping[] = [];
  showColumnMapping = false;
  validationErrors: string[] = [];
  validationWarnings: string[] = [];
  displayedColumns = ['csvHeader', 'sampleValue', 'mappedField'];

  // Processing state
  isProcessing = false;
  processingProgress = 0;
  processedCount = 0;
  totalCount = 0;
  currentProcessingItem = '';

  // UI state
  isDragActive = false;

  constructor(
    private csvParser: CSVParserService,
    private columnMapping: ColumnMappingService,
    private fileProcessing: FileProcessingService,
    private translate: TranslateService
  ) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // File handling methods
  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.processFile(target.files[0]);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragActive = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private async processFile(file: File) {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert(this.translate.instant('Errors.InvalidFileType'));
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(this.translate.instant('Errors.FileTooLarge'));
      return;
    }

    try {
      const csvResult = await this.csvParser.parseFile(file);

      if (!csvResult.data || csvResult.data.length === 0) {
        alert(this.translate.instant('Errors.EmptyFile'));
        return;
      }

      this.csvData = csvResult;
      this.generateColumnMapping();
      this.showColumnMapping = true;

    } catch (error: any) {
      alert(this.translate.instant('Errors.FileProcessing') + ': ' + error.message);
    }
  }

  /**
   * Generate intelligent column mapping suggestions
   */
  private generateColumnMapping() {
    if (!this.csvData) return;

    this.columnMappingData = this.columnMapping.suggestMapping(
      this.csvData.headers,
      this.csvData.data
    );

    this.validateMapping();
  }

  /**
   * Validate current column mapping
   */
  validateMapping() {
    const validation = this.columnMapping.validateMapping(this.columnMappingData);
    this.validationErrors = validation.errors;
    this.validationWarnings = validation.warnings;
  }

  isValidMapping(): boolean {
    this.validateMapping();
    return this.validationErrors.length === 0;
  }

  /**
   * Process mapped CSV data
   */
  async processMappedData() {
    if (!this.isValidMapping() || !this.csvData) {
      return;
    }

    this.isProcessing = true;
    this.processingProgress = 0;
    this.processedCount = 0;
    this.totalCount = this.csvData.data.length;

    try {
      // Transform data based on mapping
      const transformedData = this.columnMapping.transformData(
        this.csvData.data,
        this.columnMappingData
      ) as AssetData[];

      // Process assets
      const result = await this.fileProcessing.processBatch(
        transformedData,
        (current, total, currentAsset) => {
          this.processedCount = current;
          this.totalCount = total;
          this.currentProcessingItem = currentAsset;
          this.processingProgress = (current / total) * 100;
        }
      );

      // Generate MMS ID download file
      const csvContent = this.fileProcessing.generateMmsIdCSV(result.mmsIdList);
      const downloadUrl = this.fileProcessing.createDownloadUrl(csvContent);

      // Emit results
      this.batchProcessed.emit(result.processedAssets);
      this.downloadReady.emit(downloadUrl);

    } catch (error: any) {
      alert(this.translate.instant('Errors.BatchProcessing') + ': ' + error.message);
    } finally {
      this.isProcessing = false;
    }
  }

  resetUpload() {
    this.csvData = null;
    this.columnMappingData = [];
    this.showColumnMapping = false;
    this.validationErrors = [];
    this.validationWarnings = [];
    this.isProcessing = false;
    this.processingProgress = 0;
  }
}
