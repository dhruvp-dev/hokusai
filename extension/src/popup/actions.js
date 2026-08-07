import { getState, setState } from './state.js';

export async function executeCapture(type, deviceKey = 'desktop') {
  setState({ isCapturing: true });
  const current = getState();

  try {
    const response = await browser.runtime.sendMessage({
      type,
      options: {
        frameStyle: current.frameStyle,
        format: current.format,
        device: deviceKey
      }
    });

    if (response?.success && response.result) {
      setState({ lastCapture: response.result, isCapturing: false });
      return response.result;
    }
  } catch (err) {
    console.error('Capture request failed:', err);
  } finally {
    setState({ isCapturing: false });
  }
}
