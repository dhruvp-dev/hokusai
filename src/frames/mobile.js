import sharp from 'sharp';
import { ensureDir } from '../utils/files.js';
import path from 'path';

export default class MobileFrame {
  /**
   * Renders a mobile phone shell frame around the screenshot and saves it.
   * @param {Object} params
   * @param {string} params.inputPath - path to raw screenshot
   * @param {string} params.outputPath - path to save framed screenshot
   * @param {number} params.width - width of viewport (390)
   * @param {number} params.height - height of viewport (844)
   * @param {Object} params.config - frame configuration
   */
  async render({ inputPath, outputPath, width, height, config }) {
    const padding = config.padding ?? 40;
    const titleBarHeight = 40;
    const cardWidth = width;
    const cardHeight = height + titleBarHeight;
    const canvasWidth = cardWidth + padding * 2;
    const canvasHeight = cardHeight + padding * 2;
    const cornerRadius = 32;

    const phoneBg = '#000000';

    // Status bar SVG
    const statusSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${titleBarHeight}">
        <!-- Background -->
        <rect width="${cardWidth}" height="${titleBarHeight}" fill="${phoneBg}" />
        
        <!-- Time -->
        <text x="32" y="25" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="14" fill="#ffffff" text-anchor="start">9:41</text>
        
        <!-- Dynamic Island / Notch -->
        <rect x="${(cardWidth - 110) / 2}" y="7" width="110" height="26" rx="13" ry="13" fill="#1e1e1e" />
        
        <!-- Signal / Wifi / Battery -->
        <!-- Signal -->
        <rect x="${cardWidth - 80}" y="17" width="3" height="8" rx="1" fill="#ffffff" />
        <rect x="${cardWidth - 75}" y="14" width="3" height="11" rx="1" fill="#ffffff" />
        <rect x="${cardWidth - 70}" y="11" width="3" height="14" rx="1" fill="#ffffff" />
        
        <!-- Wifi -->
        <circle cx="${cardWidth - 52}" cy="18" r="4" fill="none" stroke="#ffffff" stroke-width="2" />
        <circle cx="${cardWidth - 52}" cy="18" r="1" fill="#ffffff" />
        
        <!-- Battery -->
        <rect x="${cardWidth - 38}" y="13" width="22" height="11" rx="3" fill="none" stroke="#ffffff" stroke-width="1.5" />
        <rect x="${cardWidth - 36}" y="15" width="15" height="7" rx="1.5" fill="#ffffff" />
        <rect x="${cardWidth - 15}" y="16" width="1.5" height="5" rx="0.5" fill="#ffffff" />
      </svg>
    `);

    // Mask for rounded phone corners
    const maskSvg = Buffer.from(`
      <svg xmlns="http://www.w3.org/2000/svg" width="${cardWidth}" height="${cardHeight}">
        <rect x="0" y="0" width="${cardWidth}" height="${cardHeight}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#000" />
      </svg>
    `);

    // Create the phone card (status bar + screenshot)
    const cardBase = await sharp({
      create: {
        width: cardWidth,
        height: cardHeight,
        channels: 4,
        background: phoneBg
      }
    })
    .composite([
      { input: statusSvg, top: 0, left: 0 },
      { input: inputPath, top: titleBarHeight, left: 0 },
      { input: maskSvg, blend: 'dest-in', top: 0, left: 0 }
    ])
    .png()
    .toBuffer();

    // Create blurred drop shadow
    const shadowOffset = 10;
    const shadowBlur = 24;
    const shadowOpacity = 0.4;

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

    // Create final composition
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
