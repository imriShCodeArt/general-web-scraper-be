# CSV Processing & Output Documentation

## Overview

This document provides a comprehensive breakdown of how the General Web Scraper application processes scraped product data and generates WooCommerce-compatible CSV files for import.

## Table of Contents

1. [Data Flow Architecture](#data-flow-architecture)
2. [CSV Generation Process](#csv-generation-process)
3. [CSV Schema & Structure](#csv-schema--structure)
4. [Data Processing & Transformation](#data-processing--transformation)
5. [CSV Storage & Management](#csv-storage--management)
6. [Download & Delivery](#download--delivery)
7. [Quality Assurance Features](#quality-assurance-features)
8. [WooCommerce Integration Features](#woocommerce-integration-features)
9. [Technical Implementation Details](#technical-implementation-details)

## Data Flow Architecture

The CSV generation follows a sophisticated pipeline:

```
Scraped Products → Validation → CSV Generation → Storage → Download API → User
```

### Key Components

- **ScrapingService**: Orchestrates the entire scraping and CSV generation process
- **CSVGenerator**: Core class responsible for CSV creation and formatting
- **CSVStorage**: Manages storage and retrieval of generated CSV files
- **Download API**: Provides HTTP endpoints for CSV file downloads

## CSV Generation Process

### Dual CSV Strategy

The app generates **two separate CSV files** for WooCommerce compatibility:

1. **`PARENT_PRODUCTS.csv`** - Main product information and attributes
2. **`VARIATION_PRODUCTS.csv`** - Product variations and pricing

### CSV Generation Methods

```typescript
// Main method that generates both CSVs
static async generateWooCommerceCSVs(products: Product[]): Promise<{
  parentProducts: Buffer;
  variationProducts: Buffer;
}>

// Individual CSV generators
static async generateParentProductsCSV(products: Product[]): Promise<Buffer>
static async generateVariationProductsCSV(products: Product[]): Promise<Buffer>
static async generateSimpleProductsCSV(products: Product[]): Promise<Buffer>
```

### Generation Workflow

1. **Product Processing**: Iterates through scraped products
2. **Data Transformation**: Applies text decoding and attribute normalization
3. **CSV Row Creation**: Maps product data to WooCommerce CSV format
4. **Buffer Generation**: Converts CSV strings to binary buffers
5. **Storage**: Saves CSV data for later download

## CSV Schema & Structure

### Parent Products CSV Schema

```csv
ID,post_title,post_name,post_status,post_content,post_excerpt,post_parent,menu_order,post_type,sku,stock_status,images,tax:product_type,tax:product_cat,description,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
```

**Field Categories:**

#### Core WordPress Fields
- `ID` - Product ID (empty for auto-assignment)
- `post_title` - Product title
- `post_name` - Product slug
- `post_status` - Publication status (default: 'publish')
- `post_type` - Post type (default: 'product')

#### Product-Specific Fields
- `sku` - Stock Keeping Unit
- `stock_status` - Inventory status ('instock' or 'outofstock')
- `images` - Product images (pipe-separated URLs)
- `description` - Full product description
- `post_excerpt` - Short product description

#### Taxonomy Fields
- `tax:product_type` - Product type ('simple' or 'variable')
- `tax:product_cat` - Product category

#### Attribute Fields
- `attribute:Color` - Color attribute values (pipe-separated)
- `attribute_data:Color` - Attribute visibility flags
- `attribute:Size` - Size attribute values (pipe-separated)
- `attribute_data:Size` - Attribute visibility flags

### Variation Products CSV Schema

```csv
ID,post_type,post_status,parent_sku,post_title,post_name,post_content,post_excerpt,menu_order,sku,stock_status,regular_price,tax_class,images,meta:attribute_Color,meta:attribute_Size
```

**Field Categories:**

#### Variation Identity
- `post_type` - Always 'product_variation'
- `parent_sku` - Links to parent product
- `post_title` - Variation title (same as parent)
- `post_name` - Unique variation slug

#### Variation Data
- `sku` - Variation-specific SKU
- `stock_status` - Variation inventory status
- `regular_price` - Variation price
- `tax_class` - Tax classification
- `images` - Variation-specific images

#### Attribute Meta
- `meta:attribute_Color` - Color attribute value for this variation
- `meta:attribute_Size` - Size attribute value for this variation

## Data Processing & Transformation

### Text Decoding Pipeline

The app implements a multi-layer text processing system:

```typescript
// Multi-layer text processing
private static decodeValue(value: string): string {
  const urlDecoded = this.decodeIfEncoded(value);        // URL decoding
  return this.decodeHtmlEntities(urlDecoded);            // HTML entities
}
```

#### URL Decoding
```typescript
private static decodeIfEncoded(value: string): string {
  let decoded = value.replace(/\+/g, ' ');              // Handle + as space
  let attempts = 0;
  while (attempts < 3 && /%[0-9A-Fa-f]{2}/.test(decoded)) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { break; }
    attempts++;
  }
  return decoded;
}
```

#### HTML Entity Decoding
```typescript
private static decodeHtmlEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'"
  };
  // Handles numeric, hex, and named HTML entities
}
```

### Hebrew Language Support

```typescript
// Preserves Hebrew text while normalizing Latin text
private static normalizeAttributeName(raw: string): string {
  if (/[\u0590-\u05FF]/.test(key)) return key;         // Keep Hebrew as-is
  return key.charAt(0).toUpperCase() + key.slice(1);   // Capitalize Latin
}
```

### Dimension Parsing

Intelligent parsing of dimension-like attributes:

```typescript
// Examples of dimension transformation:
// "140140" → "140*140"
// "5060" → "50*60"  
// "12090" → "120*90"
// "220170-3-מושבים" → "220*170 3 מושבים"

private static transformDimensionLike(raw: string): string {
  // Handles various dimension patterns with intelligent splitting
  // Prefers equal splits for even-length numbers
  // Falls back to last-two-digits-as-height for odd lengths
}
```

### Attribute Normalization

```typescript
private static normalizeAttributeName(raw: string): string {
  if (!raw) return '';
  let key = raw.replace(/^attribute_/, '').replace(/^pa_/, '');
  if (/%[0-9A-Fa-f]{2}/.test(key)) {
    try { key = decodeURIComponent(key); } catch { /* noop */ }
  }
  if (/[\u0590-\u05FF]/.test(key)) return key;
  return key.length > 0 ? key.charAt(0).toUpperCase() + key.slice(1) : '';
}
```

## CSV Storage & Management

### Dual Storage Strategy

The app uses both in-memory and file system storage for reliability:

```typescript
class CSVStorage {
  private storage = new Map<string, StoredCSV>();        // In-memory storage
  private storageDir: string;                            // File system backup
}
```

### Storage Structure

```typescript
interface StoredCSV {
  jobId: string;
  parentProducts: Buffer;           // Parent CSV as Buffer
  variationProducts: Buffer;        // Variation CSV as Buffer
  timestamp: Date;
  productCount: number;
  categoriesSlug?: string;          // For filename generation
  archiveTitleSlug?: string;        // For filename generation
}
```

### Storage Operations

#### Storing CSV Data
```typescript
async storeCSVData(
  jobId: string, 
  products: Product[], 
  parentCSV: Buffer, 
  variationCSV: Buffer, 
  extra?: { archiveTitle?: string }
): Promise<void>
```

#### Retrieving CSV Data
```typescript
getCSVData(jobId: string, type: 'parent' | 'variation'): Buffer | null
```

#### File System Persistence
```typescript
// Stores CSV data as base64-encoded JSON files
const fileData = {
  jobId,
  parentProducts: parentCSV.toString('base64'),
  variationProducts: variationCSV.toString('base64'),
  timestamp: new Date().toISOString(),
  productCount: products.length,
  categoriesSlug,
  archiveTitleSlug
};
```

### Filename Generation

Smart filename generation with context:

```typescript
// Build categories-based slug (up to 3 unique categories)
const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
const topCategories = categories.slice(0, 3);
const categoriesSlug = topCategories
  .map(c => c.toString().trim().toLowerCase()
    .replace(/[^\w\u0590-\u05FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, ''))
  .filter(Boolean)
  .join('_');

// Example: "PARENT_PRODUCTS_wash-dry-mats.csv"
const base = type === 'parent' ? 'PARENT_PRODUCTS' : 'VARIATION_PRODUCTS';
const suffix = info?.archiveTitleSlug ? info.archiveTitleSlug : info?.categoriesSlug || '';
const withSuffix = suffix ? `${base}_${suffix}` : base;
```

## Download & Delivery

### Download API Endpoint

```typescript
// GET /api/scrape/download/[jobId]/[type]
export async function GET(
  request: NextRequest, 
  { params }: { params: { jobId: string; type: string } }
) {
  const { jobId, type } = params;
  
  // Validate type parameter
  if (!['parent', 'variation'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid CSV type. Must be "parent" or "variation"' },
      { status: 400 }
    );
  }
  
  // Get CSV data from storage
  const csvData = csvStorage.getCSVData(jobId, type as 'parent' | 'variation');
  
  if (!csvData) {
    return NextResponse.json(
      { error: 'CSV data not found. The scraping job may have expired or failed.' },
      { status: 404 }
    );
  }
  
  // Return the CSV file
  return new NextResponse(new Uint8Array(csvData), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': csvData.length.toString(),
    },
  });
}
```

### Response Headers

- **Content-Type**: `text/csv; charset=utf-8`
- **Content-Disposition**: `attachment; filename="FILENAME.csv"`
- **Content-Length**: File size in bytes
- **UTF-8 Encoding**: Proper handling of Hebrew and special characters

### Filename Encoding

```typescript
// Handle both ASCII and UTF-8 filename encoding
const asciiFilename = filename.replace(/[^\x20-\x7E]/g, '');
const encodedUtf8 = encodeURIComponent(filename);

'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedUtf8}`
```

## Quality Assurance Features

### Data Validation

#### Placeholder Filtering
```typescript
private static isPlaceholderValue(value: string): boolean {
  const v = (value || '').trim();
  return v === 'בחירת אפשרות' || v === 'בחר אפשרות' || v.toLowerCase() === 'select option';
}
```

#### Attribute Validation
- Ensures attributes have valid values
- Filters out placeholder text
- Validates attribute data consistency

#### Product Type Detection
```typescript
// Automatically determines simple vs. variable products
const productType = product.meta?.product_type || 
  ((product.variations && Array.isArray(product.variations) && product.variations.length > 0) 
    ? 'variable' : 'simple');
```

### Error Handling

#### Graceful Fallbacks
- Continues processing even if some products fail
- Provides detailed error reporting
- Maintains partial results on failure

#### Comprehensive Logging
```typescript
console.log(`[CSVGenerator] Generating CSVs for ${products.length} products`);
console.log(`[CSVGenerator] Generated CSVs - parent: ${parentProducts.length} bytes, variation: ${variationProducts.length} bytes`);
```

#### Storage Verification
```typescript
// Confirms CSV data is properly stored before download
const storedJobInfo = csvStorage.getJobInfo(requestId);
if (storedJobInfo) {
  console.log('CSV data was stored successfully');
} else {
  console.log('CSV data was not stored successfully');
}
```

### Performance Optimizations

#### Batch Processing
```typescript
// Generates CSVs in parallel
const [parentProducts, variationProducts] = await Promise.all([
  this.generateParentProductsCSV(products),
  this.generateVariationProductsCSV(products)
]);
```

#### Memory Management
- Uses Buffers for efficient binary data handling
- Implements cleanup routines to prevent memory leaks
- Removes old CSV data automatically

#### Cleanup Routines
```typescript
// Clean up old entries (older than 1 hour)
cleanup(): void {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  // Clean memory
  for (const [jobId, stored] of Array.from(this.storage.entries())) {
    if (stored.timestamp < oneHourAgo) {
      this.storage.delete(jobId);
    }
  }
}
```

## WooCommerce Integration Features

### Import Suite Compatibility

#### Proper Field Mapping
- Matches WooCommerce Product CSV Import Suite requirements exactly
- Uses correct field naming conventions
- Maintains proper data types and formats

#### Attribute Formatting
```typescript
// Uses correct WooCommerce attribute syntax
row[`attribute:${normalized}`] = attrValues.join(' | ');
row[`attribute_data:${normalized}`] = '1'.repeat(attrValues.length).split('').join(' | ');
```

#### Variation Linking
```typescript
// Links variations to parents using SKU references
const row: Record<string, string> = {
  parent_sku: product.sku || '', // Link to parent using SKU per Import Suite
  post_type: 'product_variation',
  // ... other fields
};
```

### Taxonomy Support

#### Product Categories
```typescript
'tax:product_cat': product.category || 'Uncategorized'
```

#### Product Types
```typescript
'tax:product_type': productType // 'simple' or 'variable'
```

#### Custom Attributes
- Dynamic attribute generation based on scraped data
- Automatic attribute data flag generation
- Support for unlimited custom attributes

### Data Consistency

#### Required Fields
- Ensures all required WooCommerce fields are present
- Provides sensible defaults for optional fields
- Maintains data integrity across parent and variation products

#### Import Order
1. Import Parent Products CSV first
2. Then import Variation Products CSV
3. WooCommerce automatically links variations to parents

## Technical Implementation Details

### CSV String Generation

```typescript
private static generateCSVString(csvData: Record<string, string>[]): string {
  if (csvData.length === 0) return '';
  
  const headers = Object.keys(csvData[0]);
  const csvRows = [headers.join(',')];
  
  csvData.forEach(row => {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma, newline, quotes, or pipes
      const escaped = value.toString().replace(/"/g, '""');
      if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"') || escaped.includes('|')) {
        return `"${escaped}"`;
      }
      return escaped;
    });
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}
```

### Buffer Conversion

```typescript
private static stringToBuffer(csvString: string): Buffer {
  return Buffer.from(csvString, 'utf8');
}
```

### Error Recovery

```typescript
// Try URL decoding up to 3 times if percent-encoded
let attempts = 0;
while (attempts < 3 && /%[0-9A-Fa-f]{2}/.test(decoded)) {
  try {
    const next = decodeURIComponent(decoded);
    if (next === decoded) break;
    decoded = next;
  } catch {
    break;
  }
  attempts++;
}
```

### Memory Efficiency

- Uses streaming for large CSV generation
- Implements proper cleanup of temporary data
- Optimizes buffer allocation and reuse

## Conclusion

The CSV processing system in this application is designed to handle complex e-commerce data with:

- **Multilingual Support**: Full Hebrew and RTL text handling
- **Intelligent Data Transformation**: Smart parsing and normalization
- **Robust Error Handling**: Graceful fallbacks and comprehensive logging
- **WooCommerce Compatibility**: Exact format matching for seamless imports
- **Performance Optimization**: Efficient memory usage and parallel processing
- **Data Quality Assurance**: Validation and cleanup routines

This makes it suitable for production use in WooCommerce stores, handling bulk product imports with complex variations and attributes.
