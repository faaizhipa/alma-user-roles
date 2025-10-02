import { Injectable } from '@angular/core';
import { ColumnMapping } from '../types/csv-data.type';
import { ValidationResult } from '../types/processing-result.type';

@Injectable({
  providedIn: 'root'
})
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
  validateMapping(mappings: ColumnMapping[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
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
    
    // Check if no URL is mapped
    const hasUrl = mappings.some(m => m.mappedField === 'remoteUrl');
    if (!hasUrl) {
      warnings.push('No URL column mapped - files will not be attached');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Transform CSV data based on column mappings
   */
  transformData(data: any[], mappings: ColumnMapping[]): any[] {
    return data.map(row => {
      const transformed: any = {};
      
      mappings.forEach(mapping => {
        if (mapping.mappedField !== 'ignore') {
          transformed[mapping.mappedField] = row[mapping.csvHeader] || '';
        }
      });
      
      return transformed;
    });
  }
}
