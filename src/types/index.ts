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
};

export type ScrapingResult = {
  success: boolean;
  data?: {
    total_products: number;
    processed_archives: number;
    download_links: {
      parent: string;
      variation: string;
    };
  } | Product[];
  error?: string;
  total_archives: number;
  processed_archives: number;
};
