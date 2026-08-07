export function cardDimensions(imgW, imgH, titleBarH = 44, padding = 40) {
  const cardWidth = imgW;
  const cardHeight = imgH + titleBarH;
  const canvasWidth = cardWidth + padding * 2;
  const canvasHeight = cardHeight + padding * 2;

  return {
    cardWidth,
    cardHeight,
    canvasWidth,
    canvasHeight,
    titleBarHeight: titleBarH,
    padding,
  };
}

export function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
