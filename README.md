# Sumari

**A Safari extension for iPhone, iPad, and Mac that summarizes webpages and answers follow-up questions with on-device AI.**

<p align="left">
  <a href="https://apps.apple.com/us/app/sumari/id6774662813">
    <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
         alt="Download on the App Store"
         height="60">
  </a>
</p>

Sumari helps you understand articles, blog posts, documentation, and other text-based webpages without leaving Safari. Open the extension to generate a concise summary, then ask questions about the page directly in the popup. Apple's Foundation Models process the extracted text on your device, with no account or external AI service required.

> A personal portfolio project exploring Apple Intelligence, Foundation Models, Safari Web Extensions, and native Swift integration.

## Highlights

- Automatic summarization when you open the extension on a webpage
- Summaries requested as five concise bullet points in the page's main language
- Follow-up answers in the language of your question
- Recent conversation context for follow-up questions within the same popup session
- Article-focused text extraction and section-by-section processing of longer content
- Shared extension for Safari on iPhone, iPad, and Mac
- Light and dark appearance, with keyboard-aware input positioning on mobile devices
- Input prompts and basic status messages in 12 languages
- On-device generation without API keys, a custom backend, or third-party dependencies

## Screenshots

<p align="center">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.09.00.png" width="40%" alt="Sumari in Safari on iPhone, example 1">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.53.png" width="40%" alt="Sumari in Safari on iPhone, example 2">
</p>

<p align="center">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.06.png" width="40%" alt="Sumari in Safari on iPhone, example 3">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.14.png" width="40%" alt="Sumari in Safari on iPhone, example 4">
</p>

<p align="center">
  <img src="Screenshots/Screenshot%202026-09-01%20at%2000.27.52.png" width="80%" alt="Sumari in Safari on Mac, example 1">
</p>

<p align="center">
  <img src="Screenshots/Screenshot%202026-09-01%20at%2000.27.37.png" width="80%" alt="Sumari in Safari on Mac, example 2">
</p>

## Features

### Webpage Summaries

Opening the popup starts text extraction and summarization automatically. Sumari prefers the page's `article`, `main`, or `[role="main"]` container and falls back to the document body. It skips hidden elements and common non-content elements such as navigation, forms, scripts, and embedded media.

The native handler divides the extracted text into sections of up to 3,200 characters. A short page is summarized directly; longer content is summarized section by section before those results are combined into a final summary. The model is instructed to produce five concise bullet points while preserving important names, numbers, conclusions, and caveats.

### Follow-Up Questions

Type a question beneath the summary and press Return. Sumari extracts relevant evidence from each section, then uses that evidence to compose an answer. The model is instructed to rely on the webpage and acknowledge insufficient evidence.

The popup retains the most recent 3,000 characters of the summary and conversation to help resolve references in later questions. Each answer replaces the previous result in the popup; the session is not saved as a persistent chat history.

### Language and Appearance

Summaries are requested in the webpage's main language, while answers are requested in the question's language. These instructions are handled by the model, so output depends on its language support and availability.

The question placeholder and basic status messages follow the browser language, with English as the fallback. The popup includes Arabic, Chinese, Dutch, English, French, German, Italian, Japanese, Polish, Portuguese, Spanish, and Turkish strings. Native handler errors and the companion app's setup screen are currently in English.

The popup follows the system's light or dark appearance. Its input position adjusts to the visible viewport, with platform-specific spacing for iPad and Mac. The app and extension use icons derived from the shared Icon Composer design.

## How It Works

1. `popup.js` asks the background script for text from the active Safari tab.
2. `content.js` extracts visible page text, capped at 12,000 characters plus an ellipsis when truncated.
3. `background.js` forwards the text and any question to the native Swift extension handler.
4. `SafariWebExtensionHandler.swift` checks model availability and uses Foundation Models to summarize the text or answer from extracted evidence.
5. The popup displays the result as plain text and keeps recent conversation context in memory.

The model instructions treat webpage content as untrusted source material. Generation is performed locally through `SystemLanguageModel` and `LanguageModelSession`.

## Tech Stack

