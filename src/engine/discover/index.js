import fs from 'fs';
import path from 'path';

/**
 * Recursively walks directories to find folders containing an index.html file.
 * Excludes parent folders if they contain sub-folders that also have index.html (leaf-site logic).
 * 
 * @param {string} rootDir - The root directory to scan
 * @param {string[]} excludes - Directory names to ignore
 * @returns {Promise<string[]>} List of absolute paths of discovered sites
 */
export async function discover(rootDir, excludes = ['node_modules', '.git', 'screenshots', 'chitra', 'src']) {
  const allDirsWithIndex = [];

  function walk(currentDir) {
    let files;
    try {
      files = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      // Permission issues or invalid directory
      return;
    }

    let hasIndexHtml = false;

    for (const file of files) {
      if (file.isDirectory()) {
        if (excludes.includes(file.name)) {
          continue;
        }
        walk(path.join(currentDir, file.name));
      } else if (file.isFile() && file.name.toLowerCase() === 'index.html') {
        hasIndexHtml = true;
      }
    }

    if (hasIndexHtml) {
      allDirsWithIndex.push(path.resolve(currentDir));
    }
  }

  walk(rootDir);

  // Apply leaf-site filter: skip any folder that is a parent of another discovered folder
  const leafSites = allDirsWithIndex.filter((dir) => {
    const hasSubSite = allDirsWithIndex.some((otherDir) => {
      if (otherDir === dir) return false;
      return otherDir.startsWith(dir + path.sep);
    });
    return !hasSubSite;
  });

  return leafSites;
}
