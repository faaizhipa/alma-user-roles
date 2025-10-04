# Esploro Asset File Processor

<img align="right" src="./cloudapp/src/assets/app-icon.png" width="100" style="border-radius: 3px">

An [ExLibris Esploro CloudApp](https://developers.exlibrisgroup.com/cloudapps/) for batch uploading files to research assets via CSV import. This app streamlines the process of attaching files to multiple Esploro research assets by allowing you to upload metadata via CSV, intelligently map columns to asset fields, and process files in bulk.

<br>
<br>

## Features

- **CSV Upload**: Drag-and-drop or select CSV files with asset metadata
- **Intelligent Column Mapping**: Automatic detection and suggestion of field mappings
- **Batch Processing**: Process multiple assets efficiently with progress tracking
- **Comprehensive Results**: Detailed success/failure reporting with error messages
- **Workflow Integration**: Step-by-step instructions for completing the Esploro workflow
- **MMS ID Export**: Download CSV of successfully processed asset IDs for set creation

## How to Use

### Step 1: Prepare Your CSV File

Create a CSV file with the following columns (minimum requirement: MMS ID):

- **MMS ID** (required): Esploro asset identifier
- **Remote URL**: Direct URL to file content
- **File Title**: Display name for the file
- **File Description**: Detailed file description
- **File Type**: File format or MIME type (e.g., PDF, DOCX)

Example CSV:
```csv
MMS ID,Remote URL,File Title,File Description,File Type
991234567890123456,https://example.com/file1.pdf,Research Paper,Main research findings,PDF
991234567890123457,https://example.com/file2.docx,Supplementary Data,Additional data tables,DOCX
```

### Step 2: Upload and Process

1. Install the 'Esploro Asset File Processor' CloudApp (see: [ExLibris documentation on using CloudApps](<https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/050Administration/050Configuring_General_Alma_Functions/Configuring_Cloud_Apps#Using_Cloud_Apps>))
2. Navigate to any Esploro research asset record
3. Open the 'Esploro Asset File Processor' CloudApp
4. Upload your CSV file by dragging and dropping or clicking "Select File"
5. Review and adjust the automatic column mappings
6. Click "Process Data" to begin batch processing
7. Monitor the progress as assets are processed

### Step 3: Complete the Workflow

After processing completes:

1. **Download MMS ID File**: Download the CSV containing successfully processed asset IDs
2. **Create Asset Set**: Use the downloaded file to create a set in Esploro:
   - Navigate to Search & Browse > Advanced Search
   - Click "Upload file with identifiers"
   - Upload the CSV and select "MMS ID" as identifier type
   - Create the set with a meaningful name
3. **Run Import Job**: Execute the "Import Research Assets Files" job:
   - Go to Repository > Monitor Jobs > Run a Job
   - Select "Import Research Assets Files"
   - Choose your created set
   - Configure and submit the job
4. **Access Files**: Once complete, access your files via the Esploro viewer URLs provided

## CSV File Requirements

### Format Specifications

- **File Format**: CSV (Comma-Separated Values)
- **Separator**: Comma (,)
- **Encoding**: UTF-8 recommended
- **File Size**: Maximum 10MB
- **Headers**: First row must contain column headers

### Required Fields

- **MMS ID**: At least one column must be mapped to MMS ID (Esploro asset identifier)

### Optional Fields

- **Remote URL**: Direct HTTP/HTTPS URL to the file content
- **File Title**: Display name for the file in Esploro
- **File Description**: Detailed description of the file
- **File Type**: File format code (e.g., PDF, DOCX, XLSX)

### Column Mapping Intelligence

The app automatically suggests column mappings based on:
- Column header names (e.g., "mms_id", "url", "title")
- Sample data patterns (e.g., numeric IDs, HTTP URLs)
- Confidence scores indicate mapping reliability

## Processing Behavior

### Validation

- Each asset's MMS ID is validated before file processing
- Invalid MMS IDs or inaccessible assets are reported as errors
- Processing continues for remaining assets even if some fail

### Error Handling

The app provides detailed error messages for:
- Asset not found (404)
- Access denied (401/403)
- Invalid file data (400)
- File conflicts (409)
- Network or API errors

### Results

After processing, the app displays:
- Summary statistics (successful vs. failed)
- Detailed table of all processed assets
- Error messages for failed assets
- Download link for MMS ID CSV (successful assets only)
- Esploro viewer URLs for accessing files

## Permissions and Security

**Authentication**: The CloudApp uses the logged-in user's credentials automatically. No API keys are required.

**Required Permissions**: Users must have appropriate Esploro permissions to:
- Access research asset records
- Attach files to assets
- Run repository jobs

**API Access**: According to ExLibris:

> The user must have permissions to perform the action implemented by the API, and any history actions are logged under the user's identity. If the Cloud App attempts to call an API which performs an action for which the logged-in user does not have the proper role, Alma will return a 401 Unauthorized to the Cloud App.

See [ExLibris documentation](https://developers.exlibrisgroup.com/cloudapps/docs/api/rest-service/)

## Troubleshooting

### Common Issues

**Issue**: CSV upload fails with "Invalid file type"
- **Solution**: Ensure the file has a .csv extension and is in CSV format

**Issue**: "At least one column must be mapped to MMS ID" error
- **Solution**: Verify that at least one column in your CSV is mapped to the "MMS ID" field

**Issue**: Asset processing fails with "Asset not found"
- **Solution**: Verify the MMS ID exists in Esploro and is accessible to your user account

**Issue**: File type not appearing in dropdown
- **Solution**: The app loads file types from the system. If not available, you can enter the file type code manually

### Best Practices

1. **Test with Small Batches**: Start with a small CSV (5-10 rows) to verify your data format
2. **Validate MMS IDs**: Ensure all MMS IDs are valid and accessible before processing
3. **Use Complete URLs**: File URLs should be complete and accessible (HTTP/HTTPS)
4. **Keep Files Organized**: Use meaningful file titles and descriptions for easier management
5. **Monitor Job Progress**: Check the Import Asset Files job status in Esploro after processing

## Technical Details

### Architecture

The CloudApp is built with:
- **Angular 18+**: Modern web framework
- **ExLibris CloudApp Framework**: Integration with Esploro platform
- **Material Design**: UI components following ExLibris style guide
- **RxJS**: Reactive programming for async operations

### Services

- **AssetService**: Esploro API integration and file processing
- **CSVParserService**: RFC 4180 compliant CSV parsing
- **ColumnMappingService**: Intelligent field mapping with confidence scoring
- **FileProcessingService**: Batch orchestration and progress tracking

### API Integration

- **Esploro Assets API**: Asset validation and file attachment
- **Configuration API**: File type retrieval
- **CloudApp REST Service**: Automatic authentication and error handling

## Support and Contribution

### Reporting Issues

If you encounter issues or have suggestions:
1. Check the troubleshooting section above
2. Review existing issues in the repository
3. Create a new issue with detailed information:
   - Steps to reproduce
   - Expected vs actual behavior
   - CSV file structure (sample data)
   - Error messages or screenshots

### Development

For development setup and contribution guidelines, see [Notes on CloudApp development](doc/development.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Changelog

### Version 2.0.0 (Current)

- Complete transformation from User Roles manager to Esploro Asset File Processor
- CSV upload with drag-and-drop support
- Intelligent column mapping with confidence scoring
- Batch processing with progress tracking
- Comprehensive results and error reporting
- Integrated Esploro workflow instructions
- MMS ID CSV export for set creation
- Bilingual support (English/German)

### Version 1.4.0 (Previous - User Roles)

- User role copying and comparison functionality
- Role scope checking
- Configuration management
- See git history for detailed changes
