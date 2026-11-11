import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, existsSync, rmSync } from 'fs';

const watch = process.argv.includes('--watch');

rmSync('dist', { recursive: true, force: true });
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

const shared = {
  bundle: true,
  minify: !watch,
  format: 'esm',
  target: 'firefox115',
};

const ctx = await esbuild.context({
  entryPoints: {
    'popup/popup.bundle':           'src/popup/popup.js',
    'background/background.bundle': 'src/background/background.js',
    'content/content.bundle':       'src/content/content.js',
  },
  outdir: 'dist',
  ...shared,
});

function copyAssets() {
  cpSync('src/popup/index.html', 'dist/popup/index.html', { recursive: true });
  cpSync('src/popup/popup.css', 'dist/popup/popup.css', { recursive: true });
  if (existsSync('assets')) {
    cpSync('assets/', 'dist/assets/', { recursive: true });
  }
  cpSync('manifest.json', 'dist/manifest.json');
}

copyAssets();

if (watch) {
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete → dist/');
}
