import { getState, setState } from './state.js';
import { settings } from '../storage/index.js';

export function bindSettingsControls() {
  // Setup theme toggle
  const themeBtn = document.getElementById('btn-theme');
  themeBtn?.addEventListener('click', async () => {
    const current = getState().theme;
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    setState({ theme: nextTheme });
    await settings.set({ theme: nextTheme });
  });
}
