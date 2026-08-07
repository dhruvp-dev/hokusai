import { captureVisible } from './visible.js';

export const DEVICES = {
  desktop: { name: 'Desktop', width: 1440, height: 900 },
  laptop:  { name: 'Laptop',  width: 1280, height: 800 },
  tablet:  { name: 'Tablet',  width: 1024, height: 1366 },
  mobile:  { name: 'Mobile',  width: 390,  height: 844 },
};

export async function captureResponsive(tabId, deviceKey = 'desktop') {
  const device = DEVICES[deviceKey] || DEVICES.desktop;
  // Capture current viewport as responsive snapshot
  const dataUrl = await captureVisible(tabId);
  return {
    dataUrl,
    device
  };
}
