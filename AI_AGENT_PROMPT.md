# AI Agent Implementation Prompt: Esploro Asset File Processor

## Mission Statement

Transform the existing "Copy User Roles" CloudApp into a fully functional "Esploro Asset File Processor" CloudApp that enables librarians and researchers to bulk attach files to research assets via CSV upload with intelligent column mapping.

---

## Project Context

You are working with an **Ex Libris CloudApp** built using:
- **Angular 18.2.x** framework
- **Angular Material** UI components
- **Ex Libris CloudApp Angular Library** (@exlibris/exl-cloudapp-angular-lib)
- **RxJS 7.x** for reactive programming
- **TypeScript** with strict typing

The app currently manages user roles in Alma but needs to be completely transformed to process research asset files in Esploro.

---

## Core Requirements

### 1. Entity Change: USER → RESEARCH_ASSET

**What You Must Do:**
- Update `manifest.json` to target `RESEARCH_ASSET` entities instead of `USER`
- The app will now work within the Esploro research asset context
- No API keys are needed (CloudApp handles authentication automatically)

**manifest.json Changes:**
```json
{
  "id": "esploro-asset-file-processor",
  "title": "Esploro Asset File Processor",
  "subtitle": "Bulk attach files to research assets via CSV upload",
  "author": "Your Institution",
  "description": "Process individual asset files or upload CSV for bulk file attachment to Esploro research assets",
  "entities": ["RESEARCH_ASSET"],
  "fullScreen": {
    "allow": true
  },
  "pages": {
    "main": {
      "load": "index.html#/main"
    },
    "config": {
      "load": "index.html#/config"
    }
  }
}
```

### 2. Primary Workflow

**User Journey:**
```
1. User uploads CSV file with asset data (MMS ID, File URL, metadata)
2. App intelligently suggests column mappings (MMS ID, URL, Title, Description, Type)
3. User reviews/adjusts mappings
4. App validates CSV structure
5. App processes each asset:
   a. Validates MMS ID exists in Esploro
   b. Attaches remote file via URL
   c. Adds file metadata
6. App displays results (success/failure per asset)
7. App generates MMS ID list (CSV) for successful assets
8. App provides workflow instructions:
   - Download MMS ID CSV
   - Create asset set in Esploro
   - Run "Import Research Assets Files" job
   - Access files via Esploro viewer
```

### 3. Key Features to Implement

#### Feature A: CSV Upload with Drag-Drop
- Accept .csv files (max 10MB)
- Drag-and-drop interface
- File validation (format, size, encoding)
- Parse CSV following RFC 4180 standard
- Handle quoted values, commas in fields, empty rows

#### Feature B: Intelligent Column Mapping
- Auto-detect MMS ID columns (patterns: "mms", "id", "asset")
- Auto-detect URL columns (patterns: "url", "link", "href" or http content)
- Auto-detect Title columns (patterns: "title", "name", "filename")
- Auto-detect Description columns (patterns: "desc", "description", "summary")
- Auto-detect File Type columns (patterns: "type", "format", "extension")
- Show confidence score for each suggestion (0.0 - 1.0)
- Allow manual mapping override
- Visual indicators for high-confidence mappings

#### Feature C: Data Validation
- **Required:** At least one column mapped to MMS ID
- **Check:** No duplicate mappings (except "ignore")
- **Validate:** MMS IDs exist in Esploro before processing
- **Validate:** URLs are well-formed
- **Preview:** Show sample data during mapping

#### Feature D: Batch Processing
- Sequential processing (avoid overwhelming API)
- Progress bar with current/total count
- Display currently processing asset
- Handle errors gracefully (continue processing remaining assets)
- Small delay between API calls (100ms) to prevent throttling

#### Feature E: Results Display
- Summary statistics (success count, error count)
- Detailed results table:
  - Status icon (success/error)
  - MMS ID
  - File Title
  - Error message (if failed)
- Download button for MMS ID CSV (successful assets only)

