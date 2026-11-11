import * as ICONS from '../icons/icons.js';
import { copyCaptureToClipboard, triggerDownload } from './preview.js';
import { history } from '../storage/index.js';

export function setupUIElements() {
  // Logo (the rest of the icons are static markup in index.html)
  const logoEl = document.getElementById('logo-icon');
  if (logoEl) logoEl.innerHTML = ICONS.ICON_HOKUSAI;

  // Populate Current Tab URL
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        const tabUrlEl = document.getElementById('current-tab-url');
        if (!tabUrlEl) return;
        try {
          const urlObj = new URL(tabs[0].url);
          tabUrlEl.textContent = urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
        } catch {
          tabUrlEl.textContent = tabs[0].url;
        }
      }
    });
  }
}

export function updateThemeUI(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeBtn = document.getElementById('btn-theme');
  if (themeBtn) {
    const label = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
    themeBtn.setAttribute('data-tip', label);
    themeBtn.setAttribute('aria-label', label);
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
        <img class="recent-full-thumb" src="${escapeHtml(String(item.dataUrl || ''))}" alt="Capture" loading="lazy">
      </div>
      <div class="recent-card-footer">
        <div class="recent-card-info">
          <span class="recent-card-url">${escapeHtml(extractDomain(item.url))}</span>
          <span class="recent-card-meta">${escapeHtml(String(item.frameStyle || 'arc'))} · ${escapeHtml(String(item.format || 'webp').toUpperCase())} · ${timeAgo(item.timestamp)}</span>
        </div>
        <div class="recent-card-actions">
          <button class="action-icon-btn btn-recent-copy" data-idx="${idx}" data-tip="Copy" aria-label="Copy">${ICONS.ICON_COPY}</button>
          <button class="action-icon-btn btn-recent-download" data-idx="${idx}" data-tip="Download" aria-label="Download">${ICONS.ICON_DOWNLOAD}</button>
          <button class="action-icon-btn btn-recent-delete" data-idx="${idx}" data-tip="Delete" aria-label="Delete">${ICONS.ICON_TRASH}</button>
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
        const btn = e.currentTarget;
        clearTimeout(btn._t);
        btn.classList.toggle('is-copied', ok);
        btn.classList.toggle('is-error', !ok);
        btn.setAttribute('data-tip', ok ? 'Copied' : 'Copy failed');
        btn._t = setTimeout(() => {
          btn.classList.remove('is-copied', 'is-error');
          btn.setAttribute('data-tip', 'Copy');
        }, 1600);
      }
    });
  });

  // Download buttons
  container.querySelectorAll('.btn-recent-download').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const item = list[parseInt(e.currentTarget.getAttribute('data-idx'))];
      if (item?.dataUrl) {
        await triggerDownload(item.dataUrl, item.format || 'webp', null, item.url);
      }
    });
  });

  // Delete buttons
  container.querySelectorAll('.btn-recent-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(e.currentTarget.getAttribute('data-idx'));
      const item = list[idx];
      if (item) {
        let updatedList;
        if (item.id) {
          updatedList = await history.remove(item.id);
        } else {
          list.splice(idx, 1);
          if (typeof browser !== 'undefined' && browser.storage?.local) {
            await browser.storage.local.set({ hokusai_history: list });
          }
          updatedList = list;
        }
        renderRecentCaptures(container, updatedList);
      }
    });
  });
}

// ── Helpers ───────────────────────────────────

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
