/**
 * Represents a site found during discovery.
 */
export default class Site {
  /**
   * @param {Object} params
   * @param {string} params.slug
   * @param {string} params.displayName
   * @param {string} params.absolutePath
   */
  constructor({ slug, displayName, absolutePath }) {
    this.slug = slug;
    this.displayName = displayName;
    this.absolutePath = absolutePath;

    // Filled during pipeline execution
    this.provider = null;
    this.url = null;
    /** @type {import('./Screenshot.js').default[]} */
    this.screenshots = [];
    /** @type {Error[]} */
    this.errors = [];
    this.durationMs = 0;
  }
}
