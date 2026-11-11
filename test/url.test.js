import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAndNormalizeUrl, slugFromUrl } from '../src/utils/url.js';

test('parseAndNormalizeUrl defaults to https', () => {
  assert.equal(parseAndNormalizeUrl('example.com').href, 'https://example.com/');
});

test('parseAndNormalizeUrl keeps explicit http for localhost', () => {
  assert.equal(parseAndNormalizeUrl('http://localhost:3000').href, 'http://localhost:3000/');
});

test('slugFromUrl builds a filesystem-safe slug', () => {
  assert.equal(slugFromUrl(new URL('https://staging.example.com/dashboard/')), 'staging-example-com--dashboard');
  assert.equal(slugFromUrl(new URL('https://example.com')), 'example-com');
});
