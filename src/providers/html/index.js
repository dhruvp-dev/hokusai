import http from 'http';
import handler from 'serve-handler';
import { getFreePort } from '../../utils/ports.js';

export default class HtmlProvider {
  /**
   * Prepares the site directory to be served.
   * @param {string} siteDir - Absolute path of the site directory to host
   * @returns {Promise<{ url: string, teardown: () => Promise<void> }>}
   */
  async prepare(siteDir) {
    const port = await getFreePort(8700);

    const server = http.createServer((request, response) => {
      return handler(request, response, {
        public: siteDir,
        cleanUrls: true,
      });
    });

    await new Promise((resolve, reject) => {
      server.listen(port, '127.0.0.1', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const url = `http://127.0.0.1:${port}`;

    const teardown = () => {
      return new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    };

    return {
      url,
      teardown,
    };
  }
}
