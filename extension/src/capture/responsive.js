import { captureVisible } from './visible.js';

export const DEVICES = {
  desktop: { name: 'Desktop', width: 1440, height: 900 },
  laptop:  { name: 'Laptop',  width: 1280, height: 800 },
  tablet:  { name: 'Tablet',  width: 1024, height: 1366 },
  mobile:  { name: 'Mobile',  width: 390,  height: 844 },
};

export async function captureResponsive(tabId, deviceKey = 'desktop') {
  const device = DEVICES[deviceKey] || DEVICES.desktop;
  const api = typeof browser !== 'undefined' ? browser : chrome;

  let tab;
  try {
    tab = await api.tabs.get(tabId);
  } catch (e) {
    // If tab cannot be queried, fallback
  }

  // If tab is not a web page (e.g. internal browser page), capture directly
  if (!tab || !tab.url || tab.url.startsWith('about:') || tab.url.startsWith('chrome:')) {
    const dataUrl = await captureVisible(tabId);
    return { dataUrl, device };
  }

  let tempWindow = null;
  try {
    tempWindow = await api.windows.create({
      url: tab.url,
      width: device.width,
      height: device.height,
      type: 'popup',
      focused: true
    });

    const tempTabId = tempWindow.tabs?.[0]?.id;
    if (!tempTabId) throw new Error('Could not get tab in temporary window');

    // Wait for the tab in temporary window to complete loading
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 8000);
      function onUpdated(id, info) {
        if (id === tempTabId && info.status === 'complete') {
          clearTimeout(timer);
          api.tabs.onUpdated.removeListener(onUpdated);
          resolve();
        }
      }
      api.tabs.onUpdated.addListener(onUpdated);
    });

    // Wait brief moment for layout/fonts to settle
    await new Promise((r) => setTimeout(r, 600));

    // Capture visible tab of that window
    const dataUrl = await api.tabs.captureVisibleTab(tempWindow.id, { format: 'png' });

    // Close temporary window
    await api.windows.remove(tempWindow.id);

    return { dataUrl, device };
  } catch (err) {
    console.warn('Responsive popup capture failed, falling back to visible tab:', err);
    if (tempWindow?.id) {
      try { await api.windows.remove(tempWindow.id); } catch (_) {}
    }
    const dataUrl = await captureVisible(tabId);
    return { dataUrl, device };
  }
}
