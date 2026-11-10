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

/**
 * Collapses scroll-pinned sections ("sticky" stages inside a very tall runway)
 * to their natural height. In a full-page screenshot such sections show the
 * pinned stage once and leave the rest of the runway as an empty band.
 *
 * Only call this before a full-page capture; it changes page layout.
 *
 * @param {import('playwright').Page} page
 * @returns {Promise<number>} Number of pinned stages that were collapsed
 */
export async function collapseScrollRunways(page) {
  try {
    return await page.evaluate(() => {
      const vh = window.innerHeight;
      let collapsed = 0;
      const stickies = [...document.querySelectorAll('body *')].filter(
        (el) => getComputedStyle(el).position === 'sticky'
      );

      for (const stage of stickies) {
        const stageH = stage.getBoundingClientRect().height;
        // Skip small sticky elements such as navigation bars.
        if (stageH < vh * 0.4) continue;

        const runways = [];
        for (let el = stage.parentElement; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
          if (el.getBoundingClientRect().height > stageH + vh * 0.75) runways.push(el);
        }
        if (runways.length === 0) continue;

        // Mark elements and collapse them via a stylesheet rule. A stylesheet
        // !important beats inline heights that the page's own scripts re-apply
        // on resize (Playwright resizes the viewport during full-page captures).
        for (const el of runways) el.setAttribute('data-hokusai-collapse', '');
        stage.setAttribute('data-hokusai-stage', '');
        collapsed += 1;
      }
      if (collapsed > 0 && !document.getElementById('hokusai-collapse-style')) {
        const style = document.createElement('style');
        style.id = 'hokusai-collapse-style';
        style.textContent =
          '[data-hokusai-collapse]{height:auto !important;min-height:0 !important;}' +
          '[data-hokusai-stage]{position:relative !important;top:auto !important;}';
        document.head.appendChild(style);
      }
      return collapsed;
    });
  } catch (err) {
    // Best-effort; fall back to the unmodified layout
    return 0;
  }
}
