# Agent Notes (Smart Bookmark)

This repo is a Chrome Manifest V3 extension (Vue 3 + Vite + TypeScript) with **Vitest unit tests** and **Playwright E2E** that loads the real unpacked extension.

## 1) Architecture Overview

### Areas
- Extension manifest: `public/manifest.json`
- Background service worker:
  - entry: `src/background.ts`
  - logic (testable): `src/background/handleOpenSmartBookmark.ts`
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
- AI fallback client (OpenAI-compatible): `src/lib/aiRecommendFolders.ts`
- OpenAI provider SDK (vendored): `vendor/openagentic-sdk-ts/`
- E2E test harness (runs inside extension origin):
  - page: `src/testHarness/harness.html`
  - API: `src/testHarness/harness.ts` (exposes `window.__sbHarness`)
- E2E runner (loads unpacked extension from `dist/`): `e2e/utils/launchExtension.ts`

### Data Flow (MVP)
```
User triggers popup / command
  -> Popup reads active tab (or query params for E2E)
  -> Popup reads bookmarks tree
  -> recommendHostFolders(url, tree) -> top folders
  -> user selects folder + confirms
  -> chrome.bookmarks.create(...)
```

### Persistence / Side Effects
- The extension operates on **real Chrome bookmarks**.
- E2E tests create a dedicated folder `__SB_TEST_ROOT__` under the bookmarks bar and clean/reset it via the harness.
  - Harness reset also clears `chrome.storage.local`, and can set local storage via `window.__sbHarness.setLocalStorage(...)`.

## 2) Code Conventions (Negative Knowledge)

- Do not edit `dist/` by hand.
  - Why: `dist/` is build output; changes will be overwritten.
  - Do instead: edit sources under `src/`, `public/`, `popup.html`, then run `npm run build`.
  - Verify: `npm run build` succeeds and `dist/manifest.json` exists.

- Do not add any network calls in v1.
  - Why: PRD v1 requires zero telemetry / zero outbound requests; E2E asserts there are no `http(s)` requests from the popup.
  - Do instead: keep logic local; if you must add network in future vN, update PRD + plans + E2E expectations together.
  - Verify: `npm run e2e` (tests include “no http(s) requests” assertions).

- AI is allowed only when explicitly enabled in settings.
  - Why: PRD v5 introduces optional network for AI fallback; default must remain zero-network.
  - Do instead: keep AI disabled by default; ensure any AI request payload excludes bookmark URLs.
  - Verify: `npm run e2e` (includes both “no network when AI off” and “AI fallback when enabled”).

- Do not “fix” E2E by switching to system Google Chrome.
  - Why: Google Chrome may ignore `--disable-extensions-except`, and extension loading becomes flaky/blocked.
  - Do instead: keep using Playwright-managed Chromium (installed via `npx playwright install chromium`).
  - Verify: `npm run e2e` passes on a clean machine/profile.

- Do not rely on manual regression.
  - Why: popup/bookmarks behavior is easy to break; the repo is designed for TDD.
  - Do instead: add Vitest unit tests for pure logic and Playwright E2E for full-flow behavior.
  - Verify: `npm test` + `npm run e2e` are green before claiming “done”.

## 3) Testing Strategy

### Full (preferred)
- `npm test && npm run e2e`

### Build outputs
- Production build (no harness): `npm run build`
- Test build (includes harness for E2E): `npm run build:test`

### Unit tests (Vitest)
- All: `npm test`
- One file: `npx vitest run src/lib/recommendHostFolders.test.ts`

### E2E (Playwright, real extension)
- All: `npm run e2e`
- One spec: `npm run e2e -- e2e/extension-flow.spec.ts`
- UI mode: `npm run e2e:ui`

### CI (GitHub Actions)
- Workflow: `.github/workflows/ci.yml`
- Note: extension E2E requires headed Chromium; CI runs it under Xvfb.

### E2E Troubleshooting (Windows)
- If Chromium is missing: `npx playwright install chromium`
- If install “hangs” / no output: remove the lock directory then retry:
  - `Remove-Item "$env:LOCALAPPDATA\\ms-playwright\\__dirlock" -Recurse -Force`
