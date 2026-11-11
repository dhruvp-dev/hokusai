import http from 'http';
import handler from 'serve-handler';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { getFreePort } from '../../utils/ports.js';
import { waitForServer } from '../../utils/wait-server.js';

export default class NextProvider {
  /**
   * Prepares a Next.js site directory to be served.
   * Uses pre-built out/ static export if present, otherwise starts Next.js dev server.
   * 
   * @param {string} siteDir - Absolute path of the site directory to host
   * @returns {Promise<{ url: string, teardown: () => Promise<void> }>}
   */
  async prepare(siteDir) {
    const port = await getFreePort(3000);
    const outPath = path.join(siteDir, 'out');

    // 1. If static export out/ exists, serve static assets directly
    if (fs.existsSync(path.join(outPath, 'index.html'))) {
      const server = http.createServer((request, response) => {
        return handler(request, response, {
          public: outPath,
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

      return { url, teardown };
    }

    // 2. Otherwise launch Next.js dev server
    const isWindows = process.platform === 'win32';
    const npxCmd = isWindows ? 'npx.cmd' : 'npx';
    const child = spawn(
      npxCmd,
      ['next', 'dev', '-p', String(port), '--hostname', '127.0.0.1'],
      {
        cwd: siteDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        detached: false,
      }
    );

    const url = `http://127.0.0.1:${port}`;

    try {
      await waitForServer(url, 30000);
    } catch (err) {
      child.kill('SIGTERM');
      throw new Error(`Failed to start Next.js server for ${siteDir}: ${err.message}`, { cause: err });
    }

    const teardown = async () => {
      return new Promise((resolve) => {
        child.on('exit', () => resolve());
        child.kill('SIGTERM');
        // Force kill if not exited after 3 seconds
        setTimeout(() => {
          try { child.kill('SIGKILL'); } catch (_) {}
          resolve();
        }, 3000);
      });
    };

    return { url, teardown };
  }
}
