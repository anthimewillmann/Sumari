const el        = document.getElementById("summary");
const inputArea = document.getElementById("input-area");
const input     = document.getElementById("question");

if (navigator.platform === "MacIntel" && navigator.maxTouchPoints === 0) {
    document.documentElement.classList.add("platform-macos");
}

let pageText  = "";
let isAsking  = false;
let conversationContext = "";

function addToConversation(role, text) {
    conversationContext += `${role}: ${text}\n`;
    conversationContext = conversationContext.slice(-3000);
}

const translations = {
    de: { noText: "Kein Text gefunden.",          errorPre: "Fehler: ",  noAnswer: "Keine Antwort erhalten.",   placeholder: "Nachfrage stellen…"   },
    en: { noText: "No text found.",               errorPre: "Error: ",   noAnswer: "No response.",              placeholder: "Ask a question…"      },
    fr: { noText: "Aucun texte trouvé.",          errorPre: "Erreur : ", noAnswer: "Aucune réponse reçue.",     placeholder: "Poser une question…"  },
    es: { noText: "No se encontró texto.",        errorPre: "Error: ",   noAnswer: "Sin respuesta.",            placeholder: "Hacer una pregunta…"  },
    it: { noText: "Nessun testo trovato.",        errorPre: "Errore: ",  noAnswer: "Nessuna risposta.",         placeholder: "Fai una domanda…"     },
    pt: { noText: "Nenhum texto encontrado.",     errorPre: "Erro: ",    noAnswer: "Sem resposta.",             placeholder: "Fazer uma pergunta…"  },
    nl: { noText: "Geen tekst gevonden.",         errorPre: "Fout: ",    noAnswer: "Geen antwoord ontvangen.",  placeholder: "Stel een vraag…"      },
    pl: { noText: "Nie znaleziono tekstu.",       errorPre: "Błąd: ",    noAnswer: "Brak odpowiedzi.",          placeholder: "Zadaj pytanie…"       },
    tr: { noText: "Metin bulunamadı.",            errorPre: "Hata: ",    noAnswer: "Yanıt alınamadı.",          placeholder: "Soru sor…"            },
    ja: { noText: "テキストが見つかりません。",          errorPre: "エラー：",  noAnswer: "応答がありません。",           placeholder: "質問を入力…"            },
    zh: { noText: "未找到文本。",                    errorPre: "错误：",    noAnswer: "没有收到回复。",              placeholder: "提问…"                 },
    ar: { noText: "لم يتم العثور على نص.",       errorPre: "خطأ: ",    noAnswer: "لا توجد استجابة.",          placeholder: "اطرح سؤالاً…"         },
};

const lang = navigator.language.slice(0, 2);
const t = translations[lang] ?? translations.en;

input.placeholder = t.placeholder;

function updateInputPosition() {
    const vv = window.visualViewport;
    if (!vv) return;
    inputArea.style.top   = `${vv.offsetTop + vv.height - inputArea.offsetHeight}px`;
    inputArea.style.left  = `${vv.offsetLeft}px`;
    inputArea.style.width = `${vv.width}px`;
}

window.visualViewport?.addEventListener("resize", updateInputPosition);
window.visualViewport?.addEventListener("scroll", updateInputPosition);

(async () => {
    let pageData;
    try {
        pageData = await browser.runtime.sendMessage({ type: "getPageText" });
    } catch (e) {
        el.textContent = t.errorPre + e.message;
        return;
    }

    if (!pageData?.text || pageData.text.trim().length < 10) {
        el.textContent = pageData?.error ?? t.noText;
        return;
    }

    pageText = pageData.text;

    let response;
    try {
        response = await browser.runtime.sendMessage({ type: "summarize", text: pageText });
    } catch (e) {
        el.textContent = t.errorPre + e.message;
        return;
    }

    if (response?.error) {
        el.textContent = t.errorPre + response.error;
        return;
    }

    el.textContent = response?.summary ?? t.noAnswer;
    if (response?.summary) addToConversation("SUMMARY", response.summary);
    el.scrollIntoView({ behavior: "instant", block: "start" });

    inputArea.style.display = "block";
    updateInputPosition();
})();

input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    if (isAsking) return;
    const question = input.value.trim();
    if (!question) return;

    isAsking = true;
    input.value = "";
    input.disabled = true;
    el.textContent = "";

    let response;
    try {
        response = await browser.runtime.sendMessage({
            type: "ask",
            text: pageText,
            question,
            conversationContext
        });
    } catch (err) {
        el.textContent = t.errorPre + err.message;
        input.disabled = false;
        isAsking = false;
        return;
    }

    if (response?.error) {
        el.textContent = t.errorPre + response.error;
    } else {
        el.textContent = response?.summary ?? t.noAnswer;
        if (response?.summary) {
            addToConversation("QUESTION", question);
            addToConversation("ANSWER", response.summary);
        }
    }

    el.scrollIntoView({ behavior: "instant", block: "start" });

    input.disabled = false;
    isAsking = false;
});
