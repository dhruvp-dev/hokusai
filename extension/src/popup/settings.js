import { getState, setState } from './state.js';
import { settings } from '../storage/index.js';

export function bindSettingsControls() {
  // Theme toggle
  const themeBtn = document.getElementById('btn-theme');
  themeBtn?.addEventListener('click', async () => {
    const current = getState().theme;
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    setState({ theme: nextTheme });
    await settings.set({ theme: nextTheme });
  });

  // Settings drawer toggle
  const settingsBtn = document.getElementById('btn-settings');
  const drawerEl = document.getElementById('settings-drawer');
  const closeBtn = document.getElementById('btn-close-settings');

  settingsBtn?.addEventListener('click', () => {
    drawerEl?.classList.remove('hidden');
    syncDrawerFields();
  });

  closeBtn?.addEventListener('click', () => {
    drawerEl?.classList.add('hidden');
  });

  drawerEl?.addEventListener('click', (e) => {
    if (e.target === drawerEl) {
      drawerEl.classList.add('hidden');
    }
  });

  // Drawer Form Controls
  const formatSelect = document.getElementById('setting-default-format');
  formatSelect?.addEventListener('change', async (e) => {
    const format = e.target.value;
    setState({ format });
    await settings.set({ format });
  });

  const qualitySlider = document.getElementById('setting-quality');
  const qualityBadge = document.getElementById('quality-val-badge');
  qualitySlider?.addEventListener('input', async (e) => {
    const quality = parseInt(e.target.value, 10);
    if (qualityBadge) qualityBadge.textContent = `${quality}%`;
    setState({ quality });
    await settings.set({ quality });
  });

  const drawerPaddingSlider = document.getElementById('setting-padding');
  const drawerPaddingBadge = document.getElementById('drawer-padding-val-badge');
  const mainPaddingSlider = document.getElementById('input-padding');
  const mainPaddingBadge = document.getElementById('padding-val-badge');

  drawerPaddingSlider?.addEventListener('input', async (e) => {
    const padding = parseInt(e.target.value, 10);
    if (drawerPaddingBadge) drawerPaddingBadge.textContent = `${padding}px`;
    if (mainPaddingBadge) mainPaddingBadge.textContent = `${padding}px`;
    if (mainPaddingSlider) mainPaddingSlider.value = padding;
    setState({ padding });
    await settings.set({ padding });
  });

  mainPaddingSlider?.addEventListener('input', async (e) => {
    const padding = parseInt(e.target.value, 10);
    if (mainPaddingBadge) mainPaddingBadge.textContent = `${padding}px`;
    if (drawerPaddingBadge) drawerPaddingBadge.textContent = `${padding}px`;
    if (drawerPaddingSlider) drawerPaddingSlider.value = padding;
    setState({ padding });
    await settings.set({ padding });
  });
}

function syncDrawerFields() {
  const currentState = getState();
  const formatSelect = document.getElementById('setting-default-format');
  if (formatSelect && currentState.format) formatSelect.value = currentState.format;

  const qualitySlider = document.getElementById('setting-quality');
  const qualityBadge = document.getElementById('quality-val-badge');
  if (qualitySlider && currentState.quality) {
    qualitySlider.value = currentState.quality;
    if (qualityBadge) qualityBadge.textContent = `${currentState.quality}%`;
  }

  const drawerPaddingSlider = document.getElementById('setting-padding');
  const drawerPaddingBadge = document.getElementById('drawer-padding-val-badge');
  if (drawerPaddingSlider && currentState.padding) {
    drawerPaddingSlider.value = currentState.padding;
    if (drawerPaddingBadge) drawerPaddingBadge.textContent = `${currentState.padding}px`;
  }
}

