import { getState, setState, subscribe } from './state.js';
import { executeCapture } from './actions.js';
import { copyCaptureToClipboard, triggerDownload } from './preview.js';
import { bindSettingsControls } from './settings.js';
import { setupUIElements, updateThemeUI, renderRecentCaptures } from './ui.js';
import { settings, history } from '../storage/index.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Initial UI setup & Icons
  setupUIElements();

  // 2. Load stored settings & state
  const storedSettings = await settings.get();
  setState(storedSettings);

  // 3. Bind Event Handlers
  bindSettingsControls();

  // Checkbox option selection for capture types
  let selectedMode = 'CAPTURE_VISIBLE';
  
  const captureCards = [
    { id: 'act-visible', mode: 'CAPTURE_VISIBLE' },
    { id: 'act-fullpage', mode: 'CAPTURE_FULLPAGE' },
    { id: 'act-responsive', mode: 'CAPTURE_RESPONSIVE' }
  ];

  captureCards.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    el.addEventListener('click', () => {
      captureCards.forEach(c => {
        const cardEl = document.getElementById(c.id);
        if (cardEl) cardEl.classList.add('unchecked');
      });
      el.classList.remove('unchecked');
      selectedMode = item.mode;
    });
  });

  // Submit button triggers capture
  document.getElementById('btn-submit-capture')?.addEventListener('click', () => {
    executeCapture(selectedMode);
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
      document.querySelectorAll('#frame-chips .frame-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      setState({ frameStyle: style });
      await settings.set({ frameStyle: style });
    });
  });

  // Format Chips
  document.querySelectorAll('#format-chips .chip').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      const format = e.target.getAttribute('data-format');
      document.querySelectorAll('#format-chips .chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
      setState({ format });
      await settings.set({ format });
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

  // 4. Subscribe State Changes
  subscribe(state => {
    updateThemeUI(state.theme);

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

  // Initial History Load & Sync Latest Capture
  const recentList = await history.get();
  renderRecentCaptures(document.getElementById('recent-list'), recentList);
  if (recentList && recentList.length > 0) {
    setState({ lastCapture: recentList[0] });
  }
});
