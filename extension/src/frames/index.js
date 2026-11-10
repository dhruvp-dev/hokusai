import { renderArc } from './arc.js';
import { renderFirefox } from './firefox.js';
import { renderMinimal } from './minimal.js';
import { renderMobile } from './mobile.js';
import { createCanvas, loadImage, canvasToDataUrl } from './shared/canvas.js';

export async function applyFrame(captureInput, style = 'arc', opts = {}) {
  // If captureInput is stitched fullpage strips, assemble canvas first
  let dataUrl = captureInput;
  if (typeof captureInput === 'object' && captureInput.isStitched) {
    dataUrl = await assembleStrips(captureInput, opts);
  }

  if (style === 'none') return dataUrl;
  if (opts.device === 'mobile' || style === 'mobile') {
    return await renderMobile(dataUrl, opts);
  }
  if (style === 'arc')     return await renderArc(dataUrl, opts);
  if (style === 'firefox') return await renderFirefox(dataUrl, opts);
  if (style === 'minimal') return await renderMinimal(dataUrl, opts);
  return dataUrl;
}

async function assembleStrips(stitched, opts) {
  const { width, height, strips } = stitched;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  for (const strip of strips) {
    const img = await loadImage(strip.dataUrl);
    ctx.drawImage(img, 0, strip.y);
  }

  return await canvasToDataUrl(canvas, opts.format || 'webp', (opts.quality || 90) / 100);
}
