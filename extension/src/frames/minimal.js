import { createCanvas, loadImage, canvasToDataUrl, drawBackground } from './shared/canvas.js';
import { cardDimensions, roundRect } from './shared/geometry.js';
import { drawShadow } from './shared/shadow.js';

export async function renderMinimal(dataUrl, opts = {}) {
  const img = await loadImage(dataUrl);
  const imgW = img.width;
  const imgH = img.height;

  const bg = opts.background || '#0f0f14';
  const quality = opts.quality || 90;
  const format = opts.format || 'webp';
  const paddingVal = typeof opts.padding === 'number' ? opts.padding : 40;

  const dims = cardDimensions(imgW, imgH, 0, paddingVal);
  const { cardWidth, cardHeight, canvasWidth, canvasHeight, padding } = dims;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // Backdrop
  drawBackground(ctx, canvasWidth, canvasHeight, bg);

  // Soft shadow
  drawShadow(ctx, {
    x: padding,
    y: padding,
    width: cardWidth,
    height: cardHeight,
    radius: 12,
    blur: 24,
    opacity: 0.35,
    offsetY: 8
  });

  // Rounded image clip
  ctx.save();
  roundRect(ctx, padding, padding, cardWidth, cardHeight, 12);
  ctx.clip();
  ctx.drawImage(img, padding, padding, cardWidth, cardHeight);
  ctx.restore();

  return await canvasToDataUrl(canvas, format, quality / 100);
}
