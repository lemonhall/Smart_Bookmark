# Smart Bookmark (MVP)

Chrome Manifest V3 extension that recommends bookmark folders by host (hostname) and lets you confirm to save quickly.

## Dev

- Install: `npm install`
- Unit tests: `npm test`
- E2E (Playwright): `npm run e2e`
- Build extension: `npm run build` → outputs `dist/`

## Load in Chrome

1. `npm run build`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Load unpacked → select `dist/`

## Playwright browsers (Windows)

If E2E complains that Chromium executable is missing:
- Run: `npx playwright install chromium`

If the install hangs, remove the leftover lock directory:
- `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

