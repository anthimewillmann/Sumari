import SafariServices
import os.log
import FoundationModels

/// Handles all messages sent from the JavaScript frontend (background.js)
/// to the Swift extension via Native Messaging.
class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "Sumari", category: "Handler")

    /// Entry point for every incoming message.
    /// Called by Safari whenever background.js uses `sendNativeMessage`.
    func beginRequest(with context: NSExtensionContext) {
        Task {
            let request = context.inputItems.first as? NSExtensionItem
            let message = request?.userInfo?[SFExtensionMessageKey]
            let dict    = message as? [String: Any]

            // Page text is required – without it no summary can be generated
            guard let text = dict?["text"] as? String, !text.isEmpty else {
                complete(context: context, summary: nil, error: "No text received.")
                return
            }

            // Optional follow-up question from the user (e.g. "Which products are mentioned?")
            let question = dict?["question"] as? String

            if #available(iOS 26.0, macOS 26.0, *) {
                await summarize(text: text, question: question, context: context)
            } else {
                complete(context: context, summary: nil, error: "Foundation Models require iOS/macOS 26.")
            }
        }
    }

    /// Generates a summary or answers a question using Apple Intelligence.
    /// Requires iOS/macOS 26 and an available SystemLanguageModel.
    @available(iOS 26.0, macOS 26.0, *)
    private func summarize(text: String, question: String?, context: NSExtensionContext) async {
        do {
            let model = SystemLanguageModel.default

            // Check whether Apple Intelligence is available on this device
            guard case .available = model.availability else {
                complete(context: context, summary: nil,
                         error: "Apple Intelligence not available.")
                return
            }

            let session = LanguageModelSession()

            // Limit page text to 4000 characters to avoid overloading the context window
            let short = String(text.prefix(4000))

            // Build prompt depending on mode: follow-up question or summary
            let prompt: String
            if let q = question {
                // Follow-up: answer in the same language as the question
                prompt = "Answer this question about the webpage in the same language as the question: \(q)\n\n\(short)"
            } else {
                // Summary: auto-detect the language of the text and respond in kind
                prompt = """
                    Detect the language of the following text and respond in exactly that language.
                    Summarize the following webpage in 5 bullet points.
                    Do not translate. Use the same language as the text below.

                    \(short)
                    """
            }

            let response = try await session.respond(to: prompt)
            complete(context: context, summary: response.content, error: nil)

        } catch {
            complete(context: context, summary: nil, error: error.localizedDescription)
        }
    }

    /// Sends the result (summary or error message) back to background.js.
    private func complete(context: NSExtensionContext, summary: String?, error: String?) {
        var result: [String: Any] = [:]
        if let s = summary { result["summary"] = s }
        if let e = error   { result["error"]   = e }

        let item = NSExtensionItem()
        item.userInfo = [SFExtensionMessageKey: result]
        context.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
