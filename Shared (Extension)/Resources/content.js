// content.js
// Runs directly in the context of the visited webpage.
// Extracts visible body text and returns it to background.js.

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getPageText") {

    // Tags whose content is irrelevant (navigation, scripts, forms, etc.)
    const skipTags = new Set([
      "script","style","noscript","nav","footer","aside",
      "header","form","button","input","select","textarea",
      "svg","canvas","iframe","embed","object","picture"
    ]);

    // Recursively extract visible text content from a DOM node
    function getText(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const t = node.textContent.trim();
        return t.length > 1 ? t : "";
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      if (skipTags.has(node.tagName.toLowerCase())) return "";

      // Skip invisible elements
      const s = window.getComputedStyle(node);
      if (s.display === "none" || s.visibility === "hidden") return "";

      return Array.from(node.childNodes).map(getText).filter(Boolean).join(" ");
    }

    // Prefer semantically relevant containers, fall back to body
    const root =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;

    const raw = getText(root);

    // Cap at 12,000 characters – the Swift handler does not expect more
    const text = raw.length > 12000 ? raw.slice(0, 12000) + "..." : raw;

    return Promise.resolve({ text });
  }
});
