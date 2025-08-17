import * as cheerio from 'cheerio';
import { Product, Variation } from '@/types';

export class TableScraper {
  /**
   * Parse table page and extract product URLs
   */
  static parseTablePage(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const urls: string[] = [];
    
    // Look for table rows with links
    const rows = $('tr');
    rows.each((_, row) => {
      const $row = $(row);
      const link = $row.find('a[href]').first();
      if (link.length > 0) {
        const href = link.attr('href');
        if (href) {
          // Convert relative URLs to absolute
          const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
          urls.push(absoluteUrl);
        }
      }
    });
    
    return urls;
  }
  
  /**
   * Parse table rows and extract additional data
   */
  static parseTableRows(html: string, baseUrl: string): Array<{url: string, images: string, lastModified: string}> {
    const $ = cheerio.load(html);
    const rows: Array<{url: string, images: string, lastModified: string}> = [];
    
    // Look for table rows
    const tableRows = $('tr');
    tableRows.each((_, row) => {
      const $row = $(row);
      const cells = $row.find('td');
      
      if (cells.length >= 3) {
        const link = cells.eq(0).find('a[href]').first();
        const image = cells.eq(1).find('img').first();
        const date = cells.eq(2);
        
        if (link.length > 0) {
          const href = link.attr('href');
          if (href) {
            const absoluteUrl = href.startsWith('http') ? href : new URL(href, baseUrl).href;
            const imageSrc = image.length > 0 ? image.attr('src') || '' : '';
            const lastModified = date.length > 0 ? date.text().trim() : '';
            
            rows.push({
              url: absoluteUrl,
              images: imageSrc,
              lastModified
            });
          }
        }
      }
    });
    
    return rows;
  }
}

export class ProductScraper {
  /**
   * Get product type (simple, variable, grouped, external)
   */
  private static getProductType($: cheerio.CheerioAPI): string {
    // Check body classes for product type
    const body = $('body');
    if (body.length > 0) {
      const bodyClasses = body.attr('class') || '';
      
      if (bodyClasses.includes('product-type-variable')) {
        return 'variable';
      } else if (bodyClasses.includes('product-type-grouped')) {
        return 'grouped';
      } else if (bodyClasses.includes('product-type-external')) {
        return 'external';
      } else if (bodyClasses.includes('product-type-simple')) {
        return 'simple';
      }
    }
    
    // Check for variation forms
    if ($('form.variations_form').length > 0) {
      return 'variable';
    }
    
    // Check for variation data
    if ($('[data-product_variations]').length > 0) {
      return 'variable';
    }
    
    // Default to simple if no specific type detected
    return 'simple';
  }

  /**
   * Scrape product page for metadata
   */
  static async scrapeProductPage(url: string, html: string): Promise<Partial<Product>> {
    const $ = cheerio.load(html);
    
    // Detect product type first
    const productType = this.getProductType($);
    console.log(`Detected product type: ${productType}`);
    
    // Extract basic product information
    const title = this.extractTitle($);
    const description = this.extractDescription($);
    const shortDescription = this.extractShortDescription($);
    const category = this.extractCategory($);
    const images = this.extractImages($);
    const attributes = this.extractAttributes($);
    const variations = this.extractVariations($);
    const sku = this.extractSKU($);
    const regularPrice = this.extractRegularPrice($);
    const salePrice = this.extractSalePrice($);
    
    // Generate post_name (slug) from title
    const postName = this.generatePostName(title);
    
    // Set parent SKU for variations if this is a variable product
    if (productType === 'variable' && variations.length > 0) {
      variations.forEach(variation => {
        variation.parent_sku = sku;
      });
      console.log(`Set parent SKU ${sku} for ${variations.length} variations`);
    }
    
    return {
      url,
      title,
      description,
      shortDescription,
      category,
      images,
      attributes,
      variations,
      sku,
      regularPrice,
      salePrice,
      postName,
      // Add product type to the result
      meta: {
        product_type: productType,
        is_variable: productType === 'variable',
        variation_count: variations.length
      }
    };
  }
  
  /**
   * Extract product title
   */
  private static extractTitle($: cheerio.CheerioAPI): string {
    // Try multiple selectors for product title
    const titleSelectors = [
      'h1.product_title',
      'h1.entry-title',
      'h1.product-name',
      '.product-title h1',
      '.product-name h1',
      'h1[class*="title"]',
      'h1[class*="name"]',
      'h1',
      '.product-title',
      '.product-name',
      '[data-product-title]',
      'title'
    ];
    
    for (const selector of titleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const title = element.first().text().trim();
        if (title) {
          console.log(`Found title using selector "${selector}": ${title}`);
          return title;
        }
      }
    }
    
