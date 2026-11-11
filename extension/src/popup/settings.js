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
  qualitySlider?.addEventListener('input', (e) => {
    const quality = parseInt(e.target.value, 10);
    if (qualityBadge) qualityBadge.textContent = `${quality}%`;
    updateSliderFill(qualitySlider);
    setState({ quality });
    persistDebounced({ quality });
  });

  const drawerPaddingSlider = document.getElementById('setting-padding');
  const drawerPaddingBadge = document.getElementById('drawer-padding-val-badge');
  const mainPaddingSlider = document.getElementById('input-padding');
  const paddingNum = document.getElementById('padding-num');

  const PAD_MIN = 16, PAD_MAX = 96;
  const clampPad = (v) => Math.min(PAD_MAX, Math.max(PAD_MIN, Math.round(Number(v) || PAD_MIN)));

  const applyPadding = (padding, { syncNum = true } = {}) => {
    if (drawerPaddingBadge) drawerPaddingBadge.textContent = `${padding}px`;
    if (paddingNum && syncNum) paddingNum.value = padding;
    if (mainPaddingSlider) { mainPaddingSlider.value = padding; updateSliderFill(mainPaddingSlider); }
    if (drawerPaddingSlider) { drawerPaddingSlider.value = padding; updateSliderFill(drawerPaddingSlider); }
    setState({ padding });
    persistDebounced({ padding });
  };

  // Magnetic snap points: small pull-in zone, larger release zone, label pulses on catch
  const SNAPS = [16, 24, 32, 40, 48, 64, 80, 96];
  const PULL = 2, RELEASE = 5;
  let snapped = null;
  const snap = (v) => {
    if (snapped !== null && Math.abs(v - snapped) <= RELEASE) return snapped;
    snapped = null;
    const near = SNAPS.find(x => Math.abs(v - x) <= PULL);
    if (near !== undefined) {
      snapped = near;
      const field = paddingNum?.closest('.num-field');
      if (field) { field.classList.remove('pulse'); void field.offsetWidth; field.classList.add('pulse'); }
      return near;
    }
    return v;
  };

  drawerPaddingSlider?.addEventListener('input', (e) => applyPadding(parseInt(e.target.value, 10)));
  mainPaddingSlider?.addEventListener('input', (e) => applyPadding(snap(parseInt(e.target.value, 10))));

  // Number field: type a value, clamped to the slider range on commit
  paddingNum?.addEventListener('input', () => {
    if (paddingNum.value !== '') applyPadding(clampPad(paddingNum.value), { syncNum: false });
  });
  paddingNum?.addEventListener('change', () => applyPadding(clampPad(paddingNum.value || PAD_MIN)));
  paddingNum?.addEventListener('keydown', (e) => { if (e.key === 'Enter') paddingNum.blur(); });

  document.querySelectorAll('.range-slider').forEach(updateSliderFill);
}

export function updateSliderFill(el) {
  if (!el) return;
  const min = Number(el.min) || 0;
  const max = Number(el.max) || 100;
  el.style.setProperty('--pct', `${((Number(el.value) - min) / (max - min)) * 100}%`);
}

let pending = {};
let persistTimer;
function persistDebounced(patch) {
  Object.assign(pending, patch);
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const out = pending;
    pending = {};
    settings.set(out);
  }, 200);
}

function syncDrawerFields() {
  const currentState = getState();
  const formatSelect = document.getElementById('setting-default-format');
  if (formatSelect && currentState.format) formatSelect.value = currentState.format;

  const qualitySlider = document.getElementById('setting-quality');
  const qualityBadge = document.getElementById('quality-val-badge');
  if (qualitySlider && currentState.quality) {
    qualitySlider.value = currentState.quality;
    updateSliderFill(qualitySlider);
    if (qualityBadge) qualityBadge.textContent = `${currentState.quality}%`;
  }

  const drawerPaddingSlider = document.getElementById('setting-padding');
  const drawerPaddingBadge = document.getElementById('drawer-padding-val-badge');
  if (drawerPaddingSlider && currentState.padding) {
    drawerPaddingSlider.value = currentState.padding;
    updateSliderFill(drawerPaddingSlider);
    if (drawerPaddingBadge) drawerPaddingBadge.textContent = `${currentState.padding}px`;
  }
}

