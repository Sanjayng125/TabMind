chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AUTH_TOKEN") {
    chrome.storage.local.get(["auth_token"], (result) => {
      sendResponse({ token: result.auth_token ?? null });
    });
    return true; // keep channel open for async
  }

  if (message.type === "SET_AUTH_TOKEN") {
    chrome.storage.local.set({ auth_token: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === "CLEAR_AUTH_TOKEN") {
    chrome.storage.local.remove("auth_token", () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
