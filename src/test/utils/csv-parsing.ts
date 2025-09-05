// Lightweight CSV parsing helpers tailored for our test CSV output

/**
 * CSV Parsing utilities for testing
 * Provides functions to parse CSV content into structured data for assertions
 */

export interface ParsedCsvRow {
  [key: string]: string;
}

export interface ParsedCsvData {
  headers: string[];
  rows: ParsedCsvRow[];
}

// Split a CSV line into fields, supporting quoted values with embedded commas
function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      // toggle quotes if next char isn't also a quote (escaped quote)
      const next = line[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);

  // Remove surrounding quotes from fields
  return fields.map(field => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1).replace(/""/g, '"');
    }
    return field;
  });
}

function parseCsvText(csvContent: string): { headers: string[]; rows: string[][] } {
  const lines = csvContent.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = splitCsvLine(lines[0]);
  const rows = lines.slice(1).map((l) => splitCsvLine(l));
  return { headers, rows };
}

/**
 * Parse a single CSV row into a key-value object
 * @param csvContent - The CSV content as a string
 * @param rowIndex - The index of the row to parse (0-based, excluding header)
 * @returns The parsed row as a key-value object
 */
export function parseCsvRow(csvContent: string, rowIndex: number = 0): ParsedCsvRow {
  const parsed = parseCsvRows(csvContent);
  if (rowIndex >= parsed.rows.length) {
    throw new Error(
      `Row index ${rowIndex} is out of bounds. CSV has ${parsed.rows.length} data rows.`,
    );
  }
  return parsed.rows[rowIndex];
}

/**
 * Parse CSV content into structured data
 * @param csvContent - The CSV content as a string
 * @returns Object containing headers and parsed rows
 */
