import sharp from 'sharp';
import { getFrameRenderer } from '../../frames/index.js';
import Screenshot from '../../models/Screenshot.js';

/**
 * Applies browser frames to raw screenshots and converts them to final WebP.
 * 
 * @param {Screenshot[]} screenshots - Array of raw Screenshot instances (.png)
 * @param {Object} config - Config object containing frame properties
 * @param {Object} outputManager - OutputManager instance
 * @returns {Promise<Screenshot[]>} Final processed Screenshots (.webp)
 */
export async function applyFrames(screenshots, config, outputManager) {
  const results = [];
  const quality = config.screenshot?.quality ?? 90;

  for (const shot of screenshots) {
    const finalPath = shot.path.replace('-raw.png', '.webp');

    // 1. If viewport is 'full' or framing is disabled or no frame renderer is found
    const frameRenderer = getFrameRenderer(shot.viewport);

    if (shot.viewport === 'full' || !config.frame?.enabled || !frameRenderer) {
      // Just convert raw PNG to final WebP with specified quality
      await sharp(shot.path)
        .webp({ quality })
        .toFile(finalPath);

      // Clean up the raw PNG
      await outputManager.cleanup(shot.path);

      results.push(
        new Screenshot({
          viewport: shot.viewport,
          width: shot.width,
          height: shot.height,
          path: finalPath,
          framed: false,
        })
      );
      continue;
    }

    // 2. Render frame (reads raw PNG, composites frame, writes final WebP)
    await frameRenderer.render({
      inputPath: shot.path,
      outputPath: finalPath,
      width: shot.width,
      height: shot.height,
      config: config.frame,
    });

    // Clean up the raw PNG
    await outputManager.cleanup(shot.path);

    results.push(
      new Screenshot({
        viewport: shot.viewport,
        width: shot.width,
        height: shot.height,
        path: finalPath,
        framed: true,
      })
    );
  }

  return results;
}
