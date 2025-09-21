import { RawProduct, ValidationError, RecipeConfig } from '../../domain/types';

/**
 * Interface for product validation operations
 */
export interface IProductValidator {
  validateProduct(product: RawProduct): ValidationError[];
  validateRequiredFields(product: RawProduct, requiredFields: string[]): ValidationError[];
  validatePriceFormat(price: string, pattern?: RegExp): ValidationError[];
  validateStockStatus(stockStatus: string, validStatuses: string[]): ValidationError[];
  validateImageUrls(images: (string | undefined)[]): ValidationError[];
  validateAttributes(attributes: Record<string, (string | undefined)[]>): ValidationError[];
  validateVariations(variations: RawProduct['variations']): ValidationError[];
  updateConfig(config: RecipeConfig): void;
}

/**
 * Product validation service that handles validation logic for scraped products
 */
export class ProductValidator implements IProductValidator {
  private config: RecipeConfig;

  constructor(config: RecipeConfig) {
    this.config = config;
  }

  /**
   * Validate a product using recipe validation rules
   */
  validateProduct(product: RawProduct): ValidationError[] {
    const errors: ValidationError[] = [];
    const validation = this.config.validation;

    // Use recipe-specific validation if available, otherwise use basic validation
    if (validation?.requiredFields) {
      errors.push(...this.validateRequiredFields(product, validation.requiredFields));
    } else {
      // Basic validation for essential fields
      const basicRequiredFields = ['sku', 'title', 'price'];
      errors.push(...this.validateRequiredFields(product, basicRequiredFields));
    }

    // Price format validation
    if (product.price) {
      const priceRegex = validation?.priceFormat ? new RegExp(validation.priceFormat) : /^\d+(\.\d{2})?$/;
      errors.push(...this.validatePriceFormat(product.price, priceRegex));
    }

    // Stock status validation
    if (product.stockStatus) {
      const validStatuses = ['in-stock', 'out-of-stock', 'instock', 'outofstock', 'available', 'unavailable'];
      errors.push(...this.validateStockStatus(product.stockStatus, validStatuses));
    }

    // Image URLs validation
    if (product.images) {
      errors.push(...this.validateImageUrls(product.images));
    }

    // Attributes validation
    if (product.attributes) {
      errors.push(...this.validateAttributes(product.attributes));
    }

    // Variations validation
    if (product.variations) {
      errors.push(...this.validateVariations(product.variations));
    }

    // Length validation
    if (validation?.minDescriptionLength && product.description) {
      if (product.description.length < validation.minDescriptionLength) {
        errors.push({
          name: 'ValidationError',
          message: `Description is too short (${product.description.length} characters, minimum ${validation.minDescriptionLength})`,
          field: 'description',
          value: product.description,
          expected: `at least ${validation.minDescriptionLength} characters`,
        } as ValidationError);
      }
    }

    if (validation?.maxTitleLength && product.title) {
      if (product.title.length > validation.maxTitleLength) {
        errors.push({
          name: 'ValidationError',
          message: `Title is too long (${product.title.length} characters, maximum ${validation.maxTitleLength})`,
          field: 'title',
          value: product.title,
          expected: `at most ${validation.maxTitleLength} characters`,
        } as ValidationError);
      }
    }

    return errors;
  }

  /**
   * Validate required fields
   */
  validateRequiredFields(product: RawProduct, requiredFields: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const field of requiredFields) {
      const value = (product as unknown as Record<string, unknown>)[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push({
          name: 'ValidationError',
          message: `Required field '${field}' is missing or empty`,
          field,
          value,
          expected: 'non-empty value',
        } as ValidationError);
      }
    }

