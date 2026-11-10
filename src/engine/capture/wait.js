/**
 * Waits for network idle, font loading, image loading, and a short buffer
 * to ensure page contents are stable before screenshot.
 * 
 * Includes 5-second timeouts for fonts and images to remain resilient to
 * broken assets or lazy-loaded assets.
 * 
 * @param {import('playwright').Page} page
 * @param {number} [bufferMs=300] - safety buffer duration
 * @param {number} [delayMs=0] - additional user-defined wait duration in ms
 * @returns {Promise<void>}
 */
export async function waitUntilStable(page, bufferMs = 300, delayMs = 0) {
  // 1. Wait for network connections to drop to 0 (default timeout 30s is fine, or set to 10s)
  try {
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (err) {
    // Proceed even if network doesn't completely quiet down (e.g. infinite polling/websockets)
  }

  // 2. Wait for web fonts to load (max 5s)
  try {
    await page.waitForFunction(() => document.fonts.ready, null, { timeout: 5000 });
  } catch (err) {
    // Proceed if fonts take too long
  }

  // 3a. Scroll through the page so lazy-loaded images (loading="lazy") start
  // fetching, then return to the top for a clean full-page capture.
  try {
    await page.evaluate(async () => {
      const step = Math.max(window.innerHeight, 400);
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
      window.scrollTo(0, 0);
    });
  } catch (err) {
    // Scrolling is best-effort; continue if the page blocks it
  }

  // 3b. Wait for all image tags to load completely (max 5s)
  try {
    await page.waitForFunction(() => {
      const images = Array.from(document.images);
      return images.every((img) => {
        // If it's complete, it's either loaded or broken.
        // We accept complete images even if they are broken (naturalWidth === 0)
        // to prevent hanging on broken assets.
        return img.complete;
      });
    }, null, { timeout: 5000 });
  } catch (err) {
    // Proceed if images take too long (e.g. lazy loaded or slow external images)
  }

  // 4. Wait for active CSS and Web Animations to complete/settle (max 3s)
  try {
    await page.waitForFunction(() => {
      if (!document.getAnimations) return true;
      const animations = document.getAnimations();
      return animations.every((anim) => anim.playState === 'finished' || anim.playState === 'paused');
    }, null, { timeout: 3000 });
  } catch (err) {
    // Proceed if animations don't settle within timeout
  }

  // 5. User-configured delay if specified
  if (delayMs > 0) {
    await page.waitForTimeout(delayMs);
  }

  // 6. Final safety timeout
  await page.waitForTimeout(bufferMs);
}
