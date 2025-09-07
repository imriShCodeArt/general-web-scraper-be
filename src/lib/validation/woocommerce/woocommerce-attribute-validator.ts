import {
  WooCommerceAttributeNamingRules,
  WooCommerceValidationError,
  WooCommerceValidationWarning,
} from '../../domain/types';
import { WOOCOMMERCE_ATTRIBUTE_NAMING_RULES } from './woocommerce-validation-schema';

/**
 * WooCommerce Attribute Naming Validator
 * Validates attribute names against WooCommerce naming conventions
 */
export class WooCommerceAttributeValidator {
  private rules: WooCommerceAttributeNamingRules;

  constructor(rules: WooCommerceAttributeNamingRules = WOOCOMMERCE_ATTRIBUTE_NAMING_RULES) {
    this.rules = rules;
  }

  /**
   * Validate a single attribute name
   */
  validateAttributeName(attributeName: string): {
    isValid: boolean;
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const errors: WooCommerceValidationError[] = [];
    const warnings: WooCommerceValidationWarning[] = [];

    // Check if attribute name is empty
    if (!attributeName || attributeName.trim() === '') {
      errors.push({
        code: 'EMPTY_ATTRIBUTE_NAME',
        message: 'Attribute name cannot be empty',
        field: 'attributeName',
        suggestion: 'Provide a descriptive attribute name',
        severity: 'error',
        category: 'naming',
      });
      return { isValid: false, errors, warnings };
    }

    // Check if name is reserved
    if (this.isReservedName(attributeName)) {
      errors.push({
        code: 'RESERVED_ATTRIBUTE_NAME',
        message: `Attribute name '${attributeName}' is reserved in WooCommerce`,
        field: 'attributeName',
        suggestion: this.getReservedNameSuggestion(attributeName),
        severity: 'error',
        category: 'naming',
      });
    }

    // Check for spaces first
    if (attributeName.includes(' ')) {
      errors.push({
        code: 'CONTAINS_SPACES',
        message: `Attribute name '${attributeName}' contains spaces`,
        field: 'attributeName',
        suggestion: `Remove spaces: '${attributeName.replace(/\s+/g, '')}'`,
        severity: 'error',
        category: 'naming',
      });
    }

    // Check capitalization
    if (!this.isValidCapitalization(attributeName)) {
      errors.push({
        code: 'INVALID_CAPITALIZATION',
        message: `Attribute name '${attributeName}' must be in PascalCase`,
        field: 'attributeName',
        suggestion: `Convert to PascalCase: '${this.toPascalCase(attributeName)}'`,
        severity: 'error',
        category: 'naming',
      });
    }

    // Check for special characters
    const specialCharIssues = this.validateSpecialCharacters(attributeName);
    if (specialCharIssues.length > 0) {
      errors.push({
        code: 'INVALID_SPECIAL_CHARACTERS',
        message: `Attribute name '${attributeName}' contains invalid characters: ${specialCharIssues.join(', ')}`,
        field: 'attributeName',
        suggestion: `Remove invalid characters: '${this.removeInvalidCharacters(attributeName)}'`,
        severity: 'error',
        category: 'naming',
      });
    }

    // Check length
    if (attributeName.length < 2) {
      errors.push({
        code: 'TOO_SHORT',
        message: `Attribute name '${attributeName}' is too short (minimum 2 characters)`,
        field: 'attributeName',
        suggestion: 'Use a more descriptive attribute name',
        severity: 'error',
        category: 'naming',
      });
    }

    if (attributeName.length > 50) {
      warnings.push({
        code: 'TOO_LONG',
        message: `Attribute name '${attributeName}' is very long (${attributeName.length} characters)`,
        field: 'attributeName',
        suggestion: 'Consider using a shorter, more concise name',
        category: 'best-practice',
      });
    }

    // Check for common naming issues
    this.checkCommonNamingIssues(attributeName, warnings);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate multiple attribute names
   */
  validateAttributeNames(attributeNames: string[]): {
    isValid: boolean;
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
    duplicates: string[];
  } {
    const allErrors: WooCommerceValidationError[] = [];
    const allWarnings: WooCommerceValidationWarning[] = [];
    const duplicates: string[] = [];

    // Check for duplicates
    const nameCounts = new Map<string, number>();
    attributeNames.forEach(name => {
      const normalizedName = name.toLowerCase();
      nameCounts.set(normalizedName, (nameCounts.get(normalizedName) || 0) + 1);
    });

    nameCounts.forEach((count, name) => {
      if (count > 1) {
        duplicates.push(name);
        allErrors.push({
          code: 'DUPLICATE_ATTRIBUTE_NAME',
          message: `Attribute name '${name}' appears ${count} times`,
          field: 'attributeNames',
          suggestion: 'Ensure all attribute names are unique',
          severity: 'error',
          category: 'naming',
        });
      }
    });

    // Validate each attribute name
    attributeNames.forEach((name, index) => {
      const result = this.validateAttributeName(name);
      allErrors.push(...result.errors.map(error => ({
        ...error,
        field: `attributeNames[${index}]`,
      })));
      allWarnings.push(...result.warnings.map(warning => ({
        ...warning,
        field: `attributeNames[${index}]`,
      })));
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      duplicates,
    };
  }

  /**
   * Validate attribute names from recipe transforms
   */
  validateRecipeAttributes(transforms: Record<string, string[]>): {
    isValid: boolean;
    errors: WooCommerceValidationError[];
    warnings: WooCommerceValidationWarning[];
  } {
    const attributeNames = Object.keys(transforms);
    return this.validateAttributeNames(attributeNames);
  }

  /**
   * Check if attribute name is reserved
   */
  private isReservedName(attributeName: string): boolean {
    return this.rules.reservedNames.some(reserved =>
      reserved.toLowerCase() === attributeName.toLowerCase(),
    );
  }

  /**
   * Get suggestion for reserved name
   */
  private getReservedNameSuggestion(attributeName: string): string {
    const suggestions = [
      `Use 'Product${attributeName}' instead`,
      `Use 'Custom${attributeName}' instead`,
      `Use 'Item${attributeName}' instead`,
      'Choose a different name that describes the attribute',
    ];
    return suggestions[0];
  }

  /**
   * Check if capitalization is valid
   */
  private isValidCapitalization(attributeName: string): boolean {
    return this.rules.validPattern.test(attributeName);
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters
      .replace(/[^a-zA-Z0-9\s]/g, ' ') // Replace special chars with spaces
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');
  }

  /**
   * Validate special characters
   */
  private validateSpecialCharacters(attributeName: string): string[] {
    const invalidChars: string[] = [];
    const forbiddenPattern = new RegExp(`[${this.rules.specialCharacterRules.forbiddenCharacters.join('')}]`, 'g');
    const matches = attributeName.match(forbiddenPattern);

    if (matches) {
      invalidChars.push(...matches);
    }

    return [...new Set(invalidChars)]; // Remove duplicates
  }

  /**
   * Remove invalid characters from attribute name
   */
  private removeInvalidCharacters(attributeName: string): string {
    const allowedPattern = new RegExp(`[${this.rules.specialCharacterRules.allowedCharacters.join('')}]`, 'g');
    return attributeName.match(allowedPattern)?.join('') || '';
  }

  /**
   * Check for common naming issues
   */
  private checkCommonNamingIssues(attributeName: string, warnings: WooCommerceValidationWarning[]): void {
    // Check for common typos
    const commonTypos = {
      'color': 'Color',
      'size': 'Size',
      'material': 'Material',
      'brand': 'Brand',
      'weight': 'Weight',
      'dimensions': 'Dimensions',
    };

    const lowerName = attributeName.toLowerCase();
    if (commonTypos[lowerName as keyof typeof commonTypos]) {
      warnings.push({
        code: 'COMMON_TYPO',
        message: `Consider using '${commonTypos[lowerName as keyof typeof commonTypos]}' instead of '${attributeName}'`,
        field: 'attributeName',
        suggestion: `Use '${commonTypos[lowerName as keyof typeof commonTypos]}' for better consistency`,
        category: 'best-practice',
      });
    }

    // Check for generic names
    const genericNames = ['attribute', 'option', 'property', 'field', 'value'];
    if (genericNames.includes(lowerName)) {
      warnings.push({
        code: 'GENERIC_NAME',
        message: `Attribute name '${attributeName}' is too generic`,
        field: 'attributeName',
        suggestion: 'Use a more specific name that describes the attribute',
        category: 'best-practice',
      });
    }

    // Check for abbreviations
    if (attributeName.length <= 3 && attributeName === attributeName.toUpperCase()) {
      warnings.push({
        code: 'ABBREVIATION',
        message: `Attribute name '${attributeName}' appears to be an abbreviation`,
        field: 'attributeName',
        suggestion: 'Consider using the full word for better readability',
        category: 'best-practice',
      });
    }
  }

  /**
   * Get all reserved attribute names
   */
  getReservedNames(): string[] {
    return [...this.rules.reservedNames];
  }

  /**
   * Check if a name is reserved
   */
  isNameReserved(name: string): boolean {
    return this.isReservedName(name);
  }

  /**
   * Get suggested attribute names for common product types
   */
  getSuggestedAttributeNames(productType: string): string[] {
    const suggestions: Record<string, string[]> = {
      'clothing': ['Color', 'Size', 'Material', 'Brand', 'Style', 'Gender', 'AgeGroup'],
      'electronics': ['Brand', 'Model', 'Color', 'Storage', 'ScreenSize', 'Connectivity'],
      'home': ['Color', 'Material', 'Dimensions', 'Style', 'Brand', 'Room'],
      'beauty': ['Brand', 'Type', 'SkinType', 'Color', 'Size', 'Fragrance'],
      'sports': ['Brand', 'Size', 'Color', 'Sport', 'Gender', 'AgeGroup'],
      'books': ['Author', 'Publisher', 'Language', 'Format', 'Genre', 'Edition'],
      'toys': ['Brand', 'AgeGroup', 'Gender', 'Type', 'Color', 'Material'],
      'jewelry': ['Material', 'Color', 'Size', 'Brand', 'Type', 'Gender'],
      'automotive': ['Brand', 'Model', 'Year', 'Color', 'Type', 'Engine'],
      'food': ['Brand', 'Type', 'Size', 'Flavor', 'Dietary', 'Origin'],
    };

    return suggestions[productType.toLowerCase()] || [
      'Color', 'Size', 'Material', 'Brand', 'Type', 'Style',
    ];
  }
}
