/**
 * Injects CSS to disable transitions and animations on the page.
 * 
 * @param {import('playwright').Page} page
 * @returns {Promise<void>}
 */
export async function injectAnimationKill(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    `,
  });
}
