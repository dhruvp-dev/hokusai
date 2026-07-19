const config = {
  outputDir: 'screenshots',
  exclude: ['node_modules', '.git', 'screenshots', 'hokusai', 'src'],
  basePort: 8700,

  viewports: [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet',  width: 1024, height: 1366 },
    { name: 'mobile',  width: 390,  height: 844 },
  ],

  screenshot: {
    quality: 90,
    waitBufferMs: 300,
  },

  frame: {
    enabled: true,
    shadow: true,
    padding: 40,
    background: '#0f0f14',
    titleBarHeight: 44,
  },
};

export default config;

/**
 * Applies CLI argument overrides to the base configuration.
 * @param {Object} baseConfig - The base configuration object
 * @param {Object} cliArgs - Parsed CLI arguments
 * @returns {Object} A new configuration object with overrides applied
 */
export function applyCliOverrides(baseConfig, cliArgs) {
  const merged = JSON.parse(JSON.stringify(baseConfig));

  if (cliArgs.background !== undefined) {
    merged.frame.background = cliArgs.background;
  }

  if (cliArgs.padding !== undefined) {
    const padding = parseInt(cliArgs.padding, 10);
    if (!isNaN(padding)) {
      merged.frame.padding = padding;
    }
  }

  if (cliArgs.frame !== undefined) {
    merged.frame.enabled = cliArgs.frame;
  }

  if (cliArgs.viewport && cliArgs.viewport.length > 0) {
    const viewportsToParse = Array.isArray(cliArgs.viewport)
      ? cliArgs.viewport
      : [cliArgs.viewport];

    for (const vpStr of viewportsToParse) {
      const parts = vpStr.split(':');
      if (parts.length === 2) {
        const name = parts[0].trim();
        const dims = parts[1].split('x');
        if (dims.length === 2) {
          const width = parseInt(dims[0], 10);
          const height = parseInt(dims[1], 10);
          if (!isNaN(width) && !isNaN(height)) {
            const existingIndex = merged.viewports.findIndex((v) => v.name === name);
            if (existingIndex !== -1) {
              merged.viewports[existingIndex] = { name, width, height };
            } else {
              merged.viewports.push({ name, width, height });
            }
          }
        }
      }
    }
  }

  return merged;
}

