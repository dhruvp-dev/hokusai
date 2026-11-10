import { createCanvas, loadImage, canvasToDataUrl, drawBackground } from './shared/canvas.js';
import { cardDimensions, roundRect } from './shared/geometry.js';
import { drawShadow } from './shared/shadow.js';

export async function renderMobile(dataUrl, opts = {}) {
  const img = await loadImage(dataUrl);
  const imgW = img.width;
  const imgH = img.height;

  const bg = opts.background || '#0f0f14';
  const quality = Number(opts.quality) || 90;
  const format = opts.format || 'webp';
  const paddingVal = Number(opts.padding) || 40;

  const titleBarH = 44;
  const cornerRadius = 32;
  const dims = cardDimensions(imgW, imgH, titleBarH, paddingVal);
  const { cardWidth, cardHeight, canvasWidth, canvasHeight, padding } = dims;

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
    radius: cornerRadius,
    blur: 24,
    opacity: 0.4,
    offsetY: 10
  });

  // 3. Card Base & Clip
  ctx.save();
  roundRect(ctx, padding, padding, cardWidth, cardHeight, cornerRadius);
  ctx.clip();

  // Phone background
  ctx.fillStyle = '#000000';
  ctx.fillRect(padding, padding, cardWidth, cardHeight);

  // Status Bar elements
  const cy = padding + titleBarH / 2;

  // Time (9:41)
  ctx.font = '600 13px system-ui, -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', padding + 28, cy);

  // Dynamic Island / Notch in center
  const notchWidth = Math.min(110, cardWidth * 0.32);
  const notchHeight = 24;
  const notchX = padding + (cardWidth - notchWidth) / 2;
  const notchY = padding + (titleBarH - notchHeight) / 2;
  ctx.fillStyle = '#1c1c1e';
  roundRect(ctx, notchX, notchY, notchWidth, notchHeight, 12);
  ctx.fill();

  // Status Icons (Signal, Wifi, Battery) on right
  const rightStart = padding + cardWidth - 28;

  // Battery
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.2;
  roundRect(ctx, rightStart - 20, cy - 5, 20, 10, 2.5);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, rightStart - 18, cy - 3, 13, 6, 1.5);
  ctx.fill();
  roundRect(ctx, rightStart + 1, cy - 2, 1.5, 4, 0.5);
  ctx.fill();

  // Wifi
  ctx.beginPath();
  ctx.arc(rightStart - 32, cy, 3.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(rightStart - 32, cy, 1.2, 0, Math.PI * 2);
  ctx.fill();

  // Signal bars
  ctx.fillRect(rightStart - 54, cy + 1, 2.5, 6);
  ctx.fillRect(rightStart - 49, cy - 2, 2.5, 9);
  ctx.fillRect(rightStart - 44, cy - 5, 2.5, 12);

  // Draw screenshot image below status bar
  ctx.drawImage(img, padding, padding + titleBarH, cardWidth, imgH);
  ctx.restore();

  return await canvasToDataUrl(canvas, format, quality / 100);
}
