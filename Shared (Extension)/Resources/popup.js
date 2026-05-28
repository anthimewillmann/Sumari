const el = document.getElementById("summary");

(async () => {
    let pageData;
    try {
        pageData = await browser.runtime.sendMessage({ type: "getPageText" });
    } catch (e) {
        el.textContent = "Fehler: " + e.message;
        return;
    }

    if (!pageData?.text || pageData.text.trim().length < 10) {
        el.textContent = pageData?.error ?? "Kein Text gefunden.";
        return;
    }

    let response;
    try {
        response = await browser.runtime.sendMessage({ type: "summarize", text: pageData.text });
    } catch (e) {
        el.textContent = "Fehler: " + e.message;
        return;
    }

    el.textContent = response?.summary ?? response?.error ?? "Keine Antwort.";
})();
