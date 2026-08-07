import { roundRect } from './geometry.js';

export function drawShadow(ctx, { x, y, width, height, radius = 12, blur = 20, opacity = 0.35, offsetY = 8 }) {
  ctx.save();
  ctx.shadowColor = `rgba(0, 0, 0, ${opacity})`;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = offsetY;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();
  ctx.restore();
}
