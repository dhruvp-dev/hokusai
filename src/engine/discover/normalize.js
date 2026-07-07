import path from 'path';

/**
 * Normalizes an absolute site path into a clean slug and user-friendly display name.
 * 
 * @param {string} sitePath - Absolute path to the site directory
 * @param {string} rootDir - Root directory used to calculate the relative path
 * @returns {{ slug: string, displayName: string }}
 */
export function normalize(sitePath, rootDir) {
  const relative = path.relative(rootDir, sitePath);

  // Derive slug: split by path separator, sanitize each part, join with '--'
  const slug = relative
    .split(path.sep)
    .map((part) => {
      return part
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    })
    .filter(Boolean)
    .join('--');

  // Derive display name: split slug by '--', format each part, join with ' — '
  const displayName = slug
    .split('--')
    .map((part) => {
      // capitalize each word separated by '-'
      return part
        .split('-')
        .map((word) => {
          if (!word) return '';
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .filter(Boolean)
        .join(' ');
    })
    .join(' — ');

  return { slug, displayName };
}
