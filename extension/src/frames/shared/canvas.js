export function createCanvas(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(width, height);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export async function loadImage(dataUrl) {
  if (typeof createImageBitmap !== 'undefined') {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return await createImageBitmap(blob);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export async function canvasToDataUrl(canvas, format = 'webp', quality = 0.9) {
  const mimeType = format === 'png' ? 'image/png' : 'image/webp';
  if (canvas.convertToBlob) {
    const blob = await canvas.convertToBlob({ type: mimeType, quality });
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }
  return canvas.toDataURL(mimeType, quality);
}
