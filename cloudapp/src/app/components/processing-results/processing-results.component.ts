import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ProcessingResult, ProcessedAsset } from '../../types/asset.types';
import { FileProcessingService } from '../../services/file-processing.service';

@Component({
  selector: 'app-processing-results',
  templateUrl: './processing-results.component.html',
  styleUrls: ['./processing-results.component.scss'],
})
export class ProcessingResultsComponent implements OnInit, OnDestroy {
  @Input() result!: ProcessingResult;

  mmsIdDownloadUrl: string = '';
  displayedColumns: string[] = ['status', 'mmsId', 'fileTitle', 'error'];

  constructor(
    private fileProcessingService: FileProcessingService,
    private clipboard: Clipboard,
    private snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (this.result && this.result.successful.length > 0) {
      this.mmsIdDownloadUrl = this.fileProcessingService.generateMmsIdDownloadUrl(
        this.result.successful
      );
    }
  }

  ngOnDestroy(): void {
    if (this.mmsIdDownloadUrl) {
      this.fileProcessingService.revokeDownloadUrl(this.mmsIdDownloadUrl);
    }
  }

  /**
   * Download MMS ID CSV
   */
  downloadMmsIdCSV(): void {
    const link = document.createElement('a');
    link.href = this.mmsIdDownloadUrl;
    link.download = `esploro-asset-mms-ids-${new Date().getTime()}.csv`;
    link.click();
  }

  /**
   * Copy URL to clipboard
   */
  copyUrlToClipboard(url: string): void {
    if (this.clipboard.copy(url)) {
      this.snackBar.open(
        this.translate.instant('processingResults.urlCopied'),
        '',
        { duration: 2000 }
      );
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: string): string {
    return status === 'success' ? 'check_circle' : 'error';
  }

  /**
   * Get status class
   */
  getStatusClass(status: string): string {
    return status === 'success' ? 'status-success' : 'status-error';
  }

  /**
   * Get combined results for table display
   */
  getCombinedResults(): ProcessedAsset[] {
    return [...this.result.successful, ...this.result.failed];
  }
}
