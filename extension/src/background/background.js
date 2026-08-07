import { captureVisible } from '../capture/visible.js';
import { captureFullPage } from '../capture/fullpage.js';
import { captureResponsive } from '../capture/responsive.js';
import { applyFrame } from '../frames/index.js';
import { settings, history } from '../storage/index.js';

// Setup Context Menus
browser.runtime.onInstalled.addListener(() => {
  browser.contextMenus.create({
    id: 'hokusai-capture-visible',
    title: 'Capture with Hokusai',
    contexts: ['page', 'selection', 'link']
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'hokusai-capture-visible' && tab?.id) {
    await handleCapture('CAPTURE_VISIBLE', tab.id);
  }
});

// Setup Keyboard Commands
browser.commands.onCommand.addListener(async (command) => {
  if (command === 'capture-visible') {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await handleCapture('CAPTURE_VISIBLE', tabs[0].id);
    }
  }
});

browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type?.startsWith('CAPTURE_')) {
    (async () => {
      try {
        let tabId = msg.tabId || sender.tab?.id;
        if (!tabId) {
          const tabs = await browser.tabs.query({ active: true, currentWindow: true });
          tabId = tabs[0]?.id;
        }
        if (!tabId) throw new Error('No active tab found');
        const result = await handleCapture(msg.type, tabId, msg.options);
        sendResponse({ success: true, result });
      } catch (err) {
        console.error('Hokusai capture error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async response
  }

  if (msg.type === 'DOWNLOAD') {
    browser.downloads.download({
      url: msg.dataUrl,
      filename: msg.filename || `hokusai-${Date.now()}.${msg.format || 'webp'}`,
      saveAs: true
    }).then(id => sendResponse({ success: true, id }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function handleCapture(type, tabId, optsOverride = {}) {
  const prefs = await settings.get();
  const options = { ...prefs, ...optsOverride };

  // Get active tab meta
  let meta = { title: 'Screenshot', url: 'localhost' };
  try {
    meta = await browser.tabs.sendMessage(tabId, { type: 'GET_META' });
  } catch (e) {
    // Content script might not be injected on restricted pages
  }

  let raw;
  if (type === 'CAPTURE_FULLPAGE') {
    raw = await captureFullPage(tabId);
  } else if (type === 'CAPTURE_RESPONSIVE') {
    raw = await captureResponsive(tabId, options.device);
  } else {
    raw = await captureVisible(tabId);
  }

  const framedDataUrl = await applyFrame(raw.dataUrl || raw, options.frameStyle, {
    background: options.background,
    quality: options.quality,
    format: options.format,
    url: new URL(meta.url || 'http://localhost').hostname
  });

  const captureRecord = {
    dataUrl: framedDataUrl,
    title: meta.title,
    url: meta.url,
    timestamp: Date.now(),
    frameStyle: options.frameStyle,
    format: options.format
  };

  await history.add(captureRecord);
  return captureRecord;
}
