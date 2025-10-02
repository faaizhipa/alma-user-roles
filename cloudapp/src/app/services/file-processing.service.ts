import { Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { ProcessedAsset, ProcessingProgress, ProcessingResult } from '../types/asset.types';
import { AssetService } from './asset.service';

@Injectable({
  providedIn: 'root',
})
export class FileProcessingService {
  private progressSubject = new Subject<ProcessingProgress>();
  public progress$ = this.progressSubject.asObservable();

  constructor(private assetService: AssetService) {}

  /**
   * Process a batch of assets
   * @param assets Array of assets to process
   * @returns Observable with processing result
   */
  processBatch(assets: ProcessedAsset[]): Observable<ProcessingResult> {
    return new Observable((observer) => {
      this.processBatchAsync(assets)
        .then((result) => {
          observer.next(result);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  /**
   * Process assets asynchronously with progress updates
   * @param assets Array of assets to process
   * @returns Promise with processing result
   */
  private async processBatchAsync(assets: ProcessedAsset[]): Promise<ProcessingResult> {
    const successful: ProcessedAsset[] = [];
    const failed: ProcessedAsset[] = [];
    const total = assets.length;

    for (let i = 0; i < total; i++) {
      const asset = assets[i];
      
      // Emit progress
      this.progressSubject.next({
        current: i + 1,
        total,
        percentage: ((i + 1) / total) * 100,
        currentAsset: asset.mmsId,
      });

      try {
        // Validate asset exists
        await this.assetService.validateAsset(asset.mmsId).toPromise();

        // Process file if URL is provided
        if (asset.remoteUrl && asset.remoteUrl.trim() !== '') {
          await this.assetService.processAssetFile(asset).toPromise();
        }

        // Generate viewer URL
        asset.viewerUrl = this.assetService.generateViewerUrl(asset.mmsId);
        asset.status = 'success';
        successful.push(asset);
      } catch (error: any) {
        asset.status = 'error';
        asset.errorMessage = error.message || 'Unknown error occurred';
        failed.push(asset);
        console.error(`Failed to process asset ${asset.mmsId}:`, error);
      }

      // Small delay to prevent API rate limiting
      if (i < total - 1) {
        await this.delay(100);
      }
    }

    return {
      successful,
      failed,
      totalProcessed: total,
      successCount: successful.length,
      failureCount: failed.length,
    };
  }

  /**
   * Delay helper function
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate CSV content for successful MMS IDs
   * @param assets Array of successful assets
   * @returns CSV string
   */
  generateMmsIdCSV(assets: ProcessedAsset[]): string {
    const header = 'MMS ID\n';
    const rows = assets.map((asset) => asset.mmsId).join('\n');
    return header + rows;
  }

  /**
   * Generate download blob for MMS ID CSV
   * @param assets Array of successful assets
   * @returns Blob URL for download
   */
  generateMmsIdDownloadUrl(assets: ProcessedAsset[]): string {
    const csv = this.generateMmsIdCSV(assets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    return URL.createObjectURL(blob);
  }

  /**
   * Clean up blob URL
   * @param url Blob URL to revoke
   */
  revokeDownloadUrl(url: string): void {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }
}
