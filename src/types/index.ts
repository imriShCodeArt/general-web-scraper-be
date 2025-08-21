export type Product = {
  url: string;
  title: string;
  slug: string;
  sku: string;
  stock_status: "instock" | "outofstock";
  images: string[];
  description: string;
  shortDescription: string;
  category: string;
  attributes: {
    Color?: string[];
    Size?: string[];
    [key: string]: string[] | undefined;
  };
  variations: Variation[];
  postName: string;
  regularPrice: string;
  salePrice: string;
  meta?: {
    product_type?: string;
    is_variable?: boolean;
    variation_count?: number;
    [key: string]: any;
  };
};

export type Variation = {
  parent_sku: string;
  sku: string;
  stock_status: string;
  regular_price: string;
  tax_class: string;
  images: string[];
  meta: {
    attribute_Color?: string;
    attribute_Size?: string;
    [key: string]: string | undefined;
  };
};

export type ScrapingJob = {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  archive_urls: string[];
  max_products_per_archive: number;
  total_products: number;
  processed_products: number;
  created_at: Date;
  completed_at?: Date;
  error?: string;
  csv_downloads?: {
    parent: string;
    variation: string;
  };
};

export type ArchivePage = {
  url: string;
  page_number: number;
  product_urls: string[];
  has_next_page: boolean;
  next_page_url?: string;
  category_title?: string;
};

export type ScrapingResult = {
  success: boolean;
  data: {
    total_products: number;
    processed_archives: number;
    products: Product[];
    download_links: {
      parent: string;
      variation: string;
    };
    validation?: ProductValidationReport;
  } | Product[];
  error?: string;
  total_archives: number;
  processed_archives: number;
};

// New types for enhanced progress tracking
export type DetailedProgress = {
  overall: number; // 0-100
  stage: 'initializing' | 'fetching_archives' | 'scraping_products' | 'generating_csv' | 'complete';
  currentArchive?: {
    url: string;
    index: number;
    total: number;
    progress: number;
  };
  currentProduct?: {
    url: string;
    index: number;
    total: number;
    title?: string;
  };
  archives: {
    total: number;
    processed: number;
    current: number;
  };
  products: {
    total: number;
    processed: number;
    current: number;
  };
  timeEstimate?: {
    remaining: number; // seconds
    elapsed: number; // seconds
    rate: number; // items per second
  };
  message: string;
};

export type AttributeEditProgress = {
  totalProducts: number;
  processedProducts: number;
  currentProduct?: {
    title: string;
    index: number;
    attributesCount: number;
  };
  message: string;
};

// Product validation types
export type ProductQualityIssue = {
  field: string;
  severity: 'error' | 'warn' | 'info';
  message: string;
};

export type ProductQualityEntry = {
  url: string;
  sku: string;
  title: string;
  score: number; // 0-100
  missingFields: string[];
  warnings: string[];
  issues: ProductQualityIssue[];
};

export type DuplicateGroup = {
  type: 'sku' | 'slug' | 'title';
  value: string;
  count: number;
  products: Array<{ url: string; sku: string; title: string }>;
};

export type ProductValidationReport = {
  totals: {
    numProducts: number;
    averageScore: number;
    highQuality: number; // >= 85
    mediumQuality: number; // 70-84
    lowQuality: number; // < 70
  };
  missingCounts: Record<string, number>;
  duplicates: DuplicateGroup[];
  perProduct: ProductQualityEntry[];
};

// WooCommerce import types
export type WooCommerceCredentials = {
  siteUrl: string;
  consumerKey: string;
  consumerSecret: string;
  verifySSL: boolean;
};

export type WooCommerceProduct = {
  id?: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable';
  status: 'publish' | 'draft' | 'pending';
  featured: boolean;
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden';
  description: string;
  short_description: string;
  sku: string;
  regular_price: string;
  sale_price?: string;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  tax_status: 'taxable' | 'shipping' | 'none';
  tax_class: string;
  manage_stock: boolean;
  stock_quantity?: number;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  backorders: 'no' | 'notify' | 'yes';
  backorders_allowed: boolean;
  backordered: boolean;
  sold_individually: boolean;
  weight: string;
  dimensions: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes: Array<{
    id: number;
    name: string;
    position: number;
    visible: boolean;
    variation: boolean;
    options: string[];
  }>;
  variations: number[];
  menu_order: number;
  meta_data: Array<{
    key: string;
    value: any;
  }>;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
};

export type ImportPreview = {
  newProducts: WooCommerceProduct[];
  existingProducts: Array<{
    existing: WooCommerceProduct;
    updated: WooCommerceProduct;
    changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
    }>;
  }>;
  skippedProducts: Array<{
    product: Product;
    reason: string;
  }>;
  summary: {
    total: number;
    new: number;
    updates: number;
    skipped: number;
  };
};

export type ImportProgress = {
  total: number;
  processed: number;
  current: number;
  stage: 'preparing' | 'importing' | 'updating' | 'complete';
  message: string;
  currentProduct?: {
    name: string;
    action: 'analyzing' | 'creating' | 'updating' | 'skipping';
  };
};

export type ImportResult = {
  success: boolean;
  imported: number;
  updated: number;
  skipped: number;
  errors: Array<{
    product: string;
    error: string;
  }>;
  summary: string;
};