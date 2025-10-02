# Esploro Asset File Processor# Copy User Roles



A CloudApp for Ex Libris Esploro that enables bulk attachment of files to research assets via CSV upload with intelligent column mapping.<img align="right" src="./cloudapp/src/assets/app-icon.png" width="100" style="border-radius: 3px">



## FeaturesAn [ExLibris Alma CloudApp](https://developers.exlibrisgroup.com/cloudapps/), which allows to copy user roles from one user to another and also to compare the applied roles of two users.



- **CSV Upload**: Drag-and-drop or file selection for CSV data containing asset information<br>

- **Intelligent Column Mapping**: Automatic detection of column types with confidence scoring<br>

- **Batch Processing**: Sequential processing of multiple assets with progress tracking

- **Error Handling**: Per-asset error tracking without failing entire batch## How to use

- **Esploro Integration**: Complete workflow integration with Advanced Search, Asset Sets, and Import Jobs

- **Multilingual Support**: Full English and German translationsIn order to use the CloudApp, one of the following roles is needed:



## Installation- 'User Manager'

- 'User Administrator'

1. Download the latest release from the [releases page](https://github.com/your-repo/releases)- 'General System Administrator'

2. In Esploro, navigate to Admin > Manage Apps

3. Click "Upload" and select the downloaded `.zip` fileTo copy roles from one user to another perform the following steps:

4. Enable the app for your institution

1. Install the 'Copy User Roles' CloudApp (see: [ExLibris documentation on using CloudApps](<https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/050Administration/050Configuring_General_Alma_Functions/Configuring_Cloud_Apps#Using_Cloud_Apps>))

## Usage2. Open the user record in Alma which is to receive new roles

3. Open the 'Copy User Roles' CloudApp

### 1. Prepare Your CSV File4. The current user record is selected as target user

5. In the CloudApp, search for the user from whom the roles are to be copied

Create a CSV file with the following structure:6. Select the user form the list

7. Click the 'Copy user roles' button

```csv

MMS ID,Remote URL,File Title,File Description,File Type## Configuration

991234567890123,https://example.com/file1.pdf,Research Paper,Primary research findings,application/pdf

991234567890124,https://example.com/file2.docx,Supplemental Data,Additional data tables,application/vnd.openxmlformats-officedocument.wordprocessingml.documentThe app some institution-wide configuration options, configuration can be set by a user with any of the 'administrator' roles, i.e. 'General System Administrator' or 'Catalog Administrator' (see [ExLibris Documentation](https://developers.exlibrisgroup.com/cloudapps/docs/api/configuration-service/)).

```

To open the configuration, click the 'three dots menu' an then the configuration icon:

**Required Field:**

- **MMS ID**: The Esploro asset identifier (required)<img src="doc/img/open-configuration.jpg" width=400><br><br><br>



**Optional Fields:**### Restrict/manage access

- **Remote URL**: Direct URL to the file content to be attached

- **File Title**: Display name for the fileThere is a possibility to manage the access to the CloudApp. If no configuration regarding access control is made, no additional restrictions will apply.

- **File Description**: Detailed description of the file

- **File Type**: MIME type or file format (e.g., `application/pdf`, `image/jpeg`)**General note**



**File Requirements:**The following should be noted: The access management in the app only prevents or allows access to the user interface. Access to the API can only be restricted by ExLibris. According to ExLibris, only interfaces to which the logged-in user has access can be used via CloudApp:

- CSV format with comma separation

- First row must contain column headers> The user must have permissions to perform the action implemented by the API, and any history actions are logged under the user's identity. If the Cloud App attempts to call an API which performs an action for which the logged-in user does not have the proper role, Alma will return a 401 Unauthorized to the Cloud App.

- UTF-8 encoding recommended

- Maximum file size: 10MBSee [ExLibris documentation](https://developers.exlibrisgroup.com/cloudapps/docs/api/rest-service/)

- Maximum records: Unlimited (processed sequentially)

**Allow by user**

### 2. Upload CSV in the CloudApp

If a user is added to the list of allowed users, access is granted regardless of the users roles.

1. Open any asset record in Esploro

2. Click the CloudApp icon in the right panel- To add a user, search for the user in the according search field, and click on the user you want to add

3. Select "Esploro Asset File Processor"- To remove a user select the user in the list and click the 'trash bin' icon

4. Drag and drop your CSV file or click "Select CSV File"- After any configuration change, click the 'save' button to save the settings



### 3. Map CSV Columns<img src="doc/img/add-user.jpg" width=400><br><br><br>



The app will automatically suggest mappings based on:**Allow by role**

- Column header names

- Sample data patternsTo use the app, the role of 'User Manager', 'User Administrator' or 'General System Administrator' is needed. However, this configuration allows to further restrict to a smaller set of allowed roles. Please note, that as soon as a user is added to the list of allowed users it is not possible to restrict access by role.

- Confidence scoring

<img src="doc/img/allow-by-role.jpg" width=400><br><br><br>

Review and adjust mappings:

- Each CSV column shows a sample value### Check role scope

- Use the dropdown to assign field types

- Select "Ignore Column" for unused columnsThis option prevents users with the User Manager role, scoped to a specific library, from copying roles which are scoped to another library. This option does **not** affect users with the 'General Administrator' role or the 'User Administrator' role. For further information see the following documents: [Alma Release Notes 11/2024](https://knowledge.exlibrisgroup.com/Alma/Release_Notes/2024/Alma_2024_Release_Notes?mon=202411BASE#:~:text=Enhanced%20Library%2DSpecific%20Role%20Management%20for%20User%20Management%20in%20Alma%20UI) and [User Manager role documentation](<https://knowledge.exlibrisgroup.com/Alma/Product_Documentation/010Alma_Online_Help_(English)/050Administration/030User_Management/060Managing_User_Roles?mt-draft=true#user_manager>)

- Ensure at least one column is mapped to "MMS ID"

<img src="doc/img/check-role-scope.jpg" width=400><br><br><br>

**Confidence Indicators:**

- ✅ Green checkmark: High confidence mapping (90%+)## Select which roles should be copied

- System displays confidence when auto-detecting fields

By default all roles assigned to the source user are copied to the target user.

### 4. Process Data

<img src="doc/img/selected-roles-01.jpg" width=400><br><br><br>

1. Click "Process Data" to begin batch processing

2. Monitor progress bar showing current asset being processedIf only some roles should be copied, there is the possibility to select a custom set of roles:

3. Wait for completion (processing includes throttling to avoid API limits)

<img src="doc/img/selected-roles-02.jpg" width=400><br><br><br>

### 5. Review Results

Please note, that the selection has no effect when using the 'Compare' function.

The results page displays:

- **Summary**: Count of successful and failed operations## Copying roles from users with invalid roles

- **Detailed Results Table**: Status, MMS ID, File Title, and Error Messages

- **Next Steps Instructions**: Complete workflow guide- When selecting the source user the roles will be validated, if not all roles are valid there will be a dialog with the error message from Alma, which should help to find the role which is not correctly configured

- The dialog offers the possibility to proceed anyway: in this case, the valid roles will be copied and the invalid roles will be skipped.

### 6. Complete the Esploro Workflow- The copy process with invalid roles **takes significantly longer** than with only valid roles

- After copying, a short summary about the valid and invalid roles is displayed

#### Step 1: Download MMS ID CSV

- Click "Download MMS ID CSV" to get a file with successful asset identifiers<img src="doc/img/results-copy.jpg" width=400><br><br><br>

- File contains only successfully processed assets

## Comparing roles of two users

#### Step 2: Create Asset Set in Esploro

1. Navigate to **Search & Browse > Advanced Search**- Especially after copying from users with invalid roles, it can be helpful to compare the roles of the two users

2. Click **"Upload file with identifiers"**- It seems to be possible, that a user has duplicate roles. The copy process reduces the duplicates, which results sometimes in different role numbers between the source user and the target user after copying. This can be verified by comparing the two users

3. Upload the downloaded CSV file

4. Select **"MMS ID"** as the identifier type<img src="doc/img/results-compare.jpg" width=400><br><br><br>

5. Click **"Create Set"** and provide a meaningful name

### Development

#### Step 3: Run Import Asset Files Job

1. Go to **Repository > Monitor Jobs > Run a Job**[Notes on CloudApp development](doc/development.md)

2. Find and select **"Import Research Assets Files"**
3. Choose the asset set created in Step 2
4. Configure job parameters (validation, update policy, etc.)
5. Submit the job and monitor progress

#### Step 4: Access Processed Files
- Once the job completes, files will be attached to the assets
- Access files via the Esploro Viewer URLs shown in the results
- Files appear in the asset's "Files" section

## Architecture

### Components

- **MainComponent**: Root component coordinating the workflow
- **CSVProcessorComponent**: Handles file upload, mapping, and validation
- **ProcessingResultsComponent**: Displays results and workflow instructions
- **ConfigurationComponent**: App-level configuration settings
- **LoaderComponent**: Loading state display

### Services

- **AssetService**: Esploro API integration (validate assets, attach files)
- **CSVParserService**: RFC 4180 compliant CSV parsing with encoding detection
- **ColumnMappingService**: Intelligent field detection with confidence scoring
- **FileProcessingService**: Batch orchestration with error recovery

### Data Flow

```
CSV Upload → Parse → Column Mapping → Validation → Batch Processing → Results → Esploro Workflow
```

## Technical Details

### API Integration

The app uses the ExLibris CloudApp framework which provides:
- Automatic authentication (no API keys required)
- Context-aware API access
- Secure data handling

**Esploro APIs Used:**
- `GET /esploro/v1/assets/{mmsId}` - Validate asset existence
- `POST /esploro/v1/assets/{mmsId}/files` - Attach file to asset
- `GET /almaws/v1/conf/mapping-tables/FileTypes` - Load valid file types

### Error Handling

The app implements comprehensive error handling:
- **File Validation**: Type, size, encoding checks
- **CSV Parsing**: Handles quoted values, embedded commas, escaped quotes
- **Asset Validation**: Checks existence and accessibility
- **Batch Processing**: Per-asset error tracking without failing entire batch
- **API Errors**: Graceful handling of 404 (not found), 403 (access denied), etc.

### Throttling

Sequential processing with delays prevents API throttling:
- 500ms delay between asset operations
- Progress tracking for user feedback
- Graceful handling of rate limits

## Development

### Prerequisites

- Node.js 18+
- Angular CLI 18+
- @exlibris/exl-cloudapp-angular-lib 2.0.2

### Setup

```bash
npm install
```

### Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
```

Build artifacts will be in the `dist/` directory.

### Deployment

```bash
npm run deploy
```

Creates a production-ready `.zip` file for upload to Esploro.

## Configuration

The app supports institution-level configuration via the Configuration component:
- Custom settings stored per institution
- Accessible via the configuration icon in the app header

## Support

For issues, questions, or feature requests:
- Open an issue on [GitHub](https://github.com/your-repo/issues)
- Contact: your-email@example.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

Built with the Ex Libris CloudApp framework for seamless integration with Esploro.

## Version History

### 2.0.0 (Current)
- Complete rewrite: Transformed from "Copy User Roles" to "Esploro Asset File Processor"
- CSV upload with intelligent column mapping
- Batch file attachment to research assets
- Comprehensive error handling and progress tracking
- Complete Esploro workflow integration

### 1.x
- Original "Copy User Roles" functionality (deprecated)
