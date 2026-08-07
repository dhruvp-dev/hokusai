import * as ICONS from '../icons/icons.js';

export function setupUIElements() {
  document.getElementById('logo-icon').innerHTML = ICONS.ICON_WAVE;
  document.getElementById('btn-theme').innerHTML = ICONS.ICON_MOON;
  document.getElementById('btn-settings').innerHTML = ICONS.ICON_SETTINGS;

  document.getElementById('icon-visible').innerHTML = ICONS.ICON_LIGHTNING;
  document.getElementById('icon-fullpage').innerHTML = ICONS.ICON_SCROLL;
  document.getElementById('icon-responsive').innerHTML = ICONS.ICON_DEVICES;

  document.getElementById('btn-copy').innerHTML = `${ICONS.ICON_COPY} Copy`;
  document.getElementById('btn-download').innerHTML = `${ICONS.ICON_DOWNLOAD} Save`;
}

export function updateThemeUI(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? ICONS.ICON_MOON : ICONS.ICON_SUN;
  }
}

export function renderRecentCaptures(container, list) {
  if (!list || list.length === 0) {
    container.innerHTML = `<div class="text-muted text-center" style="font-size: 12px; padding: 12px 0;">No captures yet</div>`;
    return;
  }

  container.innerHTML = list.map(item => `
    <div class="recent-item">
      <img class="recent-thumb" src="${item.dataUrl}" alt="Thumb">
      <div class="recent-info">
        <div class="recent-url">${escapeHtml(item.url || 'localhost')}</div>
        <div class="recent-meta">${item.frameStyle.toUpperCase()} • ${item.format.toUpperCase()} • ${timeAgo(item.timestamp)}</div>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}
