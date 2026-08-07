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

export async function triggerDownload(dataUrl, format = 'webp') {
  return await browser.runtime.sendMessage({
    type: 'DOWNLOAD',
    dataUrl,
    format,
    filename: `hokusai-${Date.now()}.${format}`
  });
}