| Area | Technology |
|---|---|
| Native app and extension | Swift, SafariServices |
| On-device AI | Apple Intelligence, Foundation Models |
| Extension interface | JavaScript, HTML, CSS |
| Browser integration | Safari Web Extensions, Manifest V3, native messaging |
| Companion app | UIKit on iOS, AppKit on macOS, shared WKWebView setup screen |
| Icons | Icon Composer source and exported Safari assets |
| Build | Xcode project with shared iOS and macOS schemes |

The project has no third-party package dependencies or custom backend.

## Project Structure

```text
Sumari/
├── Shared (Extension)/
│   ├── SafariWebExtensionHandler.swift  Model availability, summaries, evidence, answers
│   └── Resources/
│       ├── content.js                  Visible webpage text extraction
│       ├── background.js               Browser and native messaging bridge
│       ├── popup.js                    Summary, questions, session context, UI strings
│       ├── popup.html, popup.css        Popup layout and appearance
│       ├── manifest.json               Extension configuration and permissions
│       ├── _locales/en/messages.json    Extension name and description
│       └── images/                     Extension and toolbar icons
├── Shared (App)/                       Shared setup screen and app assets
├── iOS (App)/, macOS (App)/             Platform-specific app entry points
├── iOS (Extension)/, macOS (Extension)/ Platform-specific extension configuration
├── App Icon.icon/                      Icon Composer source
├── Design/                             Safari icon export utility
├── Screenshots/                        README screenshots
└── Sumari.xcodeproj/                    App and extension targets, shared schemes
```

## Requirements

- iPhone or iPad running iOS/iPadOS 26.0 or later, or a Mac running macOS 26.0 or later
- Safari with the Sumari extension enabled and access granted to the webpage
- A device that supports Apple Intelligence, with Apple Intelligence enabled and the on-device model available
- For development: a Mac with Xcode 26 or later and the corresponding platform SDKs

The operating system version alone does not establish AI availability. The handler checks the system model before generation and returns an error when it is unavailable.

## Getting Started

### Install from the App Store

1. Download [Sumari from the App Store](https://apps.apple.com/us/app/sumari/id6774662813).
2. Enable the extension:
   - **iPhone or iPad:** Settings → Apps → Safari → Extensions → Sumari.
   - **Mac:** Safari → Settings → Extensions → Sumari. The companion app also provides a button to open Safari's extension settings.
3. Grant website access when Safari asks, then open a text-based webpage.
4. Open Sumari from Safari's extensions controls to generate a summary.
5. Enter a follow-up question and press Return to ask about the page.

### Build from Source

```bash
git clone https://github.com/anthimewillmann/Sumari.git
cd Sumari
open Sumari.xcodeproj
```

1. Select the shared `Sumari (iOS)` or `Sumari (macOS)` scheme and a matching destination.
2. Set your development team and signing configuration for the app and extension targets.
3. If using your own bundle identifiers, keep the app and extension identifiers consistent with the native messaging identifier in `background.js` and `extensionBundleIdentifier` in `ViewController.swift`.
4. Build and run the companion app, then enable the extension in Safari as described above.
5. Use a compatible device with Apple Intelligence available to test summaries and follow-up questions.

No API keys or third-party dependency installation are required.

## Current Status and Limitations

The Xcode app and extension targets currently declare version **1.0.1**, build **4**. This describes the repository configuration, not necessarily the current App Store release.

- Text extraction stops after 12,000 characters, so content beyond that limit is not included in summaries or answers.
- Sumari processes accessible webpage text. It does not implement PDF parsing, image OCR, or extraction from embedded frames and media.
- Summary length and format are fixed by the model instructions; there are no user-selectable summary modes or dedicated translation controls.
- Conversation context exists only while the popup is open. There is no saved summary history or cross-device synchronization.
- Results depend on Foundation Models availability and generation quality. There is no external AI fallback.
- The repository does not currently include automated tests or a CI workflow.

## Privacy

Page text, questions, and recent conversation context are passed locally from the Safari extension to Apple's on-device Foundation Models. The implementation does not send them to a custom server or third-party AI service and includes no analytics or tracking SDK.

The popup holds page text and conversation context in memory without persisting them. Safari website access is needed to read the page selected for summarization; no Sumari account is required.

## Author

Created by **[Anthime Willmann](https://github.com/anthimewillmann)**.

## License

This project is licensed under the MIT License. A standalone `LICENSE` file is not currently included in the repository.
