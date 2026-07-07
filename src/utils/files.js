import fs from 'fs/promises';
import { existsSync } from 'fs';

/**
 * Ensures that a directory exists, creating it recursively if needed.
 * @param {string} dirPath
 * @returns {Promise<void>}
 */
export async function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Deletes a file if it exists.
 * @param {string} filePath
 * @returns {Promise<void>}
 */
export async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}

/**
 * Checks if a path exists.
 * @param {string} path
 * @returns {boolean}
 */
export function exists(path) {
  return existsSync(path);
}
