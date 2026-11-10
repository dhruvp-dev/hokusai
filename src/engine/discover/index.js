import fs from 'fs';
import path from 'path';

/**
 * Detects the framework provider type for a site directory.
 * @param {string} dirPath - Absolute path of site directory
 * @returns {'next' | 'vite' | 'html'}
 */
export function detectSiteProvider(dirPath) {
  // Check for Next.js
  const hasNextConfig = ['next.config.js', 'next.config.mjs', 'next.config.ts'].some(f => fs.existsSync(path.join(dirPath, f)));
  if (hasNextConfig) return 'next';

  const pkgPath = path.join(dirPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps['next']) return 'next';
      if (deps['vite']) return 'vite';
    } catch (_) {}
  }

  // Check for Vite
  const hasViteConfig = ['vite.config.js', 'vite.config.ts', 'vite.config.mjs', 'vite.config.cjs'].some(f => fs.existsSync(path.join(dirPath, f)));
  if (hasViteConfig) return 'vite';

  return 'html';
}

/**
 * Recursively walks directories to find folders containing an entry point
 * (index.html, Vite config, or Next.js config/package).
 * Excludes parent folders if they contain sub-folders that also have entry points (leaf-site logic).
 * 
 * @param {string} rootDir - The root directory to scan
 * @param {string[]} excludes - Directory names to ignore
 * @returns {Promise<string[]>} List of absolute paths of discovered sites
 */
export async function discover(rootDir, excludes = ['node_modules', '.git', 'screenshots', 'hokusai', 'src']) {
  const allDirsWithSite = [];

  function walk(currentDir) {
    let files;
    try {
      files = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (err) {
      // Permission issues or invalid directory
      return;
    }

    let hasSiteEntry = false;

    for (const file of files) {
      if (file.isDirectory()) {
        if (excludes.includes(file.name)) {
          continue;
        }
        walk(path.join(currentDir, file.name));
      } else if (file.isFile()) {
        const lowerName = file.name.toLowerCase();
        if (lowerName === 'index.html') {
          hasSiteEntry = true;
        } else if (
          lowerName.startsWith('next.config.') ||
          lowerName.startsWith('vite.config.')
        ) {
          hasSiteEntry = true;
        } else if (lowerName === 'package.json') {
          try {
            const pkg = JSON.parse(fs.readFileSync(path.join(currentDir, file.name), 'utf8'));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps['next'] || deps['vite']) {
              hasSiteEntry = true;
            }
          } catch (_) {}
        }
      }
    }

    if (hasSiteEntry) {
      allDirsWithSite.push(path.resolve(currentDir));
    }
  }

  walk(rootDir);

  // Apply leaf-site filter: skip any folder that is a parent of another discovered folder
  const leafSites = allDirsWithSite.filter((dir) => {
    const hasSubSite = allDirsWithSite.some((otherDir) => {
      if (otherDir === dir) return false;
      return otherDir.startsWith(dir + path.sep);
    });
    return !hasSubSite;
  });

  return leafSites;
}
