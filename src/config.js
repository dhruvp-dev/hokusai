export default {
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
