export function drawText(ctx, text, { x, y, size = 12, color = '#8e8e93', align = 'center', weight = 'normal' }) {
  ctx.save();
  ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.restore();
}
