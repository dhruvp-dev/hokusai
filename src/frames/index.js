import ArcFrame from './arc.js';
import MobileFrame from './mobile.js';

const arcFrame = new ArcFrame();
const mobileFrame = new MobileFrame();

/**
 * Returns the appropriate frame renderer for the viewport name.
 * @param {string} viewportName - 'desktop' | 'tablet' | 'mobile' | 'full'
 * @returns {ArcFrame | MobileFrame | null}
 */
export function getFrameRenderer(viewportName) {
  if (viewportName === 'mobile') {
    return mobileFrame;
  }
  if (viewportName === 'desktop' || viewportName === 'tablet') {
    return arcFrame;
  }
  return null; // 'full' page has no frame
}
