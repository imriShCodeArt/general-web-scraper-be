// Transform helper tests
import {
  applyTransforms,
  applyAttributeTransforms,
  TransformSpec,
} from '../transforms';

describe('Transform Helpers', () => {
  describe('applyTransforms', () => {
    it('should apply regex replacement transform', () => {
      const text = 'Hello World';
      const transforms: TransformSpec[] = ['Hello->Hi'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hi World');
    });

    it('should apply trim transform', () => {
      const text = '  Hello World  ';
      const transforms: TransformSpec[] = ['trim:'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hello World');
    });

    it('should apply trim with specific characters', () => {
      const text = '...Hello World...';
      const transforms: TransformSpec[] = ['trim:.'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hello World');
    });

    it('should apply replace transform', () => {
      const text = 'Hello World';
      const transforms: TransformSpec[] = ['replace:World|Universe'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hello Universe');
    });

    it('should apply multiple transforms in sequence', () => {
      const text = '  Hello World  ';
      const transforms: TransformSpec[] = ['trim:', 'Hello->Hi'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hi World');
    });

    it('should handle invalid transforms gracefully', () => {
      const text = 'Hello World';
      const transforms: TransformSpec[] = ['invalid-transform', 'Hello->Hi'];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hi World');
    });

    it('should handle empty transforms array', () => {
      const text = 'Hello World';
      const transforms: TransformSpec[] = [];

      const result = applyTransforms(text, transforms);
      expect(result).toBe('Hello World');
    });
  });

  describe('applyAttributeTransforms', () => {
    it('should apply transforms to specific attributes', () => {
      const attributes = {
        color: ['red', 'blue'],
        size: ['large', 'small'],
      };
      const transformations = {
        color: ['red->crimson', 'blue->navy'],
      };

      const result = applyAttributeTransforms(attributes, transformations);

      expect(result).toEqual({
        color: ['crimson', 'navy'],
        size: ['large', 'small'],
      });
    });

    it('should leave attributes without transforms unchanged', () => {
      const attributes = {
        color: ['red', 'blue'],
        size: ['large', 'small'],
      };
      const transformations = {
        color: ['red->crimson'],
      };

      const result = applyAttributeTransforms(attributes, transformations);

      expect(result).toEqual({
        color: ['crimson', 'blue'],
        size: ['large', 'small'],
      });
    });

    it('should handle empty transformations object', () => {
      const attributes = {
        color: ['red', 'blue'],
        size: ['large', 'small'],
      };
      const transformations = {};

      const result = applyAttributeTransforms(attributes, transformations);

      expect(result).toEqual(attributes);
    });
  });
});
