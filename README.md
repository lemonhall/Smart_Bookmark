# Smart Bookmark (MVP)

Chrome Manifest V3 extension that recommends bookmark folders by host (hostname) and lets you confirm to save quickly.

## What’s in v1

- Host-based folder recommendations (Top 3) from existing bookmarks
- Editable title + choose folder + save bookmark
- Zero network calls (v1 requirement; enforced by E2E)
- Automated tests: Vitest + Playwright (real extension E2E)

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

## Shortcut

- Default command: `Ctrl+Shift+Y` (you can change it at `chrome://extensions/shortcuts`)

## Repo map

- Manifest: `public/manifest.json`
- Background SW: `src/background.ts`
- Popup UI: `src/popup/PopupApp.vue`
- Core algorithm: `src/lib/recommendHostFolders.ts`
- E2E harness (bookmark seeding/reset): `src/testHarness/harness.ts`
- E2E launcher: `e2e/utils/launchExtension.ts`

## Playwright browsers (Windows)

If E2E complains that Chromium executable is missing:
- Run: `npx playwright install chromium`

If the install hangs, remove the leftover lock directory:
- `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

If you need proxy for downloads (example):
- `$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY='http://127.0.0.1:7897'; $env:NO_PROXY='127.0.0.1,localhost'; npx playwright install chromium`
