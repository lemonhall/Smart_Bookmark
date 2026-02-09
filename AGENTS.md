# Agent Notes (Smart Bookmark)

Smart Bookmark is a Chrome Manifest V3 extension (Vue 3 + Vite + TypeScript).

- Unit tests: Vitest (`npm test`)
- E2E: Playwright that loads the real unpacked extension from `dist/` (`npm run e2e`)

## Quick commands

- Dev server: `npm run dev`
- Build (production, no harness): `npm run build`
- Build (test mode, includes harness): `npm run build:test`
- Unit tests: `npm test`
- E2E tests: `npm run e2e`
- Zip for sharing/store: `npm run package:zip`

Note: `npm run e2e` rebuilds `dist/` in test mode. Run `npm run build` to restore a production `dist/`.

## Docs (source of truth)

- PRD: `docs/prd/smart-bookmark.md`
- Versioned implementation plans: `docs/plan/v*-*.md`

## Architecture map

- Extension manifest: `public/manifest.json` (built to `dist/manifest.json`)
- Background service worker:
  - entry: `src/background.ts`
  - logic (unit-tested): `src/background/handleOpenSmartBookmark.ts`
- Popup UI (Vue):
  - entry: `popup.html`
  - app: `src/popup/main.ts`
  - UI: `src/popup/PopupApp.vue`
- Options UI (Vue):
  - entry: `options.html`
  - app: `src/options/main.ts`
  - UI: `src/options/OptionsApp.vue`
- Core algorithm (pure TS, unit-tested): `src/lib/recommendHostFolders.ts`
- Settings (storage): `src/lib/settings.ts` (key: `sbSettings`)
- Last used folder (storage): `chrome.storage.local` key `lastFolderId`
- AI suggestions (OpenAI-compatible; unit-tested): `src/lib/aiRecommendFolders.ts`
  - Page signals sanitizer: `src/lib/pageSignals.ts`
  - Provider SDK (vendored): `vendor/openagentic-sdk-ts/` (compiled via `npm run build:deps`)
- E2E test harness (test build only; runs inside extension origin):
  - page: `src/testHarness/harness.html`
  - API: `src/testHarness/harness.ts` (exposes `window.__sbHarness`)
- E2E runner (loads unpacked extension from `dist/`): `e2e/utils/launchExtension.ts`

## Data flow (runtime)

Trigger:
- User opens popup via toolbar icon, OR
- User presses command hotkey (`Ctrl+Shift+Y`) handled by background SW.

Flow:
1) Popup reads current page context:
   - normal: active tab `url`/`title`
   - E2E: query params `popup.html?url=...&title=...`
2) Popup reads the bookmarks tree, builds folder candidates (id/title/path).
3) Host recommendations:
   - `recommendHostFolders({ url, bookmarksTree, limit: topN })`
   - Implementation: exact host → eTLD+1 → one parent-domain fallback.
4) Optional AI suggestions (only when enabled in settings):
   - Requests `${baseUrl}/responses` via openagentic OpenAI Responses provider.
   - May run as a fallback (no host matches) or always (when `alwaysSuggest` is enabled).
   - Can return:
     - existing folder ids, and/or
     - a “create new folder” suggestion (editable before saving).
5) User confirms:
   - creates folder first if needed
   - creates bookmark in target folder
   - saves `lastFolderId` for “recent folder” default when there are no host matches
   - optionally closes popup (settings)

## Side effects / safety

- The extension operates on real Chrome bookmarks.
- E2E tests create a dedicated folder `__SB_TEST_ROOT__` under the bookmarks bar and delete/recreate it on reset.
- Harness reset also clears `chrome.storage.local` (so tests can set `sbSettings` deterministically).

## Invariants / negative knowledge (keep the repo solid)

- Do not edit `dist/` by hand.
  - `dist/` is build output (even if committed for easy loading); source edits belong in `src/`, `public/`, `popup.html`, `options.html`.
- Network & privacy (enforced by E2E):
  - AI is disabled by default → popup must make **zero** `http(s)` requests.
  - When AI is enabled, the popup may make a request to the configured OpenAI-compatible endpoint only.
  - AI request payload must never include any existing bookmark URLs (only current page url/title + optional page signals + folder candidates `{id,path}`).
- Host permissions:
  - `public/manifest.json` grants default hosts and declares optional host permissions; `OptionsApp.vue` requests the baseUrl origin on save/test.
- Do not “fix” E2E by switching to system Google Chrome.
  - Use Playwright-managed Chromium (`npx playwright install chromium`) and `launchPersistentContext` with extension args.
- Don’t rely on manual regression.
  - Add/adjust Vitest tests for pure logic and Playwright E2E for end-to-end behaviors.

## Testing strategy

- Full (preferred): `npm test && npm run e2e`
- Unit (Vitest): `npm test` (includes `npm run build:deps` first)
- E2E (Playwright): `npm run e2e` or `npm run e2e -- e2e/extension-flow.spec.ts`
- CI: `.github/workflows/ci.yml` (Node 24; installs Chromium; runs unit + E2E under Xvfb)

## E2E troubleshooting (Windows)

- If Chromium is missing: `npx playwright install chromium`
- If install “hangs” / no output: remove the lock directory then retry:
  - `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`

## Build/test troubleshooting (Windows)

- If Vite/Vitest fails with `Error: spawn EPERM` (esbuild service startup), it’s usually an OS policy/AV restriction on spawning `node_modules\\@esbuild\\win32-x64\\esbuild.exe` with piped stdio.
  - Try reinstalling deps (`npm ci`), unblocking that exe (if your environment uses Mark-of-the-Web), or allowlisting it in your security tooling.