    console.log('No title found');
    return '';
  }
  
  /**
   * Extract product description (full description)
   */
  private static extractDescription($: cheerio.CheerioAPI): string {
    // Try multiple selectors for full product description
    const descSelectors = [
      // WooCommerce specific selectors - based on test HTML structure
      '.elementor-widget-woocommerce-product-content',
      '.woocommerce-product-content',
      '.woocommerce-product-details__full-description',
      '.product-description .full-description',
      '.product-description .long-description',
      '.product-content .description',
      '.product-details .full-description',
      '.entry-content .product-description',
      '.product-info .description',
      '.product-summary .description',
      '.product-description',
      '.description',
      '.desc',
      'p[class*="description"]',
      'div[class*="description"]',
      // Look for content in paragraphs within product sections
      '.elementor-widget-woocommerce-product-content p',
      '.product-content p',
      '.product-details p'
    ];
    
    for (const selector of descSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        let description = '';
        
        // If it's a container with multiple paragraphs, get all text
        if (element.find('p').length > 0) {
          description = element.find('p').map((_, p) => $(p).text().trim()).get().join('\n\n');
        } else {
          description = element.text().trim();
        }
        
        if (description) {
          console.log(`Found full description using selector "${selector}": ${description.substring(0, 100)}...`);
          return description;
        }
      }
    }
    
    // Fallback: try to get content from the main product content area
    const productContent = $('.elementor-widget-woocommerce-product-content, .woocommerce-product-content, .product-content');
    if (productContent.length > 0) {
      const paragraphs = productContent.find('p');
      if (paragraphs.length > 0) {
        const description = paragraphs.map((_, p) => $(p).text().trim()).get().join('\n\n');
        if (description) {
          console.log(`Using product content paragraphs as description: ${description.substring(0, 100)}...`);
          return description;
        }
      }
    }
    
    console.log('No full description found');
    return '';
  }
  
  /**
   * Extract short description
   */
  private static extractShortDescription($: cheerio.CheerioAPI): string {
    // Try multiple selectors for short product description
    const shortDescSelectors = [
      '.woocommerce-product-details__short-description',
      '.product-short-description',
      '.product-summary .short-description',
      '.product-excerpt',
      '.product-summary .excerpt',
      '.product-description .short',
      '.product-description .summary',
      '.product-info .short-description',
      '.product-meta .description',
      '.excerpt',
      '.summary',
      'p[class*="excerpt"]',
      'p[class*="summary"]'
    ];
    
    for (const selector of shortDescSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const shortDescription = element.first().text().trim();
        if (shortDescription) {
          console.log(`Found short description using selector "${selector}": ${shortDescription.substring(0, 100)}...`);
          return shortDescription;
        }
      }
    }
    
    // Fallback: try to get first paragraph from product content
    const productContent = $('.woocommerce-product-content, .elementor-widget-woocommerce-product-content, .product-content');
    if (productContent.length > 0) {
      const firstParagraph = productContent.find('p').first();
      if (firstParagraph.length > 0) {
        const shortDesc = firstParagraph.text().trim();
        if (shortDesc) {
          console.log(`Using first paragraph as short description: ${shortDesc.substring(0, 100)}...`);
          return shortDesc;
        }
      }
    }
    
    // Additional fallback: try to get any meaningful text from the product content area
    const productContentArea = $('.elementor-widget-woocommerce-product-content');
    if (productContentArea.length > 0) {
      const textContent = productContentArea.text().trim();
      if (textContent) {
        // Take the first 200 characters as a short description
        const shortDesc = textContent.substring(0, 200).trim();
        if (shortDesc.length > 20) { // Only use if it's substantial
          console.log(`Using product content text as short description: ${shortDesc}...`);
          return shortDesc;
        }
      }
    }
    
    console.log('No short description found');
    return '';
  }
  
  /**
   * Extract product category
   */
  private static extractCategory($: cheerio.CheerioAPI): string {
    const categories: Array<{name: string, source: string, priority: number}> = [];
    
    // Method 1: Extract from GTM data (most reliable, includes multiple category levels)
    const gtmInput = $('input[name="gtmkit_product_data"]');
    if (gtmInput.length > 0) {
      try {
        const gtmData = gtmInput.attr('value');
        if (gtmData) {
          const parsed = JSON.parse(gtmData.replace(/&quot;/g, '"'));
          
          // GTM data often has multiple category levels - prioritize child categories
          if (parsed.item_category2) {
            categories.push({
              name: parsed.item_category2,
              source: 'GTM item_category2',
              priority: 1 // Highest priority - most specific category
            });
            console.log(`Found child category from GTM data: ${parsed.item_category2}`);
          }
          
          if (parsed.item_category) {
            categories.push({
              name: parsed.item_category,
              source: 'GTM item_category',
              priority: 2 // Medium priority - parent category
            });
            console.log(`Found parent category from GTM data: ${parsed.item_category}`);
          }
          
          if (parsed.item_category3) {
            categories.push({
              name: parsed.item_category3,
              source: 'GTM item_category3',
              priority: 0 // Highest priority - most specific subcategory
            });
            console.log(`Found subcategory from GTM data: ${parsed.item_category3}`);
          }
        }
      } catch (error) {
        console.log('Failed to parse GTM data for category');
      }
    }
    
    // Method 2: Extract from body classes (look for multiple category classes)
    const body = $('body');
    if (body.length > 0) {
      const bodyClasses = body.attr('class') || '';
      const categoryMatches = bodyClasses.match(/product_cat-([^-\s]+)/g);
      
      if (categoryMatches) {
        categoryMatches.forEach((match, index) => {
          const categoryName = match.replace('product_cat-', '');
          // Convert to readable format
          const readableCategory = categoryName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          // Prioritize by order (later classes are often more specific)
          const priority = categoryMatches.length - index; // Higher index = higher priority
          
          categories.push({
            name: readableCategory,
            source: `Body class ${match}`,
            priority: priority
          });
          console.log(`Found category from body class: ${readableCategory} (priority: ${priority})`);
        });
      }
    }
    
    // Method 3: Extract from product container classes
    const productContainer = $('[data-elementor-type="product"]');
    if (productContainer.length > 0) {
      const containerClasses = productContainer.attr('class') || '';
      const categoryMatches = containerClasses.match(/product_cat-([^-\s]+)/g);
      
      if (categoryMatches) {
        categoryMatches.forEach((match, index) => {
          const categoryName = match.replace('product_cat-', '');
          const readableCategory = categoryName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          // Prioritize by order (later classes are often more specific)
          const priority = categoryMatches.length - index;
          
          categories.push({
            name: readableCategory,
            source: `Product container class ${match}`,
            priority: priority
          });
          console.log(`Found category from product container: ${readableCategory} (priority: ${priority})`);
        });
      }
    }
    
    // Method 4: Extract from breadcrumbs (often show category hierarchy)
    const breadcrumbSelectors = [
      '.woocommerce-breadcrumb a',
      '.breadcrumb a',
      'nav[aria-label="breadcrumb"] a',
      '.breadcrumbs a'
    ];
    
    for (const selector of breadcrumbSelectors) {
      const breadcrumbLinks = $(selector);
      if (breadcrumbLinks.length > 0) {
        // Breadcrumbs show hierarchy from general to specific
        // The last link is usually the most specific category
        const lastLink = breadcrumbLinks.last();
        const categoryName = lastLink.text().trim();
        
        if (categoryName && !categories.some(cat => cat.name === categoryName)) {
          categories.push({
            name: categoryName,
            source: `Breadcrumb: ${selector}`,
            priority: 3 // Lower priority than GTM and body classes
          });
          console.log(`Found category from breadcrumb: ${categoryName}`);
        }
      }
    }
    
    // Method 5: Extract from category-specific selectors
    const categorySelectors = [
      '.product-category',
      '.category',
      '[data-product-category]',
      '.product-meta .category',
      '.product-info .category'
    ];
    
    for (const selector of categorySelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const categoryName = element.text().trim();
        if (categoryName && !categories.some(cat => cat.name === categoryName)) {
          categories.push({
            name: categoryName,
            source: `Selector: ${selector}`,
            priority: 4 // Lower priority
          });
          console.log(`Found category using selector "${selector}": ${categoryName}`);
        }
      }
    }
    
    // Method 6: Extract from URL-based category detection
    const categoryLinks = $('a[href*="/category/"]');
    if (categoryLinks.length > 0) {
      categoryLinks.each((_, link) => {
        const $link = $(link);
        const href = $link.attr('href') || '';
        const categoryName = $link.text().trim();
        
        if (categoryName && !categories.some(cat => cat.name === categoryName)) {
          // Extract category from URL path
          const urlMatch = href.match(/\/category\/([^\/\?]+)/);
          if (urlMatch) {
            const urlCategory = decodeURIComponent(urlMatch[1]).replace(/[-_]/g, ' ');
            categories.push({
              name: urlCategory,
              source: `URL category: ${href}`,
              priority: 5 // Lower priority
            });
            console.log(`Found category from URL: ${urlCategory}`);
          }
        }
      });
    }
    
    // Now select the best category based on priority and specificity
    if (categories.length > 0) {
      // Sort by priority (lower number = higher priority)
      categories.sort((a, b) => a.priority - b.priority);
      
      // Get the highest priority category
      const bestCategory = categories[0];
      console.log(`Selected best category: "${bestCategory.name}" from ${bestCategory.source} (priority: ${bestCategory.priority})`);
      
      // Log all found categories for debugging
      console.log('All found categories:');
      categories.forEach((cat, index) => {
        console.log(`  ${index + 1}. "${cat.name}" from ${cat.source} (priority: ${cat.priority})`);
      });
      
      return bestCategory.name;
    }
    
    console.log('No category found, using default');
    return 'Uncategorized';
  }
  
  /**
   * Extract product images
   */
  private static extractImages($: cheerio.CheerioAPI): string[] {
    const images: string[] = [];
    
    // Try multiple selectors for product images, starting with most specific
    const imageSelectors = [
      // WooCommerce specific selectors - based on test HTML structure
      '.jet-woo-product-gallery__image img',
      '.jet-woo-product-gallery img',
      '.woocommerce-product-gallery img',
      '.product-gallery img',
      // Featured image selectors
      '.wp-post-image',
      '.featured-image img',
      '.product-image img',
      // Generic image selectors
      '.product-images img',
      '.product-photos img',
      '.product-pictures img',
      // Data attributes
      'img[data-src]',
      'img[data-large_image]',
      // Common patterns
      'img[src*="/uploads/"]',
      'img[src*="/products/"]',
      'img[src*="/images/"]'
    ];
    
    for (const selector of imageSelectors) {
      const elements = $(selector);
      if (elements.length > 0) {
        console.log(`Found ${elements.length} images using selector: ${selector}`);
        
        elements.each((_, img) => {
          const $img = $(img);
          
          // Try different image source attributes in order of preference
          let imageUrl = $img.attr('data-large_image') || 
                        $img.attr('data-src') || 
                        $img.attr('src') || 
                        $img.attr('data-full-image');
          
          if (imageUrl) {
            // Clean up the URL
            imageUrl = imageUrl.trim();
            
            // Skip placeholder images and small thumbnails
            if (imageUrl && 
                !imageUrl.includes('placeholder') && 
                !imageUrl.includes('150x150') && 
                !imageUrl.includes('100x100') &&
                !imageUrl.includes('300x300')) {
              
              // Convert relative URLs to absolute if needed
              if (imageUrl.startsWith('//')) {
                imageUrl = 'https:' + imageUrl;
              } else if (imageUrl.startsWith('/')) {
                // This would need the base URL to be passed in
                // For now, we'll keep relative URLs as-is
              }
              
              if (!images.includes(imageUrl)) {
                images.push(imageUrl);
                console.log(`Added image: ${imageUrl}`);
              }
            }
          }
        });
        
        // If we found images, break out of the loop
        if (images.length > 0) {
          break;
        }
      }
    }
    
    // If no images found with specific selectors, try a broader approach
    if (images.length === 0) {
      const allImages = $('img');
      console.log(`No specific images found, checking all ${allImages.length} images on page`);
      
      allImages.each((_, img) => {
        const $img = $(img);
        const imageUrl = $img.attr('src');
        
        if (imageUrl && 
            imageUrl.includes('/uploads/') && 
            !imageUrl.includes('150x150') && 
            !imageUrl.includes('100x100') &&
            !imageUrl.includes('300x300')) {
          
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
            console.log(`Added fallback image: ${imageUrl}`);
          }
        }
      });
    }
    
    // Sort images to prioritize featured and high-quality ones
    if (images.length > 0) {
      images.sort((a, b) => {
        // Prioritize featured images
        if (a.includes('wp-post-image') && !b.includes('wp-post-image')) return -1;
        if (!a.includes('wp-post-image') && b.includes('wp-post-image')) return 1;
        
        // Prioritize larger images (avoid thumbnails)
        if (a.includes('scaled') && !b.includes('scaled')) return -1;
        if (!a.includes('scaled') && b.includes('scaled')) return 1;
        
        return 0;
      });
      
      console.log(`Sorted ${images.length} images by priority`);
    }
    
    console.log(`Found ${images.length} images`);
    return images;
  }
  
  /**
   * Detect if this is a variable product
   */
  private static isVariableProduct($: cheerio.CheerioAPI): boolean {
    // Check body classes for product type
    const body = $('body');
    if (body.length > 0) {
      const bodyClasses = body.attr('class') || '';
      if (bodyClasses.includes('product-type-variable')) {
        console.log('Detected variable product from body classes');
        return true;
      }
    }
    
    // Check for variation forms
    const variationForm = $('form.variations_form');
    if (variationForm.length > 0) {
      console.log('Detected variable product from variation form');
      return true;
    }
    
    // Check for variation selectors
    const variationSelectors = $('.variations select, .woocommerce-variation-selector');
    if (variationSelectors.length > 0) {
      console.log('Detected variable product from variation selectors');
      return true;
    }
    
    // Check for variation data attributes
    const variationData = $('[data-product_variations]');
    if (variationData.length > 0) {
      console.log('Detected variable product from variation data attributes');
      return true;
    }
    
    // Check for WooCommerce variation elements
    const wooVariations = $('.woocommerce-variations, .variations_form');
    if (wooVariations.length > 0) {
      console.log('Detected variable product from WooCommerce variation elements');
      return true;
    }
    
    console.log('Product appears to be simple (no variation elements found)');
    return false;
  }

  /**
   * Extract product attributes
   */
  private static extractAttributes($: cheerio.CheerioAPI): Product['attributes'] {
    const attributes: Product['attributes'] = {};
    
    // Method 1: Extract from WooCommerce variation form (most reliable for variable products)
    const variationForm = $('form.variations_form');
    if (variationForm.length > 0) {
      console.log('Extracting attributes from WooCommerce variation form...');
      
      const variationSelects = variationForm.find('select[name*="attribute_"]');
      variationSelects.each((_, select) => {
        const $select = $(select);
        const attrName = $select.attr('name') || '';
        const cleanAttrName = attrName.replace(/^attribute_/, '').replace(/^pa_/, '');
        const readableAttrName = cleanAttrName.charAt(0).toUpperCase() + cleanAttrName.slice(1);
        
        const options: string[] = [];
        $select.find('option').each((_, option) => {
          const $option = $(option);
          const value = $option.attr('value') || $option.text().trim();
          if (value && value !== '' && value !== 'Choose an option' && !options.includes(value)) {
            options.push(value);
          }
        });
        
        if (options.length > 0) {
          attributes[readableAttrName] = options;
          console.log(`Found attribute ${readableAttrName}: ${options.join(', ')}`);
        }
      });
    }
    
    // Method 2: Extract from variation data attributes
    if (Object.keys(attributes).length === 0) {
      const variationDataAttr = $('[data-product_variations]');
      if (variationDataAttr.length > 0) {
        try {
          const variationData = variationDataAttr.attr('data-product_variations');
          if (variationData) {
            const parsedVariations = JSON.parse(variationData.replace(/&quot;/g, '"'));
            if (Array.isArray(parsedVariations) && parsedVariations.length > 0) {
              console.log('Extracting attributes from variation data...');
              
              // Get the first variation to extract attribute structure
              const firstVariation = parsedVariations[0];
              if (firstVariation.attributes) {
                Object.keys(firstVariation.attributes).forEach(attrKey => {
                  const cleanKey = attrKey.replace(/^attribute_/, '').replace(/^pa_/, '');
                  const readableKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
                  
                  // Collect all unique values for this attribute across variations
                  const values = new Set<string>();
                  parsedVariations.forEach(variation => {
                    if (variation.attributes && variation.attributes[attrKey]) {
                      values.add(variation.attributes[attrKey]);
                    }
                  });
                  
                  if (values.size > 0) {
                    attributes[readableKey] = Array.from(values);
                    console.log(`Found attribute ${readableKey}: ${Array.from(values).join(', ')}`);
                  }
                });
              }
            }
          }
        } catch (error) {
          console.log('Failed to parse variation data for attributes:', error);
        }
      }
    }
    
    // Method 3: Extract from attribute selectors (fallback)
    if (Object.keys(attributes).length === 0) {
      console.log('Trying fallback attribute extraction...');
      
      const attributeSelectors = [
        '.product-attributes',
        '.attributes',
        '.product-variations',
        '.variations',
        '[data-attributes]',
        '.product-options',
        '.woocommerce-product-attributes'
      ];
      
      for (const selector of attributeSelectors) {
        const container = $(selector);
        if (container.length > 0) {
          console.log(`Found attribute container: ${selector}`);
          
          // Look for color attributes
          const colorElements = container.find('[data-attribute="color"], [data-attribute="Color"], .color-option, .color-attribute, .pa_color');
          if (colorElements.length > 0) {
            const colors = colorElements.map((_, el) => $(el).text().trim()).get();
            if (colors.length > 0) {
              attributes.Color = colors;
              console.log(`Found color attributes: ${colors.join(', ')}`);
            }
          }
          
          // Look for size attributes
          const sizeElements = container.find('[data-attribute="size"], [data-attribute="Size"], .size-option, .size-attribute, .pa_size');
          if (sizeElements.length > 0) {
            const sizes = sizeElements.map((_, el) => $(el).text().trim()).get();
            if (sizes.length > 0) {
              attributes.Size = sizes;
              console.log(`Found size attributes: ${sizes.join(', ')}`);
            }
          }
          
          // Look for material attributes
          const materialElements = container.find('[data-attribute="material"], [data-attribute="Material"], .material-option, .material-attribute, .pa_material');
          if (materialElements.length > 0) {
            const materials = materialElements.map((_, el) => $(el).text().trim()).get();
            if (materials.length > 0) {
              attributes.Material = materials;
              console.log(`Found material attributes: ${materials.join(', ')}`);
            }
          }
          
          // Look for any other attribute patterns
          const genericAttrElements = container.find('[class*="pa_"], [data-attribute]');
          genericAttrElements.each((_, el) => {
            const $el = $(el);
            const className = $el.attr('class') || '';
            const dataAttr = $el.attr('data-attribute') || '';
            
            let attrName = '';
            let attrValue = $el.text().trim();
            
            if (className.includes('pa_')) {
              const match = className.match(/pa_([a-zA-Z_]+)/);
              if (match) {
                attrName = match[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              }
            } else if (dataAttr) {
              attrName = dataAttr.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            
            if (attrName && attrValue && !attributes[attrName]) {
              attributes[attrName] = [attrValue];
              console.log(`Found generic attribute ${attrName}: ${attrValue}`);
            }
          });
          
          if (Object.keys(attributes).length > 0) {
            break;
          }
        }
      }
    }
    
    console.log(`Total attributes found: ${Object.keys(attributes).length}`);
    return attributes;
  }
  
  /**
   * Extract product variations
   */
  private static extractVariations($: cheerio.CheerioAPI): Variation[] {
    const variations: Variation[] = [];
    
    // First check if this is actually a variable product
    if (!this.isVariableProduct($)) {
      console.log('Not a variable product, skipping variation extraction');
      return variations;
    }
    
    console.log('Extracting variations from variable product...');
    
    // Method 1: Extract from WooCommerce variation data attributes
    const variationDataAttr = $('[data-product_variations]');
    if (variationDataAttr.length > 0) {
      try {
        const variationData = variationDataAttr.attr('data-product_variations');
        if (variationData) {
          const parsedVariations = JSON.parse(variationData.replace(/&quot;/g, '"'));
          if (Array.isArray(parsedVariations)) {
            console.log(`Found ${parsedVariations.length} variations in data-product_variations`);
            
            parsedVariations.forEach((variation, index) => {
              const variationObj: Variation = {
                parent_sku: '', // Will be set later
                sku: variation.sku || variation.variation_id?.toString() || `var-${index + 1}`,
                stock_status: variation.is_in_stock ? 'instock' : 'outofstock',
                regular_price: variation.display_price?.toString() || variation.price?.toString() || '0',
                tax_class: variation.tax_class || '',
                images: variation.image ? [variation.image.src || variation.image.full_src] : [],
                meta: {}
              };
              
              // Extract attributes from variation
              if (variation.attributes) {
                Object.keys(variation.attributes).forEach(attrKey => {
                  const attrValue = variation.attributes[attrKey];
                  if (attrValue) {
                    // Convert attribute key to readable format (e.g., "attribute_pa_color" -> "Color")
                    const cleanKey = attrKey.replace(/^attribute_/, '').replace(/^pa_/, '');
                    const readableKey = cleanKey.charAt(0).toUpperCase() + cleanKey.slice(1);
                    variationObj.meta[`attribute_${readableKey}`] = attrValue;
                  }
                });
              }
              
              variations.push(variationObj);
              console.log(`Extracted variation ${index + 1}: ${JSON.stringify(variationObj)}`);
            });
            
            if (variations.length > 0) {
              return variations;
            }
          }
        }
      } catch (error) {
        console.log('Failed to parse variation data from data-product_variations:', error);
      }
    }
    
    // Method 2: Extract from WooCommerce variation form
    const variationForm = $('form.variations_form');
    if (variationForm.length > 0) {
      console.log('Extracting variations from variation form...');
      
      // Look for variation selectors
      const variationSelects = variationForm.find('select[name*="attribute_"]');
      if (variationSelects.length > 0) {
        console.log(`Found ${variationSelects.length} variation attributes`);
        
        // Extract available options for each attribute
        const attributeOptions: { [key: string]: string[] } = {};
        
        variationSelects.each((_, select) => {
          const $select = $(select);
          const attrName = $select.attr('name') || '';
          const cleanAttrName = attrName.replace(/^attribute_/, '').replace(/^pa_/, '');
          const readableAttrName = cleanAttrName.charAt(0).toUpperCase() + cleanAttrName.slice(1);
          
          const options: string[] = [];
          $select.find('option').each((_, option) => {
            const $option = $(option);
            const value = $option.attr('value') || $option.text().trim();
            if (value && value !== '' && !options.includes(value)) {
              options.push(value);
            }
          });
          
          if (options.length > 0) {
            attributeOptions[readableAttrName] = options;
            console.log(`Attribute ${readableAttrName}: ${options.join(', ')}`);
          }
        });
        
        // Generate variations based on attribute combinations
        if (Object.keys(attributeOptions).length > 0) {
          const attributeKeys = Object.keys(attributeOptions);
          const generateCombinations = (attrs: string[], current: { [key: string]: string } = {}, index = 0): void => {
            if (index === attrs.length) {
              // Create variation from this combination
              const variationObj: Variation = {
                parent_sku: '', // Will be set later
                sku: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                stock_status: 'instock',
                regular_price: '0', // Will need to be extracted from actual variation data
                tax_class: '',
                images: [],
                meta: {}
              };
              
              // Add attributes to meta
              Object.keys(current).forEach(attrKey => {
                variationObj.meta[`attribute_${attrKey}`] = current[attrKey];
              });
              
              variations.push(variationObj);
              return;
            }
            
            const attrName = attrs[index];
            const options = attributeOptions[attrName];
            
            options.forEach(option => {
              generateCombinations(attrs, { ...current, [attrName]: option }, index + 1);
            });
          };
          
          generateCombinations(attributeKeys);
          console.log(`Generated ${variations.length} variation combinations`);
        }
      }
    }
    
    // Method 3: Extract from variation table or list
    const variationTable = $('.variations, .woocommerce-variations');
    if (variationTable.length > 0) {
      console.log('Extracting variations from variation table...');
      
      const variationRows = variationTable.find('tr, .variation');
      variationRows.each((_, row) => {
        const $row = $(row);
        
        // Extract variation data from row
        const sku = $row.find('[data-sku], .sku').text().trim() || 
                   $row.attr('data-sku') || 
                   $row.find('.variation-sku').text().trim();
        
        const price = $row.find('.price, .variation-price').text().trim() || 
                     $row.attr('data-price') || 
                     $row.find('[data-price]').attr('data-price');
        
        const stockStatus = $row.find('.stock, .variation-stock').text().trim() || 'instock';
        
        // Extract attributes from row
        const meta: { [key: string]: string } = {};
        $row.find('[data-attribute], .attribute').each((_, attr) => {
          const $attr = $(attr);
          const attrName = $attr.attr('data-attribute') || $attr.find('.attr-name').text().trim();
          const attrValue = $attr.attr('data-value') || $attr.find('.attr-value').text().trim();
          
          if (attrName && attrValue) {
            const cleanAttrName = attrName.replace(/^attribute_/, '').replace(/^pa_/, '');
            const readableAttrName = cleanAttrName.charAt(0).toUpperCase() + cleanAttrName.slice(1);
            meta[`attribute_${readableAttrName}`] = attrValue;
          }
        });
        
        if (sku || price || Object.keys(meta).length > 0) {
          const variationObj: Variation = {
            parent_sku: '', // Will be set later
            sku: sku || `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            stock_status: stockStatus.toLowerCase().includes('out') ? 'outofstock' : 'instock',
            regular_price: price || '0',
            tax_class: '',
            images: [],
            meta
          };
          
          variations.push(variationObj);
          console.log(`Extracted variation from table: ${JSON.stringify(variationObj)}`);
        }
      });
    }
    
    // Method 4: Fallback - look for any variation-like elements
    if (variations.length === 0) {
      console.log('Trying fallback variation detection...');
      
      const fallbackSelectors = [
        '.product-variations .variation',
        '.variations .variation',
        '.product-options .option',
        '.variation-item',
        '[data-variation]',
        '.woocommerce-variation'
      ];
      
      for (const selector of fallbackSelectors) {
        const elements = $(selector);
        if (elements.length > 0) {
          console.log(`Found ${elements.length} variations using fallback selector: ${selector}`);
          
          elements.each((_, variation) => {
            const $variation = $(variation);
            
            // Extract variation data
            const sku = $variation.attr('data-sku') || $variation.find('[data-sku]').attr('data-sku') || '';
            const price = $variation.attr('data-price') || $variation.find('.price').text().trim() || '';
            const color = $variation.attr('data-color') || $variation.find('.color').text().trim() || '';
            const size = $variation.attr('data-size') || $variation.find('.size').text().trim() || '';
            
            if (sku || price || color || size) {
              const variationData: Variation = {
                parent_sku: '', // Will be set later
                sku: sku || `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                stock_status: 'instock',
                regular_price: price || '0',
                tax_class: '',
                images: [],
                meta: {}
              };
              
              if (color) variationData.meta.attribute_Color = color;
              if (size) variationData.meta.attribute_Size = size;
              
              variations.push(variationData);
              console.log(`Found fallback variation: ${JSON.stringify(variationData)}`);
            }
          });
          
          if (variations.length > 0) {
            break;
          }
        }
      }
    }
    
    console.log(`Total variations extracted: ${variations.length}`);
    return variations;
  }
  
  /**
   * Extract product SKU
   */
  private static extractSKU($: cheerio.CheerioAPI): string {
    // First, try to extract SKU from GTM data as it's most reliable
    const gtmInput = $('input[name="gtmkit_product_data"]');
    if (gtmInput.length > 0) {
      try {
        const gtmData = gtmInput.attr('value');
        if (gtmData) {
          const parsed = JSON.parse(gtmData.replace(/&quot;/g, '"'));
          if (parsed.id) {
            const sku = parsed.id.toString();
            console.log(`Found SKU from GTM data: ${sku}`);
            return sku;
          }
        }
      } catch (error) {
        console.log('Failed to parse GTM data for SKU');
      }
    }
    
    // Try multiple selectors for product SKU, starting with most specific
    const skuSelectors = [
      // WooCommerce specific selectors
      '.sku',
      '.product-sku',
      '.product-meta .sku',
      '.product-info .sku',
      // Data attributes
      '[data-sku]',
      '[data-product-sku]',
      // Form inputs
      'input[name="add-to-cart"]',
      'input[name="product_id"]',
      // Hidden inputs with product data
      'input[name="gtmkit_product_data"]',
      // Product container attributes
      '[data-product-id]',
      '[data-post-id]'
    ];
    
    for (const selector of skuSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        let sku = '';
        
        if (selector === 'input[name="add-to-cart"]') {
          // Extract SKU from add-to-cart button value
          sku = element.attr('value') || '';
          if (sku) {
            console.log(`Found SKU from add-to-cart button: ${sku}`);
            return sku;
          }
        } else if (selector === 'input[name="gtmkit_product_data"]') {
          // Extract SKU from GTM data
          try {
            const gtmData = element.attr('value');
            if (gtmData) {
              const parsed = JSON.parse(gtmData.replace(/&quot;/g, '"'));
              if (parsed.id) {
                sku = parsed.id.toString();
                console.log(`Found SKU from GTM data: ${sku}`);
                return sku;
              }
            }
          } catch (error) {
            console.log('Failed to parse GTM data for SKU');
          }
        } else if (selector.includes('data-')) {
          // Extract from data attributes
          sku = element.attr(selector.replace(/[\[\]]/g, '')) || '';
          if (sku) {
            console.log(`Found SKU from data attribute: ${sku}`);
            return sku;
          }
        } else {
          // Extract from text content
          sku = element.text().trim();
          if (sku) {
            console.log(`Found SKU using selector "${selector}": ${sku}`);
            return sku;
          }
        }
      }
    }
    
    // Try to extract SKU from the product container
    const productContainer = $('[data-elementor-type="product"]');
    if (productContainer.length > 0) {
      const containerClasses = productContainer.attr('class') || '';
      const postIdMatch = containerClasses.match(/post-(\d+)/);
      if (postIdMatch) {
        const sku = postIdMatch[1];
        console.log(`Found SKU from product container post ID: ${sku}`);
        return sku;
      }
    }
    
    // Try to find SKU in the page title or URL
    const pageTitle = $('title').text();
    if (pageTitle) {
      const titleMatch = pageTitle.match(/Product #(\d+)/i);
      if (titleMatch) {
        const sku = titleMatch[1];
        console.log(`Found SKU from page title: ${sku}`);
        return sku;
      }
    }
    
    // Generate a fallback SKU
    const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`Generated post_id as SKU fallback: ${postId}`);
    return postId;
  }
  
  /**
   * Extract regular price
   */
  private static extractRegularPrice($: cheerio.CheerioAPI): string {
    // First, try to extract price from GTM data as it's most reliable
    const gtmInput = $('input[name="gtmkit_product_data"]');
    if (gtmInput.length > 0) {
      try {
        const gtmData = gtmInput.attr('value');
        if (gtmData) {
          const parsed = JSON.parse(gtmData.replace(/&quot;/g, '"'));
          if (parsed.price) {
            const price = parsed.price.toString();
            console.log(`Found regular price from GTM data: ${price}`);
            return price;
          }
        }
      } catch (error) {
        console.log('Failed to parse GTM data for price');
      }
    }
    
    // Try multiple selectors for regular price, starting with most specific
    const priceSelectors = [
      // Most specific WooCommerce selectors - based on test HTML structure
      '.price .woocommerce-Price-amount .amount',
      '.woocommerce-Price-amount .amount',
      '.price .woocommerce-Price-amount',
      '.woocommerce-Price-amount',
      // Price containers
      '.price .amount',
      '.product-price .amount',
      '.price',
      // Data attributes
      '[data-regular-price]',
      '[data-price]',
      // Generic price selectors
      '.regular-price .amount',
      '.price .regular-price',
      '.product-price .regular',
      '.price .price-regular',
      '.product-price',
      '.cost',
      '.product-cost'
    ];
    
    for (const selector of priceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        // For price elements, try to get only the amount part
        let price = '';
        
        if (selector.includes('.amount')) {
          // If it's an amount element, get its text directly
          price = element.text().trim();
        } else if (selector === '.price') {
          // For price containers, look for amount elements inside
          const amountElement = element.find('.amount, .woocommerce-Price-amount');
          if (amountElement.length > 0) {
            price = amountElement.text().trim();
          } else {
            price = element.text().trim();
          }
        } else {
          price = element.text().trim();
        }
        
        if (price) {
          const cleanPrice = this.cleanPrice(price);
          if (cleanPrice && this.isValidPrice(cleanPrice)) {
            console.log(`Found regular price using selector "${selector}": ${cleanPrice}`);
            return cleanPrice;
          }
        }
      }
    }
    
    // Try a more targeted approach - look for the specific price structure from test HTML
    // The test HTML shows: <span class="woocommerce-Price-currencySymbol">₪</span>85
    const priceContainer = $('.price .woocommerce-Price-amount');
    if (priceContainer.length > 0) {
      // Get the text content, excluding the currency symbol
      const priceText = priceContainer.text().trim();
      if (priceText) {
        const cleanPrice = this.cleanPrice(priceText);
        if (cleanPrice && this.isValidPrice(cleanPrice)) {
          console.log(`Found regular price using price container: ${cleanPrice}`);
          return cleanPrice;
        }
      }
    }
    
    // Fallback: try to find any price-like text in the price section
    const priceSection = $('.price');
    if (priceSection.length > 0) {
      const priceText = priceSection.text().trim();
      if (priceText) {
        const cleanPrice = this.cleanPrice(priceText);
        if (cleanPrice && this.isValidPrice(cleanPrice)) {
          console.log(`Found regular price using price section fallback: ${cleanPrice}`);
          return cleanPrice;
        }
      }
    }
    
    console.log('No regular price found');
    return '';
  }
  
  /**
   * Extract sale price
   */
  private static extractSalePrice($: cheerio.CheerioAPI): string {
    // Try multiple selectors for sale price
    const salePriceSelectors = [
      '.sale-price .amount',
      '.price .sale-price',
      '.product-price .sale',
      '.price .price-sale',
      '.sale-price',
      '.discount-price',
      '.reduced-price',
      '[data-sale-price]',
      '[data-discount-price]',
      '.price .ins',
      '.price del + ins'
    ];
    
    for (const selector of salePriceSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        const price = element.text().trim();
        if (price) {
          const cleanPrice = this.cleanPrice(price);
          if (cleanPrice && this.isValidPrice(cleanPrice)) {
            console.log(`Found sale price using selector "${selector}": ${cleanPrice}`);
            return cleanPrice;
          }
        }
      }
    }
    
    console.log('No sale price found');
    return '';
  }
  
  /**
   * Generate post_name (slug) from title
   */
  private static generatePostName(title: string): string {
    if (!title) return '';
    
    // Clean the title and create a proper slug while preserving original language
    let slug = title
      .toLowerCase()
      // Keep original Hebrew characters - don't transliterate
      .replace(/[^\w\s\u0590-\u05FF-]/g, '') // Keep Hebrew characters (U+0590 to U+05FF), letters, numbers, spaces, and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();
    
    // Remove leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, '');
    
    // Ensure the slug is not empty and has a minimum length
    if (slug.length < 2) {
      // Use a simple fallback instead of timestamp
      slug = 'product';
    }
    
    // Limit length to avoid extremely long slugs
    if (slug.length > 50) {
      slug = slug.substring(0, 50).replace(/-+$/, '');
    }
    
    console.log(`Generated post_name from title "${title}": "${slug}"`);
    return slug;
  }
  
  /**
   * Clean price string to extract numeric value
   */
  private static cleanPrice(price: string): string {
    if (!price) return '';
    
    // Remove currency symbols (including Hebrew ₪) and extra text, keep only numbers and decimal separators
    let cleanPrice = price
      .replace(/[^\d.,]/g, '') // Keep only digits, dots, and commas
      .replace(',', '.') // Convert comma to dot for decimal
      .trim();
    
    // If we got multiple numbers, try to extract just the first reasonable one
    if (cleanPrice.length > 10) {
      // Look for the first sequence of 1-3 digits
      const firstPriceMatch = cleanPrice.match(/^\d{1,3}/);
      if (firstPriceMatch) {
        cleanPrice = firstPriceMatch[0];
      }
    }
    
    return cleanPrice;
  }
  
  /**
   * Validate if a price string is reasonable
   */
  private static isValidPrice(price: string): boolean {
    if (!price) return false;
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return false;
    
    // Check if price is reasonable (between 0.01 and 1000000)
    if (numPrice < 0.01 || numPrice > 1000000) return false;
    
    // Check if price doesn't have too many digits (likely wrong extraction)
    if (price.length > 10) return false;
    
    return true;
  }
}
