const el        = document.getElementById("summary");
const inputArea = document.getElementById("input-area");
const input     = document.getElementById("question");

let pageText = "";

// Frageleiste immer direkt über der Tastatur halten
function updateInputPosition() {
    const viewport = window.visualViewport;
    const offsetTop = viewport.offsetTop;
    const offsetLeft = viewport.offsetLeft;
    const height = viewport.height;

    inputArea.style.transform = `translateY(${offsetTop}px)`;
    inputArea.style.top = `${height - inputArea.offsetHeight}px`;
    inputArea.style.left = `${offsetLeft}px`;
    inputArea.style.width = `${viewport.width}px`;
}

window.visualViewport.addEventListener("resize", updateInputPosition);
window.visualViewport.addEventListener("scroll", updateInputPosition);

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

    pageText = pageData.text;

    let response;
    try {
        response = await browser.runtime.sendMessage({ type: "summarize", text: pageText });
    } catch (e) {
        el.textContent = "Fehler: " + e.message;
        return;
    }

    el.textContent = response?.summary ?? response?.error ?? "Keine Antwort.";

    inputArea.style.display = "block";
    updateInputPosition();
    input.focus();
})();

input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    input.disabled = true;
    el.textContent = "";

    let response;
    try {
        response = await browser.runtime.sendMessage({
            type: "ask",
            text: pageText,
            question
        });
    } catch (err) {
        el.textContent = "Fehler: " + err.message;
        input.disabled = false;
        return;
    }

    el.textContent = response?.summary ?? response?.error ?? "Keine Antwort.";
    input.disabled = false;
    input.focus();
});
