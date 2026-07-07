import sharp from 'sharp';
import { ensureDir } from '../utils/files.js';
import path from 'path';

export default class ArcFrame {
  /**
   * Renders a browser frame around the screenshot and saves it.
   * @param {Object} params
   * @param {string} params.inputPath - path to raw screenshot
   * @param {string} params.outputPath - path to save framed screenshot
   * @param {number} params.width - width of viewport
   * @param {number} params.height - height of viewport
   * @param {Object} params.config - frame configuration
   */
  async render({ inputPath, outputPath, width, height, config }) {
    const padding = config.padding ?? 40;
    const titleBarHeight = config.titleBarHeight ?? 44;
    const cardWidth = width;
    const cardHeight = height + titleBarHeight;
    const canvasWidth = cardWidth + padding * 2;
    const canvasHeight = cardHeight + padding * 2;
    const cornerRadius = 12;

    // 1. Browser Chrome SVG
    const chromeBg = '#1e1e22';
    const urlBg = '#2a2a2e';
    const urlText = 'localhost:8700';

    const urlWidth = Math.min(cardWidth * 0.4, 400);
    const urlX = (cardWidth - urlWidth) / 2;
    const urlY = (titleBarHeight - 26) / 2;

    const chromeSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${titleBarHeight}">
        <!-- Background -->
        <rect width="${cardWidth}" height="${titleBarHeight}" fill="${chromeBg}" />
        
        <!-- Traffic lights -->
        <circle cx="20" cy="${titleBarHeight / 2}" r="6" fill="#ff5f56" />
        <circle cx="40" cy="${titleBarHeight / 2}" r="6" fill="#ffbd2e" />
        <circle cx="60" cy="${titleBarHeight / 2}" r="6" fill="#27c93f" />
        
        <!-- URL Bar -->
        <rect x="${urlX}" y="${urlY}" width="${urlWidth}" height="26" rx="6" ry="6" fill="${urlBg}" />
        <text x="${cardWidth / 2}" y="${titleBarHeight / 2 + 4}" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#8e8e93" text-anchor="middle">${urlText}</text>
      </svg>
    `);

    // 2. Card corner masking mask
    const maskSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}">
        <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#000" />
      </svg>
    `);

    // 3. Create the rounded card (chrome + screenshot)
    const cardBase = await sharp({
      create: {
        width: cardWidth,
        height: cardHeight,
        channels: 4,
        background: chromeBg
      }
    })
    .composite([
      { input: chromeSvg, top: 0, left: 0 },
      { input: inputPath, top: titleBarHeight, left: 0 },
      { input: maskSvg, blend: 'dest-in', top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

    // 4. Create blurred drop shadow
    const shadowOffset = 8;
    const shadowBlur = 20;
    const shadowOpacity = 0.35;

    const shadowSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${canvasWidth}" height="${canvasHeight}">
        <rect x="${padding}" y="${padding + shadowOffset}" width="${cardWidth}" height="${cardHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="rgba(0,0,0,${shadowOpacity})" />
      </svg>
    `);

    const blurredShadow = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([{ input: shadowSvg, top: 0, left: 0 }])
    .blur(shadowBlur)
    .png()
    .toBuffer();

    // 5. Create final composition
    await ensureDir(path.dirname(outputPath));

    await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: config.background ?? '#0f0f14'
      }
    })
    .composite([
      { input: blurredShadow, top: 0, left: 0 },
      { input: cardBase, top: padding, left: padding }
    ])
    .webp({ quality: config.quality ?? 90 })
    .toFile(outputPath);
  }
}
