// JSON extraction helpers per Phase 4

import { JSDOM } from 'jsdom';

export interface JsonMatcher {
  selector: string;
  attribute?: string;
  pattern?: RegExp;
  transform?: (text: string) => unknown;
}

export function extractJsonFromScriptTags(
  dom: JSDOM,
  matchers: JsonMatcher[],
): Record<string, unknown> {
  const doc = dom.window.document;
  const result: Record<string, unknown> = {};

  for (const matcher of matchers) {
    try {
      const elements = doc.querySelectorAll(matcher.selector);

      for (const element of elements) {
        let text = '';

        if (matcher.attribute) {
          if (matcher.attribute === 'textContent') {
            text = element.textContent || '';
          } else {
            text = element.getAttribute(matcher.attribute) || '';
          }
        } else {
          text = element.textContent || '';
        }

        if (!text) continue;

        // Apply pattern filter if provided
        if (matcher.pattern && !matcher.pattern.test(text)) {
          continue;
        }

        // Extract JSON
        let jsonData: unknown = null;

        // Try to find JSON in the text - look for complete JSON objects
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonData = JSON.parse(jsonMatch[0]);
          } catch (e) {
            // Try to extract from window object patterns
            const windowMatch = text.match(/window\.\w+\s*=\s*(\{[\s\S]*?\});/);
            if (windowMatch) {
              try {
                jsonData = JSON.parse(windowMatch[1]);
              } catch (e2) {
                continue;
              }
            }
          }
        } else {
          // Try to extract from window object patterns even without curly braces
          const windowMatch = text.match(/window\.\w+\s*=\s*(\{[\s\S]*?\});/);
          if (windowMatch) {
            try {
              jsonData = JSON.parse(windowMatch[1]);
            } catch (e2) {
              continue;
            }
          }
        }


        if (jsonData) {
          // Apply transform if provided
          if (matcher.transform) {
            jsonData = matcher.transform(jsonData as string);
          }

          // Merge into result
          result[matcher.selector] = jsonData;
        }
      }
    } catch (error) {
      // Continue with other matchers if one fails
      continue;
    }
  }

  return result;
}

export function mergeJsonProductData(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...a };

  for (const [key, value] of Object.entries(b)) {
    if (result[key] && typeof result[key] === 'object' && typeof value === 'object') {
      // Deep merge objects
      result[key] = { ...result[key], ...value };
    } else {
      // Override with new value
      result[key] = value;
    }
  }

  return result;
}

export function createJsonMatcher(
  selector: string,
  options: {
    attribute?: string;
    pattern?: RegExp;
    transform?: (text: string) => unknown;
  } = {},
): JsonMatcher {
  return {
    selector,
    ...options,
  };
}
