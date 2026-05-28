# Sumari

Sumari is a Safari browser extension for macOS that uses **Apple Intelligence** to instantly summarize the content of any webpage.

The extension extracts the visible text from the currently open website and generates a concise summary directly inside Safari, helping users quickly understand articles, blog posts, documentation, and other web content.

## Features

- Summarize any webpage with a single click
- Powered by Apple Intelligence and Foundation Models
- Automatically detects the language of the webpage
- Generates summaries in the same language as the original content
- Fast and lightweight Safari integration
- Native macOS experience
- Privacy-friendly processing through Apple Intelligence

## Tech Stack

- Swift
- Safari Web Extensions
- Foundation Models
- Apple Intelligence
- JavaScript
- Xcode
- macOS Development

## How It Works

1. The Safari extension extracts the visible text from the active webpage.
2. The content is sent to the native Swift extension handler.
3. Apple Intelligence processes the text using Foundation Models.
4. A concise summary is generated in the original language of the webpage.
5. The summary is displayed directly inside the extension popup.

## Requirements

- macOS 26 or later
- Apple Intelligence enabled
- Xcode 26 or later

## Installation

```bash
git clone https://github.com/anthimewillmann/Sumari.git
```

1. Open the project in Xcode
2. Select a macOS target
3. Build and run the application
4. Enable the Safari Extension in:

```text
System Settings → Extensions → Safari Extensions
```

5. Open Safari and start summarizing webpages

## Motivation

Sumari was created as a personal project to explore the latest Apple Intelligence technologies and Safari Web Extensions.

The project focuses on combining native Apple AI capabilities with a seamless browser experience, allowing users to quickly extract the most important information from any webpage.

Through this project, I wanted to gain hands-on experience with:

- Apple Intelligence
- Foundation Models
- Safari Extensions
- Native AI integrations
- Swift Concurrency
- Browser Extension Development

## Future Improvements

- Adjustable summary lengths
- Article-specific extraction
- Key takeaways section
- Multi-language summary options
- Summary history
- Export summaries
- Reader mode integration
- Custom AI prompts

## Author

Created by **Anthime Willmann**

## License

This project is licensed under the MIT License.