#### Feature F: Workflow Instructions
- Step-by-step stepper component (Material Stepper)
- **Step 1:** Download MMS ID CSV file
- **Step 2:** Create asset set in Esploro (with deep links)
- **Step 3:** Run Import job (with deep links)
- **Step 4:** Access files via Esploro viewer URLs
- Copy-to-clipboard for URLs
- Generate Esploro viewer URLs: `https://{server}/esploro/outputs/{mmsId}/filesAndLinks?institution={code}`

---

## Technical Implementation Guide

### Phase 1: Core Type System

**Create these type definition files:**

```typescript
// types/asset.type.ts
export type AssetData = {
  mmsId: string;
  remoteUrl?: string;
  fileTitle?: string;
  fileDescription?: string;
  fileType?: string;
};

export type ProcessedAsset = AssetData & {
  status: 'success' | 'error' | 'pending';
  errorMessage?: string;
  processingTime?: number;
};

// types/csv-data.type.ts
export type CSVData = {
  headers: string[];
  data: any[];
  rowCount: number;
  fileName: string;
};

export type ColumnMapping = {
  csvHeader: string;
  sampleValue: string;
  mappedField: 'mmsId' | 'remoteUrl' | 'fileTitle' | 'fileDescription' | 'fileType' | 'ignore';
  confidence: number;
};

// types/processing-result.type.ts
export type ProcessingResult = {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  processedAssets: ProcessedAsset[];
  mmsIdList: string[];
  processingTime: number;
};

export type ValidationResult = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};

// types/file-metadata.type.ts
export type FileMetadata = {
  title: string;
  description: string;
  type: string;
  url: string;
};

export type FileType = {
  code: string;
  description: string;
};
```

### Phase 2: Service Layer

