# Smart Bookmark

Chrome Manifest V3 extension that recommends bookmark folders for the current page and lets you confirm to save quickly.

## Features

- Host-based folder recommendations (Top N) from existing bookmarks
- Optional AI fallback recommendations (only when enabled; OpenAI Responses API)
- Options page for configuring behavior
- Editable title + choose folder + save bookmark
- AI disabled by default → popup makes zero `http(s)` requests (enforced by E2E)
- Automated tests: Vitest + Playwright (real extension E2E)

## Dev

- Install: `npm install`
- Unit tests: `npm test`
- E2E (Playwright): `npm run e2e`
- Build extension: `npm run build` → outputs `dist/`
- Build (E2E/test mode): `npm run build:test` → outputs `dist/` with harness

## Load in Chrome

1. `npm run build`
2. Open `chrome://extensions`
3. Enable Developer mode
4. Load unpacked → select `dist/`

## Shortcut

- Default command: `Ctrl+Shift+Y` (you can change it at `chrome://extensions/shortcuts`)

## Options

- Open the extension options page to configure Top N / close-on-save / AI fallback.
- If your AI `Base URL` uses a different domain, Chrome needs host permission for it. The options page will request it on save.

## Repo map

- Manifest: `public/manifest.json`
- Background SW: `src/background.ts`
- Popup UI: `src/popup/PopupApp.vue`
- Options UI: `src/options/OptionsApp.vue`
- Core algorithm: `src/lib/recommendHostFolders.ts`
- AI fallback client: `src/lib/aiRecommendFolders.ts`
- OpenAI provider (vendored from `lemonhall/openagentic-sdk-ts`): `vendor/openagentic-sdk-ts/`
- E2E harness (bookmark seeding/reset): `src/testHarness/harness.ts`
- E2E launcher: `e2e/utils/launchExtension.ts`
- CI workflow: `.github/workflows/ci.yml`

## Playwright browsers (Windows)

If E2E complains that Chromium executable is missing:
- Run: `npx playwright install chromium`

If the install hangs, remove the leftover lock directory:
- `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

If you need proxy for downloads (example):
- `$env:HTTPS_PROXY='http://127.0.0.1:7897'; $env:HTTP_PROXY='http://127.0.0.1:7897'; $env:NO_PROXY='127.0.0.1,localhost'; npx playwright install chromium`
