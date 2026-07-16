const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';

export default class Reporter {
  /**
   * Called when Hokusai starts.
   * @param {number} totalSites
   */
  start(totalSites) {
    console.log(`\n${BOLD}📸 Hokusai${RESET}`);
    console.log(`${DIM}──────────────────────────────────────────────${RESET}`);
    console.log(`Found ${totalSites} website${totalSites === 1 ? '' : 's'}\n`);
  }

  /**
   * Called when a site starts processing.
   * @param {import('../../models/Site.js').default} site
   */
  siteStarted(site) {
    // Dimmed progress is printed on completion
  }

  /**
   * Called when a site successfully finishes capture and framing.
   * @param {import('../../models/Site.js').default} site
   * @param {import('../../models/Screenshot.js').default[]} screenshots
   * @param {number} durationMs
   */
  siteFinished(site, screenshots, durationMs) {
    const timeSec = (durationMs / 1000).toFixed(1);
    const count = screenshots.length;
    console.log(
      `  ${GREEN}✓${RESET} ${site.displayName} ${DIM}[${count} images, ${timeSec}s]${RESET}`
    );
  }

  /**
   * Called when a site processing fails.
   * @param {import('../../models/Site.js').default} site
   * @param {Error} error
   */
  siteFailed(site, error) {
    console.log(`  ${RED}✗${RESET} ${site.displayName} ${RED}— ${error.message}${RESET}`);
    console.error(error.stack);
  }

  /**
   * Called at the end of the run.
   * @param {number} totalSites
   * @param {number} totalScreenshots
   * @param {number} totalDurationMs
   * @param {string} outputDir
   */
  summary(totalSites, totalScreenshots, totalDurationMs, outputDir) {
    const timeSec = (totalDurationMs / 1000).toFixed(1);
    console.log(`${DIM}──────────────────────────────────────────────${RESET}`);
    console.log(
      `✅  Completed ${totalSites} website${totalSites === 1 ? '' : 's'}.`
    );
    console.log(
      `🖼   Generated ${totalScreenshots} screenshot${totalScreenshots === 1 ? '' : 's'} → ${CYAN}${outputDir}${RESET}`
    );
    console.log(`⏱   Total time: ${timeSec}s\n`);
  }
}
