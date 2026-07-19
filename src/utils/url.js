/**
 * Normalizes a raw URL input string. If no protocol is provided, defaults to https://
 * @param {string} input 
 * @returns {URL}
 */
export function parseAndNormalizeUrl(input) {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) {
    raw = `https://${raw}`;
  }
  return new URL(raw);
}

/**
 * Derives a filesystem-safe slug from a URL object.
 * e.g. https://staging.example.com/dashboard/ -> "staging-example-com--dashboard"
 * @param {URL} parsed 
 * @returns {string}
 */
export function slugFromUrl(parsed) {
  const host = parsed.hostname.replace(/\./g, '-');
  const pathPart = parsed.pathname
    .replace(/^\/|\/$/g, '')
    .replace(/\//g, '--')
    .replace(/[^a-zA-Z0-9-_]/g, '');
  
  return pathPart ? `${host}--${pathPart}` : host;
}
