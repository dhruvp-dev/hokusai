/**
 * Sets the viewport size of a Playwright page.
 * 
 * @param {import('playwright').Page} page
 * @param {Object} viewport
 * @param {number} viewport.width
 * @param {number} viewport.height
 * @returns {Promise<void>}
 */
export async function setViewport(page, { width, height }) {
  await page.setViewportSize({ width, height });
}
