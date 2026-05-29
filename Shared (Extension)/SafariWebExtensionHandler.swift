import SafariServices
import os.log
import FoundationModels

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    private let logger = Logger(subsystem: Bundle.main.bundleIdentifier ?? "Sumari", category: "Handler")

    func beginRequest(with context: NSExtensionContext) {
        Task {
            let request = context.inputItems.first as? NSExtensionItem
            let message = request?.userInfo?[SFExtensionMessageKey]
            let dict    = message as? [String: Any]

            guard let text = dict?["text"] as? String, !text.isEmpty else {
                complete(context: context, summary: nil, error: "Kein Text empfangen.")
                return
            }

            let question = dict?["question"] as? String

            if #available(iOS 26.0, macOS 26.0, *) {
                await summarize(text: text, question: question, context: context)
            } else {
                complete(context: context, summary: nil, error: "Foundation Models benötigen iOS/macOS 26.")
            }
        }
    }

    @available(iOS 26.0, macOS 26.0, *)
    private func summarize(text: String, question: String?, context: NSExtensionContext) async {
        do {
            let model = SystemLanguageModel.default
            guard case .available = model.availability else {
                complete(context: context, summary: nil,
                         error: "Apple Intelligence nicht verfügbar.")
                return
            }

            let session = LanguageModelSession()
            let short   = String(text.prefix(4000))

            let prompt: String
            if let q = question {
                prompt = "Answer this question about the webpage in the same language as the question: \(q)\n\n\(short)"
            } else {
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

    private func complete(context: NSExtensionContext, summary: String?, error: String?) {
        var result: [String: Any] = [:]
        if let s = summary { result["summary"] = s }
        if let e = error   { result["error"]   = e }

        let item = NSExtensionItem()
        item.userInfo = [SFExtensionMessageKey: result]
        context.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
