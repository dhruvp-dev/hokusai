import http from 'http';

/**
 * Polls an HTTP URL until it becomes available or times out.
 * @param {string} url - Target URL to poll
 * @param {number} [timeoutMs=30000] - Maximum wait time in ms
 * @param {number} [intervalMs=250] - Polling interval in ms
 * @returns {Promise<void>}
 */
export function waitForServer(url, timeoutMs = 30000, intervalMs = 250) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    function check() {
      if (Date.now() - start > timeoutMs) {
        return reject(new Error(`Server at ${url} did not become ready within ${timeoutMs}ms`));
      }

      const req = http.get(url, () => {
        // Any HTTP status means the server is listening and ready
        req.destroy();
        resolve();
      });

      req.on('error', () => {
        setTimeout(check, intervalMs);
      });

      req.setTimeout(1000, () => {
        req.destroy();
        setTimeout(check, intervalMs);
      });
    }

    check();
  });
}
