import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { detectSiteProvider, discover } from '../src/engine/discover/index.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'hokusai-discover-'));
}

test('detects plain html, vite and next projects', () => {
  const html = tmp();
  fs.writeFileSync(path.join(html, 'index.html'), '<h1>hi</h1>');
  assert.equal(detectSiteProvider(html), 'html');

  const vite = tmp();
  fs.writeFileSync(path.join(vite, 'vite.config.js'), '');
  assert.equal(detectSiteProvider(vite), 'vite');

  const next = tmp();
  fs.writeFileSync(path.join(next, 'package.json'), JSON.stringify({ dependencies: { next: '14' } }));
  assert.equal(detectSiteProvider(next), 'next');
});

test('discover skips parents that contain leaf sites', async () => {
  const root = tmp();
  fs.mkdirSync(path.join(root, 'a'));
  fs.mkdirSync(path.join(root, 'b'));
  fs.writeFileSync(path.join(root, 'index.html'), '');
  fs.writeFileSync(path.join(root, 'a', 'index.html'), '');
  fs.writeFileSync(path.join(root, 'b', 'index.html'), '');
  const sites = (await discover(root)).map((p) => path.basename(p)).sort();
  assert.deepEqual(sites, ['a', 'b']);
});