**Create AssetService** (`services/asset.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { CloudAppRestService } from '@exlibris/exl-cloudapp-angular-lib';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AssetService {
  constructor(private restService: CloudAppRestService) {}

  /**
   * Validate that an asset exists in Esploro
   * No API key needed - CloudApp handles auth
   */
  validateAsset(mmsId: string): Observable<boolean> {
    return this.restService.call(`/esploro/v1/assets/${mmsId}`).pipe(
      map(response => true),
      catchError(error => {
        if (error.status === 404) {
          throw new Error(`Asset ${mmsId} not found`);
        } else if (error.status === 403) {
          throw new Error(`Access denied for asset ${mmsId}`);
        }
        throw error;
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
}
```

**Create CSVParserService** (`services/csv-parser.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { CSVData } from '../types/csv-data.type';

@Injectable({ providedIn: 'root' })
export class CSVParserService {
  
  /**
   * Parse CSV file following RFC 4180 standard
   * Handles quoted values, commas in fields, various encodings
   */
  parseFile(file: File): Promise<CSVData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const lines = csv.split(/\r?\n/);
          
          if (lines.length === 0) {
            throw new Error('Empty file');
          }
          
          // Parse headers
          const headers = this.parseCSVRow(lines[0]);
          
          if (headers.length === 0) {
            throw new Error('No headers found');
          }
          
          // Parse data rows
          const data = lines.slice(1)
            .filter(line => line.trim())
            .map((line, index) => {
              const values = this.parseCSVRow(line);
              const row: any = {};
              
              headers.forEach((header, headerIndex) => {
                row[header] = values[headerIndex] || '';
              });
              
              return row;
            })
            .filter(row => Object.keys(row).length > 0);
          
          resolve({
            headers,
            data,
            rowCount: data.length,
            fileName: file.name
          });
          
        } catch (error) {
          reject(new Error(`Failed to parse CSV: ${error.message}`));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Parse a single CSV row, handling quoted values and embedded commas
   */
  private parseCSVRow(row: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < row.length) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current.trim());
    return result;
  }
}
```

**Create ColumnMappingService** (`services/column-mapping.service.ts`):
```typescript
import { Injectable } from '@angular/core';
import { ColumnMapping } from '../types/csv-data.type';

@Injectable({ providedIn: 'root' })
export class ColumnMappingService {
  
  /**
   * Suggest field mappings based on column headers and sample data
   */
  suggestMapping(headers: string[], sampleData: any[]): ColumnMapping[] {
    return headers.map(header => {
      const sampleValue = sampleData[0] ? sampleData[0][header] : '';
      const mapping = this.detectFieldType(header, sampleValue);
      
      return {
        csvHeader: header,
        sampleValue: sampleValue || '',
        mappedField: mapping.field,
        confidence: mapping.confidence
      };
    });
  }

  /**
   * Intelligent field detection based on header name and sample value
   */
  private detectFieldType(header: string, sampleValue: string): 
    { field: ColumnMapping['mappedField'], confidence: number } {
    
    const lowerHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');
    const lowerSample = (sampleValue || '').toLowerCase();
    
    // MMS ID detection (highest priority)
    if (this.matchesAny(lowerHeader, ['mms', 'mmsid', 'id', 'assetid', 'recordid'])) {
      return { field: 'mmsId', confidence: 0.9 };
    }
    
    // URL detection
    if (this.matchesAny(lowerHeader, ['url', 'link', 'href', 'uri', 'remoteurl']) ||
        lowerSample.includes('http')) {
      return { field: 'remoteUrl', confidence: 0.8 };
    }
    
    // Title detection
    if (this.matchesAny(lowerHeader, ['title', 'name', 'filename', 'filetitle'])) {
      return { field: 'fileTitle', confidence: 0.8 };
    }
    
    // Description detection
    if (this.matchesAny(lowerHeader, ['desc', 'description', 'summary', 'abstract'])) {
      return { field: 'fileDescription', confidence: 0.7 };
    }
    
    // File type detection
    if (this.matchesAny(lowerHeader, ['type', 'format', 'extension', 'filetype', 'mimetype'])) {
      return { field: 'fileType', confidence: 0.8 };
    }
    
    return { field: 'ignore', confidence: 0.1 };
  }

  private matchesAny(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => text.includes(pattern));
  }

  /**
   * Validate column mapping configuration
   */
  validateMapping(mappings: ColumnMapping[]): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    // Check for required MMS ID field
    const hasMmsId = mappings.some(m => m.mappedField === 'mmsId');
    if (!hasMmsId) {
      errors.push('At least one column must be mapped to MMS ID');
    }
    
    // Check for duplicate mappings
    const fieldCounts = new Map<string, number>();
    mappings.forEach(m => {
      if (m.mappedField !== 'ignore') {
        const count = fieldCounts.get(m.mappedField) || 0;
        fieldCounts.set(m.mappedField, count + 1);
      }
    });
    
    fieldCounts.forEach((count, field) => {
      if (count > 1) {
        errors.push(`Field "${field}" is mapped multiple times`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
```

### Phase 3: Main Component

**Transform MainComponent** (`components/main/main.component.ts`):
```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CloudAppRestService, CloudAppEventsService, CloudAppAlertService, PageInfo } from '@exlibris/exl-cloudapp-angular-lib';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProcessedAsset } from '../../types/asset.type';
import { FileType } from '../../types/file-metadata.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Component state
  fileTypes: FileType[] = [];
  processedAssets: ProcessedAsset[] = [];
  mmsIdDownloadUrl: string = '';
  showResults = false;
  showWorkflowInstructions = false;

  // Page info for entity context
  pageInfo: PageInfo;
  entities: string[] = [];

  constructor(
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alertService: CloudAppAlertService,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    // Subscribe to page load events
    this.eventsService.onPageLoad(this.onPageLoad);
    
    // Load file types from Ex Libris Configuration API
    this.loadFileTypes();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
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
      { code: 'XLSX', description: 'Microsoft Excel Spreadsheet (OpenXML)' }
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
```

**Main Component Template** (`components/main/main.component.html`):
```html
<div class="main-content">
  <div class="page-header">
    <h1>{{ 'Main.Title' | translate }}</h1>
    <p>{{ 'Main.Description' | translate }}</p>
  </div>

  <!-- CSV Upload Section -->
  <app-csv-processor
    [fileTypes]="fileTypes"
    (batchProcessed)="onBatchProcessed($event)"
    (downloadReady)="onDownloadReady($event)">
  </app-csv-processor>

  <!-- Results Section -->
  <div *ngIf="showResults" class="results-section">
    <app-processing-results
      [processedData]="processedAssets"
      [downloadUrl]="mmsIdDownloadUrl"
      [showInstructions]="showWorkflowInstructions">
    </app-processing-results>
  </div>
</div>
```

### Phase 4: CSV Processor Component

**This is the MAIN component for CSV upload and processing.**

Create `components/csv-processor/csv-processor.component.ts` following the detailed implementation in the reference documentation provided. Key responsibilities:

1. **File Upload:**
   - Drag-and-drop interface
   - File picker button
   - Validate file type (.csv only)
   - Validate file size (max 10MB)

2. **CSV Parsing:**
   - Use CSVParserService
   - Handle various CSV formats
   - Display row count

3. **Column Mapping:**
   - Display mapping table with:
     - CSV header name
     - Sample value
     - Dropdown for field mapping
     - Confidence indicator
   - Use ColumnMappingService for suggestions
   - Validate mapping before processing

4. **Batch Processing:**
   - Validate each MMS ID exists
   - Attach files sequentially
   - Show progress bar
   - Handle errors gracefully
   - Generate MMS ID download file

### Phase 5: Results Component

Transform `components/result/result.component.ts` to display:

1. **Summary Statistics:**
   - Total processed
   - Success count (with icon)
   - Error count (with icon)

2. **Detailed Results Table:**
   - Material Table with columns:
     - Status (icon)
     - MMS ID (code format)
     - File Title
     - Error Message (if failed)

3. **Workflow Instructions:**
   - Material Stepper with 4 steps:
     1. Download MMS ID CSV
     2. Create Asset Set in Esploro
     3. Run Import Job
     4. Access Files (with Esploro viewer URLs)
   - Deep links to Esploro functions
   - Copy-to-clipboard buttons

### Phase 6: Translations

**Update `i18n/en.json`:**
```json
{
  "Main": {
    "Title": "Esploro Asset File Processor",
    "Description": "Bulk attach files to research assets via CSV upload"
  },
  "CSV": {
    "Upload": {
      "Title": "Upload CSV File",
      "Subtitle": "Bulk process asset files from CSV data",
      "DragDrop": "Drag and drop your CSV file here",
      "SelectFile": "Select CSV File"
    },
    "Mapping": {
      "Title": "Map CSV Columns",
      "Subtitle": "Associate your CSV columns with the required fields",
      "CSVHeader": "CSV Column Header",
      "SampleValue": "Sample Value",
      "MapToField": "Map to Field",
      "IgnoreColumn": "Ignore Column"
    },
    "Actions": {
      "ProcessData": "Process Data",
      "UploadDifferent": "Upload Different File"
    }
  },
  "Fields": {
    "MmsId": {
      "Description": "Esploro asset identifier (required)"
    },
    "RemoteUrl": {
      "Description": "Direct URL to file content"
    },
    "FileTitle": {
      "Description": "Display name for the file"
    }
  },
  "Validation": {
    "MmsIdRequired": "At least one column must be mapped to MMS ID",
    "DuplicateMappings": "Duplicate mappings found for: {{fields}}"
  },
  "Results": {
    "Title": "Processing Results",
    "Successful": "Successful",
    "Failed": "Failed"
  },
  "Errors": {
    "InvalidFileType": "Please select a CSV file",
    "FileTooLarge": "File size must be less than 10MB",
    "EmptyFile": "The uploaded file is empty"
  }
}
```

---

## Critical Implementation Notes

### 1. Authentication & API Calls

**✅ DO THIS:**
```typescript
// CloudApp handles auth automatically
this.restService.call('/esploro/v1/assets/99123456789').subscribe(...)

// OR with full request object
this.restService.call({
  url: '/esploro/v1/assets/99123456789/files',
  method: 'POST',
  requestBody: { ... }
}).subscribe(...)
```

**❌ DON'T DO THIS:**
```typescript
// NO API keys needed!
// NO manual authorization headers!
// NO httpClient.get() - use restService instead
```

### 2. Error Handling

**Always handle these errors:**
- **404 Not Found:** Asset MMS ID doesn't exist
- **403 Forbidden:** User lacks permissions
- **400 Bad Request:** Invalid file data
- **409 Conflict:** File already exists

### 3. CSV Parsing

**Handle these cases:**
- Quoted values with commas: `"Title, with comma"`
- Escaped quotes: `"Title with ""quotes"""`
- Empty rows
- Various encodings (UTF-8, UTF-16)
- Different line endings (\n, \r\n)

### 4. Performance

**Implement these optimizations:**
- Limit file size to 10MB
- Process assets sequentially (not parallel)
- Add 100ms delay between API calls
- Use progress indicators
- Cancel processing on destroy

### 5. User Experience

**Provide these features:**
- Loading states during processing
- Clear error messages
- Confidence indicators for column mapping
- Preview of sample data
- Undo/retry capabilities
- Download results

---

## Testing Checklist

Before considering the implementation complete, verify:

- [ ] CSV file upload works (drag-drop + file picker)
- [ ] CSV parsing handles quoted values, commas, empty rows
- [ ] Column mapping suggests correct fields with confidence scores
- [ ] Validation prevents processing without MMS ID mapping
- [ ] Validation detects duplicate mappings
- [ ] Asset validation API calls work correctly
- [ ] File attachment API calls work correctly
- [ ] Progress bar updates during processing
- [ ] Error messages display for failed assets
- [ ] Success/error statistics are accurate
- [ ] MMS ID download file generates correctly
- [ ] Workflow instructions display with correct deep links
- [ ] Esploro viewer URLs generate correctly
- [ ] Copy-to-clipboard functionality works
- [ ] All translations are complete (EN/DE)
- [ ] Loading states show appropriately
- [ ] No console errors

---

## Success Criteria

The implementation is successful when:

1. ✅ A user can upload a CSV file with asset data
2. ✅ Column mappings are intelligently suggested
3. ✅ User can review and adjust mappings
4. ✅ Processing validates assets and attaches files
5. ✅ Results clearly show success/failure per asset
6. ✅ User can download MMS ID list
7. ✅ Workflow instructions guide user through Esploro steps
8. ✅ Error handling is robust and informative
9. ✅ Performance is acceptable (< 2 sec per asset)
10. ✅ UI is intuitive and follows Material Design patterns

---

## Reference Resources

**Read these files for context:**
- `explanation.md` - Current codebase architecture
- `README.md` - Current functionality
- `TRANSFORMATION_PLAN.md` - Detailed transformation plan
- Ex Libris CloudApp documentation
- Angular Material documentation
- RxJS documentation

**Key APIs:**
- Esploro Assets: `/esploro/v1/assets/{mmsId}`
- File Attachment: `/esploro/v1/assets/{mmsId}/files`
- Configuration: `/almaws/v1/conf/mapping-tables/FileTypes`

**Remember:**
- CloudApp authentication is automatic (no API keys)
- Use `CloudAppRestService` for all API calls
- Follow Angular and Material best practices
- Leverage existing patterns from current codebase
- Maintain type safety with TypeScript

---

## Final Notes

This transformation changes the app from a user role management tool to a research asset file processing tool. The core architectural patterns remain (services, components, types), but the domain logic is completely different.

Focus on:
1. **Robust CSV parsing** - Handle edge cases
2. **Intelligent mapping** - Make users' lives easier
3. **Clear feedback** - Users need to know what's happening
4. **Error recovery** - Don't fail the entire batch for one error
5. **Workflow guidance** - Help users complete the full process

Good luck! Build something that librarians and researchers will love to use. 🚀
