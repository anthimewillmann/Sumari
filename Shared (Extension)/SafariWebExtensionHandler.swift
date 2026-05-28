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

            logger.debug("beginRequest received: \(String(describing: dict))")

            guard let text = dict?["text"] as? String, !text.isEmpty else {
                logger.warning("No text in message dict: \(String(describing: dict))")
                complete(context: context, summary: nil,
                         error: "Kein Text empfangen. Dict: \(String(describing: dict))")
                return
            }

            if #available(iOS 26.0, macOS 26.0, *) {
                await summarize(text: text, context: context)
            } else {
                complete(context: context, summary: nil,
                         error: "Foundation Models benötigen iOS/macOS 26.")
            }
        }
    }

    @available(iOS 26.0, macOS 26.0, *)
    private func summarize(text: String, context: NSExtensionContext) async {
        do {
            let model = SystemLanguageModel.default
            guard case .available = model.availability else {
                complete(context: context, summary: nil,
                         error: "Apple Intelligence nicht verfügbar. Bitte unter Einstellungen > Apple Intelligence aktivieren.")
                return
            }

            let session = LanguageModelSession()
            let short   = String(text.prefix(12000))
            let response = try await session.respond(to: """
                Detect the language of the following text and respond in exactly that language.
                Summarize the following webpage in 5 bullet points.
                Do not translate. Use the same language as the text below.
                ?

                \(short)
                """)

            complete(context: context, summary: response.content, error: nil)

        } catch {
            logger.error("FoundationModels error: \(error.localizedDescription)")
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
