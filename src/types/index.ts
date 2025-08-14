export type Product = {
  url: string;
  title: string;
  slug: string;
  sku: string;
  stock_status: "instock" | "outofstock";
  images: string[];
  description: string;
  category: string;
  attributes: {
    Color?: string[];
    Size?: string[];
    [key: string]: string[] | undefined;
  };
  variations: Variation[];
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
  urls: string[];
  max_products_per_url: number;
  total_products: number;
  processed_products: number;
  created_at: Date;
  completed_at?: Date;
  error?: string;
  csv_downloads?: {
    parent_products: string;
    variation_products: string;
  };
};

export type TableRow = {
  url: string;
  images?: string;
  lastModified?: string;
};

export type ScrapingResult = {
  success: boolean;
  data?: Product[];
  error?: string;
  total_urls: number;
  processed_urls: number;
};
