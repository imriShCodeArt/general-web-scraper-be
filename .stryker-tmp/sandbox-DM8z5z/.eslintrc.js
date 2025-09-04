// @ts-nocheck
module.exports = {
  env: {
    node: true,
    es2020: true,
    jest: true,
    browser: true, // Add browser environment for DOM types
  },
  extends: ['eslint:recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Code quality rules
    'no-console': 'off', // Allow console statements for CLI and debugging
    'no-debugger': 'error',
    'no-unused-vars': 'off', // Use TypeScript version instead

    // Code style rules
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'always-multiline'],
    'no-trailing-spaces': 'error',
    'eol-last': 'error',

    // Error prevention rules
    'no-undef': 'error',
    'no-unreachable': 'error',
    'no-empty': 'error',
    'require-yield': 'error',

    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  globals: {
    // Add NodeJS global for Node.js types
    NodeJS: 'readonly',
  },
};
