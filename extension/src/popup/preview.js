// Browsers only accept image/png on the clipboard, so re-encode WebP/JPEG first.
async function toPngBlob(blob) {
  if (blob.type === 'image/png') return blob;
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close?.();
  return await new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png')
  );
}

export async function copyCaptureToClipboard(dataUrl) {
  try {
    const res = await fetch(dataUrl);
    const png = await toPngBlob(await res.blob());
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    return true;
  } catch (err) {
    console.error('Clipboard copy failed:', err);
    return false;
  }
}

export function buildFilename(url, format = 'webp', ts = Date.now()) {
  let site = 'screenshot';
  try { site = new URL(url).hostname.replace(/^www\./, '') || site; } catch (e) {}
  site = site.replace(/[^a-zA-Z0-9.\-]/g, '-');
  const d = new Date(ts), p = n => String(n).padStart(2, '0');
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  return `${site}-${stamp}.${(format || 'webp').toLowerCase()}`;
}

export async function triggerDownload(dataUrl, format = 'webp', filename = null, url = null) {
  if (!dataUrl) {
    console.error('Download failed: No dataUrl provided');
    return false;
  }

  const ext = (format || 'webp').toLowerCase();
  const name = filename || (url ? buildFilename(url, ext) : `hokusai-${Date.now()}.${ext}`);

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


