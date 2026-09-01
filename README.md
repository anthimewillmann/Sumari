# Sumari
Sumari is a Safari Web Extension for macOS and iOS that uses **Apple Intelligence** to instantly summarize the content of any webpage and answer follow-up questions about it.
Instead of reading long articles, blog posts, or documentation, Sumari extracts the visible text from the current page and generates a concise AI-powered summary directly inside Safari.

## Screenshots

<p align="center">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.06.png" width="40%">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.14.png" width="40%">
</p>

<p align="center">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.08.53.png" width="40%">
  <img src="Screenshots/Screenshot%20iPhone%2017%20Pro%2001.09.2026%20at%2000.09.00.png" width="40%">
</p>

<p align="center">
  <img src="Screenshots/Screenshot%202026-09-01%20at%2000.27.37.png" width="45%">
  <img src="Screenshots/Screenshot%202026-09-01%20at%2000.27.52.png" width="45%">
</p>

## Features
- Summarize any webpage with a single click
- Ask follow-up questions about the page content
- Powered by Apple Intelligence and Foundation Models
- Automatically detects the language of the website
- Returns summaries and answers in the same language as the original content
- Clean and lightweight Safari integration
- Works on macOS and iOS
- Privacy-friendly processing using Apple's on-device AI capabilities

## How It Works
1. Sumari extracts the visible text from the currently opened webpage.
2. The content is sent to a native Swift extension handler.
3. Apple Intelligence analyzes the text using Foundation Models.
4. A concise summary is generated in the original language of the webpage.
5. The result is displayed directly inside the Safari extension popup.
6. You can ask follow-up questions about the page using the input bar at the bottom.

## Tech Stack
- Swift
- Safari Web Extensions
- Foundation Models
- Apple Intelligence
- JavaScript
- HTML
- CSS
- Xcode

## Architecture

### Safari Extension
- `content.js`
  - Extracts visible webpage content
- `background.js`
  - Handles communication between Safari and the native app
- `popup.js`
  - Requests webpage content, displays summaries, and handles follow-up questions

### Native Swift Handler
- `SafariWebExtensionHandler.swift`
  - Receives webpage text and optional follow-up questions from the extension
  - Uses Foundation Models to generate summaries and answers
  - Returns results back to Safari

## Installation
```bash
git clone https://github.com/anthimewillmann/Sumari.git
```
1. Open the project in Xcode.
2. Enable Apple Intelligence on your device.
3. Build and run the application.
4. Enable the Sumari Safari Extension:
   - Safari → Settings → Extensions
   - Activate **Sumari**

## Requirements
- macOS 26+ or iOS 26+
- Apple Intelligence enabled
- Xcode 26+
- Safari

## Motivation
Sumari was created as a personal project to explore the integration of:
- Apple Intelligence
- Foundation Models
- Safari Web Extensions
- Native Swift development
- AI-powered productivity tools

The goal was to build a simple and fast way to understand long webpages without leaving the browser.

## Future Improvements
- Custom summary lengths
- Bullet-point and paragraph modes
- Page translation support
- Support for PDF summarization
- Reading time estimation
- Summary history

## Author
Created by **Anthime Willmann**

## License
This project is licensed under the MIT License.