export function parseCsvRows(csvContent: string): ParsedCsvData {
  if (!csvContent || csvContent.trim() === '') {
    return { headers: [], rows: [] };
  }

  try {
    const parsed = parseCsvText(csvContent);
    if (parsed.rows.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = parsed.headers;
    const rows: ParsedCsvRow[] = parsed.rows.map((cols) => {
      const row: ParsedCsvRow = {};
      for (let i = 0; i < headers.length; i++) {
        const cell = cols[i] ?? '';
        // Cells were often JSON.stringify-ed; try to parse back
        let value = cell;
        try {
          value = JSON.parse(cell);
        } catch {
          // leave as-is
        }
        row[headers[i]] = String(value ?? '');
      }
      return row;
    });

    return { headers, rows };
  } catch (error) {
    throw new Error(
      `Failed to parse CSV content: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Parse CSV content and return only the headers
 * @param csvContent - The CSV content as a string
 * @returns Array of header names
 */
export function parseCsvHeaders(csvContent: string): string[] {
  return parseCsvRows(csvContent).headers;
}

/**
 * Parse CSV content and return only the data rows (excluding headers)
 * @param csvContent - The CSV content as a string
 * @returns Array of parsed row objects
 */
export function parseCsvDataRows(csvContent: string): ParsedCsvRow[] {
  return parseCsvRows(csvContent).rows;
}

/**
 * Find a specific row in CSV data by matching a column value
 * @param csvContent - The CSV content as a string
 * @param columnName - The column name to search in
 * @param value - The value to match
 * @returns The first matching row, or undefined if not found
 */
export function findCsvRowByValue(
  csvContent: string,
  columnName: string,
  value: string,
): ParsedCsvRow | undefined {
  const rows = parseCsvDataRows(csvContent);
  return rows.find((row) => row[columnName] === value);
}

/**
 * Find multiple rows in CSV data by matching a column value
 * @param csvContent - The CSV content as a string
 * @param columnName - The column name to search in
 * @param value - The value to match
 * @returns Array of matching rows
 */
export function findCsvRowsByValue(
  csvContent: string,
  columnName: string,
  value: string,
): ParsedCsvRow[] {
  const rows = parseCsvDataRows(csvContent);
  return rows.filter((row) => row[columnName] === value);
}

/**
 * Get all unique values for a specific column
 * @param csvContent - The CSV content as a string
 * @param columnName - The column name to extract values from
 * @returns Array of unique values
 */
export function getCsvColumnValues(csvContent: string, columnName: string): string[] {
  const rows = parseCsvDataRows(csvContent);
  const values = rows.map((row) => row[columnName]).filter((value) => value !== '');
  return [...new Set(values)]; // Remove duplicates
}

/**
 * Count the number of rows in CSV data
 * @param csvContent - The CSV content as a string
 * @returns Number of data rows (excluding header)
 */
export function countCsvRows(csvContent: string): number {
  return parseCsvDataRows(csvContent).length;
}

/**
 * Check if CSV contains a specific column
 * @param csvContent - The CSV content as a string
 * @param columnName - The column name to check for
 * @returns True if column exists, false otherwise
 */
export function hasCsvColumn(csvContent: string, columnName: string): boolean {
  const headers = parseCsvHeaders(csvContent);
  return headers.includes(columnName);
}

/**
 * Check if CSV contains a specific value in any column
 * @param csvContent - The CSV content as a string
 * @param value - The value to search for
 * @returns True if value exists, false otherwise
 */
export function hasCsvValue(csvContent: string, value: string): boolean {
  const rows = parseCsvDataRows(csvContent);
  return rows.some((row) => Object.values(row).includes(value));
}

/**
 * Validate that CSV has expected columns
 * @param csvContent - The CSV content as a string
 * @param expectedColumns - Array of expected column names
 * @returns Object with validation result and missing columns
 */
export function validateCsvColumns(
  csvContent: string,
  expectedColumns: string[],
): {
  isValid: boolean;
  missingColumns: string[];
  extraColumns: string[];
} {
  const headers = parseCsvHeaders(csvContent);
  const missingColumns = expectedColumns.filter((col) => !headers.includes(col));
  const extraColumns = headers.filter((col) => !expectedColumns.includes(col));

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    extraColumns,
  };
}

/**
 * Extract attribute columns from parent CSV
 * @param csvContent - The CSV content as a string
 * @returns Object with attribute names and their corresponding data columns
 */
export function extractAttributeColumns(csvContent: string): {
  attributeColumns: string[];
  attributeDataColumns: string[];
  attributePairs: Array<{ attribute: string; data: string }>;
} {
  const headers = parseCsvHeaders(csvContent);
  const attributeColumns = headers.filter(
    (h) => h.startsWith('attribute:') && !h.includes('_data:'),
  );
  const attributeDataColumns = headers.filter((h) => h.startsWith('attribute_data:'));

  const attributePairs = attributeColumns.map((attr) => {
    const attrName = attr.replace('attribute:', '');
    const dataCol = `attribute_data:${attrName}`;
    return {
      attribute: attr,
      data: dataCol,
    };
  });

  return {
    attributeColumns,
    attributeDataColumns,
    attributePairs,
  };
}

/**
 * Extract meta attribute columns from variation CSV
 * @param csvContent - The CSV content as a string
 * @returns Array of meta attribute column names
 */
export function extractMetaAttributeColumns(csvContent: string): string[] {
  const headers = parseCsvHeaders(csvContent);
  return headers.filter((h) => h.startsWith('meta:attribute_'));
}

/**
 * Parse attribute data flags (position|visible|is_taxonomy|in_variations)
 * @param flags - The attribute data flags string
 * @returns Parsed flags object
 */
export function parseAttributeDataFlags(flags: string): {
  position: number;
  visible: number;
  isTaxonomy: number;
  inVariations: number;
} {
  const parts = flags.split('|');
  if (parts.length !== 4) {
    throw new Error(
      `Invalid attribute data flags format: ${flags}. Expected format: position|visible|is_taxonomy|in_variations`,
    );
  }

  return {
    position: parseInt(parts[0], 10),
    visible: parseInt(parts[1], 10),
    isTaxonomy: parseInt(parts[2], 10),
    inVariations: parseInt(parts[3], 10),
  };
}

/**
 * Parse attribute options (pipe-separated values)
 * @param options - The attribute options string
 * @returns Array of trimmed option values
 */
export function parseAttributeOptions(options: string): string[] {
  return options
    .split('|')
    .map((opt) => opt.trim())
    .filter((opt) => opt !== '');
}

/**
 * Create a CSV content validator for testing
 * @param csvContent - The CSV content to validate
 * @returns Validator object with various validation methods
 */
export function createCsvValidator(csvContent: string) {
  const data = parseCsvRows(csvContent);

  return {
    /**
     * Check if CSV has expected number of rows
     */
    hasRowCount: (expectedCount: number) => {
      const actualCount = data.rows.length;
      return {
        pass: actualCount === expectedCount,
        message: () => `Expected ${expectedCount} rows, but found ${actualCount}`,
      };
    },

    /**
     * Check if CSV has expected columns
     */
    hasColumns: (expectedColumns: string[]) => {
      const validation = validateCsvColumns(csvContent, expectedColumns);
      return {
        pass: validation.isValid,
        message: () =>
          `Missing columns: ${validation.missingColumns.join(', ')}. Extra columns: ${validation.extraColumns.join(', ')}`,
      };
    },

    /**
     * Check if a specific row exists
     */
    hasRow: (rowIndex: number) => {
      const exists = rowIndex >= 0 && rowIndex < data.rows.length;
      return {
        pass: exists,
        message: () => `Row ${rowIndex} does not exist. CSV has ${data.rows.length} rows.`,
      };
    },

    /**
     * Check if a specific value exists in a column
     */
    hasValueInColumn: (columnName: string, value: string) => {
      const hasValue = data.rows.some((row) => row[columnName] === value);
      return {
        pass: hasValue,
        message: () => `Value '${value}' not found in column '${columnName}'`,
      };
    },

    /**
     * Check if all rows have a specific column
     */
    allRowsHaveColumn: (columnName: string) => {
      const allHaveColumn = data.rows.every((row) => columnName in row);
      return {
        pass: allHaveColumn,
        message: () => `Not all rows have column '${columnName}'`,
      };
    },

    /**
     * Get the actual data for debugging
     */
    getData: () => data,
  };
}
