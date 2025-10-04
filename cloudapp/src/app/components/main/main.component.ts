import { Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AlertService,
  CloudAppRestService,
  CloudAppEventsService,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { FileType, ProcessingResult } from '../../types/asset.types';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  public loading: boolean = false;
  public fileTypes: FileType[] = [];
  public processingResult: ProcessingResult | null = null;
  public showResults: boolean = false;

  public constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private assetService: AssetService,
    private alertService: AlertService,
    private translate: TranslateService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    this.loading = true;
    this.loadFileTypes();
  }

  /**
   * Load file types from Ex Libris Configuration API using code table
   * Uses AssetFileAndLinksType controlled vocabulary
   * Cloud apps authenticate automatically - no API key required
   */
  private loadFileTypes(): void {
    this.assetService
      .getFileTypes()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((response) => {
          if (response && response.rows && response.rows.row) {
            this.fileTypes = response.rows.row
              .map((row: any) => ({
                code: row.code || '',
                description: row.description || row.code || '',
              }))
              .filter((type: FileType) => type.code);
          }

          // Fallback if API returns no data
          if (this.fileTypes.length === 0) {
            this.fileTypes = this.getDefaultFileTypes();
          }

          this.loading = false;
        }),
        catchError((error) => {
          console.warn('Could not load file types from API, using defaults:', error);
          this.alertService.warn(
            this.translate.instant('main.warnings.fileTypesAPIFailed'),
            { autoClose: true }
          );
          this.fileTypes = this.getDefaultFileTypes();
          this.loading = false;
          return EMPTY;
        })
      )
      .subscribe();
  }

  /**
   * Get default file types as fallback
   */
  private getDefaultFileTypes(): FileType[] {
    return [
      { code: 'PDF', description: 'Portable Document Format' },
      { code: 'DOC', description: 'Microsoft Word Document' },
      { code: 'DOCX', description: 'Microsoft Word Document (OpenXML)' },
      { code: 'XLS', description: 'Microsoft Excel Spreadsheet' },
      { code: 'XLSX', description: 'Microsoft Excel Spreadsheet (OpenXML)' },
      { code: 'PPT', description: 'Microsoft PowerPoint Presentation' },
      { code: 'PPTX', description: 'Microsoft PowerPoint Presentation (OpenXML)' },
      { code: 'TXT', description: 'Plain Text File' },
      { code: 'RTF', description: 'Rich Text Format' },
      { code: 'HTML', description: 'HyperText Markup Language' },
      { code: 'XML', description: 'Extensible Markup Language' },
      { code: 'JPG', description: 'JPEG Image' },
      { code: 'PNG', description: 'Portable Network Graphics' },
      { code: 'GIF', description: 'Graphics Interchange Format' },
      { code: 'MP4', description: 'MPEG-4 Video' },
      { code: 'MP3', description: 'MPEG Audio Layer 3' },
      { code: 'ZIP', description: 'ZIP Archive' },
    ];
  }

  /**
   * Handle processing completion
   */
  public onProcessingComplete(result: ProcessingResult): void {
    this.processingResult = result;
    this.showResults = true;
  }

  /**
   * Start over
   */
  public startOver(): void {
    this.processingResult = null;
    this.showResults = false;
  }
}
