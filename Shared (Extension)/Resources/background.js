// background.js
// Extension service worker – acts as a bridge between popup.js and content.js,
// and between JavaScript and the native Swift handler.

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // ── 1. Fetch page text ──
  // Forwards the request from popup.js to the content.js of the active tab.
  if (request.type === "getPageText") {
    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        const tabId = tabs[0]?.id;
        if (!tabId) { sendResponse({ error: "No active tab." }); return; }
        browser.tabs.sendMessage(tabId, { type: "getPageText" })
          .then(data => sendResponse(data ?? { error: "Content script returned nothing." }))
          .catch(() => sendResponse({ error: "Content script unreachable – reload the page." }));
      })
      .catch(err => sendResponse({ error: "Tab error: " + err.message }));
    return true; // Responds asynchronously
  }

  // ── 2. Summarize ──
  // Sends the page text to the Swift handler for AI processing.
  if (request.type === "summarize") {
    browser.runtime.sendNativeMessage(
      "com.anthimewillmann.sumari",
      { text: request.text }
    )
    .then(result => sendResponse(result ?? { error: "Empty response from Swift handler." }))
    .catch(err => sendResponse({ error: "Native handler error: " + (err?.message ?? String(err)) }));
    return true;
  }

  // ── 3. Follow-up question ──
  // Sends page text + user question to the Swift handler.
  if (request.type === "ask") {
    browser.runtime.sendNativeMessage(
      "com.anthimewillmann.sumari",
      {
        text: request.text,
        question: request.question,
        conversationContext: request.conversationContext
      }
    )
    .then(result => sendResponse(result ?? { error: "Empty response from Swift handler." }))
    .catch(err => sendResponse({ error: "Native handler error: " + (err?.message ?? String(err)) }));
    return true;
  }

  return false;
});
