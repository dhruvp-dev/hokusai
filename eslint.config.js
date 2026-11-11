import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/', 'screenshots/', 'extension/dist/', 'extension/node_modules/'] },
  js.configs.recommended,
  {
    files: ['src/**/*.js', 'test/**/*.js', 'extension/build.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }], 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    // page.evaluate() callbacks run in the browser
    files: ['src/engine/capture/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ['extension/src/**/*.js'],
    languageOptions: { ecmaVersion: 2023, sourceType: 'module', globals: { ...globals.browser, ...globals.webextensions, browser: 'readonly' } },
    rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }], 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
];
