import { buildOutputPath } from '../../utils/paths.js';
import { ensureDir, deleteFile, exists } from '../../utils/files.js';

export default class OutputManager {
  /**
   * @param {string} outputDir - Absolute or relative path to the output screenshots folder
   */
  constructor(outputDir) {
    this.outputDir = outputDir;
  }

  /**
   * Ensures output directory exists.
   */
  async ensureOutputDir() {
    await ensureDir(this.outputDir);
  }

  /**
   * Builds the output path for a given slug, viewport and suffix.
   * @param {string} slug
   * @param {string} viewport
   * @param {string} [suffix='']
   * @returns {string}
   */
  createOutputPath(slug, viewport, suffix = '') {
    return buildOutputPath(this.outputDir, slug, viewport, suffix);
  }

  /**
   * Deletes a file.
   * @param {string} filePath
   */
  async cleanup(filePath) {
    await deleteFile(filePath);
  }

  /**
   * Checks if file exists.
   * @param {string} filePath
   * @returns {boolean}
   */
  async exists(filePath) {
    return exists(filePath);
  }
}
