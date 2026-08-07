import { createCanvas, loadImage, canvasToDataUrl, drawBackground } from './shared/canvas.js';
import { cardDimensions, roundRect } from './shared/geometry.js';
import { drawShadow } from './shared/shadow.js';
import { drawText } from './shared/text.js';

export async function renderFirefox(dataUrl, opts = {}) {
  const img = await loadImage(dataUrl);
  const imgW = img.width;
  const imgH = img.height;

  const bg = opts.background || '#0f0f14';
  const quality = opts.quality || 90;
  const format = opts.format || 'webp';
  const paddingVal = typeof opts.padding === 'number' ? opts.padding : 40;

  const dims = cardDimensions(imgW, imgH, 40, paddingVal);
  const { cardWidth, cardHeight, canvasWidth, canvasHeight, titleBarHeight, padding } = dims;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Backdrop
  drawBackground(ctx, canvasWidth, canvasHeight, bg);

  // Shadow
  drawShadow(ctx, {
    x: padding,
    y: padding,
    width: cardWidth,
    height: cardHeight,
    radius: 8,
    blur: 20,
    opacity: 0.35,
    offsetY: 6
  });

  // Card Base
  ctx.save();
  roundRect(ctx, padding, padding, cardWidth, cardHeight, 8);
  ctx.clip();

  // Firefox Quantum Dark Header
  ctx.fillStyle = '#2b2a33';
  ctx.fillRect(padding, padding, cardWidth, titleBarHeight);

  // Nav icons (Back/Forward placeholders)
  const cy = padding + titleBarHeight / 2;
  ctx.fillStyle = '#8f8f9d';
  ctx.font = '12px system-ui';
  ctx.fillText('‹  ›  ↻', padding + 16, cy + 4);

  // Address Bar
  const urlWidth = cardWidth - 140;
  const urlX = padding + 80;
  const urlY = padding + (titleBarHeight - 24) / 2;
  
  ctx.fillStyle = '#1c1b22';
  roundRect(ctx, urlX, urlY, urlWidth, 24, 4);
  ctx.fill();

  drawText(ctx, opts.url || 'https://mozilla.org', {
    x: urlX + 16,
    y: cy,
    size: 11,
    color: '#fbfbfe',
    align: 'left'
  });

  // Image
  ctx.drawImage(img, padding, padding + titleBarHeight, cardWidth, imgH);
  ctx.restore();

  return await canvasToDataUrl(canvas, format, quality / 100);
}
