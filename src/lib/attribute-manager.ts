import { Product } from '@/types';
import { AttributeData } from '@/components/AttributeEditorModal';

export class AttributeManager {
  // Decode helpers to ensure Hebrew/plain text in UI
  private static decodeIfEncoded(value: string): string {
    if (!value) return value;
    let decoded = value.replace(/\+/g, ' ');
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
    return decoded;
  }

  private static decodeHtmlEntities(value: string): string {
    if (!value) return value;
    const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
    return value.replace(/&(#\d+|#x[0-9A-Fa-f]+|[A-Za-z]+);/g, (match, entity) => {
      if (entity[0] === '#') {
        if (entity[1]?.toLowerCase() === 'x') {
          const code = parseInt(entity.slice(2), 16);
          return Number.isFinite(code) ? String.fromCharCode(code) : match;
        }
        const code = parseInt(entity.slice(1), 10);
        return Number.isFinite(code) ? String.fromCharCode(code) : match;
      }
      return Object.prototype.hasOwnProperty.call(named, entity) ? named[entity] : match;
    });
  }

  private static decodeValue(value: string): string {
    return this.decodeHtmlEntities(this.decodeIfEncoded(value));
  }

  private static normalizeAttrName(raw: string): string {
    const cleaned = raw.replace(/^attribute_/, '').replace(/^pa_/, '');
    return this.decodeValue(cleaned);
  }

  /**
   * Collect all unique attributes from scraped products
   */
  static collectAttributes(products: Product[]): Record<string, string[]> {
    const attributeMap: Record<string, string[]> = {};
    
    products.forEach(product => {
      Object.entries(product.attributes).forEach(([attrName, values]) => {
        // Clean prefixes and decode attribute name
        const cleanedName = attrName.replace(/^attribute_/, '').replace(/^pa_/, '');
        const decodedName = this.decodeValue(cleanedName);

        if (!attributeMap[decodedName]) {
          attributeMap[decodedName] = [];
        }

        // Add new decoded values to the attribute
        if (values && Array.isArray(values)) {
          values.forEach(value => {
            const decoded = this.decodeValue(value);
            if (!attributeMap[decodedName].includes(decoded)) {
              attributeMap[decodedName].push(decoded);
            }
          });
        }
      });
    });
    
    return attributeMap;
  }

  /**
   * Convert edited attributes back to the format expected by CSV generation
   */
  static convertToCSVFormat(editedAttributes: AttributeData[]): Record<string, string[]> {
    const csvFormat: Record<string, string[]> = {};
    
    editedAttributes.forEach(attr => {
      // Use edited attribute name and values directly
      csvFormat[attr.name] = attr.values;
    });
    
    return csvFormat;
  }

  /**
   * Apply edited attributes to products for CSV generation
   */
  static applyEditedAttributes(products: Product[], editedAttributes: AttributeData[]): Product[] {
    const attributeMap = this.convertToCSVFormat(editedAttributes);

    // Build name mapping and value mapping
    const nameMap = new Map<string, string>();
    const valueMapByName = new Map<string, Map<string, string>>();
    editedAttributes.forEach(edited => {
      edited.originalNames.forEach(orig => {
        nameMap.set(this.normalizeAttrName(orig), edited.name);
      });
      const vm = new Map<string, string>();
      // Map by index between originalValues and values to preserve user intent
      const maxLen = Math.max(edited.originalValues?.length || 0, edited.values.length);
      for (let i = 0; i < maxLen; i++) {
        const origVal = edited.originalValues?.[i];
        const newVal = edited.values[i] ?? edited.values[edited.values.length - 1];
        if (origVal != null && newVal != null) {
          vm.set(this.decodeValue(origVal), newVal);
        }
      }
      // Also map identity for any values not explicitly remapped
      edited.values.forEach(v => {
        const dv = this.decodeValue(v);
        if (!vm.has(dv)) vm.set(dv, v);
      });
      valueMapByName.set(edited.name, vm);
      // Also map using original name key for easier lookup
      edited.originalNames.forEach(orig => {
        valueMapByName.set(this.normalizeAttrName(orig), vm);
      });
    });

    return products.map(product => {
      const newAttributes: Record<string, string[]> = {};

      // Remap product attribute names/values to edited ones where applicable
      Object.entries(product.attributes).forEach(([attrName, values]) => {
        const normalized = this.normalizeAttrName(attrName);
        const targetName = nameMap.get(normalized) || normalized;
        const vm = valueMapByName.get(targetName) || valueMapByName.get(normalized);
        const newValues: string[] = [];
        (values || []).forEach(v => {
          const dv = this.decodeValue(v);
          const mapped = vm?.get(dv) ?? dv;
          if (!newValues.includes(mapped)) newValues.push(mapped);
        });
        newAttributes[targetName] = newValues;
      });

      // If nothing matched but edits exist, apply the global edited map
      if (Object.keys(product.attributes).length > 0 && Object.keys(newAttributes).length === 0) {
        Object.assign(newAttributes, attributeMap);
      }

      // Remap variation meta keys/values to match edited attributes
      const newVariations = (product.variations || []).map(variation => {
        if (!variation?.meta) return variation;
        const newMeta: Record<string, any> = {};
        Object.entries(variation.meta).forEach(([k, v]) => {
          if (k.startsWith('attribute_')) {
            const origName = this.normalizeAttrName(k);
            const targetName = nameMap.get(origName) || origName;
            const newKey = `attribute_${targetName}`;
            const dv = this.decodeValue(String(v));
            const vm = valueMapByName.get(targetName) || valueMapByName.get(origName);
            const mapped = vm?.get(dv) ?? dv;
            newMeta[newKey] = mapped;
          } else {
            newMeta[k] = v;
          }
        });
        return { ...variation, meta: newMeta };
      });

      return {
        ...product,
        attributes: newAttributes,
        variations: newVariations
      };
    });
  }

  /**
   * Find similar attribute names for potential merging suggestions
   */
  static findSimilarAttributes(attributes: Record<string, string[]>): Array<{name: string, similar: string[]}> {
    const attributeNames = Object.keys(attributes);
    const suggestions: Array<{name: string, similar: string[]}> = [];
    
    attributeNames.forEach(name => {
      const similar = attributeNames.filter(otherName => 
        otherName !== name && 
        this.isSimilarAttribute(name, otherName)
      );
      
      if (similar.length > 0) {
        suggestions.push({ name, similar });
      }
    });
    
    return suggestions;
  }

  /**
   * Check if two attribute names are similar (for merging suggestions)
   */
  private static isSimilarAttribute(name1: string, name2: string): boolean {
    const normalized1 = name1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const normalized2 = name2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check for exact match after normalization
    if (normalized1 === normalized2) return true;
    
    // Check for common variations
    const variations = [
      ['color', 'colour'],
      ['size', 'sizes'],
      ['material', 'materials'],
      ['weight', 'weights'],
      ['length', 'lengths'],
      ['width', 'widths'],
      ['height', 'heights']
    ];
    
    return variations.some(([v1, v2]) => 
      (normalized1 === v1 && normalized2 === v2) ||
      (normalized1 === v2 && normalized2 === v1)
    );
  }
}
