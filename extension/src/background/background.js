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
    (async () => {
      try {
        const dlApi = (typeof browser !== 'undefined' && browser.downloads) 
          ? browser.downloads 
          : (typeof chrome !== 'undefined' && chrome.downloads) 
            ? chrome.downloads 
            : null;

        const filename = (msg.filename || `hokusai-${Date.now()}.${msg.format || 'webp'}`).replace(/[^a-zA-Z0-9.\-_]/g, '_');
        let downloadUrl = msg.dataUrl;
        let isBlobUrl = false;

        // Convert base64 dataUrl to Blob URL in background page scope
        if (msg.dataUrl && msg.dataUrl.startsWith('data:')) {
          try {
            const blob = dataURLtoBlob(msg.dataUrl);
            if (blob) {
              downloadUrl = URL.createObjectURL(blob);
              isBlobUrl = true;
            }
          } catch (blobErr) {
            console.warn('Failed to convert dataUrl to blob, using raw dataUrl:', blobErr);
          }
        }

        if (dlApi) {
          let downloadId;
          try {
            // Attempt with saveAs dialog prompt
            downloadId = await dlApi.download({
              url: downloadUrl,
              filename: filename,
              saveAs: true
            });
          } catch (e) {
            console.warn('saveAs prompt failed, retrying with direct save:', e);
            downloadId = await dlApi.download({
              url: downloadUrl,
              filename: filename,
              saveAs: false
            });
          }

          if (isBlobUrl) {
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 20000);
          }

          sendResponse({ success: true, id: downloadId });
          return;
        }

        throw new Error('downloads API not available');
      } catch (err) {
        console.error('Background download execution error:', err);

        // Failsafe Fallback: Open image in new tab if direct download API fails
        try {
          const tabApi = (typeof browser !== 'undefined' && browser.tabs) ? browser.tabs : (typeof chrome !== 'undefined' ? chrome.tabs : null);
          if (tabApi) {
            await tabApi.create({ url: msg.dataUrl });
            sendResponse({ success: true, fallback: 'tab_opened' });
            return;
          }
        } catch (tabErr) {
          console.error('Tab fallback failed:', tabErr);
        }

        sendResponse({ success: false, error: err?.message || String(err) });
      }
    })();
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

  let hostname = 'localhost';
  try {
    if (meta.url && (meta.url.startsWith('http://') || meta.url.startsWith('https://'))) {
      hostname = new URL(meta.url).hostname;
    } else if (meta.url) {
      hostname = meta.url;
    }
  } catch (e) {}

  const framedDataUrl = await applyFrame(raw.dataUrl || raw, options.frameStyle, {
    background: options.background,
    quality: options.quality,
    format: options.format,
    url: hostname
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

function dataURLtoBlob(dataurl) {
  const parts = dataurl.split(';base64,');
  if (parts.length < 2) return null;
  const mime = parts[0].split(':')[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

