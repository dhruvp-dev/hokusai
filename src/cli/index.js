#!/usr/bin/env node

import path from 'path';
import { chromium } from 'playwright';
import config from '../config.js';
import { discover } from '../engine/discover/index.js';
import { normalize } from '../engine/discover/normalize.js';
import { capture } from '../engine/capture/index.js';
import { applyFrames } from '../engine/frame/index.js';
import OutputManager from '../engine/frame/output.js';
import Reporter from '../engine/report/index.js';
import HtmlProvider from '../providers/html/index.js';
import Site from '../models/Site.js';

async function main() {
  const startTime = Date.now();

  // 1. Resolve target scan directory
  const targetArg = process.argv[2];
  const targetDir = targetArg ? path.resolve(process.cwd(), targetArg) : process.cwd();

  // 2. Discover sites
  const sitePaths = await discover(targetDir, config.exclude);

  // 3. Create Site models
  const sites = sitePaths.map((sitePath) => {
    const { slug, displayName } = normalize(sitePath, targetDir);
    return new Site({ slug, displayName, absolutePath: sitePath });
  });

  const reporter = new Reporter();
  reporter.start(sites.length);

  if (sites.length === 0) {
    console.log('No websites containing index.html were found.');
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
      // Host the static site
      const provider = new HtmlProvider();
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
