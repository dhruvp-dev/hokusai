import net from 'net';

/**
 * Finds a free TCP port starting from the base port.
 * @param {number} basePort
 * @returns {Promise<number>}
 */
export function getFreePort(basePort = 8700) {
  return new Promise((resolve, reject) => {
    let port = basePort;

    function checkPort() {
      const server = net.createServer();
      server.unref();

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          port++;
          checkPort();
        } else {
          reject(err);
        }
      });

      server.listen(port, '127.0.0.1', () => {
        server.close(() => {
          resolve(port);
        });
      });
    }

    checkPort();
  });
}
