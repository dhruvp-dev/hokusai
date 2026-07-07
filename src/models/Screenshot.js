/**
 * Represents a generated screenshot.
 */
export default class Screenshot {
  /**
   * @param {Object} params
   * @param {string} params.viewport - 'desktop' | 'tablet' | 'mobile' | 'full'
   * @param {number} [params.width]
   * @param {number} [params.height]
   * @param {string} params.path - absolute file path
   * @param {boolean} params.framed - whether the browser frame was applied
   */
  constructor({ viewport, width, height, path, framed }) {
    this.viewport = viewport;
    this.width = width;
    this.height = height;
    this.path = path;
    this.framed = framed;
  }
}
