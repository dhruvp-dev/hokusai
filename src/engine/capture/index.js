import { setViewport } from './viewport.js';
import { waitUntilStable } from './wait.js';
import { injectAnimationKill } from './css.js';
import { takeScreenshot } from './screenshot.js';
import Screenshot from '../../models/Screenshot.js';

/**
 * Captures screenshots for all configured viewports and a full-page view.
 * Caps full-page height to 15,000px to prevent WebP dimensions error.
 * 
 * @param {import('playwright').Page} page
 * @param {import('../../models/Site.js').default} site
 * @param {Object} config
 * @param {Object} outputManager
 * @returns {Promise<Screenshot[]>} Discovered raw screenshots
 */
export async function capture(page, site, config, outputManager) {
  const screenshots = [];
  const quality = config.screenshot?.quality ?? 90;
  const bufferMs = config.screenshot?.waitBufferMs ?? 300;

  // 1. Capture standard viewports
  for (const vp of config.viewports) {
    await setViewport(page, vp);
    await waitUntilStable(page, bufferMs);
    await injectAnimationKill(page);

    const rawPath = outputManager.createOutputPath(site.slug, vp.name, 'raw');
    await takeScreenshot(page, {
      outPath: rawPath,
      fullPage: false,
      quality,
    });

    screenshots.push(
      new Screenshot({
        viewport: vp.name,
        width: vp.width,
        height: vp.height,
        path: rawPath,
        framed: false,
      })
    );
  }

  // 2. Capture full-page view
  // Use first viewport (desktop) to ensure desktop rendering layout
  const defaultVp = config.viewports[0] || { width: 1440, height: 900 };
  await setViewport(page, defaultVp);
  await waitUntilStable(page, bufferMs);
  await injectAnimationKill(page);

  // Measure the document height
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const maxWebpHeight = 15000;
  const fullRawPath = outputManager.createOutputPath(site.slug, 'full', 'raw');

  let usedHeight = pageHeight;
  if (pageHeight > maxWebpHeight) {
    usedHeight = maxWebpHeight;
    // Set viewport to the max height and take viewport-only screenshot
    await setViewport(page, { width: defaultVp.width, height: maxWebpHeight });
    await takeScreenshot(page, {
      outPath: fullRawPath,
      fullPage: false,
      quality,
    });
  } else {
    await takeScreenshot(page, {
      outPath: fullRawPath,
      fullPage: true,
      quality,
    });
  }

  screenshots.push(
    new Screenshot({
      viewport: 'full',
      width: defaultVp.width,
      height: usedHeight,
      path: fullRawPath,
      framed: false,
    })
  );

  return screenshots;
}
