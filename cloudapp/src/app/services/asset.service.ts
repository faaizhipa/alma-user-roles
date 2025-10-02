import { Injectable } from '@angular/core';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProcessedAsset } from '../types/asset.types';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  constructor(private restService: CloudAppRestService) {}

  /**
   * Validate that an asset exists in Esploro
   * @param mmsId The asset MMS ID
   * @returns Observable with asset validation result
   */
  validateAsset(mmsId: string): Observable<boolean> {
    return this.restService.call(`/esploro/v1/assets/${mmsId}`).pipe(
      map(() => true),
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new Error(`Asset ${mmsId} not found`));
        } else if (error.status === 401 || error.status === 403) {
          return throwError(
            () =>
              new Error(`Access denied for asset ${mmsId}. Check user permissions.`)
          );
        }
        return throwError(() => new Error(`API error for asset ${mmsId}: ${error.message}`));
      })
    );
  }

  /**
   * Get asset details from Esploro
   * @param mmsId The asset MMS ID
   * @returns Observable with asset details
   */
  getAssetDetails(mmsId: string): Observable<any> {
    return this.restService.call(`/esploro/v1/assets/${mmsId}`);
  }

  /**
   * Process a file attachment for an asset
   * Note: The actual endpoint may vary based on Esploro API structure
   * @param asset The processed asset with file information
   * @returns Observable with processing result
   */
  processAssetFile(asset: ProcessedAsset): Observable<any> {
    const fileData = {
      url: asset.remoteUrl,
      title: asset.fileTitle || 'Uploaded File',
      description: asset.fileDescription || '',
      type: asset.fileType || 'application/octet-stream',
    };

    // Note: This endpoint structure may need adjustment based on actual Esploro API
    return this.restService
      .call({
        url: `/esploro/v1/assets/${asset.mmsId}/files`,
        method: 'POST',
        requestBody: fileData,
      })
      .pipe(
        catchError((error) => {
          if (error.status === 400) {
            return throwError(
              () => new Error(`Invalid file data for ${asset.mmsId}: ${error.message}`)
            );
          } else if (error.status === 409) {
            return throwError(
              () => new Error(`File conflict for ${asset.mmsId}: File may already exist`)
            );
          }
          return throwError(
            () => new Error(`Failed to process file for ${asset.mmsId}: ${error.message}`)
          );
        })
      );
  }

  /**
   * Get file types from Ex Libris Configuration API
   * Authentication is automatic within the cloud app environment
   * @returns Observable with file types
   */
  getFileTypes(): Observable<any> {
    return this.restService.call('/almaws/v1/conf/mapping-tables/FileTypes').pipe(
      catchError((error) => {
        console.warn('Could not load file types from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Generate Esploro viewer URL for an asset
   * @param mmsId The asset MMS ID
   * @returns The viewer URL
   */
  generateViewerUrl(mmsId: string): string {
    // This URL structure may need to be adjusted based on institution configuration
    return `/esploro/view/${mmsId}`;
  }
}
