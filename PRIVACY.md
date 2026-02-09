# Privacy Policy — Smart Bookmark

Smart Bookmark is a Chrome extension that helps you save bookmarks into the right folder faster.

## Summary

- No accounts. No analytics. No telemetry.
- **AI is disabled by default.**
  - When AI is OFF, the popup makes **zero `http(s)` network requests**.
  - When AI is ON, the extension sends a request to your configured AI endpoint to get folder suggestions.

## Data the extension reads (local-only)

To recommend a folder and create a bookmark, the extension reads:

- The current tab URL and title.
- Your bookmarks tree (folders and existing bookmarks) via the Chrome Bookmarks API.

This data is processed locally in your browser.

## When AI is ON: what is sent over the network

If you enable AI in the Options page, Smart Bookmark will send a single request per recommendation to the configured endpoint (default compatible with the OpenAI Responses API), including:

- Current page: `url`, `title`
- Page signals (when available): `meta description`, `og:title`, `og:description`, `canonical`, first `H1`
- Folder candidates: **folder `id` + folder `path`** (e.g., `Bookmarks Bar / Tech / Frontend`)
- Configuration used for the request: model name (e.g., `gpt-5.2`)

Important:

- The request **does not upload your existing bookmark URLs list**.
- The only URL sent is the **current tab URL** you are saving.

## API key storage

If you enter an API key in Options, it is stored in `chrome.storage.local` on your device and is only used to authenticate requests to your configured AI endpoint.

## Third-party processing

When AI is enabled, your configured AI endpoint (for example, OpenAI or another OpenAI-compatible provider you choose) will receive the request payload described above and may process it according to their policies.

## Contact

If you have questions about this policy, please open an issue in this repository.

