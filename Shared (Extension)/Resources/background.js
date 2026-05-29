// background.js

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // ── 1. Seitentext holen ──
  if (request.type === "getPageText") {
    browser.tabs.query({ active: true, currentWindow: true })
      .then(tabs => {
        const tabId = tabs[0]?.id;
        if (!tabId) { sendResponse({ error: "Kein aktiver Tab." }); return; }
        browser.tabs.sendMessage(tabId, { type: "getPageText" })
          .then(data => sendResponse(data ?? { error: "Content Script gab nichts zurück." }))
          .catch(() => sendResponse({ error: "Content Script nicht erreichbar – lade die Seite neu." }));
      })
      .catch(err => sendResponse({ error: "Tab-Fehler: " + err.message }));
    return true;
  }

  // ── 2. Zusammenfassen ──
  if (request.type === "summarize") {
    browser.runtime.sendNativeMessage(
      "com.animationtest.Sumari",
      { text: request.text }
    )
    .then(result => sendResponse(result ?? { error: "Leere Antwort vom Swift-Handler." }))
    .catch(err => sendResponse({ error: "Native Handler Fehler: " + (err?.message ?? String(err)) }));
    return true;
  }

  // ── 3. Nachfrage ──
  if (request.type === "ask") {
    browser.runtime.sendNativeMessage(
      "com.animationtest.Sumari",
      { text: request.text, question: request.question }
    )
    .then(result => sendResponse(result ?? { error: "Leere Antwort vom Swift-Handler." }))
    .catch(err => sendResponse({ error: "Native Handler Fehler: " + (err?.message ?? String(err)) }));
    return true;
  }

  return false;
});
