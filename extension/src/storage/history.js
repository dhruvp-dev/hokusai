export const history = {
  async get() {
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      const data = await browser.storage.local.get('hokusai_history');
      return data.hokusai_history || [];
    }
    return [];
  },

  async add(item) {
    const list = await this.get();
    const newItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...item
    };
    const updated = [newItem, ...list].slice(0, 10);
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      await browser.storage.local.set({ hokusai_history: updated });
    }
    return updated;
  },

  async clear() {
    if (typeof browser !== 'undefined' && browser.storage?.local) {
      await browser.storage.local.remove('hokusai_history');
    }
    return [];
  }
};
