import { cleanText, isPlaceholder } from '../helpers/text';

describe('helpers/text', () => {
  describe('cleanText', () => {
    it('should clean whitespace and normalize text', () => {
      const input = '  Hello    world  \n\t  ';
      const result = cleanText(input);

      expect(result).toBe('Hello world');
    });

    it('should remove multiple spaces', () => {
      const input = 'Hello    world   test';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });

    it('should remove bidirectional text markers', () => {
      const input = 'Hello\u200F\u200E world\u202A\u202B test';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });

    it('should handle empty string', () => {
      const result = cleanText('');

      expect(result).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(cleanText(null as any)).toBe('');
      expect(cleanText(undefined as any)).toBe('');
    });

    it('should handle only whitespace', () => {
      const input = '   \n\t  ';
      const result = cleanText(input);

      expect(result).toBe('');
    });

    it('should handle mixed whitespace and bidirectional markers', () => {
      const input = '  Hello\u200F   world\u202A  \n  test  ';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });

    it('should preserve single spaces', () => {
      const input = 'Hello world test';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });

    it('should handle newlines and tabs', () => {
      const input = 'Hello\nworld\ttest';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });

    it('should handle carriage returns', () => {
      const input = 'Hello\r\nworld\r\ntest';
      const result = cleanText(input);

      expect(result).toBe('Hello world test');
    });
  });

  describe('isPlaceholder', () => {
    it('should detect Hebrew placeholder text', () => {
      expect(isPlaceholder('בחר אפשרות')).toBe(true);
      expect(isPlaceholder('בחירת אפשרות')).toBe(true);
      expect(isPlaceholder('בחר אפשרות אחרת')).toBe(true);
    });

    it('should detect English placeholder text', () => {
      expect(isPlaceholder('Select option')).toBe(true);
      expect(isPlaceholder('Choose option')).toBe(true);
      expect(isPlaceholder('General')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(isPlaceholder('SELECT OPTION')).toBe(true);
      expect(isPlaceholder('choose option')).toBe(true);
      expect(isPlaceholder('GENERAL')).toBe(true);
      expect(isPlaceholder('בחר אפשרות')).toBe(true);
    });

    it('should detect partial matches', () => {
      expect(isPlaceholder('Please select option from list')).toBe(true);
      expect(isPlaceholder('Choose option below')).toBe(true);
      expect(isPlaceholder('General category')).toBe(true);
      expect(isPlaceholder('בחר אפשרות מהרשימה')).toBe(true);
    });

    it('should return false for non-placeholder text', () => {
      expect(isPlaceholder('Red')).toBe(false);
      expect(isPlaceholder('Large')).toBe(false);
      expect(isPlaceholder('Available')).toBe(false);
      expect(isPlaceholder('אדום')).toBe(false);
      expect(isPlaceholder('גדול')).toBe(false);
    });

    it('should return true for empty or null text', () => {
      expect(isPlaceholder('')).toBe(true);
      expect(isPlaceholder(null as any)).toBe(true);
      expect(isPlaceholder(undefined as any)).toBe(true);
    });

    it('should handle mixed case and special characters', () => {
      expect(isPlaceholder('Select-Option')).toBe(false); // Hyphen breaks the match
      expect(isPlaceholder('choose_option')).toBe(false); // Underscore breaks the match
      expect(isPlaceholder('General!')).toBe(true);
      expect(isPlaceholder('בחר-אפשרות')).toBe(false); // Hyphen breaks the match
    });

    it('should handle text with extra spaces', () => {
      expect(isPlaceholder('  Select option  ')).toBe(true);
      expect(isPlaceholder('  בחר אפשרות  ')).toBe(true);
      expect(isPlaceholder('\nChoose option\n')).toBe(true);
    });

    it('should handle text with numbers and symbols', () => {
      expect(isPlaceholder('Select option 1')).toBe(true);
      expect(isPlaceholder('Choose option (2)')).toBe(true);
      expect(isPlaceholder('General - 3')).toBe(true);
    });

    it('should return false for similar but different text', () => {
      expect(isPlaceholder('Selection')).toBe(false);
      expect(isPlaceholder('Chooser')).toBe(false);
      expect(isPlaceholder('Generally')).toBe(true); // Contains "General"
      expect(isPlaceholder('בחירה')).toBe(false);
    });
  });
});
