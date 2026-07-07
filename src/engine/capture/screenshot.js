/**
 * Captures a raw screenshot of the page as PNG.
 * 
 * @param {import('playwright').Page} page
 * @param {Object} params
 * @param {string} params.outPath - Absolute file path to save the screenshot (.png)
 * @param {boolean} params.fullPage - Whether to capture the full page or just viewport
 * @returns {Promise<string>} Path of the written screenshot
 */
export async function takeScreenshot(page, { outPath, fullPage }) {
  await page.screenshot({
    path: outPath,
    type: 'png',
    fullPage,
  });
  return outPath;
}
