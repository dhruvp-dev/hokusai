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

  // Quick Action Buttons
  document.getElementById('act-visible')?.addEventListener('click', () => executeCapture('CAPTURE_VISIBLE'));
  document.getElementById('act-fullpage')?.addEventListener('click', () => executeCapture('CAPTURE_FULLPAGE'));
  document.getElementById('act-responsive')?.addEventListener('click', () => executeCapture('CAPTURE_RESPONSIVE'));

  // Frame Chips
  document.querySelectorAll('#frame-chips .chip').forEach(chip => {
    chip.addEventListener('click', async (e) => {
      const style = e.target.getAttribute('data-style');
      document.querySelectorAll('#frame-chips .chip').forEach(c => c.classList.remove('active'));
      e.target.classList.add('active');
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
      await triggerDownload(lastCapture.dataUrl, format);
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

  // Initial History Load
  const recentList = await history.get();
  renderRecentCaptures(document.getElementById('recent-list'), recentList);
});
