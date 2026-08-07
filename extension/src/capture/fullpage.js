import { captureVisible } from './visible.js';

export async function captureFullPage(tabId) {
  // 1. Get page dimensions from content script
  const dims = await browser.tabs.sendMessage(tabId, { type: 'GET_DIMENSIONS' });
  const { scrollHeight, viewportHeight, viewportWidth } = dims;

  // Max height sanity cap (15000px matches CLI safety limit)
  const totalHeight = Math.min(scrollHeight, 15000);
  const totalStrips = Math.ceil(totalHeight / viewportHeight);
  const strips = [];

  // Save initial scroll position
  await browser.tabs.sendMessage(tabId, { type: 'GET_META' });

  for (let i = 0; i < totalStrips; i++) {
    const y = i * viewportHeight;
    await browser.tabs.sendMessage(tabId, { type: 'SCROLL_TO', x: 0, y });
    // Brief delay to let animations settle
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const stripDataUrl = await captureVisible(tabId);
    strips.push({ y, dataUrl: stripDataUrl });
  }

  // Restore scroll to top
  await browser.tabs.sendMessage(tabId, { type: 'SCROLL_TO', x: 0, y: 0 });

  // 2. Return strips info for canvas assembly
  return {
    isStitched: true,
    width: viewportWidth,
    height: totalHeight,
    viewportHeight,
    strips
  };
}
