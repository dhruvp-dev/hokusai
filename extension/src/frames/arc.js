import { createCanvas, loadImage, canvasToDataUrl, drawBackground } from './shared/canvas.js';
import { cardDimensions, roundRect } from './shared/geometry.js';
import { drawShadow } from './shared/shadow.js';
import { drawText } from './shared/text.js';

export async function renderArc(dataUrl, opts = {}) {
  const img = await loadImage(dataUrl);
  const imgW = img.width;
  const imgH = img.height;

  const bg = opts.background || '#0f0f14';
  const quality = Number(opts.quality) || 90;
  const format = opts.format || 'webp';
  const paddingVal = Number(opts.padding) || 40;

  const dims = cardDimensions(imgW, imgH, 44, paddingVal);
  const { cardWidth, cardHeight, canvasWidth, canvasHeight, titleBarHeight, padding } = dims;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  // 1. Fill backdrop canvas
  drawBackground(ctx, canvasWidth, canvasHeight, bg);

  // 2. Drop Shadow
  drawShadow(ctx, {
    x: padding,
    y: padding,
    width: cardWidth,
    height: cardHeight,
    radius: 12,
    blur: 24,
    opacity: 0.4,
    offsetY: 10
  });

  // 3. Card Base & Clip
  ctx.save();
  roundRect(ctx, padding, padding, cardWidth, cardHeight, 12);
  ctx.clip();

  // Chrome Background
  ctx.fillStyle = '#1e1e22';
  ctx.fillRect(padding, padding, cardWidth, titleBarHeight);

  // Traffic lights
  const cy = padding + titleBarHeight / 2;
  ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(padding + 20, cy, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(padding + 40, cy, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(padding + 60, cy, 6, 0, Math.PI * 2); ctx.fill();

  // URL Bar
  const urlWidth = Math.min(cardWidth * 0.4, 400);
  const urlX = padding + (cardWidth - urlWidth) / 2;
  const urlY = padding + (titleBarHeight - 26) / 2;
  
  ctx.fillStyle = '#2a2a2e';
  roundRect(ctx, urlX, urlY, urlWidth, 26, 6);
  ctx.fill();

  drawText(ctx, opts.url || 'localhost', {
    x: padding + cardWidth / 2,
    y: cy,
    size: 11,
    color: '#8e8e93',
    align: 'center'
  });

  // Draw screenshot image
  ctx.drawImage(img, padding, padding + titleBarHeight, cardWidth, imgH);
  ctx.restore();

  return await canvasToDataUrl(canvas, format, quality / 100);
}