    return errors;
  }

  /**
   * Validate price format
   */
  validatePriceFormat(price: string, pattern?: RegExp): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!pattern) {
      // Default price pattern: currency symbol followed by digits and optional decimal
      pattern = /^[$€£¥₹]?\s*\d+(?:\.\d{2})?$/;
    }

    if (!pattern.test(price.trim())) {
      errors.push({
        name: 'ValidationError',
        message: `Price '${price}' does not match expected format`,
        field: 'price',
        value: price,
        expected: 'valid price format',
      } as ValidationError);
    }

    return errors;
  }

  /**
   * Validate stock status
   */
  validateStockStatus(stockStatus: string, validStatuses: string[]): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!validStatuses.includes(stockStatus.toLowerCase())) {
      errors.push({
        name: 'ValidationError',
        message: `Stock status '${stockStatus}' is not valid. Expected: ${validStatuses.join(', ')}`,
        field: 'stockStatus',
        value: stockStatus,
        expected: validStatuses.join(' or '),
      } as ValidationError);
    }

    return errors;
  }

  /**
   * Validate image URLs
   */
  validateImageUrls(images: (string | undefined)[]): ValidationError[] {
    const errors: ValidationError[] = [];

    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image && !this.isValidUrl(image)) {
        errors.push({
          name: 'ValidationError',
          message: `Image URL '${image}' is not valid`,
          field: 'images',
          value: image,
          expected: 'valid URL',
        } as ValidationError);
      }
    }

    return errors;
  }

  /**
   * Validate attributes
   */
  validateAttributes(attributes: Record<string, (string | undefined)[]>): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [key, values] of Object.entries(attributes)) {
      if (!key || key.trim() === '') {
        errors.push({
          name: 'ValidationError',
          message: 'Attribute name cannot be empty',
          field: 'attributes',
          value: key,
          expected: 'non-empty attribute name',
        } as ValidationError);
      }

      if (!Array.isArray(values)) {
        errors.push({
          name: 'ValidationError',
          message: `Attribute '${key}' values must be an array`,
          field: `attributes.${key}`,
          value: values,
          expected: 'array of values',
        } as ValidationError);
      } else if (values.length === 0) {
        errors.push({
          name: 'ValidationError',
          message: `Attribute '${key}' cannot be empty`,
          field: `attributes.${key}`,
          value: values,
          expected: 'non-empty array of values',
        } as ValidationError);
      } else {
        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value === undefined || value === null) {
            errors.push({
              name: 'ValidationError',
              message: `Attribute '${key}' value at index ${i} cannot be null or undefined`,
              field: `attributes.${key}[${i}]`,
              value: value,
              expected: 'non-null value',
            } as ValidationError);
          }
        }
      }
    }

    return errors;
  }

  /**
   * Validate variations
   */
  validateVariations(variations: RawProduct['variations']): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!Array.isArray(variations)) {
      errors.push({
        name: 'ValidationError',
        message: 'Variations must be an array',
        field: 'variations',
        value: variations,
        expected: 'array of variations',
      } as ValidationError);
      return errors;
    }

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      if (!variation) {
        errors.push({
          name: 'ValidationError',
          message: `Variation at index ${i} is null or undefined`,
          field: `variations[${i}]`,
          value: variation,
          expected: 'valid variation object',
        } as ValidationError);
        continue;
      }

      // Validate required variation fields
      if (!variation.sku || variation.sku.trim() === '') {
        errors.push({
          name: 'ValidationError',
          message: `Variation at index ${i} must have a valid SKU`,
          field: `variations[${i}].sku`,
          value: variation.sku,
          expected: 'non-empty SKU',
        } as ValidationError);
      }

      if (!variation.regularPrice || variation.regularPrice.trim() === '') {
        errors.push({
          name: 'ValidationError',
          message: `Variation at index ${i} must have a valid regular price`,
          field: `variations[${i}].regularPrice`,
          value: variation.regularPrice,
          expected: 'non-empty regular price',
        } as ValidationError);
      }

      if (!variation.stockStatus || variation.stockStatus.trim() === '') {
        errors.push({
          name: 'ValidationError',
          message: `Variation at index ${i} must have a valid stock status`,
          field: `variations[${i}].stockStatus`,
          value: variation.stockStatus,
          expected: 'non-empty stock status',
        } as ValidationError);
      }

      // Validate attribute assignments
      if (variation.attributeAssignments) {
        for (const [attrName, attrValue] of Object.entries(variation.attributeAssignments)) {
          if (!attrName || attrName.trim() === '') {
            errors.push({
              name: 'ValidationError',
              message: `Variation at index ${i} has empty attribute name`,
              field: `variations[${i}].attributeAssignments.${attrName}`,
              value: attrName,
              expected: 'non-empty attribute name',
            } as ValidationError);
          }
          if (!attrValue || attrValue.trim() === '') {
            errors.push({
              name: 'ValidationError',
              message: `Variation at index ${i} has empty value for attribute '${attrName}'`,
              field: `variations[${i}].attributeAssignments.${attrName}`,
              value: attrValue,
              expected: 'non-empty attribute value',
            } as ValidationError);
          }
        }
      }
    }

    // Add a general variations error if there are any specific variation errors
    if (errors.length > 0) {
      errors.push({
        name: 'ValidationError',
        message: 'One or more variations have validation errors',
        field: 'variations',
        value: variations,
        expected: 'valid variations',
      } as ValidationError);
    }

    return errors;
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: RecipeConfig): void {
    this.config = config;
  }
}
