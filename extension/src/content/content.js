browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_DIMENSIONS') {
    sendResponse({
      scrollWidth: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
    });
    return true;
  }

  if (msg.type === 'SCROLL_TO') {
    window.scrollTo(msg.x, msg.y);
    // Double requestAnimationFrame ensures layout has repainted after scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        sendResponse({ success: true, x: window.scrollX, y: window.scrollY });
      });
    });
    return true;
  }

  if (msg.type === 'GET_META') {
    sendResponse({
      title: document.title || 'Untitled',
      url: location.href,
      favicon: document.querySelector('link[rel~="icon"]')?.href || '',
    });
    return true;
  }
});
