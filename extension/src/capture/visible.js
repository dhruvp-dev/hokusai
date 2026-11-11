export async function captureVisible(_tabId) {
  if (typeof browser !== 'undefined' && browser.tabs?.captureVisibleTab) {
    return await browser.tabs.captureVisibleTab(null, { format: 'png' });
  }
  throw new Error('browser.tabs.captureVisibleTab API not available');
}
