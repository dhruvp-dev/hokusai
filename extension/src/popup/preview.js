export async function copyCaptureToClipboard(dataUrl) {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export async function triggerDownload(dataUrl, format = 'webp', filename = null) {
  if (!dataUrl) {
    console.error('Download failed: No dataUrl provided');
    return false;
  }

  const ext = (format || 'webp').toLowerCase();
  const name = filename || `hokusai-${Date.now()}.${ext}`;

  // 1. Try sending DOWNLOAD message to background worker
  try {
    const api = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);
    if (api?.runtime?.sendMessage) {
      const response = await api.runtime.sendMessage({
        type: 'DOWNLOAD',
        dataUrl,
        format: ext,
        filename: name
      });
      if (response?.success) {
        return true;
      }
    }
  } catch (msgErr) {
    console.warn('Background message download failed, trying direct downloads API:', msgErr);
  }

  // 2. Direct WebExtension downloads API fallback
  try {
    const dlApi = (typeof browser !== 'undefined' && browser.downloads) 
      ? browser.downloads 
      : (typeof chrome !== 'undefined' && chrome.downloads) 
        ? chrome.downloads 
        : null;

    if (dlApi) {
      await dlApi.download({
        url: dataUrl,
        filename: name
      });
      return true;
    }
  } catch (dlErr) {
    console.error('Direct download API failed:', dlErr);
  }

  return false;
}


