import { Component, DestroyRef, OnInit } from '@angular/core';
import {
  AlertService,
  CloudAppEventsService,
  CloudAppRestService,
  PageInfo,
} from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProcessedAsset } from '../../types/asset.type';
import { FileType } from '../../types/file-metadata.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  private destroy$ = new Subject<void>();

  // Component state
  fileTypes: FileType[] = [];
  processedAssets: ProcessedAsset[] = [];
  mmsIdDownloadUrl: string = '';
  showResults = false;
  showWorkflowInstructions = false;

  // Page info for entity context
  pageInfo: PageInfo | null = null;
  entities: string[] = [];

  public constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private translate: TranslateService,
    private destroyRef: DestroyRef
  ) {}

  public ngOnInit(): void {
    // Subscribe to page load events
    this.eventsService.onPageLoad(this.onPageLoad);
    
    // Load file types from Ex Libris Configuration API
    this.loadFileTypes();
  }

  private onPageLoad = (pageInfo: PageInfo) => {
    this.pageInfo = pageInfo;
    this.entities = pageInfo.entities.map(entity => entity.id);
  }

  /**
   * Load file types from Ex Libris Configuration API
   * No API key needed - CloudApp handles authentication
   */
  private loadFileTypes() {
    this.restService.call('/almaws/v1/conf/mapping-tables/FileTypes')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          if (response && response.row) {
            this.fileTypes = response.row.map((row: any) => ({
              code: row.column0?.value || '',
              description: row.column1?.value || row.column0?.value || ''
            })).filter((type: FileType) => type.code);
          }
          
          // Fallback to defaults if API fails
          if (this.fileTypes.length === 0) {
            this.fileTypes = this.getDefaultFileTypes();
          }
        },
        error: (error) => {
          console.warn('Could not load file types from API:', error);
          this.fileTypes = this.getDefaultFileTypes();
        }
      });
  }

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
      { code: 'ZIP', description: 'ZIP Archive' }
    ];
  }

  onBatchProcessed(assets: ProcessedAsset[]) {
    this.processedAssets = assets;
    this.showResults = true;
  }

  onDownloadReady(downloadUrl: string) {
    this.mmsIdDownloadUrl = downloadUrl;
    this.showWorkflowInstructions = true;
  }
}
