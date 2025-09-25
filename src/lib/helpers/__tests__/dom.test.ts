/**
 * @jest-environment jsdom
 */
// DOM helper tests
import {
  collectRadioGroups,
  extractLabelText,
  selectText,
  selectAllText,
  selectAttr,
  extractWithFallbacks,
} from '../dom';

// Mock DOM for testing
const { JSDOM } = require('jsdom');

describe('DOM Helpers', () => {
  let mockDocument: Document;
  let mockElement: HTMLElement;

  beforeEach(() => {
    // Create a mock document using JSDOM
    const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    mockDocument = dom.window.document;
    mockElement = mockDocument.createElement('div');
    mockDocument.body.appendChild(mockElement);
  });

  describe('collectRadioGroups', () => {
    it('should collect radio groups correctly', () => {
      const container = mockDocument.createElement('div');
      container.className = 'options_group';

      const radio1 = mockDocument.createElement('input');
      radio1.type = 'radio';
      radio1.name = 'color';
      radio1.value = 'red';

      const radio2 = mockDocument.createElement('input');
      radio2.type = 'radio';
      radio2.name = 'color';
      radio2.value = 'blue';

      const radio3 = mockDocument.createElement('input');
      radio3.type = 'radio';
      radio3.name = 'size';
      radio3.value = 'large';

      container.appendChild(radio1);
      container.appendChild(radio2);
      container.appendChild(radio3);
      mockElement.appendChild(container);

      const groups = collectRadioGroups(mockElement);

      expect(groups).toHaveLength(2);
      expect(groups[0].name).toBe('color');
      expect(groups[0].inputs).toHaveLength(2);
      expect(groups[1].name).toBe('size');
      expect(groups[1].inputs).toHaveLength(1);
    });
  });

  describe('extractLabelText', () => {
    it('should extract text from title attribute', () => {
      const element = mockDocument.createElement('div');
      element.setAttribute('title', 'Test Title');

      const result = extractLabelText(element);
      expect(result).toBe('Test Title');
    });

    it('should extract text from alt attribute', () => {
      const element = mockDocument.createElement('img');
      element.setAttribute('alt', 'Test Alt');

      const result = extractLabelText(element);
      expect(result).toBe('Test Alt');
    });

    it('should extract text from textContent', () => {
      const element = mockDocument.createElement('div');
      element.textContent = 'Test Content';

      const result = extractLabelText(element);
      expect(result).toBe('Test Content');
    });
  });

  describe('selectText', () => {
    it('should select text from element', () => {
      const element = mockDocument.createElement('div');
      element.textContent = 'Test Text';
      element.className = 'test-class';
      mockElement.appendChild(element);

      const result = selectText(mockDocument, '.test-class');
      expect(result).toBe('Test Text');
    });

    it('should return empty string for non-existent element', () => {
      const result = selectText(mockDocument, '.non-existent');
      expect(result).toBe('');
    });
  });

  describe('selectAllText', () => {
    it('should select all text from multiple elements', () => {
      const element1 = mockDocument.createElement('div');
      element1.textContent = 'Text 1';
      element1.className = 'test-class';

      const element2 = mockDocument.createElement('div');
      element2.textContent = 'Text 2';
      element2.className = 'test-class';

      mockElement.appendChild(element1);
      mockElement.appendChild(element2);

      const result = selectAllText(mockDocument, '.test-class');
      expect(result).toEqual(['Text 1', 'Text 2']);
    });
  });

  describe('selectAttr', () => {
    it('should select attribute from element', () => {
      const element = mockDocument.createElement('a');
      element.href = 'https://example.com';
      element.className = 'test-link';
      mockElement.appendChild(element);

      const result = selectAttr(mockDocument, '.test-link', 'href');
      expect(result).toBe('https://example.com');
    });
  });

  describe('extractWithFallbacks', () => {
    it('should extract with primary selector', () => {
      const element = mockDocument.createElement('div');
      element.textContent = 'Primary Text';
      element.className = 'primary';
      mockElement.appendChild(element);

      const result = extractWithFallbacks(mockDocument, '.primary', ['.fallback']);
      expect(result).toBe('Primary Text');
    });

    it('should fallback to secondary selector', () => {
      const element = mockDocument.createElement('div');
      element.textContent = 'Fallback Text';
      element.className = 'fallback';
      mockElement.appendChild(element);

      const result = extractWithFallbacks(mockDocument, '.primary', ['.fallback']);
      expect(result).toBe('Fallback Text');
    });
  });
});
