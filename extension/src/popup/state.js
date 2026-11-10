const state = {
  frameStyle: 'arc',
  format: 'webp',
  theme: 'dark',
  device: 'desktop',
  lastCapture: null,
  isCapturing: false,
};

const listeners = new Set();

export function getState() {
  return { ...state };
}

export function setState(partial) {
  Object.assign(state, partial);
  listeners.forEach(fn => fn(getState()));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
