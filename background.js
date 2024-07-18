chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "captureScreenshot") {
      chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          sendResponse({ screenshotUrl: null, error: chrome.runtime.lastError.message });
        } else {
          console.log('Screenshot URL:', dataUrl);
          sendResponse({ screenshotUrl: dataUrl });
        }
      });
      return true; // Keeps the message channel open for sendResponse
    }
  });
  