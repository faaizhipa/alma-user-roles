import { Injectable } from '@angular/core';
import { AssetService } from './asset.service';
import { ProcessedAsset, AssetData } from '../types/asset.type';
import { ProcessingResult } from '../types/processing-result.type';
import { FileMetadata } from '../types/file-metadata.type';

@Injectable({
  providedIn: 'root'
})
export class FileProcessingService {
  
  constructor(private assetService: AssetService) {}

  /**
   * Process batch of assets
   */
  async processBatch(
    assets: AssetData[],
    onProgress?: (current: number, total: number, currentAsset: string) => void
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    const processedAssets: ProcessedAsset[] = [];
    
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      
      if (onProgress) {
        onProgress(i + 1, assets.length, asset.mmsId);
      }
      
      const processedAsset = await this.processIndividual(asset);
      processedAssets.push(processedAsset);
      
      // Small delay to prevent API throttling
      if (i < assets.length - 1) {
        await this.delay(100);
      }
    }
    
    const processingTime = Date.now() - startTime;
    const successCount = processedAssets.filter(a => a.status === 'success').length;
    const errorCount = processedAssets.filter(a => a.status === 'error').length;
    const mmsIdList = processedAssets
      .filter(a => a.status === 'success')
      .map(a => a.mmsId);
    
    return {
      totalProcessed: processedAssets.length,
      successCount,
      errorCount,
      processedAssets,
      mmsIdList,
      processingTime
    };
  }

  /**
   * Process individual asset
   */
  private async processIndividual(asset: AssetData): Promise<ProcessedAsset> {
    const startTime = Date.now();
    const processedAsset: ProcessedAsset = {
      ...asset,
      status: 'pending'
    };
    
    try {
      // Validate asset exists
      const validation = await this.assetService.validateAsset(asset.mmsId).toPromise();
      
      if (!validation || !validation.exists) {
        throw new Error(validation?.errorMessage || `Asset ${asset.mmsId} not found`);
      }
      
      if (!validation.accessible) {
        throw new Error(`Access denied for asset ${asset.mmsId}`);
      }
      
      // Attach file if URL provided
      if (asset.remoteUrl) {
        const fileMetadata: FileMetadata = {
          url: asset.remoteUrl,
          title: asset.fileTitle || 'Uploaded File',
          description: asset.fileDescription || '',
          type: asset.fileType || 'application/octet-stream'
        };
        
        await this.assetService.attachFile(asset.mmsId, fileMetadata).toPromise();
      }
      
      processedAsset.status = 'success';
      processedAsset.processingTime = Date.now() - startTime;
      
    } catch (error: any) {
      processedAsset.status = 'error';
      processedAsset.errorMessage = error.message || 'Unknown error occurred';
      processedAsset.processingTime = Date.now() - startTime;
    }
    
    return processedAsset;
  }

  /**
   * Generate CSV content for MMS ID download
   */
  generateMmsIdCSV(mmsIds: string[]): string {
    const header = 'MMS ID';
    const rows = mmsIds.map(id => `"${id}"`);
    return `${header}\n${rows.join('\n')}`;
  }

  /**
   * Create downloadable blob URL
   */
  createDownloadUrl(csvContent: string): string {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    return window.URL.createObjectURL(blob);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
