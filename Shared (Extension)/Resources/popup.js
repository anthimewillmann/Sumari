// popup.js
// Controls the extension popup UI.
// Automatically fetches the page text when the popup opens, requests a summary,
// and allows the user to ask follow-up questions via an input field.

const el        = document.getElementById("summary");    // Text output area
const inputArea = document.getElementById("input-area"); // Input field container
const input     = document.getElementById("question");   // Text input field

let pageText = ""; // Cached page text, reused for follow-up questions

// iOS detection: keyboard repositioning is only needed on iOS
const isIOS = /iPhone|iPad/.test(navigator.userAgent);

// Keeps the input field directly above the virtual keyboard (iOS only)
function updateInputPosition() {
    if (!isIOS) return;
    const viewport = window.visualViewport;
    inputArea.style.transform = `translateY(${viewport.offsetTop}px)`;
    inputArea.style.top = `${viewport.height - inputArea.offsetHeight}px`;
    inputArea.style.left = `${viewport.offsetLeft}px`;
    inputArea.style.width = `${viewport.width}px`;
}

// Register keyboard events only on iOS
if (isIOS && window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateInputPosition);
    window.visualViewport.addEventListener("scroll", updateInputPosition);
}

// ── Automatic summary when the popup opens ──
(async () => {
    let pageData;
    try {
        pageData = await browser.runtime.sendMessage({ type: "getPageText" });
    } catch (e) {
        el.textContent = "Error: " + e.message;
        return;
    }

    // Abort if no usable text was found
    if (!pageData?.text || pageData.text.trim().length < 10) {
        el.textContent = pageData?.error ?? "No text found.";
        return;
    }

    pageText = pageData.text;

    // Request summary from the Swift handler via background.js
    let response;
    try {
        response = await browser.runtime.sendMessage({ type: "summarize", text: pageText });
    } catch (e) {
        el.textContent = "Error: " + e.message;
        return;
    }

    el.textContent = response?.summary ?? response?.error ?? "No response.";

    // Show the input field once the summary is ready
    inputArea.style.display = "block";
    if (isIOS) updateInputPosition();
    input.focus();
})();

// ── Submit follow-up question on Enter ──
input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    const question = input.value.trim();
    if (!question) return;

    input.value = "";
    input.disabled = true;
    el.textContent = "Loading answer…";

    let response;
    try {
        response = await browser.runtime.sendMessage({
            type: "ask",
            text: pageText,
            question
        });
    } catch (err) {
        el.textContent = "Error: " + err.message;
        input.disabled = false;
        return;
    }

    el.textContent = response?.summary ?? response?.error ?? "No response.";
    input.disabled = false;
    input.focus();
});
