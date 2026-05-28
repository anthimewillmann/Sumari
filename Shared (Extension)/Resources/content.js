// content.js
// Extrahiert den sichtbaren Text der aktuellen Seite

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getPageText") {
    const skipTags = new Set([
      "script","style","noscript","nav","footer","aside",
      "header","form","button","input","select","textarea",
      "svg","canvas","iframe","embed","object","picture"
    ]);

    function getText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        return t.length > 1 ? t : "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      if (skipTags.has(node.tagName.toLowerCase())) return "";
      const s = window.getComputedStyle(node);
      if (s.display === "none" || s.visibility === "hidden") return "";
      return Array.from(node.childNodes).map(getText).filter(Boolean).join(" ");
    }

    const root =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;

    const raw = getText(root);
    // Max 12000 Zeichen (wie im Swift-Handler erwartet)
    const text = raw.length > 12000 ? raw.slice(0, 12000) + "…" : raw;

    return Promise.resolve({ text });
  }
});
