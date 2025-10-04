import { Injectable } from '@angular/core';
import { CloudAppRestService, HttpMethod } from '@exlibris/exl-cloudapp-angular-lib';
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
   * @deprecated Use updateAssetFileUrl instead
   */
  processAssetFile(asset: ProcessedAsset): Observable<any> {
    return this.updateAssetFileUrl(asset);
  }

  /**
   * Get file types from Ex Libris Configuration API using code table
   * Uses AssetFileAndLinksType controlled vocabulary
   * Authentication is automatic within the cloud app environment
   * @returns Observable with file types
   */
  getFileTypes(): Observable<any> {
    return this.restService.call('/almaws/v1/conf/code-tables/AssetFileAndLinksType').pipe(
      catchError((error) => {
        console.warn('Could not load file types from API:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update asset file URL using Esploro API
   * @param asset The processed asset with file information
   * @returns Observable with processing result
   */
  updateAssetFileUrl(asset: ProcessedAsset): Observable<any> {
    const fileData = {
      url: asset.remoteUrl,
      label: asset.fileTitle || 'Uploaded File',
      description: asset.fileDescription || '',
      type: {
        value: asset.fileType || 'OTHER',
        desc: asset.fileType || 'Other'
      }
    };

    return this.restService
      .call({
        url: `/esploro/v1/assets/${asset.mmsId}/files`,
        method: HttpMethod.POST,
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
            () => new Error(`Failed to update file URL for ${asset.mmsId}: ${error.message}`)
          );
        })
      );
  }

  /**
   * Create a set from MMS IDs using Sets API
   * @param mmsIds Array of MMS IDs to include in the set
   * @param setName Name for the new set
   * @returns Observable with set creation result
   */
  createSetFromMmsIds(mmsIds: string[], setName: string): Observable<any> {
    const setData = {
      name: setName,
      type: { value: 'ITEMIZED', desc: 'Itemized' },
      content_type: { value: 'ASSET', desc: 'Research Asset' },
      private: { value: 'false', desc: 'Not Private' },
      members: {
        member: mmsIds.map(mmsId => ({
          id: mmsId,
          description: `Asset ${mmsId}`
        }))
      }
    };

    return this.restService
      .call({
        url: '/almaws/v1/conf/sets',
        method: HttpMethod.POST,
        requestBody: setData,
      })
      .pipe(
        catchError((error) => {
          console.error('Error creating set:', error);
          return throwError(
            () => new Error(`Failed to create set: ${error.message}`)
          );
        })
      );
  }

  /**
   * Submit a manual job using Jobs API
   * @param setId The ID of the set to process
   * @param jobName Name of the job to run
   * @returns Observable with job submission result
   */
  submitJob(setId: string, jobName: string): Observable<any> {
    const jobData = {
      name: jobName,
      set_id: setId,
      parameters: {
        parameter: []
      }
    };

    return this.restService
      .call({
        url: '/almaws/v1/conf/jobs',
        method: HttpMethod.POST,
        requestBody: jobData,
      })
      .pipe(
        catchError((error) => {
          console.error('Error submitting job:', error);
          return throwError(
            () => new Error(`Failed to submit job: ${error.message}`)
          );
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
