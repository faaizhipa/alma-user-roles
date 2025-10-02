import { Injectable } from '@angular/core';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AssetValidation } from '../types/asset.type';
import { FileMetadata } from '../types/file-metadata.type';

@Injectable({
  providedIn: 'root'
})
export class AssetService {
  constructor(private restService: CloudAppRestService) {}

  /**
   * Validate that an asset exists in Esploro
   * No API key needed - CloudApp handles auth
   */
  validateAsset(mmsId: string): Observable<AssetValidation> {
    return this.restService.call(`/esploro/v1/assets/${mmsId}`).pipe(
      map(response => ({
        mmsId,
        exists: true,
        accessible: true
      })),
      catchError(error => {
        let errorMessage = 'Unknown error';
        
        if (error.status === 404) {
          errorMessage = `Asset ${mmsId} not found`;
        } else if (error.status === 403) {
          errorMessage = `Access denied for asset ${mmsId}`;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return of({
          mmsId,
          exists: error.status !== 404,
          accessible: error.status !== 403,
          errorMessage
        });
      })
    );
  }

  /**
   * Attach remote file to asset
   */
  attachFile(mmsId: string, fileData: FileMetadata): Observable<any> {
    return this.restService.call({
      url: `/esploro/v1/assets/${mmsId}/files`,
      method: 'POST',
      requestBody: {
        url: fileData.url,
        title: fileData.title || 'Uploaded File',
        description: fileData.description || '',
        type: fileData.type || 'application/octet-stream'
      }
    });
  }

  /**
   * Get asset metadata
   */
  getAssetMetadata(mmsId: string): Observable<any> {
    return this.restService.call(`/esploro/v1/assets/${mmsId}`);
  }
}
