const DEFAULTS = {
  frameStyle: 'arc',
  format: 'webp',
  quality: 90,
  background: '#0f0f14',
  padding: 40,
  autoCopy: false,
  autoDownload: false,
  theme: 'dark',
};

export const settings = {
  async get() {
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      const data = await browser.storage.local.get('hokusai_settings');
      return { ...DEFAULTS, ...(data.hokusai_settings || {}) };
    }
    return { ...DEFAULTS };
  },

  async set(partial) {
    const current = await this.get();
    const updated = { ...current, ...partial };
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      await browser.storage.local.set({ hokusai_settings: updated });
    }
    return updated;
  }
};
