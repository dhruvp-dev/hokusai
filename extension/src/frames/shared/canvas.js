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
  if (typeof createImageBitmap !== 'undefined' && typeof fetch !== 'undefined') {
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return await createImageBitmap(blob);
    } catch (e) {
      // Fallback if fetch fails for dataUrl
    }
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image element'));
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

export function drawBackground(ctx, width, height, bg = 'dark') {
  ctx.save();
  const lowerBg = (bg || '').trim().toLowerCase();

  if (lowerBg === 'hyper') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
  } else if (lowerBg === 'midnight') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = grad;
  } else if (lowerBg === 'sunset') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f97316');
    grad.addColorStop(1, '#d946ef');
    ctx.fillStyle = grad;
  } else if (lowerBg === 'glass') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#181824');
    grad.addColorStop(1, '#2e2a4a');
    ctx.fillStyle = grad;
  } else if (lowerBg === 'dark' || lowerBg === '#0f0f14') {
    ctx.fillStyle = '#0f0f14';
  } else {
    ctx.fillStyle = bg || '#0f0f14';
  }

  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

