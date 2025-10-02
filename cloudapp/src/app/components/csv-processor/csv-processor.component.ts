import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import {
  ColumnMapping,
  CSVData,
  FileType,
  ProcessedAsset,
  ProcessingProgress,
  ProcessingResult,
} from '../../types/asset.types';
import { CSVParserService } from '../../services/csv-parser.service';
import { ColumnMappingService } from '../../services/column-mapping.service';
import { FileProcessingService } from '../../services/file-processing.service';

@Component({
  selector: 'app-csv-processor',
  templateUrl: './csv-processor.component.html',
  styleUrls: ['./csv-processor.component.scss'],
})
export class CSVProcessorComponent implements OnInit, OnDestroy {
  @Input() fileTypes: FileType[] = [];
  @Output() processingComplete = new EventEmitter<ProcessingResult>();

  private destroy$ = new Subject<void>();

  // State management
  currentStep = 0;
  csvData: CSVData | null = null;
  columnMappings: ColumnMapping[] = [];
  selectedFile: File | null = null;
  validationErrors: string[] = [];
  
  // Processing state
  isProcessing = false;
  processingProgress: ProcessingProgress | null = null;

  // Field types for mapping
  fieldTypes = [
    { value: 'mmsId', label: 'MMS ID', required: true },
    { value: 'remoteUrl', label: 'Remote URL', required: false },
    { value: 'fileTitle', label: 'File Title', required: false },
    { value: 'fileDescription', label: 'File Description', required: false },
    { value: 'fileType', label: 'File Type', required: false },
    { value: 'ignore', label: 'Ignore Column', required: false },
  ];

  constructor(
    private csvParserService: CSVParserService,
    private columnMappingService: ColumnMappingService,
    private fileProcessingService: FileProcessingService,
    private alertService: AlertService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    // Subscribe to processing progress
    this.fileProcessingService.progress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((progress) => {
        this.processingProgress = progress;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.handleFileUpload(file);
  }

  /**
   * Handle file drop
   */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!event.dataTransfer || !event.dataTransfer.files || event.dataTransfer.files.length === 0) {
      return;
    }

    const file = event.dataTransfer.files[0];
    this.handleFileUpload(file);
  }

  /**
   * Prevent default drag behavior
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handle file upload
   */
  private async handleFileUpload(file: File): Promise<void> {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.alertService.error(this.translate.instant('csvProcessor.errors.invalidFileType'));
      return;
    }

    this.selectedFile = file;
    this.validationErrors = [];

    try {
      // Parse CSV
      this.csvData = await this.csvParserService.parseCSVFile(file);

      // Validate structure
      const validation = this.csvParserService.validateCSVStructure(this.csvData);
      if (!validation.valid) {
        this.validationErrors = validation.errors;
        this.alertService.error(this.translate.instant('csvProcessor.errors.fileProcessing'));
        return;
      }

      // Suggest column mappings
      this.columnMappings = this.columnMappingService.suggestColumnMappings(
        this.csvData.headers,
        this.csvData.data.slice(0, 3) // Use first 3 rows for sampling
      );

      // Show success message
      const recordCount = this.csvData.data.length;
      this.alertService.success(
        this.translate.instant('csvProcessor.success.fileUploaded', { records: recordCount }),
        { autoClose: true }
      );

      // Move to mapping step
      this.currentStep = 1;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      this.alertService.error(error.message || this.translate.instant('csvProcessor.errors.fileProcessing'));
    }
  }

  /**
   * Update column mapping
   */
  updateMapping(mapping: ColumnMapping, newField: string): void {
    mapping.mappedField = newField;
    mapping.confidence = newField === 'ignore' ? 0.1 : 0.9;
  }

  /**
   * Validate mappings and proceed to preview
   */
  validateAndProceed(): void {
    const validation = this.columnMappingService.validateMappings(this.columnMappings);

    if (!validation.valid) {
      this.validationErrors = validation.errors;
      this.alertService.error(validation.errors.join('; '));
      return;
    }

    this.validationErrors = [];
    this.currentStep = 2;
  }

  /**
   * Go back to previous step
   */
  goBack(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  /**
   * Process the data
   */
  async processData(): Promise<void> {
    if (!this.csvData || this.columnMappings.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Apply mappings to create asset data
      const mappedData = this.columnMappingService.applyMappings(this.csvData.data, this.columnMappings);

      // Convert to ProcessedAsset array
      const assets: ProcessedAsset[] = mappedData.map((data) => ({
        mmsId: data.mmsId || '',
        remoteUrl: data.remoteUrl || '',
        fileTitle: data.fileTitle || '',
        fileDescription: data.fileDescription || '',
        fileType: data.fileType || '',
        status: 'pending',
      }));

      // Process batch
      this.fileProcessingService.processBatch(assets).subscribe({
        next: (result: ProcessingResult) => {
          this.isProcessing = false;
          this.processingProgress = null;
          this.processingComplete.emit(result);
          
          // Show success message
          const message = this.translate.instant('csvProcessor.success.batchProcessed', {
            count: result.successCount,
          });
          this.alertService.success(message, { autoClose: true });
        },
        error: (error) => {
          console.error('Error processing batch:', error);
          this.isProcessing = false;
          this.processingProgress = null;
          this.alertService.error(
            this.translate.instant('csvProcessor.errors.batchProcessing')
          );
        },
      });
    } catch (error: any) {
      console.error('Error preparing data:', error);
      this.isProcessing = false;
      this.alertService.error(error.message);
    }
  }

  /**
   * Upload a different file
   */
  uploadDifferent(): void {
    this.selectedFile = null;
    this.csvData = null;
    this.columnMappings = [];
    this.validationErrors = [];
    this.currentStep = 0;
    this.isProcessing = false;
    this.processingProgress = null;
  }

  /**
   * Get confidence level class
   */
  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.8) return 'high-confidence';
    if (confidence >= 0.5) return 'medium-confidence';
    return 'low-confidence';
  }
}
