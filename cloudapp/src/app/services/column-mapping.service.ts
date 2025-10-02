import { Injectable } from '@angular/core';
import { ColumnMapping } from '../types/asset.types';

@Injectable({
  providedIn: 'root',
})
export class ColumnMappingService {
  /**
   * Available field types for mapping
   */
  readonly FIELD_TYPES = {
    MMS_ID: 'mmsId',
    REMOTE_URL: 'remoteUrl',
    FILE_TITLE: 'fileTitle',
    FILE_DESCRIPTION: 'fileDescription',
    FILE_TYPE: 'fileType',
    IGNORE: 'ignore',
  };

  /**
   * Suggest column mappings based on header names and sample data
   * @param headers CSV column headers
   * @param sampleData First few rows of data for analysis
   * @returns Array of suggested column mappings with confidence scores
   */
  suggestColumnMappings(headers: string[], sampleData: any[]): ColumnMapping[] {
    return headers.map((header) => {
      const lowerHeader = header.toLowerCase().trim();
      const sampleValue = sampleData.length > 0 ? sampleData[0][header] || '' : '';

      let mappedField = this.FIELD_TYPES.IGNORE;
      let confidence = 0.1;

      // MMS ID detection
      if (this.isMmsIdColumn(lowerHeader, sampleValue)) {
        mappedField = this.FIELD_TYPES.MMS_ID;
        confidence = 0.95;
      }
      // URL detection
      else if (this.isUrlColumn(lowerHeader, sampleValue)) {
        mappedField = this.FIELD_TYPES.REMOTE_URL;
        confidence = 0.9;
      }
      // Title detection
      else if (this.isTitleColumn(lowerHeader)) {
        mappedField = this.FIELD_TYPES.FILE_TITLE;
        confidence = 0.85;
      }
      // Description detection
      else if (this.isDescriptionColumn(lowerHeader)) {
        mappedField = this.FIELD_TYPES.FILE_DESCRIPTION;
        confidence = 0.8;
      }
      // File type detection
      else if (this.isFileTypeColumn(lowerHeader, sampleValue)) {
        mappedField = this.FIELD_TYPES.FILE_TYPE;
        confidence = 0.85;
      }

      return {
        csvHeader: header,
        sampleValue: sampleValue.toString().substring(0, 100), // Limit sample value length
        mappedField,
        confidence,
      };
    });
  }

  /**
   * Detect if column is MMS ID
   */
  private isMmsIdColumn(header: string, sampleValue: string): boolean {
    const mmsIdPatterns = ['mms', 'mmsid', 'mms_id', 'id', 'identifier', 'asset_id', 'assetid'];
    
    // Check header
    const headerMatch = mmsIdPatterns.some((pattern) => header.includes(pattern));
    
    // Check if sample value looks like an MMS ID (numeric, 18-19 digits)
    const valueMatch = /^\d{10,19}$/.test(sampleValue.trim());
    
    return headerMatch || valueMatch;
  }

  /**
   * Detect if column is URL
   */
  private isUrlColumn(header: string, sampleValue: string): boolean {
    const urlPatterns = ['url', 'link', 'uri', 'href', 'remote', 'file_url', 'fileurl'];
    
    // Check header
    const headerMatch = urlPatterns.some((pattern) => header.includes(pattern));
    
    // Check if sample value looks like a URL
    const valueMatch = /^https?:\/\//i.test(sampleValue.trim());
    
    return headerMatch || valueMatch;
  }

  /**
   * Detect if column is title
   */
  private isTitleColumn(header: string): boolean {
    const titlePatterns = ['title', 'name', 'filename', 'file_name', 'label'];
    return titlePatterns.some((pattern) => header.includes(pattern));
  }

  /**
   * Detect if column is description
   */
  private isDescriptionColumn(header: string): boolean {
    const descPatterns = ['description', 'desc', 'details', 'notes', 'comment'];
    return descPatterns.some((pattern) => header.includes(pattern));
  }

  /**
   * Detect if column is file type
   */
  private isFileTypeColumn(header: string, sampleValue: string): boolean {
    const typePatterns = ['type', 'format', 'extension', 'mime', 'mimetype', 'mime_type'];
    
    // Check header
    const headerMatch = typePatterns.some((pattern) => header.includes(pattern));
    
    // Check if sample value looks like a file type
    const valueMatch = /^[A-Z]{2,5}$/i.test(sampleValue.trim()) || 
                       /^[a-z]+\/[a-z\-\+]+$/i.test(sampleValue.trim());
    
    return headerMatch || valueMatch;
  }

  /**
   * Validate column mappings
   * @param mappings The column mappings to validate
   * @returns Validation result with errors
   */
  validateMappings(mappings: ColumnMapping[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check that at least one MMS ID column is mapped
    const mmsIdMappings = mappings.filter((m) => m.mappedField === this.FIELD_TYPES.MMS_ID);
    if (mmsIdMappings.length === 0) {
      errors.push('At least one column must be mapped to MMS ID');
    }

    // Check for duplicate mappings (except 'ignore')
    const mappedFields = mappings
      .filter((m) => m.mappedField !== this.FIELD_TYPES.IGNORE)
      .map((m) => m.mappedField);
    
    const fieldCounts = new Map<string, number>();
    mappedFields.forEach((field) => {
      fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
    });

    const duplicates: string[] = [];
    fieldCounts.forEach((count, field) => {
      if (count > 1) {
        duplicates.push(field);
      }
    });

    if (duplicates.length > 0) {
      errors.push(`Duplicate mappings found for: ${duplicates.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply mappings to CSV data
   * @param data CSV data rows
   * @param mappings Column mappings
   * @returns Array of mapped asset data
   */
  applyMappings(data: any[], mappings: ColumnMapping[]): any[] {
    return data.map((row) => {
      const mappedRow: any = {};

      mappings.forEach((mapping) => {
        if (mapping.mappedField !== this.FIELD_TYPES.IGNORE) {
          const value = row[mapping.csvHeader];
          mappedRow[mapping.mappedField] = value ? value.toString().trim() : '';
        }
      });

      return mappedRow;
    });
  }
}
