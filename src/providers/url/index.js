export default class UrlProvider {
  /**
   * Prepares a live URL for capture (no-op server start).
   * @param {string} targetUrl - The live website URL to navigate to
   * @returns {Promise<{ url: string, teardown: () => Promise<void> }>}
   */
  async prepare(targetUrl) {
    return {
      url: targetUrl,
      teardown: async () => {},
    };
  }
}
