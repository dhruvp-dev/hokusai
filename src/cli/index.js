#!/usr/bin/env node

import path from 'path';
import { parseArgs } from 'node:util';
import { chromium } from 'playwright';
import defaultConfig, { applyCliOverrides } from '../config.js';
import { discover } from '../engine/discover/index.js';
import { normalize } from '../engine/discover/normalize.js';
import { capture } from '../engine/capture/index.js';
import { applyFrames } from '../engine/frame/index.js';
import OutputManager from '../engine/frame/output.js';
import Reporter from '../engine/report/index.js';
import HtmlProvider from '../providers/html/index.js';
import UrlProvider from '../providers/url/index.js';
import { parseAndNormalizeUrl, slugFromUrl } from '../utils/url.js';
import Site from '../models/Site.js';

function printHelp() {
  console.log(`
Hokusai - Beautiful website screenshots. Zero configuration.

Usage:
  hokusai [target-directory] [options]
  hokusai-ss [target-directory] [options]

Options:
  -u, --url <url>                     Capture a live website URL (can be specified multiple times).
                                      Example: -u https://example.com -u https://vercel.com
  -v, --viewport <name:widthxheight>  Override or add a viewport configuration (can be specified multiple times).
                                      Example: -v desktop:1920x1080 -v widescreen:2560x1440
  -b, --background <color>            Override background color (hex, rgb, or CSS color name).
                                      Example: -b "#ffffff" or -b "rgba(0,0,0,0.5)"
  -p, --padding <number>              Override padding size in pixels.
                                      Example: -p 60
  --no-frame                          Disable device frames entirely.
  -h, --help                          Show this help message.

Defaults:
  Target Directory:  Current working directory
  Padding:           40px
  Background:        #0f0f14
  Viewports:         desktop (1440x900), tablet (1024x1366), mobile (390x844)
`);
}

async function main() {
  const startTime = Date.now();

  let args;
  try {
    args = parseArgs({
      args: process.argv.slice(2),
      options: {
        url: { type: 'string', short: 'u', multiple: true },
        viewport: { type: 'string', short: 'v', multiple: true },
        background: { type: 'string', short: 'b' },
        padding: { type: 'string', short: 'p' },
        frame: { type: 'boolean', default: true },
        'no-frame': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
      },
      strict: true,
      allowPositionals: true,
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    console.log('Run with -h or --help to see usage instructions.');
    process.exit(1);
  }

  const { values, positionals } = args;

  if (values.help) {
    printHelp();
    return;
  }

  if (values['no-frame']) {
    values.frame = false;
  }

  // 1. Resolve target scan directory and configuration overrides
  const config = applyCliOverrides(defaultConfig, values);
  const targetArg = positionals[0];
  const targetDir = targetArg ? path.resolve(process.cwd(), targetArg) : process.cwd();

  const sites = [];

  // 2a. Discover local sites if positional arg is provided OR if no --url flag is passed
  const hasUrlOption = values.url && values.url.length > 0;
  if (targetArg || !hasUrlOption) {
    const sitePaths = await discover(targetDir, config.exclude);
    for (const sitePath of sitePaths) {
      const { slug, displayName } = normalize(sitePath, targetDir);
      sites.push(new Site({ slug, displayName, absolutePath: sitePath }));
    }
  }

  // 2b. Add live URL targets
  if (hasUrlOption) {
    const urlList = Array.isArray(values.url) ? values.url : [values.url];
    for (const rawUrl of urlList) {
      try {
        const parsed = parseAndNormalizeUrl(rawUrl);
        const slug = slugFromUrl(parsed);
        const displayName = parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '');
        sites.push(new Site({ slug, displayName, absolutePath: parsed.href, isUrl: true }));
      } catch (err) {
        console.error(`Error: Invalid URL '${rawUrl}' - ${err.message}`);
        process.exit(1);
      }
    }
  }

  const reporter = new Reporter();
  reporter.start(sites.length);

  if (sites.length === 0) {
    console.log('No websites containing index.html or target URLs were found.');
    return;
  }

  // 4. Initialize output manager (always output to process.cwd()/screenshots)
  const outputDir = path.resolve(process.cwd(), config.outputDir);
  const outputManager = new OutputManager(outputDir);
  await outputManager.ensureOutputDir();

  // 5. Launch Playwright
  const browser = await chromium.launch({ headless: true });
  let totalScreenshots = 0;

  // 6. Process sites sequentially
  for (const site of sites) {
    const siteStartTime = Date.now();
    reporter.siteStarted(site);

    let providerResult = null;
    let page = null;

    try {
      // Prepare site source (local static server or live URL)
      const provider = site.isUrl ? new UrlProvider() : new HtmlProvider();
      site.provider = provider;
      providerResult = await provider.prepare(site.absolutePath);
      site.url = providerResult.url;

      // Open a fresh page per site
      page = await browser.newPage();
      await page.goto(site.url);

      // Capture raw screenshots
      const rawShots = await capture(page, site, config, outputManager);

      // Apply frames & post-processing
      const finalShots = await applyFrames(rawShots, config, outputManager);
      site.screenshots = finalShots;
      totalScreenshots += finalShots.length;

      // Cleanup page and server
      await page.close();
      await providerResult.teardown();

      site.durationMs = Date.now() - siteStartTime;
      reporter.siteFinished(site, finalShots, site.durationMs);
    } catch (err) {
      site.errors.push(err);
      reporter.siteFailed(site, err);

      // Ensure cleanup in case of errors
      if (page) {
        try {
          await page.close();
        } catch (_) {}
      }
      if (providerResult) {
        try {
          await providerResult.teardown();
        } catch (_) {}
      }
    }
  }

  // 7. Cleanup browser
  await browser.close();

  // 8. Output final summary
  const totalDuration = Date.now() - startTime;
  reporter.summary(sites.length, totalScreenshots, totalDuration, outputDir);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
