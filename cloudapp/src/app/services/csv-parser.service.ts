import { Injectable } from '@angular/core';
import { CSVData } from '../types/asset.types';

@Injectable({
  providedIn: 'root',
})
export class CSVParserService {
  /**
   * Parse a CSV file according to RFC 4180
   * @param file The CSV file to parse
   * @returns Promise with parsed CSV data
   */
  parseCSVFile(file: File): Promise<CSVData> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      if (file.size === 0) {
        reject(new Error('The uploaded file is empty'));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        reject(new Error('File size must be less than 10MB'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const csv = e.target?.result as string;
          const parsed = this.parseCSVString(csv);
          resolve(parsed);
        } catch (error: any) {
          reject(new Error(`Error parsing CSV: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read CSV file'));
      };

      reader.readAsText(file, 'UTF-8');
    });
  }

  /**
   * Parse CSV string into structured data
   * Handles quoted fields and escaped quotes per RFC 4180
   * @param csv The CSV string to parse
   * @returns Parsed CSV data
   */
  private parseCSVString(csv: string): CSVData {
    const lines = csv.split(/\r?\n/);
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse headers
    const headers = this.parseCSVLine(lines[0]);
    
    if (headers.length === 0) {
      throw new Error('CSV file has no headers');
    }

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        continue;
      }

      const values = this.parseCSVLine(line);
      
      // Skip lines that don't have enough data
      if (values.length === 0) {
        continue;
      }

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    if (data.length === 0) {
      throw new Error('CSV file has no data rows');
    }

    return { headers, data };
  }

  /**
   * Parse a single CSV line, handling quoted fields and escaped quotes
   * @param line The CSV line to parse
   * @returns Array of field values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
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

    // Add the last field
    result.push(current.trim());

    return result;
  }

  /**
   * Validate CSV structure
   * @param csvData The parsed CSV data
   * @returns Validation result
   */
  validateCSVStructure(csvData: CSVData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!csvData.headers || csvData.headers.length === 0) {
      errors.push('CSV must have headers');
    }

    if (!csvData.data || csvData.data.length === 0) {
      errors.push('CSV must have at least one data row');
    }

    // Check for empty header names
    const emptyHeaders = csvData.headers.filter((h) => !h || h.trim() === '');
    if (emptyHeaders.length > 0) {
      errors.push('CSV has empty header names');
    }

    // Check for duplicate headers
    const headerSet = new Set(csvData.headers);
    if (headerSet.size !== csvData.headers.length) {
      errors.push('CSV has duplicate header names');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
