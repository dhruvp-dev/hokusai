import * as ICONS from '../icons/icons.js';
import { copyCaptureToClipboard, triggerDownload } from './preview.js';

export function setupUIElements() {
  // Logo
  const logoEl = document.getElementById('logo-icon');
  if (logoEl) logoEl.innerHTML = ICONS.ICON_HOKUSAI;

  // Tab favicon
  const faviconEl = document.getElementById('tab-favicon-icon');
  if (faviconEl) faviconEl.innerHTML = ICONS.ICON_GLOBE;

  // Header buttons
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) themeBtn.innerHTML = ICONS.ICON_MOON;

  const settingsBtn = document.getElementById('btn-settings');
  if (settingsBtn) settingsBtn.innerHTML = ICONS.ICON_SETTINGS;

  // Action card icons (large, 20px versions)
  const visIcon = document.getElementById('icon-visible');
  if (visIcon) visIcon.innerHTML = resizeIcon(ICONS.ICON_LIGHTNING, 18);

  const fullIcon = document.getElementById('icon-fullpage');
  if (fullIcon) fullIcon.innerHTML = resizeIcon(ICONS.ICON_SCROLL, 18);

  const respIcon = document.getElementById('icon-responsive');
  if (respIcon) respIcon.innerHTML = resizeIcon(ICONS.ICON_DEVICES, 18);

  // Main preview action buttons
  const copyBtn = document.getElementById('btn-copy');
  if (copyBtn) copyBtn.innerHTML = `${ICONS.ICON_COPY} Copy`;

  const dlBtn = document.getElementById('btn-download');
  if (dlBtn) dlBtn.innerHTML = `${ICONS.ICON_DOWNLOAD} Download`;

  // Populate Current Tab URL
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          const tabUrlEl = document.getElementById('current-tab-url');
          if (tabUrlEl) tabUrlEl.textContent = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
        } catch {
          const tabUrlEl = document.getElementById('current-tab-url');
          if (tabUrlEl) tabUrlEl.textContent = tabs[0].url;
        }
      }
    });
  }
}

export function updateThemeUI(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    themeBtn.innerHTML = theme === 'dark' ? ICONS.ICON_MOON : ICONS.ICON_SUN;
    themeBtn.title = theme === 'dark' ? 'Switch to Light' : 'Switch to Dark';
  }
}

export function renderRecentCaptures(container, list) {
  if (!container) return;
  if (!list || list.length === 0) {
    container.innerHTML = `<div class="recent-empty">No captures yet</div>`;
    return;
  }

  container.innerHTML = list.map((item, idx) => `
    <div class="recent-card" data-idx="${idx}">
      <div class="recent-img-wrapper">
        <img class="recent-full-thumb" src="${item.dataUrl}" alt="Capture" loading="lazy">
      </div>
      <div class="recent-card-footer">
        <div class="recent-card-info">
          <span class="recent-card-url">${escapeHtml(extractDomain(item.url))}</span>
          <span class="recent-card-meta">${item.frameStyle ? item.frameStyle : 'arc'} · ${item.format ? item.format.toUpperCase() : 'WEBP'} · ${timeAgo(item.timestamp)}</span>
        </div>
        <div class="recent-card-actions">
          <button class="action-icon-btn btn-recent-copy" data-idx="${idx}" title="Copy to clipboard">${ICONS.ICON_COPY}</button>
          <button class="action-icon-btn btn-recent-download" data-idx="${idx}" title="Download">${ICONS.ICON_DOWNLOAD}</button>
        </div>
      </div>
    </div>
  `).join('');

  // Copy buttons
  container.querySelectorAll('.btn-recent-copy').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = list[parseInt(e.currentTarget.getAttribute('data-idx'))];
      if (item?.dataUrl) {
        const ok = await copyCaptureToClipboard(item.dataUrl);
        if (ok) {
          const orig = e.currentTarget.innerHTML;
          e.currentTarget.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
          setTimeout(() => { e.currentTarget.innerHTML = orig; }, 1500);
        }
      }
    });
  });

  // Download buttons
  container.querySelectorAll('.btn-recent-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = list[parseInt(e.currentTarget.getAttribute('data-idx'))];
      if (item?.dataUrl) {
        await triggerDownload(item.dataUrl, item.format || 'webp');
      }
    });
  });
}

// ── Helpers ───────────────────────────────────

/** Re-scales an inline SVG string to a given px size */
function resizeIcon(svgStr, size) {
  return svgStr
    .replace(/width="[^"]*"/, `width="${size}"`)
    .replace(/height="[^"]*"/, `height="${size}"`);
}

function extractDomain(url) {
  if (!url) return 'localhost';
  try { return new URL(url).hostname; } catch { return url; }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
