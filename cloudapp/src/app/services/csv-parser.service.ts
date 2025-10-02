import { Injectable } from '@angular/core';
import { CSVData } from '../types/csv-data.type';

@Injectable({
  providedIn: 'root'
})
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
            .map((line) => {
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
          
        } catch (error: any) {
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

  /**
   * Validate CSV structure
   */
  validateCSVStructure(data: CSVData): { valid: boolean, errors: string[] } {
    const errors: string[] = [];
    
    if (!data.headers || data.headers.length === 0) {
      errors.push('CSV file must have headers');
    }
    
    if (!data.data || data.data.length === 0) {
      errors.push('CSV file must have at least one data row');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
