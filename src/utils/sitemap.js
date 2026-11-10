import fs from 'fs';
import path from 'path';
import { parseAndNormalizeUrl } from './url.js';

const MAX_INDEX_DEPTH = 3;

function decodeXml(value) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
}

async function readSource(source) {
  if (/^https?:\/\//i.test(source)) {
    const res = await fetch(source, { redirect: 'follow' });
    if (!res.ok) {
      throw new Error(`Sitemap request failed (${res.status}) for ${source}`);
    }
    return res.text();
  }
  const abs = path.resolve(process.cwd(), source);
  if (!fs.existsSync(abs)) {
    throw new Error(`Sitemap file not found: ${source}`);
  }
  return fs.readFileSync(abs, 'utf8');
}

/**
 * Parses sitemap XML into page entries. Supports <urlset> and nested <sitemapindex>.
 * @param {string} source - http(s) URL or local file path
 * @param {number} [depth=0]
 * @returns {Promise<Array<{ url: string, priority: number }>>}
 */
export async function extractSitemapEntries(source, depth = 0) {
  const xml = await readSource(source);

  if (/<sitemapindex[\s>]/i.test(xml)) {
    if (depth >= MAX_INDEX_DEPTH) return [];
    const children = [...xml.matchAll(/<sitemap>[\s\S]*?<loc>([\s\S]*?)<\/loc>[\s\S]*?<\/sitemap>/gi)]
      .map((m) => decodeXml(m[1]));
    const nested = await Promise.all(
      children.map((child) => extractSitemapEntries(child, depth + 1).catch(() => []))
    );
    return nested.flat();
  }

  const entries = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)) {
    const body = block[1];
    const loc = body.match(/<loc>([\s\S]*?)<\/loc>/i);
    if (!loc) continue;
    const priorityMatch = body.match(/<priority>\s*([\d.]+)\s*<\/priority>/i);
    const priority = priorityMatch ? parseFloat(priorityMatch[1]) : 0.5;
    entries.push({ url: decodeXml(loc[1]), priority: Number.isNaN(priority) ? 0.5 : priority });
  }
  return entries;
}

/**
 * Resolves a sitemap source into a deduplicated, priority-sorted list of page URLs.
 * @param {string} source - http(s) URL or local file path
 * @param {number|null} [limit=null] - maximum number of pages to return
 * @returns {Promise<string[]>}
 */
export async function resolveSitemapUrls(source, limit = null) {
  const entries = await extractSitemapEntries(source);
  const seen = new Set();
  const unique = [];
  for (const entry of entries) {
    let normalized;
    try {
      normalized = parseAndNormalizeUrl(entry.url).href;
    } catch (_) {
      continue;
    }
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    unique.push({ url: normalized, priority: entry.priority });
  }
  // Array.prototype.sort is stable, so equal priorities keep sitemap order.
  unique.sort((a, b) => b.priority - a.priority);
  const urls = unique.map((e) => e.url);
  return limit && limit > 0 ? urls.slice(0, limit) : urls;
}
