# Web App Spec: Product-Sitemap Table Scraper to WooCommerce CSV

## 1. Overview

A web application that allows users to input one or more URLs of **HTML pages** containing a table with columns: `URL`, `Images`, `Last Mod.`. The system:

1. Parses these tables to extract all product page URLs.
2. Scrapes each product page for relevant data.
3. Generates **two WooCommerce Product CSV Import Suite-compatible files**:
   - `PARENT_PRODUCTS.csv`
   - `VARIATION_PRODUCTS.csv`

---

## 2. Tech Stack

- **Frontend:** Next.js (App Router) + TypeScript
- **Backend/API:** Next.js API Routes + Node.js workers
- **Scraping:**
  - Primary: Requests + Cheerio
  - Fallback: Playwright (for JS-rendered pages)
- **Queue:** BullMQ + Redis
- **Storage:** PostgreSQL (product metadata), S3-compatible storage (for CSVs)
- **CSV generation:** `fast-csv`
- **Logging:** pino + request IDs

---

## 3. User Flow

1. **User inputs URLs** of HTML table pages.
2. **Server validates** each URL.
3. **Scraper parses** table rows to collect product URLs.
4. **URLs are queued** for scraping.
5. **Workers scrape** product pages for metadata, images, attributes.
6. **Transform** scraped data to WooCommerce CSV format.
7. **Generate & serve** CSV download links to user.

---

## 4. Architecture

```
[Next.js UI] → [API: /scrape/init] → [Queue] → [Scraper Workers]
                                                  ↓
                                           [Product JSON Store]
                                                  ↓
                                          [CSV Generator Service]
                                                  ↓
                                               [S3/Download]
```

---

## 5. Data Model

### Product (Normalized JSON)

```ts
type Product = {
  url: string,
  title: string,
  slug: string,
  sku: string,
  stock_status: "instock" | "outofstock",
  images: string[],
  description: string,
  category: string,
  attributes: {
    Color?: string[],
    Size?: string[]
  },
  variations: Variation[]
}

type Variation = {
  parent_sku: string,
  sku: string,
  stock_status: string,
  regular_price: string,
  tax_class: string,
  images: string[],
  meta: {
    attribute_Color?: string,
    attribute_Size?: string
  }
}
```

---

## 6. API Routes

- `POST /scrape/init`
  - Body: `{ urls: string[] }`
  - Action: Validate + enqueue table URLs.
- `GET /scrape/status/:jobId`
  - Returns progress % and queued/completed counts.
- `GET /scrape/download/:jobId`
  - Returns CSV download links.

---

## 7. Scraper Pipeline

**Table Page Scraper:**

```ts
function parseTablePage(html: string): string[] {
  const $ = cheerio.load(html);
  const urls: string[] = [];
  $("table tr").each((_, row) => {
    const urlCell = $(row).find("td").first();
    const href = urlCell.find("a").attr("href") || urlCell.text();
    if (href) urls.push(new URL(href, baseUrl).toString());
  });
  return urls;
}
```

**Product Page Scraper:**

- Extract:
  - Title, slug, SKU, images
  - Stock status
  - Description
  - Category (breadcrumb)
  - Attributes (Color, Size)
  - Variations (SKU, price, stock, image)

---

## 8. CSV Schema

### PARENT\_PRODUCTS.csv

```
post_title,post_name,post_status,sku,stock_status,images,tax:product_type,tax:product_cat,attribute:Color,attribute_data:Color,attribute:Size,attribute_data:Size
Tea Shirt,tea-shirt,publish,TEA-OG,instock,https://woocommerce.com/wp-content/uploads/2022/03/variation-t-shirt.webp,variable,Tshirts,"Red | Blue | Green | Yellow","1|1|1","S | M | L","2|1|1"
```

### VARIATION\_PRODUCTS.csv

```
parent_sku,sku,stock_status,regular_price,tax_class,images,meta:attribute_Color,meta:attribute_Size
TEA-OG,TEA-OG-YLW-S,instock,19.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-yellow.jpg,Yellow,S
TEA-OG,TEA-OG-YLW-M,instock,29.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-yellow.jpg,Yellow,M
TEA-OG,TEA-OG-YLW-L,instock,19.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-yellow.jpg,Yellow,L
TEA-OG,TEA-OG-GRN-S,instock,15.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-green.jpg,Green,S
TEA-OG,TEA-OG-BLU-M,instock,16.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-blue.jpg,Blue,M
TEA-OG,TEA-OG-RED-L,instock,17.99,parent,https://woocommerce.com/wp-content/uploads/2022/03/variable-t-shirt-red.jpg,Red,L
```

---

## 9. Edge Cases

- Missing images → leave empty, log warning
- Missing prices → skip variation row
- No variations → mark as `simple` product
- Duplicate SKUs → append random suffix or skip
- Large datasets → stream CSV instead of buffering

---

## 10. Test Plan

- Unit tests for:
  - Table parsing
  - Product scraping (mock HTML)
  - Attribute parsing
- Integration tests:
  - End-to-end scrape from synthetic table + product pages
  - CSV generation and WooCommerce import validation

---

## 11. Deployment

- Deploy on Vercel (UI/API) + Railway/Render (Workers/Redis)
- Store CSVs in S3 bucket
- Add simple auth for job management

---

## 12. Improvements (Post-MVP)

1. Custom attribute mapping in UI
2. Proxy rotation for blocked domains
3. Scheduled scraping for periodic updates

