import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { resolveSitemapUrls } from '../src/utils/sitemap.js';

function writeSitemap(xml) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hokusai-sitemap-'));
  const file = path.join(dir, 'sitemap.xml');
  fs.writeFileSync(file, xml);
  return file;
}

const urlset = `<?xml version="1.0"?>
<urlset>
  <url><loc>https://example.com/low</loc><priority>0.2</priority></url>
  <url><loc>https://example.com/high</loc><priority>0.9</priority></url>
  <url><loc>https://example.com/high</loc></url>
  <url><loc>https://example.com/a?x=1&amp;y=2</loc></url>
</urlset>`;

test('sorts by priority and removes duplicates', async () => {
  const urls = await resolveSitemapUrls(writeSitemap(urlset));
  assert.deepEqual(urls, [
    'https://example.com/high',
    'https://example.com/a?x=1&y=2',
    'https://example.com/low',
  ]);
});

test('respects the limit', async () => {
  const urls = await resolveSitemapUrls(writeSitemap(urlset), 1);
  assert.deepEqual(urls, ['https://example.com/high']);
});

test('throws for a missing file', async () => {
  await assert.rejects(resolveSitemapUrls('/nonexistent/sitemap.xml'), /not found/);
});
