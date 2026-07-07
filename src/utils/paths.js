import path from 'path';

/**
 * Builds an absolute output path for a screenshot file.
 * @param {string} outputDir - output folder directory
 * @param {string} slug - slug identifier of the site
 * @param {string} viewportName - viewport name (desktop, tablet, mobile, full)
 * @param {string} [suffix=''] - optional suffix like 'raw'
 * @returns {string}
 */
export function buildOutputPath(outputDir, slug, viewportName, suffix = '') {
  const fileSuffix = suffix ? `-${suffix}` : '';
  const ext = suffix === 'raw' ? 'png' : 'webp';
  const filename = `${slug}-${viewportName}${fileSuffix}.${ext}`;
  return path.resolve(outputDir, filename);
}
