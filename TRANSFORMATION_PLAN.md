# Cloud App Transformation Plan: User Roles → Esploro Research Assets

## Executive Summary

Transform the existing "Copy User Roles" CloudApp into an "Esploro Asset File Processor" that enables bulk processing of research asset files via CSV upload with intelligent column mapping. This transformation leverages the existing Angular architecture while replacing user role management with asset file processing capabilities.

---

## Table of Contents

1. [Conceptual Mapping](#conceptual-mapping)
2. [Architecture Transformation](#architecture-transformation)
3. [Implementation Roadmap](#implementation-roadmap)
4. [Detailed Component Changes](#detailed-component-changes)
5. [API Integration Changes](#api-integration-changes)
6. [Testing Strategy](#testing-strategy)
7. [Deployment Checklist](#deployment-checklist)

---

## 1. Conceptual Mapping

### Entity Transformation

| **Current (User Roles)** | **New (Research Assets)** |
|-------------------------|--------------------------|
| Source User (role donor) | CSV File Upload |
| Target User (role recipient) | Individual Research Asset (MMS ID) |
| User Role | Asset File Attachment |
| Role Properties (type, scope, parameters) | File Properties (URL, title, description, type) |
| Copy Roles Operation | Attach Files to Assets Operation |
| Compare Roles | Validate Assets & Report Status |
| Role Validation | Asset Existence & File URL Validation |

### Workflow Transformation

**Current Workflow:**
```
1. Select Target User (from Alma context)
2. Search for Source User
3. Display Source User's Roles
4. Select Roles to Copy
5. Validate Roles
6. Copy Selected Roles to Target User
7. Display Results
```

**New Workflow:**
```
1. Upload CSV File with Asset Data
2. Intelligent Column Mapping (MMS ID, URL, Title, Description, Type)
3. Validate CSV Data Structure
4. Process Each Asset (validate MMS ID, attach file)
5. Generate MMS ID List for Successful Assets
6. Display Processing Results
7. Provide Workflow Instructions (Create Set → Run Import Job)
```

---

## 2. Architecture Transformation

### File Structure Changes

**Files to MODIFY:**
```
manifest.json                           # Change entity from USER to RESEARCH_ASSET
package.json                           # Update app name and description
README.md                              # Rewrite for new functionality
cloudapp/src/app/app.module.ts        # Update component declarations
cloudapp/src/app/app-routing.module.ts # Update route configuration
cloudapp/src/i18n/en.json             # Complete translation overhaul
cloudapp/src/i18n/de.json             # Complete translation overhaul
```

**Files to REPLACE/REMOVE:**
```
components/find-user/                  # REPLACE with csv-upload/
components/role-select/                # REPLACE with column-mapping/
components/validation-dialog/          # ENHANCE for CSV validation
components/result/                     # ENHANCE for asset processing results
  - role-output.component.*           # REPLACE with file-status-output
```

**Files to ADD:**
```
components/csv-processor/              # NEW: CSV upload and parsing
  - csv-processor.component.ts
  - csv-processor.component.html
  - csv-processor.component.scss

components/column-mapper/              # NEW: Intelligent column mapping
  - column-mapper.component.ts
  - column-mapper.component.html
  - column-mapper.component.scss

components/workflow-instructions/      # NEW: Post-processing workflow
  - workflow-instructions.component.ts
  - workflow-instructions.component.html
  - workflow-instructions.component.scss

services/csv-parser.service.ts         # NEW: CSV parsing logic
services/asset.service.ts              # NEW: Asset API interactions
services/file-attachment.service.ts    # NEW: File processing
services/column-mapping.service.ts     # NEW: Intelligent mapping suggestions

types/asset.type.ts                    # NEW: Asset data structures
types/csv-data.type.ts                 # NEW: CSV data structures
types/processing-result.type.ts        # NEW: Processing results
```

**Files to KEEP (with modifications):**
```
services/arrayHelper.service.ts        # KEEP: Still useful for data manipulation
types/responseValue.type.ts            # KEEP: API response handling
components/loader/                     # KEEP: Loading states still needed
components/configuration/              # MODIFY: Admin settings for app config
```

---

## 3. Implementation Roadmap

### Phase 1: Foundation & Setup (Week 1)

**Tasks:**
1. ✅ Update manifest.json
   - Change entity to `RESEARCH_ASSET`
   - Update title, description
   - Add fullScreen capability
   - Update icon

2. ✅ Update package.json
   - Change app name
   - Update description
   - Verify dependencies

3. ✅ Create new type definitions
   - `asset.type.ts`
   - `csv-data.type.ts`
   - `processing-result.type.ts`
   - `column-mapping.type.ts`

4. ✅ Update internationalization files
   - Complete English translations
   - Complete German translations
   - Add new translation keys for CSV processing

**Deliverable:** Updated project configuration and type system

### Phase 2: Core Services (Week 1-2)

**Tasks:**
1. ✅ Create AssetService
   - API integration for Esploro assets
   - Asset validation (MMS ID existence)
   - Asset metadata retrieval

2. ✅ Create CSVParserService
   - RFC 4180 compliant CSV parsing
   - Encoding detection (UTF-8, etc.)
   - Error handling for malformed CSV

3. ✅ Create ColumnMappingService
   - Intelligent field detection algorithms
   - Confidence scoring
   - Mapping validation

4. ✅ Create FileAttachmentService
   - Remote URL file attachment
   - File metadata processing
   - Error handling and retry logic

5. ✅ Refactor ArrayHelperService
   - Adapt for asset data structures
   - Add CSV-specific utilities

**Deliverable:** Complete service layer for asset processing

### Phase 3: UI Components (Week 2-3)

**Tasks:**
1. ✅ Create CSVProcessorComponent
   - File upload (drag-drop + file picker)
   - File validation
   - CSV preview display

2. ✅ Create ColumnMapperComponent
   - Dynamic column mapping table
   - Dropdown field selectors
   - Confidence indicators
   - Real-time validation

3. ✅ Transform MainComponent
   - Tab interface (Manual Entry + CSV Upload)
   - State management for processing
   - Results display coordination

4. ✅ Update ResultComponent
   - Asset processing results
   - Success/failure statistics
   - Detailed error display
   - Download MMS ID CSV button

5. ✅ Create WorkflowInstructionsComponent
   - Step-by-step stepper
   - Esploro viewer URL generation
   - Copy-to-clipboard functionality
   - Deep links to Esploro functions

**Deliverable:** Complete UI for CSV processing workflow

### Phase 4: Integration & Processing Logic (Week 3)

**Tasks:**
1. ✅ Implement batch processing logic
   - Sequential asset processing
   - Progress tracking
   - Error recovery
   - API throttling management

2. ✅ Implement validation systems
   - MMS ID validation
   - URL validation
   - File type validation
   - Duplicate detection

3. ✅ Implement result generation
   - MMS ID CSV generation
   - Processing report generation
   - Error report generation

4. ✅ Implement workflow integration
   - Esploro URL construction
   - Set creation instructions
   - Import job guidance

**Deliverable:** Fully functional processing pipeline

### Phase 5: Testing & Refinement (Week 4)

**Tasks:**
1. ✅ Unit testing
   - Service layer tests
   - Component tests
   - Utility function tests

2. ✅ Integration testing
   - CSV parsing with various formats
   - API integration tests
   - Error scenario tests

3. ✅ User acceptance testing
   - End-to-end workflows
   - Edge case handling
   - Performance testing

4. ✅ Documentation
   - Update README
   - Create user guide
   - Document API integrations

**Deliverable:** Production-ready application

### Phase 6: Deployment & Support (Week 4-5)

**Tasks:**
1. ✅ Build and package
2. ✅ Deploy to test environment
3. ✅ Stakeholder review
4. ✅ Production deployment
5. ✅ User training
6. ✅ Monitor and support

**Deliverable:** Deployed application with support materials

---

## 4. Detailed Component Changes

### 4.1 Main Component Transformation

**Current Responsibilities:**
- Manage source/target user selection
- Handle role copying/comparing
- Display results

**New Responsibilities:**
- Provide tab interface (Manual Entry vs CSV Upload)
- Coordinate CSV processing workflow
- Manage processing state and results
- Display workflow instructions

**Key Changes:**

```typescript
// BEFORE (User Roles)
export class MainComponent {
  sourceUser: UserDetailsChecked | null = null;
  targetUser: UserDetails | null = null;
  selectedRoles: UserRole[] = [];
  replaceExistingRoles: boolean = false;
  copyResult: CopyResult | null = null;
  compareResult: CompareResult | null = null;
}

// AFTER (Asset Files)
export class MainComponent {
  csvData: CSVData | null = null;
  columnMapping: ColumnMapping[] = [];
  processedAssets: ProcessedAsset[] = [];
  processingProgress: number = 0;
  mmsIdDownloadUrl: string = '';
  showWorkflowInstructions: boolean = false;
  activeTab: 'manual' | 'csv' = 'manual';
}
```

### 4.2 Service Layer Transformation

#### Transform: UserService → AssetService

**Current (UserService):**
```typescript
- findUser(searchTerm: string): Observable<UserListResponse>
- getUser(userId: string): Observable<UserDetails>
- getUserEntity(): Observable<Entity>
```

**New (AssetService):**
```typescript
- validateAsset(mmsId: string): Observable<AssetValidation>
- getAssetMetadata(mmsId: string): Observable<AssetDetails>
- attachFileToAsset(mmsId: string, fileData: FileData): Observable<FileAttachment>
- getCurrentAssetContext(): Observable<Entity>
```

#### Transform: UserRolesService → FileProcessingService

**Current (UserRolesService):**
```typescript
- copy(sourceUser, selectedRoles, targetUser, replace): Observable<CopyResult>
- compare(sourceUser, targetUser): Observable<CompareResult>
- copyValidRoles(...): Observable<CopyResult>
- copyOneByOne(...): Observable<CopyResult>
```

**New (FileProcessingService):**
```typescript
- processBatch(assets: AssetData[]): Observable<ProcessingResult>
- processIndividual(asset: AssetData): Observable<ProcessedAsset>
- validateBatch(assets: AssetData[]): Observable<ValidationResult>
- generateMmsIdList(results: ProcessedAsset[]): string
```

#### New Services

**CSVParserService:**
```typescript
- parseFile(file: File): Promise<CSVData>
- validateCSVStructure(data: CSVData): ValidationResult
- detectEncoding(file: File): string
- parseCSVRow(row: string): string[]
```

**ColumnMappingService:**
```typescript
- suggestMapping(headers: string[], samples: any[]): ColumnMapping[]
- calculateConfidence(header: string, value: any): number
- validateMapping(mapping: ColumnMapping[]): ValidationResult
- transformData(data: any[], mapping: ColumnMapping[]): AssetData[]
```

**FileAttachmentService:**
```typescript
- attachRemoteFile(mmsId: string, url: string, metadata: FileMetadata): Observable<any>
- validateFileUrl(url: string): boolean
- getFileTypeFromExtension(filename: string): string
- processFileMetadata(asset: AssetData): FileMetadata
```

### 4.3 Type System Transformation

**Remove:**
```typescript
types/userRole.type.ts
types/userRoleParameter.type.ts
types/userRoleWithAvailability.type.ts
types/userDetails.type.ts
types/userDetailsChecked.ts
types/userBase.ts
types/userListResponse.type.ts
types/copyResult.type.ts
types/compareResult.type.ts
```

**Add:**
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

export type AssetValidation = {
  mmsId: string;
  exists: boolean;
  accessible: boolean;
  errorMessage?: string;
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

---

## 5. API Integration Changes

### 5.1 Current API Usage (Alma Users)

```typescript
// User search
GET /users?q={searchTerm}&order_by=last_name,first_name,primary_id

// Get user details
GET /users/{userId}

// User roles (embedded in user details)
user_role: UserRole[]
```

### 5.2 New API Usage (Esploro Assets)

**Asset Validation:**
```typescript
// Validate asset exists
GET /esploro/v1/assets/{mmsId}

Response:
{
  "mms_id": "99123456789",
  "title": "Research Output Title",
  "type": { "value": "JOURNAL_ARTICLE" },
  ...
}
```

**File Attachment:**
```typescript
// Attach remote file to asset
POST /esploro/v1/assets/{mmsId}/files

Request Body:
{
  "url": "https://example.com/file.pdf",
  "title": "Supplementary Material",
  "description": "Dataset for research study",
  "type": "PDF"
}

Response:
{
  "id": "file_12345",
  "status": "attached",
  ...
}
```

**Configuration API (File Types):**
```typescript
// Get file types from configuration
GET /almaws/v1/conf/mapping-tables/FileTypes

Response:
{
  "row": [
    {
      "column0": { "value": "PDF" },
      "column1": { "value": "Portable Document Format" }
    },
    ...
  ]
}
```

**Important Notes:**
- ✅ No API keys required (CloudApp handles authentication)
- ✅ Inherits logged-in user's permissions
- ✅ No API rate limits for CloudApp calls
- ⚠️ Must handle 404 (not found), 403 (forbidden) errors
- ⚠️ Implement retry logic for transient failures

### 5.3 API Call Patterns

**Sequential Processing with Progress:**
```typescript
async processBatch(assets: AssetData[]): Promise<ProcessingResult> {
  const results: ProcessedAsset[] = [];
  
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    
    try {
      // Validate asset exists
      await this.assetService.validateAsset(asset.mmsId);
      
      // Attach file if URL provided
      if (asset.remoteUrl) {
        await this.fileAttachmentService.attachRemoteFile(
          asset.mmsId,
          asset.remoteUrl,
          {
            title: asset.fileTitle || '',
            description: asset.fileDescription || '',
            type: asset.fileType || 'application/octet-stream'
          }
        );
      }
      
      asset.status = 'success';
    } catch (error) {
      asset.status = 'error';
      asset.errorMessage = error.message;
    }
    
    results.push(asset);
    this.updateProgress(i + 1, assets.length);
    
    // Delay to prevent overwhelming API
    await this.delay(100);
  }
  
  return this.generateProcessingResult(results);
}
```

---

## 6. Testing Strategy

### 6.1 Unit Tests

**Service Tests:**
```typescript
// csv-parser.service.spec.ts
describe('CSVParserService', () => {
  it('should parse valid CSV with headers', async () => {
    const csv = 'MMS ID,URL,Title\n123,http://example.com,Test';
    const result = await service.parseCSV(csv);
    expect(result.headers).toEqual(['MMS ID', 'URL', 'Title']);
    expect(result.data.length).toBe(1);
  });

  it('should handle quoted values with commas', async () => {
    const csv = 'MMS ID,Title\n123,"Title, with comma"';
    const result = await service.parseCSV(csv);
    expect(result.data[0]['Title']).toBe('Title, with comma');
  });

  it('should handle empty rows', async () => {
    const csv = 'MMS ID\n123\n\n456';
    const result = await service.parseCSV(csv);
    expect(result.data.length).toBe(2);
  });
});

// column-mapping.service.spec.ts
describe('ColumnMappingService', () => {
  it('should detect MMS ID column with high confidence', () => {
    const mapping = service.suggestMapping('mmsId', '99123456789');
    expect(mapping.field).toBe('mmsId');
    expect(mapping.confidence).toBeGreaterThan(0.8);
  });

  it('should detect URL column from content', () => {
    const mapping = service.suggestMapping('link', 'https://example.com');
    expect(mapping.field).toBe('remoteUrl');
  });
});

// asset.service.spec.ts
describe('AssetService', () => {
  it('should validate existing asset', async () => {
    const result = await service.validateAsset('99123456789');
    expect(result.exists).toBe(true);
  });

  it('should handle non-existent asset', async () => {
    const result = await service.validateAsset('invalid');
    expect(result.exists).toBe(false);
    expect(result.errorMessage).toContain('not found');
  });
});
```

### 6.2 Integration Tests

**End-to-End Workflow:**
```typescript
describe('CSV Processing Workflow', () => {
  it('should complete full processing workflow', async () => {
    // 1. Upload CSV
    const csvFile = createTestCSVFile();
    await component.onFileSelected(csvFile);
    
    // 2. Verify column mapping suggestions
    expect(component.columnMappingData.length).toBeGreaterThan(0);
    expect(component.columnMappingData[0].mappedField).toBe('mmsId');
    
    // 3. Process data
    await component.processMappedData();
    
    // 4. Verify results
    expect(component.processedAssets.length).toBeGreaterThan(0);
    expect(component.mmsIdDownloadUrl).toBeTruthy();
  });
});
```

### 6.3 Test Data

**Sample CSV Files:**
```csv
# valid-assets.csv
MMS ID,Remote URL,File Title,File Description,File Type
99123456789,https://example.com/file1.pdf,Research Data,Dataset for study,PDF
99987654321,https://example.com/file2.docx,Supplementary Material,Additional analysis,DOCX

# malformed.csv
MMS ID,"Title, with comma",URL
123,"Test, Value",http://example.com
"456,789",Another Test,invalid-url

# missing-mmsid.csv
URL,Title
https://example.com,File without MMS ID
```

---

## 7. Deployment Checklist

### Pre-Deployment

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] User acceptance testing completed
- [ ] Documentation updated
- [ ] Translation files complete (EN/DE)
- [ ] Build succeeds without warnings
- [ ] Performance testing completed
- [ ] Security review completed

### Deployment Steps

1. [ ] Build production bundle: `eca build`
2. [ ] Test in development environment
3. [ ] Deploy to test instance
4. [ ] Stakeholder review and approval
5. [ ] Deploy to production
6. [ ] Smoke testing in production
7. [ ] Monitor for errors

### Post-Deployment

- [ ] User training sessions scheduled
- [ ] Support documentation distributed
- [ ] Monitoring dashboards configured
- [ ] Feedback collection mechanism in place
- [ ] Backup and rollback plan verified

---

## 8. Risk Assessment & Mitigation

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| API rate limiting | Medium | High | Implement throttling, batch size limits |
| Large CSV files cause performance issues | High | Medium | File size limits (10MB), streaming parser |
| Malformed CSV data | High | Medium | Robust parsing with error recovery |
| Asset API changes | Low | High | Version checks, graceful degradation |
| Browser compatibility issues | Medium | Low | Angular 18+ requires modern browsers |

### Functional Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| User confusion with workflow | Medium | Medium | Clear instructions, workflow stepper |
| Incorrect column mapping | Medium | High | Confidence indicators, preview, validation |
| Processing failures not visible | Low | High | Detailed error reporting, logging |
| MMS IDs not found | High | Low | Clear error messages, validation before processing |

---

## 9. Success Metrics

### Quantitative Metrics

- **Processing Speed:** < 2 seconds per asset (including API calls)
- **Accuracy:** > 95% successful column mapping suggestions
- **Error Rate:** < 5% processing failures (for valid data)
- **File Size Limit:** Support up to 10MB CSV files
- **Concurrent Users:** Support 10+ simultaneous users

### Qualitative Metrics

- User satisfaction survey > 4/5
- Reduction in manual file attachment time > 80%
- User-reported bugs < 5 in first month
- Training time < 30 minutes per user

---

## 10. Maintenance & Support Plan

### Regular Maintenance

- **Weekly:** Monitor error logs, review processing statistics
- **Monthly:** Review user feedback, plan enhancements
- **Quarterly:** Dependency updates, security patches
- **Annually:** Major version review, architecture assessment

### Support Channels

1. **In-App Help:** Context-sensitive help text
2. **Documentation:** Comprehensive user guide
3. **Email Support:** Dedicated support email
4. **Training:** Quarterly refresher sessions

---

## Conclusion

This transformation plan provides a structured approach to converting the User Roles CloudApp into an Esploro Asset File Processor. The phased implementation ensures manageable development cycles while maintaining code quality and user experience.

**Estimated Timeline:** 4-5 weeks
**Team Size:** 1-2 developers
**Complexity:** Medium-High

The architecture leverages existing patterns while introducing modern CSV processing and intelligent column mapping capabilities, resulting in a powerful tool for bulk research asset management.
