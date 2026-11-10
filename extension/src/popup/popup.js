import { getState, setState, subscribe } from './state.js';
import { executeCapture } from './actions.js';
import { copyCaptureToClipboard, triggerDownload } from './preview.js';
import { bindSettingsControls } from './settings.js';
import { setupUIElements, updateThemeUI, renderRecentCaptures } from './ui.js';
import { settings, history } from '../storage/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initial UI setup & Icons
  setupUIElements();

  // 2. Subscribe State Changes FIRST so setting updates trigger UI sync
  subscribe(state => {
    updateThemeUI(state.theme);

    // Sync Frame Style chips
    if (state.frameStyle) {
      document.querySelectorAll('#frame-chips .frame-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-style') === state.frameStyle);
      });
    }

    // Sync Device chips
    if (state.device) {
      document.querySelectorAll('#device-chips .device-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-device') === state.device);
      });
    }

    // Sync Background Preset chips
    if (state.background) {
      document.querySelectorAll('#bg-presets .preset-card').forEach(card => {
        card.classList.toggle('active', card.getAttribute('data-bg') === state.background);
      });
    }

    // Sync Format chips
    if (state.format) {
      document.querySelectorAll('#format-chips .chip').forEach(chip => {
        chip.classList.toggle('active', chip.getAttribute('data-format') === state.format);
      });
    }

    // Sync Padding slider & badge
    if (state.padding !== undefined) {
      const padVal = Number(state.padding) || 40;
      const slider = document.getElementById('input-padding');
      const badge = document.getElementById('padding-val-badge');
      if (slider) slider.value = padVal;
      if (badge) badge.textContent = `${padVal}px`;
    }

    // Update preview if capture exists
    const previewSection = document.getElementById('preview-section');
    const previewImg = document.getElementById('preview-img');
    if (state.lastCapture?.dataUrl && previewSection && previewImg) {
      previewImg.src = state.lastCapture.dataUrl;
      previewSection.classList.remove('hidden');
    }

    // Refresh history
    history.get().then(list => {
      renderRecentCaptures(document.getElementById('recent-list'), list);
    });
  });

  // 3. Load stored settings & state
  const storedSettings = await settings.get();
  setState(storedSettings);

  // 4. Bind Event Handlers
  bindSettingsControls();

  // 3-Column capture mode selection
  let selectedMode = 'CAPTURE_VISIBLE';
  
  const captureCards = [
    { id: 'act-visible', mode: 'CAPTURE_VISIBLE', key: '1' },
    { id: 'act-fullpage', mode: 'CAPTURE_FULLPAGE', key: '2' },
    { id: 'act-responsive', mode: 'CAPTURE_RESPONSIVE', key: '3' }
  ];

  function selectCaptureMode(targetId, mode) {
    captureCards.forEach(c => {
      const cardEl = document.getElementById(c.id);
      if (cardEl) cardEl.classList.toggle('active', c.id === targetId);
    });
    selectedMode = mode;

    const deviceSection = document.getElementById('device-section');
    if (deviceSection) {
      deviceSection.classList.toggle('hidden', mode !== 'CAPTURE_RESPONSIVE');
    }
  }

  captureCards.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.addEventListener('click', () => {
      selectCaptureMode(item.id, item.mode);
    });
  });

  // Keyboard Shortcuts (⌘1, ⌘2, ⌘3 or 1, 2, 3)
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const match = captureCards.find(c => c.key === e.key);
    if (match) {
      e.preventDefault();
      selectCaptureMode(match.id, match.mode);
    }
  });

  // Device Selection Cards
  document.querySelectorAll('#device-chips .device-card').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const dev = e.currentTarget.getAttribute('data-device');
      setState({ device: dev });

      if (getState().lastCapture?.dataUrl && selectedMode === 'CAPTURE_RESPONSIVE') {
        executeCapture(selectedMode, dev);
      }
    });
  });

  // Submit button triggers capture
  document.getElementById('btn-submit-capture')?.addEventListener('click', () => {
    const currentDevice = getState().device || 'desktop';
    executeCapture(selectedMode, currentDevice);
  });

  // Cancel button closes popup window
  document.getElementById('btn-cancel-popup')?.addEventListener('click', () => {
    window.close();
  });

  // Frame Cards
  document.querySelectorAll('#frame-chips .frame-card').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      const card = e.currentTarget;
      const style = card.getAttribute('data-style');
      setState({ frameStyle: style });
      await settings.set({ frameStyle: style });

      if (getState().lastCapture?.dataUrl) {
        executeCapture(selectedMode, getState().device || 'desktop');
      }
    });
  });

  // Background Preset Cards
  document.querySelectorAll('#bg-presets .preset-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      const preset = e.currentTarget.getAttribute('data-bg');
      setState({ background: preset });
      await settings.set({ background: preset });

      if (getState().lastCapture?.dataUrl) {
        executeCapture(selectedMode);
      }
    });
  });

  // Format Chips
  document.querySelectorAll('#format-chips .chip').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      const format = e.target.getAttribute('data-format');
      setState({ format });
      await settings.set({ format });

      if (getState().lastCapture?.dataUrl) {
        executeCapture(selectedMode);
      }
    });
  });

  // Copy & Download
  document.getElementById('btn-copy')?.addEventListener('click', async () => {
    const { lastCapture } = getState();
    if (lastCapture?.dataUrl) {
      const copyBtn = document.getElementById('btn-copy');
      const success = await copyCaptureToClipboard(lastCapture.dataUrl);
      if (success && copyBtn) {
        const orig = copyBtn.innerHTML;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => copyBtn.innerHTML = orig, 1500);
      }
    }
  });

  document.getElementById('btn-download')?.addEventListener('click', async () => {
    const { lastCapture, format } = getState();
    if (lastCapture?.dataUrl) {
      const dlBtn = document.getElementById('btn-download');
      const origHtml = dlBtn ? dlBtn.innerHTML : '';
      if (dlBtn) dlBtn.innerText = 'Downloading...';
      const success = await triggerDownload(lastCapture.dataUrl, format || lastCapture.format || 'webp');
      if (dlBtn) {
        dlBtn.innerText = success ? 'Downloaded!' : 'Failed';
        setTimeout(() => { dlBtn.innerHTML = origHtml; }, 1500);
      }
    }
  });

  // Clear History
  document.getElementById('btn-clear-history')?.addEventListener('click', async () => {
    const cleared = await history.clear();
    renderRecentCaptures(document.getElementById('recent-list'), cleared);
    setState({ lastCapture: null });
    const previewSection = document.getElementById('preview-section');
    if (previewSection) previewSection.classList.add('hidden');
  });

  // Initial History Load & Sync Latest Capture
  const recentList = await history.get();
  renderRecentCaptures(document.getElementById('recent-list'), recentList);
  if (recentList && recentList.length > 0) {
    setState({ lastCapture: recentList[0] });
  }
});

